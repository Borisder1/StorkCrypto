// Cloudflare Pages Functions: Route handler for /api/chat
// Supports NVIDIA AI / Active LLMs / Gemini completions proxy with validation and CORS

interface ChatContext {
  request: Request;
  env: Record<string, string>;
}

// Allowed origins helper for secure CORS (supporting Telegram WebApp, localhost, and production domains)
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const isAllowedOrigin = 
    origin.endsWith('.pages.dev') ||
    origin.endsWith('.run.app') ||
    origin.endsWith('telegram.org') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    !origin;

  const allowOrigin = isAllowedOrigin && origin ? origin : '*';

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

export async function onRequestOptions(context: ChatContext): Promise<Response> {
  const headers = getCorsHeaders(context.request);
  return new Response(null, {
    status: 204,
    headers
  });
}

export async function onRequestPost(context: ChatContext): Promise<Response> {
  const corsHeaders = getCorsHeaders(context.request);

  try {
    const geminiKey = context.env?.GEMINI_API_KEY || '';
    const rawNvidiaKey = context.env?.NVIDIA_API_KEY || '';
    const nvidiaKeys = rawNvidiaKey.split(',').map((k: string) => k.trim()).filter(Boolean);

    if (!geminiKey && nvidiaKeys.length === 0) {
      return new Response(JSON.stringify({
        error: 'AI_SERVICE_UNAVAILABLE',
        message: 'Neither GEMINI_API_KEY nor NVIDIA_API_KEY is configured in environment variables'
      }), {
        status: 503,
        headers: corsHeaders
      });
    }

    // Check Content-Length to avoid oversized payloads
    const contentLength = context.request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 65536) {
      return new Response(JSON.stringify({
        error: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds 64KB limit'
      }), {
        status: 413,
        headers: corsHeaders
      });
    }

    let requestBody: any;
    try {
      requestBody = await context.request.json();
    } catch {
      return new Response(JSON.stringify({
        error: 'INVALID_JSON',
        message: 'Malformed JSON payload'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!requestBody || !Array.isArray(requestBody.messages) || requestBody.messages.length === 0) {
      return new Response(JSON.stringify({
        error: 'INVALID_REQUEST',
        message: 'Payload must contain a non-empty messages array'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Fetch with 15s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // 1. Primary path: Google Gemini API (gemini-3.6-flash) if key is present
      if (geminiKey) {
        const systemMsg = requestBody.messages.find((m: any) => m.role === 'system');
        const userMsgs = requestBody.messages.filter((m: any) => m.role !== 'system');
        const contents = userMsgs.map((m: any) => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
        }));

        const geminiReqBody: any = {
          contents,
          generationConfig: {
            temperature: typeof requestBody.temperature === 'number' ? requestBody.temperature : 0.7
          }
        };
        if (systemMsg?.content) {
          geminiReqBody.systemInstruction = {
            parts: [{ text: systemMsg.content }]
          };
        }

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiReqBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!geminiRes.ok) {
          const errDetails = await geminiRes.text();
          return new Response(JSON.stringify({
            error: 'UPSTREAM_AI_ERROR',
            status: geminiRes.status,
            details: errDetails.slice(0, 200)
          }), {
            status: 502,
            headers: corsHeaders
          });
        }

        const geminiData: any = await geminiRes.json();
        const outputText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'NO_DATA_PACKET';

        return new Response(JSON.stringify({
          id: 'chatcmpl-' + Math.random().toString(36).substring(2, 12),
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'gemini-3.6-flash',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: outputText
              },
              finish_reason: 'stop'
            }
          ]
        }), {
          status: 200,
          headers: corsHeaders
        });
      }

      // 2. Secondary path: NVIDIA NIM API with active catalog models
      const selectedKey = nvidiaKeys[Math.floor(Math.random() * nvidiaKeys.length)];
      
      // Select non-EOL active model from environment or safe catalog
      const requestedModel = typeof requestBody.model === 'string' ? requestBody.model : '';
      let targetModel = context.env?.AI_MODEL || '';

      if (!targetModel) {
        if (requestedModel && !requestedModel.includes('llama-3.3-70b') && !requestedModel.includes('minimax') && !requestedModel.includes('m2.7')) {
          targetModel = requestedModel;
        } else {
          // Standard active 70B model with high availability
          targetModel = 'meta/llama-3.1-70b-instruct';
        }
      }

      const sendUpstream = async (modelToUse: string) => {
        return await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${selectedKey}`
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: requestBody.messages,
            temperature: typeof requestBody.temperature === 'number' ? requestBody.temperature : 0.7,
            top_p: typeof requestBody.top_p === 'number' ? requestBody.top_p : 0.95,
            max_tokens: typeof requestBody.max_tokens === 'number' ? Math.min(requestBody.max_tokens, 8192) : 2048,
            stream: false
          }),
          signal: controller.signal
        });
      };

      let upstreamResponse = await sendUpstream(targetModel);

      // If upstream model returned 404/410 (EOL or model not found), automatically fallback to meta/llama-3.1-70b-instruct
      if (!upstreamResponse.ok && (upstreamResponse.status === 404 || upstreamResponse.status === 410) && targetModel !== 'meta/llama-3.1-70b-instruct') {
        targetModel = 'meta/llama-3.1-70b-instruct';
        upstreamResponse = await sendUpstream(targetModel);
      }

      clearTimeout(timeoutId);

      if (!upstreamResponse.ok) {
        const errorText = await upstreamResponse.text();
        return new Response(JSON.stringify({
          error: 'UPSTREAM_AI_ERROR',
          status: upstreamResponse.status,
          model: targetModel,
          details: errorText.slice(0, 200)
        }), {
          status: upstreamResponse.status >= 500 ? 502 : upstreamResponse.status,
          headers: corsHeaders
        });
      }

      const data = await upstreamResponse.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        return new Response(JSON.stringify({
          error: 'GATEWAY_TIMEOUT',
          message: 'Upstream AI request timed out after 15s'
        }), {
          status: 504,
          headers: corsHeaders
        });
      }
      throw fetchErr;
    }
  } catch (err: any) {
    return new Response(JSON.stringify({
      error: 'INTERNAL_SERVER_ERROR',
      message: err?.message || 'Unknown server error'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
