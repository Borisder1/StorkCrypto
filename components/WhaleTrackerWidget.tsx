
import React, { useState, useEffect, useRef } from 'react';
import { type WhaleTransaction } from '../types';
import { ShieldIcon, ActivityIcon, BotIcon, RadarIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { binanceWS } from '../services/websocketService';
import { useStore } from '../store';
import WhaleHistoryModal from './WhaleHistoryModal';

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
                    timestamp: new Date(trade.T).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
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
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-cyan/50"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-cyan/50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-cyan/50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-cyan/50"></div>

            <div className="bg-[#0a0f1e]/80 backdrop-blur-sm border border-white/5 p-5 relative overflow-hidden">
                {/* Scanning Radar Effect */}
                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[radial-gradient(circle,rgba(0,217,255,0.1)_0%,transparent_70%)] animate-pulse"></div>
                
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded bg-brand-cyan/10 border border-brand-cyan/30">
                            <RadarIcon className="w-4 h-4 text-brand-cyan animate-[spin_4s_linear_infinite]" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-xs font-orbitron tracking-widest uppercase">
                                Whale_Radar
                            </h3>
                            <p className="text-[8px] text-brand-cyan font-mono uppercase">Net Flow: {stats.netFlow1h > 0 ? '+' : ''}${(stats.netFlow1h / 1000).toFixed(0)}k</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleHistoryClick}
                        className="text-[8px] font-black font-mono text-slate-400 hover:text-white uppercase border-b border-slate-600 hover:border-white transition-colors"
                    >
                        {canAccessHistory ? 'VIEW_LOGS' : 'LOCKED [PRO]'}
                    </button>
                </div>

                <div className="space-y-1 relative z-10">
                    {recentTxs.length === 0 ? (
                        <div className="flex items-center justify-center py-6 border border-dashed border-white/10 bg-black/20">
                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Scanning_Mempool...</p>
                        </div>
                    ) : (
                        recentTxs.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-brand-cyan pl-2">
                                <div className="flex items-center gap-3">
                                    <img src={`https://assets.coincap.io/assets/icons/${tx.asset.toLowerCase()}@2x.png`} className="w-5 h-5 grayscale opacity-70" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white leading-none">{tx.asset}</span>
                                        <span className="text-[8px] text-slate-500 font-mono">{tx.timestamp}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-[10px] font-black font-mono ${tx.type === 'EXCHANGE_INFLOW' ? 'text-red-400' : 'text-green-400'}`}>
                                        {tx.type === 'EXCHANGE_INFLOW' ? 'DUMP' : 'PUMP'}
                                    </div>
                                    <div className="text-[9px] text-slate-400 font-mono">${(tx.valueUsd / 1000).toFixed(1)}k</div>
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
