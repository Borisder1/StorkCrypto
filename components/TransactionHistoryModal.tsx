
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { ShieldIcon, ActivityIcon, ArrowUpRightIcon, ArrowDownLeftIcon, FileTextIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

const TransactionHistoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { wallet } = useStore();
    const history = wallet?.txHistory || [];

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/95 backdrop-blur-xl" onClick={onClose}>
            <div className="bg-brand-bg border-t sm:border border-white/10 rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-md h-[80vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                
                <div className="p-6 border-b border-white/5 bg-brand-card/50 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center">
                                <FileTextIcon className="w-5 h-5 text-brand-cyan" />
                            </div>
                            <div>
                                <h2 className="font-orbitron font-black text-lg text-white uppercase tracking-widest leading-none">Ledger_Archive</h2>
                                <p className="text-[8px] text-slate-500 font-mono mt-1 uppercase">On-chain transaction logs</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-slate-500 hover:text-white flex items-center justify-center transition-colors">✕</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 pb-24 overscroll-contain">
                    {!wallet?.isConnected ? (
                        <div className="py-20 text-center text-slate-600 font-mono text-xs uppercase opacity-30 italic">Wallet_Not_Linked</div>
                    ) : history.length === 0 ? (
                        <div className="py-20 text-center text-slate-600 font-mono text-xs uppercase opacity-30">No_Logs_Found</div>
                    ) : (
                        history.map((tx, i) => (
                            <div key={tx.id} className="bg-brand-card/40 border border-white/5 rounded-2xl p-4 hover:border-brand-cyan/20 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${tx.type === 'RECEIVE' ? 'bg-green-500/10 border-green-500/30 text-green-400' : tx.type === 'SEND' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-brand-purple/10 border-brand-purple/30 text-brand-purple'}`}>
                                            {tx.type === 'RECEIVE' ? <ArrowDownLeftIcon className="w-4 h-4" /> : tx.type === 'SEND' ? <ArrowUpRightIcon className="w-4 h-4" /> : <ActivityIcon className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white font-orbitron uppercase">{tx.type}</p>
                                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">{tx.asset}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-white font-mono">{tx.type === 'RECEIVE' ? '+' : '-'}{tx.amount?.toFixed(2)}</p>
                                        <p className="text-[8px] text-slate-600 font-mono uppercase mt-1">{tx.timestamp}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-between items-center pt-3 border-t border-white/5">
                                    <span className="text-[8px] font-mono text-slate-600 break-all opacity-60">HASH: {tx.hash}</span>
                                    <span className="text-[8px] font-black text-brand-green bg-green-500/10 px-1.5 py-0.5 rounded uppercase">Verified</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-white/5 bg-brand-bg shrink-0 safe-area-pb">
                    <button onClick={onClose} className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 font-black font-orbitron rounded-2xl uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-transform">Close Logs</button>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryModal;
