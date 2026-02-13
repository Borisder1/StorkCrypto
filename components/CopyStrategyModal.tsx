
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ShieldIcon, TrendingUpIcon, ActivityIcon, ZapIcon, LinkIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { CopiedTrader } from '../types';
import { walletService } from '../services/walletService';

interface CopyStrategyModalProps {
    trader: CopiedTrader;
    onClose: () => void;
}

const CopyStrategyModal: React.FC<CopyStrategyModalProps> = ({ trader, onClose }) => {
    const { copyTrader, wallet, showToast } = useStore();
    
    const [collateral, setCollateral] = useState<string>('500');
    const [stopLoss, setStopLoss] = useState<string>('15');
    const [takeProfit, setTakeProfit] = useState<string>('30');
    const [stage, setStage] = useState<'CONFIG' | 'APPROVE' | 'DEPOSIT' | 'SUCCESS'>('CONFIG');
    const [txHash, setTxHash] = useState<string | null>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleDeploy = async () => {
        if (!collateral || !wallet.isConnected) {
            triggerHaptic('error');
            return;
        }

        triggerHaptic('medium');
        setStage('APPROVE');

        try {
            // Simulate Approval
            await new Promise(r => setTimeout(r, 1500));
            setStage('DEPOSIT');
            
            // Simulate Smart Contract Deposit
            const result = await walletService.sendTransaction("0xSyndicateVault", collateral, wallet.chain as any);
            
            if (result.success) {
                setTxHash(result.hash || '0x...');
                triggerHaptic('success');
                
                // Finalize in Store
                copyTrader(trader, {
                    collateral: parseFloat(collateral),
                    stopLossPercent: parseFloat(stopLoss),
                    takeProfitPercent: parseFloat(takeProfit),
                    status: 'ACTIVE',
                    currentPnL: 0
                });
                
                setStage('SUCCESS');
                setTimeout(onClose, 2000);
                showToast(`Vault Deployed: ${trader.name}`);
            }
        } catch (e) {
            setStage('CONFIG');
            showToast('Transaction Failed');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            <div className="relative z-10 w-full sm:max-w-md bg-brand-bg border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-slide-up-mobile">
                
                <div className="p-6 border-b border-white/5 bg-brand-card/50 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="font-orbitron font-black text-lg text-white uppercase tracking-widest">Syndicate_Vault</h2>
                        <p className="text-[9px] text-slate-500 font-mono uppercase">Smart Contract Deployment</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">✕</button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    
                    {stage === 'CONFIG' && (
                        <div className="space-y-6">
                            <div className="bg-brand-purple/10 border border-brand-purple/30 p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center font-black text-brand-purple text-lg border border-brand-purple/20">
                                    {trader.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm uppercase">{trader.name}</h3>
                                    <div className="flex gap-2 text-[9px] font-mono mt-1">
                                        <span className="text-brand-green">WinRate: {trader.winRate}%</span>
                                        <span className="text-slate-400">Risk: {trader.riskScore}/10</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-black mb-2 block">Collateral (USDT)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={collateral}
                                        onChange={e => setCollateral(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-xl font-bold text-white focus:border-brand-cyan outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">USDT</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-black mb-2 block">Stop Loss (%)</label>
                                    <input 
                                        type="number" 
                                        value={stopLoss}
                                        onChange={e => setStopLoss(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-white focus:border-red-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-black mb-2 block">Take Profit (%)</label>
                                    <input 
                                        type="number" 
                                        value={takeProfit}
                                        onChange={e => setTakeProfit(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-white focus:border-green-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center text-[10px] mb-1">
                                    <span className="text-slate-400">Gas Fee (Est.)</span>
                                    <span className="text-white font-mono">0.35 TON</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400">Management Fee</span>
                                    <span className="text-white font-mono">20% of Profits</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {(stage === 'APPROVE' || stage === 'DEPOSIT') && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-6">
                            <div className="w-24 h-24 relative">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                                <ActivityIcon className="absolute inset-0 m-auto w-8 h-8 text-brand-cyan animate-pulse" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-black font-orbitron text-lg uppercase tracking-widest mb-2">
                                    {stage === 'APPROVE' ? 'Approving USDT...' : 'Depositing Collateral...'}
                                </h3>
                                <p className="text-xs text-slate-500 font-mono">Please sign request in wallet</p>
                            </div>
                        </div>
                    )}

                    {stage === 'SUCCESS' && (
                        <div className="flex flex-col items-center justify-center py-10 animate-zoom-in">
                            <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center border-2 border-brand-green shadow-[0_0_30px_#22c55e] mb-6">
                                <ShieldIcon className="w-10 h-10 text-brand-green" />
                            </div>
                            <h3 className="text-white font-black font-orbitron text-xl uppercase tracking-widest mb-2">Vault Active</h3>
                            <p className="text-xs text-slate-500 font-mono text-center max-w-[200px]">
                                Smart Contract Deployed.<br/>
                                <span className="text-[9px] text-slate-600 break-all">{txHash}</span>
                            </p>
                        </div>
                    )}

                </div>

                {stage === 'CONFIG' && (
                    <div className="p-6 border-t border-white/5 bg-brand-card/30 shrink-0 safe-area-pb">
                        <button 
                            onClick={handleDeploy}
                            disabled={!wallet.isConnected}
                            className="w-full py-4 bg-brand-cyan text-black font-black font-orbitron rounded-2xl shadow-xl hover:bg-white transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {wallet.isConnected ? <><LinkIcon className="w-4 h-4"/> Deploy Smart Contract</> : 'Connect Wallet First'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CopyStrategyModal;
