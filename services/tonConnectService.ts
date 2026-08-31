import { TonConnectUI } from '@tonconnect/ui';

let tonConnectUIInstance: TonConnectUI | null = null;

export const getTonConnectUI = (): TonConnectUI | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    
    if (!tonConnectUIInstance) {
        try {
            const manifestUrl = window.location.origin + '/tonconnect-manifest.json';
            tonConnectUIInstance = new TonConnectUI({
                manifestUrl,
                actionsConfiguration: {
                    twaReturnUrl: 'https://t.me/StorkCryptoBot/app'
                }
            });
        } catch (e) {
            console.warn('[TON Connect] Initialization deferred or suppressed:', e);
            return null;
        }
    }
    
    return tonConnectUIInstance;
};
