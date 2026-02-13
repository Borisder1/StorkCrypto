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
        { name: 'stork-storage-v9' } // Версія v9: Фінальне загартування, Синдикат та ВЧ-Аналітика
    )
);