
import React, { useState, useEffect } from 'react';
import { type NewsArticle } from '../types';
import { getLatestCryptoNews, playAudio } from '../services/geminiService';
import { LinkIcon, PlayIcon, ChevronRightIcon, RadarIcon } from './icons';
import Skeleton from './Skeleton';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { TacticalBackground } from './TacticalBackground';
import { triggerHaptic } from '../utils/haptics';

const NewsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getLatestCryptoNews(settings.language);
                setNews(data);
            } catch(e){} finally { setLoading(false); }
        };
        fetch();
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, [settings.language]);

    return (
        <div className="fixed inset-0 z-[120] bg-brand-bg flex flex-col animate-fade-in overflow-hidden">
            <TacticalBackground />
            
            {/* Standardized Header */}
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase">Intel_Grid</h1>
                        <p className="text-[8px] text-brand-purple font-mono uppercase">Neural_Feeds: LIVE</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center">
                    <RadarIcon className="w-5 h-5 text-brand-purple animate-pulse" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 pb-32 relative z-10">
                {loading ? Array.from({length:6}).map((_,i) => <Skeleton key={i} className="w-full h-28 rounded-[2rem]" />) : 
                news.map((article, index) => (
                    <div key={index} className="p-5 bg-brand-card/40 backdrop-blur-md border border-white/5 rounded-[2rem] hover:border-brand-cyan/20 transition-all animate-fade-in-up">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <span className="text-[8px] font-black text-brand-cyan uppercase tracking-widest mb-2 block">SOURCE_0{index + 1}</span>
                                <h3 className="text-sm font-black text-white mb-2 leading-tight uppercase">{article.headline}</h3>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-mono opacity-80 line-clamp-3">{article.summary}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {article.sources?.[0] && (
                                    <a href={article.sources[0].uri} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-slate-400 hover:text-brand-cyan transition-all"><LinkIcon className="w-4 h-4" /></a>
                                )}
                                <button 
                                    onClick={() => { triggerHaptic('selection'); playAudio(article.summary); }}
                                    className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-slate-400 hover:text-brand-purple transition-all"
                                >
                                    <PlayIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsModal;
