// Cloudflare Pages Function: POST /api/payments/stars/create-link
// External Web scenario: generate one-time Telegram invoice link for browser users

import { OrdersStore } from './ordersStore';

interface Context {
  request: Request;
  env: Record<string, string>;
}

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
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
  try {
    const body = (await context.request.json().catch(() => ({}))) as any;
    const rawPlan = String(body?.planId || body?.plan || 'pro_monthly').toLowerCase();
    let planId: 'STARTER' | 'PRO' | 'WHALE' = 'PRO';
    let amount = 250;
    if (rawPlan.includes('starter')) {
      planId = 'STARTER';
      amount = 99;
    } else if (rawPlan.includes('whale')) {
      planId = 'WHALE';
      amount = 500;
    } else {
      planId = 'PRO';
      amount = 250;
    }
    const webUserId = body?.userId ? String(body.userId) : `web_user_${Date.now()}`;
    const orderId = `STARS_ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const uniquePayload = `PAYLOAD_${orderId}_${webUserId}`;
    const expiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const order = OrdersStore.createOrder({
      orderId,
      userId: webUserId,
      planId,
      amount,
      currency: 'XTR',
      uniquePayload,
      expiry,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    const invoiceUrl = `https://t.me/$stork_sub_${planId.toLowerCase()}_30d?startattach=${orderId}`;

    return new Response(JSON.stringify({
      success: true,
      orderId,
      order,
      invoiceUrl,
      invoiceLink: invoiceUrl,
      plan: planId.toLowerCase(),
      amount,
      currency: 'XTR'
    }), {
      status: 200,
      headers
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: 'SERVER_ERROR',
      message: err?.message || 'Failed to create web invoice link'
    }), {
      status: 500,
      headers
    });
  }
}
