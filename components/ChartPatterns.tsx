import React from 'react';
import { VisualType } from '../types';

export const ChartPattern: React.FC<{ type: VisualType }> = ({ type }) => {
    if (!type || type === 'NONE') return null;

    const getData = (type: string) => {
        // Data format: {o: open, h: high, l: low, c: close, label: optional text above/below}
        switch(type) {
            case 'CHART_HEAD_SHOULDERS': return [
                {o: 20, c: 40, h: 45, l: 15}, {o: 40, c: 30, h: 42, l: 25, label: 'L Shoulder'}, 
                {o: 30, c: 60, h: 65, l: 28}, {o: 60, c: 30, h: 62, l: 25, label: 'Head'}, 
                {o: 30, c: 45, h: 48, l: 28}, {o: 45, c: 20, h: 47, l: 15, label: 'R Shoulder'}, 
                {o: 20, c: 10, h: 25, l: 5}
            ];
            case 'CHART_DOUBLE_TOP': return [
                {o: 20, c: 80, h: 85, l: 15}, {o: 80, c: 40, h: 82, l: 35, label: 'Top 1'}, 
                {o: 40, c: 80, h: 85, l: 35}, {o: 80, c: 20, h: 82, l: 15, label: 'Top 2'}, 
                {o: 20, c: 10, h: 25, l: 5}
            ];
            case 'CHART_DOUBLE_BOTTOM': return [
                {o: 80, c: 20, h: 85, l: 15}, {o: 20, c: 60, h: 65, l: 15, label: 'Bottom 1'}, 
                {o: 60, c: 20, h: 65, l: 15}, {o: 20, c: 80, h: 85, l: 15, label: 'Bottom 2'}, 
                {o: 80, c: 90, h: 95, l: 75}
            ];
            case 'CHART_BULL_FLAG': return [
                {o: 20, c: 80, h: 85, l: 15, label: 'Pole'}, 
                {o: 80, c: 70, h: 82, l: 65}, {o: 70, c: 75, h: 78, l: 68}, {o: 75, c: 65, h: 78, l: 60}, {o: 65, c: 70, h: 72, l: 62, label: 'Flag'}, 
                {o: 70, c: 95, h: 100, l: 65} 
            ];
            case 'CHART_CUP_HANDLE': return [
                {o: 80, c: 40, h: 85, l: 35}, {o: 40, c: 20, h: 45, l: 15}, {o: 20, c: 20, h: 25, l: 15, label: 'Cup'}, {o: 20, c: 40, h: 45, l: 15}, {o: 40, c: 80, h: 85, l: 35}, 
                {o: 80, c: 70, h: 82, l: 65}, {o: 70, c: 75, h: 78, l: 68, label: 'Handle'}, 
                {o: 75, c: 95, h: 100, l: 70} 
            ];
            case 'CHART_ASC_TRIANGLE': return [
                {o: 20, c: 80, h: 85, l: 15}, {o: 80, c: 40, h: 82, l: 35}, 
                {o: 40, c: 80, h: 85, l: 35}, {o: 80, c: 60, h: 82, l: 55}, 
                {o: 60, c: 80, h: 85, l: 55}, {o: 80, c: 100, h: 105, l: 75}
            ];
            case 'CHART_DESC_TRIANGLE': return [
                {o: 80, c: 20, h: 85, l: 15}, {o: 20, c: 60, h: 65, l: 15}, 
                {o: 60, c: 20, h: 65, l: 15}, {o: 20, c: 40, h: 45, l: 15}, 
                {o: 40, c: 20, h: 45, l: 15}, {o: 20, c: 0, h: 25, l: 0}
            ];
            case 'CHART_WEDGE_BULL': return [
                {o: 80, c: 40, h: 85, l: 35}, {o: 40, c: 70, h: 75, l: 35}, 
                {o: 70, c: 35, h: 75, l: 30}, {o: 35, c: 60, h: 65, l: 30}, 
                {o: 60, c: 30, h: 65, l: 25}, {o: 30, c: 90, h: 95, l: 25}
            ];
            case 'CHART_WEDGE_BEAR': return [
                {o: 20, c: 60, h: 65, l: 15}, {o: 60, c: 30, h: 65, l: 25}, 
                {o: 30, c: 65, h: 70, l: 25}, {o: 65, c: 40, h: 70, l: 35}, 
                {o: 40, c: 70, h: 75, l: 35}, {o: 70, c: 10, h: 75, l: 5}
            ];
            case 'CHART_OB': return [
                {o: 80, c: 20, h: 85, l: 15}, {o: 20, c: 10, h: 25, l: 5}, 
                {o: 10, c: 50, h: 55, l: 5}, {o: 50, c: 90, h: 95, l: 45}, 
                {o: 90, c: 60, h: 95, l: 55}, {o: 60, c: 15, h: 65, l: 10}, 
                {o: 15, c: 80, h: 85, l: 10} 
            ];
            case 'CHART_FVG': return [
                {o: 20, c: 40, h: 45, l: 15}, 
                {o: 40, c: 80, h: 85, l: 35}, 
                {o: 80, c: 90, h: 95, l: 75}, 
                {o: 90, c: 60, h: 95, l: 55}  
            ];
            case 'CHART_SMC': return [
                {o: 50, c: 60, h: 65, l: 45}, {o: 60, c: 50, h: 65, l: 45}, 
                {o: 50, c: 20, h: 55, l: 15}, 
                {o: 20, c: 80, h: 85, l: 15}, {o: 80, c: 90, h: 95, l: 75} 
            ];
            case 'CANDLE_HAMMER': return [
                {o: 80, c: 50, h: 85, l: 45}, {o: 50, c: 30, h: 55, l: 25}, // Downtrend
                {o: 30, c: 35, h: 40, l: 5, label: 'Hammer'}, // Hammer
                {o: 35, c: 60, h: 65, l: 30}, {o: 60, c: 80, h: 85, l: 55} // Uptrend
            ];
            case 'CANDLE_ENGULFING': return [
                {o: 80, c: 50, h: 85, l: 45}, {o: 50, c: 30, h: 55, l: 25}, // Downtrend
                {o: 30, c: 20, h: 35, l: 15}, // Small red
                {o: 20, c: 40, h: 45, l: 15, label: 'Engulfing'}, // Big green
                {o: 40, c: 70, h: 75, l: 35} // Uptrend
            ];
            case 'CANDLE_MORNING_STAR': return [
                {o: 80, c: 40, h: 85, l: 35}, // Big red
                {o: 35, c: 30, h: 40, l: 25, label: 'Star'}, // Small body/doji
                {o: 35, c: 70, h: 75, l: 30}, // Big green
                {o: 70, c: 90, h: 95, l: 65} // Uptrend
            ];
            case 'CANDLE_SHOOTING_STAR': return [
                {o: 20, c: 50, h: 55, l: 15}, {o: 50, c: 70, h: 75, l: 45}, // Uptrend
                {o: 70, c: 65, h: 95, l: 60, label: 'Shooting Star'}, // Shooting star
                {o: 65, c: 40, h: 70, l: 35}, {o: 40, c: 20, h: 45, l: 15} // Downtrend
            ];
            default: return [];
        }
    };

    const data = getData(type);
    const isBullish = ['CHART_DOUBLE_BOTTOM', 'CHART_BULL_FLAG', 'CHART_CUP_HANDLE', 'CHART_ASC_TRIANGLE', 'CHART_WEDGE_BULL', 'CHART_OB', 'CHART_SMC', 'CANDLE_HAMMER', 'CANDLE_ENGULFING', 'CANDLE_MORNING_STAR'].includes(type);

    if (type === 'CANDLE_DOJI') {
        return (
            <div className="h-40 w-full bg-black/40 rounded-xl border border-white/5 mb-3 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                    <line x1="50" y1="20" x2="50" y2="80" stroke="white" strokeWidth="2" />
                    <rect x="45" y="48" width="10" height="4" fill="white" />
                    <text x="60" y="52" fill="#aaa" fontSize="6" stroke="none">OPEN ≈ CLOSE</text>
                </svg>
            </div>
        );
    }

    // Calculate points for the connecting line (using close prices)
    const linePoints = data.map((d, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * 80 + 10;
        const yClose = 100 - d.c;
        return `${x},${yClose}`;
    }).join(' ');

    return (
        <div className="h-48 w-full bg-[#0a0f1e]/80 rounded-xl border border-white/10 mb-3 relative overflow-hidden shadow-inner">
             {/* Grid Background */}
             <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '10% 20%'}}></div>
             
             <div className="absolute inset-0 p-2 flex items-end justify-between">
                 <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                     
                     {/* Connecting Line for Pattern Shape */}
                     {type.startsWith('CHART_') && type !== 'CHART_OB' && type !== 'CHART_FVG' && type !== 'CHART_SMC' && (
                         <polyline 
                             points={linePoints} 
                             fill="none" 
                             stroke="rgba(255,255,255,0.2)" 
                             strokeWidth="1" 
                             strokeDasharray="2"
                             className="animate-fade-in"
                         />
                     )}

                     {data.map((d, i) => {
                         const isUp = d.c >= d.o;
                         const color = isUp ? '#22c55e' : '#ef4444';
                         const x = (i / Math.max(data.length - 1, 1)) * 80 + 10; // Spread evenly with padding
                         // Invert Y axis because SVG 0,0 is top-left
                         const yHigh = 100 - d.h;
                         const yLow = 100 - d.l;
                         const yOpen = 100 - d.o;
                         const yClose = 100 - d.c;
                         const bodyTop = Math.min(yOpen, yClose);
                         const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1); // min 1px height

                         return (
                             <g key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                 {/* Wick */}
                                 <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="0.5" />
                                 {/* Body */}
                                 <rect x={x - 2} y={bodyTop} width="4" height={bodyHeight} fill={color} rx="0.5" />
                                 
                                 {/* Label */}
                                 {d.label && (
                                     <text 
                                         x={x} 
                                         y={isUp ? yHigh - 5 : yLow + 8} 
                                         fill="#fff" 
                                         fontSize="4" 
                                         textAnchor="middle" 
                                         className="font-mono opacity-80"
                                     >
                                         {d.label}
                                     </text>
                                 )}
                             </g>
                         );
                     })}
                     
                     {/* Specific highlights for OB, FVG, SMC */}
                     {type === 'CHART_OB' && (
                         <g className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
                             <rect x={(1 / 6) * 80 + 10 - 4} y={100 - 25} width="8" height={15} fill="rgba(0, 240, 255, 0.2)" />
                             <line x1={0} y1={100 - 25} x2={100} y2={100 - 25} stroke="rgba(0, 240, 255, 0.4)" strokeDasharray="1" strokeWidth="0.5" />
                             <line x1={0} y1={100 - 10} x2={100} y2={100 - 10} stroke="rgba(0, 240, 255, 0.4)" strokeDasharray="1" strokeWidth="0.5" />
                             <text x="85" y={100 - 15} fill="#00F0FF" fontSize="4" fontWeight="bold">OB</text>
                         </g>
                     )}
                     {type === 'CHART_FVG' && (
                         <g className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
                             <rect x={(1 / 3) * 80 + 10 - 4} y={100 - 75} width="8" height={30} fill="rgba(168, 85, 247, 0.2)" />
                             <line x1={0} y1={100 - 75} x2={100} y2={100 - 75} stroke="rgba(168, 85, 247, 0.4)" strokeDasharray="1" strokeWidth="0.5" />
                             <line x1={0} y1={100 - 45} x2={100} y2={100 - 45} stroke="rgba(168, 85, 247, 0.4)" strokeDasharray="1" strokeWidth="0.5" />
                             <text x="85" y={100 - 60} fill="#a855f7" fontSize="4" fontWeight="bold">FVG</text>
                         </g>
                     )}
                     {type === 'CHART_SMC' && (
                         <g className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
                             <line x1={0} y1={100 - 45} x2={100} y2={100 - 45} stroke="rgba(239, 68, 68, 0.4)" strokeDasharray="1" strokeWidth="0.5" />
                             <text x="5" y={100 - 47} fill="#ef4444" fontSize="3">OLD LOW</text>
                             <circle cx={(2 / 4) * 80 + 10} cy={100 - 15} r="2" fill="none" stroke="#ef4444" strokeWidth="0.5" className="animate-ping" />
                             <text x={(2 / 4) * 80 + 10 + 3} y={100 - 15} fill="#ef4444" fontSize="3" fontWeight="bold">SWEEP</text>
                         </g>
                     )}
                     
                     {/* Neckline for Head & Shoulders */}
                     {type === 'CHART_HEAD_SHOULDERS' && (
                         <line x1={10} y1={100 - 25} x2={90} y2={100 - 25} stroke="#00F0FF" strokeWidth="0.5" className="animate-fade-in" style={{ animationDelay: '1000ms' }} />
                     )}
                 </svg>
             </div>

            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 border border-white/10 text-[8px] font-mono text-white z-10">
                {isBullish ? 'BULLISH' : 'BEARISH'}
            </div>
        </div>
    );
};

