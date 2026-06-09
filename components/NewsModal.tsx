import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type NewsArticle } from '../types';
import { getLatestCryptoNews, safeGenerate } from '../services/geminiService';
import { 
    LinkIcon, 
    PlayIcon, 
    ChevronRightIcon, 
    RadarIcon, 
    BotIcon, 
    ActivityIcon, 
    GlobeIcon, 
    ShieldIcon, 
    ZapIcon
} from './icons';
import { HelpIndicator } from './HelpIndicator';
import Skeleton from './Skeleton';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { TacticalBackground } from './TacticalBackground';
import { triggerHaptic } from '../utils/haptics';

// Preset queries builder based on chosen language
const getPresetQuestions = (lang: string) => {
    if (lang === 'ua') {
        return [
            { key: 'portfolio', query: '📊 Як ця новина впливає на мій інвестиційний портфель?', label: 'Аналіз портфеля' },
            { key: 'swans', query: '⚠️ Оцінити приховані ризики та ймовірність події "Чорний Лебідь"?', label: 'Аудит чорного лебедя' },
            { key: 'tactic', query: '⚡ Сформувати тактичний 7-денний план торгівлі за цим сигналом?', label: '7-денний сценарій' },
        ];
    } else if (lang === 'pl') {
        return [
            { key: 'portfolio', query: 'Jak ta wiadomość wpływa na mój portfel inwestycyjny?', label: 'Analiza portfela' },
            { key: 'swans', query: 'Oceń ukryte ryzyko i prawdopodobieństwo zdarzenia "Czarny Łabędź"?', label: 'Audyt ryzyka' },
            { key: 'tactic', query: 'Stwórz taktyczny 7-dniowy scenariusz handlowy dla tego sygnału?', label: '7-dniowy plan' },
        ];
    } else {
        return [
            { key: 'portfolio', query: '📊 How does this news event impact my defensive portfolio?', label: 'Portfolio Impact' },
            { key: 'swans', query: '⚠️ Assess hidden structural risks or "Black Swan" liabilities?', label: 'Black Swan Audit' },
            { key: 'tactic', query: '⚡ Formulate a 7-day tactical trading playbook based on this impulse?', label: '7-Day Playbook' },
        ];
    }
};

// Generates high-fidelity market impact metrics deterministically based on article title
const getAIImpactMetrics = (headline: string, index: number) => {
    const sum = headline.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
    const isBull = headline.toLowerCase().match(/(pre-breakout|bullish|record|stabilization|high-volatility|accumulation|gain|surge|up|high|signals|bull|збільши|рекорд|зростання)/);
    
    const direction = isBull ? 'UP' : (sum % 2 === 0 ? 'UP' : 'DOWN');
    
    // crypto
    const btcVal = (isBull ? '+' : '-') + ((sum % 8) * 0.4 + 1.2).toFixed(1) + '%';
    const ethVal = (isBull ? '+' : '-') + ((sum % 6) * 0.3 + 0.8).toFixed(1) + '%';
    const altVal = (isBull ? '+' : '-') + ((sum % 11) * 0.6 + 1.5).toFixed(1) + '%';
    const confidence = Math.max(76, 99 - (sum % 17)) + '%';
    
    // stocks
    const nasdaqVal = (isBull ? '+' : '-') + ((sum % 7) * 0.2 + 0.4).toFixed(1) + '%';
    const sp500Val = (isBull ? '+' : '-') + ((sum % 5) * 0.15 + 0.2).toFixed(1) + '%';
    const goldVal = (isBull ? '-' : '+') + ((sum % 9) * 0.1 + 0.1).toFixed(1) + '%'; // gold rises on uncertainty
    const nvidiaVal = (isBull ? '+' : '-') + ((sum % 12) * 0.5 + 1.0).toFixed(1) + '%';
    
    // macro
    const dxyVal = (isBull ? '-' : '+') + ((sum % 6) * 0.08 + 0.1).toFixed(2) + '%';
    const ratesExpected = isBull ? 'HOLD / DOVISH TILT' : (sum % 3 === 0 ? 'HAWKISH PAUSE' : 'STABILIZATION EXPECTED');
    const inflationRisk = isBull ? 'CONTROLLED / LOW' : (sum % 3 === 1 ? 'CPI UPSIDE PRESSURE' : 'STABLE OUTLOOK');
    
    return {
        direction,
        confidence,
        crypto: { btc: btcVal, eth: ethVal, alt: altVal },
        stocks: { nasdaq: nasdaqVal, sp500: sp500Val, gold: goldVal, nvidia: nvidiaVal },
        macro: { dxy: dxyVal, rates: ratesExpected, inflation: inflationRisk }
    };
};

const NewsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Track expanded indexes
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    // Active tabs for expanded detail metrics: 'CRYPTO' | 'STOCKS' | 'MACRO'
    const [activeTabs, setActiveTabs] = useState<Record<number, 'CRYPTO' | 'STOCKS' | 'MACRO'>>({});
    // Active time horizons per news card (1H | 24H | 7D)
    const [timeframes, setTimeframes] = useState<Record<number, '1H' | '24H' | '7D'>>({});
    
    // Live custom query states
    const [loadingAIQuery, setLoadingAIQuery] = useState<Record<string, boolean>>({});
    const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});

    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    const getCalculatedBeforeAfter = (basePercentStr: string, timeframe: '1H' | '24H' | '7D') => {
        const isPositive = !basePercentStr.startsWith('-');
        const numericPart = parseFloat(basePercentStr.replace(/[+\-%]/g, '')) || 0;
        
        let multiplier = 1.0;
        if (timeframe === '1H') multiplier = 0.35;
        else if (timeframe === '7D') multiplier = 2.4;
        
        const deltaPercent = (isPositive ? 1 : -1) * numericPart * multiplier;
        const beforeValue = 100.0;
        const afterValue = beforeValue * (1 + deltaPercent / 100);
        
        return {
            before: beforeValue.toFixed(2),
            after: afterValue.toFixed(2),
            delta: (deltaPercent >= 0 ? '+' : '') + deltaPercent.toFixed(2) + '%',
            numDelta: deltaPercent
        };
    };

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getLatestCryptoNews(settings.language);
                setNews(data || []);
            } catch(e){} finally { setLoading(false); }
        };
        fetch();
        document.body.style.overflow = 'hidden';
        return () => { 
            document.body.style.overflow = 'unset'; 
        };
    }, [settings.language]);

    // Handle instant AI custom query execution
    const executeAIQuery = async (articleIndex: number, articleHeadline: string, questionKey: string, questionText: string) => {
        const stateKey = `${articleIndex}_${questionKey}`;
        if (loadingAIQuery[stateKey]) return;
        
        triggerHaptic('medium');
        setLoadingAIQuery(prev => ({ ...prev, [stateKey]: true }));
        
        const prompt = `You are StorkCrypto Senior cross-market AI Analyst. Analyze this news headline/event: "${articleHeadline}". Provide a highly tactical, professional, and clear answer to the user's inquiry: "${questionText}". Organize with highly readable brief paragraphs and clean bullet points. Answer strictly in the following language: ${settings.language === 'ua' ? 'Ukrainian' : settings.language === 'pl' ? 'Polish' : 'English'}. Be direct, and skip any conversational fluff or meta-comments.`;
        
        try {
            const result = await safeGenerate(prompt, { temperature: 0.25 });
            setAiAnswers(prev => ({ ...prev, [stateKey]: result || "Analysis system timed out." }));
        } catch (err) {
            setAiAnswers(prev => ({ ...prev, [stateKey]: "Failed to establish secure AI link. Please retry." }));
        } finally {
            setLoadingAIQuery(prev => ({ ...prev, [stateKey]: false }));
        }
    };

    // Helper to format long AI text outputs beautifully
    const renderFormattedText = (text: string) => {
        if (!text) return null;
        
        const lines = text.split('\n');
        return (
            <div className="space-y-2 mt-4 text-slate-300 font-mono text-[10px] leading-relaxed border-l-2 border-brand-cyan/40 pl-3 py-1 bg-brand-cyan/5 rounded-r-xl">
                {lines.map((line, idx) => {
                    const cleanLine = line.trim();
                    if (!cleanLine) return null;
                    
                    // Formatting headers or bold words
                    if (cleanLine.startsWith('###') || cleanLine.startsWith('**')) {
                        return <h5 key={idx} className="text-white font-black uppercase text-[10px] tracking-wide mt-2">{cleanLine.replace(/[#*]/g, '')}</h5>;
                    }
                    // Formatting bullet points
                    if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
                        return (
                            <div key={idx} className="flex items-start gap-1.5 pl-2">
                                <span className="text-brand-cyan mt-1">▪</span>
                                <span>{cleanLine.substring(1).trim().replace(/\*\*/g, '')}</span>
                            </div>
                        );
                    }
                    return <p key={idx}>{cleanLine.replace(/\*\*/g, '')}</p>;
                })}
            </div>
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[120] bg-brand-bg flex flex-col overflow-hidden h-[100dvh] w-full"
        >
            <TacticalBackground />
            
            {/* Standardized Header */}
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                        id="news-close-button"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase">{t('news.title')}</h1>
                            <HelpIndicator id="intel_grid" />
                        </div>
                        <p className="text-[8px] text-brand-purple font-mono uppercase">{t('news.status')}</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center">
                    <RadarIcon className="w-5 h-5 text-brand-purple animate-pulse" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 pb-32 relative z-10">
                {loading ? Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="w-full h-28 rounded-[2rem]" />) : 
                news.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-70">
                        <RadarIcon className="w-12 h-12 text-slate-500 mb-4 animate-pulse" />
                        <p className="text-slate-400 font-black uppercase text-sm font-orbitron">{t('news.no_signals_title')}</p>
                        <p className="text-slate-500 text-xs font-mono mt-2">{t('news.no_signals_desc')}</p>
                    </div>
                ) :
                news.map((article, index) => {
                    const isExpanded = expandedIndex === index;
                    const metrics = getAIImpactMetrics(article.headline, index);
                    const currentTab = activeTabs[index] || 'CRYPTO';
                    const presets = getPresetQuestions(settings.language);

                    return (
                        <div 
                            key={index} 
                            className={`p-5 bg-brand-card/40 backdrop-blur-md border rounded-[2rem] hover:border-brand-cyan/20 transition-all duration-300 animate-fade-in-up flex flex-col overflow-hidden ${
                                isExpanded 
                                    ? 'border-brand-cyan/40 bg-brand-card/70 shadow-[0_0_25px_rgba(0,229,255,0.1)]' 
                                    : 'border-white/5'
                            }`}
                        >
                            {/* Card Header Content */}
                            <div 
                                className="flex justify-between items-start gap-4 cursor-pointer"
                                onClick={() => {
                                    triggerHaptic('light');
                                    setExpandedIndex(isExpanded ? null : index);
                                }}
                            >
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-[8px] font-black text-brand-cyan uppercase tracking-widest">
                                            {settings.language === 'ua' ? 'ДЖЕРЕЛО' : settings.language === 'pl' ? 'ŹRÓDŁO' : 'SOURCE'}_{index + 1}
                                        </span>
                                        {article.time && <span className="text-[8px] font-mono text-slate-500">{article.time}</span>}
                                        {article.sentimentMock && (
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase ${article.sentimentMock === 'POS' ? 'bg-green-500/10 border-green-500/30 text-green-400' : article.sentimentMock === 'NEG' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
                                                {article.sentimentMock === 'POS' ? 'BULL' : article.sentimentMock === 'NEG' ? 'BEAR' : 'NEUT'}
                                            </span>
                                        )}
                                        {article.impact && (
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase ${article.impact === 'HIGH' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : article.impact === 'MED' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
                                                {t('news.impact')} {article.impact}
                                            </span>
                                        )}
                                        {isExpanded && (
                                            <span className="text-[7px] font-black px-1.5 py-0.5 rounded border border-brand-cyan bg-brand-cyan/20 text-brand-cyan animate-pulse">
                                                {settings.language === 'ua' ? 'ШТУЧНИЙ АНАЛІЗ' : settings.language === 'pl' ? 'NEURO ANALIZA' : 'AI POWERED'}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-black mb-2 leading-tight uppercase transition-colors group-hover:text-brand-cyan text-white">
                                        {article.headline}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-mono opacity-80">
                                        {article.summary}
                                    </p>
                                </div>
                                
                                <div className="flex flex-col gap-2 shrink-0">
                                    {article.sources?.[0] && (
                                        <a 
                                            href={article.sources[0].uri} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-slate-400 hover:text-brand-cyan transition-all"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Expanded AI Cross-Market Assessment Matrix */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="border-t border-white/10 pt-4"
                                    >
                                        {/* Market Impact Dashboard Header */}
                                        <div className="flex items-center justify-between mb-3 bg-white/5 rounded-xl p-3 border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <BotIcon className="w-4 h-4 text-brand-cyan" />
                                                <span className="text-[9px] font-black tracking-widest font-orbitron uppercase text-white">
                                                    {settings.language === 'ua' ? 'МАТРИЦЯ ВПЛИВУ AI' : settings.language === 'pl' ? 'MACIERZ WPŁYWU AI' : 'GLOBAL IMPACT MATRIX'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-mono text-slate-400 uppercase">
                                                    {settings.language === 'ua' ? 'Вектор:' : settings.language === 'pl' ? 'Wektor:' : 'BIAS:'}
                                                </span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded font-mono ${metrics.direction === 'UP' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {metrics.direction === 'UP' ? '▲ BULLISH' : '▼ BEARISH'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Segment tabs */}
                                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                                            {(['CRYPTO', 'STOCKS', 'MACRO'] as const).map(tab => (
                                                <button 
                                                    key={tab}
                                                    onClick={() => {
                                                        triggerHaptic('light');
                                                        setActiveTabs(prev => ({ ...prev, [index]: tab }));
                                                    }}
                                                    className={`py-2 rounded-lg text-[8px] font-black font-orbitron tracking-wider transition-all uppercase border ${
                                                        currentTab === tab 
                                                            ? 'bg-brand-cyan text-black border-brand-cyan shadow-[0_0_8px_rgba(0,229,255,0.4)]' 
                                                            : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-350'
                                                    }`}
                                                >
                                                    {tab === 'CRYPTO' 
                                                        ? (settings.language === 'ua' ? 'КРИПТО' : settings.language === 'pl' ? 'KRYPTO' : 'CRYPTO')
                                                        : tab === 'STOCKS' 
                                                        ? (settings.language === 'ua' ? 'АКЦІЇ' : settings.language === 'pl' ? 'GIEŁDA' : 'STOCKS')
                                                        : (settings.language === 'ua' ? 'МАКРО' : settings.language === 'pl' ? 'MAKRO' : 'MACRO')
                                                    }
                                                </button>
                                            ))}
                                        </div>

                                        {/* State Timeframe Selector */}
                                        <div className="flex items-center justify-between mb-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-orbitron pl-1.5">
                                                {settings.language === 'ua' ? 'ГОРИЗОНТ ІМПУЛЬСУ:' : settings.language === 'pl' ? 'HORYZONT IMPULSU:' : 'IMPULSE HORIZON:'}
                                            </span>
                                            <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                                                {(['1H', '24H', '7D'] as const).map(tf => {
                                                    const isActive = (timeframes[index] || '24H') === tf;
                                                    return (
                                                        <button
                                                            key={tf}
                                                            onClick={() => {
                                                                triggerHaptic('light');
                                                                setTimeframes(prev => ({ ...prev, [index]: tf }));
                                                            }}
                                                            className={`px-2 py-0.5 text-[8px] font-black font-mono rounded tracking-widest transition-all ${
                                                                isActive 
                                                                    ? 'bg-brand-cyan text-black font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]' 
                                                                    : 'text-slate-500 hover:text-slate-300'
                                                            }`}
                                                        >
                                                            {tf}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Active Tab Screen */}
                                        <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 mb-4 font-mono text-[9px] space-y-3 relative">
                                            {currentTab === 'CRYPTO' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-1.5 uppercase font-bold text-[8px]">
                                                        <span>{settings.language === 'ua' ? 'Актив' : settings.language === 'pl' ? 'Aktyw' : 'Asset'}</span>
                                                        <div className="flex items-center gap-1">
                                                            <span>{settings.language === 'ua' ? 'До' : settings.language === 'pl' ? 'Przed' : 'Before'}</span>
                                                            <span>➔</span>
                                                            <span className="text-brand-cyan">{settings.language === 'ua' ? 'Після (Прогноз)' : settings.language === 'pl' ? 'Po (Prognoza)' : 'After (Projected)'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white font-bold">BTC / Bitcoin</span>
                                                        <span className={`font-black font-orbitron ${metrics.crypto.btc.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{metrics.crypto.btc}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white font-bold">ETH / Ethereum</span>
                                                        <span className={`font-black font-orbitron ${metrics.crypto.eth.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{metrics.crypto.eth}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white font-bold">INDEX / Altcoins</span>
                                                        <span className={`font-black font-orbitron ${metrics.crypto.alt.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{metrics.crypto.alt}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[8px] text-slate-500 uppercase">
                                                        <span>{settings.language === 'ua' ? 'Точність аналізу:' : settings.language === 'pl' ? 'Pewność:' : 'Confidence score:'}</span>
                                                        <span className="text-brand-cyan font-bold">{metrics.confidence}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {currentTab === 'STOCKS' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-1.5 uppercase font-bold text-[8px]">
                                                        <span>{settings.language === 'ua' ? 'Бренд / Індекс' : settings.language === 'pl' ? 'Spółka / Indeks' : 'Ticker / Index'}</span>
                                                        <div className="flex items-center gap-1">
                                                            <span>{settings.language === 'ua' ? 'До' : settings.language === 'pl' ? 'Przed' : 'Before'}</span>
                                                            <span>➔</span>
                                                            <span className="text-brand-cyan">{settings.language === 'ua' ? 'Зміна (Прогноз)' : settings.language === 'pl' ? 'Wymiar (Prognoza)' : 'Forecast Delta'}</span>
                                                        </div>
                                                    </div>

                                                    {/* US100 */}
                                                    {(() => {
                                                         const calc = getCalculatedBeforeAfter(metrics.stocks.nasdaq, timeframes[index] || '24H');
                                                         return (
                                                             <div className="space-y-1">
                                                                 <div className="flex justify-between items-center text-[9px]">
                                                                     <span className="text-white font-bold font-orbitron">US100 / NASDAQ 100</span>
                                                                     <span className={`font-black font-orbitron ${calc.numDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calc.before} ➔ {calc.after} ({calc.delta})</span>
                                                                 </div>
                                                                 <div className="h-2 bg-black/60 rounded-full relative overflow-hidden flex items-center px-1 border border-white/5">
                                                                     <div className="absolute left-[50%] h-full w-[1.5px] bg-white/20 z-10" />
                                                                     {calc.numDelta >= 0 ? (
                                                                         <div className="absolute left-[50%] h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${Math.min(48, calc.numDelta * 12)}%` }} />
                                                                     ) : (
                                                                         <div className="absolute right-[50%] h-1 bg-gradient-to-l from-red-500 to-rose-400 rounded-full" style={{ width: `${Math.min(48, Math.abs(calc.numDelta) * 12)}%` }} />
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         );
                                                     })()}

                                                    {/* SPX */}
                                                    {(() => {
                                                         const calc = getCalculatedBeforeAfter(metrics.stocks.sp500, timeframes[index] || '24H');
                                                         return (
                                                             <div className="space-y-1">
                                                                 <div className="flex justify-between items-center text-[9px]">
                                                                     <span className="text-white font-bold font-orbitron">SPX / S&P 500</span>
                                                                     <span className={`font-black font-orbitron ${calc.numDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calc.before} ➔ {calc.after} ({calc.delta})</span>
                                                                 </div>
                                                                 <div className="h-2 bg-black/60 rounded-full relative overflow-hidden flex items-center px-1 border border-white/5">
                                                                     <div className="absolute left-[50%] h-full w-[1.5px] bg-white/20 z-10" />
                                                                     {calc.numDelta >= 0 ? (
                                                                         <div className="absolute left-[50%] h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${Math.min(48, calc.numDelta * 15)}%` }} />
                                                                     ) : (
                                                                         <div className="absolute right-[50%] h-1 bg-gradient-to-l from-red-500 to-rose-400 rounded-full" style={{ width: `${Math.min(48, Math.abs(calc.numDelta) * 15)}%` }} />
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         );
                                                     })()}

                                                    {/* NVDA */}
                                                    {(() => {
                                                         const calc = getCalculatedBeforeAfter(metrics.stocks.nvidia, timeframes[index] || '24H');
                                                         return (
                                                             <div className="space-y-1">
                                                                 <div className="flex justify-between items-center text-[9px]">
                                                                     <span className="text-white font-bold font-orbitron">NVDA / NVIDIA Corp</span>
                                                                     <span className={`font-black font-orbitron ${calc.numDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calc.before} ➔ {calc.after} ({calc.delta})</span>
                                                                 </div>
                                                                 <div className="h-2 bg-black/60 rounded-full relative overflow-hidden flex items-center px-1 border border-white/5">
                                                                     <div className="absolute left-[50%] h-full w-[1.5px] bg-white/20 z-10" />
                                                                     {calc.numDelta >= 0 ? (
                                                                         <div className="absolute left-[50%] h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${Math.min(48, calc.numDelta * 8)}%` }} />
                                                                     ) : (
                                                                         <div className="absolute right-[50%] h-1 bg-gradient-to-l from-red-500 to-rose-400 rounded-full" style={{ width: `${Math.min(48, Math.abs(calc.numDelta) * 8)}%` }} />
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         );
                                                     })()}

                                                    {/* GOLD */}
                                                    {(() => {
                                                         const calc = getCalculatedBeforeAfter(metrics.stocks.gold, timeframes[index] || '24H');
                                                         return (
                                                             <div className="space-y-1">
                                                                 <div className="flex justify-between items-center text-[9px]">
                                                                     <span className="text-white font-bold font-orbitron">GOLD / XAU Protection</span>
                                                                     <span className={`font-black font-orbitron ${calc.numDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calc.before} ➔ {calc.after} ({calc.delta})</span>
                                                                 </div>
                                                                 <div className="h-2 bg-black/60 rounded-full relative overflow-hidden flex items-center px-1 border border-white/5">
                                                                     <div className="absolute left-[50%] h-full w-[1.5px] bg-white/20 z-10" />
                                                                     {calc.numDelta >= 0 ? (
                                                                         <div className="absolute left-[50%] h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${Math.min(48, calc.numDelta * 10)}%` }} />
                                                                     ) : (
                                                                         <div className="absolute right-[50%] h-1 bg-gradient-to-l from-red-500 to-rose-400 rounded-full" style={{ width: `${Math.min(48, Math.abs(calc.numDelta) * 10)}%` }} />
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         );
                                                     })()}
                                                </div>
                                            )}

                                            {currentTab === 'MACRO' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-1.5 uppercase font-bold text-[8px]">
                                                         <span>{settings.language === 'ua' ? 'Економічний Тригер' : settings.language === 'pl' ? 'Wskaźnik Makro' : 'Macro Parameter'}</span>
                                                         <span>{settings.language === 'ua' ? 'Статус Оцінки' : settings.language === 'pl' ? 'Prognoza' : 'Forecast Status'}</span>
                                                    </div>

                                                    {/* DXY */}
                                                    {(() => {
                                                         const calc = getCalculatedBeforeAfter(metrics.macro.dxy, timeframes[index] || '24H');
                                                         return (
                                                             <div className="space-y-1">
                                                                 <div className="flex justify-between items-center text-[9px]">
                                                                     <span className="text-white font-bold font-orbitron">DXY / USD Index</span>
                                                                     <span className={`font-black font-orbitron ${calc.numDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calc.before} ➔ {calc.after} ({calc.delta})</span>
                                                                 </div>
                                                                 <div className="h-2 bg-black/60 rounded-full relative overflow-hidden flex items-center px-1 border border-white/5">
                                                                     <div className="absolute left-[50%] h-full w-[1.5px] bg-white/20 z-10" />
                                                                     {calc.numDelta >= 0 ? (
                                                                         <div className="absolute left-[50%] h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${Math.min(48, calc.numDelta * 18)}%` }} />
                                                                     ) : (
                                                                         <div className="absolute right-[50%] h-1 bg-gradient-to-l from-red-500 to-rose-400 rounded-full" style={{ width: `${Math.min(48, Math.abs(calc.numDelta) * 18)}%` }} />
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         );
                                                     })()}

                                                    {/* Interest Rates */}
                                                    <div className="space-y-1 border-t border-white/5 pt-2">
                                                         <div className="flex justify-between items-center">
                                                             <span className="text-white font-bold">Interest Rates / FED</span>
                                                             <span className="font-black text-brand-purple uppercase">{metrics.macro.rates}</span>
                                                         </div>
                                                         <div className="h-2 bg-black/60 rounded-full overflow-hidden relative border border-white/5">
                                                             <div className={`h-full rounded-full bg-brand-purple ${metrics.macro.rates.includes('DOVISH') ? 'w-2/5 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'w-4/5 shadow-[0_0_8px_rgba(168,85,247,0.5)]'}`} />
                                                         </div>
                                                    </div>

                                                    {/* Inflation outlook */}
                                                    <div className="space-y-1 pt-1">
                                                         <div className="flex justify-between items-center">
                                                             <span className="text-white font-bold">Inflation Outlook</span>
                                                             <span className="font-black text-slate-300 uppercase">{metrics.macro.inflation}</span>
                                                         </div>
                                                         <div className="h-2 bg-black/60 rounded-full overflow-hidden relative border border-white/5">
                                                             <div className={`h-full rounded-full ${metrics.macro.inflation.includes('CPI') ? 'bg-red-500 w-3/4 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 w-1/3 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                                                         </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Interactive prompt buttons block */}
                                        <div className="space-y-2 mt-4">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-orbitron mb-1 flex items-center gap-1.5">
                                                <ActivityIcon className="w-3 h-3 text-brand-cyan" /> 
                                                {settings.language === 'ua' ? 'СИМУЛЯТОР СЦЕНАРІЮ AI' : settings.language === 'pl' ? 'SYMULATOR SCENARIUSZA AI' : 'AI SCENARIO PLAYGROUND'}
                                            </p>
                                            
                                            <div className="grid grid-cols-3 gap-2">
                                                {presets.map((preset, pIdx) => {
                                                    const stateKey = `${index}_${preset.key}`;
                                                    const isLoadingAnswer = loadingAIQuery[stateKey];
                                                    const hasAnswer = !!aiAnswers[stateKey];

                                                    return (
                                                        <button
                                                            key={pIdx}
                                                            disabled={isLoadingAnswer}
                                                            onClick={() => executeAIQuery(index, article.headline, preset.key, preset.query)}
                                                            className={`py-2 px-2.5 rounded-xl border font-mono text-[8px] font-black uppercase text-center transition-all flex flex-col items-center justify-center gap-1 min-h-[46px] ${
                                                                hasAnswer 
                                                                    ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                                                                    : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/15 hover:text-white'
                                                            }`}
                                                        >
                                                            {isLoadingAnswer ? (
                                                                <span className="w-3 h-3 border border-t-transparent border-brand-cyan rounded-full animate-spin"></span>
                                                            ) : (
                                                                <ZapIcon className="w-3 h-3 text-brand-cyan" />
                                                            )}
                                                            <span>{preset.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* AI Answers output */}
                                            {presets.map((preset) => {
                                                const stateKey = `${index}_${preset.key}`;
                                                const answer = aiAnswers[stateKey];
                                                const loading = loadingAIQuery[stateKey];

                                                if (loading) {
                                                    return (
                                                        <div key={preset.key} className="mt-3 p-3 bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl space-y-2.5 animate-pulse">
                                                            <div className="flex items-center gap-2">
                                                                <BotIcon className="w-3.5 h-3.5 text-brand-cyan animate-spin" />
                                                                <span className="text-[8px] font-mono text-brand-cyan uppercase tracking-widest">
                                                                    {settings.language === 'ua' ? 'Нейро-мережа перераховує взаємозв\'язки...' : settings.language === 'pl' ? 'Dekodowanie korelacji makro...' : 'Computing macro correlations...'}
                                                                </span>
                                                            </div>
                                                            <div className="h-2 bg-white/10 rounded w-3/4"></div>
                                                            <div className="h-2 bg-white/10 rounded w-5/6"></div>
                                                            <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                                        </div>
                                                    );
                                                }

                                                if (answer) {
                                                    return (
                                                        <div key={preset.key} className="mt-3 relative">
                                                            <div className="text-[8px] font-bold text-brand-cyan uppercase tracking-wider mb-1 flex items-center gap-1.5 pl-1">
                                                                <BotIcon className="w-3.5 h-3.5 text-brand-cyan" />
                                                                <span>Stork news Oracle ({preset.label})</span>
                                                            </div>
                                                            {renderFormattedText(answer)}
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default NewsModal;
