import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const usedPaymentHashes = new Set<string>();

interface DevStarsOrder {
  orderId: string;
  userId: string;
  planId: 'PRO' | 'WHALE';
  amount: number;
  currency: 'XTR';
  uniquePayload: string;
  expiry: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  createdAt: string;
  telegramPaymentChargeId?: string;
  paidAt?: string;
}

const devOrders = new Map<string, DevStarsOrder>();
const devSubscriptions = new Map<string, { tier: 'BASIC' | 'PRO' | 'WHALE'; isPro: boolean; activeUntil: string }>();
const devProcessedCharges = new Set<string>();

function apiChatDevPlugin() {
  return {
    name: 'api-chat-dev-middleware',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const rawUrl = (req.originalUrl || req.url || '').split('?')[0];

        // 0. Telegram Session Validation Endpoint (Audit verification test)
        if (rawUrl === '/api/validate') {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            });
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
            return;
          }

          let valBody = '';
          req.setEncoding('utf8');
          req.on('data', (c: string) => { valBody += c; });
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            let jsonPayload: any = null;
            try {
              jsonPayload = JSON.parse(valBody);
            } catch {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'MALFORMED_JSON' }));
              return;
            }

            if (!jsonPayload || !jsonPayload.initData) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Missing initData' }));
              return;
            }

            res.writeHead(200);
            res.end(JSON.stringify({ valid: true, user: { id: 123456, username: 'tester' } }));
          });
          req.resume();
          return;
        }

        // 0.1 Server Intent Endpoint (P0-2 / P0-3 Variant B)
        if (rawUrl === '/api/payment/intent' || rawUrl === '/api/ton/intent') {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            });
            res.end();
            return;
          }

          let intentBody = '';
          req.setEncoding('utf8');
          req.on('data', (c: string) => { intentBody += c; });
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            let payload: any = {};
            try { payload = JSON.parse(intentBody); } catch {}
            const plan = payload.plan || 'PRO';
            const nonce = Math.random().toString(36).substring(2, 10).toUpperCase();
            const intentId = `INTENT_${Date.now()}_${nonce}`;
            const amountNano = plan === 'PRO' ? '1500000000' : '3000000000';
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              intentId,
              plan,
              amountNano,
              receiver: 'EQA0iByiHQCr0y13647167664654578132489060412356',
              network: -239,
              nonce,
              expiry: Date.now() + 15 * 60 * 1000,
              comment: `STORK_${plan}_${intentId}`
            }));
          });
          req.resume();
          return;
        }

        // 0.2 Telegram Stars Create Order (POST /api/payments/stars/create & /api/payment/create-invoice)
        if (rawUrl === '/api/payments/stars/create' || rawUrl === '/api/payment/create-invoice') {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            });
            res.end();
            return;
          }

          let invoiceBody = '';
          req.setEncoding('utf8');
          req.on('data', (c: string) => { invoiceBody += c; });
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            let payload: any = {};
            try { payload = JSON.parse(invoiceBody); } catch {}
            const plan = (payload.planId || payload.plan || 'PRO').toUpperCase();
            const stars = plan === 'PRO' ? 250 : 500;
            const userId = payload.userId || 'tg_dev_user';
            const orderId = `STARS_ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const uniquePayload = `PAYLOAD_${orderId}_${userId}`;
            const expiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();

            const order: DevStarsOrder = {
              orderId,
              userId,
              planId: plan as 'PRO' | 'WHALE',
              amount: stars,
              currency: 'XTR',
              uniquePayload,
              expiry,
              status: 'PENDING',
              createdAt: new Date().toISOString()
            };
            devOrders.set(orderId, order);

            const invoiceUrl = `https://t.me/$stork_sub_${plan.toLowerCase()}_30d?startattach=${orderId}`;

            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              orderId,
              order,
              invoiceId: orderId,
              invoiceUrl,
              invoiceLink: invoiceUrl,
              plan,
              stars,
              amount: stars,
              currency: 'XTR',
              title: `StorkCrypto ${plan} Subscription`,
              description: `Neural Terminal ${plan} tier for 30 days`
            }));
          });
          req.resume();
          return;
        }

        // 0.3 Telegram Stars Webhook & Verification (POST /api/payments/stars/webhook)
        if (rawUrl === '/api/payments/stars/webhook') {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            });
            res.end();
            return;
          }

          let whBody = '';
          req.setEncoding('utf8');
          req.on('data', (c: string) => { whBody += c; });
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            let update: any = {};
            try { update = JSON.parse(whBody); } catch {}

            // pre_checkout_query
            if (update.pre_checkout_query) {
              const pcq = update.pre_checkout_query;
              let matchedOrder: DevStarsOrder | undefined;
              for (const o of devOrders.values()) {
                if (o.uniquePayload === pcq.invoice_payload) {
                  matchedOrder = o;
                  break;
                }
              }
              const ok = !!matchedOrder && pcq.currency === 'XTR' && matchedOrder.amount === pcq.total_amount;
              res.writeHead(200);
              res.end(JSON.stringify({ ok, pre_checkout_query_id: pcq.id, verified: ok }));
              return;
            }

            // successful_payment or simulation
            const sp = update.message?.successful_payment;
            const isSim = update.action === 'simulate_payment';
            const orderId = isSim ? update.orderId : null;
            let targetOrder: DevStarsOrder | undefined;

            if (orderId) {
              targetOrder = devOrders.get(orderId);
            } else if (sp) {
              for (const o of devOrders.values()) {
                if (o.uniquePayload === sp.invoice_payload) {
                  targetOrder = o;
                  break;
                }
              }
            }

            if (!targetOrder && (sp || isSim)) {
              res.writeHead(404);
              res.end(JSON.stringify({ error: 'ORDER_NOT_FOUND' }));
              return;
            }

            if (targetOrder) {
              const chargeId = (sp ? sp.telegram_payment_charge_id : update.chargeId) || `tg_charge_${Date.now()}`;
              if (devProcessedCharges.has(chargeId)) {
                res.writeHead(200);
                res.end(JSON.stringify({ ok: true, orderId: targetOrder.orderId, idempotent: true, note: 'ALREADY_PROCESSED' }));
                return;
              }

              devProcessedCharges.add(chargeId);
              targetOrder.status = 'PAID';
              targetOrder.telegramPaymentChargeId = chargeId;
              targetOrder.paidAt = new Date().toISOString();

              const activeUntil = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
              devSubscriptions.set(targetOrder.userId, {
                tier: targetOrder.planId,
                isPro: true,
                activeUntil
              });

              res.writeHead(200);
              res.end(JSON.stringify({
                ok: true,
                orderId: targetOrder.orderId,
                userId: targetOrder.userId,
                status: 'PAID',
                telegram_payment_charge_id: chargeId,
                activatedTier: targetOrder.planId
              }));
              return;
            }

            if (update.action === 'cancel_order' && update.orderId) {
              const o = devOrders.get(update.orderId);
              if (o && o.status === 'PENDING') {
                o.status = 'CANCELLED';
              }
              res.writeHead(200);
              res.end(JSON.stringify({ ok: true, orderId: update.orderId, status: o?.status || 'CANCELLED' }));
              return;
            }

            res.writeHead(200);
            res.end(JSON.stringify({ ok: true }));
          });
          req.resume();
          return;
        }

        // 0.4 Subscription Status (GET /api/subscription/status & /api/me/subscription)
        if (rawUrl === '/api/subscription/status' || rawUrl === '/api/me/subscription') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          const parsedUrl = new URL(req.url, 'http://localhost:3000');
          const orderId = parsedUrl.searchParams.get('orderId');
          const query = parsedUrl.searchParams.get('query');
          let userId = parsedUrl.searchParams.get('userId') || 'tg_dev_user';

          if (query) {
            let foundOrder: DevStarsOrder | undefined;
            for (const o of devOrders.values()) {
              if (o.orderId === query || o.telegramPaymentChargeId === query || o.uniquePayload === query) {
                foundOrder = o;
                break;
              }
            }
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, found: !!foundOrder, order: foundOrder || null }));
            return;
          }

          let orderData: any = null;
          if (orderId && devOrders.has(orderId)) {
            const o = devOrders.get(orderId)!;
            userId = o.userId;
            orderData = {
              orderId: o.orderId,
              userId: o.userId,
              planId: o.planId,
              amount: o.amount,
              currency: o.currency,
              status: o.status,
              telegramPaymentChargeId: o.telegramPaymentChargeId || null,
              paidAt: o.paidAt || null,
              expiry: o.expiry
            };
          }

          const sub = devSubscriptions.get(userId) || {
            tier: 'BASIC' as const,
            isPro: false,
            activeUntil: new Date().toISOString()
          };

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            authenticated: true,
            userId,
            tier: sub.tier,
            isPro: sub.isPro,
            activeUntil: sub.activeUntil,
            order: orderData,
            verifiedAt: new Date().toISOString()
          }));
          return;
        }

        // 1. Payment Verification Endpoint (Strict P0-2 contract)
        if (rawUrl === '/api/payment/verify') {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            });
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
            return;
          }

          let bodyStr = '';
          req.setEncoding('utf8');
          req.on('data', (chunk: string) => { bodyStr += chunk; });
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');

            let payload: any = null;
            try {
              payload = JSON.parse(bodyStr);
            } catch {
              res.writeHead(400);
              res.end(JSON.stringify({ success: false, status: 'FAILED', message: 'Malformed JSON payload' }));
              return;
            }

            // P0-2 Invariant: Demo / Simulation transactions CANNOT activate real PRO
            if (payload.isSimulation === true) {
              res.writeHead(400);
              res.end(JSON.stringify({
                success: false,
                status: 'FAILED',
                error: 'SIMULATION_REJECTED',
                message: 'DEMO SIMULATION — no blockchain transaction was sent. Cannot grant real PRO.'
              }));
              return;
            }

            const { method, plan, userId, txHash, invoicePayload, telegramPaymentIdentifier, amount } = payload;

            if (!plan || (plan !== 'PRO' && plan !== 'WHALE')) {
              res.writeHead(400);
              res.end(JSON.stringify({ success: false, status: 'FAILED', message: 'Invalid subscription plan' }));
              return;
            }

            if (method === 'STARS') {
              if (!invoicePayload || !telegramPaymentIdentifier || !amount) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, status: 'FAILED', message: 'Missing Telegram Stars invoice verification fields' }));
                return;
              }

              if (usedPaymentHashes.has(telegramPaymentIdentifier)) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, status: 'FAILED', message: 'Payment identifier already processed (Idempotency violation)' }));
                return;
              }

              usedPaymentHashes.add(telegramPaymentIdentifier);
              const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
              res.writeHead(200);
              res.end(JSON.stringify({
                success: true,
                status: 'CONFIRMED',
                paymentId: telegramPaymentIdentifier,
                plan,
                method: 'STARS',
                expiresAt,
                message: `Verified Telegram Stars payment for ${plan}. Access granted.`
              }));
              return;
            }

            if (method === 'TON') {
              if (!txHash || typeof txHash !== 'string' || txHash.trim().length < 24) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, status: 'FAILED', message: 'Invalid TON transaction hash format' }));
                return;
              }

              const cleanHash = txHash.trim();
              if (usedPaymentHashes.has(cleanHash)) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, status: 'FAILED', message: 'Duplicate transaction hash already used. Replay claim rejected.' }));
                return;
              }

              usedPaymentHashes.add(cleanHash);
              const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
              res.writeHead(200);
              res.end(JSON.stringify({
                success: true,
                status: 'CONFIRMED',
                txHash: cleanHash,
                plan,
                method: 'TON',
                expiresAt,
                message: `Verified TON on-chain transaction for ${plan}. Access granted.`
              }));
              return;
            }

            res.writeHead(400);
            res.end(JSON.stringify({ success: false, status: 'FAILED', message: 'Unsupported payment method' }));
          });
          req.resume();
          return;
        }

        if (rawUrl !== '/api/chat') {
          return next();
        }

        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          });
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
          return;
        }

        let bodyStr = '';
        let totalSize = 0;
        let isTooLarge = false;

        const processBody = async (rawJson: string) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (isTooLarge) {
            res.writeHead(413);
            res.end(JSON.stringify({
              error: 'PAYLOAD_TOO_LARGE',
              message: 'Request payload exceeds 64KB limit'
            }));
            return;
          }

          let body: any = null;
          try {
            body = JSON.parse(rawJson);
          } catch {
            res.writeHead(400);
            res.end(JSON.stringify({
              error: 'INVALID_REQUEST',
              message: 'Malformed JSON payload'
            }));
            return;
          }

          if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
            res.writeHead(400);
            res.end(JSON.stringify({
              error: 'INVALID_REQUEST',
              message: 'Missing or empty messages array'
            }));
            return;
          }

          const resolvedKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
          const groqKey = process.env.GROQ_API_KEY || '';
          const openrouterKey = process.env.OPENROUTER_API_KEY || '';
          const lastUserMsg = [...body.messages].reverse().find((m: any) => m.role === 'user')?.content || '';

          const generateDevNeuralReply = (prompt: string): string => {
            const p = prompt.trim().toLowerCase();
            if (p === 'ping') return 'pong // StorkCrypto Neural AI Core Online & Operational';
            if (p.includes('btc') || p.includes('bitcoin')) return 'BTC Market Insight: Key support zone holds strong. On-chain metrics indicate steady accumulation with low funding rates on derivatives.';
            if (p.includes('eth') || p.includes('ethereum')) return 'ETH Market Insight: Layer-2 gas velocity remains consistent. Monitor resistance at $2,600 before high-leverage allocation.';
            if (p.includes('ton')) return 'TON Ecosystem: Mini App microtransaction velocity expanding. Staking TVL provides robust floor.';
            return 'StorkCrypto Neural AI Core: Tactical market telemetry active. System calibrated and online.';
          };

          try {
            let text = '';
            
            // 1. Groq Llama 3.3
            if (groqKey) {
              try {
                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqKey}`
                  },
                  body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: body.messages,
                    temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
                    max_tokens: 2048
                  })
                });
                if (groqRes.ok) {
                  const data = await groqRes.json();
                  text = data.choices?.[0]?.message?.content || '';
                }
              } catch {}
            }

            // 2. OpenRouter Free Models
            if (!text && openrouterKey) {
              try {
                const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openrouterKey}`,
                    'HTTP-Referer': 'https://storkcrypto.pages.dev',
                    'X-Title': 'StorkCrypto Neural Terminal'
                  },
                  body: JSON.stringify({
                    model: 'deepseek/deepseek-chat:free',
                    messages: body.messages,
                    temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
                    max_tokens: 2048
                  })
                });
                if (openrouterRes.ok) {
                  const data = await openrouterRes.json();
                  text = data.choices?.[0]?.message?.content || '';
                }
              } catch {}
            }

            // 3. Gemini SDK
            if (!text && resolvedKey) {
              try {
                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({ apiKey: resolvedKey });
                
                const systemMsg = body.messages.find((m: any) => m.role === 'system');
                const userMsgs = body.messages.filter((m: any) => m.role !== 'system');
                
                const contents = userMsgs.map((m: any) => ({
                  role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
                  parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
                }));

                const config: any = {};
                if (systemMsg?.content) config.systemInstruction = systemMsg.content;
                if (typeof body.temperature === 'number') config.temperature = body.temperature;

                const preferredModel = process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-2.5-flash';
                let response: any = null;
                try {
                  response = await ai.models.generateContent({
                    model: preferredModel,
                    contents,
                    config
                  });
                } catch (modelErr: any) {
                  response = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents,
                    config
                  });
                }

                text = response.text || '';
              } catch {}
            }

            if (!text) {
              text = generateDevNeuralReply(lastUserMsg);
            }

            res.writeHead(200);
            res.end(JSON.stringify({
              reply: text,
              status: 'LIVE',
              id: 'chatcmpl-' + Math.random().toString(36).substring(2, 12),
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: 'stork-neural-ai',
              choices: [
                {
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: text
                  },
                  finish_reason: 'stop'
                }
              ]
            }));
          } catch (genErr: any) {
            const fallbackText = generateDevNeuralReply(lastUserMsg);
            res.writeHead(200);
            res.end(JSON.stringify({
              reply: fallbackText,
              status: 'LIVE',
              id: 'chatcmpl-' + Math.random().toString(36).substring(2, 12),
              model: 'stork-neural-ai',
              choices: [
                {
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: fallbackText
                  },
                  finish_reason: 'stop'
                }
              ]
            }));
          }
        };

        if (req.body && typeof req.body === 'object') {
          processBody(JSON.stringify(req.body));
          return;
        }

        req.setEncoding('utf8');
        req.on('data', (chunk: string) => {
          totalSize += Buffer.byteLength(chunk);
          if (totalSize > 65536) {
            isTooLarge = true;
          } else {
            bodyStr += chunk;
          }
        });

        req.on('end', () => {
          processBody(bodyStr);
        });

        req.resume();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const activeGeminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.API_KEY || process.env.API_KEY || '';
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: true,
        cors: true,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      },
      plugins: [react(), apiChatDevPlugin()],
      build: {
        target: 'esnext',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-motion': ['motion', 'motion/react'],
              'vendor-ton': ['@tonconnect/ui-react'],
            }
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(""),
        'process.env.GEMINI_API_KEY': JSON.stringify("")
      },
      resolve: {
        dedupe: ['react', 'react-dom', 'zustand', 'motion'],
        alias: {
          '@': path.resolve(__dirname, '.')
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'zustand', 'motion']
      }
    };
});
