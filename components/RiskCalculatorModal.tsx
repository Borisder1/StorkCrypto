
import React, { useState, useEffect } from 'react';
import { ShieldIcon, TrendingUpIcon, InfoIcon, BotIcon, ZapIcon } from './icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';
import { calculateKellyCriterion } from '../services/quantService';

interface RiskCalculatorModalProps {
    onClose: () => void;
}

const RiskCalculatorModal: React.FC<RiskCalculatorModalProps> = ({ onClose }) => {
    const { settings, assets } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    // Form State
    const [portfolioSize, setPortfolioSize] = useState<string>('');
    const [riskPercent, setRiskPercent] = useState<string>('1.0');
    const [entryPrice, setEntryPrice] = useState<string>('');
    const [stopLoss, setStopLoss] = useState<string>('');
    const [takeProfit, setTakeProfit] = useState<string>('');
    
    // Result State
    const [positionSize, setPositionSize] = useState<number | null>(null);
    const [leverage, setLeverage] = useState<number | null>(null);
    const [kellySuggestion, setKellySuggestion] = useState<number | null>(null);
    const [calculatingKelly, setCalculatingKelly] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    useEffect(() => {
        const total = assets.reduce((acc, a) => acc + a.value, 0);
        if (total > 0) setPortfolioSize(total.toFixed(0));
    }, [assets]);

    const calculate = () => {
        const port = parseFloat(portfolioSize);
        const risk = parseFloat(riskPercent);
        const entry = parseFloat(entryPrice);
        const sl = parseFloat(stopLoss);
        if (!port || !risk || !entry || !sl) return;
        triggerHaptic('selection');
        const riskAmount = port * (risk / 100);
        const priceDiffPercent = Math.abs((entry - sl) / entry);
        if (priceDiffPercent === 0) return;
        const posSize = riskAmount / priceDiffPercent;
        setPositionSize(posSize);
        setLeverage(posSize > port ? posSize / port : 1);
    };

    const handleKellySuggest = async () => {
        const entry = parseFloat(entryPrice);
        const sl = parseFloat(stopLoss);
        const tp = parseFloat(takeProfit);
        if (!entry || !sl || !tp) {
             triggerHaptic('error');
             return;
        }

        setCalculatingKelly(true);
        triggerHaptic('medium');

        const reward = Math.abs(tp - entry);
        const risk = Math.abs(entry - sl);
        const winLossRatio = reward / risk;
        const winProb = 0.55; // Placeholder probability from neural baseline

        const k = await calculateKellyCriterion(winProb, winLossRatio);
        setKellySuggestion(k * 100); // in percent
        setCalculatingKelly(false);
        triggerHaptic('success');
    };

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 overflow-hidden overscroll-none touch-none">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in touch-none" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-sm bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col max-h-[85dvh] animate-zoom-in">
                <div className="p-5 border-b border-brand-border bg-brand-card flex justify-between items-center shrink-0 touch-none">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center">
                            <ShieldIcon className="w-5 h-5 text-brand-cyan" />
                         </div>
                         <h2 className="font-orbitron font-bold text-lg text-white">RISK_ADVISOR</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Equity ($)</label>
                            <input type="number" value={portfolioSize} onChange={(e) => setPortfolioSize(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-brand-cyan outline-none" placeholder="1000" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Entry</label><input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-brand-cyan outline-none" placeholder="65000" /></div>
                            <div><label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Stop Loss</label><input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-brand-danger/50 outline-none" placeholder="64000" /></div>
                        </div>
                        <div><label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Take Profit</label><input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-brand-green/50 outline-none" placeholder="68000" /></div>
                        
                        <div className="flex gap-2">
                             <button onClick={calculate} className="flex-1 py-3 rounded-xl bg-brand-cyan text-black font-bold font-orbitron hover:opacity-90 transition-opacity text-xs uppercase tracking-widest">Manual Calc</button>
                             <button onClick={handleKellySuggest} disabled={calculatingKelly} className="flex-1 py-3 rounded-xl bg-brand-purple text-white font-bold font-orbitron hover:opacity-90 transition-opacity text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                {calculatingKelly ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><ZapIcon className="w-3 h-3"/> Kelly Size</>}
                             </button>
                        </div>
                    </div>

                    {kellySuggestion !== null && (
                        <div className="mb-4 bg-brand-purple/10 border border-brand-purple/30 rounded-2xl p-4 animate-fade-in-up">
                            <p className="text-[8px] font-black text-brand-purple uppercase tracking-widest mb-1 font-orbitron">Optimal_Allocation_Limit</p>
                            <div className="flex justify-between items-baseline">
                                <span className="text-2xl font-black text-white font-mono">{kellySuggestion.toFixed(1)}%</span>
                                <span className="text-[10px] text-slate-500 uppercase">of total equity</span>
                            </div>
                            <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-purple shadow-[0_0_10px_#8b5cf6]" style={{ width: `${Math.min(100, kellySuggestion)}%` }}></div>
                            </div>
                        </div>
                    )}

                    {positionSize !== null && (
                        <div className="bg-gradient-to-br from-brand-card to-brand-bg border border-brand-border rounded-2xl p-4 animate-fade-in-up">
                            <h3 className="text-xs text-slate-500 uppercase font-bold mb-4 flex items-center gap-2"><TrendingUpIcon className="w-4 h-4 text-brand-cyan"/> Leverage Plan</h3>
                            <div className="flex justify-between items-end mb-4 pb-4 border-b border-white/5">
                                <div><p className="text-[10px] text-slate-400">Position Size</p><p className="text-2xl font-bold text-white font-mono">${positionSize.toLocaleString(undefined, {maximumFractionDigits: 0})}</p></div>
                                <div className="text-right"><p className="text-[10px] text-slate-400">Lev.</p><p className="text-sm font-bold text-brand-cyan font-mono">{leverage && leverage > 1 ? `${leverage.toFixed(1)}x` : '1.0x'}</p></div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex gap-2 p-3 bg-brand-purple/5 border border-brand-purple/20 rounded-xl">
                        <InfoIcon className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                        <p className="text-[9px] text-slate-400 leading-relaxed font-mono italic uppercase">
                            Kelly suggests the maximum bet to avoid total ruin over long sequence. Recommended: Use "Half-Kelly" for safety.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskCalculatorModal;
