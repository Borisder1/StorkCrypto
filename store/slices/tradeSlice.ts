import { StateCreator } from 'zustand';
import { StoreState, TradeSlice, Transaction } from '../../types';
import { walletService, ChainType } from '../../services/walletService';
import { supabase } from '../../services/supabaseClient';

export const createTradeSlice: StateCreator<StoreState, [], [], TradeSlice> = (set, get) => ({
    assets: [],
    addAsset: (asset) => set(state => {
        const existingIndex = state.assets.findIndex(a => a.ticker === asset.ticker);
        if (existingIndex !== -1) {
            const updatedAssets = [...state.assets];
            updatedAssets[existingIndex] = {
                ...updatedAssets[existingIndex],
                amount: asset.amount,
                value: asset.value,
                buyPrice: asset.buyPrice || updatedAssets[existingIndex].buyPrice
            };
            return { assets: updatedAssets };
        }
        return { assets: [...state.assets, { ...asset, volatilityScore: Math.floor(Math.random() * 100) }] };
    }),
    updateAssetPrice: (ticker, price, change) => set(state => {
        const updatedAssets = state.assets.map(a => a.ticker === ticker ? { ...a, value: price * a.amount, change } : a);
        const updatedPositions = state.positions.map(p => {
            if (p.ticker !== ticker) return p;
            
            const pnl = p.side === 'LONG' 
                ? (price - p.entryPrice) * (p.size / p.entryPrice)
                : (p.entryPrice - price) * (p.size / p.entryPrice);
            const roi = (pnl / p.amount) * 100;
            
            return { ...p, currentPrice: price, pnl, roi };
        });
        
        return { assets: updatedAssets, positions: updatedPositions };
    }),
    
    positions: [],
    openPosition: (ticker, side, margin, leverage, price, tp, sl) => {
        const newPosition = {
            id: Math.random().toString(36).substr(2, 9),
            ticker, side, entryPrice: price, currentPrice: price,
            amount: margin, leverage, size: margin * leverage,
            liquidationPrice: side === 'LONG' ? price * (1 - 1/leverage) : price * (1 + 1/leverage),
            openTime: new Date().toISOString(), pnl: 0, roi: 0, tp, sl
        };

        set(state => ({
            positions: [...state.positions, newPosition],
            userStats: { ...state.userStats, demoBalance: state.userStats.demoBalance - margin }
        }));
        
        get().updateQuestProgress('TRADE', 1);
        get().grantXp(10, 'Trade Executed');
    },
    closePosition: (id, currentPrice) => set(state => {
        const position = state.positions.find(p => p.id === id);
        if (!position) return state;
        
        const pnl = position.side === 'LONG' 
            ? (currentPrice - position.entryPrice) * (position.size / position.entryPrice)
            : (position.entryPrice - currentPrice) * (position.size / position.entryPrice);
            
        const finalReturn = position.amount + pnl;
        
        return {
            positions: state.positions.filter(p => p.id !== id),
            userStats: { ...state.userStats, demoBalance: state.userStats.demoBalance + finalReturn }
        };
    }),
    
    wallet: { isConnected: false, address: null, totalValueUsd: 0, isSyncing: false, txHistory: [] },
    
    connectWallet: async (address, walletType, chain) => {
        set(state => ({ 
            wallet: { 
                ...state.wallet, 
                isConnected: true, 
                address, 
                walletType, 
                chain,
                isSyncing: true
            } 
        }));
        
        get().grantXp(100, 'Web3_Handshake');
        await get().syncChainAssets();
    },
    
    disconnectWallet: () => {
        set(state => ({ 
            wallet: { isConnected: false, address: null, totalValueUsd: 0, isSyncing: false, txHistory: [] },
            assets: state.assets.filter(a => !['TON', 'USDT'].includes(a.ticker)) 
        }));
    },
    
    syncChainAssets: async () => {
        const { isConnected, address, chain } = get().wallet;
        if (!isConnected || !address) return;
        
        set(state => ({ wallet: { ...state.wallet, isSyncing: true } }));
        
        try {
            const chainAssets = await walletService.fetchAssetsFromChain(address, chain as ChainType);
            let totalValue = 0;
            
            chainAssets.forEach(ca => {
                totalValue += ca.value;
                get().addAsset({ 
                    name: ca.name, 
                    ticker: ca.ticker, 
                    icon: ca.icon || ca.ticker.toLowerCase(), 
                    amount: ca.amount, 
                    value: ca.value, 
                    change: ca.change || 0, 
                    buyPrice: ca.buyPrice 
                });
            });
            
            set(state => ({ wallet: { ...state.wallet, totalValueUsd: totalValue, isSyncing: false } }));
            get().showToast(`${chain} Assets Synced`);
        } catch (e) {
            console.error(e);
            set(state => ({ wallet: { ...state.wallet, isSyncing: false } }));
            get().showToast('Chain Sync Failed');
        }
    },
    
    swapState: { isOpen: false, fromToken: 'TON', toToken: 'USDT' },
    openSwap: (from, to, amount) => set({ swapState: { isOpen: true, fromToken: from, toToken: to, amount } }),
    closeSwap: () => set({ swapState: { isOpen: false, fromToken: 'TON', toToken: 'USDT', amount: undefined } }),
    executeSwap: async (from: string, to: string, amount: number, toAmount: number) => {
        // Find existing assets to update
        const state = get();
        
        const removeAmount = amount;
        const addAmount = toAmount;
        
        let success = true;
        
        set(s => {
            const newAssets = [...s.assets];
            
            // Deduct fromToken
            const fromIndex = newAssets.findIndex(a => a.ticker === from);
            if (fromIndex !== -1) {
                newAssets[fromIndex] = {
                    ...newAssets[fromIndex],
                    amount: newAssets[fromIndex].amount - removeAmount,
                    value: (newAssets[fromIndex].amount - removeAmount) * (newAssets[fromIndex].value / newAssets[fromIndex].amount) // Keep price same
                };
            } else {
                // If we don't have it, we shouldn't be able to swap, but let's allow it in demo
                // success = false;
            }
            
            // Add toToken
            const toIndex = newAssets.findIndex(a => a.ticker === to);
            if (toIndex !== -1) {
                newAssets[toIndex] = {
                    ...newAssets[toIndex],
                    amount: newAssets[toIndex].amount + addAmount,
                    value: newAssets[toIndex].value + (addAmount * (s.assets.find(x => x.ticker === to)?.buyPrice || 1)) // estimate value addition
                };
            } else {
                 newAssets.push({
                     name: to,
                     ticker: to,
                     amount: addAmount,
                     value: addAmount * 1, // Assume $1 for demo if unknown
                     icon: to.toLowerCase(),
                     buyPrice: 1,
                     change: 0
                 })
            }
            
            // add to transaction history
            const newTx: Transaction = {
                id: Date.now().toString(),
                type: 'RECEIVE', // SWAP
                asset: to,
                amount: addAmount,
                status: 'CONFIRMED',
                timestamp: new Date().toISOString(),
                hash: 'SIMULATED_SWAP_' + Date.now()
            };
            
            return {
                assets: newAssets,
                wallet: {
                    ...s.wallet,
                    txHistory: [newTx, ...s.wallet.txHistory]
                }
            };
        });

        if (success) {
            get().updateQuestProgress('TRADE', 1);
        }
        
        return { success };
    },
});