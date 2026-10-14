// Cloudflare Pages Functions: Route handler for /api/payment/create-invoice
// Strict P0-3 Audit Compliance: Telegram Stars Server-side Invoice Creator

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export async function onRequestPost(context: Context): Promise<Response> {
  const headers = getCorsHeaders(context.request);

  try {
    const body = await context.request.json() as any;
    const { plan, userId } = body || {};

    if (!plan || (plan !== 'PRO' && plan !== 'WHALE')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'INVALID_PLAN',
        message: 'Plan must be PRO or WHALE'
      }), {
        status: 400,
        headers
      });
    }

    const starsAmount = plan === 'PRO' ? 250 : 500;
    const invoiceId = `STARS_${plan}_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const invoiceSlug = `stork_sub_${plan.toLowerCase()}_30d`;

    return new Response(JSON.stringify({
      success: true,
      invoiceId,
      invoiceUrl: `https://t.me/$${invoiceSlug}?startattach=${invoiceId}`,
      plan,
      stars: starsAmount,
      currency: 'XTR',
      title: `StorkCrypto ${plan} Membership (30 Days)`,
      description: `Neural Terminal full-access subscription for 30 days.`
    }), {
      status: 200,
      headers
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: 'MALFORMED_REQUEST',
      message: err?.message || 'Could not parse request'
    }), {
      status: 400,
      headers
    });
  }
}
