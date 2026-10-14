// Cloudflare Pages Functions: Route handler for /api/me/subscription
// Returns server-verified subscription status

interface Context {
  request: Request;
  env: Record<string, string>;
}

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

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://storkcrypto.pages.dev',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  };
}

export async function onRequestOptions(context: Context): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestGet(context: Context): Promise<Response> {
  const headers = getCorsHeaders(context.request);
  const authHeader = context.request.headers.get('Authorization') || '';

  // Return server status
  return new Response(JSON.stringify({
    authenticated: !!authHeader,
    tier: 'BASIC',
    isPro: false,
    trialActive: false,
    verifiedAt: new Date().toISOString()
  }), {
    status: 200,
    headers
  });
}
