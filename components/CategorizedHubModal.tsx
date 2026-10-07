import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';
import { 
    RadarIcon, ActivityIcon, PieChartIcon, NewspaperIcon, BotIcon,
    ShieldIcon, ZapIcon, GlobeIcon, WalletIcon, BellIcon, UsersIcon, SparklesIcon,
    TerminalIcon, SearchIcon, AwardIcon
} from './icons';

interface CategorizedHubModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CategorizedHubModal: React.FC<CategorizedHubModalProps> = ({ isOpen, onClose }) => {
    const { 
        settings,
        navigateTo, 
        setShowAirdrop, 
        setShowCalendar, 
        setShowSentinel, 
        setShowWhaleRadar, 
        setShowStrategyBuilder, 
        setShowSentimentPulse, 
        setShowLiquidationHeatmap, 
        setShowTaxCalculator, 
        setShowCompetitorMatrix,
        setSubscriptionOpen,
        setShowReferral,
        setShowLeaderboard,
        setIsAIChatOpen
    } = useStore();

    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen) return null;

    const handleAction = (action: () => void) => {
        triggerHaptic('light');
        action();
        onClose();
    };

    const categories = [
        {
            title: t('hub.cat_ai'),
            items: [
                { name: "AI Trading Signals", icon: <ActivityIcon className="text-brand-cyan" />, desc: t('hub.signals_desc'), action: () => handleAction(() => navigateTo('signals')) },
                { name: "Whale Radar Pro", icon: <RadarIcon className="text-purple-400" />, desc: t('hub.whale_radar_desc'), action: () => handleAction(() => setShowWhaleRadar(true)) },
                { name: "Liquidation Heatmap", icon: <ZapIcon className="text-amber-400" />, desc: t('hub.heatmap_desc'), action: () => handleAction(() => setShowLiquidationHeatmap(true)) },
                { name: "Sentiment Pulse", icon: <SparklesIcon className="text-pink-400" />, desc: t('hub.sentiment_desc'), action: () => handleAction(() => setShowSentimentPulse(true)) },
                { name: "Competitor Matrix", icon: <GlobeIcon className="text-blue-400" />, desc: t('hub.matrix_desc'), action: () => handleAction(() => setShowCompetitorMatrix(true)) },
            ]
        },
        {
            title: t('hub.cat_scanners'),
            items: [
                { name: "Market Scanner", icon: <RadarIcon className="text-brand-green" />, desc: t('hub.scanner_desc'), action: () => handleAction(() => navigateTo('scanner')) },
                { name: "Strategy Builder", icon: <TerminalIcon className="text-amber-300" />, desc: t('hub.strategy_desc'), action: () => handleAction(() => setShowStrategyBuilder(true)) },
                { name: "Crypto Tax Calculator", icon: <PieChartIcon className="text-emerald-400" />, desc: t('hub.tax_desc'), action: () => handleAction(() => setShowTaxCalculator(true)) },
                { name: "Sentinel Security", icon: <ShieldIcon className="text-red-400" />, desc: t('hub.sentinel_desc'), action: () => handleAction(() => setShowSentinel(true)) },
            ]
        },
        {
            title: t('hub.cat_news'),
            items: [
                { name: "Crypto News", icon: <NewspaperIcon className="text-blue-400" />, desc: t('hub.news_desc'), action: () => handleAction(() => navigateTo('news')) },
                { name: "Economic Calendar", icon: <ZapIcon className="text-amber-400" />, desc: t('hub.calendar_desc'), action: () => handleAction(() => setShowCalendar(true)) },
            ]
        },
        {
            title: t('hub.cat_rewards'),
            items: [
                { name: "Airdrop Station", icon: <AwardIcon className="text-amber-300" />, desc: t('hub.airdrop_desc'), action: () => handleAction(() => setShowAirdrop(true)) },
                { name: "Referral Program", icon: <UsersIcon className="text-emerald-400" />, desc: t('hub.referral_desc'), action: () => handleAction(() => setShowReferral(true)) },
                { name: "Leaderboard", icon: <SparklesIcon className="text-yellow-400" />, desc: t('hub.leaderboard_desc'), action: () => handleAction(() => setShowLeaderboard(true)) },
                { name: "PRO Membership", icon: <AwardIcon className="text-purple-400" />, desc: t('hub.pro_desc'), action: () => handleAction(() => setSubscriptionOpen(true)) },
            ]
        }
    ];

    const filteredCategories = categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[40] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
                <motion.div 
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="hub-modal-title"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full max-w-lg bg-[#050b14] border border-white/15 rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center">
                                <ZapIcon className="w-4 h-4 text-brand-cyan" />
                            </div>
                            <div>
                                <h2 id="hub-modal-title" className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                                    {t('hub.title')}
                                </h2>
                                <p className="text-[9px] font-mono text-slate-400 uppercase">
                                    {t('hub.subtitle')}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            aria-label={`Закрити ${t('hub.title')}`}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="p-3 bg-black/20 border-b border-white/5">
                        <div className="relative">
                            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Пошук інструментів"
                                placeholder={t('hub.search_placeholder')}
                                className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-brand-cyan outline-none font-mono"
                            />
                        </div>
                    </div>

                    {/* Categorized List */}
                    <div className="p-4 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                        {filteredCategories.map((cat, idx) => (
                            <div key={idx} className="space-y-2">
                                <h3 className="text-[10px] font-orbitron font-bold uppercase text-brand-cyan tracking-wider flex items-center gap-1.5">
                                    {cat.title}
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {cat.items.map((item, itemIdx) => (
                                        <button
                                            key={itemIdx}
                                            onClick={item.action}
                                            aria-label={`Відкрити ${item.name}: ${item.desc}`}
                                            className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-cyan/40 flex items-center gap-3 transition-all text-left active:scale-[0.98] group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-xs text-white group-hover:text-brand-cyan transition-colors truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-mono truncate">
                                                    {item.desc}
                                                </p>
                                            </div>
                                            <span className="text-slate-500 text-xs font-mono group-hover:translate-x-0.5 transition-transform">→</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
