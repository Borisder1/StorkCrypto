import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUpIcon, ShieldIcon, PieChartIcon, PickaxeIcon, ActivityIcon, RadarIcon, ZapIcon, GlobeIcon, BotIcon, InfoIcon, BrainIcon, FlameIcon, WalletIcon } from '../icons';
import { useStore } from '../../store';
import { NavItem } from '../../types';
import AIInsightWidget from '../AIInsightWidget';
import NumberTicker from '../NumberTicker';
import { TacticalBackground } from '../TacticalBackground';
import { triggerHaptic } from '../../utils/haptics';
import { binanceWS } from '../../services/websocketService';
import { WhaleTrackerWidget } from '../WhaleTrackerWidget';
import QuestWidget from '../QuestWidget';
import { getTranslation } from '../../utils/translations';
import UpgradeBanner from '../UpgradeBanner';
import { getFearGreedIndex } from '../../services/priceService';
import InfoModal from '../InfoModal';
import { AIMarketSummary } from '../AIMarketSummary';
import DexAggregatorModal from '../DexAggregatorModal';
import AIAgentModal from '../AIAgentModal';

const MarketPulseWidget: React.FC = () => {
    const { settings, marketRegime } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    const [pulse, setPulse] = useState({ dom: 54.2, fear: 50, load: 24 });
    
    useEffect(() => {
        const fetchData = async () => {
            const data = await getFearGreedIndex();
            setPulse(prev => ({ ...prev, fear: data.value }));
        };
        fetchData();

        const interval = setInterval(() => {
            setPulse(prev => ({
                ...prev,
                dom: prev.dom + (Math.random() - 0.5) * 0.05,
                load: Math.floor(20 + Math.random() * 15)
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getRegimeTranslation = (regime: string) => {
        const lang = settings?.language || 'en';
        const map: Record<string, Record<string, string>> = {
            en: {
                'VOLATILE_BULL': 'VOLATILE BULL',
                'VOLATILE_BEAR': 'VOLATILE BEAR',
                'QUIET_RANGING': 'QUIET RANGING',
                'BULL_TREND': 'BULL TREND',
                'BEAR_TREND': 'BEAR TREND',
                'UNKNOWN': 'UNKNOWN'
            },
            ua: {
                'VOLATILE_BULL': 'ВОЛАТИЛЬНИЙ БИК',
                'VOLATILE_BEAR': 'ВОЛАТИЛЬНИЙ ВЕДМІДЬ',
                'QUIET_RANGING': 'СПОКІЙНИЙ ФЛЕТ',
                'BULL_TREND': 'БИЧАЧИЙ ТРЕНД',
                'BEAR_TREND': 'ВЕДМЕЖИЙ ТРЕНД',
                'UNKNOWN': 'НЕВІДОМО'
            },
            pl: {
                'VOLATILE_BULL': 'ZMIENNY BYK',
                'VOLATILE_BEAR': 'ZMIENNY NIEDŹWIEDŹ',
                'QUIET_RANGING': 'SPOKOJNY KONSOLIDACJA',
                'BULL_TREND': 'TREND BYCZY',
                'BEAR_TREND': 'TREND SPADKOWY',
                'UNKNOWN': 'NIEZNANY'
            }
        };
        return map[lang]?.[regime] || regime;
    };

    return (
        <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-brand-card/40 border border-white/10 rounded-2xl p-2.5 text-center group hover:border-brand-cyan/30 transition-all">
                <p className="text-[9px] text-slate-400 uppercase font-black mb-1">{t('market.btc_dom')}</p>
                <p className="text-xs font-black text-brand-cyan font-mono">{pulse.dom.toFixed(1)}%</p>
            </div>
            <div className="bg-brand-card/40 border border-white/10 rounded-2xl p-2.5 text-center relative overflow-hidden group hover:border-brand-green/30 transition-all">
                <p className="text-[9px] text-slate-400 uppercase font-black mb-1">{t('market.fear_greed')}</p>
                <p className={`text-xs font-black font-mono ${pulse.fear > 60 ? 'text-brand-green' : pulse.fear < 40 ? 'text-brand-danger' : 'text-yellow-500'}`}>{pulse.fear}</p>
            </div>
            <div className="bg-brand-card/40 border border-white/10 rounded-2xl p-2.5 text-center group hover:border-brand-purple/30 transition-all">
                <p className="text-[9px] text-slate-400 uppercase font-black mb-1">{t('market.load')}</p>
                <p className="text-xs font-black text-brand-purple font-mono">{pulse.load}%</p>
            </div>
            <div className="bg-brand-card/40 border border-white/10 rounded-2xl p-2.5 text-center group hover:border-brand-purple/30 transition-all">
                <p className="text-[9px] text-slate-400 uppercase font-black mb-1">{t('market.phase')}</p>
                <p className="text-[9px] font-black text-white truncate uppercase tracking-tighter">{getRegimeTranslation(marketRegime)}</p>
            </div>
        </div>
    );
};

const ConnectivityWidget: React.FC = () => {
    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    return (
        <div className="bg-[#050b14]/60 border border-white/10 rounded-[1.5rem] p-3.5 mb-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                    <GlobeIcon className="w-5 h-5 text-brand-green animate-pulse" />
                </div>
                <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest leading-none font-orbitron">{t('connect.neural_status')}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{t('connect.nodes_active')}</p>
                </div>
            </div>
            <div className="flex gap-1.5">
                {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-4 rounded-full ${i < 5 ? 'bg-brand-cyan shadow-[0_0_8px_#00d9ff]' : 'bg-slate-800'}`}></div>)}
            </div>
        </div>
    );
};

const HomeScreen: React.FC<{ onNavigate: (tab: NavItem) => void }> = ({ onNavigate }) => {
    const { 
        assets = [], 
        wallet,
        userStats, 
        navigateTo, 
        updateAssetPrice, 
        settings,
        setShowAirdrop,
        setShowSentinel
    } = useStore();
    
    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    
    // Check if real wallet is connected or Demo state
    const isWalletConnected = !!(wallet?.isConnected && wallet?.address);
    const liveBalance = (assets || []).reduce((a,c) => a + (c.value || 0), 0);
    const displayBalance = isWalletConnected ? liveBalance : (userStats?.demoBalance || 10000);
    
    const [wsStatus, setWsStatus] = useState<'CONNECTING' | 'LIVE' | 'OFFLINE'>('CONNECTING');
    
    const [infoModalState, setInfoModalState] = useState<{open: boolean, title: string, desc: string, features: string[]} | null>(null);

    const [showDisclaimer, setShowDisclaimer] = useState(() => {
        return localStorage.getItem('stork_disclaimer_accepted') !== 'true';
    });

    const dismissDisclaimer = () => {
        triggerHaptic('medium');
        localStorage.setItem('stork_disclaimer_accepted', 'true');
        setShowDisclaimer(false);
    };

    const [showCustomize, setShowCustomize] = useState(false);
    const [showDex, setShowDex] = useState(false);
    const [showAIAgents, setShowAIAgents] = useState(false);

    useEffect(() => {
        const unsubscribe = binanceWS.subscribe((data) => {
            setWsStatus('LIVE');
            Object.keys(data).forEach(ticker => {
                const { price, change } = data[ticker];
                updateAssetPrice(ticker, price, change);
            });
        });
        return () => { unsubscribe(); };
    }, [updateAssetPrice]);

    const openInfo = (type: 'MINING' | 'SENTINEL' | 'WHALE') => {
        triggerHaptic('light');
        if (type === 'MINING') {
            setInfoModalState({
                open: true,
                title: t('info.mining_title'),
                desc: t('info.mining_desc'),
                features: ['0.01 STORK/sec Base Rate', 'Need to claim every 8 hours', 'Boost rate by inviting friends']
            });
        } else if (type === 'SENTINEL') {
            setInfoModalState({
                open: true,
                title: t('info.sentinel_title'),
                desc: t('info.sentinel_desc'),
                features: ['Push Notifications', 'Whale Alerts > $100k', 'Volatility Warnings']
            });
        } else if (type === 'WHALE') {
            setInfoModalState({
                open: true,
                title: t('info.whale_title'),
                desc: t('info.whale_desc'),
                features: ['Exchange Inflows (Dump Risk)', 'Accumulation Wallets', 'Dark Pool Detection']
            });
        }
    };

    const toggleWidget = (key: keyof typeof settings.dashboardConfig) => {
        triggerHaptic('selection');
        useStore.getState().updateSettings({
            dashboardConfig: {
                ...settings.dashboardConfig,
                [key]: !settings.dashboardConfig[key]
            }
        });
    };

    return (
        <div className="min-h-screen relative pb-36">
             <TacticalBackground />
             
             {/* Responsive Outer Container: Full width on desktop, ergonomic on mobile */}
             <div className="px-4 sm:px-6 lg:px-8 pt-4 safe-area-pt relative z-20 max-w-7xl mx-auto w-full">
                {/* HEADER: Logo + User Profile + Interface Mode Switcher */}
                <div className="flex justify-between items-center mb-5 py-2.5 border-b border-white/10 backdrop-blur-md bg-black/30 rounded-2xl px-4">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
                        <div className="relative group">
                            <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-cyan/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                                <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="StorCrypto Logo" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-green rounded-full shadow-[0_0_8px_#22c55e] border-2 border-[#020617] animate-pulse"></div>
                        </div>
                        <div>
                            <h1 className="font-orbitron font-black text-xs sm:text-sm tracking-[0.15em] text-white leading-none">STOR<span className="text-brand-cyan">CRYPTO</span></h1>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">NEURAL TERMINAL</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* Terminal Mode Switcher (SIMPLE / PRO) */}
                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                const newMode = settings.interfaceMode === 'SIMPLE' ? 'PRO' : 'SIMPLE';
                                useStore.getState().updateSettings({ interfaceMode: newMode });
                            }}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[10px] font-orbitron font-black tracking-wider transition-all ${
                                settings.interfaceMode === 'SIMPLE'
                                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                    : 'bg-brand-cyan/15 border-brand-cyan/40 text-brand-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                            }`}
                            title="Toggle between Simple View & Pro Terminal"
                        >
                            {settings.interfaceMode === 'SIMPLE' ? '⚡ SIMPLE' : '🔬 PRO'}
                        </button>

                        {/* User Cabinet Button */}
                        <button 
                            onClick={() => navigateTo('profile')}
                            className="flex items-center gap-2.5 bg-white/5 hover:bg-brand-cyan/10 border border-white/10 hover:border-brand-cyan/50 rounded-xl p-1.5 pr-3 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center relative border border-white/10 overflow-hidden">
                                 {userStats.avatarUrl ? (
                                     <img src={userStats.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                 ) : (
                                     <BotIcon className="w-4 h-4 text-slate-300 group-hover:text-brand-cyan transition-colors" />
                                 )}
                                 <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-[#020617] ${wsStatus === 'LIVE' ? 'bg-brand-green shadow-[0_0_5px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></div>
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <span className="text-[10px] font-black text-white uppercase group-hover:text-brand-cyan transition-colors max-w-[80px] truncate">
                                    {userStats.username || 'PILOT'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-brand-cyan font-mono font-bold bg-brand-cyan/15 px-1.5 py-0.2 rounded">{userStats.xp} XP</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* QUICK AI RADAR PRESETS BAR */}
                <div className="flex items-center gap-2.5 mb-5 overflow-x-auto no-scrollbar py-1">
                    <button
                        onClick={() => {
                            triggerHaptic('light');
                            useStore.getState().setIsAIChatOpen(true);
                        }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-orbitron font-black tracking-wider uppercase shrink-0 hover:bg-brand-cyan/20 transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                    >
                        <BotIcon className="w-3.5 h-3.5 text-brand-cyan" />
                        AI Market Scan
                    </button>
                    <button
                        onClick={() => {
                            triggerHaptic('light');
                            useStore.getState().setShowWhaleRadar(true);
                        }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-[10px] font-orbitron font-black tracking-wider uppercase shrink-0 hover:bg-brand-purple/20 transition-all shadow-[0_0_12px_rgba(189,0,255,0.15)]"
                    >
                        <RadarIcon className="w-3.5 h-3.5 text-brand-purple" />
                        Whale Radar
                    </button>
                    <button
                        onClick={() => {
                            triggerHaptic('light');
                            useStore.getState().setShowLiquidationHeatmap(true);
                        }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-orbitron font-black tracking-wider uppercase shrink-0 hover:bg-orange-500/20 transition-all"
                    >
                        <FlameIcon className="w-3.5 h-3.5 text-orange-400" />
                        Liq Heatmap
                    </button>
                </div>

                {/* RESPONSIVE CYBER TERMINAL GRID (12 Cols on Desktop, 1 Col on Mobile) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    {/* LEFT COLUMN (4 cols on Desktop): Portfolio, Connectivity & Tactical Modules */}
                    <div className="lg:col-span-4 space-y-4">
                        
                        {/* NET LIQUIDITY & PORTFOLIO STATUS CARD */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="relative group cursor-pointer" 
                            onClick={() => { triggerHaptic('heavy'); navigateTo('portfolio'); }}
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 rounded-[2rem] blur opacity-40 group-hover:opacity-80 transition duration-700"></div>
                            <div className="relative bg-[#0a0f1e]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.04] group-hover:opacity-10 transition-opacity">
                                    <PieChartIcon className="w-16 h-16 text-brand-cyan" />
                                </div>
                                
                                <div className="flex justify-between items-center mb-2.5 relative z-10">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] font-orbitron flex items-center gap-2">
                                        <PieChartIcon className="w-3.5 h-3.5 text-brand-cyan" /> 
                                        {t('portfolio.net_liquidity')}
                                    </span>
                                    
                                    {/* Mode Indicator Badge */}
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border ${
                                        isWalletConnected 
                                            ? 'bg-brand-green/15 border-brand-green/40 text-brand-green' 
                                            : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                    }`}>
                                        {isWalletConnected ? '● LIVE WALLET' : '🧪 DEMO SIMULATOR'}
                                    </span>
                                </div>
                                
                                <div className="flex items-baseline gap-2 mb-2 relative z-10">
                                    <span className="text-3xl sm:text-4xl font-black text-white font-orbitron tracking-tight drop-shadow-[0_0_25px_rgba(0,240,255,0.35)]">
                                        <NumberTicker value={displayBalance} prefix="$" fractionDigits={0} />
                                    </span>
                                    <span className="text-xs font-black text-slate-400 font-mono">USD</span>
                                </div>

                                <p className="text-[10px] font-mono text-slate-400 mb-3.5 relative z-10">
                                    {isWalletConnected 
                                        ? `On-chain assets synchronized (${wallet?.chain || 'TON'})`
                                        : 'Demo portfolio simulator active • Tap to connect real wallet'}
                                </p>

                                <div className="grid grid-cols-2 gap-2.5 relative z-10">
                                    <div className="bg-black/60 rounded-xl p-3 border border-white/5 flex items-center justify-between group-hover:border-brand-green/30 transition-all">
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-orbitron">{t('portfolio.growth_24h')}</span>
                                        <span className="text-xs font-black text-brand-green font-mono">+4.1%</span>
                                    </div>
                                    <div className="bg-black/60 rounded-xl p-3 border border-white/5 flex items-center justify-between group-hover:border-brand-purple/30 transition-all">
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-orbitron">{t('portfolio.rank_index')}</span>
                                        <span className="text-xs font-black text-brand-purple font-mono">#{userStats.level}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Connectivity & Node Widget */}
                        {settings.dashboardConfig?.showConnectivity !== false && (
                            <ConnectivityWidget />
                        )}

                        {/* Market Pulse Widget */}
                        {settings.dashboardConfig?.showMarketPulse !== false && (
                            <MarketPulseWidget />
                        )}

                        {/* Tactical Action Tiles: Mining & Sentinel */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative group rounded-3xl bg-[#0a0f1e]/70 border border-brand-cyan/20 hover:border-brand-cyan/60 transition-all shadow-xl h-28">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openInfo('MINING'); }} 
                                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-brand-cyan z-20"
                                >
                                    <InfoIcon className="w-3 h-3" />
                                </button>
                                <button onClick={() => { triggerHaptic('medium'); setShowAirdrop(true); }} className="w-full h-full p-4 flex flex-col justify-between text-left relative z-10 overflow-hidden rounded-3xl">
                                    <div className="absolute inset-0 bg-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-9 h-9 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <PickaxeIcon className="w-4 h-4 text-brand-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="font-orbitron font-black text-white text-[11px] uppercase tracking-wider">{t('home.mining')}</h3>
                                        <p className="text-[9px] text-brand-cyan font-mono">{t('home.earning_stork')}</p>
                                    </div>
                                </button>
                            </div>

                            <div className="relative group rounded-3xl bg-[#0a0f1e]/70 border border-brand-purple/20 hover:border-brand-purple/60 transition-all shadow-xl h-28">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openInfo('SENTINEL'); }} 
                                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-brand-purple z-20"
                                >
                                    <InfoIcon className="w-3 h-3" />
                                </button>
                                <button onClick={() => { triggerHaptic('medium'); setShowSentinel(true); }} className="w-full h-full p-4 flex flex-col justify-between text-left relative z-10 overflow-hidden rounded-3xl">
                                    <div className="absolute inset-0 bg-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-9 h-9 rounded-xl bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <ShieldIcon className="w-4 h-4 text-brand-purple" />
                                    </div>
                                    <div>
                                        <h3 className="font-orbitron font-black text-white text-[11px] uppercase tracking-wider">{t('home.sentinel')}</h3>
                                        <p className="text-[9px] text-brand-purple font-mono">{t('home.auto_monitor')}</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* CENTER COLUMN (5 cols on Desktop): AI Market Intelligence, Tactical Grid & Insights */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* Compact Educational Disclaimer Banner */}
                        <AnimatePresence>
                            {showDisclaimer && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden relative z-30"
                                >
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 relative group shadow-[0_0_20px_rgba(245,158,11,0.08)]">
                                        <div className="flex gap-3 items-start">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                                <ShieldIcon className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black font-orbitron tracking-wider text-amber-400 uppercase">
                                                        ⚠ {t('disclaimer.title')}
                                                    </span>
                                                    <button 
                                                        onClick={dismissDisclaimer}
                                                        className="text-slate-400 hover:text-white transition-colors text-xs p-1"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                                                    {t('disclaimer.text')}
                                                </p>
                                                <button
                                                    onClick={dismissDisclaimer}
                                                    className="mt-2.5 w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all"
                                                >
                                                    {t('disclaimer.dismiss')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* AI Market Summary Component */}
                        {settings.dashboardConfig?.showMarketSummary !== false && (
                            <AIMarketSummary />
                        )}

                        {/* DEX AGGREGATOR BUTTON */}
                        <div>
                            <button 
                                onClick={() => { 
                                    triggerHaptic('medium'); 
                                    if (userStats.subscriptionTier === 'FREE') {
                                        navigateTo('profile');
                                    } else {
                                        setShowDex(true); 
                                    }
                                }}
                                className="w-full relative group rounded-2xl bg-gradient-to-r from-brand-cyan/10 to-brand-purple/10 border border-white/10 hover:border-brand-cyan/40 transition-all shadow-xl p-3.5 flex items-center justify-between overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                                        <ZapIcon className="w-4 h-4 text-brand-cyan" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-orbitron font-black text-white text-[11px] uppercase tracking-widest">{t('home.dex')}</h3>
                                        <p className="text-[9px] text-slate-400 font-mono uppercase">{t('home.swap_protocol')}</p>
                                    </div>
                                </div>
                                <div className="relative z-10 px-2.5 py-1 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 text-[9px] font-black text-brand-cyan uppercase tracking-widest shrink-0">
                                    {t('home.beta')}
                                </div>
                            </button>
                        </div>

                        {/* ADVANCED PRO TRADING TOOLKIT GRID */}
                        {settings.interfaceMode !== 'SIMPLE' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => { 
                                        triggerHaptic('medium'); 
                                        useStore.getState().setShowWhaleRadar(true);
                                    }}
                                    className="relative group rounded-2xl bg-gradient-to-b from-brand-purple/20 to-black/60 border border-brand-purple/30 hover:border-brand-purple/60 transition-all p-3.5 flex flex-col justify-between text-left overflow-hidden h-24"
                                >
                                    <div className="w-7 h-7 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center shrink-0">
                                        <RadarIcon className="w-4 h-4 text-brand-purple" />
                                    </div>
                                    <div>
                                        <h3 className="font-orbitron font-black text-white text-[10px] uppercase tracking-wider">{t('home.whale_radar')}</h3>
                                        <p className="text-[9px] text-brand-purple font-mono uppercase">{t('home.whale_radar_sub')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => { 
                                        triggerHaptic('medium'); 
                                        useStore.getState().setShowStrategyBuilder(true);
                                    }}
                                    className="relative group rounded-2xl bg-gradient-to-b from-brand-cyan/20 to-black/60 border border-brand-cyan/30 hover:border-brand-cyan/60 transition-all p-3.5 flex flex-col justify-between text-left overflow-hidden h-24"
                                >
                                    <div className="w-7 h-7 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center shrink-0">
                                        <BotIcon className="w-4 h-4 text-brand-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="font-orbitron font-black text-white text-[10px] uppercase tracking-wider">{t('home.strategy_builder')}</h3>
                                        <p className="text-[9px] text-brand-cyan font-mono uppercase">{t('home.strategy_builder_sub')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => { 
                                        triggerHaptic('medium'); 
                                        useStore.getState().setShowSentimentPulse(true);
                                    }}
                                    className="relative group rounded-2xl bg-gradient-to-b from-teal-500/20 to-black/60 border border-teal-500/30 hover:border-teal-500/60 transition-all p-3.5 flex flex-col justify-between text-left overflow-hidden h-24"
                                >
                                    <div className="w-7 h-7 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
                                        <BrainIcon className="w-4 h-4 text-teal-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-orbitron font-black text-white text-[10px] uppercase tracking-wider">{t('home.sentiment_pulse')}</h3>
                                        <p className="text-[9px] text-teal-400 font-mono uppercase">{t('home.sentiment_pulse_sub')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => { 
                                        triggerHaptic('medium'); 
                                        useStore.getState().setShowLiquidationHeatmap(true);
                                    }}
                                    className="relative group rounded-2xl bg-gradient-to-b from-orange-500/20 to-black/60 border border-orange-500/30 hover:border-orange-500/60 transition-all p-3.5 flex flex-col justify-between text-left overflow-hidden h-24"
                                >
                                    <div className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
                                        <FlameIcon className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-orbitron font-black text-white text-[10px] uppercase tracking-wider">{t('home.liq_heatmap')}</h3>
                                        <p className="text-[9px] text-orange-400 font-mono uppercase">{t('home.liq_heatmap_sub')}</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* AI Insights Widget */}
                        {settings.dashboardConfig?.showInsights !== false && (
                            <AIInsightWidget />
                        )}
                        
                        {userStats.subscriptionTier === 'FREE' && (
                            <UpgradeBanner />
                        )}

                    </div>

                    {/* RIGHT COLUMN (3 cols on Desktop): Whale Intelligence, Missions & Controls */}
                    <div className="lg:col-span-3 space-y-4">
                        
                        <div className="flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-2.5 flex-1">
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] font-orbitron shrink-0">{t('home.intel_feed')}</h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-cyan/40 to-transparent"></div>
                            </div>
                            <button onClick={() => openInfo('WHALE')} className="text-slate-400 hover:text-white p-1">
                                <InfoIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {settings.dashboardConfig?.showWhaleTracker !== false && <WhaleTrackerWidget />}
                        {settings.dashboardConfig?.showQuests !== false && <QuestWidget />}

                        {/* Dashboard Customization Button */}
                        <div className="pt-2 flex flex-col items-center gap-2">
                            <button 
                                onClick={() => setShowCustomize(true)}
                                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-300 hover:text-white transition-all shadow-md font-orbitron tracking-wider"
                            >
                                ⚙ {t('home.customize')}
                            </button>
                            <button 
                                onClick={() => { triggerHaptic('light'); setShowDisclaimer(true); }}
                                className="text-[9px] font-mono uppercase text-slate-500 hover:text-amber-400 transition-colors tracking-widest flex items-center gap-1 mt-1"
                            >
                                ⚠ {t('disclaimer.title')}
                            </button>
                        </div>

                    </div>

                </div>
             </div>

             {/* Customize Dashboard Modal */}
             {showCustomize && (
                 <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                     <div className="bg-brand-card border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                         <div className="flex justify-between items-center mb-6">
                             <h2 className="text-white font-black uppercase tracking-widest font-orbitron">{t('home.customize')}</h2>
                             <button 
                                 onClick={() => setShowCustomize(false)} 
                                 aria-label="Close customize modal"
                                 className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                             >
                                 ✕
                             </button>
                         </div>
                         
                         {userStats.subscriptionTier === 'FREE' ? (
                             <div className="text-center py-8">
                                 <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-purple/30">
                                     <ShieldIcon className="w-8 h-8 text-brand-purple" />
                                 </div>
                                 <h3 className="text-white font-black uppercase mb-2">{t('customize.pro_feature')}</h3>
                                 <p className="text-xs text-slate-400 mb-6">{t('customize.upgrade_desc')}</p>
                                 <button 
                                     onClick={() => { setShowCustomize(false); navigateTo('profile'); }}
                                     className="bg-brand-purple text-white px-6 py-3 rounded-xl font-black text-xs uppercase"
                                 >
                                     {t('customize.upgrade_now')}
                                 </button>
                             </div>
                         ) : (
                             <div className="space-y-4">
                                 {[
                                     { key: 'showMarketSummary', label: t('customize.market_summary') },
                                     { key: 'showConnectivity', label: t('customize.connectivity') },
                                     { key: 'showMarketPulse', label: t('customize.market_pulse') },
                                     { key: 'showInsights', label: t('customize.ai_insights') },
                                     { key: 'showWhaleTracker', label: t('customize.whale_tracker') },
                                     { key: 'showQuests', label: t('customize.missions') }
                                 ].map((item) => (
                                     <div key={item.key} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                                         <span className="text-xs font-bold text-slate-300">{item.label}</span>
                                         <button 
                                             onClick={() => toggleWidget(item.key as any)}
                                             className={`w-12 h-6 rounded-full transition-colors relative ${settings.dashboardConfig?.[item.key as keyof typeof settings.dashboardConfig] !== false ? 'bg-brand-cyan' : 'bg-slate-700'}`}
                                         >
                                             <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.dashboardConfig?.[item.key as keyof typeof settings.dashboardConfig] !== false ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                 </div>
             )}

             {/* Info Modal Triggered from Home */}
             <AnimatePresence>
                 {infoModalState && (
                     <InfoModal 
                        title={infoModalState.title} 
                        description={infoModalState.desc} 
                        features={infoModalState.features} 
                        onClose={() => setInfoModalState(null)} 
                     />
                 )}
                 {showDex && <DexAggregatorModal onClose={() => setShowDex(false)} />}
                 {showAIAgents && <AIAgentModal onClose={() => setShowAIAgents(false)} />}
             </AnimatePresence>
        </div>
    );
};

export default HomeScreen;
