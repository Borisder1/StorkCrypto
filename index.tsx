import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

console.log("[System] Booting Neural Terminal...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("[System] Critical Failure: Root mount point not found!");
} else {
    // ⚡ CRITICAL FIX: Always use the hosted manifest to prevent [TON_CONNECT_SDK] Failed to fetch.
    // Localhost or file:// URLs cannot be reached by external wallets (Tonkeeper).
    const MANIFEST_URL = 'https://storkcrypto.borishanter12.workers.dev/tonconnect-manifest.json';

    console.log("[System] Using Manifest:", MANIFEST_URL);

    try {
        const root = ReactDOM.createRoot(rootElement);
        
        root.render(
          <ErrorBoundary>
            <TonConnectUIProvider 
                manifestUrl={MANIFEST_URL}
                actionsConfiguration={{
                    twaReturnUrl: 'https://t.me/StorkCryptoBot/app'
                }}
            >
              <App />
            </TonConnectUIProvider>
          </ErrorBoundary>
        );
        console.log("[System] React Application Mounted.");
    } catch (error: any) {
        console.error("[System] Critical Mount Error:", error);
        rootElement.innerHTML = `<div style="color:red; padding:20px; font-family:monospace; background:black; height:100vh; display:flex; align-items:center; justify-content:center; text-align:center;">CRITICAL MOUNT ERROR:<br/>${error.message || 'Unknown Error'}</div>`;
    }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}