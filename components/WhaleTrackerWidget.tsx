
import React, { useState, useEffect, useRef } from 'react';
import { type WhaleTransaction } from '../types';
import { ShieldIcon, ActivityIcon, BotIcon, RadarIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { binanceWS } from '../services/websocketService';
import { useStore } from '../store';
import WhaleHistoryModal from './WhaleHistoryModal';
import EmptyState from './EmptyState';

const WHALE_THRESHOLD_USD = 100000;

export const WhaleTrackerWidget: React.FC = () => {
    const { addWhaleTransaction, getWhaleStats, userStats, setSubscriptionOpen } = useStore();
    const [recentTxs, setRecentTxs] = useState<WhaleTransaction[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const lastSoundRef = useRef(0);

    const stats = getWhaleStats();
    const isPro = userStats.subscriptionTier !== 'FREE';
    const canAccessHistory = userStats.level >= 15 || isPro;

    useEffect(() => {
        const unsubscribe = binanceWS.subscribeTrades((trade) => {
            const price = parseFloat(trade.p);
            const quantity = parseFloat(trade.q);
            const valueUsd = price * quantity;
            const isBuyerMaker = trade.m;

            if (valueUsd >= WHALE_THRESHOLD_USD) {
                const asset = trade.s.replace('USDT', '');
                const type = isBuyerMaker ? 'EXCHANGE_INFLOW' : 'WHALE_ACCUMULATION';

                const newTx: WhaleTransaction = {
                    id: trade.a.toString(),
                    asset,
                    amount: quantity,
                    valueUsd,
                    from: isBuyerMaker ? 'Whale_Wallet' : 'Exchange_Hot_Wallet',
                    to: isBuyerMaker ? 'Exchange' : 'Whale_Cold_Storage',
                    type,
                    timestamp: new Date(trade.T).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    aiComment: valueUsd > 500000 ? 'INSTITUTIONAL_MEGA_BLOCK' : (isBuyerMaker ? 'Retail Distribution' : 'Heavy Accumulation')
                };

                addWhaleTransaction(newTx);
                setRecentTxs(prev => [newTx, ...prev].slice(0, 3));

                if (valueUsd > 250000 && Date.now() - lastSoundRef.current > 4000) {
                    triggerHaptic('heavy');
                    lastSoundRef.current = Date.now();
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleHistoryClick = () => {
        triggerHaptic('selection');
        if (canAccessHistory) {
            setShowHistory(true);
        } else {
            setSubscriptionOpen(true);
        }
    };

    return (
        <div className="relative mb-5 group">
            {/* Tech Borders */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-cyan/50 box-glow"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-cyan/50 box-glow"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-cyan/50 box-glow"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-cyan/50 box-glow"></div>

            <div className="glass-panel p-5 relative overflow-hidden rounded-xl shadow-2xl border border-white/10 backdrop-blur-md bg-brand-card/20">
                {/* Glassmorphism Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/10 via-transparent to-brand-purple/5 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

                {/* Enhanced Scanning Radar Effect */}
                <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-[radial-gradient(circle,rgba(0,217,255,0.2)_0%,transparent_70%)] animate-[pulse_3s_ease-in-out_infinite] pointer-events-none blur-xl"></div>

                {/* Scanline Animation */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent animate-[scanline_4s_linear_infinite] opacity-60"></div>

                <div className="flex justify-between items-center mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/30 border border-brand-cyan/40 backdrop-blur-sm relative overflow-hidden group/icon">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 to-transparent"></div>
                            <div className="absolute inset-0 bg-brand-cyan/5 animate-pulse"></div>
                            <RadarIcon className="w-5 h-5 text-brand-cyan animate-[spin_4s_linear_infinite] text-glow relative z-10 group-hover/icon:scale-110 transition-transform" />
                            <div className="absolute inset-0 rounded-xl border border-brand-cyan/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"></div>
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm font-orbitron tracking-widest uppercase text-glow flex items-center gap-2">
                                Whale_Radar <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping shadow-[0_0_8px_#00d9ff]"></span>
                            </h3>
                            <p className="text-[10px] text-brand-cyan/80 font-mono uppercase text-glow tracking-wider">
                                Net Flow: <span className={stats.netFlow1h > 0 ? 'text-brand-green drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]' : 'text-brand-danger drop-shadow-[0_0_3px_rgba(248,113,113,0.5)]'}>{stats.netFlow1h > 0 ? '+' : ''}${(stats.netFlow1h / 1000).toFixed(0)}k</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleHistoryClick}
                        className="text-[9px] font-black font-orbitron text-slate-400 hover:text-white uppercase border border-white/10 hover:border-brand-cyan/50 bg-black/20 hover:bg-brand-cyan/10 px-3 py-1.5 rounded transition-all hover:text-glow hover:box-glow backdrop-blur-sm relative overflow-hidden group/button"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent opacity-0 group-hover/button:opacity-100 transition-opacity"></div>
                        <span className="relative z-10">{canAccessHistory ? 'VIEW_LOGS >>' : 'LOCKED [PRO]'}</span>
                    </button>
                </div>

                <div className="space-y-1 relative z-10 min-h-[120px]">
                    {(recentTxs?.length === 0 || !recentTxs) ? (
                        <EmptyState
                            message="СКАНУВАННЯ_МЕМПУЛУ"
                            subMessage="Очікування активності китів..."
                            icon={<RadarIcon className="w-6 h-6 text-brand-cyan/50 animate-spin" />}
                        />
                    ) : (
                        {(Array.isArray(recentTxs) ? recentTxs : []).map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-2.5 hover:bg-white/5 backdrop-blur-sm transition-all border-l-2 border-transparent hover:border-brand-cyan pl-3 group/item rounded-r-lg relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm p-1 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                                        <img src={`https://assets.coincap.io/assets/icons/${tx.asset.toLowerCase()}@2x.png`} className="w-full h-full object-contain grayscale group-hover/item:grayscale-0 transition-all opacity-80 group-hover/item:opacity-100" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-white leading-none font-orbitron tracking-wide group-hover/item:text-brand-cyan transition-colors">{tx.asset}</span>
                                        <span className="text-[9px] text-slate-500 font-mono group-hover/item:text-brand-cyan/70 transition-colors">
                                            {tx.timestamp} <span className="text-slate-600">|</span> <span className="text-[8px] uppercase tracking-wider">{tx.from === 'Whale_Wallet' ? 'WALLET' : 'EXCHANGE'}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <div className={`text-[11px] font-black font-mono tracking-tight ${tx.type === 'EXCHANGE_INFLOW' ? 'text-brand-danger drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]' : 'text-brand-green drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]'}`}>
                                        {tx.type === 'EXCHANGE_INFLOW' ? 'DUMP' : 'PUMP'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono font-bold group-hover/item:text-white transition-colors">${(tx.valueUsd / 1000).toFixed(1)}k</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showHistory && <WhaleHistoryModal onClose={() => setShowHistory(false)} />}
        </div>
    );
};
