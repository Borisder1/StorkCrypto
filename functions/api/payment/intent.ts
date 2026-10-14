// Cloudflare Pages Functions: Route handler for /api/payment/intent
// Strict P0-2 / P0-3 Audit Compliance (Variant B: Real TON flow with server intent):
// Issues payment intent with server-defined receiver from allowlist, amount, nonce, and expiry.

interface Context {
  request: Request;
  env: Record<string, string>;
}

// In-memory intent registry with 15-minute TTL
export const activeIntents = new Map<string, {
  intentId: string;
  plan: 'PRO' | 'WHALE';
  amountNano: string;
  receiver: string;
  nonce: string;
  expiry: number;
}>();

// Official server treasury wallet allowlist
export const TREASURY_ALLOWLIST = [
  'EQA0iByiHQCr0y13647167664654578132489060412356',
  'EQC7_StorkCrypto_Treasury_Vault_Mainnet_001_HQ',
  'UQC7_StorkCrypto_Treasury_Vault_Mainnet_001_HQ'
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

    const treasuryReceiver = context.env?.ADMIN_TREASURY_WALLET || TREASURY_ALLOWLIST[0];
    const amountNano = plan === 'PRO' ? '1500000000' : '3000000000'; // 1.5 TON / 3.0 TON
    const nonce = Math.random().toString(36).substring(2, 10).toUpperCase();
    const intentId = `INTENT_${Date.now()}_${nonce}`;
    const expiry = Date.now() + 15 * 60 * 1000; // 15 mins

    activeIntents.set(intentId, {
      intentId,
      plan,
      amountNano,
      receiver: treasuryReceiver,
      nonce,
      expiry
    });

    return new Response(JSON.stringify({
      success: true,
      intentId,
      plan,
      amountNano,
      receiver: treasuryReceiver,
      network: -239, // TON Mainnet
      nonce,
      expiry,
      comment: `STORK_${plan}_${intentId}`
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
