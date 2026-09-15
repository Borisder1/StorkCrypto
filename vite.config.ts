import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function apiChatDevPlugin(apiKey: string) {
  return {
    name: 'api-chat-dev-middleware',
    configureServer(server: any) {
      server.middlewares.use('/api/chat', async (req: any, res: any, next: any) => {
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
          next();
          return;
        }

        const chunks: Buffer[] = [];
        let totalSize = 0;
        let isTooLarge = false;

        req.on('data', (chunk: Buffer) => {
          totalSize += chunk.length;
          if (totalSize > 65536) {
            isTooLarge = true;
          } else {
            chunks.push(chunk);
          }
        });

        req.on('end', async () => {
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
            const rawBody = Buffer.concat(chunks).toString('utf8');
            body = JSON.parse(rawBody);
          } catch (e) {
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

          const resolvedKey = apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
          if (!resolvedKey) {
            res.writeHead(503);
            res.end(JSON.stringify({
              error: 'AI_SERVICE_UNAVAILABLE',
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

            const response = await ai.models.generateContent({
              model: 'gemini-3.6-flash',
              contents,
              config
            });

            const text = response.text || 'NO_DATA_PACKET';

            res.writeHead(200);
            res.end(JSON.stringify({
              id: 'chatcmpl-' + Math.random().toString(36).substring(2, 12),
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: 'gemini-3.6-flash',
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
            res.writeHead(502);
            res.end(JSON.stringify({
              error: 'UPSTREAM_AI_ERROR',
              message: genErr?.message || 'Upstream AI model generation failed'
            }));
          }
        });
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
      plugins: [react(), apiChatDevPlugin(activeGeminiKey)],
      build: {
        target: 'esnext',
        chunkSizeWarningLimit: 1000
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.API_KEY || process.env.API_KEY || ""),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.API_KEY || process.env.API_KEY || "")
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
