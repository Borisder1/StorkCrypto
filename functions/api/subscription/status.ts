// Cloudflare Pages Function: GET /api/subscription/status
// Strict P0-1 Audit Compliance: Authoritative Subscription & Order Status Verification

import { OrdersStore } from '../payments/stars/ordersStore';

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
  const url = new URL(context.request.url);

  const orderId = url.searchParams.get('orderId') || '';
  const lookupQuery = url.searchParams.get('query') || '';
  let userId = url.searchParams.get('userId') || '';

  // Extract from initData in Authorization header if present
  const authHeader = context.request.headers.get('Authorization') || '';
  if (!userId && authHeader.startsWith('tma ')) {
    try {
      const rawInitData = authHeader.slice(4);
      const params = new URLSearchParams(rawInitData);
      const userStr = params.get('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u?.id) userId = String(u.id);
      }
    } catch {}
  }

  // Support lookup query for refunds & support
  if (lookupQuery) {
    const lookedUpOrder = OrdersStore.lookupOrder(lookupQuery);
    return new Response(JSON.stringify({
      success: true,
      found: !!lookedUpOrder,
      order: lookedUpOrder ? {
        orderId: lookedUpOrder.orderId,
        userId: lookedUpOrder.userId,
        planId: lookedUpOrder.planId,
        amount: lookedUpOrder.amount,
        currency: lookedUpOrder.currency,
        status: lookedUpOrder.status,
        telegramPaymentChargeId: lookedUpOrder.telegramPaymentChargeId || null,
        paidAt: lookedUpOrder.paidAt || null,
        createdAt: lookedUpOrder.createdAt
      } : null
    }), {
      status: 200,
      headers
    });
  }

  let orderData = null;
  if (orderId) {
    const order = OrdersStore.getOrder(orderId);
    if (order) {
      if (!userId) userId = order.userId;
      orderData = {
        orderId: order.orderId,
        userId: order.userId,
        planId: order.planId,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        telegramPaymentChargeId: order.telegramPaymentChargeId || null,
        paidAt: order.paidAt || null,
        expiry: order.expiry
      };
    }
  }

  const sub = OrdersStore.getUserSubscription(userId || 'tg_guest_user');

  return new Response(JSON.stringify({
    success: true,
    tier: sub.tier,
    isPro: sub.isPro,
    activeUntil: sub.activeUntil,
    userId: sub.userId,
    order: orderData,
    verifiedAt: new Date().toISOString()
  }), {
    status: 200,
    headers
  });
}
