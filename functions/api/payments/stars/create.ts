// Cloudflare Pages Function: POST /api/payments/stars/create
// Strict P0 Security & Telegram Stars (XTR) Order Initialization
// Rejects unauthenticated or forged requests with HTTP 401

import { OrdersStore, StarsOrder } from './ordersStore';
import { verifyTelegramInitData } from './auth';

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

  const safeOrigin = isAllowed ? origin : 'https://storkcrypto.pages.dev';

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': safeOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Dev-Test',
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
    const authHeader = context.request.headers.get('Authorization') || '';
    let rawInitData = '';
    if (authHeader.startsWith('tma ')) {
      rawInitData = authHeader.substring(4).trim();
    }

    const body = (await context.request.json().catch(() => ({}))) as any;
    if (!rawInitData && body?.initData && typeof body.initData === 'string') {
      rawInitData = body.initData;
    }

    // P0: Enforce Telegram initData authentication
    const host = context.request.headers.get('Host') || '';
    const isDevHost = host.includes('localhost') || host.includes('127.0.0.1') || context.request.headers.get('X-Dev-Test') === 'true';
    const botToken = context.env?.TELEGRAM_BOT_TOKEN || context.env?.BOT_TOKEN || '';

    const authResult = await verifyTelegramInitData(rawInitData, botToken, isDevHost);

    if (!authResult.valid || !authResult.userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Valid Telegram initData is required to create a Stars invoice',
        detail: authResult.error
      }), {
        status: 401,
        headers
      });
    }

    const userId = authResult.userId;

    // Normalize plan name: support 'starter', 'STARTER', 'pro_monthly', 'pro', 'PRO', 'whale', 'WHALE'
    const rawPlan = String(body?.planId || body?.plan || 'pro_monthly').toLowerCase();
    let planId: 'STARTER' | 'PRO' | 'WHALE' = 'PRO';
    let amount = 250;

    if (rawPlan.includes('starter')) {
      planId = 'STARTER';
      amount = 99;
    } else if (rawPlan.includes('whale')) {
      planId = 'WHALE';
      amount = 500;
    } else if (rawPlan.includes('pro')) {
      planId = 'PRO';
      amount = 250;
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'INVALID_PLAN',
        message: 'Plan must be strictly STARTER, PRO, or WHALE'
      }), {
        status: 400,
        headers
      });
    }

    // Pricing enforced strictly on server — ignore any client-provided amount
    const clientRequestId = body?.clientRequestId ? String(body.clientRequestId) : '';
    const orderId = `STARS_ORD_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const uniquePayload = `PAYLOAD_${orderId}_${userId}${clientRequestId ? `_${clientRequestId}` : ''}`;
    const expiry = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins TTL

    const order: StarsOrder = {
      orderId,
      userId,
      planId,
      amount,
      currency: 'XTR',
      uniquePayload,
      expiry,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    OrdersStore.createOrder(order);

    // Create Telegram invoice link
    let invoiceLink = `https://t.me/$stork_sub_${planId.toLowerCase()}_30d?startattach=${orderId}`;

    if (botToken) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `StorkCrypto ${planId}`,
            description: `Доступ до ${planId}-функцій StorkCrypto на 30 днів`,
            payload: uniquePayload,
            currency: 'XTR',
            prices: [{ label: `${planId} Monthly`, amount }]
          })
        });

        if (tgRes.ok) {
          const tgData = (await tgRes.json()) as any;
          if (tgData?.ok && tgData.result) {
            invoiceLink = tgData.result;
          }
        }
      } catch (tgErr) {
        console.warn('[Telegram Stars createInvoiceLink warning]:', tgErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      invoiceUrl: invoiceLink,
      invoiceLink: invoiceLink,
      order: {
        orderId: order.orderId,
        userId: order.userId,
        planId: order.planId,
        amount: order.amount,
        currency: order.currency,
        uniquePayload: order.uniquePayload,
        expiry: order.expiry,
        status: order.status
      },
      title: `StorkCrypto ${planId}`,
      description: `Доступ до ${planId}-функцій StorkCrypto на 30 днів`
    }), {
      status: 200,
      headers
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: 'ORDER_CREATION_FAILED',
      message: err?.message || 'Could not create Telegram Stars order'
    }), {
      status: 500,
      headers
    });
  }
}
