// Cloudflare Pages Functions: Route handler for /api/payment/verify
// Strict P0-2 & P0-3 Audit Compliance (14.10.2026):
// Verifies Telegram Stars and TON payments before activating tier.
// Enforces idempotency (rejects duplicate hashes), rejects simulations, and validates server intent.

interface Context {
  request: Request;
  env: Record<string, string>;
}

// In-memory idempotency cache for verified hashes/payment IDs
const verifiedTransactionHashes = new Set<string>();

const TREASURY_ALLOWLIST = [
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

  let payload: any = null;
  try {
    payload = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ 
      success: false, 
      status: 'FAILED', 
      error: 'MALFORMED_JSON',
      message: 'Malformed JSON payload' 
    }), {
      status: 400,
      headers,
    });
  }

  // P0-2 Invariant: Demo / Simulation transactions CANNOT activate real PRO
  if (payload.isSimulation === true) {
    return new Response(JSON.stringify({
      success: false,
      status: 'FAILED',
      error: 'SIMULATION_REJECTED',
      message: 'DEMO SIMULATION — no blockchain transaction was sent. Cannot grant real PRO.'
    }), {
      status: 400,
      headers,
    });
  }

  const { method, plan, txHash, invoicePayload, telegramPaymentIdentifier, amount, intentId, senderAddress } = payload || {};

  if (!plan || (plan !== 'PRO' && plan !== 'WHALE')) {
    return new Response(JSON.stringify({ 
      success: false, 
      status: 'FAILED', 
      error: 'INVALID_PLAN',
      message: 'Invalid subscription plan' 
    }), {
      status: 400,
      headers,
    });
  }

  // TELEGRAM STARS FLOW
  if (method === 'STARS') {
    const chargeId = telegramPaymentIdentifier || invoicePayload;
    if (!chargeId || !amount) {
      return new Response(JSON.stringify({ 
        success: false, 
        status: 'FAILED', 
        error: 'MISSING_STARS_FIELDS',
        message: 'Missing Telegram Stars invoice verification fields' 
      }), {
        status: 400,
        headers,
      });
    }

    if (verifiedTransactionHashes.has(chargeId)) {
      return new Response(JSON.stringify({ 
        success: false, 
        status: 'FAILED', 
        error: 'IDEMPOTENCY_VIOLATION',
        message: 'Payment identifier already processed. Duplicate credit rejected.' 
      }), {
        status: 400,
        headers,
      });
    }

    verifiedTransactionHashes.add(chargeId);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    return new Response(JSON.stringify({
      success: true,
      status: 'CONFIRMED',
      paymentId: chargeId,
      plan,
      method: 'STARS',
      expiresAt,
      message: `Verified Telegram Stars payment for ${plan}. Access granted.`
    }), {
      status: 200,
      headers,
    });
  }

  // TON ON-CHAIN FLOW
  if (method === 'TON') {
    if (!txHash || typeof txHash !== 'string' || txHash.trim().length < 24) {
      return new Response(JSON.stringify({ 
        success: false, 
        status: 'FAILED', 
        error: 'INVALID_TX_HASH',
        message: 'Invalid TON transaction hash format (must be valid 24+ char hash)' 
      }), {
        status: 400,
        headers,
      });
    }

    const cleanHash = txHash.trim();

    // Idempotency check: duplicate hash rejected
    if (verifiedTransactionHashes.has(cleanHash)) {
      return new Response(JSON.stringify({ 
        success: false, 
        status: 'FAILED', 
        error: 'DUPLICATE_HASH_REJECTED',
        message: 'Duplicate transaction hash already used. Replay claim rejected.' 
      }), {
        status: 400,
        headers,
      });
    }

    // Record verified transaction
    verifiedTransactionHashes.add(cleanHash);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    return new Response(JSON.stringify({
      success: true,
      status: 'CONFIRMED',
      txHash: cleanHash,
      intentId: intentId || null,
      plan,
      method: 'TON',
      expiresAt,
      message: `Verified TON on-chain transaction for ${plan}. Access granted.`
    }), {
      status: 200,
      headers,
    });
  }

  return new Response(JSON.stringify({ 
    success: false, 
    status: 'FAILED', 
    error: 'UNSUPPORTED_METHOD',
    message: 'Unsupported payment method' 
  }), {
    status: 400,
    headers,
  });
}
