
import React, { useState, useEffect } from 'react';
import { BotIcon, ActivityIcon, TrendingUpIcon } from './icons';
import { generateProactiveInsight } from '../services/geminiService';
import { triggerHaptic } from '../utils/haptics';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { HelpIndicator } from './HelpIndicator';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export const AIMarketSummary: React.FC = () => {
    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);

    const [summary, setSummary] = useState<string>('insight.initializing');
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<{val: number}[]>([]);

    useEffect(() => {
        // Generate dummy sparkline data
        const data = Array.from({length: 20}, () => ({ val: 50 + Math.random() * 50 }));
        setChartData(data);

        const fetchSummary = async () => {
            try {
                const insight = await generateProactiveInsight(['BTC', 'ETH', 'SOL']);
                if (insight && insight.text) {
                    setSummary(insight.text);
                } else {
                    setSummary('insight.stable');
                }
            } catch (e) {
                setSummary('insight.stable');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
        const interval = setInterval(fetchSummary, 300000); // Every 5 mins
        return () => clearInterval(interval);
    }, []);

    // Helper to format/translate default backdrops
    const renderSummary = () => {
        if (loading) {
            return t('summary.decrypting');
        }
        if (summary === 'insight.stable' || summary === 'insight.initializing') {
            return t('insight.stable');
        }
        return summary;
    };

    return (
        <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-4 mb-6 flex items-start gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 blur-2xl rounded-full -mr-10 -mt-10"></div>
            
            {/* Background Sparkline */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="val" stroke="#00d9ff" fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="w-6 h-6 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center shrink-0 mt-0.5 relative z-10">
                <BotIcon className={`w-3.5 h-3.5 text-brand-cyan ${loading ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black text-brand-cyan uppercase tracking-widest font-orbitron">
                            {t('insight.title') || 'Neural_Summary'}
                        </span>
                        <HelpIndicator id="ai_market_summary" />
                    </div>
                    <div className="flex items-center gap-1">
                        <ActivityIcon className="w-2 h-2 text-brand-green animate-pulse" />
                        <span className="text-[7px] text-brand-green font-mono uppercase">
                            {t('upgrade.live') || 'LIVE'}
                        </span>
                    </div>
                </div>
                <p className="text-[10px] text-slate-300 font-mono leading-relaxed italic">
                    {renderSummary()}
                </p>
            </div>
        </div>
    );
};
