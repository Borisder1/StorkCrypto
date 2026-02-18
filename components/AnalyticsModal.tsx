
import React, { useMemo, useState, useEffect } from 'react';
import FuturisticCard from './FuturisticCard';
import { ShieldIcon, TrendingUpIcon, InfoIcon, ChevronRightIcon, ActivityIcon } from './icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid, Tooltip } from 'recharts';
import InfoModal from './InfoModal';
import { TacticalBackground } from './TacticalBackground';
import { triggerHaptic } from '../utils/haptics';

const AnalyticsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { assets, settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const healthScore = useMemo(() => {
        if (assets.length === 0) return 0;
        const avgRisk = assets.reduce((a,c) => a + (c.volatilityScore || 50), 0) / assets.length;
        return Math.floor(100 - (avgRisk * 0.4));
    }, [assets]);

    const projectionData = useMemo(() => {
        const totalValue = assets.reduce((a,c) => a + c.value, 0) || 1000;
        return Array.from({length: 12}).map((_, i) => ({
            month: i,
            Bull: totalValue * (1 + (0.8 / 12) * (i + 1)),
            Base: totalValue * (1 + (0.2 / 12) * (i + 1)),
        }));
    }, [assets]);

    return (
        <div className="fixed inset-0 z-[120] bg-black/80 flex justify-center animate-fade-in overflow-hidden">
            <div className="w-full max-w-md h-full bg-brand-bg flex flex-col relative shadow-2xl">
                <TacticalBackground />
                
                {/* Standardized Header */}
                <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase">Neural_Audit</h1>
                        <p className="text-[8px] text-brand-green font-mono uppercase tracking-[0.2em]">Matrix: STABLE</p>
                    </div>
                </div>
                <button onClick={() => setShowInfo(true)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-cyan shadow-xl"><InfoIcon className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-32 relative z-10">
                <FuturisticCard className="border-brand-cyan/30 shadow-2xl bg-brand-card/60 backdrop-blur-xl">
                    <div className="flex justify-between items-start mb-6">
                         <div>
                             <p className="text-[10px] text-slate-500 font-black uppercase font-orbitron tracking-widest mb-2">{t('analytics.health')}</p>
                             <div className="flex items-baseline gap-2">
                                 <span className="text-5xl font-black font-orbitron text-white italic">{healthScore}</span>
                                 <span className="text-xl text-slate-600 font-black">/100</span>
                             </div>
                         </div>
                         <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase font-orbitron ${healthScore > 70 ? 'bg-brand-green/20 border-brand-green text-brand-green' : 'bg-brand-danger/20 border-brand-danger text-brand-danger animate-pulse'}`}>
                            {healthScore > 70 ? 'OPTIMAL' : 'RISK_WARN'}
                         </div>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden shadow-inner border border-white/5">
                        <div className={`h-full transition-all duration-1000 ${healthScore > 70 ? 'bg-brand-green shadow-[0_0_10px_#10b981]' : 'bg-brand-danger shadow-[0_0_10px_#ef4444]'}`} style={{width: `${healthScore}%`}}></div>
                    </div>
                </FuturisticCard>

                <div className="bg-brand-card/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUpIcon className="w-24 h-24 text-brand-cyan" /></div>
                     <div className="flex items-center gap-3 mb-8 uppercase relative z-10">
                        <ActivityIcon className="w-5 h-5 text-brand-cyan" />
                        <h3 className="text-white font-black font-orbitron text-[11px] tracking-[0.2em]">{t('analytics.projection')}</h3>
                    </div>
                    <div className="h-56 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData}>
                                <defs>
                                    <linearGradient id="gradBull" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="month" hide />
                                <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px'}} formatter={(v: any) => `$${v.toFixed(0)}`} />
                                <Area type="monotone" dataKey="Bull" stroke="#00d9ff" fill="url(#gradBull)" strokeWidth={3} />
                                <Area type="monotone" dataKey="Base" stroke="#94a3b8" fill="transparent" strokeWidth={1} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {showInfo && <InfoModal 
                title={t('analytics.health')} 
                content="Portfolio Health Score is calculated based on asset volatility, diversification, and risk exposure. Maintain >70 for optimal safety." 
                onClose={() => setShowInfo(false)} 
            />}
            </div>
        </div>
    );
};

export default AnalyticsModal;
