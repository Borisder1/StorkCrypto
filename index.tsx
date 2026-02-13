import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

console.log("[System] Booting Neural Terminal...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("[System] Critical Failure: Root mount point not found!");
} else {
    // Автоматичне визначення URL маніфесту на поточному хості
    const MANIFEST_URL = `${window.location.origin}/tonconnect-manifest.json`;

    try {
        const root = ReactDOM.createRoot(rootElement);
        
        root.render(
          <ErrorBoundary>
            <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
              <App />
            </TonConnectUIProvider>
          </ErrorBoundary>
        );
        console.log("[System] React Application Mounted.");
    } catch (error) {
        console.error("[System] Critical Mount Error:", error);
        rootElement.innerHTML = `<div style="color:red; padding:20px; font-family:monospace; background:black; height:100vh; display:flex; align-items:center; justify-content:center; text-align:center;">CRITICAL MOUNT ERROR:<br/>${error.message}</div>`;
    }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}