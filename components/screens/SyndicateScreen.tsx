import React, { useState } from 'react';
import { useStore } from '../../store';
import { UserIcon, TrendingUpIcon, ActivityIcon, ShieldIcon, ChevronRightIcon, ZapIcon } from '../icons';
import { triggerHaptic } from '../../utils/haptics';
import { CopiedTrader } from '../../types';
import { TacticalBackground } from '../TacticalBackground';
import CopyStrategyModal from '../CopyStrategyModal';
import EmptyState from '../EmptyState';

const TRADERS: CopiedTrader[] = [
    { id: 't1', name: 'Alpha_Centauri', roi: 124.5, tvl: 850000, winRate: 78, riskScore: 4 },
    { id: 't2', name: 'Ghost_Protocol', roi: 342.1, tvl: 120000, winRate: 62, riskScore: 8 },
    { id: 't3', name: 'Deep_Liquidity', roi: 45.8, tvl: 4200000, winRate: 91, riskScore: 2 },
];

export const SyndicateScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { copiedTraders, stopCopying } = useStore();
    const [selectedTrader, setSelectedTrader] = useState<CopiedTrader | null>(null);

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 flex justify-center overflow-hidden animate-fade-in">
            <div className="w-full max-w-md h-full bg-brand-bg flex flex-col relative shadow-2xl">
            <TacticalBackground />
            
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase italic">SYNDICATE_V1</h1>
                        <p className="text-[8px] text-brand-purple font-mono uppercase">Social_Link: ESTABLISHED</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple">
                    <UserIcon className="w-5 h-5" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-32 relative z-10">
                <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-[2rem] p-6 mb-8 shadow-inner">
                    <h3 className="text-[10px] font-black text-brand-purple uppercase tracking-[0.3em] font-orbitron flex items-center gap-2 mb-4">
                        <ZapIcon className="w-4 h-4" /> Neural_Mirror_Protocol
                    </h3>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                        Копіюйте стратегії топ-пілотів у реальному часі. Ваші активи будуть автоматично слідувати за їхніми ордерами через смарт-контракти Stork.
                    </p>
                </div>

                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">MASTER_PILOTS</h3>
                
                {TRADERS.length === 0 ? (
                    <div className="py-10">
                        <EmptyState 
                            message="NO_PILOTS_FOUND" 
                            subMessage="Syndicate network is currently offline. Check back later for new signals."
                            icon={<UserIcon className="w-6 h-6 text-slate-600 opacity-50" />}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {TRADERS.map(trader => {
                            const isCopying = copiedTraders.some(t => t.id === trader.id);
                            return (
                                <div key={trader.id} className={`bg-brand-card/60 border rounded-3xl p-5 transition-all duration-300 ${isCopying ? 'border-brand-green bg-brand-green/5' : 'border-white/5 hover:border-brand-purple/30'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center font-black text-brand-purple text-xl shadow-inner">
                                            {trader.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold font-orbitron">{trader.name}</h4>
                                            <p className="text-[9px] text-slate-500 font-mono uppercase mt-1">TVL: ${(trader.tvl / 1000000).toFixed(1)}M</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-brand-green font-black font-orbitron text-xl">+{trader.roi}%</p>
                                        <p className="text-[8px] text-slate-500 font-black uppercase">ALL_TIME_ROI</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    <div className="bg-black/40 rounded-xl p-2 text-center border border-white/5">
                                        <p className="text-[7px] text-slate-500 uppercase font-black mb-1">Win Rate</p>
                                        <p className="text-xs font-mono font-bold text-white">{trader.winRate}%</p>
                                    </div>
                                    <div className="bg-black/40 rounded-xl p-2 text-center border border-white/5">
                                        <p className="text-[7px] text-slate-500 uppercase font-black mb-1">Risk</p>
                                        <p className={`text-xs font-mono font-bold ${trader.riskScore > 6 ? 'text-brand-danger' : 'text-brand-cyan'}`}>{trader.riskScore}/10</p>
                                    </div>
                                    <div className="bg-black/40 rounded-xl p-2 text-center border border-white/5">
                                        <p className="text-[7px] text-slate-500 uppercase font-black mb-1">Trades</p>
                                        <p className="text-xs font-mono font-bold text-white">1.2k</p>
                                    </div>
                                </div>

                                {isCopying ? (
                                    <button 
                                        onClick={() => { triggerHaptic('heavy'); stopCopying(trader.id); }}
                                        className="w-full py-4 bg-brand-danger/10 border border-brand-danger/30 text-brand-danger font-black font-orbitron rounded-2xl text-[10px] uppercase tracking-widest hover:bg-brand-danger/20 transition-all"
                                    >
                                        Terminate Connection
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => { triggerHaptic('medium'); setSelectedTrader(trader); }}
                                        className="w-full py-4 bg-brand-purple text-white font-black font-orbitron rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:shadow-brand-purple/20 transition-all active:scale-95"
                                    >
                                        Deploy Neural Mirror
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                )}
            </div>

            {selectedTrader && <CopyStrategyModal trader={selectedTrader} onClose={() => setSelectedTrader(null)} />}
            </div>
        </div>
    );
};

export default SyndicateScreen;