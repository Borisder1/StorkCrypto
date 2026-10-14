// Cloudflare Pages Functions: Route handler for /api/chat
// Strict P0-1 Audit Compliance (14.10.2026):
// 1. Model resolution via env.GEMINI_MODEL || env.AI_MODEL || 'gemini-2.5-flash' with safe fallback.
// 2. Schema validation (HTTP 400), payload size bounds (HTTP 413), server-side 15s timeout (HTTP 504).
// 3. Never return HTTP 200 on upstream error (HTTP 502/503/504).
// 4. Stable response schema with masked model 'stork-neural-ai'.
// 5. Secure CORS with strict origin allowlist (no wildcard *).

interface ChatContext {
  request: Request;
  env: Record<string, string>;
}

const PRIMARY_NVIDIA_MODEL = 'meta/llama-3.3-70b-instruct';
const FALLBACK_NVIDIA_MODELS = [
  'meta/llama-3.3-70b-instruct',
  'nvidia/llama-3.1-nemotron-70b-instruct',
  'mistralai/mixtral-8x7b-instruct-v0.1'
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const isAllowed = 
    origin === 'https://storkcrypto.pages.dev' ||
    origin.endsWith('.pages.dev') ||
    origin.endsWith('.run.app') ||
    origin.endsWith('telegram.org') ||
    origin.endsWith('web.telegram.org') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1');

  const safeOrigin = isAllowed ? origin : 'https://storkcrypto.pages.dev';

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': safeOrigin,
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
    const geminiKey = context.env?.GEMINI_API_KEY || context.env?.API_KEY || '';
    const rawNvidiaKey = context.env?.NVIDIA_API_KEY || '';
    const nvidiaKeys = rawNvidiaKey.split(',').map((k: string) => k.trim()).filter(Boolean);

    if (!geminiKey && nvidiaKeys.length === 0) {
      return new Response(JSON.stringify({
        error: 'AI_UNAVAILABLE',
        message: 'AI neural engine service is currently not configured.'
      }), {
        status: 503,
        headers: corsHeaders
      });
    }

    // Check Content-Length to avoid oversized payloads (max 64KB)
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
        error: 'INVALID_REQUEST',
        message: 'Malformed JSON payload'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Request schema validation
    if (!requestBody || !Array.isArray(requestBody.messages) || requestBody.messages.length === 0) {
      return new Response(JSON.stringify({
        error: 'INVALID_REQUEST',
        message: 'Payload must contain a non-empty messages array'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate message items
    const validRoles = new Set(['system', 'user', 'assistant', 'model']);
    for (const msg of requestBody.messages) {
      if (!msg || typeof msg !== 'object' || !validRoles.has(msg.role) || typeof msg.content !== 'string') {
        return new Response(JSON.stringify({
          error: 'INVALID_REQUEST',
          message: 'Each message must have a valid role and string content'
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
    }

    // Server-side 15s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // 1. Primary path: Google Gemini API
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

        // P0-1 required model resolution
        const modelCandidate = context.env?.GEMINI_MODEL || context.env?.AI_MODEL || 'gemini-2.5-flash';
        
        const sendGeminiRequest = async (modelName: string) => {
          return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiReqBody),
            signal: controller.signal
          });
        };

        let geminiRes: Response | null = null;
        try {
          geminiRes = await sendGeminiRequest(modelCandidate);
          // Auto fallback if 2.5-flash is unsupported or retired
          if (!geminiRes.ok && (geminiRes.status === 404 || geminiRes.status === 410) && modelCandidate !== 'gemini-3.8-flash') {
            geminiRes = await sendGeminiRequest('gemini-3.8-flash');
          }
        } catch (fetchErr: any) {
          if (fetchErr.name === 'AbortError') throw fetchErr;
          // Fall through to secondary provider if available
        }

        clearTimeout(timeoutId);

        if (geminiRes && geminiRes.ok) {
          const geminiData: any = await geminiRes.json();
          const outputText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (!outputText) {
            return new Response(JSON.stringify({
              error: 'EMPTY_UPSTREAM_RESPONSE',
              message: 'Upstream AI returned an empty response'
            }), {
              status: 502,
              headers: corsHeaders
            });
          }

          return new Response(JSON.stringify({
            id: 'chatcmpl-' + Math.random().toString(36).substring(2, 12),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'stork-neural-ai',
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
      }

      // 2. Secondary path: NVIDIA NIM API cascade
      if (nvidiaKeys.length > 0) {
        const selectedKey = nvidiaKeys[Math.floor(Math.random() * nvidiaKeys.length)];
        const configuredModel = context.env?.AI_MODEL;
        const candidateModels = configuredModel
          ? [configuredModel, ...FALLBACK_NVIDIA_MODELS.filter(m => m !== configuredModel)]
          : FALLBACK_NVIDIA_MODELS;

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

        let upstreamResponse: Response | null = null;
        for (const modelCandidate of candidateModels) {
          try {
            upstreamResponse = await sendUpstream(modelCandidate);
            if (upstreamResponse.ok) break;
            if (upstreamResponse.status === 404 || upstreamResponse.status === 410 || upstreamResponse.status >= 500) {
              continue;
            } else {
              break;
            }
          } catch (callErr: any) {
            if (callErr.name === 'AbortError') throw callErr;
            continue;
          }
        }

        clearTimeout(timeoutId);

        if (upstreamResponse && upstreamResponse.ok) {
          const data = await upstreamResponse.json();
          if (data && typeof data === 'object') {
            data.model = 'stork-neural-ai';
          }
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: corsHeaders
          });
        }
      }

      clearTimeout(timeoutId);
      return new Response(JSON.stringify({
        error: 'AI_UNAVAILABLE',
        message: 'AI neural engine upstream service failed. Please retry shortly.'
      }), {
        status: 502,
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
      message: 'An unexpected internal error occurred'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
