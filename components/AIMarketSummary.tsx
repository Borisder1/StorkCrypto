
import React, { useState, useEffect } from 'react';
import { BotIcon, ActivityIcon, TrendingUpIcon } from './icons';
import { generateProactiveInsight } from '../services/geminiService';
import { triggerHaptic } from '../utils/haptics';

export const AIMarketSummary: React.FC = () => {
    const [summary, setSummary] = useState<string>('Initializing neural scan...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const insight = await generateProactiveInsight(['BTC', 'ETH', 'SOL']);
                setSummary(insight.text);
            } catch (e) {
                setSummary('Market pulse stable. Monitoring whale movements.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
        const interval = setInterval(fetchSummary, 300000); // Every 5 mins
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-4 mb-6 flex items-start gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 blur-2xl rounded-full -mr-10 -mt-10"></div>
            <div className="w-8 h-8 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center shrink-0">
                <BotIcon className={`w-5 h-5 text-brand-cyan ${loading ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black text-brand-cyan uppercase tracking-widest font-orbitron">Neural_Summary</span>
                    <div className="flex items-center gap-1">
                        <ActivityIcon className="w-2 h-2 text-brand-green animate-pulse" />
                        <span className="text-[7px] text-brand-green font-mono uppercase">Live</span>
                    </div>
                </div>
                <p className="text-[10px] text-slate-300 font-mono leading-relaxed italic">
                    {loading ? 'Decrypting market signals...' : summary}
                </p>
            </div>
        </div>
    );
};
