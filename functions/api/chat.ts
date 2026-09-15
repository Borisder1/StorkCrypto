// Cloudflare Pages Functions: Route handler for /api/chat
// Supports NVIDIA AI / Minimax completions proxy with validation and CORS

interface ChatContext {
  request: Request;
  env: Record<string, string>;
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function onRequestPost(context: ChatContext): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  try {
    const rawKey = context.env?.NVIDIA_API_KEY || '';
    const keys = rawKey.split(',').map((k: string) => k.trim()).filter(Boolean);

    if (keys.length === 0) {
      return new Response(JSON.stringify({
        error: 'AI_SERVICE_UNAVAILABLE',
        message: 'NVIDIA_API_KEY is not configured in environment variables'
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

    // Randomize across keys if multiple are provided
    const selectedKey = keys[Math.floor(Math.random() * keys.length)];

    // Fetch with 15s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const upstreamResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedKey}`
        },
        body: JSON.stringify({
          model: requestBody.model || 'minimaxai/minimax-m2.7',
          messages: requestBody.messages,
          temperature: typeof requestBody.temperature === 'number' ? requestBody.temperature : 0.7,
          top_p: typeof requestBody.top_p === 'number' ? requestBody.top_p : 0.95,
          max_tokens: typeof requestBody.max_tokens === 'number' ? Math.min(requestBody.max_tokens, 8192) : 2048,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!upstreamResponse.ok) {
        const errorText = await upstreamResponse.text();
        return new Response(JSON.stringify({
          error: 'UPSTREAM_AI_ERROR',
          status: upstreamResponse.status,
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
