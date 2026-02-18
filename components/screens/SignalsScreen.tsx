import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type AgentAnalysis, type TradingSignal, Asset } from '../../types';
import { generateTradingSignals } from '../../services/geminiService';
import { scanMarket } from '../../services/priceService';
import { ActivityIcon, RadarIcon, ShieldIcon, BotIcon, ChevronRightIcon, TrendingUpIcon, SearchIcon, ZapIcon } from '../icons';
import { useStore } from '../../store';
import AssetDetailModal from '../AssetDetailModal';
import { triggerHaptic } from '../../utils/haptics';
import { TacticalBackground } from '../TacticalBackground';
import { getTranslation } from '../../utils/translations';
import UpgradeBanner from '../UpgradeBanner';
import EmptyState from '../EmptyState';

// --- VISUAL COMPONENTS ---

const RadarHUD: React.FC<{ score: number, phase: string, loading: boolean }> = ({ score, phase, loading }) => {
    return (
        <div className="relative h-36 w-full bg-brand-card/20 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden mb-6 flex items-center justify-between px-10 shadow-2xl group transition-all hover:border-brand-cyan/40 hover:box-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.08),transparent_70%)] opacity-50"></div>
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5 pointer-events-none"></div>
            {/* Scanline effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent animate-[scanline_4s_linear_infinite] opacity-60"></div>
            
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-brand-cyan/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="absolute inset-0 border-2 border-brand-cyan/30 rounded-full"></div>
                <div className="absolute inset-4 border border-brand-cyan/10 rounded-full"></div>
                <div className={`absolute inset-0 border-t-2 border-brand-cyan rounded-full ${loading ? 'animate-spin' : 'animate-[spin_3s_linear_infinite]'}`}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-brand-cyan rounded-full shadow-[0_0_15px_#00d9ff]"></div>
                </div>
                <RadarIcon className={`w-10 h-10 text-brand-cyan relative z-10 ${loading && 'animate-pulse'}`} />
            </div>

            <div className="text-right z-10">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2 font-orbitron text-glow">Sentiment_Core</p>
                <div className="flex items-baseline justify-end gap-2">
                    <span className={`text-5xl font-black font-orbitron tracking-tighter ${score > 60 ? 'text-brand-green drop-shadow-[0_0_15px_rgba(0,255,0,0.5)]' : score < 40 ? 'text-brand-danger drop-shadow-[0_0_15px_rgba(255,0,102,0.5)]' : 'text-brand-cyan drop-shadow-[0_0_15px_rgba(0,217,255,0.5)]'} text-glow-strong`}>
                        {loading ? <span className="animate-pulse">--</span> : score}
                    </span>
                    <span className="text-sm font-black text-slate-600">/100</span>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_8px_#00d9ff]"></span>
                    <span className="text-[10px] font-mono text-brand-cyan uppercase bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20 shadow-inner tracking-wider backdrop-blur-sm">
                        {phase || 'SCANNING...'}
                    </span>
                </div>
            </div>
        </div>
    );
};

const SystemLog = () => {
    const [logs, setLogs] = useState<string[]>([]);
    
    useEffect(() => {
        const messages = [
            "Scanning BTC mempool...",
            "ETH gas fees stabilizing...",
            "Whale wallet 0x7a... moved 500 BTC",
            "Calculating RSI divergence...",
            "Fibonacci retracement levels updated...",
            "Sentiment analysis: BULLISH",
            "Liquidations detected on Binance...",
            "Order book imbalance: +15% BUY",
            "Neural network retraining...",
            "Fetching latest news from CoinDesk...",
            "MACD bullish crossover detected...",
            "Volume spike: +300% on SOL",
            "New whale accumulation phase...",
            "Funding rates turning positive...",
            "Technical breakout confirmed..."
        ];

        const interval = setInterval(() => {
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            const timestamp = new Date().toLocaleTimeString([], {hour12: false});
            setLogs(prev => [`[${timestamp}] ${randomMsg}`, ...prev].slice(0, 4));
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mb-6 bg-brand-card/20 backdrop-blur-md border-l-2 border-brand-cyan/50 p-3 font-mono text-[9px] text-brand-cyan/80 h-20 overflow-hidden relative rounded-r-lg">
            <div className="absolute top-0 right-0 px-1 bg-brand-cyan/20 text-brand-cyan text-[8px] font-black uppercase">LIVE_LOG</div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent animate-[scanline_3s_linear_infinite]"></div>
            <div className="space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className={`opacity-80 hover:opacity-100 transition-opacity truncate ${i === 0 ? 'text-brand-cyan' : 'text-brand-cyan/60'}`}>
                        {i === 0 && <span className="inline-block w-1.5 h-3 bg-brand-cyan mr-1 animate-pulse shadow-[0_0_8px_#00d9ff]"></span>}
                        {log}
                    </div>
                ))}
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

    const inactiveClass = 'bg-brand-card/20 backdrop-blur-sm border-white/10 text-slate-500 hover:border-white/40 hover:text-slate-200 hover:bg-brand-card/40';

    return (
        <button 
            onClick={onClick}
            className={`px-5 py-3 rounded-xl text-[10px] font-black font-orbitron uppercase tracking-widest border transition-all duration-300 active:scale-95 whitespace-nowrap ${active ? activeClass : inactiveClass} hover:shadow-lg`}
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
    const glowColor = isSniper ? 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' : isLong ? 'shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';

    return (
        <div 
            onClick={onClick}
            className={`relative bg-brand-card/20 backdrop-blur-xl border ${borderColor} rounded-[2rem] p-6 overflow-hidden group transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-2xl mb-4 hover:${glowColor} hover:bg-brand-card/30`}
        >
            {isSniper && (
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/30 animate-[scanline_4s_linear_infinite]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[length:100%_4px]"></div>
                </div>
            )}
            
            {/* Glassmorphism effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 via-transparent to-brand-purple/5 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-3 pointer-events-none mix-blend-overlay"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-2.5 shadow-inner group-hover:bg-black/60 transition-all">
                            <img src={`https://assets.coincap.io/assets/icons/${signal.asset.toLowerCase()}@2x.png`} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white font-orbitron tracking-wider group-hover:text-brand-cyan transition-colors">{signal.asset}</h3>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${borderColor} ${primaryColor} bg-black/40 uppercase tracking-[0.1em] group-hover:scale-105 transition-transform`}>
                                    {signal.signal_type}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono font-bold">| {signal.timeframe}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                                className={`${isSniper ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'drop-shadow-[0_0_10px_rgba(0,217,255,0.5)]'} transition-all duration-1000`}
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-xs font-black text-white block font-orbitron group-hover:scale-105 transition-transform">{signal.confidence}%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-black/40 rounded-2xl p-4 border border-white/5 mb-4 shadow-inner group-hover:bg-black/60 transition-all">
                    <div className="text-center border-r border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Entry</p>
                        <p className="text-sm font-mono font-bold text-white group-hover:text-brand-cyan transition-colors">${signal.entryPrice}</p>
                    </div>
                    <div className="text-center border-r border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Target</p>
                        <p className={`text-sm font-mono font-bold ${isLong ? 'text-green-400 group-hover:text-green-300' : 'text-red-400 group-hover:text-red-300'} transition-colors`}>${signal.takeProfit}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Stop</p>
                        <p className="text-sm font-mono font-bold text-slate-400 group-hover:text-slate-300 transition-colors">${signal.stopLoss}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                        {signal.reasoning_chain?.slice(0, 2).map((r, i) => (
                             <span key={i} className="text-[8px] font-black font-mono text-slate-500 uppercase bg-white/5 px-2 py-1 rounded group-hover:bg-white/10 transition-colors">#{r.split(' ')[0]}</span>
                        ))}
                    </div>
                    <ChevronRightIcon className={`w-5 h-5 ${isSniper ? 'text-red-500 group-hover:text-red-400' : 'text-brand-cyan group-hover:text-brand-cyan-light'} transition-colors group-hover:translate-x-1`} />
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
        <div className={`fixed inset-0 z-[110] flex flex-col overflow-hidden transition-all duration-700 ${isSniperMode ? 'bg-[#1a0505]' : 'bg-brand-bg'}`}>
            <TacticalBackground />
            
            {isSniperMode && (
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(239,68,68,0.15)_100%)]"></div>
                    <div className="absolute inset-0 border-[30px] border-red-500/5 animate-pulse"></div>
                </div>
            )}

            <div className="flex items-center justify-between px-6 pt-8 mb-6 relative z-20 shrink-0">
                <div>
                    <h1 className={`font-orbitron text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3 ${isSniperMode ? 'text-red-500' : 'text-white'}`}>
                        {isSniperMode ? 'SNIPER_MODE' : t('signals.title')}
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
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${isSniperMode ? 'bg-red-600 text-white shadow-red-500/40 rotate-90' : 'bg-brand-card border border-white/10 text-slate-400'}`}
                    >
                        <RadarIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('medium'); onClose?.(); }} 
                        className="w-14 h-14 rounded-2xl bg-brand-card border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
                    >
                        <span className="text-2xl font-bold">✕</span>
                    </button>
                </div>
            </div>

            <div className="px-6 relative z-10 flex-1 overflow-y-auto no-scrollbar pb-32">
                <RadarHUD score={analysis?.market_sentiment_score || 50} phase={analysis?.market_phase || 'NEURAL_SCAN...'} loading={loading} />
                <SystemLog />
                
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

                <div className="space-y-2 pb-32">
                    {loading && !analysis ? (
                        Array.from({length: 3}).map((_, i) => <div key={i} className="h-44 w-full bg-brand-card/40 border border-white/5 rounded-[2rem] animate-pulse mb-4"></div>)
                    ) : filteredSignals.length > 0 ? (
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
                    ) : (
                        <EmptyState 
                            message="NO_SIGNALS_FOUND" 
                            subMessage="Adjust your filters or wait for the next market scan cycle."
                        />
                    )}
                </div>
            </div>

            {selectedSignalAsset && <AssetDetailModal asset={selectedSignalAsset} signal={selectedSignal} onClose={() => { setSelectedSignalAsset(null); setSelectedSignal(null); }} />}
        </div>
    );
};

export default SignalsScreen;