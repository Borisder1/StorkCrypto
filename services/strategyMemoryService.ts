import { supabase, getDeviceId } from './supabaseClient';
import { TradingSignal } from '../types';

export interface SavedSignal extends TradingSignal {
    id: string;
    status: 'PENDING' | 'WIN' | 'LOSS';
    createdAt: number;
    resolvedAt?: number;
    userId: string;
}

const LOCAL_STORAGE_KEY = 'stork_ai_memory';

export const strategyMemoryService = {
    /**
     * Save a newly generated signal to memory (Supabase + Local Fallback)
     */
    async saveSignal(signal: TradingSignal): Promise<void> {
        const userId = getDeviceId();
        const newSignal: SavedSignal = {
            ...signal,
            id: crypto.randomUUID(),
            status: 'PENDING',
            createdAt: Date.now(),
            userId
        };

        // 1. Try Supabase
        try {
            const { error } = await supabase.from('ai_signals').insert([newSignal]);
            if (error) throw error;
        } catch (e) {
            console.warn('[Memory] Supabase save failed, using local storage', e);
            // 2. Local Fallback
            const local = this.getLocalSignals();
            local.push(newSignal);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
        }
    },

    /**
     * Evaluate pending signals against current market prices
     */
    async evaluatePendingSignals(currentPrices: Record<string, number>): Promise<void> {
        const userId = getDeviceId();
        let pendingSignals: SavedSignal[] = [];

        // 1. Fetch from Supabase
        try {
            const { data, error } = await supabase
                .from('ai_signals')
                .select('*')
                .eq('userId', userId)
                .eq('status', 'PENDING');
            
            if (error) throw error;
            pendingSignals = data || [];
        } catch (e) {
            // 2. Local Fallback
            pendingSignals = this.getLocalSignals().filter(s => s.status === 'PENDING');
        }

        if (pendingSignals.length === 0) return;

        const updates: SavedSignal[] = [];

        for (const signal of pendingSignals) {
            const currentPrice = currentPrices[signal.asset];
            if (!currentPrice) continue;

            let newStatus: 'WIN' | 'LOSS' | 'PENDING' = 'PENDING';

            if (signal.signal_type === 'LONG') {
                if (currentPrice >= signal.takeProfit) newStatus = 'WIN';
                else if (currentPrice <= signal.stopLoss) newStatus = 'LOSS';
            } else {
                if (currentPrice <= signal.takeProfit) newStatus = 'WIN';
                else if (currentPrice >= signal.stopLoss) newStatus = 'LOSS';
            }

            // Check expiration (e.g., 24 hours)
            if (newStatus === 'PENDING' && Date.now() - signal.createdAt > 86400000) {
                newStatus = 'LOSS'; // Expired without hitting TP
            }

            if (newStatus !== 'PENDING') {
                updates.push({ ...signal, status: newStatus, resolvedAt: Date.now() });
            }
        }

        if (updates.length === 0) return;

        // Save updates
        try {
            for (const update of updates) {
                await supabase.from('ai_signals').update({ 
                    status: update.status, 
                    resolvedAt: update.resolvedAt 
                }).eq('id', update.id);
            }
        } catch (e) {
            const local = this.getLocalSignals();
            const updatedLocal = local.map(l => {
                const match = updates.find(u => u.id === l.id);
                return match ? match : l;
            });
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocal));
        }
    },

    /**
     * Get strategy performance metrics to feed back into the AI prompt
     */
    async getStrategyPerformance(): Promise<string> {
        const stats = await this.getStrategyStats();
        if (Object.keys(stats).length === 0) return "No historical data available yet.";

        let report = "Historical Strategy Performance:\n";
        for (const [key, data] of Object.entries(stats) as [string, {wins: number, total: number}][]) {
            const winRate = ((data.wins / data.total) * 100).toFixed(1);
            report += `- ${key}: ${winRate}% win rate (${data.wins}/${data.total})\n`;
        }

        return report;
    },

    async getStrategyStats(): Promise<Record<string, { wins: number, total: number }>> {
        const userId = getDeviceId();
        let signals: SavedSignal[] = [];

        try {
            const { data, error } = await supabase
                .from('ai_signals')
                .select('*')
                .eq('userId', userId)
                .neq('status', 'PENDING');
            if (error) throw error;
            signals = data || [];
        } catch (e) {
            signals = this.getLocalSignals().filter(s => s.status !== 'PENDING');
        }

        if (signals.length === 0) return {};

        return signals.reduce((acc, sig) => {
            const key = `${sig.asset}_${sig.strategy_type}`;
            if (!acc[key]) acc[key] = { wins: 0, total: 0 };
            acc[key].total++;
            if (sig.status === 'WIN') acc[key].wins++;
            return acc;
        }, {} as Record<string, { wins: number, total: number }>);
    },

    getLocalSignals(): SavedSignal[] {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }
};
