import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState } from './types';
import { createAuthSlice } from './store/slices/authSlice';
import { createTradeSlice } from './store/slices/tradeSlice';
import { createAppSlice } from './store/slices/appSlice';

// MAIN STORE ASSEMBLER
// Uses Slice Pattern for better modularity (Architecture Hygiene)
export const useStore = create<StoreState>()(
    persist(
        (...a) => ({
            ...createAuthSlice(...a),
            ...createTradeSlice(...a),
            ...createAppSlice(...a),
        }),
        { 
            name: 'stork-storage-v9',
            partialize: (state) => {
                const sanitizedSettings = state.settings ? { ...state.settings } : undefined;
                if (sanitizedSettings && 'adminTreasuryWallet' in sanitizedSettings) {
                    delete (sanitizedSettings as any).adminTreasuryWallet;
                }
                return {
                    userStats: state.userStats,
                    settings: sanitizedSettings,
                    wallet: state.wallet ? {
                        address: state.wallet.address,
                        isConnected: state.wallet.isConnected,
                        chain: state.wallet.chain,
                        balance: state.wallet.balance,
                        walletType: state.wallet.walletType
                    } : undefined,
                    assets: state.assets,
                    positions: state.positions,
                    customWatchlist: (state as any).customWatchlist,
                    bookmarks: (state as any).bookmarks,
                    tradeHistory: (state as any).tradeHistory,
                    userQuests: (state as any).userQuests,
                    marketRegime: state.marketRegime,
                    telegramBotConnected: state.telegramBotConnected
                };
            },
            onRehydrateStorage: () => () => {
                // Ensure legacy admin keys are purged from local storage on client load
                if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                        const raw = window.localStorage.getItem('stork-storage-v9');
                        if (raw && raw.includes('adminTreasuryWallet')) {
                            const parsed = JSON.parse(raw);
                            if (parsed?.state?.settings?.adminTreasuryWallet) {
                                delete parsed.state.settings.adminTreasuryWallet;
                                window.localStorage.setItem('stork-storage-v9', JSON.stringify(parsed));
                            }
                        }
                    } catch {}
                }
            }
        } // Версія v9: Захищена персистенція без витоку модальних прапорів та адмін-гаманців
    )
);