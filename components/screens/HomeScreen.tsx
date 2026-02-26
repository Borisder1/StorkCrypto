
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUpIcon, BellIcon, StorkIcon, ShieldIcon, PieChartIcon, PickaxeIcon, ActivityIcon, RadarIcon, ZapIcon, GlobeIcon, BotIcon, InfoIcon } from '../icons';
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
import logo from '../../assets/logo.jpg';

const MarketPulseWidget: React.FC = () => {
    const [pulse, setPulse] = useState({ dom: 54.2, fear: 50, phase: 'SCANNING...', load: 24 });
    
    useEffect(() => {
        // Fetch Real Fear & Greed
        const fetchData = async () => {
            const data = await getFearGreedIndex();
            setPulse(prev => ({ ...prev, fear: data.value, phase: data.classification.toUpperCase() }));
        };
        fetchData();

        // Simulate BTC Dom & Load fluctuation
        const interval = setInterval(() => {
            setPulse(prev => ({
                ...prev,
                dom: prev.dom + (Math.random() - 0.5) * 0.05,
                load: Math.floor(20 + Math.random() * 15)
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-4 gap-2 mb-8">
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-2 text-center group hover:border-brand-cyan/30 transition-all">
                <p className="text-[6px] text-slate-500 uppercase font-black mb-1">BTC_DOM</p>
                <p className="text-[10px] font-black text-brand-cyan">{pulse.dom.toFixed(1)}%</p>
            </div>
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-2 text-center relative overflow-hidden group hover:border-brand-green/30 transition-all">
                <p className="text-[6px] text-slate-500 uppercase font-black mb-1">FEAR_GREED</p>
                <p className={`text-[10px] font-black ${pulse.fear > 60 ? 'text-brand-green' : pulse.fear < 40 ? 'text-brand-danger' : 'text-yellow-500'}`}>{pulse.fear}</p>
            </div>
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-2 text-center group hover:border-brand-purple/30 transition-all">
                <p className="text-[6px] text-slate-500 uppercase font-black mb-1">LOAD</p>
                <p className="text-[10px] font-black text-brand-purple font-mono">{pulse.load}%</p>
            </div>
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-2 text-center group hover:border-brand-purple/30 transition-all">
                <p className="text-[6px] text-slate-500 uppercase font-black mb-1">PHASE</p>
                <p className="text-[7px] font-black text-white truncate uppercase tracking-tighter">{pulse.phase}</p>
            </div>
        </div>
    );
};

const ConnectivityWidget: React.FC = () => {
    return (
        <div className="bg-[#050b14]/60 border border-white/5 rounded-[1.5rem] p-4 mb-8 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                    <GlobeIcon className="w-5 h-5 text-brand-green animate-pulse" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none font-orbitron">Neural_Link_Status</p>
                    <p className="text-[8px] text-slate-500 font-mono mt-1">NODES: 124_ACTIVE // LATENCY: 24ms</p>
                </div>
            </div>
            <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-4 rounded-full ${i < 5 ? 'bg-brand-cyan shadow-[0_0_8px_#00d9ff]' : 'bg-slate-800'}`}></div>)}
            </div>
        </div>
    );
};

const HomeScreen: React.FC<{ onNavigate: (tab: NavItem) => void }> = ({ onNavigate }) => {
    const { 
        assets = [], 
        userStats, 
        navigateTo, 
        updateAssetPrice, 
        settings,
        setShowAirdrop,
        setShowSentinel
    } = useStore();
    
    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    const totalBalance = (assets || []).reduce((a,c) => a + (c.value || 0), 0);
    
    const [wsStatus, setWsStatus] = useState<'CONNECTING' | 'LIVE' | 'OFFLINE'>('CONNECTING');
    
    // Help Modal State
    const [infoModalState, setInfoModalState] = useState<{open: boolean, title: string, desc: string, features: string[]} | null>(null);

    const [showCustomize, setShowCustomize] = useState(false);
    const [showDex, setShowDex] = useState(false);

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
                title: 'Mining Vault',
                desc: 'Earn $STORK tokens passively. The neural network mines tokens based on your activity and level.',
                features: ['0.01 STORK/sec Base Rate', 'Need to claim every 8 hours', 'Boost rate by inviting friends']
            });
        } else if (type === 'SENTINEL') {
            setInfoModalState({
                open: true,
                title: 'Sentinel Bot',
                desc: 'Autonomous market watchdog. It monitors price action and whale movements even when you are offline.',
                features: ['Push Notifications', 'Whale Alerts > $100k', 'Volatility Warnings']
            });
        } else if (type === 'WHALE') {
            setInfoModalState({
                open: true,
                title: 'Whale Tracker',
                desc: 'Real-time detection of large institutional transfers on the blockchain.',
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
        <div className="min-h-screen relative pb-40">
             <TacticalBackground />
             
             <div className="px-5 pt-4 safe-area-pt relative z-20 max-w-md mx-auto">
                {/* HEADER: Logo + User Cabinet */}
                <div className="flex justify-between items-center mb-6 py-2 border-b border-white/5 backdrop-blur-sm bg-black/20 rounded-2xl px-3">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3" onClick={() => window.location.reload()}>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-cyan/50">
                                <img src={logo} alt="StorkCrypto Logo" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-green rounded-full shadow-[0_0_8px_#22c55e] border-2 border-[#020617] animate-pulse"></div>
                        </div>
                        <div>
                            <h1 className="font-orbitron font-black text-xs sm:text-sm tracking-[0.15em] text-white leading-none">STORK<span className="text-brand-cyan">CRYPTO</span></h1>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">NEURAL TERMINAL</p>
                        </div>
                    </div>

                    {/* User Cabinet Button */}
                    <button 
                        onClick={() => navigateTo('profile')}
                        className="flex items-center gap-3 bg-white/5 hover:bg-brand-cyan/10 border border-white/10 hover:border-brand-cyan/50 rounded-xl p-1.5 pr-4 transition-all group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-black/50 flex items-center justify-center relative border border-white/5">
                             <BotIcon className="w-5 h-5 text-slate-400 group-hover:text-brand-cyan transition-colors" />
                             {/* Status Indicator */}
                             <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#020617] ${wsStatus === 'LIVE' ? 'bg-brand-green shadow-[0_0_5px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></div>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black text-white uppercase group-hover:text-brand-cyan transition-colors max-w-[80px] truncate">
                                {userStats.username || 'GUEST_PILOT'}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] text-slate-500 font-mono group-hover:text-white transition-colors">MY_CABINET</span>
                                <span className="text-[8px] text-brand-cyan font-mono font-bold bg-brand-cyan/10 px-1 rounded">{userStats.xp} XP</span>
                            </div>
                        </div>
                    </button>
                </div>

                {settings.dashboardConfig?.showMarketSummary !== false && <AIMarketSummary />}

                <div className="relative mb-8 group cursor-pointer" onClick={() => { triggerHaptic('heavy'); navigateTo('portfolio'); }}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 rounded-[2rem] blur opacity-40 group-hover:opacity-80 transition duration-1000"></div>
                    <div className="relative bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                            <BotIcon className="w-24 h-24 text-brand-cyan" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] font-orbitron flex items-center gap-2">
                                <PieChartIcon className="w-4 h-4 text-brand-cyan" /> Net_Liquidity_Index
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-brand-cyan transition-colors">
                                <ActivityIcon className="w-4 h-4" />
                            </div>
                        </div>
                        
                        <div className="flex items-baseline gap-2 mb-6 relative z-10">
                            <span className="text-4xl font-black text-white font-orbitron tracking-tighter drop-shadow-[0_0_20px_rgba(0,217,255,0.3)]">
                                <NumberTicker value={totalBalance} prefix="$" fractionDigits={0} />
                            </span>
                            <span className="text-sm font-black text-slate-600 font-mono">USD</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-black/60 rounded-2xl p-4 border border-white/5 flex items-center justify-between group-hover:border-brand-green/30 transition-all">
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest font-orbitron">Growth_24h</span>
                                <span className="text-xs font-black text-brand-green font-mono">+4.1%</span>
                            </div>
                            <div className="bg-black/60 rounded-2xl p-4 border border-white/5 flex items-center justify-between group-hover:border-brand-purple/30 transition-all">
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest font-orbitron">Rank_Index</span>
                                <span className="text-xs font-black text-brand-purple font-mono">#{userStats.level}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {settings.dashboardConfig?.showConnectivity !== false && <ConnectivityWidget />}
                {settings.dashboardConfig?.showMarketPulse !== false && <MarketPulseWidget />}

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="relative group rounded-[2.2rem] bg-[#0a0f1e]/60 border border-brand-cyan/20 hover:border-brand-cyan/60 transition-all shadow-2xl h-32">
                        <button 
                            onClick={(e) => { e.stopPropagation(); openInfo('MINING'); }} 
                            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-brand-cyan z-20"
                        >
                            <InfoIcon className="w-3 h-3" />
                        </button>
                        <button onClick={() => { triggerHaptic('medium'); setShowAirdrop(true); }} className="w-full h-full p-6 flex flex-col justify-between text-left relative z-10 overflow-hidden rounded-[2.2rem]">
                            <div className="absolute inset-0 bg-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-11 h-11 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><PickaxeIcon className="w-6 h-6 text-brand-cyan" /></div>
                            <div><h3 className="font-orbitron font-black text-white text-xs uppercase tracking-widest">{t('home.mining')}</h3><p className="text-[9px] text-brand-cyan font-mono opacity-60">EARNING_STORK</p></div>
                        </button>
                    </div>

                    <div className="relative group rounded-[2.2rem] bg-[#0a0f1e]/60 border border-brand-purple/20 hover:border-brand-purple/60 transition-all shadow-2xl h-32">
                        <button 
                            onClick={(e) => { e.stopPropagation(); openInfo('SENTINEL'); }} 
                            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-brand-purple z-20"
                        >
                            <InfoIcon className="w-3 h-3" />
                        </button>
                        <button onClick={() => { triggerHaptic('medium'); setShowSentinel(true); }} className="w-full h-full p-6 flex flex-col justify-between text-left relative z-10 overflow-hidden rounded-[2.2rem]">
                            <div className="absolute inset-0 bg-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-11 h-11 rounded-2xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><ShieldIcon className="w-6 h-6 text-brand-purple" /></div>
                            <div><h3 className="font-orbitron font-black text-white text-xs uppercase tracking-widest">{t('home.sentinel')}</h3><p className="text-[9px] text-brand-purple font-mono opacity-60">AUTO_MONITOR</p></div>
                        </button>
                    </div>
                </div>

                {/* DEX AGGREGATOR BUTTON */}
                <div className="mb-8">
                    <button 
                        onClick={() => { triggerHaptic('medium'); setShowDex(true); }}
                        className="w-full relative group rounded-[2.2rem] bg-gradient-to-r from-brand-cyan/10 to-brand-purple/10 border border-white/10 hover:border-brand-cyan/40 transition-all shadow-2xl p-6 flex items-center justify-between overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                                <ZapIcon className="w-6 h-6 text-brand-cyan" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-orbitron font-black text-white text-sm uppercase tracking-widest">{t('home.dex')}</h3>
                                <p className="text-[9px] text-slate-400 font-mono uppercase">Swap_Protocol_V1</p>
                            </div>
                        </div>
                        <div className="relative z-10 px-3 py-1.5 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 text-[8px] font-black text-brand-cyan uppercase tracking-widest animate-pulse shrink-0">
                            BETA
                        </div>
                    </button>
                </div>

                {settings.dashboardConfig?.showInsights !== false && (
                    <div className="mb-10">
                        <AIInsightWidget />
                    </div>
                )}
                
                {userStats.subscriptionTier === 'FREE' && (
                    <div className="mb-8">
                        <UpgradeBanner />
                    </div>
                )}

                <div className="space-y-8">
                    <div className="flex items-center gap-4 justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] font-orbitron shrink-0">{t('home.intel_feed')}</h3>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-cyan/40 to-transparent"></div>
                        </div>
                        <button onClick={() => openInfo('WHALE')} className="text-slate-500 hover:text-white"><InfoIcon className="w-4 h-4" /></button>
                    </div>
                    {settings.dashboardConfig?.showWhaleTracker !== false && <WhaleTrackerWidget />}
                    {settings.dashboardConfig?.showQuests !== false && <QuestWidget />}
                </div>

                {/* Dashboard Customization Button */}
                <div className="mt-12 flex justify-center">
                    <button 
                        onClick={() => setShowCustomize(true)}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all shadow-lg"
                    >
                        Customize Dashboard
                    </button>
                </div>
             </div>

             {/* Customize Dashboard Modal */}
             {showCustomize && (
                 <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                     <div className="bg-brand-card border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                         <div className="flex justify-between items-center mb-6">
                             <h2 className="text-white font-black uppercase tracking-widest font-orbitron">Customize Dashboard</h2>
                             <button onClick={() => setShowCustomize(false)} className="text-slate-400 hover:text-white">✕</button>
                         </div>
                         
                         {userStats.subscriptionTier === 'FREE' ? (
                             <div className="text-center py-8">
                                 <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-purple/30">
                                     <ShieldIcon className="w-8 h-8 text-brand-purple" />
                                 </div>
                                 <h3 className="text-white font-black uppercase mb-2">PRO Feature</h3>
                                 <p className="text-xs text-slate-400 mb-6">Upgrade to PRO or WHALE tier to customize your terminal layout.</p>
                                 <button 
                                     onClick={() => { setShowCustomize(false); navigateTo('profile'); }}
                                     className="bg-brand-purple text-white px-6 py-3 rounded-xl font-black text-xs uppercase"
                                 >
                                     Upgrade Now
                                 </button>
                             </div>
                         ) : (
                             <div className="space-y-4">
                                 {[
                                     { key: 'showMarketSummary', label: 'Market Summary' },
                                     { key: 'showConnectivity', label: 'Connectivity Widget' },
                                     { key: 'showMarketPulse', label: 'Market Pulse' },
                                     { key: 'showInsights', label: 'AI Insights' },
                                     { key: 'showWhaleTracker', label: 'Whale Tracker' },
                                     { key: 'showQuests', label: 'Missions' }
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
             {infoModalState && (
                 <InfoModal 
                    title={infoModalState.title} 
                    description={infoModalState.desc} 
                    features={infoModalState.features} 
                    onClose={() => setInfoModalState(null)} 
                 />
             )}

             {showDex && <DexAggregatorModal onClose={() => setShowDex(false)} />}
        </div>
    );
};

export default HomeScreen;
