import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Suppress TON Connect SDK errors that commonly occur in sandbox/iframe environments
const shouldSuppressError = (msg: string) => {
    return (
        msg.includes('TonConnect') ||
        msg.includes('TON_CONNECT_SDK') ||
        msg.includes('Bridge error') ||
        msg.includes('Failed to dispose') ||
        msg.includes('dispose the resource') ||
        msg.includes('_TonConnectError') ||
        msg.includes('unpause') ||
        msg.includes('Operation aborted') ||
        msg.includes('isTrusted')
    );
};

// Monkey-patch console.error to filter out sandbox TON Connect SDK error outputs
const originalConsoleError = console.error;
console.error = function (...args: any[]) {
    const serialized = args.map(arg => {
        try {
            return typeof arg === 'string' ? arg : JSON.stringify(arg);
        } catch (e) {
            return String(arg);
        }
    }).join(' ');

    if (shouldSuppressError(serialized)) {
        return;
    }
    originalConsoleError.apply(console, args);
};

// Monkey-patch console.warn to filter out sandbox TON Connect SDK warning outputs
const originalConsoleWarn = console.warn;
console.warn = function (...args: any[]) {
    const serialized = args.map(arg => {
        try {
            return typeof arg === 'string' ? arg : JSON.stringify(arg);
        } catch (e) {
            return String(arg);
        }
    }).join(' ');

    if (shouldSuppressError(serialized)) {
        return;
    }
    originalConsoleWarn.apply(console, args);
};

window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason && (
        String(reason).includes('TonConnect') || 
        String(reason).includes('TON_CONNECT_SDK') || 
        String(reason.message).includes('TonConnect') ||
        String(reason.message).includes('Bridge error') ||
        String(reason.message).includes('dispose') ||
        String(reason.message).includes('unpause')
    )) {
        event.preventDefault();
        event.stopPropagation();
    }
}, true);

window.addEventListener('error', (event) => {
    const error = event.error;
    const msg = event.message || '';
    if (msg.includes('TonConnect') || msg.includes('TON_CONNECT_SDK') || msg.includes('Bridge error') || 
        (error && (
            String(error).includes('TonConnect') || 
            String(error.message).includes('Bridge error') ||
            String(error.message).includes('dispose') ||
            String(error.message).includes('unpause')
        ))
    ) {
        event.preventDefault();
        event.stopPropagation();
    }
}, true);

console.log("[System] Booting Neural Terminal...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("[System] Critical Failure: Root mount point not found!");
} else {
    // ⚡ CRITICAL FIX: Always use a dynamic manifest URL to prevent [TON_CONNECT_SDK] App Manifest Validation Error.
    // The manifest URL origin MUST match the window.location.origin where the app is running.
    const MANIFEST_URL = window.location.origin + '/tonconnect-manifest.json';

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