import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { TacticalBackground } from './TacticalBackground';
import { GlobeIcon, ChevronRightIcon, ZapIcon, ActivityIcon } from './icons';

interface DexAggregatorModalProps {
    onClose: () => void;
}

const DexAggregatorModal: React.FC<DexAggregatorModalProps> = ({ onClose }) => {
    const [fromAsset, setFromAsset] = useState('USDT');
    const [toAsset, setToAsset] = useState('STORK');
    const [amount, setAmount] = useState('');

    return (
        <div className="fixed inset-0 z-[150] bg-brand-bg flex flex-col animate-fade-in overflow-hidden h-[100dvh] w-full">
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
                        <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase italic">DEX_SWAP</h1>
                        <p className="text-[8px] text-brand-cyan font-mono animate-pulse uppercase">Aggregator_Node</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10 flex flex-col items-center justify-center">
                
                {/* IN DEVELOPMENT OVERLAY */}
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mb-6 animate-pulse">
                        <GlobeIcon className="w-10 h-10 text-brand-cyan" />
                    </div>
                    <h2 className="text-2xl font-black text-white font-orbitron uppercase tracking-widest mb-2">IN DEVELOPMENT</h2>
                    <p className="text-sm text-slate-400 font-mono mb-8 max-w-xs">The DEX Aggregator module is currently being built. Waiting for API integration.</p>
                    <button onClick={onClose} className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl text-xs font-black uppercase text-white hover:bg-white/20 transition-all">
                        RETURN TO TERMINAL
                    </button>
                </div>

                {/* MOCK UI UNDERNEATH */}
                <div className="w-full max-w-md bg-brand-card/40 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative opacity-50 pointer-events-none">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] font-orbitron">Swap_Protocol</h3>
                        <ActivityIcon className="w-4 h-4 text-brand-cyan" />
                    </div>

                    <div className="space-y-2 relative">
                        {/* From */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                            <p className="text-[9px] text-slate-500 font-black uppercase mb-2">Pay</p>
                            <div className="flex justify-between items-center">
                                <input type="number" placeholder="0.0" className="bg-transparent text-2xl font-black text-white font-mono w-1/2 outline-none" disabled />
                                <div className="bg-white/5 px-3 py-2 rounded-xl flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{fromAsset}</span>
                                </div>
                            </div>
                        </div>

                        {/* Swap Icon */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-brand-card border border-white/10 rounded-xl flex items-center justify-center z-10">
                            <ZapIcon className="w-5 h-5 text-brand-cyan" />
                        </div>

                        {/* To */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                            <p className="text-[9px] text-slate-500 font-black uppercase mb-2">Receive</p>
                            <div className="flex justify-between items-center">
                                <input type="number" placeholder="0.0" className="bg-transparent text-2xl font-black text-white font-mono w-1/2 outline-none" disabled />
                                <div className="bg-white/5 px-3 py-2 rounded-xl flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{toAsset}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-5 bg-brand-cyan text-black font-black font-orbitron rounded-2xl uppercase tracking-widest text-sm" disabled>
                        EXECUTE SWAP
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DexAggregatorModal;
