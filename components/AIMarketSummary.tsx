
import React, { useState, useEffect } from 'react';
import { BotIcon, ActivityIcon, TrendingUpIcon } from './icons';
import { generateProactiveInsight } from '../services/geminiService';
import { getCryptoPrices } from '../services/priceService';
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
    const [source, setSource] = useState<string>('SYNCING');
    const [chartData, setChartData] = useState<{val: number}[]>([]);

    const getStatusBadge = () => {
        if (settings?.marketOverride === 'PUMP' || settings?.marketOverride === 'DUMP') {
            return {
                label: 'DEMO',
                iconColor: 'text-amber-400',
                textColor: 'text-amber-400'
            };
        }
        if (source === 'CACHE') {
            return {
                label: 'STALE',
                iconColor: 'text-yellow-400',
                textColor: 'text-yellow-400'
            };
        }
        if (source === 'SYNCING') {
            return {
                label: 'SYNCING',
                iconColor: 'text-cyan-400',
                textColor: 'text-cyan-400'
            };
        }
        if (source === 'OFFLINE') {
            return {
                label: 'OFFLINE',
                iconColor: 'text-slate-400',
                textColor: 'text-slate-400'
            };
        }
        return {
            label: 'LIVE',
            iconColor: 'text-brand-green',
            textColor: 'text-brand-green'
        };
    };

    const statusBadge = getStatusBadge();

    useEffect(() => {
        // Generate dummy sparkline data
        const data = Array.from({length: 20}, () => ({ val: 50 + Math.random() * 50 }));
        setChartData(data);

        const fetchSummary = async () => {
            try {
                // Check market data freshness
                try {
                    const prices = await getCryptoPrices();
                    const first = Object.values(prices)[0];
                    setSource(first?.source || 'LIVE');
                } catch {
                    setSource('CACHE');
                }

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
                        <ActivityIcon className={`w-2 h-2 ${statusBadge.iconColor} animate-pulse`} />
                        <span className={`text-[7px] ${statusBadge.textColor} font-mono uppercase font-bold tracking-wider`}>
                            {statusBadge.label}
                        </span>
                    </div>
                </div>
                <p className="text-[10px] text-slate-300 font-mono leading-relaxed italic">
                    {renderSummary()}
                </p>
                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.textColor.replace('text-', 'bg-')} animate-pulse`}></span>
                        <span>Джерело: <strong className="text-slate-300">Binance API · {statusBadge.label === 'LIVE' ? 'Онлайн сокет' : statusBadge.label === 'STALE' ? 'Кеш (затримка)' : statusBadge.label === 'OFFLINE' ? 'Офлайн резерв' : 'Синхронізація'}</strong></span>
                    </div>
                    <span className="text-slate-500">Авто-синхронізація: 30с</span>
                </div>
            </div>
        </div>
    );
};
