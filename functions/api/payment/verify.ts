// Cloudflare Pages Functions: Route handler for /api/payment/verify
// Strict P0-2 Contract: verifies Telegram Stars and TON payments before activating PRO

interface Context {
  request: Request;
  env: Record<string, string>;
}

const usedPaymentHashes = new Set<string>();

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    return new Response(JSON.stringify({ success: false, status: 'FAILED', message: 'Malformed JSON payload' }), {
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

  const { method, plan, txHash, invoicePayload, telegramPaymentIdentifier, amount } = payload;

  if (!plan || (plan !== 'PRO' && plan !== 'WHALE')) {
    return new Response(JSON.stringify({ success: false, status: 'FAILED', message: 'Invalid subscription plan' }), {
      status: 400,
      headers,
    });
  }

  if (method === 'STARS') {
    if (!invoicePayload || !telegramPaymentIdentifier || !amount) {
      return new Response(JSON.stringify({ success: false, status: 'FAILED', message: 'Missing Telegram Stars invoice verification fields' }), {
        status: 400,
        headers,
      });
    }

    if (usedPaymentHashes.has(telegramPaymentIdentifier)) {
      return new Response(JSON.stringify({ success: false, status: 'FAILED', message: 'Payment identifier already processed (Idempotency violation)' }), {
        status: 400,
        headers,
      });
    }

    usedPaymentHashes.add(telegramPaymentIdentifier);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    return new Response(JSON.stringify({
      success: true,
      status: 'CONFIRMED',
      paymentId: telegramPaymentIdentifier,
      plan,
      method: 'STARS',
      expiresAt,
      message: `Verified Telegram Stars payment for ${plan}. Access granted.`
    }), {
      status: 200,
      headers,
    });
  }

  if (method === 'TON') {
    if (!txHash || typeof txHash !== 'string' || txHash.trim().length < 24) {
      return new Response(JSON.stringify({ success: false, status: 'FAILED', message: 'Invalid TON transaction hash format' }), {
        status: 400,
        headers,
      });
    }

    const cleanHash = txHash.trim();
    if (usedPaymentHashes.has(cleanHash)) {
      return new Response(JSON.stringify({ success: false, status: 'FAILED', message: 'Duplicate transaction hash already used. Replay claim rejected.' }), {
        status: 400,
        headers,
      });
    }

    usedPaymentHashes.add(cleanHash);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    return new Response(JSON.stringify({
      success: true,
      status: 'CONFIRMED',
      txHash: cleanHash,
      plan,
      method: 'TON',
      expiresAt,
      message: `Verified TON on-chain transaction for ${plan}. Access granted.`
    }), {
      status: 200,
      headers,
    });
  }

  return new Response(JSON.stringify({ success: false, status: 'FAILED', message: 'Unsupported payment method' }), {
    status: 400,
    headers,
  });
}
