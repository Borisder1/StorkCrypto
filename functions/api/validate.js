export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { initData } = await request.json();
    
    if (!initData) {
      return new Response(JSON.stringify({ error: 'Missing initData' }), { status: 400 });
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
      return new Response(JSON.stringify({ error: 'Invalid initData' }), { status: 403 });
    }
    
    return new Response(JSON.stringify({ valid: true, user: JSON.parse(params.get('user') || '{}') }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
