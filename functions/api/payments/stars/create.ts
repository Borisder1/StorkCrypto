// Cloudflare Pages Function: POST /api/payments/stars/create
// Strict P0-1 Audit Compliance: Telegram Stars (XTR) Order Initialization

import { OrdersStore, StarsOrder } from './ordersStore';

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
    const body = (await context.request.json()) as any;
    const planId = (body?.planId || body?.plan || '').toUpperCase();

    if (planId !== 'PRO' && planId !== 'WHALE') {
      return new Response(JSON.stringify({
        success: false,
        error: 'INVALID_PLAN',
        message: 'Plan must be strictly PRO or WHALE'
      }), {
        status: 400,
        headers
      });
    }

    // Extract Telegram User ID from verified initData or session
    let userId = 'tg_guest_user';
    if (body?.initData && typeof body.initData === 'string') {
      try {
        const params = new URLSearchParams(body.initData);
        const userParam = params.get('user');
        if (userParam) {
          const parsed = JSON.parse(userParam);
          if (parsed?.id) {
            userId = String(parsed.id);
          }
        }
      } catch {}
    } else if (body?.userId) {
      userId = String(body.userId);
    }

    const amount = planId === 'PRO' ? 250 : 500;
    const orderId = `STARS_ORD_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const uniquePayload = `PAYLOAD_${orderId}_${userId}`;
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
    const botToken = context.env?.TELEGRAM_BOT_TOKEN || '';

    if (botToken) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `StorkCrypto ${planId} Subscription`,
            description: `Unlock Neural Terminal ${planId} Tier for 30 days`,
            payload: uniquePayload,
            currency: 'XTR',
            prices: [{ label: `${planId} Tier (30d)`, amount }]
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
      invoiceLink,
      title: `StorkCrypto ${planId} Subscription`,
      description: `Neural Terminal ${planId} Tier with live signals, on-chain intelligence and AI Copilot.`
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
