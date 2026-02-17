import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUpIcon, BellIcon, StorkIcon, ShieldIcon, PieChartIcon, PickaxeIcon, ActivityIcon, RadarIcon, ZapIcon, GlobeIcon } from '../icons';
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

const MarketPulseWidget: React.FC = () => {
    const [pulse, setPulse] = useState({ dom: 52.4, fear: 64, phase: 'BULLISH_EXPANSION' });

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(prev => ({
                dom: prev.dom + (Math.random() - 0.5) * 0.1,
                fear: Math.min(100, Math.max(0, prev.fear + Math.floor(Math.random() * 5 - 2))),
                phase: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'ACCUMULATION' : 'DISTRIBUTION') : prev.phase
            }));
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-3 text-center interactive-card">
                <p className="text-[7px] text-slate-500 uppercase font-black mb-1">BTC_DOM</p>
                <p className="text-xs font-black text-brand-cyan">{pulse.dom.toFixed(1)}%</p>
            </div>
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-3 text-center relative overflow-hidden interactive-card">
                <p className="text-[7px] text-slate-500 uppercase font-black mb-1">FEAR_GREED</p>
                <p className={`text-xs font-black ${pulse.fear > 60 ? 'text-brand-green' : pulse.fear < 40 ? 'text-brand-danger' : 'text-yellow-500'}`}>{pulse.fear}</p>
                <div className="absolute bottom-0 left-0 h-0.5 bg-brand-cyan opacity-20" style={{ width: `${pulse.fear}%` }}></div>
            </div>
            <div className="bg-brand-card/40 border border-white/5 rounded-2xl p-3 text-center interactive-card">
                <p className="text-[7px] text-slate-500 uppercase font-black mb-1">MARKET_PHASE</p>
                <p className="text-[8px] font-black text-brand-purple truncate uppercase tracking-tighter">{pulse.phase}</p>
            </div>
        </div>
    );
};

const ConnectivityWidget: React.FC = () => {
    return (
        <div className="bg-black/40 border border-white/10 rounded-[1.5rem] p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                    <GlobeIcon className="w-4 h-4 text-brand-green animate-pulse" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Neural_Link_Status</p>
                    <p className="text-[8px] text-slate-500 font-mono mt-1">NODES: 124_ACTIVE // LATENCY: 24ms</p>
                </div>
            </div>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-brand-cyan shadow-[0_0_5px_#00d9ff]' : 'bg-slate-700'}`}></div>)}
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
        notifications = [],
        settings,
        setShowAirdrop,
        setShowSentinel
    } = useStore();

    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    const unreadCount = (notifications || []).filter(n => !n.read).length;
    const totalBalance = (assets || []).reduce((a, c) => a + (c.value || 0), 0);

    const [wsStatus, setWsStatus] = useState<'CONNECTING' | 'LIVE' | 'OFFLINE'>('CONNECTING');

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

    return (
        <div className="min-h-screen relative pb-40">
            <TacticalBackground />

            <div className="px-5 pt-4 relative z-20 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6 py-2 border-b border-white/5 backdrop-blur-sm bg-black/20 rounded-2xl px-4">
                    <div className="flex items-center gap-3" onClick={() => navigateTo('profile')}>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-brand-cyan/5 border border-brand-cyan/20 flex items-center justify-center overflow-hidden">
                                <StorkIcon className="w-6 h-6 text-brand-cyan" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-green rounded-full shadow-[0_0_5px_#22c55e] border-2 border-[#020617] animate-pulse"></div>
                        </div>
                        <div>
                            <h1 className="font-orbitron font-bold text-sm tracking-widest text-white leading-none">STORK<span className="text-brand-cyan">CRYPTO</span></h1>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">Sys_V11 // {userStats?.subscriptionTier}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-black/40 px-2 py-1 rounded border border-white/10 flex items-center gap-1.5">
                            <div className={`w-1 h-1 rounded-full ${wsStatus === 'LIVE' ? 'bg-brand-green shadow-[0_0_3px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <span className="text-[7px] font-mono font-bold text-slate-300">{wsStatus}</span>
                        </div>
                    </div>
                </div>

                <div className="relative mb-8 group cursor-pointer" onClick={() => { triggerHaptic('heavy'); navigateTo('portfolio'); }}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 rounded-[2.5rem] blur opacity-40 group-hover:opacity-70 transition duration-1000"></div>
                    <div className="relative bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <ZapIcon className="w-24 h-24 text-brand-cyan" />
                        </div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-orbitron flex items-center gap-2">
                                <PieChartIcon className="w-3.5 h-3.5 text-brand-cyan" /> {t('home.total_equity')}
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-8 relative z-10">
                            <span className="text-5xl font-black text-white font-orbitron tracking-tighter drop-shadow-[0_0_15px_rgba(0,217,255,0.4)]">
                                <NumberTicker value={totalBalance} prefix="$" fractionDigits={0} />
                            </span>
                            <span className="text-sm font-black text-slate-500 font-mono">USD</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between interactive-card">
                                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{t('home.pnl_24h')}</span>
                                <span className="text-xs font-black text-brand-green font-mono">+4.1%</span>
                            </div>
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between interactive-card">
                                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{t('home.level')}_INDEX</span>
                                <span className="text-xs font-black text-brand-purple font-mono">#{userStats.level}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <ConnectivityWidget />
                <MarketPulseWidget />

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <button onClick={() => { triggerHaptic('medium'); setShowAirdrop(true); }} className="relative group overflow-hidden rounded-[2rem] border border-brand-cyan/20 h-28 bg-[#0a0f1e]/60 transition-all hover:border-brand-cyan/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)] active:scale-95 shadow-lg">
                        <div className="absolute inset-0 bg-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 p-5 flex flex-col justify-between h-full text-left">
                            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shadow-inner"><PickaxeIcon className="w-5 h-5 text-brand-cyan" /></div>
                            <div><h3 className="font-orbitron font-black text-white text-[11px] uppercase tracking-wider">Mining_Hub</h3><p className="text-[8px] text-brand-cyan font-mono opacity-60">EARNING_STORK</p></div>
                        </div>
                    </button>
                    <button onClick={() => { triggerHaptic('medium'); setShowSentinel(true); }} className="relative group overflow-hidden rounded-[2rem] border border-brand-purple/20 h-28 bg-[#0a0f1e]/60 transition-all hover:border-brand-purple/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] active:scale-95 shadow-lg">
                        <div className="absolute inset-0 bg-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 p-5 flex flex-col justify-between h-full text-left">
                            <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center shadow-inner"><ShieldIcon className="w-5 h-5 text-brand-purple" /></div>
                            <div><h3 className="font-orbitron font-black text-white text-[11px] uppercase tracking-wider">Sentinel_Bot</h3><p className="text-[8px] text-brand-purple font-mono opacity-60">AUTO_MONITOR</p></div>
                        </div>
                    </button>
                </div>

                <AIInsightWidget />

                {userStats.subscriptionTier === 'FREE' && <UpgradeBanner />}

                <div className="mt-10 space-y-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-orbitron flex items-center gap-3">
                        <div className="w-6 h-[1px] bg-brand-cyan/50"></div>
                        {t('home.intel_feed')}
                    </h3>
                    <WhaleTrackerWidget />
                    <QuestWidget />
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;