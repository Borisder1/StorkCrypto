import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { BotIcon, ZapIcon, ShieldIcon, ActivityIcon, ChevronRightIcon, SparklesIcon, CheckIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';

interface StrategyBuilderModalProps {
    onClose: () => void;
}

export const StrategyBuilderModal: React.FC<StrategyBuilderModalProps> = ({ onClose }) => {
    const { settings, showToast, grantXp } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    // Form States
    const [strategyName, setStrategyName] = useState('Neural TON Scalper v1');
    const [asset, setAsset] = useState('TON');
    const [allocatedCapital, setAllocatedCapital] = useState('250');
    const [stopLoss, setStopLoss] = useState('12');
    const [takeProfit, setTakeProfit] = useState('28');
    
    // Trigger Conditions Selection
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['rsi_oversold', 'whale_accumulation']);

    // Backtest Simulation State
    const [isSimulating, setIsSimulating] = useState(false);
    const [backtestResult, setBacktestResult] = useState<{
        winRate: number;
        roiPercent: number;
        tradesCount: number;
        maxDrawdown: number;
        riskGrade: string;
    } | null>({
        winRate: 78.4,
        roiPercent: +34.2,
        tradesCount: 142,
        maxDrawdown: 6.8,
        riskGrade: 'A+'
    });

    const triggerOptions = [
        { id: 'rsi_oversold', label: 'RSI Oversold (<30)', desc: 'Buy when momentum reaches oversold levels' },
        { id: 'whale_accumulation', label: 'Whale Radar Accumulation', desc: 'Execute when whale block > $250K is detected' },
        { id: 'macd_cross', label: 'MACD Bullish Crossover', desc: 'Trend confirmation signal' },
        { id: 'volume_spike', label: 'Volume Spike (>200%)', desc: 'High liquidity entry detector' },
    ];

    const toggleTrigger = (id: string) => {
        triggerHaptic('selection');
        setSelectedTriggers(prev => 
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const runBacktest = () => {
        triggerHaptic('medium');
        setIsSimulating(true);
        setBacktestResult(null);

        setTimeout(() => {
            setIsSimulating(false);
            const winRate = Number((65 + Math.random() * 25).toFixed(1));
            const roiPercent = Number((15 + Math.random() * 35).toFixed(1));
            const tradesCount = Math.floor(80 + Math.random() * 100);
            const maxDrawdown = Number((4 + Math.random() * 8).toFixed(1));
            const riskGrade = winRate > 80 ? 'A+' : winRate > 70 ? 'A' : 'B+';

            setBacktestResult({ winRate, roiPercent, tradesCount, maxDrawdown, riskGrade });
            triggerHaptic('success');
            showToast('Backtest Simulation Completed');
        }, 1200);
    };

    const handleDeployBot = () => {
        triggerHaptic('success');
        grantXp(50, 'Deployed AI Strategy');
        showToast(`Bot Activated: ${strategyName}`);
        onClose();
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
        >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative z-10 w-full max-w-lg bg-brand-bg border border-brand-cyan/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(0,217,255,0.2)] my-auto max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-brand-cyan/20 via-brand-card to-brand-bg border-b border-white/10 relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,217,255,0.4)]">
                        <BotIcon className="w-6 h-6 text-brand-cyan" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-[10px] font-orbitron font-black uppercase mb-2">
                        <SparklesIcon className="w-3 h-3" /> {t('strategy.badge')}
                    </div>
                    <h2 className="font-orbitron font-black text-xl text-white">{t('strategy.title')}</h2>
                    <p className="text-slate-400 text-xs font-space-mono">{t('strategy.subtitle')}</p>
                </div>

                {/* Form & Controls */}
                <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
                    {/* Bot Name & Asset */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="text-[10px] font-orbitron font-bold text-slate-400 uppercase mb-1 block">{t('strategy.name')}</label>
                            <input 
                                type="text"
                                value={strategyName}
                                onChange={(e) => setStrategyName(e.target.value)}
                                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:border-brand-cyan outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-orbitron font-bold text-slate-400 uppercase mb-1 block">{t('strategy.asset')}</label>
                            <select 
                                value={asset}
                                onChange={(e) => setAsset(e.target.value)}
                                className="w-full bg-black/60 border border-white/15 rounded-xl px-2 py-2.5 text-xs font-mono text-brand-cyan focus:border-brand-cyan outline-none font-bold"
                            >
                                <option value="TON">TON</option>
                                <option value="BTC">BTC</option>
                                <option value="ETH">ETH</option>
                                <option value="SOL">SOL</option>
                            </select>
                        </div>
                    </div>

                    {/* Trigger Rules */}
                    <div>
                        <label className="text-[10px] font-orbitron font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                            <ZapIcon className="w-3 h-3 text-brand-cyan" /> {t('strategy.triggers')}
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {triggerOptions.map(trig => {
                                const selected = selectedTriggers.includes(trig.id);
                                return (
                                    <div 
                                        key={trig.id}
                                        onClick={() => toggleTrigger(trig.id)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selected ? 'bg-brand-cyan/15 border-brand-cyan text-white shadow-[0_0_15px_rgba(0,217,255,0.15)]' : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'}`}
                                    >
                                        <div>
                                            <p className="text-xs font-bold font-orbitron flex items-center gap-2">
                                                {trig.label}
                                            </p>
                                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{trig.desc}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${selected ? 'bg-brand-cyan border-brand-cyan text-black' : 'border-white/20'}`}>
                                            {selected && <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Risk & Collateral Inputs */}
                    <div className="grid grid-cols-3 gap-3 bg-black/40 border border-white/10 p-3.5 rounded-2xl">
                        <div>
                            <label className="text-[9px] font-orbitron text-slate-400 uppercase block mb-1">{t('strategy.capital')}</label>
                            <input 
                                type="number" 
                                value={allocatedCapital}
                                onChange={(e) => setAllocatedCapital(e.target.value)}
                                className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-xs font-mono text-white text-center font-bold"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-orbitron text-brand-danger uppercase block mb-1">{t('strategy.stop_loss')}</label>
                            <input 
                                type="number" 
                                value={stopLoss}
                                onChange={(e) => setStopLoss(e.target.value)}
                                className="w-full bg-black/60 border border-brand-danger/30 rounded-lg px-2 py-1.5 text-xs font-mono text-brand-danger text-center font-bold"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-orbitron text-brand-green uppercase block mb-1">{t('strategy.take_profit')}</label>
                            <input 
                                type="number" 
                                value={takeProfit}
                                onChange={(e) => setTakeProfit(e.target.value)}
                                className="w-full bg-black/60 border border-brand-green/30 rounded-lg px-2 py-1.5 text-xs font-mono text-brand-green text-center font-bold"
                            />
                        </div>
                    </div>

                    {/* Backtest Action & Output */}
                    <div className="space-y-3 pt-1">
                        <button 
                            onClick={runBacktest}
                            disabled={isSimulating || selectedTriggers.length === 0}
                            className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-brand-cyan font-orbitron font-bold text-xs uppercase hover:bg-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <ActivityIcon className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
                            {isSimulating ? t('strategy.simulating') : t('strategy.run_backtest')}
                        </button>

                        {backtestResult && (
                            <div className="bg-brand-card border border-brand-cyan/30 rounded-2xl p-4 space-y-3 animate-fade-in">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <span className="text-[10px] font-orbitron font-bold text-slate-300">BACKTEST REPORT (30 DAYS)</span>
                                    <span className="text-[10px] font-orbitron font-black text-brand-green px-2 py-0.5 rounded bg-brand-green/20 border border-brand-green/30">
                                        Grade: {backtestResult.riskGrade}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-[9px] text-slate-500 uppercase font-mono">Win Rate</p>
                                        <p className="text-sm font-bold font-orbitron text-brand-cyan">{backtestResult.winRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-500 uppercase font-mono">Proj. ROI</p>
                                        <p className="text-sm font-bold font-orbitron text-brand-green">+{backtestResult.roiPercent}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-500 uppercase font-mono">Max Drawdown</p>
                                        <p className="text-sm font-bold font-orbitron text-brand-danger">-{backtestResult.maxDrawdown}%</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Deploy Bot CTA */}
                    <button 
                        onClick={handleDeployBot}
                        disabled={selectedTriggers.length === 0}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-cyan via-teal-500 to-brand-green text-black font-orbitron font-black text-xs uppercase hover:opacity-90 transition-all shadow-[0_0_25px_rgba(0,217,255,0.4)] flex items-center justify-center gap-2"
                    >
                        <ZapIcon className="w-4 h-4 fill-black" />
                        {t('strategy.deploy')} (${allocatedCapital})
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default StrategyBuilderModal;
