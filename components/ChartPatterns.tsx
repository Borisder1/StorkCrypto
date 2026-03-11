import React from 'react';
import { VisualType } from '../types';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';

export const ChartPattern: React.FC<{ type: VisualType }> = ({ type }) => {
    const { settings } = useStore();
    const isUa = settings?.language === 'ua';

    if (!type || type === 'NONE') return null;

    const getData = (type: string) => {
        // Data format: {o: open, h: high, l: low, c: close, label: optional text above/below}
        switch (type) {
            case 'CHART_HEAD_SHOULDERS': return [
                { o: 20, c: 40, h: 45, l: 15 }, { o: 40, c: 30, h: 42, l: 25, label: isUa ? 'Л. Плече' : 'L Shoulder' },
                { o: 30, c: 60, h: 65, l: 28 }, { o: 60, c: 30, h: 62, l: 25, label: isUa ? 'Голова' : 'Head' },
                { o: 30, c: 45, h: 48, l: 28 }, { o: 45, c: 20, h: 47, l: 15, label: isUa ? 'П. Плече' : 'R Shoulder' },
                { o: 20, c: 10, h: 25, l: 5 }
            ];
            case 'CHART_DOUBLE_TOP': return [
                { o: 20, c: 80, h: 85, l: 15 }, { o: 80, c: 40, h: 82, l: 35, label: isUa ? 'Пік 1' : 'Top 1' },
                { o: 40, c: 80, h: 85, l: 35 }, { o: 80, c: 20, h: 82, l: 15, label: isUa ? 'Пік 2' : 'Top 2' },
                { o: 20, c: 10, h: 25, l: 5 }
            ];
            case 'CHART_DOUBLE_BOTTOM': return [
                { o: 80, c: 20, h: 85, l: 15 }, { o: 20, c: 60, h: 65, l: 15, label: isUa ? 'Дно 1' : 'Bottom 1' },
                { o: 60, c: 20, h: 65, l: 15 }, { o: 20, c: 80, h: 85, l: 15, label: isUa ? 'Дно 2' : 'Bottom 2' },
                { o: 80, c: 90, h: 95, l: 75 }
            ];
            case 'CHART_BULL_FLAG': return [
                { o: 20, c: 80, h: 85, l: 15, label: isUa ? 'Флагшток' : 'Pole' },
                { o: 80, c: 70, h: 82, l: 65 }, { o: 70, c: 75, h: 78, l: 68 }, { o: 75, c: 65, h: 78, l: 60 }, { o: 65, c: 70, h: 72, l: 62, label: isUa ? 'Прапор' : 'Flag' },
                { o: 70, c: 95, h: 100, l: 65 }
            ];
            case 'CHART_CUP_HANDLE': return [
                { o: 80, c: 40, h: 85, l: 35 }, { o: 40, c: 20, h: 45, l: 15 }, { o: 20, c: 20, h: 25, l: 15, label: isUa ? 'Чашка' : 'Cup' }, { o: 20, c: 40, h: 45, l: 15 }, { o: 40, c: 80, h: 85, l: 35 },
                { o: 80, c: 70, h: 82, l: 65 }, { o: 70, c: 75, h: 78, l: 68, label: isUa ? 'Ручка' : 'Handle' },
                { o: 75, c: 95, h: 100, l: 70 }
            ];
            case 'CHART_ASC_TRIANGLE': return [
                { o: 20, c: 80, h: 85, l: 15 }, { o: 80, c: 40, h: 82, l: 35 },
                { o: 40, c: 80, h: 85, l: 35 }, { o: 80, c: 60, h: 82, l: 55 },
                { o: 60, c: 80, h: 85, l: 55 }, { o: 80, c: 100, h: 105, l: 75 }
            ];
            case 'CHART_DESC_TRIANGLE': return [
                { o: 80, c: 20, h: 85, l: 15 }, { o: 20, c: 60, h: 65, l: 15 },
                { o: 60, c: 20, h: 65, l: 15 }, { o: 20, c: 40, h: 45, l: 15 },
                { o: 40, c: 20, h: 45, l: 15 }, { o: 20, c: 0, h: 25, l: 0 }
            ];
            case 'CHART_WEDGE_BULL': return [
                { o: 80, c: 40, h: 85, l: 35 }, { o: 40, c: 70, h: 75, l: 35 },
                { o: 70, c: 35, h: 75, l: 30 }, { o: 35, c: 60, h: 65, l: 30 },
                { o: 60, c: 30, h: 65, l: 25 }, { o: 30, c: 90, h: 95, l: 25 }
            ];
            case 'CHART_WEDGE_BEAR': return [
                { o: 20, c: 60, h: 65, l: 15 }, { o: 60, c: 30, h: 65, l: 25 },
                { o: 30, c: 65, h: 70, l: 25 }, { o: 65, c: 40, h: 70, l: 35 },
                { o: 40, c: 70, h: 75, l: 35 }, { o: 70, c: 10, h: 75, l: 5 }
            ];
            case 'CHART_OB': return [
                { o: 80, c: 20, h: 85, l: 15 }, { o: 20, c: 10, h: 25, l: 5 },
                { o: 10, c: 50, h: 55, l: 5 }, { o: 50, c: 90, h: 95, l: 45 },
                { o: 90, c: 60, h: 95, l: 55 }, { o: 60, c: 15, h: 65, l: 10 },
                { o: 15, c: 80, h: 85, l: 10 }
            ];
            case 'CHART_FVG': return [
                { o: 20, c: 40, h: 45, l: 15 },
                { o: 40, c: 80, h: 85, l: 35 },
                { o: 80, c: 90, h: 95, l: 75 },
                { o: 90, c: 60, h: 95, l: 55 }
            ];
            case 'CHART_SMC': return [
                { o: 50, c: 60, h: 65, l: 45 }, { o: 60, c: 50, h: 65, l: 45 },
                { o: 50, c: 20, h: 55, l: 15 },
                { o: 20, c: 80, h: 85, l: 15 }, { o: 80, c: 90, h: 95, l: 75 }
            ];
            case 'CANDLE_HAMMER': return [
                { o: 80, c: 50, h: 85, l: 45 }, { o: 50, c: 30, h: 55, l: 25 }, // Downtrend
                { o: 30, c: 35, h: 40, l: 5, label: isUa ? 'Молот' : 'Hammer' }, // Hammer
                { o: 35, c: 60, h: 65, l: 30 }, { o: 60, c: 80, h: 85, l: 55 } // Uptrend
            ];
            case 'CANDLE_ENGULFING': return [
                { o: 80, c: 50, h: 85, l: 45 }, { o: 50, c: 30, h: 55, l: 25 }, // Downtrend
                { o: 30, c: 20, h: 35, l: 15 }, // Small red
                { o: 20, c: 40, h: 45, l: 15, label: isUa ? 'Поглинання' : 'Engulfing' }, // Big green
                { o: 40, c: 70, h: 75, l: 35 } // Uptrend
            ];
            case 'CANDLE_MORNING_STAR': return [
                { o: 80, c: 40, h: 85, l: 35 }, // Big red
                { o: 35, c: 30, h: 40, l: 25, label: isUa ? 'Зірка' : 'Star' }, // Small body/doji
                { o: 35, c: 70, h: 75, l: 30 }, // Big green
                { o: 70, c: 90, h: 95, l: 65 } // Uptrend
            ];
            case 'CANDLE_SHOOTING_STAR': return [
                { o: 20, c: 50, h: 55, l: 15 }, { o: 50, c: 70, h: 75, l: 45 }, // Uptrend
                { o: 70, c: 65, h: 95, l: 60, label: isUa ? 'Пад. Зірка' : 'Shooting Star' }, // Shooting star
                { o: 65, c: 40, h: 70, l: 35 }, { o: 40, c: 20, h: 45, l: 15 } // Downtrend
            ];
            default: return [];
        }
    };

    const data = getData(type);
    const isBullish = ['CHART_DOUBLE_BOTTOM', 'CHART_BULL_FLAG', 'CHART_CUP_HANDLE', 'CHART_ASC_TRIANGLE', 'CHART_WEDGE_BULL', 'CHART_OB', 'CHART_SMC', 'CANDLE_HAMMER', 'CANDLE_ENGULFING', 'CANDLE_MORNING_STAR'].includes(type);

    if (type === 'CANDLE_DOJI') {
        return (
            <div className="h-40 w-full bg-black/40 rounded-xl border border-white/5 mb-3 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="border border-white/20 p-6 rounded relative">
                        <div className="h-24 w-0.5 bg-white mx-auto"></div>
                        <div className="w-12 h-1 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute top-1/2 left-1/2 translate-x-3 -translate-y-1/2 text-[10px] text-slate-400 whitespace-nowrap bg-black/50 px-2 py-0.5 rounded">
                            {isUa ? 'ВІДКРИТТЯ ≈ ЗАКРИТТЯ' : 'OPEN ≈ CLOSE'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate points for the connecting line (using close prices)
    const linePoints = data.map((d, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * 80 + 10;
        const yClose = 100 - d.c;
        return `${x}%,${yClose}%`;
    }).join(' ');

    return (
        <div className="h-48 w-full bg-[#0a0f1e]/80 rounded-xl border border-white/10 mb-3 relative overflow-hidden shadow-inner">
            {/* Grid Background */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '10% 20%' }}></div>

            <div className="absolute inset-0 p-2 flex items-end justify-between">
                <svg width="100%" height="100%" className="overflow-visible">

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

                        // Y positions are inverted
                        const yHigh = 100 - d.h;
                        const yLow = 100 - d.l;
                        const yOpen = 100 - d.o;
                        const yClose = 100 - d.c;
                        const bodyTop = Math.min(yOpen, yClose);
                        const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1); // min 1% height

                        return (
                            <g key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                {/* Wick */}
                                <line x1={`${x}%`} y1={`${yHigh}%`} x2={`${x}%`} y2={`${yLow}%`} stroke={color} strokeWidth="1" />
                                {/* Body */}
                                <rect x={`calc(${x}% - 4px)`} y={`${bodyTop}%`} width="8px" height={`${bodyHeight}%`} fill={color} rx="1" />

                                {/* Label */}
                                {d.label && (
                                    <text
                                        x={`${x}%`}
                                        y={`${isUp ? yHigh - 5 : yLow + 12}%`}
                                        fill="#fff"
                                        fontSize="10px"
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
                            <rect x={`calc(${(1 / 6) * 80 + 10}% - 8px)`} y={`${100 - 25}%`} width="16px" height={`${15}%`} fill="rgba(0, 240, 255, 0.2)" />
                            <line x1="0%" y1={`${100 - 25}%`} x2="100%" y2={`${100 - 25}%`} stroke="rgba(0, 240, 255, 0.4)" strokeDasharray="2" strokeWidth="1" />
                            <line x1="0%" y1={`${100 - 10}%`} x2="100%" y2={`${100 - 10}%`} stroke="rgba(0, 240, 255, 0.4)" strokeDasharray="2" strokeWidth="1" />
                            <text x="85%" y={`${100 - 15}%`} fill="#00F0FF" fontSize="12px" fontWeight="bold">OB</text>
                        </g>
                    )}
                    {type === 'CHART_FVG' && (
                        <g className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
                            <rect x={`calc(${(1 / 3) * 80 + 10}% - 8px)`} y={`${100 - 75}%`} width="16px" height={`${30}%`} fill="rgba(168, 85, 247, 0.2)" />
                            <line x1="0%" y1={`${100 - 75}%`} x2="100%" y2={`${100 - 75}%`} stroke="rgba(168, 85, 247, 0.4)" strokeDasharray="2" strokeWidth="1" />
                            <line x1="0%" y1={`${100 - 45}%`} x2="100%" y2={`${100 - 45}%`} stroke="rgba(168, 85, 247, 0.4)" strokeDasharray="2" strokeWidth="1" />
                            <text x="85%" y={`${100 - 60}%`} fill="#a855f7" fontSize="12px" fontWeight="bold">FVG</text>
                        </g>
                    )}
                    {type === 'CHART_SMC' && (
                        <g className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
                            <line x1="0%" y1={`${100 - 45}%`} x2="100%" y2={`${100 - 45}%`} stroke="rgba(239, 68, 68, 0.4)" strokeDasharray="2" strokeWidth="1" />
                            <text x="5%" y={`${100 - 48}%`} fill="#ef4444" fontSize="10px">{isUa ? 'СТАРЕ ДНО' : 'OLD LOW'}</text>
                            <circle cx={`${(2 / 4) * 80 + 10}%`} cy={`${100 - 15}%`} r="6" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                            <circle cx={`${(2 / 4) * 80 + 10}%`} cy={`${100 - 15}%`} r="6" fill="none" stroke="#ef4444" strokeWidth="1" />
                            <text x={`calc(${(2 / 4) * 80 + 10}% + 12px)`} y={`${100 - 13}%`} fill="#ef4444" fontSize="10px" fontWeight="bold">{isUa ? 'ЗБІР' : 'SWEEP'}</text>
                        </g>
                    )}

                    {/* Neckline for Head & Shoulders */}
                    {type === 'CHART_HEAD_SHOULDERS' && (
                        <line x1="10%" y1={`${100 - 25}%`} x2="90%" y2={`${100 - 25}%`} stroke="#00F0FF" strokeWidth="1" className="animate-fade-in" style={{ animationDelay: '1000ms' }} />
                    )}
                </svg>
            </div>

            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-white z-10 transition-colors">
                {isBullish ? (isUa ? 'БИЧАЧИЙ' : 'BULLISH') : (isUa ? 'ВЕДМЕЖИЙ' : 'BEARISH')}
            </div>
        </div>
    );
};

