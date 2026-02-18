
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

const MarketPulseWidget: React.FC = () => {
    const [pulse, setPulse] = useState({ dom: 54.2, fear: 50, phase: 'SCANNING...' });

    useEffect(() => {
        // Fetch Real Fear & Greed
        const fetchData = async () => {
            const data = await getFearGreedIndex();
            setPulse(prev => ({ ...prev, fear: data.value, phase: data.classification.toUpperCase() }));
        };
        fetchData();

        // Simulate BTC Dom fluctuation
        const interval = setInterval(() => {
            setPulse(prev => ({
                ...prev,
                dom: prev.dom + (Math.random() - 0.5) * 0.05
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-3 text-center group hover:border-brand-cyan/30 transition-all">
                <p className="text-[7px] text-slate-500 uppercase font-black mb-1">BTC_DOM</p>
                <p className="text-xs font-black text-brand-cyan">{pulse.dom.toFixed(1)}%</p>
            </div>
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-3 text-center relative overflow-hidden group hover:border-brand-green/30 transition-all">
                <p className="text-[7px] text-slate-500 uppercase font-black mb-1">FEAR_GREED</p>
                <p className={`text-xs font-black ${pulse.fear > 60 ? 'text-brand-green' : pulse.fear < 40 ? 'text-brand-danger' : 'text-yellow-500'}`}>{pulse.fear}</p>
                <div className="absolute bottom-0 left-0 h-0.5 bg-brand-cyan opacity-20" style={{ width: `${pulse.fear}%` }}></div>
            </div>
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-3 text-center group hover:border-brand-purple/30 transition-all">
                <p className="text-[7px] text-slate-500 uppercase font-black mb-1">MARKET_PHASE</p>
                <p className="text-[8px] font-black text-brand-purple truncate uppercase tracking-tighter">{pulse.phase}</p>
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
                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-4 rounded-full ${i < 5 ? 'bg-brand-cyan shadow-[0_0_8px_#00d9ff]' : 'bg-slate-800'}`}></div>)}
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
    const totalBalance = (assets || []).reduce((a, c) => a + (c.value || 0), 0);

    const [wsStatus, setWsStatus] = useState<'CONNECTING' | 'LIVE' | 'OFFLINE'>('CONNECTING');

    // Help Modal State
    const [infoModalState, setInfoModalState] = useState<{ open: boolean, title: string, desc: string, features: string[] } | null>(null);

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

    return (
        <div className="min-h-screen relative pb-40">
            <TacticalBackground />

            <div className="px-5 pt-4 safe-area-pt relative z-20 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6 py-3 border-b border-white/5 backdrop-blur-sm bg-black/20 rounded-2xl px-5">
                    <div className="flex items-center gap-3" onClick={() => navigateTo('profile')}>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-cyan/50">
                                <StorkIcon className="w-6 h-6 text-brand-cyan" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-green rounded-full shadow-[0_0_8px_#22c55e] border-2 border-[#020617] animate-pulse"></div>
                        </div>
                        <div>
                            <h1 className="font-orbitron font-black text-sm tracking-[0.15em] text-white leading-none">STORK<span className="text-brand-cyan">CRYPTO</span></h1>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">Kernel_v12.2 // {userStats?.subscriptionTier}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2 shadow-inner">
                            <div className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'LIVE' ? 'bg-brand-green shadow-[0_0_5px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <span className="text-[8px] font-mono font-black text-slate-300 tracking-widest">{wsStatus}</span>
                        </div>
                    </div>
                </div>

                <div className="relative mb-8 group cursor-pointer" onClick={() => { triggerHaptic('heavy'); navigateTo('portfolio'); }}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 rounded-[2.5rem] blur opacity-40 group-hover:opacity-80 transition duration-1000"></div>
                    <div className="relative bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                            <BotIcon className="w-32 h-32 text-brand-cyan" />
                        </div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] font-orbitron flex items-center gap-2">
                                <PieChartIcon className="w-4 h-4 text-brand-cyan" /> Net_Liquidity_Index
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-brand-cyan transition-colors">
                                <ActivityIcon className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2 mb-8 relative z-10">
                            <span className="text-5xl font-black text-white font-orbitron tracking-tighter drop-shadow-[0_0_20px_rgba(0,217,255,0.3)]">
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

                <ConnectivityWidget />
                <MarketPulseWidget />

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
                            <div><h3 className="font-orbitron font-black text-white text-xs uppercase tracking-widest">Mining_Vault</h3><p className="text-[9px] text-brand-cyan font-mono opacity-60">EARNING_STORK</p></div>
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
                            <div><h3 className="font-orbitron font-black text-white text-xs uppercase tracking-widest">Sentinel_Bot</h3><p className="text-[9px] text-brand-purple font-mono opacity-60">AUTO_MONITOR</p></div>
                        </button>
                    </div>
                </div>

                <div className="mb-10">
                    <AIInsightWidget />
                </div>

                {userStats.subscriptionTier === 'FREE' && (
                    <div className="mb-8">
                        <UpgradeBanner />
                    </div>
                )}

                <div className="space-y-8">
                    <div className="flex items-center gap-4 justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] font-orbitron shrink-0">Intelligence_Feed</h3>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-cyan/40 to-transparent"></div>
                        </div>
                        <button onClick={() => openInfo('WHALE')} className="text-slate-500 hover:text-white"><InfoIcon className="w-4 h-4" /></button>
                    </div>
                    <WhaleTrackerWidget />
                    <QuestWidget />
                </div>
            </div>

            {/* Info Modal Triggered from Home */}
            {infoModalState && (
                <InfoModal
                    title={infoModalState.title}
                    description={infoModalState.desc}
                    features={infoModalState.features}
                    onClose={() => setInfoModalState(null)}
                />
            )}
        </div>
    );
};

export default HomeScreen;
