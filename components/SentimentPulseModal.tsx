import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { BrainIcon, SparklesIcon, TelegramIcon, ActivityIcon, BellIcon, ChevronRightIcon, TrendingUpIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';

interface SentimentPulseModalProps {
    onClose: () => void;
}

export const SentimentPulseModal: React.FC<SentimentPulseModalProps> = ({ onClose }) => {
    const { settings, showToast, grantXp } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '24H' | '7D'>('24H');
    const [overallScore, setOverallScore] = useState<number>(76); // 0 - 100
    const [alertThreshold, setAlertThreshold] = useState<number>(80);

    const channels = [
        { name: 'Telegram Alpha Channels', score: 82, trend: '+12%', label: 'Extreme Bullish' },
        { name: 'X (Twitter) Crypto Sentiment', score: 74, trend: '+5%', label: 'Bullish Surge' },
        { name: 'Reddit & Forum Velocity', score: 68, trend: '+8%', label: 'Moderate Greed' },
        { name: 'On-Chain Fear & Greed', score: 78, trend: '+3%', label: 'Greed Zone' },
    ];

    const trendingTopics = [
        { tag: '#TON_Ecosystem_Fund', mentions: '42.8K', sentiment: '88% Positive', heat: 'High' },
        { tag: '#Bitcoin_ETF_Inflows', mentions: '128.4K', sentiment: '92% Positive', heat: 'Titan' },
        { tag: '#Solana_DeFi_Breakout', mentions: '35.1K', sentiment: '64% Neutral', heat: 'Moderate' },
        { tag: '#Fed_Interest_Rate', mentions: '89.2K', sentiment: '71% Positive', heat: 'High' },
    ];

    const handleSetAlert = () => {
        triggerHaptic('success');
        grantXp(20, 'Set Sentiment Alert');
        showToast(`Alert Set: Notify when Sentiment Index > ${alertThreshold}`);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
        >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative z-10 w-full max-w-xl bg-brand-bg border border-brand-cyan/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(0,217,255,0.25)] my-auto max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-brand-cyan/20 via-brand-card to-brand-bg border-b border-white/10 relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(0,217,255,0.4)]">
                        <BrainIcon className="w-6 h-6 text-brand-cyan" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-[10px] font-orbitron font-black uppercase mb-2">
                        <SparklesIcon className="w-3 h-3" /> {t('sentiment.badge')}
                    </div>
                    <h2 className="font-orbitron font-black text-xl text-white">{t('sentiment.title')}</h2>
                    <p className="text-slate-400 text-xs font-space-mono">{t('sentiment.subtitle')}</p>
                </div>

                {/* Main Content */}
                <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
                    {/* Gauge Card */}
                    <div className="bg-black/50 border border-brand-cyan/30 p-5 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest mb-2">
                            {t('sentiment.score_label')}
                        </p>
                        <div className="text-4xl font-black font-orbitron text-brand-cyan drop-shadow-[0_0_15px_rgba(0,217,255,0.6)]">
                            {overallScore} <span className="text-xs text-brand-green font-mono">/ 100</span>
                        </div>
                        <p className="text-xs font-orbitron font-black text-brand-green uppercase mt-1 px-3 py-1 bg-brand-green/10 border border-brand-green/30 rounded-full">
                            🔥 EXTREME GREED & VIRAL ACCUMULATION
                        </p>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mt-4 p-0.5 border border-white/15">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${overallScore}%` }}
                                transition={{ duration: 1 }}
                                className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-brand-cyan to-brand-green"
                            />
                        </div>
                    </div>

                    {/* Channels Breakdown */}
                    <div>
                        <h4 className="text-xs font-orbitron font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4 text-brand-cyan" />
                            {t('sentiment.channel_breakdown')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {channels.map((ch, i) => (
                                <div key={i} className="bg-brand-card/80 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-mono font-bold text-slate-300">{ch.name}</span>
                                        <span className="text-[9px] font-mono text-brand-green font-bold">{ch.trend}</span>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-lg font-orbitron font-black text-white">{ch.score}</span>
                                        <span className="text-[9px] font-orbitron font-bold text-brand-cyan px-2 py-0.5 rounded bg-brand-cyan/15 border border-brand-cyan/20">
                                            {ch.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trending Topics */}
                    <div>
                        <h4 className="text-xs font-orbitron font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                            <TrendingUpIcon className="w-4 h-4 text-brand-purple" />
                            {t('sentiment.trending_topics')}
                        </h4>
                        <div className="space-y-2">
                            {trendingTopics.map((top, idx) => (
                                <div key={idx} className="bg-black/40 border border-white/10 p-3 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold font-mono text-brand-cyan">{top.tag}</p>
                                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">Mentions: {top.mentions}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-orbitron font-bold text-brand-green block">{top.sentiment}</span>
                                        <span className="text-[8px] font-mono text-slate-500 uppercase">{top.heat} Heat</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alert Control */}
                    <div className="bg-brand-card border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <BellIcon className="w-5 h-5 text-brand-cyan shrink-0" />
                            <div>
                                <p className="text-xs font-orbitron font-bold text-white">Sentiment Spike Alert</p>
                                <p className="text-[9px] text-slate-400 font-mono">Notify when Index &gt; {alertThreshold}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleSetAlert}
                            className="px-4 py-2 rounded-xl bg-brand-cyan text-black font-orbitron font-black text-xs uppercase hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,217,255,0.3)] shrink-0"
                        >
                            {t('sentiment.set_alert')}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SentimentPulseModal;
