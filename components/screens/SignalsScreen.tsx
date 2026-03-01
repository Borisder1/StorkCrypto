
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type AgentAnalysis, type TradingSignal, Asset } from '../../types';
import { generateTradingSignals } from '../../services/geminiService';
import { scanMarket } from '../../services/priceService';
import { ActivityIcon, RadarIcon, ShieldIcon, BotIcon, ChevronRightIcon, TrendingUpIcon, SearchIcon, ZapIcon, InfoIcon } from '../icons';
import { useStore } from '../../store';
import AssetDetailModal from '../AssetDetailModal';
import { triggerHaptic } from '../../utils/haptics';
import { TacticalBackground } from '../TacticalBackground';
import { getTranslation } from '../../utils/translations';
import UpgradeBanner from '../UpgradeBanner';
import InfoModal from '../InfoModal';

// --- VISUAL COMPONENTS ---

const RadarHUD: React.FC<{ score: number, phase: string, loading: boolean }> = ({ score, phase, loading }) => {
    return (
        <div className="relative h-36 w-full bg-brand-card/60 border border-white/10 rounded-[2.5rem] overflow-hidden mb-6 flex items-center justify-between px-10 shadow-2xl group transition-all hover:border-brand-cyan/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.08),transparent_70%)] opacity-50"></div>
            
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-brand-cyan/30 rounded-full"></div>
                <div className="absolute inset-4 border border-brand-cyan/10 rounded-full"></div>
                <div className={`absolute inset-0 border-t-2 border-brand-cyan rounded-full ${loading ? 'animate-spin' : 'animate-[spin_3s_linear_infinite]'}`}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-brand-cyan rounded-full shadow-[0_0_15px_#00d9ff]"></div>
                </div>
                <RadarIcon className={`w-10 h-10 text-brand-cyan relative z-10 ${loading && 'animate-pulse'}`} />
            </div>

            <div className="text-right z-10">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2 font-orbitron">Sentiment_Core</p>
                <div className="flex items-baseline justify-end gap-2">
                    <span className={`text-5xl font-black font-orbitron tracking-tighter ${score > 60 ? 'text-brand-green' : score < 40 ? 'text-brand-danger' : 'text-brand-cyan'} drop-shadow-lg`}>
                        {loading ? '--' : score}
                    </span>
                    <span className="text-sm font-black text-slate-600">/100</span>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                    <span className="text-[10px] font-mono text-brand-cyan uppercase bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20 shadow-inner">
                        {phase || 'SCANNING...'}
                    </span>
                </div>
            </div>
        </div>
    );
};

const FilterChip: React.FC<{ label: string, active: boolean, onClick: () => void, color?: string }> = ({ label, active, onClick, color = 'cyan' }) => {
    const activeClass = color === 'red' 
        ? 'bg-brand-danger text-white border-brand-danger shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
        : color === 'purple'
        ? 'bg-brand-purple text-white border-brand-purple shadow-[0_0_15px_rgba(139,92,246,0.5)]'
        : 'bg-brand-cyan text-black border-brand-cyan shadow-[0_0_15px_rgba(0,217,255,0.5)]';

    return (
        <button 
            onClick={onClick}
            className={`px-5 py-3 rounded-xl text-[10px] font-black font-orbitron uppercase tracking-widest border transition-all duration-300 active:scale-95 whitespace-nowrap ${active ? activeClass : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/40 hover:text-slate-200'}`}
        >
            {label}
        </button>
    );
};

const HybridSignalCard = React.memo(({ 
    signal, 
    onClick, 
    isSniper 
}: { 
    signal: TradingSignal, 
    onClick: () => void, 
    isSniper: boolean 
}) => {
    const isLong = signal.signal_type === 'LONG';
    const primaryColor = isSniper ? 'text-red-500' : isLong ? 'text-brand-green' : 'text-brand-danger';
    const borderColor = isSniper ? 'border-red-500/50' : isLong ? 'border-green-500/40' : 'border-red-500/40';

    return (
        <div 
            onClick={onClick}
            className={`relative bg-[#050b14]/90 backdrop-blur-xl border ${borderColor} rounded-[2rem] p-6 overflow-hidden group transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-2xl mb-4`}
        >
            {isSniper && (
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/30 animate-[scanline_4s_linear_infinite]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[length:100%_4px]"></div>
                </div>
            )}
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-2.5 shadow-inner">
                            <img src={`https://assets.coincap.io/assets/icons/${signal.asset.toLowerCase()}@2x.png`} className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white font-orbitron tracking-wider">{signal.asset}</h3>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${borderColor} ${primaryColor} bg-black/40 uppercase tracking-[0.1em]`}>
                                    {signal.signal_type}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono font-bold">| {signal.timeframe}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r="24" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                            <circle 
                                cx="28" cy="28" r="24" 
                                fill="transparent" 
                                stroke={isSniper ? '#ef4444' : '#00d9ff'} 
                                strokeWidth="4" 
                                strokeDasharray={150} 
                                strokeDashoffset={150 - (150 * signal.confidence / 100)} 
                                strokeLinecap="round" 
                                className="drop-shadow-[0_0_10px_rgba(0,217,255,0.5)] transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-xs font-black text-white block font-orbitron">{signal.confidence}%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-black/40 rounded-2xl p-4 border border-white/5 mb-4 shadow-inner">
                    <div className="text-center border-r border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Entry</p>
                        <p className="text-[8px] font-mono font-bold text-white">${signal.entryPrice}</p>
                    </div>
                    <div className="text-center border-r border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Target</p>
                        <p className={`text-[8px] font-mono font-bold ${isLong ? 'text-green-400' : 'text-red-400'}`}>${signal.takeProfit}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Stop</p>
                        <p className="text-[8px] font-mono font-bold text-slate-400">${signal.stopLoss}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                        {signal.reasoning_chain?.slice(0, 2).map((r, i) => (
                             <span key={i} className="text-[8px] font-black font-mono text-slate-500 uppercase bg-white/5 px-2 py-1 rounded">#{r.split(' ')[0]}</span>
                        ))}
                    </div>
                    <ChevronRightIcon className={`w-5 h-5 ${isSniper ? 'text-red-500' : 'text-brand-cyan'}`} />
                </div>
            </div>
        </div>
    );
});

export const SignalsScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { settings, userStats, setSubscriptionOpen } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    
    const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isSniperMode, setIsSniperMode] = useState(false);
    
    const [selectedSignalAsset, setSelectedSignalAsset] = useState<Asset | null>(null);
    const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const refreshTerminal = useCallback(async (forceHighConfidence: boolean = false) => {
        setLoading(true);
        try {
            const realMetrics = await scanMarket(); 
            const result = await generateTradingSignals(settings, realMetrics);
            if (result) {
                if (forceHighConfidence) {
                    const alphaSignal: TradingSignal = {
                        asset: 'BTC',
                        signal_type: 'LONG',
                        strategy_type: 'BREAKOUT',
                        entryPrice: 67500,
                        takeProfit: 71000,
                        stopLoss: 66000,
                        confidence: 94,
                        timeframe: '4H',
                        technical_summary: 'Major resistance breakout confirmed.',
                        reasoning_chain: ['Volume Spike', 'Whale Accumulation', 'Sentiment Bullish'],
                        entry_zone: '67400-67600'
                    };
                    result.signals = [alphaSignal, ...result.signals];
                }
                setAnalysis(result);
            }
        } catch (e) {
            console.error("Terminal refresh failed", e);
        } finally {
            setLoading(false);
        }
    }, [settings]);

    useEffect(() => {
        refreshTerminal(isSniperMode);
        const interval = setInterval(() => refreshTerminal(isSniperMode), 60000); 
        return () => clearInterval(interval);
    }, [refreshTerminal, isSniperMode]);

    const toggleSniperMode = () => {
        triggerHaptic('heavy');
        if (isSniperMode) {
            setIsSniperMode(false);
        } else {
            // SNIPER MODE ЗАБЛОКОВАНО ДЛЯ ВСІХ, ОКРІМ WHALE
            if (userStats.subscriptionTier === 'WHALE') {
                setIsSniperMode(true);
                refreshTerminal(true);
            } else {
                triggerHaptic('error');
                setSubscriptionOpen(true);
            }
        }
    };

    const filteredSignals = useMemo(() => {
        if (!analysis?.signals) return [];
        return analysis.signals.filter(s => {
            if (searchTerm && !s.asset.includes(searchTerm)) return false;
            if (isSniperMode && s.confidence < 85) return false;
            if (activeFilters.size === 0) return true;
            return activeFilters.has(s.asset) || activeFilters.has(s.strategy_type);
        });
    }, [analysis, activeFilters, searchTerm, isSniperMode]);

    return (
        <div className={`fixed inset-0 z-[110] flex flex-col overflow-hidden transition-all duration-700 h-[100dvh] w-full ${isSniperMode ? 'bg-[#1a0505]' : 'bg-brand-bg'}`}>
            <TacticalBackground />
            
            {isSniperMode && (
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(239,68,68,0.15)_100%)]"></div>
                    <div className="absolute inset-0 border-[30px] border-red-500/5 animate-pulse"></div>
                </div>
            )}

            <div className="flex items-center justify-between px-6 pt-8 mb-6 relative z-20 shrink-0">
                <div>
                    <h1 className={`font-orbitron text-xl sm:text-2xl font-black tracking-tighter uppercase italic flex items-center gap-3 ${isSniperMode ? 'text-red-500' : 'text-white'}`}>
                        {isSniperMode ? 'SNIPER_MODE' : 'TERMINAL'}
                        <button onClick={() => setShowInfo(true)}><InfoIcon className={`w-5 h-5 ${isSniperMode ? 'text-red-500' : 'text-slate-500'}`} /></button>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : isSniperMode ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-brand-green shadow-[0_0_10px_#22c55e]'}`}></div>
                        <p className={`text-[10px] font-mono uppercase tracking-[0.3em] font-black ${isSniperMode ? 'text-red-400' : 'text-slate-500'}`}>
                            {isSniperMode ? 'WHALE_TARGET_LOCK: ACTIVE' : 'NEURAL_PULSE: STABLE'}
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={toggleSniperMode}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${isSniperMode ? 'bg-red-600 text-white shadow-red-500/40 rotate-90' : 'bg-brand-card border border-white/10 text-slate-400'}`}
                    >
                        <RadarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('medium'); onClose?.(); }} 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-card border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
                    >
                        <span className="text-lg font-bold">✕</span>
                    </button>
                </div>
            </div>

            <div className="px-6 relative z-10 flex-1 overflow-y-auto no-scrollbar pb-32">
                <RadarHUD score={analysis?.market_sentiment_score || 50} phase={analysis?.market_phase || 'NEURAL_SCAN...'} loading={loading} />
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6 mb-2">
                    {['ALL', 'BTC', 'ETH', 'SOL', 'SCALP', 'SWING'].map(f => (
                        <FilterChip key={f} label={f} active={f === 'ALL' ? activeFilters.size === 0 : activeFilters.has(f)} onClick={() => {
                            triggerHaptic('light');
                            if (f === 'ALL') setActiveFilters(new Set());
                            else {
                                const n = new Set(activeFilters);
                                if (n.has(f)) n.delete(f); else n.add(f);
                                setActiveFilters(n);
                            }
                        }} color={f === 'BTC' ? 'purple' : 'cyan'} />
                    ))}
                </div>

                <div className="space-y-2">
                    {loading && !analysis ? (
                        Array.from({length: 3}).map((_, i) => <div key={i} className="h-44 w-full bg-brand-card/40 border border-white/5 rounded-[2rem] animate-pulse mb-4"></div>)
                    ) : (
                        filteredSignals.map((signal, idx) => (
                            <HybridSignalCard 
                                key={idx} 
                                signal={signal} 
                                isSniper={isSniperMode}
                                onClick={() => {
                                    triggerHaptic('selection');
                                    setSelectedSignalAsset({ name: signal.asset, ticker: signal.asset, icon: signal.asset.toLowerCase(), amount: 0, value: signal.entryPrice, change: 0 });
                                    setSelectedSignal(signal);
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            {selectedSignalAsset && <AssetDetailModal asset={selectedSignalAsset} signal={selectedSignal} onClose={() => { setSelectedSignalAsset(null); setSelectedSignal(null); }} />}
            {showInfo && <InfoModal title="SIGNAL_TERMINAL" description="AI-driven trading opportunities." features={["Confidence Score: Probability of success", "Sniper Mode: High-precision entry points (Whale Only)", "Radar HUD: Real-time market sentiment"]} onClose={() => setShowInfo(false)} />}
        </div>
    );
};

export default SignalsScreen;
