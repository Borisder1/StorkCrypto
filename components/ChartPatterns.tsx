
import React from 'react';
import { VisualType } from '../types';

export const ChartPattern: React.FC<{ type: VisualType }> = ({ type }) => {
    if (!type || type === 'NONE') return null;

    return (
        <div className="h-40 w-full bg-black/40 rounded-xl border border-white/5 mb-3 flex items-center justify-center relative overflow-hidden group">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            
            {/* Scanline */}
            <div className="absolute top-0 w-full h-1 bg-brand-cyan/20 animate-[scanline_3s_linear_infinite] shadow-[0_0_10px_#00F0FF]"></div>

            {/* ANIMATION STYLES */}
            <style>{`
                @keyframes dash {
                    from { stroke-dashoffset: 200; }
                    to { stroke-dashoffset: 0; }
                }
                .draw-path {
                    stroke-dasharray: 200;
                    stroke-dashoffset: 200;
                    animation: dash 3s ease-out forwards;
                }
                @keyframes pulse-fill {
                    0% { fill-opacity: 0.1; }
                    50% { fill-opacity: 0.3; }
                    100% { fill-opacity: 0.1; }
                }
                .pulse-area {
                    animation: pulse-fill 3s infinite;
                }
            `}</style>

            {type === 'CHART_HEAD_SHOULDERS' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-4 stroke-brand-cyan fill-none stroke-[2px] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                    <path d="M20,80 L40,50 L60,80 L80,20 L120,80 L140,50 L160,80" className="draw-path"/>
                    <line x1="10" y1="80" x2="190" y2="80" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" />
                    <text x="80" y="15" fill="#00F0FF" stroke="none" fontSize="8" fontWeight="bold">HEAD</text>
                    <text x="30" y="45" fill="rgba(255,255,255,0.5)" stroke="none" fontSize="6">L-SHOULDER</text>
                    <text x="130" y="45" fill="rgba(255,255,255,0.5)" stroke="none" fontSize="6">R-SHOULDER</text>
                </svg>
            )}
            
            {type === 'CHART_DOUBLE_TOP' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-4 stroke-brand-danger fill-none stroke-[2px]">
                    <path d="M20,80 L50,20 L80,70 L110,20 L140,80" className="draw-path drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"/>
                    <line x1="20" y1="20" x2="140" y2="20" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" />
                    <text x="45" y="15" fill="#ef4444" stroke="none" fontSize="8" fontWeight="bold">RESISTANCE</text>
                </svg>
            )}

            {type === 'CHART_DOUBLE_BOTTOM' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-4 stroke-brand-success fill-none stroke-[2px]">
                    <path d="M20,20 L50,80 L80,40 L110,80 L140,20" className="draw-path drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]"/>
                    <line x1="20" y1="80" x2="140" y2="80" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" />
                    <text x="45" y="92" fill="#22c55e" stroke="none" fontSize="8" fontWeight="bold">SUPPORT</text>
                </svg>
            )}

            {type === 'CHART_BULL_FLAG' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-4 stroke-brand-success fill-none stroke-[2px]">
                    <path d="M20,90 L20,30" strokeWidth="3" className="draw-path" /> 
                    <path d="M20,30 L60,40 L60,60 L20,50" fill="rgba(34, 197, 94, 0.1)" className="pulse-area" /> 
                    <path d="M20,30 L60,40" className="draw-path" style={{animationDelay: '0.5s'}} />
                    <path d="M20,50 L60,60" className="draw-path" style={{animationDelay: '0.5s'}} />
                    <path d="M60,50 L90,20" strokeDasharray="4" stroke="white" className="draw-path" style={{animationDelay: '1.5s'}} />
                    <text x="25" y="25" fill="#22c55e" stroke="none" fontSize="8" fontWeight="bold">BREAKOUT</text>
                </svg>
            )}

            {type === 'CHART_CUP_HANDLE' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-4 stroke-brand-success fill-none stroke-[2px]">
                    <path d="M20,20 C20,90 100,90 100,20" className="draw-path" />
                    <path d="M100,20 L120,40 L130,30" className="draw-path" style={{animationDelay: '1s'}} />
                    <path d="M130,30 L150,10" strokeDasharray="4" stroke="white" strokeWidth="1" className="draw-path" style={{animationDelay: '1.5s'}} />
                    <circle cx="150" cy="10" r="2" fill="white" className="animate-ping" />
                </svg>
            )}

            {type === 'CHART_ASC_TRIANGLE' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-4 stroke-brand-success fill-none stroke-[2px]">
                    <line x1="40" y1="20" x2="140" y2="20" stroke="white" strokeWidth="1"/>
                    <path d="M40,80 L60,20 L80,55 L100,20 L120,35 L140,20 L160,5" className="draw-path" />
                    <line x1="40" y1="80" x2="140" y2="20" stroke="rgba(255,255,255,0.2)" strokeDasharray="4" strokeWidth="1"/>
                </svg>
            )}

            {type === 'CHART_DESC_TRIANGLE' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-4 stroke-brand-danger fill-none stroke-[2px]">
                    <line x1="40" y1="80" x2="140" y2="80" stroke="white" strokeWidth="1"/>
                    <path d="M40,20 L60,80 L80,45 L100,80 L120,65 L140,80 L160,95" className="draw-path" />
                    <line x1="40" y1="20" x2="140" y2="80" stroke="rgba(255,255,255,0.2)" strokeDasharray="4" strokeWidth="1"/>
                </svg>
            )}

            {type === 'CHART_WEDGE_BULL' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-4 stroke-brand-success fill-none stroke-[2px]">
                    <line x1="20" y1="20" x2="140" y2="60" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" strokeWidth="1" />
                    <line x1="20" y1="50" x2="140" y2="80" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" strokeWidth="1" />
                    <path d="M20,20 L40,50 L60,30 L80,60 L100,50 L120,70" className="draw-path" />
                    <path d="M120,70 L150,30" strokeDasharray="2" stroke="white" className="draw-path" style={{animationDelay: '1.5s'}} />
                </svg>
            )}

            {type === 'CHART_WEDGE_BEAR' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-4 stroke-brand-danger fill-none stroke-[2px]">
                    <line x1="20" y1="80" x2="140" y2="40" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" strokeWidth="1" />
                    <line x1="20" y1="50" x2="140" y2="20" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" strokeWidth="1" />
                    <path d="M20,80 L40,50 L60,70 L80,40 L100,60 L120,30" className="draw-path" />
                    <path d="M120,30 L150,80" strokeDasharray="2" stroke="white" className="draw-path" style={{animationDelay: '1.5s'}} />
                </svg>
            )}

            {type === 'CANDLE_DOJI' && (
                <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                    <line x1="50" y1="10" x2="50" y2="90" stroke="white" strokeWidth="2" />
                    <rect x="40" y="48" width="20" height="4" fill="white" className="animate-pulse" />
                    <text x="65" y="52" fill="#aaa" fontSize="10" stroke="none">DOJI</text>
                </svg>
            )}
        </div>
    );
};
