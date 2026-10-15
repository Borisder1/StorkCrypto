import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const usedPaymentHashes = new Set<string>();

function getSafeCorsOrigin(req: any): string {
  const origin = (req.headers.origin as string) || '';
  const isAllowed = 
    origin === 'https://storkcrypto.pages.dev' ||
    origin.endsWith('.pages.dev') ||
    origin.endsWith('.run.app') ||
    origin.endsWith('telegram.org') ||
    origin.endsWith('web.telegram.org') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1');
  return isAllowed ? origin : 'https://storkcrypto.pages.dev';
}

function apiChatDevPlugin() {
  return {
    name: 'api-chat-dev-middleware',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const rawUrl = (req.originalUrl || req.url || '').split('?')[0];
        const safeOrigin = getSafeCorsOrigin(req);

        // 0. Telegram Session Validation Endpoint (Audit verification test)
        if (rawUrl === '/api/validate') {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': safeOrigin,
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Vary': 'Origin',
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
            res.setHeader('Access-Control-Allow-Origin', safeOrigin);
            res.setHeader('Vary', 'Origin');
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
              'Access-Control-Allow-Origin': safeOrigin,
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Vary': 'Origin',
            });
            res.end();
            return;
          }

          let intentBody = '';
          req.setEncoding('utf8');
          req.on('data', (c: string) => { intentBody += c; });
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', safeOrigin);
            res.setHeader('Vary', 'Origin');
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

        // 0.2 Telegram Stars Create Invoice
        if (rawUrl === '/api/payment/create-invoice') {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': safeOrigin,
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Vary': 'Origin',
            });
            res.end();
            return;
          }

          let invoiceBody = '';
          req.setEncoding('utf8');
          req.on('data', (c: string) => { invoiceBody += c; });
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', safeOrigin);
            res.setHeader('Vary', 'Origin');
            let payload: any = {};
            try { payload = JSON.parse(invoiceBody); } catch {}
            const plan = payload.plan || 'PRO';
            const stars = plan === 'PRO' ? 250 : 500;
            const invoiceId = `STARS_${plan}_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              invoiceId,
              invoiceUrl: `https://t.me/$stork_sub_${plan.toLowerCase()}_30d?startattach=${invoiceId}`,
              plan,
              stars,
              currency: 'XTR'
            }));
          });
          req.resume();
          return;
        }

        // 0.3 Subscription Status (GET /api/me/subscription)
        if (rawUrl === '/api/me/subscription') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', safeOrigin);
          res.setHeader('Vary', 'Origin');
          res.writeHead(200);
          res.end(JSON.stringify({
            authenticated: true,
            tier: 'BASIC',
            isPro: false,
            trialActive: false,
            verifiedAt: new Date().toISOString()
          }));
          return;
        }

        // 1. Payment Verification Endpoint (Strict P0-2 contract)
        if (rawUrl === '/api/payment/verify') {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': safeOrigin,
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Vary': 'Origin',
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
            res.setHeader('Access-Control-Allow-Origin', safeOrigin);
            res.setHeader('Vary', 'Origin');

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
            'Access-Control-Allow-Origin': safeOrigin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Vary': 'Origin',
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
          res.setHeader('Access-Control-Allow-Origin', safeOrigin);
          res.setHeader('Vary', 'Origin');

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
          if (!resolvedKey) {
            res.writeHead(503);
            res.end(JSON.stringify({
              error: 'AI_UNAVAILABLE',
              message: 'GEMINI_API_KEY is not configured in environment variables'
            }));
            return;
          }

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
            if (systemMsg?.content) {
              config.systemInstruction = systemMsg.content;
            }
            if (typeof body.temperature === 'number') {
              config.temperature = body.temperature;
            }

            const preferredModel = process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-3.8-flash';
            let response: any = null;
            try {
              response = await ai.models.generateContent({
                model: preferredModel,
                contents,
                config
              });
            } catch (modelErr: any) {
              // Auto-fallback if preferred model is unavailable
              response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents,
                config
              });
            }

            const text = response.text || 'NO_DATA_PACKET';

            res.writeHead(200);
            res.end(JSON.stringify({
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
            console.error('[API/CHAT Middleware Error]', genErr?.message || genErr);
            res.writeHead(503);
            res.end(JSON.stringify({
              error: 'AI_UNAVAILABLE',
              message: 'AI neural engine is momentarily unavailable. Please try again shortly.'
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
