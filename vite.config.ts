import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/chat': {
            target: 'https://integrate.api.nvidia.com/v1/chat/completions',
            changeOrigin: true,
            rewrite: (path) => '',
            configure: (proxy, options) => {
              proxy.on('proxyReq', (proxyReq, req, res) => {
                const rawKey = env.VITE_NVIDIA_API_KEY || env.NVIDIA_API_KEY || '';
                const keys = rawKey.split(',').map(k => k.trim()).filter(k => k);
                const key = keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : '';
                proxyReq.setHeader('Authorization', `Bearer ${key}`);
              });
            }
          }
        }
      },
      plugins: [react()],
      build: {
        target: 'esnext',
        chunkSizeWarningLimit: 500,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                return 'vendor-core';
              }
              if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
                return 'vendor-motion';
              }
              if (id.includes('node_modules/@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('node_modules/lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('node_modules/recharts') || id.includes('node_modules/d3') || id.includes('node_modules/chart.js')) {
                return 'vendor-charts';
              }
              if (id.includes('node_modules/@tonconnect')) {
                return 'vendor-ton';
              }
            }
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.API_KEY || process.env.API_KEY || ""),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.API_KEY || process.env.API_KEY || "")
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'react': path.resolve(__dirname, 'node_modules/react'),
          'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        }
      }
    };
});
