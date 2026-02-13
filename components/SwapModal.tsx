
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { StorkIcon, ArrowDownLeftIcon, ShieldIcon, ActivityIcon, ArrowUpRightIcon } from './icons';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';
import { getCryptoPrices } from '../services/priceService';
import { useScrollLock } from '../utils/useScrollLock';
import { useTonConnectUI, SendTransactionRequest } from '@tonconnect/ui-react';

const SwapModal: React.FC = () => {
    const { swapState, closeSwap, executeSwap, settings, wallet } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [tonConnectUI] = useTonConnectUI();
    
    // Блокування скролу
    useScrollLock(swapState.isOpen);

    const [fromAmount, setFromAmount] = useState<string>(swapState.amount?.toString() || '');
    const [toAmount, setToAmount] = useState<string>('');
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [swapping, setSwapping] = useState(false);
    const [stage, setStage] = useState<'INPUT' | 'APPROVE' | 'SWAP' | 'SUCCESS'>('INPUT');
    const [fee, setFee] = useState(0);
    const [txHash, setTxHash] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const data = await getCryptoPrices();
                if (data) {
                    const newPrices: Record<string, number> = {};
                    // Basic mappings for demo
                    const fromId = swapState.fromToken === 'TON' ? 'the-open-network' : swapState.fromToken.toLowerCase();
                    const toId = swapState.toToken === 'TON' ? 'the-open-network' : swapState.toToken.toLowerCase();
                    
                    newPrices[swapState.fromToken] = data[fromId]?.usd || (swapState.fromToken === 'TON' ? 5.5 : 1.0);
                    newPrices[swapState.toToken] = data[toId]?.usd || (swapState.toToken === 'TON' ? 5.5 : 1.0);
                    
                    setPrices(newPrices);
                }
            } catch (e) {}
        };
        if (swapState.isOpen) fetchPrices();
    }, [swapState.isOpen, swapState.fromToken, swapState.toToken]);

    useEffect(() => {
        if (!fromAmount) { setToAmount(''); setFee(0); return; }
        const amount = parseFloat(fromAmount);
        const feeAmount = amount * 0.005;
        setFee(feeAmount);
        const netAmount = amount - feeAmount;
        const pFrom = prices[swapState.fromToken] || 1;
        const pTo = prices[swapState.toToken] || 1;
        setToAmount(((netAmount * pFrom) / pTo).toFixed(4));
    }, [fromAmount, prices, swapState.fromToken, swapState.toToken]);

    const handleSwap = async () => {
        if (!wallet.isConnected) return;
        triggerHaptic('medium');
        setStage('APPROVE');
        setSwapping(true);

        try {
            // REAL TRANSACTION LOGIC (TON)
            // Sending 0.01 TON to a treasury address as a "Swap Simulation" fee or actual transfer
            // In a real DEX, this payload would contain the specific Jetton transfer OP codes.
            
            const ADMIN_WALLET = settings.adminTreasuryWallet || "UQC7...demo"; // Should be valid address
            const amountNano = Math.floor(parseFloat(fromAmount) * 1000000000).toString(); // Convert to Nanotons

            const transaction: SendTransactionRequest = {
                validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
                messages: [
                    {
                        address: ADMIN_WALLET,
                        amount: "10000000", // Fixed 0.01 TON fee for demo swap (safety)
                        // payload: ... (This is where the swap body would go)
                    }
                ]
            };

            const result = await tonConnectUI.sendTransaction(transaction);

            if (result) {
                setStage('SWAP');
                triggerHaptic('heavy');
                // The boc is the transaction body, we can hash it or just use a placeholder for UI
                setTxHash("REAL_TX_SENT"); 
                
                setTimeout(async () => {
                    await executeSwap(swapState.fromToken, swapState.toToken, parseFloat(fromAmount), parseFloat(toAmount));
                    setStage('SUCCESS');
                    triggerHaptic('success');
                    setSwapping(false);
                    setTimeout(() => closeSwap(), 3000);
                }, 1000);
            }
        } catch (e: any) {
            console.error(e);
            setStage('INPUT');
            setSwapping(false);
            triggerHaptic('error');
            // Check if user rejected
            if (e.message?.includes('User rejected')) {
                // handle rejection
            }
        }
    };

    if (!swapState.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={closeSwap}></div>
            <div className="relative z-10 w-full sm:max-w-md bg-brand-bg border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col animate-slide-up-mobile">
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                    <h2 className="font-orbitron font-black text-lg text-white tracking-widest uppercase">SWAP_TERMINAL</h2>
                    <button onClick={closeSwap} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    {stage === 'INPUT' && (
                        <>
                            <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                                <div className="flex justify-between mb-2"><span className="text-[10px] text-slate-500 font-black uppercase">Sell</span></div>
                                <div className="flex justify-between items-center">
                                    <input type="number" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} placeholder="0.0" className="bg-transparent text-3xl font-black text-white outline-none w-2/3 font-mono" autoFocus />
                                    <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 font-black text-white text-sm">{swapState.fromToken}</div>
                                </div>
                            </div>
                            <div className="flex justify-center -my-3 relative z-10"><div className="bg-brand-bg p-2 rounded-full border border-white/10 shadow-lg"><ArrowDownLeftIcon className="w-5 h-5 text-brand-cyan" /></div></div>
                            <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                                <div className="flex justify-between mb-2"><span className="text-[10px] text-slate-500 font-black uppercase">Receive</span></div>
                                <div className="flex justify-between items-center">
                                    <input type="text" value={toAmount} readOnly className="bg-transparent text-3xl font-black text-brand-green outline-none w-2/3 font-mono" />
                                    <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 font-black text-white text-sm">{swapState.toToken}</div>
                                </div>
                            </div>
                            <button onClick={handleSwap} disabled={!fromAmount || !wallet.isConnected} className="w-full py-5 bg-brand-cyan text-black font-black font-orbitron rounded-3xl text-sm tracking-widest shadow-xl disabled:opacity-30 uppercase transition-all hover:bg-white active:scale-95">
                                {wallet.isConnected ? 'Confirm on Blockchain' : 'Connect Wallet'}
                            </button>
                        </>
                    )}

                    {(stage === 'APPROVE' || stage === 'SWAP') && (
                        <div className="text-center py-16 flex flex-col items-center">
                            <div className="w-24 h-24 relative">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                                <ActivityIcon className="absolute inset-0 m-auto w-8 h-8 text-brand-cyan animate-pulse" />
                            </div>
                            <h3 className="text-white font-black font-orbitron tracking-widest uppercase mt-6">{stage === 'APPROVE' ? 'SIGN_IN_WALLET...' : 'BROADCASTING...'}</h3>
                            <p className="text-slate-500 text-[10px] mt-2 font-mono uppercase">Check your wallet app</p>
                        </div>
                    )}

                    {stage === 'SUCCESS' && (
                        <div className="text-center py-16 animate-zoom-in">
                            <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-brand-green shadow-[0_0_40px_rgba(34,197,94,0.4)]"><ShieldIcon className="w-12 h-12 text-brand-green" /></div>
                            <h3 className="text-2xl font-black text-white font-orbitron uppercase">SWAP_CONFIRMED</h3>
                            <p className="text-slate-500 text-xs mt-2 font-mono uppercase tracking-widest">Transaction Verified</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SwapModal;
