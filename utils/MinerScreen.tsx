import React, { useMemo, useState } from 'react';
import FuturisticCard from '../components/FuturisticCard';
import { ShieldIcon, TrendingUpIcon, InfoIcon, BarChartIcon } from '../components/icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, AreaChart, Area, XAxis, CartesianGrid } from 'recharts';
import InfoModal from '../components/InfoModal';

const RiskMetric: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
    <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col items-center hover:bg-white/5 transition-colors">
        <span className={`text-lg font-bold font-orbitron ${color}`}>{value}</span>
        <span className="text-[9px] text-slate-500 uppercase mt-1 font-bold">{label}</span>
    </div>
);

const AnalyticsScreen: React.FC = () => {
    const { assets, settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [showInfo, setShowInfo] = useState(false);

    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);

    // Dynamic Calculations
    const metrics = useMemo(() => {
        if (assets.length === 0) return { drawdown: '0.00%', sharpe: '0.00', volatility: 'LOW' };
        
        // Simulate historical volatility based on current asset types
        let riskScore = 0;
        assets.forEach(a => {
            if (['BTC','ETH','USDT','USDC'].includes(a.ticker)) riskScore += 1;
            else riskScore += 3; // Alts are riskier
        });
        const avgRisk = riskScore / assets.length;
        
        // Calculate fake drawdown based on risk
        const dd = -(avgRisk * 4.2 + (Math.random() * 2)).toFixed(2);
        const sharpe = (2.5 - (avgRisk * 0.5)).toFixed(2);
        
        return {
            drawdown: `${dd}%`,
            sharpe: sharpe,
            volatility: avgRisk > 2 ? 'HIGH' : 'MODERATE'
        };
    }, [assets]);

    const projectionData = useMemo(() => {
        const data = [];
        const baseVal = totalValue || 1000; // Fallback for visual if empty
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 12; i++) {
            data.push({
                month: months[i],
                Bear: baseVal * (1 + (-0.2 / 12) * (i + 1)),
                Base: baseVal * (1 + (0.15 / 12) * (i + 1)),
                Bull: baseVal * (1 + (0.8 / 12) * (i + 1)),
            });
        }
        return data;
    }, [totalValue]);

    const allocationData = useMemo(() => {
        if (assets.length === 0) return [{ name: 'Empty', value: 1 }];
        return assets.map(asset => ({ name: asset.ticker, value: asset.value })).sort((a, b) => b.value - a.value);
    }, [assets]);

    const healthMetrics = useMemo(() => {
        if (assets.length === 0) return { score: 0, risk: 'N/A', label: 'NO DATA' };
        let score = 100;
        if (assets.length < 3) score -= 30;
        else if (assets.length < 5) score -= 10;
        
        // Deduct for high meme concentration
        const memes = assets.filter(a => ['PEPE', 'DOGE', 'SHIB', 'WIF'].includes(a.ticker));
        if (memes.length > 0) score -= 15;

        return { 
            score: Math.max(0, score), 
            risk: score < 50 ? 'HIGH' : score < 80 ? 'MODERATE' : 'LOW', 
            label: score < 50 ? 'WARNING' : score < 80 ? 'FAIR' : 'OPTIMAL' 
        };
    }, [assets]);

    const radarData = useMemo(() => {
        // Even if empty, provide structure to prevent Recharts crash
        const defaultScore = assets.length > 0 ? healthMetrics.score : 50;
        const divScore = assets.length > 0 ? Math.min(assets.length * 20, 100) : 20;
        
        return [
            { subject: 'Vol', A: 60, fullMark: 100 },
            { subject: 'Sent', A: defaultScore, fullMark: 100 },
            { subject: 'Div', A: divScore, fullMark: 100 },
            { subject: 'Liq', A: 80, fullMark: 100 },
            { subject: 'Upside', A: 75, fullMark: 100 },
            { subject: 'Sec', A: 85, fullMark: 100 },
        ];
    }, [assets, healthMetrics]);

    const COLORS = ['#00F0FF', '#7000FF', '#FF003C', '#00FF9D', '#FFD700'];

    return (
        <div className="p-4 md:p-6 pb-40 min-h-screen relative">
            {/* Background overlay handling scroll correctly is tricky, handled by layout */}
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pt-4 relative z-10">
                <div>
                    <h1 className="font-orbitron text-2xl font-bold text-white">{t('analytics.title')}</h1>
                    <p className="text-xs text-slate-400 font-space-mono">{t('analytics.subtitle')}</p>
                </div>
                <button onClick={() => setShowInfo(true)} className="w-10 h-10 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center text-brand-cyan hover:bg-white/10 transition-colors shadow-lg">
                    <InfoIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Health Card */}
            <FuturisticCard className="mb-6 border-t border-brand-cyan/30 relative z-10">
                <div className="flex justify-between items-start mb-4">
                     <div>
                         <p className="text-xs text-slate-400 font-space-mono uppercase mb-1">{t('analytics.health')}</p>
                         <div className="flex items-baseline gap-2">
                             <span className={`text-5xl font-bold font-orbitron ${healthMetrics.score > 75 ? 'text-brand-success' : 'text-brand-danger'}`}>{healthMetrics.score}</span>
                             <span className="text-xl text-slate-500">/100</span>
                         </div>
                     </div>
                     <div className="text-right">
                        <div className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase mb-1 inline-block ${healthMetrics.risk === 'LOW' ? 'bg-brand-success/20 border-brand-success text-brand-success' : 'bg-brand-danger/20 border-brand-danger text-brand-danger'}`}>{healthMetrics.label}</div>
                     </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6 shadow-inner">
                    <div className={`h-full transition-all duration-1000 ${healthMetrics.score > 75 ? 'bg-brand-success' : 'bg-brand-danger'}`} style={{width: `${healthMetrics.score}%`}}></div>
                </div>
                
                {/* PRO METRICS */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                    <RiskMetric label={t('analytics.drawdown')} value={metrics.drawdown} color="text-brand-danger" />
                    <RiskMetric label={t('analytics.sharpe')} value={metrics.sharpe} color="text-brand-success" />
                    <RiskMetric label="Volatility" value={metrics.volatility} color="text-brand-purple" />
                </div>
            </FuturisticCard>

            {/* Projection Chart */}
            <FuturisticCard className="mb-6 relative z-10" padding="p-4">
                 <div className="flex items-center gap-2 mb-4">
                    <TrendingUpIcon className="w-4 h-4 text-brand-success" />
                    <h3 className="text-white font-bold text-sm uppercase">{t('analytics.projection')}</h3>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData}>
                            <defs>
                                <linearGradient id="gradBull" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                                <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/><stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" hide />
                            <Tooltip contentStyle={{backgroundColor: '#050507', border: '1px solid #333', borderRadius: '8px', fontSize: '10px'}} formatter={(value: number) => `$${value.toFixed(0)}`} />
                            <Area type="monotone" dataKey="Bull" stroke="#22c55e" fill="url(#gradBull)" strokeWidth={2} />
                            <Area type="monotone" dataKey="Base" stroke="#00F0FF" fill="url(#gradBase)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </FuturisticCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-brand-card/50 border border-brand-border rounded-3xl p-5 relative">
                     <div className="flex items-center gap-2 mb-2"><ShieldIcon className="w-4 h-4 text-brand-purple" /><h3 className="text-white font-bold text-sm uppercase">{t('analytics.factor')}</h3></div>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Radar name="Portfolio" dataKey="A" stroke="#00F0FF" strokeWidth={2} fill="#00F0FF" fillOpacity={0.2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-brand-card/50 border border-brand-border rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4"><BarChartIcon className="w-4 h-4 text-brand-cyan" /><h3 className="text-white font-bold text-sm uppercase">{t('analytics.diversity')}</h3></div>
                    <div className="h-48 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={allocationData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                                    {allocationData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor:'#050507', borderColor:'#333'}} itemStyle={{fontSize:'12px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {showInfo && <InfoModal title={t('analytics.title')} description="Portfolio risk analytics." features={["Sharpe Ratio: Risk adjusted return", "Drawdown: Max loss from peak"]} onClose={() => setShowInfo(false)} />}
        </div>
    );
};

export default AnalyticsScreen;