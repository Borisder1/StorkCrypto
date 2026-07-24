import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { RadarIcon, ShieldIcon, ActivityIcon, BotIcon, ChevronRightIcon, SparklesIcon, FilterIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';

interface WhaleRadarProModalProps {
    onClose: () => void;
}

export const WhaleRadarProModal: React.FC<WhaleRadarProModalProps> = ({ onClose }) => {
    const { settings, showToast, grantXp } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    const [minThresholdUsd, setMinThresholdUsd] = useState<number>(100000);
    const [selectedAsset, setSelectedAsset] = useState<string>('ALL');
    const [autoAlerts, setAutoAlerts] = useState<boolean>(true);

    const [whaleFeed, setWhaleFeed] = useState([
        {
            id: 'w-1',
            asset: 'TON',
            amount: '850,000',
            valueUsd: 5950000,
            from: 'TON_Foundation_Reserve',
            to: 'Binance_Hot_Wallet',
            type: 'LIQUIDITY_INFLOW',
            aiRating: 'BULLISH_ACCUMULATION',
            timestamp: '2 mins ago',
            whaleLabel: 'Mega Whale (Rank #4)'
        },
        {
            id: 'w-2',
            asset: 'BTC',
            amount: '124.5',
            valueUsd: 8380000,
            from: 'Coinbase_Prime',
            to: 'Anonymous_Cold_Vault',
            type: 'OUTFLOW_HOLDING',
            aiRating: 'STRONG_BUY_SIGNAL',
            timestamp: '5 mins ago',
            whaleLabel: 'Institutional OTC'
        },
        {
            id: 'w-3',
            asset: 'ETH',
            amount: '1,450',
            valueUsd: 5075000,
            from: 'Jump_Trading_Execution',
            to: 'Uniswap_v3_Pool',
            type: 'DEX_DUMP_RISK',
            aiRating: 'BEARISH_DISTRIBUTION',
            timestamp: '11 mins ago',
            whaleLabel: 'Market Maker'
        },
        {
            id: 'w-4',
            asset: 'SOL',
            amount: '35,000',
            valueUsd: 4900000,
            from: 'Kraken_Exchange',
            to: 'Solana_Staking_Vault',
            type: 'STAKING_LOCKUP',
            aiRating: 'LONG_TERM_BULL',
            timestamp: '18 mins ago',
            whaleLabel: 'DeFi Fund'
        }
    ]);

    const filteredWhales = whaleFeed.filter(w => {
        if (selectedAsset !== 'ALL' && w.asset !== selectedAsset) return false;
        if (w.valueUsd < minThresholdUsd) return false;
        return true;
    });

    const handleCopyWhaleMove = (whale: typeof whaleFeed[0]) => {
        triggerHaptic('success');
        grantXp(25, 'Copied Whale Movement');
        showToast(`Tracking & Copying Whale: ${whale.whaleLabel}`);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
        >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative z-10 w-full max-w-xl bg-brand-bg border border-brand-purple/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.25)] my-auto max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-brand-purple/20 via-brand-card to-brand-bg border-b border-white/10 relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                        <RadarIcon className="w-6 h-6 text-brand-purple animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-[10px] font-orbitron font-black uppercase mb-2">
                        <SparklesIcon className="w-3 h-3" /> {t('whaleradar.badge')}
                    </div>
                    <h2 className="font-orbitron font-black text-xl text-white">{t('whaleradar.title')}</h2>
                    <p className="text-slate-400 text-xs font-space-mono">{t('whaleradar.subtitle')}</p>
                </div>

                {/* Filters & Control Bar */}
                <div className="p-4 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase">{t('whaleradar.asset')}:</span>
                        {['ALL', 'TON', 'BTC', 'ETH', 'SOL'].map(a => (
                            <button 
                                key={a}
                                onClick={() => { triggerHaptic('selection'); setSelectedAsset(a); }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${selectedAsset === a ? 'bg-brand-purple text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase">Min Block:</span>
                        <select 
                            value={minThresholdUsd}
                            onChange={(e) => setMinThresholdUsd(Number(e.target.value))}
                            className="bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-[10px] font-mono text-brand-cyan outline-none font-bold"
                        >
                            <option value={100000}>$100K+</option>
                            <option value={500000}>$500K+</option>
                            <option value={1000000}>$1M+ (Mega)</option>
                            <option value={5000000}>$5M+ (Titan)</option>
                        </select>
                    </div>
                </div>

                {/* Feed List */}
                <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
                    {filteredWhales.map(w => (
                        <div key={w.id} className="bg-brand-card/80 border border-white/10 rounded-2xl p-4 hover:border-brand-purple/40 transition-all space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-[10px] font-mono font-bold">
                                        {w.asset}
                                    </span>
                                    <span className="text-white font-orbitron font-bold text-sm">
                                        {w.amount} {w.asset}
                                    </span>
                                    <span className="text-brand-cyan text-xs font-mono font-bold">
                                        (${(w.valueUsd / 1000000).toFixed(2)}M)
                                    </span>
                                </div>
                                <span className="text-[9px] text-slate-500 font-mono">{w.timestamp}</span>
                            </div>

                            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/5">
                                <span className="truncate max-w-[120px]">{w.from}</span>
                                <ChevronRightIcon className="w-3 h-3 text-brand-purple" />
                                <span className="truncate max-w-[120px] text-slate-300">{w.to}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-orbitron font-bold px-2 py-0.5 rounded ${w.aiRating.includes('BULL') || w.aiRating.includes('BUY') ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' : 'bg-brand-danger/20 text-brand-danger border border-brand-danger/30'}`}>
                                        {w.aiRating}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{w.whaleLabel}</span>
                                </div>
                                <button 
                                    onClick={() => handleCopyWhaleMove(w)}
                                    className="px-3 py-1.5 rounded-lg bg-brand-purple/20 border border-brand-purple/40 text-brand-purple text-[10px] font-orbitron font-bold hover:bg-brand-purple/30 transition-all flex items-center gap-1"
                                >
                                    ⚡ Copy Move
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default WhaleRadarProModal;
