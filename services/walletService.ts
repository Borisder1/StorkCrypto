
// Real Web3 Wallet Provider Wrapper
import { toUserFriendlyAddress } from '@tonconnect/sdk';
import { tonApiService } from './tonApiService';

export type ChainType = 'ETH' | 'TON' | 'SOL';

interface WalletState {
    isConnected: boolean;
    address: string | null;
    chainId: string | null;
    balance: string;
    chain: ChainType;
    walletName: string | null;
    avatar?: string;
}

export interface TransactionResult {
    success: boolean;
    isSimulation?: boolean;
    message?: string;
    hash?: string;
}

// Simulated delay only for non-TON chains
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const walletService = {
    state: {
        isConnected: false,
        address: null,
        chainId: null,
        balance: '0',
        chain: 'TON',
        walletName: null
    } as WalletState,

    /**
     * Provider Availability Check
     */
    checkProviders() {
        return {
            metamask: typeof window !== 'undefined' && !!(window as any).ethereum,
            phantom: typeof window !== 'undefined' && !!(window as any).phantom?.solana,
            ton: true // TON Connect is always available via HTTP bridge
        };
    },

    /**
     * FETCH ASSETS (Real Indexer Logic via TonAPI)
     */
    async fetchAssetsFromChain(address: string, chain: ChainType) {
        console.log(`[Web3 Indexer] Fetching live data for ${chain}:${address}`);
        
        if (chain === 'TON') {
            try {
                // ⚡ REAL DATA FETCH
                const realAssets = await tonApiService.getRealPortfolio(address);
                
                if (realAssets.length === 0) {
                    // Return at least TON if empty so wallet doesn't look broken
                    return [{
                        ticker: 'TON',
                        name: 'Toncoin',
                        amount: 0,
                        value: 0,
                        icon: 'https://ton.org/download/ton_symbol.png'
                    }];
                }

                // Map to App Asset Format
                return realAssets.map(a => ({
                    ticker: a.ticker,
                    name: a.name,
                    amount: a.amount,
                    buyPrice: a.usdPrice || 0, // Current price as buy price for view
                    value: (a.usdPrice || 0) * a.amount,
                    icon: a.icon,
                    change: a.usdChange || 0 // Pass through 24h change
                }));
            } catch (e) {
                console.error("Failed to fetch real TON data", e);
                // Return fallback on error
                return [{ ticker: 'TON', name: 'Toncoin', amount: 0, value: 0, icon: 'https://ton.org/download/ton_symbol.png' }];
            }
        }

        // Fallback / Mocks for other chains (ETH/SOL not active in Phase 3)
        await delay(1000); 
        return [];
    },

    formatAddress(address: string | null) {
        if (!address) return '';
        try {
            // Basic check if it's a raw TON address (0:...)
            if (address.includes(':')) {
                return toUserFriendlyAddress(address, true).slice(0, 4) + '...' + toUserFriendlyAddress(address, true).slice(-4);
            }
            return `${address.slice(0, 4)}...${address.slice(-4)}`;
        } catch (e) {
            return address.slice(0, 6) + '...';
        }
    },

    // Demo transaction sender simulator (Variant B: explicitly labeled demo simulator)
    async sendTransaction(to: string, amount: string, chain: ChainType): Promise<TransactionResult> {
        console.log(`[Wallet Demo] Simulating vault allocation of ${amount} to ${to} on ${chain}`);
        await delay(1200); 
        return {
            success: true,
            isSimulation: true,
            hash: undefined,
            message: 'DEMO SIMULATION — no blockchain transaction was sent'
        };
    }
};
