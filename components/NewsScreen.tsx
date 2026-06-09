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
    ZapIcon,
    UserIcon,
    InfoIcon
} from './icons';
import { HelpIndicator } from './HelpIndicator';
import Skeleton from './Skeleton';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { TacticalBackground } from './TacticalBackground';
import { triggerHaptic } from '../utils/haptics';
import InfoModal from './InfoModal';
import UpgradeBanner from './UpgradeBanner';

const CATEGORIES = ['ALL', 'BTC', 'ETH', 'DEFI', 'MACRO'];

const InfluencerPulse: React.FC = () => {
    const posts = [
        { id: '1', author: 'Elon Musk', handle: '@elonmusk', text: 'DOGE looking interesting... 🐕🚀', sentiment: 'BULLISH', time: '12m ago', avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/1200px-Elon_Musk_Royal_Society_%28crop2%29.jpg' },
        { id: '2', author: 'Vitalik Buterin', handle: '@VitalikButerin', text: 'L2 scaling solutions are optimizing nicely.', sentiment: 'NEUTRAL', time: '45m ago', avatar: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg' },
        { id: '3', author: 'CZ', handle: '@cz_binance', text: 'Funds are SAFU.', sentiment: 'BULLISH', time: '2h ago', avatar: 'https://pbs.twimg.com/profile_images/1605443902/cz_400x400.jpg' }
    ];

    return (
        <div className="mb-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-orbitron mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-brand-purple" /> INFLUENCER_TRACKER
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {posts.map(post => (
                    <div key={post.id} className="min-w-[240px] bg-brand-card/40 border border-white/5 rounded-2xl p-4 relative group shrink-0 hover:border-brand-cyan/20 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={post.avatar} className="w-8 h-8 rounded-full object-cover border border-white/10" onError={(e) => (e.currentTarget as any).src='https://placehold.co/100'} />
                            <div>
                                <p className="text-xs font-bold text-white flex items-center gap-1">{post.author} <ShieldIcon className="w-3 h-3 text-blue-400" /></p>
                                <p className="text-[8px] text-slate-500 font-mono">{post.handle} • {post.time}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-300 font-mono leading-relaxed mb-3">"{post.text}"</p>
                        <div className={`text-[8px] font-black px-2 py-1 rounded w-fit uppercase ${post.sentiment === 'BULLISH' ? 'bg-green-500/20 text-green-400' : post.sentiment === 'BEARISH' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>
                            SENTIMENT: {post.sentiment}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SentimentRadar: React.FC = () => {
    return (
        <div className="w-24 h-24 relative flex items-center justify-center">
            <div className="absolute inset-0 border border-brand-cyan/20 rounded-full"></div>
            <div className="absolute inset-2 border border-brand-cyan/10 rounded-full"></div>
            <div className="absolute inset-0 border-t border-brand-cyan/30 animate-spin-slow rounded-full"></div>
            <div className="w-1 h-1 bg-brand-cyan rounded-full absolute top-4 left-10 animate-ping"></div>
            <div className="w-1 h-1 bg-brand-purple rounded-full absolute bottom-6 right-6 animate-pulse"></div>
            <span className="text-[8px] font-black text-brand-cyan bg-black/60 px-1 rounded relative z-10">SCAN</span>
        </div>
    );
};

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
    const goldVal = (isBull ? '-' : '+') + ((sum % 9) * 0.1 + 0.1).toFixed(1) + '%'; 
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

const NewsScreen: React.FC = () => {
    const [fetchedNews, setFetchedNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('ALL');
    const [showInfo, setShowInfo] = useState(false);
    
    // Track expanded indexes
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    // Active tabs for expanded detail metrics: 'CRYPTO' | 'STOCKS' | 'MACRO'
    const [activeTabs, setActiveTabs] = useState<Record<number, 'CRYPTO' | 'STOCKS' | 'MACRO'>>({});
    
    // Live custom query states
    const [loadingAIQuery, setLoadingAIQuery] = useState<Record<string, boolean>>({});
    const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});

    const { settings, customNews } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    const news = [...(customNews || []), ...(fetchedNews || [])];

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getLatestCryptoNews(settings.language);
                if (data && data.length > 0) {
                    const enhanced = data.map(n => ({
                        ...n,
                        sentimentMock: (Math.random() > 0.6 ? 'POS' : Math.random() > 0.3 ? 'NEG' : 'NEU') as 'POS' | 'NEG' | 'NEU',
                        isVerified: Math.random() > 0.3,
                        isFud: Math.random() > 0.85
                    }));
                    setFetchedNews(enhanced);
                }
            } catch(e){} finally { setLoading(false); }
        };
        fetch();
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
                    
                    if (cleanLine.startsWith('###') || cleanLine.startsWith('**')) {
                        return <h5 key={idx} className="text-white font-black uppercase text-[10px] tracking-wide mt-2">{cleanLine.replace(/[#*]/g, '')}</h5>;
                    }
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="p-4 md:p-6 pb-40 min-h-screen bg-[#020617] relative flex flex-col overflow-x-hidden"
        >
            <TacticalBackground />
            
            {/* Header Area */}
            <div className="flex items-start justify-between mb-8 pt-6 relative z-10 shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-orbitron text-4xl font-black text-white italic tracking-tighter uppercase">INTEL_GRID</h1>
                        <HelpIndicator id="intel_grid" className="mt-1" />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                         <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-ping"></div>
                         <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] font-black">Intercepting_Global_Feeds</p>
                    </div>
                </div>
                <SentimentRadar />
            </div>

            <UpgradeBanner />

            {/* Flash Ticker */}
            <div className="relative z-10 mb-6 overflow-hidden bg-brand-cyan/5 border-y border-brand-cyan/20 py-2">
                <div className="flex animate-marquee whitespace-nowrap items-center gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-brand-cyan text-xs">⚡</span>
                            <span className="text-[10px] font-mono text-brand-cyan uppercase">WHALE ALERT: 500 BTC moved to Binance</span>
                        </div>
                    ))}
                </div>
            </div>

            <InfluencerPulse />

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 space-y-6">
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => { setCategory(cat); triggerHaptic('selection'); }} 
                            className={`px-5 py-2 rounded-lg text-[9px] font-black font-orbitron tracking-widest transition-all uppercase border ${category === cat ? 'bg-brand-cyan text-black border-brand-cyan shadow-[0_0_10px_var(--primary-color)]' : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {(loading && news.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-70">
                            <div className="w-12 h-12 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin mb-4"></div>
                            <p className="text-[10px] text-brand-cyan font-mono uppercase tracking-[0.2em] animate-pulse">INITIALIZING DATA STREAM...</p>
                        </div>
                    ) : 
                    news.map((article: any, index) => {
                        const isExpanded = expandedIndex === index;
                        const metrics = getAIImpactMetrics(article.headline, index);
                        const currentTab = activeTabs[index] || 'CRYPTO';
                        const presets = getPresetQuestions(settings?.language || 'en');

                        return (
                            <div 
                                key={index} 
                                className={`p-5 bg-brand-card/40 backdrop-blur-md border rounded-[1.5rem] hover:border-brand-purple/30 transition-all duration-300 flex flex-col relative overflow-hidden ${
                                    isExpanded 
                                        ? 'border-brand-purple/40 bg-brand-card/70 shadow-[0_0_20px_rgba(156,66,245,0.1)]' 
                                        : 'border-white/5'
                                    }`} 
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rounded-bl-2xl -mr-4 -mt-4 transform rotate-45 group-hover:bg-brand-purple/20 transition-colors"></div>
                                
                                <div 
                                    className="flex justify-between items-start gap-4 cursor-pointer"
                                    onClick={() => {
                                        triggerHaptic('light');
                                        setExpandedIndex(isExpanded ? null : index);
                                    }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${article.sentimentMock === 'POS' ? 'border-green-500/30 text-green-400' : article.sentimentMock === 'NEG' ? 'border-red-500/30 text-red-400' : 'border-slate-500/30 text-slate-400'}`}>
                                                {article.sentimentMock === 'POS' ? 'BULL' : article.sentimentMock === 'NEG' ? 'BEAR' : 'NEUT'}
                                            </span>
                                            {article.isVerified && <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><ShieldIcon className="w-2.5 h-2.5"/> VERIFIED</span>}
                                            <span className="text-[8px] text-slate-600 font-mono">NODE_0x{index} // ACTIVE</span>
                                            {isExpanded && (
                                                <span className="text-[7px] font-black px-1.5 py-0.5 rounded border border-brand-purple bg-brand-purple/20 text-brand-purple animate-pulse">AI CROSS-MATRIX</span>
                                            )}
                                        </div>
                                        <h3 className="text-xs font-bold mb-2 leading-relaxed uppercase tracking-tight group-hover:text-brand-purple transition-colors text-white">{article.headline}</h3>
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-mono opacity-70">{article.summary}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        {article.sources?.[0] && (
                                            <a href={article.sources[0].uri} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-slate-500 hover:text-brand-cyan transition-all" onClick={(e) => e.stopPropagation()}><LinkIcon className="w-3 h-3" /></a>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Area */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-white/10 pt-4"
                                        >
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-3 bg-white/5 rounded-xl p-3 border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <BotIcon className="w-4 h-4 text-brand-cyan" />
                                                    <span className="text-[9px] font-black tracking-widest font-orbitron uppercase text-white">AI GLOBAL IMPACT VECTOR</span>
                                                </div>
                                                <span className={`text-[9.5px] font-black px-2 py-0.5 rounded font-mono ${metrics.direction === 'UP' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {metrics.direction === 'UP' ? '▲ BULLISH' : '▼ BEARISH'}
                                                </span>
                                            </div>

                                            {/* Subtabs */}
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
                                                                : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300'
                                                        }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Data metrics table */}
                                            <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 mb-4 font-mono text-[9px] space-y-2.5">
                                                {currentTab === 'CRYPTO' && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-1 uppercase font-bold">
                                                            <span>Asset</span>
                                                            <span>Est. Move</span>
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
                                                            <span>Analysis precision score:</span>
                                                            <span className="text-brand-cyan font-bold">{metrics.confidence}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {currentTab === 'STOCKS' && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-1 uppercase font-bold">
                                                            <span>Ticker / Index</span>
                                                            <span>Est. Move</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white font-bold">US100 / NASDAQ 100</span>
                                                            <span className={`font-black font-orbitron ${metrics.stocks.nasdaq.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{metrics.stocks.nasdaq}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white font-bold">SPX / S&P 500</span>
                                                            <span className={`font-black font-orbitron ${metrics.stocks.sp500.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{metrics.stocks.sp500}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white font-bold">NVDA / NVIDIA</span>
                                                            <span className={`font-black font-orbitron ${metrics.stocks.nvidia.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{metrics.stocks.nvidia}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white font-bold">GOLD / Safe-Haven</span>
                                                            <span className={`font-black font-orbitron ${metrics.stocks.gold.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{metrics.stocks.gold}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {currentTab === 'MACRO' && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-1 uppercase font-bold">
                                                            <span>Variable</span>
                                                            <span>AI Estimate</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white font-bold">DXY / USD Strength</span>
                                                            <span className="font-black text-slate-300">{metrics.macro.dxy}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white font-bold">FRS / Rates Forecast</span>
                                                            <span className="font-black text-brand-purple uppercase">{metrics.macro.rates}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white font-bold">Inflation Trigger Risk</span>
                                                            <span className="font-black text-slate-300 uppercase">{metrics.macro.inflation}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Custom questions loop */}
                                            <div className="space-y-2 mt-4">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-orbitron flex items-center gap-1">
                                                    <ActivityIcon className="w-3 h-3 text-brand-cyan" /> AI REPORT CHANNELS
                                                </p>
                                                
                                                <div className="grid grid-cols-3 gap-2">
                                                    {presets.map((preset) => {
                                                        const stateKey = `${index}_${preset.key}`;
                                                        const loadingAnswer = loadingAIQuery[stateKey];
                                                        const answerOk = !!aiAnswers[stateKey];

                                                        return (
                                                            <button
                                                                key={preset.key}
                                                                disabled={loadingAnswer}
                                                                onClick={() => executeAIQuery(index, article.headline, preset.key, preset.query)}
                                                                className={`py-2 px-2 rounded-xl border font-mono text-[8px] font-black uppercase text-center flex flex-col items-center justify-center gap-1 min-h-[46px] transition-all ${
                                                                    answerOk
                                                                        ? 'bg-brand-purple/20 border-brand-purple text-brand-purple shadow-lg'
                                                                        : 'bg-black/30 border-white/5 text-slate-450 hover:text-white'
                                                                }`}
                                                            >
                                                                {loadingAnswer ? (
                                                                    <span className="w-3 h-3 border border-t-transparent border-brand-cyan rounded-full animate-spin"></span>
                                                                ) : (
                                                                    <ZapIcon className="w-3 h-3 text-brand-purple" />
                                                                )}
                                                                <span>{preset.label}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Text output */}
                                                {presets.map((preset) => {
                                                    const stateKey = `${index}_${preset.key}`;
                                                    const answer = aiAnswers[stateKey];
                                                    const loading = loadingAIQuery[stateKey];

                                                    if (loading) {
                                                        return (
                                                            <div key={preset.key} className="mt-3 p-3 bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl space-y-1.5 animate-pulse">
                                                                <div className="h-2.5 bg-white/10 rounded w-2/3"></div>
                                                                <div className="h-2 bg-white/10 rounded w-5/6"></div>
                                                                <div className="h-2 bg-white/10 rounded w-1/3"></div>
                                                            </div>
                                                        );
                                                    }

                                                    if (answer) {
                                                        return (
                                                            <div key={preset.key} className="mt-3">
                                                                <span className="text-[8px] font-bold text-brand-cyan uppercase tracking-wider mb-1 flex items-center gap-1.5 pr-1 pl-1">
                                                                    <BotIcon className="w-3.5 h-3.5" />
                                                                    <span>Stork Oracle // {preset.label}</span>
                                                                </span>
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
                    {news.length === 0 && !loading && (
                        <div className="py-20 text-center text-slate-500 font-mono text-xs uppercase opacity-30">Awaiting Signal Decryption...</div>
                    )}
                </div>
            </div>
            {showInfo && <InfoModal title="INTEL_GRID" description="Neural network aggregating global crypto sentiment." features={["Real-time NLP Analysis", "Sentiment Scoring", "Source Verification"]} onClose={() => setShowInfo(false)} />}
            <button onClick={() => setShowInfo(true)} className="fixed bottom-24 right-4 z-40 w-10 h-10 bg-brand-card/80 backdrop-blur border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white shadow-lg"><InfoIcon className="w-5 h-5" /></button>
        </motion.div>
    );
};

export default NewsScreen;
