import React from 'react';
import { VisualType } from '../types';
import { useStore } from '../store';

const LABELS_DB: Record<string, Record<string, string>> = {
    'en': {
        'L Shoulder': 'Left Shoulder',
        'Head': 'Head Ratio 1:1.6',
        'R Shoulder': 'Right Shoulder',
        'Top 1': 'Peak #1 (Resistance)',
        'Top 2': 'Peak #2 (Exhaustion)',
        'Bottom 1': 'Support Trough 1',
        'Bottom 2': 'Support Trough 2',
        'Cup': 'Accumulation Zone (Cup)',
        'Handle': 'Shakeout Pullback (Handle)',
        'Pole': 'Impulse Flagpole',
        'Flag': 'Correction Channel (Flag)',
        'Hammer': 'Bullish Hammer Candle',
        'Star': 'Morning Star Star',
        'Shooting Star': 'Shooting Star Reversal',
        'Engulfing': 'Bullish Engulfing Body',
        'BOS': 'BOS (Break of Structure)',
        'CHoCH': 'CHoCH (Change of Character)',
        'SWEEP': 'LIQUIDITY SWEPT',
        'LIQUIDITY': 'LIQUIDITY POOL',
        'OB_ZONE': 'BULLISH INSTITUTIONAL ORDER BLOCK (OB)',
        'GAP_ZONE': 'FAIR VALUE GAP (FVG) / INEFFICIENCY',
        'ENTRY': 'BUY ENTRY TRIGGER',
        'ENTRY_SHORT': 'SHORT ENTRY TRIGGER',
        'STOP_LOSS': 'STOP LOSS',
        'TARGET': 'TAKE PROFIT TARGET',
        'NECKLINE': 'NECKLINE'
    },
    'ua': {
        'L Shoulder': 'Ліве плече',
        'Head': 'Голова патерна',
        'R Shoulder': 'Праве плече',
        'Top 1': 'Пік №1 (Опір)',
        'Top 2': 'Пік №2 (Виснаження)',
        'Bottom 1': 'Рівень Підтримки 1',
        'Bottom 2': 'Рівень Підтримки 2',
        'Cup': 'Зона Накопичення (Чашка)',
        'Handle': 'Тест покупців (Ручка)',
        'Pole': 'Імпульсний Флагшток',
        'Flag': 'Формація Корекції (Прапор)',
        'Hammer': 'Бичачий Молот (Пін-бар)',
        'Star': 'Ранкова Зоря (Свічка доджі)',
        'Shooting Star': 'Падаюча Зірка (Свічка розвороту)',
        'Engulfing': 'Бичаче Поглинання',
        'BOS': 'BOS (Пробиття структури)',
        'CHoCH': 'CHoCH (Зміна характеру ринку)',
        'SWEEP': 'ЗБІР ЛІКВІДНОСТІ (SWEEP)',
        'LIQUIDITY': 'ПУЛ ЗАКРИТТЯ ЛІКВІДНОСТІ',
        'OB_ZONE': 'БИЧАЧИЙ ОРДЕР БЛОК (OB)',
        'GAP_ZONE': 'ІМБАЛАНС (GAP / FVG)',
        'ENTRY': 'ТРИГЕР ВХОДУ (CUP)',
        'ENTRY_SHORT': 'ТРИГЕР ШОРТ ВХОДУ',
        'STOP_LOSS': 'СТОП ЛОСС',
        'TARGET': 'ЦІЛЬ ФІКСАЦІЇ ПРИБУТКУ',
        'NECKLINE': 'ЛІНІЯ ШИЇ (NECKLINE)'
    },
    'pl': {
        'L Shoulder': 'Lewe Ramię',
        'Head': 'Głowa Formacji',
        'R Shoulder': 'Prawe Ramię',
        'Top 1': 'Szczyt #1 (Opór)',
        'Top 2': 'Szczyt #2 (Wyczerpanie)',
        'Bottom 1': 'Poziom Wsparcia 1',
        'Bottom 2': 'Poziom Wsparcia 2',
        'Cup': 'Strefa Akumulacji (Filiżanka)',
        'Handle': 'Korekta Testowa (Ucho)',
        'Pole': 'Maszt Impulsowy',
        'Flag': 'Kanał Korekcyjny (Flaga)',
        'Hammer': 'Świeca Młota Byczego',
        'Star': 'Świeca Gwiazdy Porannej',
        'Shooting Star': 'Spadająca Gwiazda (Reversal)',
        'Engulfing': 'Objęcie Bycze',
        'BOS': 'BOS (Przełamanie struktury)',
        'CHoCH': 'CHoCH (Zmiana charakteru)',
        'SWEEP': 'CZYSZCZENIE PŁYNNOŚCI',
        'LIQUIDITY': 'PULA PŁYNNOŚCI (SELLSTOPS)',
        'OB_ZONE': 'BLOK ZLECEŃ INSTYTUCJONALNYCH (OB)',
        'GAP_ZONE': 'LUKA WARTOŚCI GODZIWEJ (FVG)',
        'ENTRY': 'ZAPALNIK WEJŚCIA (UP)',
        'ENTRY_SHORT': 'ZAPALNIK WEJŚCIA (SHORT)',
        'STOP_LOSS': 'STOP LOSS',
        'TARGET': 'CEL REALIZACJI ZYSKU',
        'NECKLINE': 'LINIA SZYI (NECKLINE)'
    }
};

export const ChartPattern: React.FC<{ type: VisualType }> = ({ type }) => {
    const { settings } = useStore();
    const lang = settings?.language || 'en';
    const loc = (key: string) => {
        const d = LABELS_DB[lang] || LABELS_DB['en'];
        return d[key] || key;
    };

    if (!type || type === 'NONE') return null;

    const getData = (type: string) => {
        switch(type) {
            case 'CHART_HEAD_SHOULDERS': return [
                {o: 25, c: 45, h: 50, l: 20}, 
                {o: 45, c: 35, h: 48, l: 30, label: loc('L Shoulder')}, 
                {o: 35, c: 75, h: 80, l: 32}, 
                {o: 75, c: 35, h: 78, l: 30, label: loc('Head')}, 
                {o: 35, c: 55, h: 58, l: 32}, 
                {o: 55, c: 30, h: 56, l: 25, label: loc('R Shoulder')}, 
                {o: 30, c: 15, h: 32, l: 10}
            ];
            case 'CHART_DOUBLE_TOP': return [
                {o: 25, c: 80, h: 85, l: 20}, 
                {o: 80, c: 45, h: 82, l: 40, label: loc('Top 1')}, 
                {o: 45, c: 80, h: 85, l: 40}, 
                {o: 80, c: 25, h: 82, l: 20, label: loc('Top 2')}, 
                {o: 25, c: 10, h: 28, l: 5}
            ];
            case 'CHART_DOUBLE_BOTTOM': return [
                {o: 80, c: 25, h: 85, l: 20}, 
                {o: 25, c: 60, h: 65, l: 20, label: loc('Bottom 1')}, 
                {o: 60, c: 25, h: 65, l: 20}, 
                {o: 25, c: 80, h: 85, l: 20, label: loc('Bottom 2')}, 
                {o: 80, c: 90, h: 95, l: 75}
            ];
            case 'CHART_BULL_FLAG': return [
                {o: 20, c: 75, h: 80, l: 15, label: loc('Pole')}, 
                {o: 75, c: 60, h: 78, l: 55}, 
                {o: 60, c: 68, h: 72, l: 57}, 
                {o: 68, c: 55, h: 70, l: 52, label: loc('Flag')}, 
                {o: 55, c: 92, h: 98, l: 50} 
            ];
            case 'CHART_CUP_HANDLE': return [
                {o: 80, c: 45, h: 85, l: 40}, 
                {o: 45, c: 25, h: 50, l: 20}, 
                {o: 25, c: 25, h: 30, l: 20, label: loc('Cup')}, 
                {o: 25, c: 50, h: 55, l: 20}, 
                {o: 50, c: 80, h: 85, l: 45}, 
                {o: 80, c: 65, h: 82, l: 60, label: loc('Handle')}, 
                {o: 65, c: 92, h: 98, l: 60} 
            ];
            case 'CHART_ASC_TRIANGLE': return [
                {o: 25, c: 75, h: 80, l: 20}, 
                {o: 75, c: 45, h: 78, l: 40}, 
                {o: 45, c: 75, h: 78, l: 40}, 
                {o: 75, c: 60, h: 78, l: 55}, 
                {o: 60, c: 75, h: 78, l: 58}, 
                {o: 75, c: 95, h: 100, l: 72}
            ];
            case 'CHART_DESC_TRIANGLE': return [
                {o: 75, c: 25, h: 80, l: 20}, 
                {o: 25, c: 60, h: 65, l: 22}, 
                {o: 60, c: 25, h: 65, l: 22}, 
                {o: 25, c: 45, h: 48, l: 22}, 
                {o: 45, c: 25, h: 48, l: 20}, 
                {o: 25, c: 8, h: 28, l: 3}
            ];
            case 'CHART_WEDGE_BULL': return [
                {o: 80, c: 45, h: 85, l: 40}, 
                {o: 45, c: 70, h: 75, l: 40}, 
                {o: 70, c: 38, h: 74, l: 35}, 
                {o: 38, c: 62, h: 66, l: 35}, 
                {o: 62, c: 32, h: 65, l: 30}, 
                {o: 32, c: 88, h: 92, l: 30}
            ];
            case 'CHART_WEDGE_BEAR': return [
                {o: 25, c: 60, h: 65, l: 20}, 
                {o: 60, c: 35, h: 65, l: 30}, 
                {o: 35, c: 68, h: 72, l: 30}, 
                {o: 68, c: 45, h: 72, l: 40}, 
                {o: 45, c: 75, h: 80, l: 40}, 
                {o: 75, c: 15, h: 78, l: 10}
            ];
            case 'CHART_OB': return [
                {o: 80, c: 25, h: 85, l: 20}, 
                {o: 25, c: 15, h: 30, l: 10}, 
                {o: 15, c: 50, h: 55, l: 10}, 
                {o: 50, c: 88, h: 92, l: 45}, 
                {o: 88, c: 65, h: 92, l: 60}, 
                {o: 65, c: 22, h: 68, l: 18}, 
                {o: 22, c: 82, h: 85, l: 18} 
            ];
            case 'CHART_FVG': return [
                {o: 25, c: 45, h: 50, l: 20}, 
                {o: 45, c: 82, h: 88, l: 40}, 
                {o: 82, c: 92, h: 96, l: 78}, 
                {o: 92, c: 65, h: 95, l: 60}  
            ];
            case 'CHART_SMC': return [
                {o: 55, c: 65, h: 70, l: 50}, 
                {o: 65, c: 52, h: 68, l: 48}, 
                {o: 52, c: 22, h: 55, l: 18}, 
                {o: 22, c: 82, h: 88, l: 18}, 
                {o: 82, c: 92, h: 96, l: 78} 
            ];
            case 'CANDLE_HAMMER': return [
                {o: 80, c: 50, h: 85, l: 45}, 
                {o: 50, c: 30, h: 55, l: 25}, 
                {o: 30, c: 35, h: 38, l: 5, label: loc('Hammer')}, 
                {o: 35, c: 65, h: 70, l: 30}, 
                {o: 65, c: 82, h: 86, l: 60} 
            ];
            case 'CANDLE_ENGULFING': return [
                {o: 80, c: 50, h: 85, l: 45}, 
                {o: 50, c: 30, h: 55, l: 25}, 
                {o: 32, c: 22, h: 36, l: 18}, 
                {o: 20, c: 45, h: 48, l: 18, label: loc('Engulfing')}, 
                {o: 45, c: 75, h: 78, l: 40} 
            ];
            case 'CANDLE_MORNING_STAR': return [
                {o: 80, c: 40, h: 85, l: 35}, 
                {o: 38, c: 35, h: 42, l: 25, label: loc('Star')}, 
                {o: 35, c: 72, h: 76, l: 30}, 
                {o: 72, c: 90, h: 94, l: 68} 
            ];
            case 'CANDLE_SHOOTING_STAR': return [
                {o: 25, c: 50, h: 55, l: 20}, 
                {o: 50, c: 72, h: 76, l: 45}, 
                {o: 72, c: 68, h: 98, l: 65, label: loc('Shooting Star')}, 
                {o: 68, c: 42, h: 70, l: 38}, 
                {o: 42, c: 22, h: 45, l: 15} 
            ];
            default: return [];
        }
    };

    const data = getData(type);
    const isBullish = [
        'CHART_DOUBLE_BOTTOM', 'CHART_BULL_FLAG', 'CHART_CUP_HANDLE', 
        'CHART_ASC_TRIANGLE', 'CHART_WEDGE_BULL', 'CHART_OB', 'CHART_SMC', 
        'CANDLE_HAMMER', 'CANDLE_ENGULFING', 'CANDLE_MORNING_STAR'
    ].includes(type);

    if (type === 'CANDLE_DOJI') {
        return (
            <div className="h-44 w-full bg-black/50 rounded-2xl border border-white/5 flex flex-col p-4 relative overflow-hidden">
                <div className="flex-1 flex items-center justify-center relative">
                    <svg viewBox="0 0 100 100" className="w-48 h-full">
                        <line x1="50" y1="15" x2="50" y2="85" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                        <rect x="35" y="49" width="30" height="2" fill="#38bdf8" className="animate-pulse" />
                        <text x="50" y="44" fill="#38bdf8" fontSize="5" fontWeight="bold" textAnchor="middle" className="font-mono">OPEN ≈ CLOSE</text>
                        <text x="50" y="94" fill="#94a3b8" fontSize="4" textAnchor="middle" className="font-mono italic">Indecision Peak / Рівновага</text>
                    </svg>
                </div>
            </div>
        );
    }

    // Connect close prices for outline
    const linePoints = data.map((d, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * 74 + 13;
        const yClose = 100 - d.c;
        return `${x},${yClose}`;
    }).join(' ');

    return (
        <div className="w-full bg-[#070b16] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            
            {/* SVG Visual Stage */}
            <div className="h-48 w-full relative overflow-hidden shrink-0">
                {/* Grid Background */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '10% 20%'
                }}></div>

                {/* Subdued Glow */}
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl opacity-20 pointer-events-none rounded-full ${isBullish ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                <div className="absolute inset-0 p-3">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        
                        {/* 1. PROFESSIONAL TA OVERLAY COMPONENT */}
                        {type === 'CHART_HEAD_SHOULDERS' && (
                            <g>
                                {/* Neckline */}
                                <line x1="12" y1="100 - 32" x2="88" y2="100 - 32" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2" className="animate-pulse" />
                                <text x="50" y="100 - 35" fill="#22d3ee" fontSize="3" fontWeight="black" textAnchor="middle" className="font-sans tracking-widest">{loc('NECKLINE')}</text>

                                {/* Entry breakout target circle */}
                                <circle cx="81" cy="100 - 32" r="2.5" fill="none" stroke="#ef4444" strokeWidth="0.75" className="animate-ping" />
                                <circle cx="81" cy="100 - 32" r="1.5" fill="#ef4444" />
                                <text x="81" y="100 - 37" fill="#ef4444" fontSize="3" fontWeight="bold" textAnchor="middle" className="font-sans">{loc('ENTRY_SHORT')}</text>

                                {/* Target area projection */}
                                <line x1="81" y1="100 - 32" x2="81" y2="100 - 12" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1 1" />
                                <rect x="74" y="100 - 12" width="14" height="6" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" strokeWidth="0.5" rx="1" />
                                <text x="81" y="100 - 8" fill="#f43f5e" fontSize="2.5" fontWeight="black" textAnchor="middle" className="font-sans">{loc('TARGET')}</text>

                                {/* Stop Loss at shoulder */}
                                <line x1="60" y1="100 - 56" x2="92" y2="100 - 56" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="1 1" />
                                <text x="92" y="100 - 58" fill="#f59e0b" fontSize="2.5" textAnchor="end" className="font-mono">{loc('STOP_LOSS')}</text>
                            </g>
                        )}

                        {type === 'CHART_DOUBLE_TOP' && (
                            <g>
                                {/* Resistance level */}
                                <line x1="12" y1="100 - 82" x2="88" y2="100 - 82" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2" />
                                
                                {/* Neckline */}
                                <line x1="12" y1="100 - 42" x2="88" y2="100 - 42" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2" />
                                <text x="25" y="100 - 45" fill="#38bdf8" fontSize="3" className="font-sans tracking-widest">{loc('NECKLINE')}</text>
                                
                                {/* Trigger points */}
                                <circle cx="75" cy="100 - 42" r="2" fill="#ef4444" />
                                <text x="75" y="100 - 47" fill="#ef4444" fontSize="3" fontWeight="bold" textAnchor="middle">{loc('ENTRY_SHORT')}</text>

                                {/* Target zone */}
                                <rect x="72" y="100 - 15" width="18" height="8" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="0.5" rx="1" />
                                <text x="81" y="100 - 10" fill="#ef4444" fontSize="2.5" fontWeight="bold" textAnchor="middle">{loc('TARGET')}</text>
                            </g>
                        )}

                        {type === 'CHART_DOUBLE_BOTTOM' && (
                            <g>
                                {/* Support level */}
                                <line x1="12" y1="100 - 22" x2="88" y2="100 - 22" stroke="#10b981" strokeWidth="1" strokeDasharray="2" />
                                
                                {/* Neckline */}
                                <line x1="12" y1="100 - 62" x2="88" y2="100 - 62" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2" />
                                <text x="25" y="100 - 65" fill="#38bdf8" fontSize="3" className="font-sans tracking-widest">{loc('NECKLINE')}</text>
                                
                                {/* Entry Target */}
                                <circle cx="75" cy="100 - 62" r="2.5" fill="none" stroke="#10b981" strokeWidth="0.5" className="animate-ping" />
                                <circle cx="75" cy="100 - 62" r="1.5" fill="#10b981" />
                                <text x="75" y="100 - 67" fill="#10b981" fontSize="3" fontWeight="bold" textAnchor="middle">{loc('ENTRY')}</text>

                                {/* Profit target zone */}
                                <rect x="70" y="100 - 95" width="20" height="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="0.5" rx="1" />
                                <text x="80" y="100 - 90" fill="#10b981" fontSize="2.5" fontWeight="bold" textAnchor="middle">{loc('TARGET')}</text>
                            </g>
                        )}

                        {type === 'CHART_BULL_FLAG' && (
                            <g>
                                {/* Parallel Channel lines for correction flag */}
                                <line x1="28" y1="100 - 78" x2="68" y2="100 - 62" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="1.5" />
                                <line x1="28" y1="100 - 58" x2="68" y2="100 - 45" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="1.5" />
                                
                                {/* Breakout arrow */}
                                <path d="M 68 100-55 L 85 100-91" stroke="#10b981" strokeWidth="1.5" strokeDasharray="none" strokeLinecap="round" />
                                <polygon points="85,100-91 80,100-90 84,100-86" fill="#10b981" />

                                {/* Take profit marker */}
                                <rect x="75" y="100 - 98" width="22" height="7" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="0.5" rx="1" />
                                <text x="86" y="100 - 93" fill="#10b981" fontSize="2.5" fontWeight="bold" textAnchor="middle">{loc('TARGET')}</text>
                            </g>
                        )}

                        {type === 'CHART_CUP_HANDLE' && (
                            <g>
                                {/* Cup arc underlay */}
                                <path d="M 13 100-45 Q 40 100-5 Q 67 100-45" fill="none" stroke="#22d3ee" strokeWidth="0.75" strokeDasharray="2" />
                                
                                {/* Handle flag bounds */}
                                <line x1="65" y1="100 - 82" x2="78" y2="100 - 68" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="1" />
                                <line x1="61" y1="100 - 68" x2="74" y2="100 - 54" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="1" />

                                {/* Breakout route */}
                                <path d="M 72 100-60 L 85 100-92" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                                <polygon points="85,100-92 81,100-90 84,100-88" fill="#10b981" />
                                
                                <circle cx="72" cy="100-60" r="1.5" fill="#10b981" />
                                <text x="64" y="100-56" fill="#10b981" fontSize="2.5" fontWeight="bold">{loc('ENTRY')}</text>
                            </g>
                        )}

                        {type === 'CHART_ASC_TRIANGLE' && (
                            <g>
                                {/* Flat resistance */}
                                <line x1="12" y1="100 - 75" x2="78" y2="100 - 75" stroke="#ef4444" strokeWidth="1" strokeDasharray="2" />
                                {/* Rising support */}
                                <line x1="13" y1="100 - 22" x2="78" y2="100 - 75" stroke="#10b981" strokeWidth="1" strokeDasharray="2" />
                                
                                {/* Breakout projection */}
                                <path d="M 75 100-75 L 88 100-98" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                                <polygon points="88,100-98 83,100-95 86,100-93" fill="#10b981" />
                            </g>
                        )}

                        {type === 'CHART_DESC_TRIANGLE' && (
                            <g>
                                {/* Flat support */}
                                <line x1="12" y1="100 - 25" x2="78" y2="100 - 25" stroke="#10b981" strokeWidth="1" strokeDasharray="2" />
                                {/* Falling resistance */}
                                <line x1="13" y1="100 - 78" x2="78" y2="100 - 25" stroke="#ef4444" strokeWidth="1" strokeDasharray="2" />

                                {/* Breakdown projection */}
                                <path d="M 74 100-25 L 85 100-3" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                                <polygon points="85,100-3 81,100-7 84,100-9" fill="#ef4444" />
                            </g>
                        )}

                        {type === 'CHART_OB' && (
                            <g>
                                {/* Block Underlay */}
                                <rect x="20" y="100 - 32" width="23" height="20" fill="rgba(0, 240, 255, 0.08)" stroke="#00d9ff" strokeWidth="0.5" strokeDasharray="1.5" />
                                <text x="31" y="100 - 22" fill="#00e5ff" fontSize="3" fontWeight="bold" textAnchor="middle">BUY OB</text>

                                {/* Mitigation path bounce */}
                                <path d="M 43 100-65 L 54 100-22 L 76 100-80" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="1" />
                                <circle cx="54" cy="100-22" r="2" fill="none" stroke="#22c55e" strokeWidth="0.5" className="animate-ping" />
                                <text x="54" y="100-14" fill="#22c55e" fontSize="3" fontWeight="bold" textAnchor="middle">TEST & BOUNCE</text>
                            </g>
                        )}

                        {type === 'CHART_FVG' && (
                            <g>
                                {/* Fair Value Gap shaded band between candle 1 and candle 3 */}
                                <rect x="22" y="100 - 82" width="45" height="37" fill="rgba(168, 85, 247, 0.07)" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="1" rx="1" />
                                <text x="44.5" y="100 - 62" fill="#c084fc" fontSize="3.5" fontWeight="bold" textAnchor="middle">{loc('GAP_ZONE')}</text>
                                
                                {/* Anchor pointers */}
                                <line x1="12" y1="100 - 45" x2="70" y2="100 - 45" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="0.5" />
                                <line x1="12" y1="100 - 82" x2="70" y2="100 - 82" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="0.5" />
                            </g>
                        )}

                        {type === 'CHART_SMC' && (
                            <g>
                                {/* Liquidity pool sweeping line */}
                                <line x1="5" y1="100 - 22" x2="75" y2="100 - 22" stroke="#ea580c" strokeWidth="0.75" strokeDasharray="2" />
                                <text x="12" y="100-25" fill="#ea580c" fontSize="3" fontWeight="black">{loc('LIQUIDITY')}</text>

                                {/* Break of Structure marker */}
                                <line x1="52" y1="100 - 82" x2="90" y2="100 - 82" stroke="#22d3ee" strokeWidth="0.75" />
                                <rect x="68" y="100-88" width="12" height="5" fill="#0f172a" stroke="#22d3ee" strokeWidth="0.5" rx="1" />
                                <text x="74" y="100-84.5" fill="#22d3ee" fontSize="2.5" fontWeight="bold" textAnchor="middle">BOS</text>

                                {/* Sweep trigger alert circle */}
                                <circle cx="36" cy="100-22" r="2.5" fill="none" stroke="#ef4444" strokeWidth="0.5" className="animate-ping" />
                                <text x="36" y="100-14" fill="#ef4444" fontSize="2.5" fontWeight="bold" textAnchor="middle">{loc('SWEEP')}</text>
                            </g>
                        )}


                        {/* 2. CORE CANDLESTICK PLOTTING (Dynamic loop) */}
                        {data.map((d, i) => {
                            const isUp = d.c >= d.o;
                            // Match classic neon colors
                            const color = isUp ? '#00f5a0' : '#ff4a7d';
                            const x = (i / Math.max(data.length - 1, 1)) * 74 + 13; // Horizontal spacing alignment
                            const yHigh = 100 - d.h;
                            const yLow = 100 - d.l;
                            const yOpen = 100 - d.o;
                            const yClose = 100 - d.c;
                            const bodyTop = Math.min(yOpen, yClose);
                            const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1.5);

                            return (
                                <g key={i} className="transition-all duration-500">
                                    {/* Wick Line */}
                                    <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="0.75" strokeLinecap="round" />
                                    {/* Real Body Rect */}
                                    <rect 
                                        x={x - 2.5} 
                                        y={bodyTop} 
                                        width="5" 
                                        height={bodyHeight} 
                                        fill={color} 
                                        stroke={color}
                                        strokeWidth="0.25"
                                        rx="0.75" 
                                        className="transition-colors duration-300"
                                    />
                                    
                                    {/* Candle Node Labels */}
                                    {d.label && (
                                        <g>
                                            <rect 
                                                x={x - 16} 
                                                y={isUp ? yHigh - 12 : yLow + 4} 
                                                width="32" 
                                                height="7" 
                                                fill="rgba(10, 15, 30, 0.95)" 
                                                stroke="rgba(255,255,255,0.15)" 
                                                strokeWidth="0.5" 
                                                rx="1.5" 
                                            />
                                            <text 
                                                x={x} 
                                                y={isUp ? yHigh - 7.5 : yLow + 9} 
                                                fill="#ffffff" 
                                                fontSize="3" 
                                                fontWeight="bold"
                                                textAnchor="middle" 
                                                className="font-sans"
                                            >
                                                {d.label}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
                
                {/* Visual Bio Indicator Badge */}
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[8px] font-black font-orbitron border tracking-wider z-25 ${
                    isBullish 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                    {isBullish ? 'BULLISH SETUP' : 'BEARISH SETUP'}
                </span>
            </div>

            {/* Technical analysis details panel */}
            <div className="bg-[#0b1021]/80 border-t border-white/5 p-4 flex flex-col gap-2 font-sans select-none shrink-0">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ua' ? 'Рівень Складності' : 'Expert Rating'}</span>
                    <span className="text-[10px] text-brand-purple font-black font-orbitron">V8 PRO STANDARD</span>
                </div>
                
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
                    {type.startsWith('CHART_') 
                        ? (lang === 'ua' 
                            ? 'Слідкуйте за формуванням опорних точок. Пробій ключової лінії підтверджує зміну балансу пропозиції та попиту відповідно до математичних моделей.'
                            : 'Watch for the formation of key support of resistance zones. A breakout confirms market shift in balance of supply and demand.')
                        : (lang === 'ua'
                            ? 'Свічкові конфігурації допомагають заздалегідь визначити виснаження локального цінового імпульсу та підготуватись до розвороту.'
                            : 'Candlestick confirmation signals exhaustion of local buyers or sellers, enabling accurate reversal anticipation.'
                        )
                    }
                </p>
                
                {/* Multi-tier Educational Guide */}
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">{lang === 'ua' ? 'Вхід' : 'ENTRY'}</span>
                        <span className="text-[9px] font-mono font-black text-slate-300">
                            {type === 'CHART_HEAD_SHOULDERS' || type === 'CHART_DOUBLE_TOP' || type === 'CHART_WEDGE_BEAR' || type === 'CHART_DESC_TRIANGLE'
                                ? (lang === 'ua' ? 'Нижче рівня шиї' : 'Breakout below')
                                : (lang === 'ua' ? 'Вище опору' : 'Breakout above')
                            }
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">{lang === 'ua' ? 'Стоп' : 'STOP LOSS'}</span>
                        <span className="text-[9px] font-mono font-black text-amber-500">
                            {type.startsWith('CANDLE_') 
                                ? (lang === 'ua' ? 'Минулий лоу/хай' : 'Extreme candle wick')
                                : (lang === 'ua' ? 'Внутрішній екстремум' : 'Local minor swing')
                            }
                        </span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">{lang === 'ua' ? 'Ціль' : 'TARGET'}</span>
                        <span className="text-[9px] font-mono font-black text-emerald-400">
                            {type.startsWith('CANDLE_') 
                                ? (lang === 'ua' ? 'До опору х2.5' : 'Risk/Reward 1:3')
                                : (lang === 'ua' ? 'Висота патерна' : 'Full pattern depth')
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
