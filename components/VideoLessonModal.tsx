import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollLock } from '../utils/useScrollLock';
import { triggerHaptic } from '../utils/haptics';
import { useStore } from '../store';
import { AcademyTerm, AcademyOfficialSource } from '../types';
import { PlayIcon, CheckIcon, SparklesIcon, GlobeIcon, BookOpenIcon, ExternalLinkIcon } from './icons';
import { safeOpenTelegramLink } from '../utils/telegram';

interface VideoLessonModalProps {
    lesson: AcademyTerm;
    onClose: () => void;
    onMarkCompleted?: (lessonId: string) => void;
    isCompleted?: boolean;
}

export const VideoLessonModal: React.FC<VideoLessonModalProps> = ({
    lesson,
    onClose,
    onMarkCompleted,
    isCompleted = false
}) => {
    useScrollLock(true);
    const { grantXp, showToast } = useStore();
    const [rewardClaimed, setRewardClaimed] = useState(isCompleted);
    const [viewMode, setViewMode] = useState<'VIDEO' | 'EXCHANGE_ARTICLES'>('VIDEO');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const videoData = lesson.videoData;
    if (!videoData) return null;

    const directWatchUrl = `https://www.youtube.com/watch?v=${videoData.youtubeId}`;
    const originParam = typeof window !== 'undefined' && window.location.origin
        ? encodeURIComponent(window.location.origin)
        : encodeURIComponent('https://storkcrypto.pages.dev');
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoData.youtubeId}?autoplay=1&playsinline=1&rel=0&enablejsapi=1&origin=${originParam}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoData.youtubeId}/hqdefault.jpg`;

    const [isPlayerActive, setIsPlayerActive] = useState(false);
    const [playerError, setPlayerError] = useState<string | null>(null);
    const [thumbFailed, setThumbFailed] = useState(false);

    // Listen for YouTube IFrame API messages to catch error codes (100, 101, 150, 153, 2, 5)
    useEffect(() => {
        const handleIframeMessage = (event: MessageEvent) => {
            try {
                if (typeof event.data === 'string') {
                    const parsed = JSON.parse(event.data);
                    if (parsed.event === 'onError' || [2, 5, 100, 101, 150, 153].includes(parsed.info)) {
                        setPlayerError('VIDEO_UNAVAILABLE');
                    }
                } else if (event.data?.event === 'onError' || [2, 5, 100, 101, 150, 153].includes(event.data?.info)) {
                    setPlayerError('VIDEO_UNAVAILABLE');
                }
            } catch {
                // Ignore non-json postMessages
            }
        };

        window.addEventListener('message', handleIframeMessage);
        return () => window.removeEventListener('message', handleIframeMessage);
    }, []);

    // Fallback general exchange academy portals if specific article is not present
    const defaultOfficialSources: AcademyOfficialSource[] = [
        { name: 'Binance Academy UA', url: 'https://academy.binance.com/uk', badge: '🟡 Binance Academy' },
        { name: 'WhiteBIT Academy', url: 'https://whitebit.com/ua/academy', badge: '⚪ WhiteBIT Уроки' },
        { name: 'Bybit Learn', url: 'https://learn.bybit.com', badge: '🟠 Bybit Посібники' }
    ];

    const activeOfficialSources = (videoData.officialSources && videoData.officialSources.length > 0)
        ? videoData.officialSources
        : defaultOfficialSources;

    const handleClaimWatchReward = () => {
        if (rewardClaimed) return;
        triggerHaptic('success');
        setRewardClaimed(true);
        grantXp(35, `Mastered Academy Lesson: ${lesson.term}`);
        showToast('✓ Урок успішно засвоєно! +35 XP нараховано до профілю.');
        onMarkCompleted?.(lesson.id);
    };

    const handleOpenExternal = (url: string) => {
        triggerHaptic('medium');
        safeOpenTelegramLink(url);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md">
                <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="video-modal-title"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative z-10 w-full max-w-2xl bg-[#030712] border border-brand-cyan/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.2)] flex flex-col my-auto max-h-[94vh]"
                >
                    {/* Header */}
                    <div className="px-5 py-3.5 bg-gradient-to-r from-[#050b14] via-[#091224] to-[#050b14] border-b border-white/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                            <div className="w-8 h-8 rounded-xl bg-brand-cyan/15 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan shrink-0">
                                <PlayIcon className="w-4 h-4 ml-0.5 fill-current" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full border border-brand-cyan/25">
                                        Stork Academy Lab
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-400">
                                        ⏱️ {videoData.duration}
                                    </span>
                                </div>
                                <h3 id="video-modal-title" className="text-white font-orbitron font-bold text-xs sm:text-sm tracking-wide truncate mt-0.5">
                                    {lesson.term}
                                </h3>
                            </div>
                        </div>

                        <button
                            onClick={() => { triggerHaptic('light'); onClose(); }}
                            aria-label="Закрити відео-урок"
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all text-xs font-mono shrink-0"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Mode Selector Tablist: Video Player vs Exchange Academy Hub */}
                    <div className="bg-[#050b14] px-4 py-2 border-b border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                            <button
                                type="button"
                                onClick={() => { triggerHaptic('light'); setViewMode('VIDEO'); }}
                                className={`px-3 py-1.5 rounded-lg font-orbitron text-[10px] uppercase font-bold flex items-center gap-1.5 transition-all ${
                                    viewMode === 'VIDEO'
                                        ? 'bg-brand-cyan text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <PlayIcon className="w-3 h-3 fill-current" />
                                <span>Плеєр Уроку</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { triggerHaptic('light'); setViewMode('EXCHANGE_ARTICLES'); }}
                                className={`px-3 py-1.5 rounded-lg font-orbitron text-[10px] uppercase font-bold flex items-center gap-1.5 transition-all ${
                                    viewMode === 'EXCHANGE_ARTICLES'
                                        ? 'bg-brand-purple text-white shadow-[0_0_12px_rgba(189,0,255,0.4)]'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <BookOpenIcon className="w-3 h-3" />
                                <span>Біржові Академії ({activeOfficialSources.length})</span>
                            </button>
                        </div>

                        {viewMode === 'VIDEO' && (
                            <button
                                type="button"
                                onClick={() => handleOpenExternal(directWatchUrl)}
                                aria-label="Дивитися у вікні Telegram або YouTube"
                                className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-white border border-red-500/30 flex items-center gap-1 active:scale-95 transition-all font-orbitron font-bold text-[9px] uppercase tracking-wider shrink-0"
                            >
                                <PlayIcon className="w-2.5 h-2.5 fill-current" />
                                <span>У вікні TG ↗</span>
                            </button>
                        )}
                    </div>

                    {/* Main Content Area */}
                    {viewMode === 'VIDEO' ? (
                        /* Responsive In-App 16:9 Video Container with Poster Fallback & Error State */
                        <div className="relative w-full aspect-video bg-black shrink-0 border-b border-white/10 overflow-hidden group">
                            {playerError ? (
                                /* Cyberpunk Error Fallback Card */
                                <div className="absolute inset-0 bg-[#060c18] flex flex-col items-center justify-center p-4 text-center space-y-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-lg shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                        ⚠️
                                    </div>
                                    <div className="space-y-1 max-w-sm">
                                        <h4 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
                                            Обмеження вбудовування YouTube
                                        </h4>
                                        <p className="text-[10px] text-slate-300 font-mono leading-relaxed">
                                            Автор або YouTube обмежили вбудований перегляд. Відкрийте відео у вікні Telegram або скористайтеся офіційною статтею біржі:
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenExternal(directWatchUrl)}
                                            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                                        >
                                            <PlayIcon className="w-2.5 h-2.5 fill-current" />
                                            <span>Дивитися в Telegram ↗</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('EXCHANGE_ARTICLES')}
                                            className="px-3.5 py-1.5 rounded-xl bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan border border-brand-cyan/40 font-orbitron font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all"
                                        >
                                            <BookOpenIcon className="w-3 h-3" />
                                            <span>Читати статтю біржі 📚</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setPlayerError(null); setIsPlayerActive(true); }}
                                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-[9px] border border-white/10 transition-all"
                                        >
                                            ↻ Повторити
                                        </button>
                                    </div>
                                </div>
                            ) : isPlayerActive ? (
                                <iframe
                                    src={embedUrl}
                                    title={videoData.title || lesson.term}
                                    className="absolute inset-0 w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                />
                            ) : (
                                <div
                                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 bg-cover bg-center"
                                    style={{
                                        backgroundImage: thumbFailed
                                            ? 'radial-gradient(circle at center, #0a1b36 0%, #030712 100%)'
                                            : `linear-gradient(rgba(3,7,18,0.65), rgba(3,7,18,0.85)), url(${thumbnailUrl})`
                                    }}
                                >
                                    {/* Invisible image loader to detect thumbnail failure early */}
                                    <img
                                        src={thumbnailUrl}
                                        alt=""
                                        className="hidden"
                                        onError={() => setThumbFailed(true)}
                                    />

                                    {/* Ambient Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-black/60 pointer-events-none" />

                                    {/* Play Button */}
                                    <div className="relative z-10 flex flex-col items-center text-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { triggerHaptic('medium'); setIsPlayerActive(true); }}
                                            aria-label="Запустити відео у вбудованому плеєрі"
                                            className="w-16 h-16 rounded-2xl bg-brand-cyan hover:bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105 active:scale-95 transition-all group-hover:shadow-[0_0_40px_rgba(0,240,255,0.9)]"
                                        >
                                            <PlayIcon className="w-8 h-8 ml-1 fill-current text-black" />
                                        </button>

                                        <div className="space-y-1 max-w-md">
                                            <div className="text-xs font-orbitron font-bold text-white uppercase tracking-wider drop-shadow">
                                                {videoData.title || lesson.term}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-300 flex items-center justify-center gap-2">
                                                <span className="text-brand-cyan">HD 1080p</span>
                                                <span>•</span>
                                                <span>⏱️ {videoData.duration}</span>
                                            </div>
                                        </div>

                                        {/* Telegram Native PiP Fallback Action */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenExternal(directWatchUrl)}
                                                className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/40 text-red-300 hover:text-white border border-red-500/40 font-orbitron font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
                                            >
                                                <PlayIcon className="w-2.5 h-2.5 fill-current" />
                                                <span>Відкрити в Telegram PiP ↗</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Exchange Academy Hub View */
                        <div className="p-4 bg-gradient-to-b from-[#060f1e] to-[#020617] border-b border-white/10 space-y-3 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GlobeIcon className="w-4 h-4 text-brand-cyan" />
                                    <h4 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
                                        Офіційні матеріали провідних бірж
                                    </h4>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                                    Прямий доступ ↗
                                </span>
                            </div>

                            <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                                Вивчайте цю тему безпосередньо в офіційних освітніх хабах бірж (Binance, WhiteBIT, Bybit, OKX) українською та англійською мовами:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {activeOfficialSources.map((source, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleOpenExternal(source.url)}
                                        className="p-3 rounded-xl bg-black/60 hover:bg-white/10 border border-white/10 hover:border-brand-cyan/40 transition-all flex items-center justify-between group text-left active:scale-98"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            <span className="w-2 h-2 rounded-full bg-brand-cyan group-hover:animate-ping shrink-0" />
                                            <div className="truncate">
                                                <div className="text-[11px] font-orbitron font-bold text-white group-hover:text-brand-cyan transition-colors truncate">
                                                    {source.name}
                                                </div>
                                                <div className="text-[9px] font-mono text-slate-400 truncate">
                                                    {source.badge}
                                                </div>
                                            </div>
                                        </div>
                                        <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lesson Overview & Key Takeaways */}
                    <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                        {/* Quick Exchange Links Pill Row in Video mode */}
                        {viewMode === 'VIDEO' && activeOfficialSources.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                    <span>Офіційні статті за темою:</span>
                                    <span className="text-[9px] font-mono text-brand-cyan">Біржові посібники ↗</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {activeOfficialSources.map((src, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleOpenExternal(src.url)}
                                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-cyan/40 text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
                                        >
                                            <span>{src.badge}</span>
                                            <span className="text-slate-500">↗</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary description */}
                        <div>
                            <h4 className="text-[11px] font-orbitron font-bold text-brand-cyan uppercase tracking-wider mb-1.5">
                                Короткий зміст уроку
                            </h4>
                            <p className="text-xs text-slate-300 font-mono leading-relaxed">
                                {lesson.definition}
                            </p>
                        </div>

                        {/* Key Takeaways */}
                        {videoData.takeaways && videoData.takeaways.length > 0 && (
                            <div className="rounded-2xl bg-black/40 border border-white/5 p-4 space-y-2">
                                <h4 className="text-[10px] font-orbitron font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <SparklesIcon className="w-3.5 h-3.5 text-brand-purple" />
                                    Головні висновки для практики:
                                </h4>
                                <ul className="space-y-1.5">
                                    {videoData.takeaways.map((point, idx) => (
                                        <li key={idx} className="text-xs text-slate-300 font-mono flex items-start gap-2">
                                            <span className="text-brand-cyan font-bold">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Action reward button */}
                        <div className="pt-2">
                            <button
                                onClick={handleClaimWatchReward}
                                disabled={rewardClaimed}
                                aria-label="Зарахувати вивчення уроку"
                                className={`w-full py-3.5 px-4 rounded-xl font-orbitron font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                                    rewardClaimed
                                        ? 'bg-brand-emerald/15 border border-brand-emerald/40 text-brand-emerald cursor-default'
                                        : 'bg-brand-cyan hover:bg-white text-black active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                                }`}
                            >
                                {rewardClaimed ? (
                                    <>
                                        <CheckIcon className="w-4 h-4 text-brand-emerald" />
                                        <span>УРОК ЗАСВОЄНО (+35 XP ЗАРАХОВАНО)</span>
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-4 h-4 text-black" />
                                        <span>ЗАРАХУВАТИ ЗАСВОЄННЯ (+35 XP)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
