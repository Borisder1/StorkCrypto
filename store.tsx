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
            name: 'stork-storage-v10',
            partialize: (state) => {
                const sanitizedSettings = state.settings ? { ...state.settings } : undefined;
                if (sanitizedSettings && 'adminTreasuryWallet' in sanitizedSettings) {
                    delete (sanitizedSettings as any).adminTreasuryWallet;
                }
                // Never persist untrusted ADMIN role in localStorage
                const safeStats = state.userStats ? {
                    ...state.userStats,
                    role: state.userStats.role === 'ADMIN' ? 'USER' : state.userStats.role
                } : state.userStats;

                return {
                    userStats: safeStats,
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
            onRehydrateStorage: () => (state) => {
                // Defense against DevTools / localStorage privilege escalation:
                // Untrusted local storage can NEVER grant ADMIN rights
                if (state && state.userStats) {
                    if (state.userStats.role === 'ADMIN') {
                        state.userStats.role = 'USER';
                    }
                }
                // Purge legacy storage versions and sensitive data on client load
                if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                        window.localStorage.removeItem('stork-storage-v9');
                        window.localStorage.removeItem('stork-storage-v8');
                    } catch {}
                }
            }
        } // Версія v10: Zero-trust LocalStorage з блокуванням підробки ролей і purge застарілих схем
    )
);