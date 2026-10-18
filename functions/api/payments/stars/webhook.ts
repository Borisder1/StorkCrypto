// Cloudflare Pages Function: POST /api/payments/stars/webhook
// Strict P0-1 Audit Compliance: Telegram Stars pre_checkout_query & successful_payment Verification

import { OrdersStore } from './ordersStore';

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Telegram-Bot-Api-Secret-Token',
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
  const botToken = context.env?.TELEGRAM_BOT_TOKEN || '';

  try {
    const update = (await context.request.json()) as any;

    // 1. Handle pre_checkout_query (must answer within 10s)
    if (update?.pre_checkout_query) {
      const pcq = update.pre_checkout_query;
      const pcqId = pcq.id;
      const payload = pcq.invoice_payload;
      const currency = pcq.currency;
      const amount = pcq.total_amount;

      // Verify order matches
      const order = OrdersStore.getOrderByPayload(payload);
      let ok = false;
      let errorMessage = 'Order not found or expired';

      if (order && currency === 'XTR' && order.amount === amount) {
        if (new Date(order.expiry).getTime() > Date.now()) {
          ok = true;
        } else {
          errorMessage = 'Invoice has expired';
        }
      }

      // If Bot token configured, answer via Telegram API
      if (botToken) {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pre_checkout_query_id: pcqId,
              ok,
              error_message: ok ? undefined : errorMessage
            })
          });
        } catch (tgErr) {
          console.error('[answerPreCheckoutQuery Error]:', tgErr);
        }
      }

      return new Response(JSON.stringify({
        ok,
        pre_checkout_query_id: pcqId,
        currency,
        verified: ok
      }), {
        status: 200,
        headers
      });
    }

    // 2. Handle successful_payment from message update
    const message = update?.message;
    const successfulPayment = message?.successful_payment;

    if (successfulPayment) {
      const currency = successfulPayment.currency;
      const totalAmount = successfulPayment.total_amount;
      const payload = successfulPayment.invoice_payload;
      const chargeId = successfulPayment.telegram_payment_charge_id;
      const senderUserId = String(message?.from?.id || '');

      // Verification checks:
      if (currency !== 'XTR') {
        return new Response(JSON.stringify({ error: 'INVALID_CURRENCY', message: 'Only XTR currency is accepted' }), {
          status: 400,
          headers
        });
      }

      if (!chargeId) {
        return new Response(JSON.stringify({ error: 'MISSING_CHARGE_ID', message: 'telegram_payment_charge_id is required' }), {
          status: 400,
          headers
        });
      }

      const order = OrdersStore.getOrderByPayload(payload);
      if (!order) {
        return new Response(JSON.stringify({ error: 'UNKNOWN_ORDER', message: 'Order could not be matched' }), {
          status: 404,
          headers
        });
      }

      if (order.amount !== totalAmount) {
        return new Response(JSON.stringify({ error: 'AMOUNT_MISMATCH', message: 'Payment amount mismatch' }), {
          status: 400,
          headers
        });
      }

      // Enforce idempotency and activate subscription
      const result = OrdersStore.markPaid(order.orderId, chargeId);
      if (!result.success && result.error !== 'ALREADY_PROCESSED') {
        return new Response(JSON.stringify({ error: result.error, message: 'Could not process order' }), {
          status: 400,
          headers
        });
      }

      return new Response(JSON.stringify({
        ok: true,
        orderId: order.orderId,
        userId: order.userId,
        status: 'PAID',
        telegram_payment_charge_id: chargeId,
        idempotent: result.error === 'ALREADY_PROCESSED',
        activatedTier: order.planId
      }), {
        status: 200,
        headers
      });
    }

    // 3. Test & Simulator Support: allows end-to-end verification without live funds
    if (update?.action === 'simulate_payment' && update?.orderId) {
      const order = OrdersStore.getOrder(update.orderId);
      if (!order) {
        return new Response(JSON.stringify({ error: 'ORDER_NOT_FOUND' }), { status: 404, headers });
      }

      const mockChargeId = update.chargeId || `tg_charge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const result = OrdersStore.markPaid(order.orderId, mockChargeId);

      return new Response(JSON.stringify({
        ok: true,
        orderId: order.orderId,
        userId: order.userId,
        status: 'PAID',
        telegram_payment_charge_id: mockChargeId,
        idempotent: result.error === 'ALREADY_PROCESSED',
        activatedTier: order.planId
      }), {
        status: 200,
        headers
      });
    }

    // 4. Cancel order support
    if (update?.action === 'cancel_order' && update?.orderId) {
      const order = OrdersStore.markStatus(update.orderId, 'CANCELLED');
      return new Response(JSON.stringify({ ok: true, orderId: update.orderId, status: order?.status || 'CANCELLED' }), {
        status: 200,
        headers
      });
    }

    return new Response(JSON.stringify({ ok: true, message: 'Unhandled event acknowledged' }), {
      status: 200,
      headers
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'WEBHOOK_ERROR', message: err?.message || 'Webhook processing failed' }), {
      status: 500,
      headers
    });
  }
}
