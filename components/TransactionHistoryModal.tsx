
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { ShieldIcon, ActivityIcon, ArrowUpRightIcon, ArrowDownLeftIcon, FileTextIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

import EmptyState from './EmptyState';

const TransactionHistoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { wallet } = useStore();
    const history = wallet?.txHistory || [];

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md" onClick={onClose}>
            <div className="glass-panel border-t sm:border border-white/10 rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-md h-[80vh] overflow-hidden flex flex-col shadow-2xl box-glow" onClick={e => e.stopPropagation()}>
                
                <div className="p-6 border-b border-white/5 bg-white/5 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center box-glow">
                                <FileTextIcon className="w-5 h-5 text-brand-cyan text-glow" />
                            </div>
                            <div>
                                <h2 className="font-orbitron font-black text-lg text-white uppercase tracking-widest leading-none text-glow">Ledger_Archive</h2>
                                <p className="text-[10px] text-slate-400 font-inter mt-1 uppercase tracking-wider">On-chain transaction logs</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all duration-300 border border-transparent hover:border-white/20">✕</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 pb-24 overscroll-contain">
                    {!wallet?.isConnected ? (
                        <div className="py-20 text-center text-slate-500 font-inter text-sm uppercase opacity-50 italic">Wallet_Not_Linked</div>
                    ) : history.length === 0 ? (
                        <EmptyState 
                            message="ARCHIVE_EMPTY" 
                            subMessage="No transaction signatures found in the ledger. Execute operations to populate log."
                            icon={<FileTextIcon className="w-6 h-6 text-slate-700" />}
                        />
                    ) : (
                        history.map((tx, i) => (
                            <div key={tx.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-brand-cyan/30 hover:bg-white/10 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${i * 50}ms` }}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur-sm transition-colors duration-300 ${tx.type === 'RECEIVE' ? 'bg-green-500/10 border-green-500/30 text-green-400 group-hover:text-green-300 group-hover:border-green-400/50' : tx.type === 'SEND' ? 'bg-red-500/10 border-red-500/30 text-red-400 group-hover:text-red-300 group-hover:border-red-400/50' : 'bg-brand-purple/10 border-brand-purple/30 text-brand-purple group-hover:text-purple-300 group-hover:border-brand-purple/50'}`}>
                                            {tx.type === 'RECEIVE' ? <ArrowDownLeftIcon className="w-5 h-5" /> : tx.type === 'SEND' ? <ArrowUpRightIcon className="w-5 h-5" /> : <ActivityIcon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black font-orbitron uppercase tracking-wide ${tx.type === 'RECEIVE' ? 'text-green-400' : tx.type === 'SEND' ? 'text-red-400' : 'text-brand-purple'}`}>{tx.type}</p>
                                            <p className="text-[10px] text-slate-400 font-inter mt-1">{tx.asset}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white font-orbitron tracking-wider">{tx.type === 'RECEIVE' ? '+' : '-'}{tx.amount?.toFixed(2)}</p>
                                        <p className="text-[9px] text-slate-500 font-inter uppercase mt-1 tracking-wider">{tx.timestamp}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-between items-center pt-3 border-t border-white/5">
                                    <span className="text-[9px] font-mono text-slate-500 break-all opacity-70 w-3/4 truncate">HASH: {tx.hash}</span>
                                    <span className="text-[9px] font-bold text-brand-green bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,0,0.1)]">Verified</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-white/5 bg-white/5 shrink-0 safe-area-pb backdrop-blur-xl">
                    <button onClick={onClose} className="w-full py-4 bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/20 hover:border-brand-cyan/50 hover:text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] font-black font-orbitron rounded-2xl uppercase text-xs tracking-[0.2em] transition-all duration-300 active:scale-95">Close Logs</button>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryModal;
