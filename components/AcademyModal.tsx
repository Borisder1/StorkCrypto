
import React, { useState, useMemo, useEffect } from 'react';
import { BookIcon, ChevronRightIcon, SearchIcon, FilterIcon } from './icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { AcademyTerm, Language } from '../types';

interface AcademyModalProps {
    onClose: () => void;
}

// MULTI-LANGUAGE CONTENT DATABASE
const ACADEMY_CONTENT: Record<Language, AcademyTerm[]> = {
    en: [
        { id: 'rsi', term: 'RSI (Relative Strength Index)', category: 'TECHNICAL', definition: 'Momentum indicator (0-100). >70: Overbought (sell potential). <30: Oversold (buy potential).', example: 'RSI dropped to 25 - strong buy signal.' },
        { id: 'macd', term: 'MACD', category: 'TECHNICAL', definition: 'Trend-following indicator showing relationship between two MAs. Golden Cross suggests entry.', example: 'Blue line crossed Red line upwards.' },
        { id: 'hns', term: 'Head & Shoulders', category: 'PATTERNS', definition: 'Reversal pattern with 3 peaks. Signals trend change from Bullish to Bearish.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Price broke neckline downwards.' },
        { id: 'bullflag', term: 'Bull Flag', category: 'PATTERNS', definition: 'Continuation pattern. Impulse up, consolidation down, breakout up.', visualType: 'CHART_BULL_FLAG', example: 'Price consolidating after 10% pump.' },
        { id: 'doubletop', term: 'Double Top', category: 'PATTERNS', definition: 'Bearish reversal. Price hits resistance twice and fails.', visualType: 'CHART_DOUBLE_TOP', example: 'Failed to break $70k twice.' },
        { id: 'doublebottom', term: 'Double Bottom', category: 'PATTERNS', definition: 'Bullish reversal "W" shape. Price hits support twice and bounces.', visualType: 'CHART_DOUBLE_BOTTOM', example: 'Bounced off $3000 twice.' },
        { id: 'cupandhandle', term: 'Cup and Handle', category: 'PATTERNS', definition: 'Bullish continuation pattern resembling a tea cup.', visualType: 'CHART_CUP_HANDLE', example: 'Long term bullish structure.' },
        { id: 'ascendingtriangle', term: 'Ascending Triangle', category: 'PATTERNS', definition: 'Bullish pattern. Flat top resistance, rising support.', visualType: 'CHART_ASC_TRIANGLE', example: 'Squeezing towards $100 breakout.' },
        { id: 'descendingtriangle', term: 'Descending Triangle', category: 'PATTERNS', definition: 'Bearish pattern. Flat bottom support, falling resistance.', visualType: 'CHART_DESC_TRIANGLE', example: 'Selling pressure increasing.' },
        { id: 'wedgebull', term: 'Falling Wedge', category: 'PATTERNS', definition: 'Bullish pattern. Price lowers in narrowing range.', visualType: 'CHART_WEDGE_BULL', example: 'Reversal likely upwards.' },
        { id: 'wedgebear', term: 'Rising Wedge', category: 'PATTERNS', definition: 'Bearish pattern. Price rises in narrowing range.', visualType: 'CHART_WEDGE_BEAR', example: 'Reversal likely downwards.' },
        { id: 'doji', term: 'Doji Candle', category: 'PATTERNS', definition: 'Candle where Open ≈ Close. Indecision.', visualType: 'CANDLE_DOJI', example: 'Doji at top indicates potential reversal.' },
        { id: 'fomo', term: 'FOMO', category: 'PSYCHOLOGY', definition: 'Fear Of Missing Out. Emotional buying at tops.', example: 'Don\'t buy green candles on FOMO.' },
        { id: 'fud', term: 'FUD', category: 'PSYCHOLOGY', definition: 'Fear, Uncertainty, Doubt. News manipulation.', example: 'China ban is just FUD.' },
        { id: 'seedphrase', term: 'Seed Phrase', category: 'SECURITY', definition: '12-24 words key to your wallet. Never share.', example: 'Keep offline on paper.' },
        { id: 'phishing', term: 'Phishing', category: 'SECURITY', definition: 'Fake sites stealing credentials.', example: 'Don\'t click suspicious links.' }
    ],
    ua: [
        { id: 'rsi', term: 'RSI (Індекс відносної сили)', category: 'TECHNICAL', definition: 'Індикатор імпульсу (0-100). >70: Перекупленість (продаж). <30: Перепроданність (покупка).', example: 'RSI впав до 25 - сильний сигнал на покупку.' },
        { id: 'macd', term: 'MACD', category: 'TECHNICAL', definition: 'Індикатор тренду. "Золотий хрест" (перетин ліній) вказує на ріст.', example: 'Синя лінія перетнула червону знизу вгору.' },
        { id: 'hns', term: 'Голова і Плечі', category: 'PATTERNS', definition: 'Патерн розвороту з 3 вершинами. Сигнал зміни тренду з бичачого на ведмежий.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Ціна пробила лінію шиї вниз.' },
        { id: 'bullflag', term: 'Бичачий Прапор', category: 'PATTERNS', definition: 'Патерн продовження. Імпульс вгору, консолідація вниз, прорив вгору.', visualType: 'CHART_BULL_FLAG', example: 'Ціна відпочиває після росту на 10%.' },
        { id: 'doubletop', term: 'Подвійна Вершина', category: 'PATTERNS', definition: 'Ведмежий розворот. Ціна двічі вдаряється в опір і падає.', visualType: 'CHART_DOUBLE_TOP', example: 'Не вдалося пробити $70k двічі.' },
        { id: 'doublebottom', term: 'Подвійне Дно', category: 'PATTERNS', definition: 'Бичачий розворот "W". Ціна двічі відскакує від підтримки.', visualType: 'CHART_DOUBLE_BOTTOM', example: 'Відскік від $3000 двічі.' },
        { id: 'cupandhandle', term: 'Чашка з Ручкою', category: 'PATTERNS', definition: 'Бичачий патерн продовження, що нагадує чашку.', visualType: 'CHART_CUP_HANDLE', example: 'Довгострокова структура росту.' },
        { id: 'ascendingtriangle', term: 'Висхідний Трикутник', category: 'PATTERNS', definition: 'Бичачий патерн. Рівний верх, підсвищення низів.', visualType: 'CHART_ASC_TRIANGLE', example: 'Тиск до пробою $100.' },
        { id: 'descendingtriangle', term: 'Низхідний Трикутник', category: 'PATTERNS', definition: 'Ведмежий патерн. Рівне дно, зниження вершин.', visualType: 'CHART_DESC_TRIANGLE', example: 'Продавці тиснуть ціну вниз.' },
        { id: 'wedgebull', term: 'Падаючий Клин', category: 'PATTERNS', definition: 'Бичачий сигнал. Ціна звужується, рухаючись вниз.', visualType: 'CHART_WEDGE_BULL', example: 'Ймовірний прорив вгору.' },
        { id: 'wedgebear', term: 'Зростаючий Клин', category: 'PATTERNS', definition: 'Ведмежий сигнал. Ціна звужується, рухаючись вгору.', visualType: 'CHART_WEDGE_BEAR', example: 'Ймовірний прорив вниз.' },
        { id: 'doji', term: 'Свічка Доджі', category: 'PATTERNS', definition: 'Свічка, де Відкриття ≈ Закриття. Знак невизначеності.', visualType: 'CANDLE_DOJI', example: 'Доджі на вершині - можливий розворот.' },
        { id: 'fomo', term: 'FOMO (ФОМО)', category: 'PSYCHOLOGY', definition: 'Страх втраченої вигоди. Емоційні покупки на хаях.', example: 'Не купуй зелені свічки через FOMO.' },
        { id: 'fud', term: 'FUD (ФАД)', category: 'PSYCHOLOGY', definition: 'Страх, Невизначеність, Сумнів. Маніпуляція новинами.', example: 'Новини про заборону - це просто FUD.' },
        { id: 'seedphrase', term: 'Сід-фраза', category: 'SECURITY', definition: '12-24 слова для доступу до гаманця. Нікому не давай.', example: 'Зберігай на папері в сейфі.' },
        { id: 'phishing', term: 'Фішинг', category: 'SECURITY', definition: 'Підроблені сайти для крадіжки паролів.', example: 'Не переходь за підозрілими посиланнями.' }
    ],
    pl: [
        { id: 'rsi', term: 'RSI (Wskaźnik Siły Względnej)', category: 'TECHNICAL', definition: 'Wskaźnik momentum (0-100). >70: Wykupienie (sprzedaż). <30: Wyprzedanie (kupno).', example: 'RSI spadło do 25 - sygnał kupna.' },
        { id: 'macd', term: 'MACD', category: 'TECHNICAL', definition: 'Wskaźnik trendu. "Złoty Krzyż" sugeruje wejście.', example: 'Niebieska linia przecięła czerwoną w górę.' },
        { id: 'hns', term: 'Głowa z Ramionami', category: 'PATTERNS', definition: 'Formacja odwrócenia z 3 szczytami. Zmiana trendu na spadkowy.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Cena przebiła linię szyi w dół.' },
        { id: 'bullflag', term: 'Flaga Byka', category: 'PATTERNS', definition: 'Formacja kontynuacji. Impuls w górę, konsolidacja, wybicie.', visualType: 'CHART_BULL_FLAG', example: 'Konsolidacja po 10% wzroście.' },
        { id: 'doubletop', term: 'Podwójny Szczyt', category: 'PATTERNS', definition: 'Odwrócenie spadkowe. Cena dwukrotnie uderza w opór.', visualType: 'CHART_DOUBLE_TOP', example: 'Nieudane przebicie $70k.' },
        { id: 'doublebottom', term: 'Podwójne Dno', category: 'PATTERNS', definition: 'Odwrócenie wzrostowe "W". Odbicie od wsparcia.', visualType: 'CHART_DOUBLE_BOTTOM', example: 'Odbicie od $3000 dwa razy.' },
        { id: 'cupandhandle', term: 'Filiżanka z Uchem', category: 'PATTERNS', definition: 'Wzrostowa formacja kontynuacji.', visualType: 'CHART_CUP_HANDLE', example: 'Długoterminowa struktura wzrostowa.' },
        { id: 'ascendingtriangle', term: 'Trójkąt Zwyżkujący', category: 'PATTERNS', definition: 'Formacja byka. Płaski opór, rosnące wsparcie.', visualType: 'CHART_ASC_TRIANGLE', example: 'Presja na przebicie $100.' },
        { id: 'descendingtriangle', term: 'Trójkąt Zniżkujący', category: 'PATTERNS', definition: 'Formacja niedźwiedzia. Płaskie wsparcie, spadający opór.', visualType: 'CHART_DESC_TRIANGLE', example: 'Presja sprzedażowa rośnie.' },
        { id: 'wedgebull', term: 'Klin Zniżkujący', category: 'PATTERNS', definition: 'Sygnał byka. Cena spada w zwężającym się zakresie.', visualType: 'CHART_WEDGE_BULL', example: 'Prawdopodobne wybicie w górę.' },
        { id: 'wedgebear', term: 'Klin Zwyżkujący', category: 'PATTERNS', definition: 'Sygnał niedźwiedzia. Cena rośnie w zwężającym się zakresie.', visualType: 'CHART_WEDGE_BEAR', example: 'Prawdopodobne wybicie w dół.' },
        { id: 'doji', term: 'Świeca Doji', category: 'PATTERNS', definition: 'Świeca gdzie Otwarcie ≈ Zamknięcie. Niepewność.', visualType: 'CANDLE_DOJI', example: 'Doji na szczycie - możliwe odwrócenie.' },
        { id: 'fomo', term: 'FOMO', category: 'PSYCHOLOGY', definition: 'Strach przed pominięciem. Emocjonalne zakupy na szczycie.', example: 'Nie kupuj zielonych świec przez FOMO.' },
        { id: 'fud', term: 'FUD', category: 'PSYCHOLOGY', definition: 'Strach, Niepewność, Wątpliwość. Manipulacja newsami.', example: 'Newsy o banach to często FUD.' },
        { id: 'seedphrase', term: 'Fraza Seed', category: 'SECURITY', definition: '12-24 słowa klucza do portfela. Nikomu nie podawaj.', example: 'Trzymaj offline na papierze.' },
        { id: 'phishing', term: 'Phishing', category: 'SECURITY', definition: 'Fałszywe strony kradnące dane.', example: 'Nie klikaj w podejrzane linki.' }
    ]
};

// Visual Components for Patterns
const ChartPattern: React.FC<{ type: AcademyTerm['visualType'] }> = ({ type }) => {
    if (!type || type === 'NONE') return null;

    return (
        <div className="h-32 w-full bg-black/40 rounded-lg border border-white/5 mb-3 flex items-center justify-center relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

            {type === 'CHART_HEAD_SHOULDERS' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-2 stroke-brand-cyan fill-none stroke-2">
                    <path d="M20,80 L40,50 L60,80 L80,20 L120,80 L140,50 L160,80" />
                    <line x1="10" y1="80" x2="190" y2="80" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" />
                    <text x="80" y="15" fill="white" stroke="none" fontSize="8">HEAD</text>
                </svg>
            )}
            
            {type === 'CHART_DOUBLE_TOP' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-2 stroke-brand-danger fill-none stroke-2">
                    <path d="M20,80 L50,20 L80,70 L110,20 L140,80" />
                    <line x1="20" y1="20" x2="140" y2="20" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" />
                </svg>
            )}

            {type === 'CHART_DOUBLE_BOTTOM' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-2 stroke-brand-success fill-none stroke-2">
                    <path d="M20,20 L50,80 L80,40 L110,80 L140,20" />
                    <line x1="20" y1="80" x2="140" y2="80" stroke="rgba(255,255,255,0.3)" strokeDasharray="4" />
                </svg>
            )}

            {type === 'CHART_BULL_FLAG' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-2 stroke-brand-success fill-none stroke-2">
                    <path d="M20,90 L20,30" strokeWidth="3" /> 
                    <path d="M20,30 L60,40 L60,60 L20,50" fill="rgba(34, 197, 94, 0.1)" /> 
                    <path d="M20,30 L60,40" />
                    <path d="M20,50 L60,60" />
                    <path d="M60,50 L90,20" strokeDasharray="4" stroke="white" />
                </svg>
            )}

            {type === 'CHART_CUP_HANDLE' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-2 stroke-brand-success fill-none stroke-2">
                    <path d="M20,20 C20,90 100,90 100,20" />
                    <path d="M100,20 L120,40 L130,30" />
                    <path d="M130,30 L150,10" strokeDasharray="4" stroke="white" />
                </svg>
            )}

            {type === 'CHART_ASC_TRIANGLE' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-2 stroke-brand-success fill-none stroke-2">
                    <line x1="40" y1="20" x2="140" y2="20" stroke="white" />
                    <line x1="40" y1="80" x2="140" y2="20" stroke="white" />
                    <path d="M40,80 L60,20 L80,55 L100,20 L120,35 L140,20 L160,5" />
                </svg>
            )}

            {type === 'CHART_DESC_TRIANGLE' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-2 stroke-brand-danger fill-none stroke-2">
                    <line x1="40" y1="80" x2="140" y2="80" stroke="white" />
                    <line x1="40" y1="20" x2="140" y2="80" stroke="white" />
                    <path d="M40,20 L60,80 L80,45 L100,80 L120,65 L140,80 L160,95" />
                </svg>
            )}

            {type === 'CHART_WEDGE_BULL' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-2 stroke-brand-success fill-none stroke-2">
                    <line x1="20" y1="20" x2="140" y2="60" stroke="white" strokeDasharray="2" />
                    <line x1="20" y1="50" x2="140" y2="80" stroke="white" strokeDasharray="2" />
                    <path d="M20,20 L40,50 L60,30 L80,60 L100,50 L120,70" />
                </svg>
            )}

            {type === 'CHART_WEDGE_BEAR' && (
                <svg viewBox="0 0 200 100" className="w-full h-full p-2 stroke-brand-danger fill-none stroke-2">
                    <line x1="20" y1="80" x2="140" y2="40" stroke="white" strokeDasharray="2" />
                    <line x1="20" y1="50" x2="140" y2="20" stroke="white" strokeDasharray="2" />
                    <path d="M20,80 L40,50 L60,70 L80,40 L100,60 L120,30" />
                </svg>
            )}

            {type === 'CANDLE_DOJI' && (
                <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                    <line x1="50" y1="10" x2="50" y2="90" stroke="white" strokeWidth="2" />
                    <rect x="45" y="48" width="10" height="4" fill="white" />
                    <text x="65" y="52" fill="#aaa" fontSize="10" stroke="none">OPEN ≈ CLOSE</text>
                </svg>
            )}
        </div>
    );
};

const AcademyModal: React.FC<AcademyModalProps> = ({ onClose }) => {
    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | AcademyTerm['category']>('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // Load terms based on selected language, fallback to EN if missing
    const currentTerms = ACADEMY_CONTENT[settings.language] || ACADEMY_CONTENT['en'];

    const filteredTerms = currentTerms.filter(item => {
        const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || 
                              item.definition.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'ALL' || item.category === filter;
        return matchesSearch && matchesFilter;
    });

    const categories: AcademyTerm['category'][] = ['TECHNICAL', 'PATTERNS', 'PSYCHOLOGY', 'SECURITY'];

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 overflow-hidden overscroll-none touch-none">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in touch-none" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-lg bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col max-h-[85dvh] animate-zoom-in">
                
                {/* Header */}
                <div className="p-5 border-b border-brand-border bg-brand-card z-10 shrink-0 touch-none">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center">
                                <BookIcon className="w-5 h-5 text-brand-purple" />
                            </div>
                            <div>
                                <h2 className="font-orbitron font-bold text-lg text-white">{t('academy.title')}</h2>
                                <p className="text-[10px] text-slate-400 font-space-mono">{t('academy.subtitle')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                    </div>

                    <div className="relative mb-3">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder={t('add.search')} 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-brand-purple outline-none"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button 
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-all ${filter === 'ALL' ? 'bg-brand-purple text-white border-brand-purple' : 'bg-black/30 border-white/10 text-slate-500'}`}
                        >
                            ALL
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-all ${filter === cat ? 'bg-brand-purple text-white border-brand-purple' : 'bg-black/30 border-white/10 text-slate-500'}`}
                            >
                                {t(`academy.${cat.toLowerCase()}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-cyber-grid bg-[length:40px_40px] overscroll-contain">
                    <div className="grid gap-3">
                        {filteredTerms.length > 0 ? filteredTerms.map((item, idx) => (
                            <div 
                                key={item.id}
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                className={`bg-brand-card/80 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-inner ${
                                    expandedId === item.id 
                                    ? 'border-brand-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                                    : 'border-white/5 hover:border-brand-cyan/30'
                                }`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            item.category === 'TECHNICAL' ? 'bg-brand-cyan' : 
                                            item.category === 'PATTERNS' ? 'bg-brand-danger' : 
                                            'bg-brand-success'
                                        }`}></div>
                                        <div>
                                            <span className="font-bold text-white text-sm block">{item.term}</span>
                                            <span className="text-[9px] text-slate-500 font-mono uppercase">{t(`academy.${item.category.toLowerCase()}`)}</span>
                                        </div>
                                    </div>
                                    <ChevronRightIcon className={`w-4 h-4 text-slate-500 transition-transform ${expandedId === item.id ? 'rotate-90 text-brand-cyan' : ''}`} />
                                </div>
                                
                                {expandedId === item.id && (
                                    <div className="px-4 pb-4 animate-fade-in bg-black/20">
                                        <div className="h-[1px] w-full bg-white/5 mb-3"></div>
                                        
                                        <ChartPattern type={item.visualType} />

                                        <p className="text-sm text-slate-300 leading-relaxed font-space-mono mb-3">
                                            {item.definition}
                                        </p>
                                        <div className="bg-brand-cyan/5 rounded-lg p-3 border-l-2 border-brand-cyan">
                                            <p className="text-[10px] text-brand-cyan uppercase font-bold mb-1">Ex:</p>
                                            <p className="text-xs text-slate-300 italic">"{item.example}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500 text-xs">
                                No terms found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademyModal;
