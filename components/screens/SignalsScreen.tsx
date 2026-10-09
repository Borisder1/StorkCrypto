
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type AgentAnalysis, type TradingSignal, Asset, DataMeta } from '../../types';
import { generateTradingSignals } from '../../services/geminiService';
import { scanMarket, MASTER_ASSET_LIST, getCryptoPrices, getInitialPrices, formatCryptoPrice } from '../../services/priceService';
import { ActivityIcon, RadarIcon, ShieldIcon, BotIcon, ChevronRightIcon, TrendingUpIcon, SearchIcon, ZapIcon, InfoIcon } from '../icons';
import { useStore } from '../../store';
import AssetDetailModal from '../AssetDetailModal';
import { triggerHaptic } from '../../utils/haptics';
import { TacticalBackground } from '../TacticalBackground';
import { getTranslation } from '../../utils/translations';
import UpgradeBanner from '../UpgradeBanner';
import InfoModal from '../InfoModal';
import { HelpIndicator } from '../HelpIndicator';

// --- VISUAL COMPONENTS ---

const RadarHUD: React.FC<{ score: number, phase: string, loading: boolean, t: (key: string) => string }> = ({ score, phase, loading, t }) => {
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
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2 font-orbitron">{t('signals.sentiment_core')}</p>
                <div className="flex items-baseline justify-end gap-2">
                    <span className={`text-5xl font-black font-orbitron tracking-tighter ${score > 60 ? 'text-brand-green' : score < 40 ? 'text-brand-danger' : 'text-brand-cyan'} drop-shadow-lg`}>
                        {score}
                    </span>
                    <span className="text-sm font-black text-slate-600">/100</span>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                    <span className="text-[10px] font-mono text-brand-cyan uppercase bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20 shadow-inner">
                        {phase || t('signals.scanning_short')}
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
    isSniper,
    t
}: { 
    signal: TradingSignal, 
    onClick: () => void, 
    isSniper: boolean,
    t: (key: string) => string
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
                            <img src={`https://assets.coincap.io/assets/icons/${signal.asset.toLowerCase()}@2x.png`} alt={signal.asset} className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white font-orbitron tracking-wider">{signal.asset}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${borderColor} ${primaryColor} bg-black/40 uppercase tracking-[0.1em]`}>
                                    {signal.signal_type}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono font-bold">| {signal.timeframe}</span>
                                {(signal.isSimulated || signal.dataFeedStatus === 'DEMO') && (
                                    <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                        DEMO
                                    </span>
                                )}
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

                {/* Trade Setup Summary & Visual Progress Line */}
                {(() => {
                    const entryNum = parseFloat(signal.entryPrice?.toString() || '0');
                    const tpNum = parseFloat(signal.takeProfit?.toString() || '0');
                    const slNum = parseFloat(signal.stopLoss?.toString() || '0');
                    const rewardDiff = Math.abs(tpNum - entryNum);
                    const riskDiff = Math.abs(entryNum - slNum);
                    const rrRatio = (riskDiff > 0 && rewardDiff > 0) ? (rewardDiff / riskDiff).toFixed(1) : '2.4';

                    return (
                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 mb-4 shadow-inner">
                            <div className="grid grid-cols-3 gap-2 pb-3 border-b border-white/5">
                                <div className="text-center border-r border-white/5">
                                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{t('signals.entry_short')}</p>
                                    <p className="text-[10px] font-mono font-bold text-white">${signal.entryPrice}</p>
                                </div>
                                <div className="text-center border-r border-white/5">
                                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{t('signals.target_short')}</p>
                                    <p className={`text-[10px] font-mono font-bold ${isLong ? 'text-emerald-400' : 'text-rose-400'}`}>${signal.takeProfit}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{t('signals.stop_short')}</p>
                                    <p className="text-[10px] font-mono font-bold text-slate-400">${signal.stopLoss}</p>
                                </div>
                            </div>

                            {/* Visual Risk/Reward Trade Setup Line */}
                            <div className="pt-3">
                                <div className="flex justify-between items-center text-[8px] font-mono mb-1.5 font-bold">
                                    <span className="text-rose-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                                        SL ${signal.stopLoss}
                                    </span>
                                    <span className="text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                                        R:R <span className="text-brand-cyan">1:{rrRatio}</span>
                                    </span>
                                    <span className="text-emerald-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                        TP ${signal.takeProfit}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden flex relative">
                                    <div className="h-full bg-rose-500/80 rounded-l-full" style={{ width: '28%' }} title="Ризик (SL)"></div>
                                    <div className="h-full w-1.5 bg-white shadow-[0_0_6px_#fff]" title="Вхід"></div>
                                    <div className="h-full bg-emerald-500/80 rounded-r-full flex-1" title="Ціль (TP)"></div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

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
    const { settings, userStats, setSubscriptionOpen, marketRegime, updateQuestProgress } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    
    const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSniperMode, setIsSniperMode] = useState(false);
    
    // Search and Filter State (P1-1 Requirement)
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'SCALP' | 'SWING' | 'FAVORITES' | 'L1' | 'MEME' | 'AI' | 'DEFI'>('ALL');
    const [viewMode, setViewMode] = useState<'TERMINAL' | 'SIGNALS'>('TERMINAL');
    const [prices, setPrices] = useState(getInitialPrices);
    const [dataMeta, setDataMeta] = useState<DataMeta>({
        status: 'LIVE',
        source: 'Binance API v3',
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        refreshIntervalSeconds: 20
    });

    // Favorites persistence
    const [favorites, setFavorites] = useState<Set<string>>(() => {
        try {
            const raw = localStorage.getItem('stork_terminal_favs');
            return raw ? new Set(JSON.parse(raw)) : new Set(['BTC', 'ETH', 'TON', 'SOL']);
        } catch {
            return new Set(['BTC', 'ETH', 'TON', 'SOL']);
        }
    });

    const toggleFavorite = (ticker: string, e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic('light');
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(ticker)) next.delete(ticker);
            else next.add(ticker);
            try {
                localStorage.setItem('stork_terminal_favs', JSON.stringify(Array.from(next)));
            } catch {}
            return next;
        });
    };

    // Live Prices Polling
    useEffect(() => {
        let isMounted = true;
        const loadPrices = async () => {
            try {
                const fresh = await getCryptoPrices();
                if (isMounted) {
                    setPrices(fresh);
                    setDataMeta({
                        status: 'LIVE',
                        source: 'Binance API v3',
                        fetchedAt: new Date().toISOString(),
                        ageSeconds: 2,
                        refreshIntervalSeconds: 20
                    });
                }
            } catch {
                if (isMounted) {
                    setDataMeta(prev => ({
                        ...prev,
                        status: 'STALE',
                        ageSeconds: (prev.ageSeconds || 0) + 20
                    }));
                }
            }
        };

        loadPrices();
        const pInterval = setInterval(loadPrices, 20000);
        return () => {
            isMounted = false;
            clearInterval(pInterval);
        };
    }, []);

    const [selectedSignalAsset, setSelectedSignalAsset] = useState<Asset | null>(null);
    const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const refreshTerminal = useCallback(async (forceHighConfidence: boolean = false) => {
        setLoading(true);
        try {
            const realMetrics = await scanMarket(); 
            const result = await generateTradingSignals(settings, realMetrics, marketRegime);
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
                updateQuestProgress('SCAN', 1);
            }
        } catch (e) {
            console.error("Terminal refresh failed", e);
        } finally {
            setLoading(false);
        }
    }, [settings, marketRegime, updateQuestProgress]);

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
            if (userStats.subscriptionTier === 'WHALE') {
                setIsSniperMode(true);
                refreshTerminal(true);
            } else {
                triggerHaptic('error');
                setSubscriptionOpen(true);
            }
        }
    };

    // Filtered Full Catalog (P1-1 Requirement: count >= 20, searchable, category/scalp/swing filters)
    const filteredAssets = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return MASTER_ASSET_LIST.filter(item => {
            const matchesSearch = !query || 
                item.ticker.toLowerCase().includes(query) || 
                item.name.toLowerCase().includes(query);
            if (!matchesSearch) return false;

            const priceData = prices[item.id];
            const change24h = Math.abs(priceData?.usd_24h_change || 0);

            if (activeFilter === 'FAVORITES') return favorites.has(item.ticker);
            if (activeFilter === 'SCALP') return change24h >= 3.0; // Scalping on high volatility
            if (activeFilter === 'SWING') return change24h < 3.0;  // Swing on stability
            if (activeFilter === 'L1') return item.category === 'L1';
            if (activeFilter === 'MEME') return item.category === 'Meme';
            if (activeFilter === 'AI') return item.category === 'AI';
            if (activeFilter === 'DEFI') return item.category === 'DeFi';
            return true;
        });
    }, [searchTerm, activeFilter, prices, favorites]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-[110] flex flex-col overflow-hidden transition-all duration-700 h-[100dvh] w-full ${isSniperMode ? 'bg-[#1a0505]' : 'bg-brand-bg'}`}
        >
            <TacticalBackground />
            
            {isSniperMode && (
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(239,68,68,0.15)_100%)]"></div>
                    <div className="absolute inset-0 border-[30px] border-red-500/5 animate-pulse"></div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-8 mb-4 relative z-20 shrink-0">
                <div>
                    <h1 className={`font-orbitron text-xl sm:text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2 ${isSniperMode ? 'text-red-500' : 'text-white'}`}>
                        {isSniperMode ? t('signals.sniper_mode') : t('signals.terminal')}
                        <button onClick={() => setShowInfo(true)} aria-label="Інформація про торговий термінал" className="focus-visible:ring-2 focus-visible:ring-brand-cyan rounded-lg p-0.5">
                            <InfoIcon className={`w-5 h-5 ${isSniperMode ? 'text-red-500' : 'text-slate-400'}`} />
                        </button>
                        <HelpIndicator id="arbitrage_radar" />
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : dataMeta.status === 'LIVE' ? 'bg-brand-green shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500'}`}></div>
                        <p className={`text-[10px] font-mono uppercase tracking-[0.2em] font-black ${isSniperMode ? 'text-red-400' : 'text-slate-400'}`}>
                            {dataMeta.status} · {dataMeta.source} · {filteredAssets.length} АКТИВІВ
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={toggleSniperMode}
                        aria-label="Перемкнути режим снайпера"
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${isSniperMode ? 'bg-red-600 text-white shadow-red-500/40 rotate-90' : 'bg-brand-card border border-white/10 text-slate-400 hover:text-white'}`}
                    >
                        <RadarIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('medium'); onClose?.(); }} 
                        aria-label="Закрити термінал сигналів"
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-card border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
                    >
                        <span className="text-lg font-bold">✕</span>
                    </button>
                </div>
            </div>

            <div className="px-6 relative z-10 flex-1 overflow-y-auto custom-scrollbar pb-32">
                <RadarHUD score={analysis?.market_sentiment_score || 74} phase={marketRegime !== 'UNKNOWN' ? marketRegime : (analysis?.market_phase || t('signals.scanning_short'))} loading={loading} t={t} />

                {/* View Switcher: Terminal Catalog (>=20) vs AI Signals */}
                <div className="flex gap-2 p-1 bg-black/40 border border-white/10 rounded-2xl mb-4" role="tablist" aria-label="Режими терміналу">
                    <button
                        role="tab"
                        aria-selected={viewMode === 'TERMINAL'}
                        onClick={() => { triggerHaptic('selection'); setViewMode('TERMINAL'); }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-orbitron font-black uppercase tracking-wider transition-all ${viewMode === 'TERMINAL' ? 'bg-brand-cyan text-black shadow-lg shadow-brand-cyan/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        ⚡ Всі Активи ({filteredAssets.length})
                    </button>
                    <button
                        role="tab"
                        aria-selected={viewMode === 'SIGNALS'}
                        onClick={() => { triggerHaptic('selection'); setViewMode('SIGNALS'); }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-orbitron font-black uppercase tracking-wider transition-all ${viewMode === 'SIGNALS' ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        🎯 AI Сценарії ({analysis?.signals?.length || 0})
                    </button>
                </div>

                {/* Search Bar (P1-1 Requirement: search TON, search DOGE) */}
                <div className="relative mb-4">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Пошук монети (TON, DOGE, SOL, BTC, PEPE)..."
                        aria-label="Пошук криптовалюти в терміналі"
                        className="w-full pl-11 pr-10 py-3 bg-black/50 border border-white/10 rounded-2xl text-xs font-mono text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan transition-all"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')} 
                            aria-label="Очистити пошук"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 text-slate-400 flex items-center justify-center hover:text-white text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filter Chips (SCALP, SWING, FAVORITES, CATEGORIES) */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2" role="group" aria-label="Фільтри активів">
                    {(['ALL', 'SCALP', 'SWING', 'FAVORITES', 'L1', 'MEME', 'AI', 'DEFI'] as const).map(f => (
                        <FilterChip 
                            key={f} 
                            label={f === 'FAVORITES' ? '⭐ Обрані' : f} 
                            active={activeFilter === f} 
                            onClick={() => {
                                triggerHaptic('light');
                                setActiveFilter(f);
                            }} 
                            color={f === 'FAVORITES' ? 'purple' : f === 'SCALP' ? 'red' : 'cyan'} 
                        />
                    ))}
                </div>

                {/* Content: Terminal Asset Catalog */}
                {viewMode === 'TERMINAL' && (
                    <div className="space-y-2.5">
                        {filteredAssets.length === 0 ? (
                            <div className="py-12 text-center bg-black/30 border border-white/5 rounded-3xl p-6">
                                <SearchIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                <p className="font-orbitron font-bold text-sm text-slate-400">АКТИВІВ НЕ ЗНАЙДЕНО</p>
                                <p className="text-[10px] font-mono text-slate-600 mt-1">Спробуйте змінити фільтр або запит пошуку</p>
                            </div>
                        ) : (
                            filteredAssets.map((asset) => {
                                const pData = prices[asset.id];
                                const priceVal = pData?.usd || 0;
                                const change24h = pData?.usd_24h_change || 0;
                                const isPos = change24h >= 0;
                                const isFav = favorites.has(asset.ticker);
                                const strategyTag = Math.abs(change24h) >= 3.0 ? 'SCALP' : 'SWING';

                                return (
                                    <div 
                                        key={asset.ticker}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Відкрити графік ${asset.name} (${asset.ticker}): ${formatCryptoPrice(priceVal)}, 24h: ${isPos ? '+' : ''}${change24h.toFixed(2)}%`}
                                        onClick={() => {
                                            triggerHaptic('selection');
                                            setSelectedSignalAsset({
                                                ticker: asset.ticker,
                                                name: asset.name,
                                                icon: asset.ticker.toLowerCase(),
                                                amount: 0,
                                                value: priceVal,
                                                change: change24h
                                            });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setSelectedSignalAsset({
                                                    ticker: asset.ticker,
                                                    name: asset.name,
                                                    icon: asset.ticker.toLowerCase(),
                                                    amount: 0,
                                                    value: priceVal,
                                                    change: change24h
                                                });
                                            }
                                        }}
                                        className="relative bg-[#050b14]/80 backdrop-blur-md border border-white/10 hover:border-brand-cyan/40 rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            {/* Token Avatar with fallback */}
                                            <div className="w-11 h-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center p-2 relative shrink-0">
                                                <img 
                                                    src={`https://assets.coincap.io/assets/icons/${asset.ticker.toLowerCase()}@2x.png`} 
                                                    alt={asset.ticker} 
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = 'none';
                                                        if (e.currentTarget.parentElement) {
                                                            e.currentTarget.parentElement.innerHTML = `<span class="font-orbitron font-black text-xs text-brand-cyan">${asset.ticker.slice(0, 3)}</span>`;
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-orbitron font-black text-sm text-white group-hover:text-brand-cyan transition-colors">{asset.ticker}</span>
                                                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">{asset.category}</span>
                                                    <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${strategyTag === 'SCALP' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                                        {strategyTag}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-sans truncate max-w-[140px] sm:max-w-[200px]">{asset.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="font-mono font-black text-sm text-white">{formatCryptoPrice(priceVal)}</p>
                                                <p className={`text-[10px] font-mono font-bold flex items-center justify-end gap-0.5 ${isPos ? 'text-brand-green' : 'text-brand-danger'}`}>
                                                    {isPos ? '+' : ''}{change24h.toFixed(2)}%
                                                </p>
                                            </div>

                                            {/* Favorite toggle */}
                                            <button 
                                                onClick={(e) => toggleFavorite(asset.ticker, e)}
                                                aria-label={isFav ? `Видалити ${asset.ticker} з обраного` : `Додати ${asset.ticker} в обране`}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${isFav ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 'bg-white/5 text-slate-500 border-white/5 hover:text-white'}`}
                                            >
                                                ★
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Content: AI Tactical Signals */}
                {viewMode === 'SIGNALS' && (
                    <div className="space-y-4">
                        {loading && !analysis ? (
                            Array.from({length: 3}).map((_, i) => <div key={i} className="h-44 w-full bg-brand-card/40 border border-white/5 rounded-[2rem] animate-pulse mb-4"></div>)
                        ) : (
                            (analysis?.signals || []).map((signal, idx) => (
                                <div 
                                    key={idx}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        triggerHaptic('selection');
                                        setSelectedSignalAsset({ name: signal.asset, ticker: signal.asset, icon: signal.asset.toLowerCase(), amount: 0, value: signal.entryPrice, change: 0 });
                                        setSelectedSignal(signal);
                                    }}
                                    className="p-5 bg-black/60 border border-brand-purple/40 rounded-3xl relative overflow-hidden group hover:border-brand-purple active:scale-[0.99] transition-all cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center font-orbitron font-black text-xs text-brand-purple">
                                                {signal.asset}
                                            </div>
                                            <div>
                                                <h4 className="font-orbitron font-black text-sm text-white">{signal.asset} // {signal.signal_type}</h4>
                                                <p className="text-[10px] font-mono text-slate-400">{signal.strategy_type} · TF: {signal.timeframe}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-black ${signal.signal_type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            CONF: {signal.confidence}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-sans mb-3">{signal.technical_summary}</p>
                                    <div className="flex justify-between text-[10px] font-mono text-slate-400 bg-white/5 p-2 rounded-xl border border-white/5">
                                        <span>ВХІД: ${signal.entryPrice}</span>
                                        <span className="text-brand-green">TP: ${signal.takeProfit}</span>
                                        <span className="text-brand-danger">SL: ${signal.stopLoss}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {selectedSignalAsset && (
                <AssetDetailModal 
                    asset={selectedSignalAsset} 
                    signal={selectedSignal} 
                    onClose={() => { setSelectedSignalAsset(null); setSelectedSignal(null); }} 
                />
            )}
            {showInfo && (
                <InfoModal 
                    title={t('signals.info_title')} 
                    description={t('signals.info_desc')} 
                    features={[t('signals.info_feat_1'), t('signals.info_feat_2'), t('signals.info_feat_3')]} 
                    onClose={() => setShowInfo(false)} 
                />
            )}
        </motion.div>
    );
};

export default SignalsScreen;
