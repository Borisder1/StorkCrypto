import React, { useEffect } from 'react';
import { StorkIcon } from './icons';

interface RoadmapItem {
    id: string;
    title: string;
    desc: string;
    status: 'DONE' | 'IN_PROGRESS' | 'PENDING';
    category: 'CORE' | 'AI' | 'WEB3' | 'DATA';
}

const ROADMAP_DATA: RoadmapItem[] = [
    // COMPLETED V7.0
    { id: '1', title: 'Cyberpunk UI Hardening', desc: 'Vertical loading screen, visual polish, fonts.', status: 'DONE', category: 'CORE' },
    { id: '2', title: 'Neural Engine V2', desc: 'Gemini integration, smart briefings, sentiment analysis.', status: 'DONE', category: 'AI' },
    { id: '3', title: 'Tactical Signals', desc: 'Sniper mode, confidence rings, deep scanning.', status: 'DONE', category: 'DATA' },
    
    // PHASE 1: CURRENT (Hardening)
    { id: '4', title: 'Render Optimization', desc: 'React.memo implementation for smoother mobile FPS.', status: 'DONE', category: 'CORE' },
    { id: '5', title: 'Market Scanner V3', desc: 'RSI Heatmap, Volume Analysis, Alpha detection.', status: 'DONE', category: 'DATA' },

    // PHASE 2: REAL WEB3 (Next)
    { id: '6', title: 'TON Connect Integration', desc: 'Real wallet auth via @tonconnect/ui-react.', status: 'IN_PROGRESS', category: 'WEB3' },
    { id: '7', title: 'Live Balance Sync', desc: 'Fetching real on-chain data via TonAPI/Moralis.', status: 'PENDING', category: 'WEB3' },

    // PHASE 3: AUTOMATION & MONETIZATION
    { id: '9', title: 'Telegram Stars Payment', desc: 'Native subscription flow within Telegram.', status: 'PENDING', category: 'CORE' },
    { id: '10', title: 'Sentinel Bot V1', desc: 'Push notifications for signals when app is closed.', status: 'PENDING', category: 'AI' },
    { id: '11', title: 'StorkCoin Airdrop', desc: 'Reward system for active beta testers.', status: 'PENDING', category: 'WEB3' },
];

const RoadmapModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const completedCount = ROADMAP_DATA.filter(i => i.status === 'DONE').length;
    const progress = (completedCount / ROADMAP_DATA.length) * 100;

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 overflow-hidden overscroll-none touch-none">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-lg animate-fade-in touch-none" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-lg bg-brand-bg border border-brand-border rounded-3xl shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col max-h-[85dvh] overflow-hidden animate-zoom-in">
                
                {/* Header */}
                <div className="p-5 border-b border-brand-border bg-brand-card relative z-10 shrink-0 touch-none">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-cyan/10 rounded-lg flex items-center justify-center border border-brand-cyan/30">
                                <StorkIcon className="w-5 h-5 text-brand-cyan" />
                            </div>
                            <div>
                                <h2 className="font-orbitron font-bold text-lg text-white">System Roadmap</h2>
                                <p className="text-[10px] text-slate-400 font-space-mono">Global Plan v7.3</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-space-mono uppercase">
                            <span>System Completion</span>
                            <span className="text-brand-cyan">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/10">
                            <div 
                                className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-cyber-grid bg-[length:40px_40px] overscroll-contain">
                    {ROADMAP_DATA.map((item, index) => (
                        <div 
                            key={item.id} 
                            className={`p-3 rounded-xl border relative overflow-hidden transition-all ${
                                item.status === 'DONE' 
                                ? 'bg-brand-card/50 border-brand-success/20' 
                                : item.status === 'IN_PROGRESS' 
                                ? 'bg-brand-cyan/5 border-brand-cyan/30' 
                                : 'bg-black/40 border-white/5 opacity-60'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {item.status === 'IN_PROGRESS' && (
                                <div className="absolute -right-4 -top-4 w-16 h-16 bg-brand-cyan/10 blur-xl rounded-full animate-pulse"></div>
                            )}

                            <div className="flex items-start gap-3 relative z-10">
                                {/* Status Icon */}
                                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border ${
                                    item.status === 'DONE' 
                                    ? 'bg-brand-success text-black border-brand-success' 
                                    : item.status === 'IN_PROGRESS' 
                                    ? 'bg-transparent border-brand-cyan text-brand-cyan animate-spin-slow'
                                    : 'bg-transparent border-slate-600'
                                }`}>
                                    {item.status === 'DONE' && <span className="text-[8px] font-bold">✓</span>}
                                    {item.status === 'IN_PROGRESS' && <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full"></div>}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-bold text-xs mb-0.5 ${item.status === 'PENDING' ? 'text-slate-400' : 'text-white'}`}>{item.title}</h3>
                                        <span className={`text-[8px] px-1 py-0 rounded border uppercase ${
                                            item.category === 'AI' ? 'text-brand-purple border-brand-purple/30 bg-brand-purple/10' :
                                            item.category === 'WEB3' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                                            item.category === 'DATA' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
                                            'text-slate-400 border-slate-500/30'
                                        }`}>{item.category}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-brand-border bg-brand-card/80 backdrop-blur text-center shrink-0 touch-none">
                     <p className="text-[10px] text-slate-500 font-space-mono">StorkCrypto Ecosystem.</p>
                </div>
            </div>
        </div>
    );
};

export default RoadmapModal;