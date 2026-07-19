import crypto from 'node:crypto';

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
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(env.BOT_TOKEN || '').digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString).digest('hex');
    
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
