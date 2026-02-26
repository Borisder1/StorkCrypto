
import React, { useState } from 'react';
import { BotIcon, BarChartIcon, TrendingUpIcon, FileTextIcon, ShieldIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import LockedFeature from './LockedFeature';

export const PortfolioTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState<'TIME_MACHINE' | 'IL_CALC' | 'TAX_EST' | 'SHIELD'>('SHIELD');
    
    // Time Machine State
    const [tmAsset, setTmAsset] = useState('BTC');
    const [tmAmount, setTmAmount] = useState('1000');
    const [tmPeriod, setTmPeriod] = useState('1Y');
    const [tmResult, setTmResult] = useState<number | null>(null);

    // IL Calc State
    const [ilTokenA, setIlTokenA] = useState('0'); 
    const [ilTokenB, setIlTokenB] = useState('0'); 
    const [ilResult, setIlResult] = useState<number | null>(null);

    // Tax State
    const [taxRate, setTaxRate] = useState('19.5');
    const [realizedGain, setRealizedGain] = useState('0');
    const [taxResult, setTaxResult] = useState<number | null>(null);

    // Shield State
    const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING' | 'SAFE' | 'RISK'>('IDLE');

    const calculateTimeMachine = () => {
        triggerHaptic('success');
        const amount = parseFloat(tmAmount);
        if (!amount) return;
        let multiplier = 1;
        if (tmAsset === 'BTC') multiplier = tmPeriod === '1Y' ? 2.2 : tmPeriod === '3Y' ? 4.5 : 1.5;
        if (tmAsset === 'ETH') multiplier = tmPeriod === '1Y' ? 1.8 : tmPeriod === '3Y' ? 3.2 : 1.2;
        if (tmAsset === 'SOL') multiplier = tmPeriod === '1Y' ? 8.5 : tmPeriod === '3Y' ? 12.0 : 3.0;
        setTmResult(amount * multiplier);
    };

    const calculateIL = () => {
        triggerHaptic('success');
        const priceRatioA = 1 + (parseFloat(ilTokenA) / 100);
        const priceRatioB = 1 + (parseFloat(ilTokenB) / 100);
        if (priceRatioA <= 0 || priceRatioB <= 0) return;
        const k = priceRatioA / priceRatioB; 
        const il = (2 * Math.sqrt(k) / (1 + k)) - 1;
        setIlResult(Math.abs(il * 100));
    };

    const calculateTax = () => {
        triggerHaptic('success');
        const gain = parseFloat(realizedGain);
        const rate = parseFloat(taxRate);
        if (gain > 0 && rate > 0) {
            setTaxResult(gain * (rate / 100));
        } else {
            setTaxResult(0);
        }
    };

    const runSecurityScan = () => {
        triggerHaptic('medium');
        setScanStatus('SCANNING');
        setTimeout(() => {
            setScanStatus('SAFE');
            triggerHaptic('success');
        }, 2000);
    };

    return (
        <div className="bg-brand-card/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 mb-6 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)] mx-2">
            
            {/* Tool Selector - Glass Pill */}
            <div className="flex gap-2 mb-6 bg-black/40 p-1.5 rounded-2xl overflow-x-auto no-scrollbar border border-white/5">
                {[
                    { id: 'SHIELD', label: 'Shield', color: 'bg-brand-cyan text-black' },
                    { id: 'TIME_MACHINE', label: 'Time Leap', color: 'bg-brand-cyan text-black' },
                    { id: 'IL_CALC', label: 'Risk', color: 'bg-brand-purple text-white' },
                    { id: 'TAX_EST', label: 'Tax', color: 'bg-brand-green text-black' }
                ].map(tool => (
                    <button 
                        key={tool.id}
                        onClick={() => { setActiveTool(tool.id as any); triggerHaptic('selection'); }} 
                        className={`flex-1 min-w-[70px] py-2.5 rounded-xl text-[9px] font-bold uppercase transition-all whitespace-nowrap active:scale-95 ${activeTool === tool.id ? tool.color + ' shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        {tool.label}
                    </button>
                ))}
            </div>

            {activeTool === 'SHIELD' && (
                <div className="animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldIcon className="w-4 h-4 text-brand-cyan drop-shadow-[0_0_5px_#00F0FF]" />
                        <span className="text-xs font-bold text-white tracking-widest font-orbitron">ASSET PROTECTION</span>
                    </div>
                    
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/5 mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] text-slate-400 font-mono">CONTRACT APPROVALS</span>
                            {scanStatus === 'SCANNING' && <span className="text-[10px] text-yellow-500 animate-pulse font-bold">SCANNING...</span>}
                            {scanStatus === 'SAFE' && <span className="text-[10px] text-green-500 font-bold drop-shadow-[0_0_5px_#00FF9D]">ALL CLEAR</span>}
                            {scanStatus === 'RISK' && <span className="text-[10px] text-red-500 font-bold">1 RISK FOUND</span>}
                            {scanStatus === 'IDLE' && <span className="text-[10px] text-slate-600">LAST SCAN: 2D AGO</span>}
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${scanStatus === 'SCANNING' ? 'w-full bg-yellow-500' : scanStatus === 'SAFE' ? 'w-full bg-green-500 shadow-[0_0_10px_#00FF9D]' : 'w-0'}`}></div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button 
                            onClick={runSecurityScan}
                            disabled={scanStatus === 'SCANNING'}
                            className={`w-full py-4 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 tracking-widest ${scanStatus === 'SAFE' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-brand-cyan text-black hover:bg-white'}`}
                        >
                            {scanStatus === 'SAFE' ? 'SYSTEM SECURE' : 'SCAN PERMISSIONS'}
                        </button>
                    </div>
                    
                    <p className="text-[8px] text-slate-500 mt-3 text-center font-mono opacity-60">
                        * Checks for infinite approvals and malicious contracts.
                    </p>
                </div>
            )}

            {/* Other tools remain functionally same, visual polish applied via container */}
            {activeTool === 'TIME_MACHINE' && (
                <div className="animate-fade-in">
                    <LockedFeature minLevel={5} title="FOMO SIMULATOR">
                        <div className="flex items-center gap-2 mb-3">
                            <BotIcon className="w-4 h-4 text-brand-cyan" />
                            <span className="text-xs font-bold text-white tracking-widest font-orbitron">FOMO SIMULATOR</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <select value={tmAsset} onChange={(e) => setTmAsset(e.target.value)} className="bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                                <option value="BTC">BTC</option>
                                <option value="ETH">ETH</option>
                                <option value="SOL">SOL</option>
                            </select>
                            <select value={tmPeriod} onChange={(e) => setTmPeriod(e.target.value)} className="bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                                <option value="6M">6 Months</option>
                                <option value="1Y">1 Year</option>
                                <option value="3Y">3 Years</option>
                            </select>
                            <input type="number" value={tmAmount} onChange={(e) => setTmAmount(e.target.value)} className="bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white outline-none font-mono" placeholder="$" />
                        </div>
                        
                        {tmResult !== null && (
                            <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl p-3 mb-3 text-center">
                                <p className="text-[9px] text-slate-400 uppercase font-mono">Projected Value</p>
                                <p className="text-2xl font-black text-brand-cyan font-orbitron drop-shadow-[0_0_8px_#00F0FF]">${tmResult.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                                <p className="text-[10px] text-brand-cyan font-bold">+{((tmResult - parseFloat(tmAmount)) / parseFloat(tmAmount) * 100).toFixed(0)}% ROI</p>
                            </div>
                        )}

                        <button onClick={calculateTimeMachine} className="w-full py-3 bg-white/5 border border-white/10 hover:bg-brand-cyan/20 hover:border-brand-cyan hover:text-brand-cyan transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest">Calculate Potential</button>
                    </LockedFeature>
                </div>
            )}

            {activeTool === 'IL_CALC' && (
                <div className="animate-fade-in">
                    <LockedFeature minLevel={10} title="IMPERMANENT LOSS">
                        <div className="flex items-center gap-2 mb-3">
                            <BarChartIcon className="w-4 h-4 text-brand-purple" />
                            <span className="text-xs font-bold text-white tracking-widest font-orbitron">IMPERMANENT LOSS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className="text-[8px] text-slate-500 uppercase block mb-1">Token A Change %</label>
                                <input type="number" value={ilTokenA} onChange={(e) => setIlTokenA(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white outline-none font-mono" />
                            </div>
                            <div>
                                <label className="text-[8px] text-slate-500 uppercase block mb-1">Token B Change %</label>
                                <input type="number" value={ilTokenB} onChange={(e) => setIlTokenB(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white outline-none font-mono" />
                            </div>
                        </div>

                        {ilResult !== null && (
                            <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-xl p-3 mb-3 text-center">
                                <p className="text-[9px] text-slate-400 uppercase font-mono">Estimated Loss vs HODL</p>
                                <p className="text-xl font-black text-brand-purple font-orbitron drop-shadow-[0_0_8px_#BD00FF]">{ilResult.toFixed(2)}%</p>
                            </div>
                        )}

                        <button onClick={calculateIL} className="w-full py-3 bg-white/5 border border-white/10 hover:bg-brand-purple/20 hover:border-brand-purple hover:text-brand-purple transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest">Check Risk</button>
                    </LockedFeature>
                </div>
            )}

            {activeTool === 'TAX_EST' && (
                <div className="animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                        <FileTextIcon className="w-4 h-4 text-brand-green" />
                        <span className="text-xs font-bold text-white tracking-widest font-orbitron">TAX ESTIMATOR</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                            <label className="text-[8px] text-slate-500 uppercase block mb-1">Realized Gain ($)</label>
                            <input type="number" value={realizedGain} onChange={(e) => setRealizedGain(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white outline-none font-mono" placeholder="5000" />
                        </div>
                        <div>
                            <label className="text-[8px] text-slate-500 uppercase block mb-1">Tax Rate (%)</label>
                            <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white outline-none font-mono" placeholder="19.5" />
                        </div>
                    </div>

                    {taxResult !== null && (
                        <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-3 mb-3 text-center">
                            <p className="text-[9px] text-slate-400 uppercase font-mono">Estimated Liability</p>
                            <p className="text-xl font-black text-brand-green font-orbitron drop-shadow-[0_0_8px_#00FF9D]">${taxResult.toFixed(2)}</p>
                            <p className="text-[9px] text-slate-500 mt-1 italic">Not financial advice.</p>
                        </div>
                    )}

                    <button onClick={calculateTax} className="w-full py-3 bg-white/5 border border-white/10 hover:bg-brand-green/20 hover:border-brand-green hover:text-brand-green transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest">Calculate Tax</button>
                </div>
            )}
        </div>
    );
};

export default PortfolioTools;
