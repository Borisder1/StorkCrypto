function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const isAllowed = 
    origin === 'https://storkcrypto.pages.dev' ||
    origin.endsWith('.pages.dev') ||
    origin.endsWith('.run.app') ||
    origin.endsWith('telegram.org') ||
    origin.endsWith('web.telegram.org') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1');

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://storkcrypto.pages.dev',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  };
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);
  
  try {
    const { initData } = await request.json();
    
    if (!initData) {
      return new Response(JSON.stringify({ error: 'Missing initData' }), { 
        status: 400,
        headers: corsHeaders 
      });
    }
    
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Use Web Crypto API natively supported in Cloudflare Workers and all modern platforms
    const encoder = new TextEncoder();

    const hmacSha256 = async (keyBuffer, dataBuffer) => {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        dataBuffer
      );
      return new Uint8Array(signature);
    };

    const secretKey = await hmacSha256(
      encoder.encode('WebAppData'),
      encoder.encode(env.BOT_TOKEN || '')
    );

    const calculatedHashBuffer = await hmacSha256(
      secretKey,
      encoder.encode(dataCheckString)
    );

    const calculatedHash = Array.from(calculatedHashBuffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (calculatedHash !== hash) {
      return new Response(JSON.stringify({ error: 'Invalid initData' }), { 
        status: 403,
        headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify({ valid: true, user: JSON.parse(params.get('user') || '{}') }), {
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
