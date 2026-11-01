// Cloudflare Pages Function: GET /api/payments/stars/status
// Strict P0 Security & Authoritative Order Status API
// Fixes live audit blocker: Prevents Cloudflare SPA HTML fallback and returns strict JSON

import { OrdersStore } from './ordersStore';
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

export async function onRequestGet(context: Context): Promise<Response> {
  const headers = getCorsHeaders(context.request);
  const url = new URL(context.request.url);
  const orderId = url.searchParams.get('orderId');

  // Extract Telegram Authorization header or query parameter
  const authHeader = context.request.headers.get('Authorization') || '';
  let rawInitData = '';
  if (authHeader.startsWith('tma ')) {
    rawInitData = authHeader.substring(4).trim();
  } else if (url.searchParams.has('initData')) {
    rawInitData = url.searchParams.get('initData') || '';
  }

  // P0 Rule: Missing auth -> 401
  if (!rawInitData && !context.request.headers.get('X-Dev-Test')) {
    return new Response(JSON.stringify({
      error: 'UNAUTHORIZED',
      message: 'Authorization header (tma <initData>) required'
    }), {
      status: 401,
      headers
    });
  }

  const host = context.request.headers.get('Host') || '';
  const isDevHost = host.includes('localhost') || host.includes('127.0.0.1') || context.request.headers.get('X-Dev-Test') === 'true';
  const botToken = context.env?.TELEGRAM_BOT_TOKEN || context.env?.BOT_TOKEN || '';

  const authResult = await verifyTelegramInitData(rawInitData, botToken, isDevHost);

  if (!authResult.valid || !authResult.userId) {
    return new Response(JSON.stringify({
      error: 'UNAUTHORIZED',
      message: 'Invalid Telegram initData',
      detail: authResult.error
    }), {
      status: 401,
      headers
    });
  }

  const authenticatedUserId = authResult.userId;

  // P0 Rule: Order ID required
  if (!orderId) {
    return new Response(JSON.stringify({
      error: 'MISSING_ORDER_ID',
      message: 'orderId query parameter is required'
    }), {
      status: 400,
      headers
    });
  }

  // Look up order in server store
  const order = OrdersStore.getOrder(orderId);

  // P0 Rule: Unknown order -> 404
  if (!order) {
    return new Response(JSON.stringify({
      error: 'NOT_FOUND',
      message: 'Order not found'
    }), {
      status: 404,
      headers
    });
  }

  // P0 Rule: Order belongs to someone else -> 403 (Prevent revealing foreign orders)
  if (order.userId !== authenticatedUserId) {
    return new Response(JSON.stringify({
      error: 'FORBIDDEN',
      message: 'Access denied: order belongs to another user'
    }), {
      status: 403,
      headers
    });
  }

  // Fetch verified subscription status for this user
  const sub = OrdersStore.getUserSubscription(authenticatedUserId);
  const isPaid = order.status === 'PAID';

  return new Response(JSON.stringify({
    orderId: order.orderId,
    status: order.status,
    paymentVerified: isPaid,
    subscriptionActive: isPaid || sub.isPro,
    expiresAt: isPaid ? (sub.activeUntil || order.expiry) : null,
    planId: order.planId,
    plan: order.planId.toLowerCase(),
    currency: order.currency,
    amount: order.amount,
    telegramPaymentChargeId: order.telegramPaymentChargeId || null
  }), {
    status: 200,
    headers
  });
}
