
import React, { useState, useMemo, useEffect } from 'react';
import { BookIcon, ChevronRightIcon, SearchIcon, FilterIcon } from './icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { AcademyTerm, Language } from '../types';
import { LineChart, Line, ResponsiveContainer, YAxis, Area, AreaChart } from 'recharts';

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
        { id: 'phishing', term: 'Phishing', category: 'SECURITY', definition: 'Fake sites stealing credentials.', example: 'Don\'t click suspicious links.' },
        { id: 'defi', term: 'DeFi (Decentralized Finance)', category: 'TECHNICAL', definition: 'Financial services on blockchain without intermediaries.', example: 'Uniswap, Aave.' },
        { id: 'nft', term: 'NFT (Non-Fungible Token)', category: 'TECHNICAL', definition: 'Unique digital asset verified on blockchain.', example: 'Bored Ape Yacht Club.' },
        { id: 'staking', term: 'Staking', category: 'TECHNICAL', definition: 'Locking up coins to support network and earn rewards.', example: 'Staking ETH for 5% APY.' },
        { id: 'coldwallet', term: 'Cold Wallet', category: 'SECURITY', definition: 'Offline hardware wallet for maximum security.', example: 'Ledger, Trezor.' },
        { id: 'gas', term: 'Gas Fees', category: 'TECHNICAL', definition: 'Fee paid to miners/validators to process transactions.', example: 'High gas on Ethereum.' },
        { id: 'marketcap', term: 'Market Cap', category: 'TECHNICAL', definition: 'Total value of all coins in circulation (Price x Supply).', example: 'Bitcoin market cap > $1 Trillion.' }
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
        { id: 'phishing', term: 'Фішинг', category: 'SECURITY', definition: 'Підроблені сайти для крадіжки паролів.', example: 'Не переходь за підозрілими посиланнями.' },
        { id: 'defi', term: 'DeFi (Децентралізовані Фінанси)', category: 'TECHNICAL', definition: 'Фінансові послуги на блокчейні без посередників.', example: 'Uniswap, Aave.' },
        { id: 'nft', term: 'NFT (Невзаємозамінний Токен)', category: 'TECHNICAL', definition: 'Унікальний цифровий актив на блокчейні.', example: 'Bored Ape Yacht Club.' },
        { id: 'staking', term: 'Стейкінг', category: 'TECHNICAL', definition: 'Блокування монет для підтримки мережі та отримання винагороди.', example: 'Стейкінг ETH під 5% річних.' },
        { id: 'coldwallet', term: 'Холодний Гаманець', category: 'SECURITY', definition: 'Офлайн апаратний гаманець для максимальної безпеки.', example: 'Ledger, Trezor.' },
        { id: 'gas', term: 'Газ (Комісія)', category: 'TECHNICAL', definition: 'Плата майнерам/валідаторам за обробку транзакцій.', example: 'Високий газ в мережі Ethereum.' },
        { id: 'marketcap', term: 'Ринкова Капіталізація', category: 'TECHNICAL', definition: 'Загальна вартість усіх монет в обігу (Ціна x Пропозиція).', example: 'Капіталізація Bitcoin > $1 Трлн.' }
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
        { id: 'phishing', term: 'Phishing', category: 'SECURITY', definition: 'Fałszywe strony kradnące dane.', example: 'Nie klikaj w podejrzane linki.' },
        { id: 'defi', term: 'DeFi', category: 'TECHNICAL', definition: 'Finanse zdecentralizowane na blockchainie.', example: 'Uniswap, Aave.' },
        { id: 'nft', term: 'NFT', category: 'TECHNICAL', definition: 'Unikalny token cyfrowy.', example: 'Bored Ape Yacht Club.' },
        { id: 'staking', term: 'Staking', category: 'TECHNICAL', definition: 'Blokowanie monet dla nagród.', example: 'Staking ETH na 5%.' },
        { id: 'coldwallet', term: 'Zimny Portfel', category: 'SECURITY', definition: 'Portfel offline dla bezpieczeństwa.', example: 'Ledger, Trezor.' },
        { id: 'gas', term: 'Opłaty Gas', category: 'TECHNICAL', definition: 'Opłata za transakcje w sieci.', example: 'Wysoki gas na Ethereum.' },
        { id: 'marketcap', term: 'Kapitalizacja Rynkowa', category: 'TECHNICAL', definition: 'Całkowita wartość monet w obiegu.', example: 'Bitcoin > $1 Bln.' }
    ]
};

// Visual Components for Patterns using Custom SVG Candlesticks
const ChartPattern: React.FC<{ type: AcademyTerm['visualType'] }> = ({ type }) => {
    if (!type || type === 'NONE') return null;

    const getData = (type: string) => {
        // Data format: {o: open, h: high, l: low, c: close}
        switch(type) {
            case 'CHART_HEAD_SHOULDERS': return [
                {o: 20, c: 40, h: 45, l: 15}, {o: 40, c: 30, h: 42, l: 25}, // Left shoulder
                {o: 30, c: 60, h: 65, l: 28}, {o: 60, c: 30, h: 62, l: 25}, // Head
                {o: 30, c: 45, h: 48, l: 28}, {o: 45, c: 20, h: 47, l: 15}, // Right shoulder
            ];
            case 'CHART_DOUBLE_TOP': return [
                {o: 20, c: 80, h: 85, l: 15}, {o: 80, c: 40, h: 82, l: 35}, // First top
                {o: 40, c: 80, h: 85, l: 35}, {o: 80, c: 20, h: 82, l: 15}, // Second top
            ];
            case 'CHART_DOUBLE_BOTTOM': return [
                {o: 80, c: 20, h: 85, l: 15}, {o: 20, c: 60, h: 65, l: 15}, // First bottom
                {o: 60, c: 20, h: 65, l: 15}, {o: 20, c: 80, h: 85, l: 15}, // Second bottom
            ];
            case 'CHART_BULL_FLAG': return [
                {o: 20, c: 80, h: 85, l: 15}, // Pole
                {o: 80, c: 70, h: 82, l: 65}, {o: 70, c: 75, h: 78, l: 68}, {o: 75, c: 65, h: 78, l: 60}, {o: 65, c: 70, h: 72, l: 62}, // Flag
                {o: 70, c: 95, h: 100, l: 65} // Breakout
            ];
            case 'CHART_CUP_HANDLE': return [
                {o: 80, c: 40, h: 85, l: 35}, {o: 40, c: 20, h: 45, l: 15}, {o: 20, c: 20, h: 25, l: 15}, {o: 20, c: 40, h: 45, l: 15}, {o: 40, c: 80, h: 85, l: 35}, // Cup
                {o: 80, c: 70, h: 82, l: 65}, {o: 70, c: 75, h: 78, l: 68}, // Handle
                {o: 75, c: 95, h: 100, l: 70} // Breakout
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
            default: return [];
        }
    };

    const data = getData(type);
    const isBullish = ['CHART_DOUBLE_BOTTOM', 'CHART_BULL_FLAG', 'CHART_CUP_HANDLE', 'CHART_ASC_TRIANGLE', 'CHART_WEDGE_BULL'].includes(type);

    if (type === 'CANDLE_DOJI') {
        return (
            <div className="h-32 w-full bg-black/40 rounded-lg border border-white/5 mb-3 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                    <line x1="50" y1="10" x2="50" y2="90" stroke="white" strokeWidth="2" />
                    <rect x="45" y="48" width="10" height="4" fill="white" />
                    <text x="65" y="52" fill="#aaa" fontSize="10" stroke="none">OPEN ≈ CLOSE</text>
                </svg>
            </div>
        );
    }

    return (
        <div className="h-40 w-full bg-black/40 rounded-lg border border-white/5 mb-3 relative overflow-hidden">
             {/* Grid Background */}
             <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
             
             <div className="absolute inset-0 p-4 flex items-end justify-between">
                 <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                     {data.map((d, i) => {
                         const isUp = d.c >= d.o;
                         const color = isUp ? '#22c55e' : '#ef4444';
                         const x = (i / (data.length - 1)) * 90 + 5; // Spread evenly
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
                                 <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1" />
                                 {/* Body */}
                                 <rect x={x - 2} y={bodyTop} width="4" height={bodyHeight} fill={color} />
                             </g>
                         );
                     })}
                 </svg>
             </div>

            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 border border-white/10 text-[8px] font-mono text-white">
                {isBullish ? 'BULLISH' : 'BEARISH'}
            </div>
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
                                <h2 className="font-orbitron font-bold text-base sm:text-lg text-white">{t('academy.title')}</h2>
                                <p className="text-[10px] text-slate-400 font-space-mono">{t('academy.subtitle')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
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
                                        
                                        <p className="text-sm text-slate-300 leading-relaxed font-space-mono mb-4">
                                            {item.definition}
                                        </p>

                                        {item.visualType && <ChartPattern type={item.visualType} />}

                                        <div className="bg-brand-cyan/5 rounded-lg p-3 border-l-2 border-brand-cyan mb-3">
                                            <p className="text-[10px] text-brand-cyan uppercase font-bold mb-1">Ex:</p>
                                            <p className="text-xs text-slate-300 italic">"{item.example}"</p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const answer = window.prompt(`Quiz for ${item.term}:\nWhat is the main takeaway? (Type anything to pass for now)`);
                                                if (answer) {
                                                    useStore.getState().addXp(50);
                                                    alert('Correct! You earned 50 XP.');
                                                }
                                            }}
                                            className="w-full py-2 bg-brand-purple/20 hover:bg-brand-purple/40 border border-brand-purple/50 rounded-lg text-xs font-bold text-brand-purple transition-colors"
                                        >
                                            TAKE QUIZ (+50 XP)
                                        </button>
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
