import { supabase, getDeviceId } from './supabaseClient';
import { TradingSignal } from '../types';

export interface SavedSignal extends TradingSignal {
    id: string;
    status: 'PENDING' | 'WIN' | 'LOSS';
    createdAt: number;
    resolvedAt?: number;
    userId?: string;
}

const LOCAL_STORAGE_KEY = 'stork_ai_memory';
const MAX_LOCAL_ENTRIES = 20;
const MAX_LOCAL_BYTES = 16 * 1024; // 16 KB bound
const SIGNAL_TTL_MS = 24 * 60 * 60 * 1000; // 24h TTL

const sanitizeText = (str?: string, maxLen = 200): string => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/gm, '').trim().slice(0, maxLen);
};

export const strategyMemoryService = {
    /**
     * Save a newly generated signal to memory (Supabase + Local Fallback)
     */
    async saveSignal(signal: TradingSignal): Promise<void> {
        const userId = getDeviceId();
        const newSignal: SavedSignal = {
            ...signal,
            technical_summary: sanitizeText(signal.technical_summary, 250),
            reasoning_chain: Array.isArray(signal.reasoning_chain) 
                ? signal.reasoning_chain.map(r => sanitizeText(r, 120)).slice(0, 5) 
                : [],
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
            console.warn('[Memory] Supabase save failed, using bounded local storage');
            // 2. Local Fallback with strict bounds & no client PII
            const local = this.getLocalSignals();
            // Don't store persistent user ID in local browser storage
            const sanitizedLocalSignal: SavedSignal = { ...newSignal, userId: undefined };
            local.unshift(sanitizedLocalSignal);

            this.persistBoundedLocal(local);
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

            // Check expiration (24 hours TTL)
            if (newStatus === 'PENDING' && Date.now() - signal.createdAt > SIGNAL_TTL_MS) {
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
            this.persistBoundedLocal(updatedLocal);
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

    /**
     * Read local signals with automatic TTL pruning and size migration
     */
    getLocalSignals(): SavedSignal[] {
        if (typeof window === 'undefined' || !window.localStorage) return [];
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];

            const now = Date.now();
            // Prune expired signals (24h TTL) and bounded to MAX_LOCAL_ENTRIES
            const valid = parsed
                .filter(s => s && typeof s.createdAt === 'number' && (now - s.createdAt < SIGNAL_TTL_MS))
                .slice(0, MAX_LOCAL_ENTRIES);

            // If pruning changed length or old entries were cleaned, sync back
            if (valid.length !== parsed.length || raw.length > MAX_LOCAL_BYTES) {
                this.persistBoundedLocal(valid);
            }

            return valid;
        } catch {
            return [];
        }
    },

    /**
     * Persist array to localStorage respecting byte size and max entries
     */
    persistBoundedLocal(signals: SavedSignal[]): void {
        if (typeof window === 'undefined' || !window.localStorage) return;
        try {
            let bounded = signals.slice(0, MAX_LOCAL_ENTRIES);
            let json = JSON.stringify(bounded);

            while (json.length > MAX_LOCAL_BYTES && bounded.length > 1) {
                bounded.pop();
                json = JSON.stringify(bounded);
            }

            localStorage.setItem(LOCAL_STORAGE_KEY, json);
        } catch (e) {
            console.warn('[Memory] Failed to persist local storage memory', e);
        }
    },

    /**
     * Complete wipe of sensitive trading signals on logout or user reset
     */
    clearMemory(): void {
        if (typeof window === 'undefined' || !window.localStorage) return;
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (_) {}
    }
};
