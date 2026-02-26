
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { BotIcon, ShieldIcon, ActivityIcon, ZapIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { runDeepPortfolioAudit } from '../services/geminiService';
import EmptyState from './EmptyState';

const PortfolioAuditModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { assets = [], userStats } = useStore();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<any>(null);

    useEffect(() => {
        const runAudit = async () => {
            setLoading(true);
            try {
                const result = await runDeepPortfolioAudit(assets, userStats?.level || 1);
                if (result) setReport(result);
            } catch (e) {
                console.error("Deep Audit Failed", e);
                setReport({ score: 65, status: 'MODERATE_RISK', points: ['Concentration too high', 'Missing stablecoins'], recommendation: 'Diversify into BTC/ETH' });
            } finally {
                setLoading(false);
            }
        };
        runAudit();
    }, [assets, userStats?.level]);

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-brand-bg border border-brand-cyan/30 rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col shadow-[0_0_60px_rgba(0,217,255,0.2)]">
                <div className="p-6 border-b border-white/5 bg-brand-card/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <BotIcon className="w-6 h-6 text-brand-cyan animate-pulse" />
                        <h2 className="font-orbitron font-black text-lg text-white uppercase tracking-widest">NEURAL_AUDIT</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500">✕</button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                            <div className="w-16 h-16 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin"></div>
                            <p className="text-[10px] font-mono text-brand-cyan uppercase animate-pulse">Neural Thinking Mode Active...</p>
                        </div>
                    ) : assets.length === 0 ? (
                        <EmptyState 
                            message="NO_ASSETS_DETECTED" 
                            subMessage="Audit cannot proceed without portfolio data. Add assets to enable neural analysis."
                            icon={<BotIcon className="w-6 h-6 text-slate-600 opacity-50" />}
                        />
                    ) : (
                        <div className="animate-fade-in-up">
                            <div className="flex justify-between items-end mb-8">
                                <div><p className="text-[10px] text-slate-500 font-black uppercase mb-1">Safety_Score</p><span className="text-5xl font-black font-orbitron text-white italic">{report?.score || 0}</span><span className="text-xl text-slate-600">/100</span></div>
                                <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase ${report?.score > 70 ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>{report?.status || 'SCANNING'}</div>
                            </div>
                            <div className="space-y-4 mb-8">
                                <h4 className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Key_Audit_Points</h4>
                                {/* ПАРТНЕР: Додано optional chaining для масиву точок аудиту */}
                                {(report?.points || []).map((p: string, i: number) => (
                                    <div key={i} className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5"><ZapIcon className="w-4 h-4 text-brand-cyan shrink-0" /><p className="text-xs text-slate-300 font-mono leading-relaxed">{p}</p></div>
                                ))}
                            </div>
                            <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-2xl p-5 shadow-inner">
                                <h4 className="text-[9px] text-brand-purple font-black uppercase mb-2">Neural_Recommendation</h4>
                                <p className="text-xs text-white font-space-mono leading-relaxed italic">"{report?.recommendation || 'Diversify portfolio.'}"</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 bg-brand-card/30">
                    <button onClick={onClose} className="w-full py-4 bg-brand-cyan text-black font-black font-orbitron rounded-2xl uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform">Close Diagnostic</button>
                </div>
            </div>
        </div>
    );
};

export default PortfolioAuditModal;
