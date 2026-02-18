
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { ShieldIcon, ActivityIcon, ArrowUpRightIcon, ArrowDownLeftIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

import EmptyState from './EmptyState';

const WhaleHistoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    // ПАРТНЕР: Дефолтний пустий масив для whaleHistory
    const { whaleHistory = [], getWhaleStats } = useStore();
    const stats = getWhaleStats ? getWhaleStats() : { buyVolume1h: 0, sellVolume1h: 0, netFlow1h: 0 };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/95 backdrop-blur-xl" onClick={onClose}>
            <div className="bg-brand-bg border-t sm:border border-white/10 rounded-t-[3rem] sm:rounded-[3rem] w-full sm:max-w-md h-[90vh] overflow-hidden flex flex-col shadow-[0_0_80px_rgba(0,217,255,0.1)]" onClick={e => e.stopPropagation()}>

                <div className="p-6 border-b border-white/5 bg-brand-card/50 shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center">
                                <ShieldIcon className="w-6 h-6 text-brand-cyan animate-pulse" />
                            </div>
                            <div>
                                <h2 className="font-orbitron font-black text-lg text-white uppercase tracking-widest leading-none">Whale_Archive</h2>
                                <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">Large Capital Movements Log</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-slate-500 hover:text-white flex items-center justify-center transition-colors">✕</button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-3 text-center">
                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Buy Vol</p>
                            <p className="text-sm font-black text-brand-green font-mono">${(stats.buyVolume1h / 1000).toFixed(0)}k</p>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-3 text-center">
                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Sell Vol</p>
                            <p className="text-sm font-black text-brand-danger font-mono">${(stats.sellVolume1h / 1000).toFixed(0)}k</p>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-3 text-center">
                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Net Flow</p>
                            <p className={`text-sm font-black font-mono ${stats.netFlow1h >= 0 ? 'text-brand-cyan' : 'text-brand-danger'}`}>
                                {stats.netFlow1h > 0 ? '+' : ''}${(stats.netFlow1h / 1000).toFixed(0)}k
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 pb-24 overscroll-contain">
                    {(!whaleHistory || whaleHistory.length === 0) ? (
                        <EmptyState
                            message="НЕМАЄ_АКТИВНОСТІ_КИТІВ"
                            subMessage="Сенсори глибоководні тихі. Очікування великих рухів капіталу."
                            icon={<ShieldIcon className="w-6 h-6 text-slate-600 opacity-50" />}
                        />
                    ) : (
                        (Array.isArray(whaleHistory) ? whaleHistory : []).map((tx, i) => (
                            <div key={i} className="bg-brand-card/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center p-2 shadow-inner">
                                            <img src={`https://assets.coincap.io/assets/icons/${tx.asset.toLowerCase()}@2x.png`} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-white text-sm font-orbitron">{tx.asset}</h4>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase border ${tx.type === 'EXCHANGE_INFLOW' ? 'border-red-500/40 text-red-400 bg-red-500/5' : 'border-green-500/40 text-green-400 bg-green-500/5'}`}>
                                                    {tx.type === 'EXCHANGE_INFLOW' ? 'INFLOW' : 'ACCUMULATION'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.timestamp} // {tx.id?.slice(-8)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white font-mono">${tx.valueUsd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        <p className="text-[8px] text-slate-600 font-mono uppercase mt-1">{tx.amount?.toFixed(2)} {tx.asset}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center text-[9px] font-bold py-2 px-3 bg-black/30 rounded-xl border border-white/5">
                                    {tx.type === 'EXCHANGE_INFLOW' ? <ArrowUpRightIcon className="w-3 h-3 text-red-400" /> : <ArrowDownLeftIcon className="w-3 h-3 text-green-400" />}
                                    <span className="text-slate-400 uppercase tracking-widest italic opacity-80">{tx.aiComment}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-white/5 bg-brand-bg shrink-0 safe-area-pb">
                    <button onClick={onClose} className="w-full py-4 bg-brand-cyan text-black font-black font-orbitron rounded-2xl uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform">Terminate Link</button>
                </div>
            </div>
        </div>
    );
};

export default WhaleHistoryModal;
