
import React, { useState, useEffect } from 'react';
import { type NewsArticle, type InfluencerPost } from '../types';
import { getLatestCryptoNews } from '../services/newsService';
import { playAudio } from '../services/geminiService';
import { LinkIcon, PlayIcon, InfoIcon, ActivityIcon, RadarIcon, GlobeIcon, FileTextIcon, UserIcon, ShieldIcon } from './icons';
import Skeleton from './Skeleton';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import InfoModal from './InfoModal';
import { triggerHaptic } from '../utils/haptics';
import { TacticalBackground } from './TacticalBackground';
import UpgradeBanner from './UpgradeBanner';

const CATEGORIES = ['ALL', 'BTC', 'ETH', 'DEFI', 'MACRO'];

const InfluencerPulse: React.FC = () => {
    // Mock Influencer Data
    const posts: InfluencerPost[] = [
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
                {(Array.isArray(posts) ? posts : []).map(post => (
                    <div key={post.id} className="min-w-[240px] bg-brand-card/40 border border-white/5 rounded-2xl p-4 relative group shrink-0 hover:border-brand-cyan/20 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={post.avatar} className="w-8 h-8 rounded-full object-cover border border-white/10" onError={(e) => (e.currentTarget as any).src = 'https://placehold.co/100'} />
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

const NewsScreen: React.FC = () => {
    const [fetchedNews, setFetchedNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('ALL');
    const [showInfo, setShowInfo] = useState(false);
    const { settings, customNews } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

    const news = [...(customNews || []), ...fetchedNews];

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
            } catch (e) { } finally { setLoading(false); }
        };
        fetch();
    }, [settings.language]);

    const handleSpeak = (text: string, index: number) => {
        triggerHaptic('selection');
        if (speakingIndex === index) {
            window.speechSynthesis.cancel();
            setSpeakingIndex(null);
        } else {
            setSpeakingIndex(index);
            playAudio(text).then(() => setSpeakingIndex(null));
        }
    };

    return (
        <div className="p-4 md:p-6 pb-40 min-h-screen bg-[#020617] relative flex flex-col animate-fade-in overflow-x-hidden">
            <TacticalBackground />

            {/* Header Area */}
            <div className="flex items-start justify-between mb-8 pt-6 relative z-10 shrink-0">
                <div>
                    <h1 className="font-orbitron text-4xl font-black text-white italic tracking-tighter uppercase">{t('intelligence.feed') || 'СТРІЧКА_РОЗВІДКИ'}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-ping"></div>
                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] font-black">Перехоплення_Глобальних_Потоків</p>
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
                            <span className="text-[10px] font-mono text-brand-cyan uppercase">СПОВІЩЕННЯ КИТІВ: 500 BTC переміщено на Binance</span>
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
                    {(loading && news.length === 0) ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="w-full h-24 rounded-[1.5rem]" />) :
                        news?.map((article: any, index) => (
                            <div key={index} className="p-5 bg-brand-card/40 backdrop-blur-md border border-white/5 rounded-[1.5rem] hover:border-brand-purple/30 transition-all group animate-fade-in-up relative overflow-hidden" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rounded-bl-2xl -mr-4 -mt-4 transform rotate-45 group-hover:bg-brand-purple/20 transition-colors"></div>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${article.sentimentMock === 'POS' ? 'border-green-500/30 text-green-400' : article.sentimentMock === 'NEG' ? 'border-red-500/30 text-red-400' : 'border-slate-500/30 text-slate-400'}`}>
                                                {article.sentimentMock === 'POS' ? 'BULL' : article.sentimentMock === 'NEG' ? 'BEAR' : 'NEUT'}
                                            </span>
                                            {article.isVerified && <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><ShieldIcon className="w-2.5 h-2.5" /> VERIFIED</span>}
                                            <span className="text-[8px] text-slate-600 font-mono">NODE_0x{index} // ACTIVE</span>
                                        </div>
                                        <h3 className="text-xs font-bold text-white mb-2 leading-relaxed uppercase tracking-tight group-hover:text-brand-purple transition-colors">{article.headline}</h3>
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-mono opacity-70 line-clamp-2">{article.summary}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {article.sources?.[0] && (
                                            <a href={article.sources[0].uri} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-slate-500 hover:text-brand-cyan transition-all"><LinkIcon className="w-3 h-3" /></a>
                                        )}
                                        <button onClick={() => handleSpeak(article.summary, index)} className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${speakingIndex === index ? 'bg-brand-purple text-white border-brand-purple animate-pulse' : 'bg-black/40 border-white/10 text-slate-500 hover:text-white'}`}><PlayIcon className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    {news.length === 0 && !loading && (
                        <div className="py-20 text-center flex flex-col items-center justify-center opacity-50">
                            <ActivityIcon className="w-8 h-8 text-slate-600 mb-3 animate-pulse" />
                            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Awaiting News Broadcast...</p>
                            <p className="text-[9px] text-slate-600 mt-1">Satellite Uplink Established</p>
                        </div>
                    )}
                </div>
            </div>
            {showInfo && <InfoModal title="INTEL_GRID" description="Neural network aggregating global crypto sentiment." features={["Real-time NLP Analysis", "Sentiment Scoring", "Source Verification"]} onClose={() => setShowInfo(false)} />}
            <button onClick={() => setShowInfo(true)} className="fixed bottom-24 right-4 z-40 w-10 h-10 bg-brand-card/80 backdrop-blur border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white shadow-lg"><InfoIcon className="w-5 h-5" /></button>
        </div>
    );
};

export default NewsScreen;
