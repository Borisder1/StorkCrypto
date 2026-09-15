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
            partialize: (state) => ({
                userStats: state.userStats,
                settings: state.settings,
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
            })
        } // Версія v9: Захищена персистенція без витоку модальних прапорів
    )
);