import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollLock } from '../utils/useScrollLock';
import { triggerHaptic } from '../utils/haptics';
import { useStore } from '../store';
import { AcademyTerm, AcademyOfficialSource, AcademyLanguage, AcademyVariant } from '../types';
import { ACADEMY_LESSONS_MAP, resolveLessonVariant } from './AcademyLessonsData';
import { PlayIcon, CheckIcon, SparklesIcon, GlobeIcon, BookOpenIcon, ExternalLinkIcon } from './icons';
import { safeOpenTelegramLink } from '../utils/telegram';

type PlayerState = 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'autoplay_blocked' | 'video_unavailable' | 'embedding_blocked' | 'network_error';

interface VideoLessonModalProps {
    lesson: AcademyTerm;
    preferredLang?: AcademyLanguage;
    onSwitchLanguage?: (newLang: AcademyLanguage) => void;
    onClose: () => void;
    onMarkCompleted?: (lessonId: string) => void;
    isCompleted?: boolean;
}

export const VideoLessonModal: React.FC<VideoLessonModalProps> = ({
    lesson,
    preferredLang = 'uk',
    onSwitchLanguage,
    onClose,
    onMarkCompleted,
    isCompleted = false
}) => {
    useScrollLock(true);
    const { grantXp, showToast } = useStore();
    const [rewardClaimed, setRewardClaimed] = useState(isCompleted);
    const [viewMode, setViewMode] = useState<'VIDEO' | 'EXCHANGE_ARTICLES'>('VIDEO');
    const [currentLang, setCurrentLang] = useState<AcademyLanguage>(preferredLang);

    // Escape listener for accessibility
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Resolve variant from centralized typed catalog using 6-step fallback
    const academyLesson = ACADEMY_LESSONS_MAP.get(lesson.id);
    const resolved = academyLesson
        ? resolveLessonVariant(academyLesson, currentLang)
        : null;

    const variant: AcademyVariant | null = resolved ? resolved.variant : (lesson.videoData ? {
        language: currentLang,
        spokenLanguage: lesson.videoData.spokenLanguage || 'en',
        subtitleLanguages: lesson.videoData.subtitleLanguages || ['uk', 'ru', 'en'],
        provider: lesson.videoData.provider || 'binance',
        title: lesson.videoData.title || lesson.term,
        description: lesson.definition,
        videoId: lesson.videoData.youtubeId,
        youtubeUrl: `https://www.youtube.com/watch?v=${lesson.videoData.youtubeId}`,
        officialArticleUrl: lesson.videoData.officialArticleUrl,
        fallbackUrl: lesson.videoData.fallbackUrl || 'https://academy.binance.com/uk',
        duration: lesson.videoData.duration,
        validationStatus: 'verified',
        thumbnailUrl: `https://img.youtube.com/vi/${lesson.videoData.youtubeId}/hqdefault.jpg`,
        disclaimer: lesson.videoData.disclaimer
    } : null);

    const videoId = variant?.videoId || lesson.videoData?.youtubeId;
    const directWatchUrl = videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : (variant?.officialArticleUrl || 'https://academy.binance.com/uk');

    const originParam = typeof window !== 'undefined' && window.location.origin
        ? encodeURIComponent(window.location.origin)
        : encodeURIComponent('https://storkcrypto.pages.dev');

    const embedUrl = videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&enablejsapi=1&origin=${originParam}`
        : '';

    const thumbnailUrl = variant?.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '');

    const [isPlayerActive, setIsPlayerActive] = useState(false);
    const [playerState, setPlayerState] = useState<PlayerState>('loading');
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
                        setPlayerState('video_unavailable');
                    }
                    if (parsed.event === 'onReady') {
                        setPlayerState('ready');
                    }
                } else if (event.data?.event === 'onError' || [2, 5, 100, 101, 150, 153].includes(event.data?.info)) {
                    setPlayerError('VIDEO_UNAVAILABLE');
                    setPlayerState('video_unavailable');
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
        { name: 'Binance Academy', url: 'https://academy.binance.com/uk', badge: '🟡 Binance Academy' },
        { name: 'Bybit Learn', url: 'https://learn.bybit.com', badge: '🟠 Bybit Посібники' },
        { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn', badge: '⚪ OKX Learn' }
    ];

    const activeOfficialSources = (lesson.videoData?.officialSources && lesson.videoData.officialSources.length > 0)
        ? lesson.videoData.officialSources
        : defaultOfficialSources;

    const handleClaimWatchReward = () => {
        if (rewardClaimed) return;
        triggerHaptic('success');
        setRewardClaimed(true);
        grantXp(35, `Mastered Academy Lesson: ${variant?.title || lesson.term}`);
        showToast('✓ Урок успішно засвоєно! +35 XP нараховано до профілю.');
        onMarkCompleted?.(lesson.id);
    };

    const handleOpenExternal = (url: string) => {
        triggerHaptic('medium');
        safeOpenTelegramLink(url);
    };

    const handleCycleLanguage = () => {
        triggerHaptic('selection');
        const nextLang: AcademyLanguage = currentLang === 'uk' ? 'ru' : currentLang === 'ru' ? 'en' : 'uk';
        setCurrentLang(nextLang);
        onSwitchLanguage?.(nextLang);
        setPlayerError(null);
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
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full border border-brand-cyan/25">
                                        Stork Academy Pro
                                    </span>
                                    {variant?.duration && (
                                        <span className="text-[9px] font-mono text-slate-400">
                                            ⏱️ {variant.duration}
                                        </span>
                                    )}
                                </div>
                                <h3 id="video-modal-title" className="text-white font-orbitron font-bold text-xs sm:text-sm tracking-wide truncate mt-0.5">
                                    {variant?.title || lesson.term}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {/* In-Modal Language Switcher */}
                            <button
                                type="button"
                                onClick={handleCycleLanguage}
                                aria-label="Перемкнути мову уроку"
                                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-cyan border border-white/10 hover:border-brand-cyan/40 text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1"
                            >
                                <span>🌐</span>
                                <span>{currentLang.toUpperCase()}</span>
                            </button>

                            <button
                                onClick={() => { triggerHaptic('light'); onClose(); }}
                                aria-label="Закрити відео-урок"
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all text-xs font-mono"
                            >
                                ✕
                            </button>
                        </div>
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
                                <span>Офіційна Стаття Біржі</span>
                            </button>
                        </div>

                        {viewMode === 'VIDEO' && videoId && (
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

                    {/* Fallback Notice Banner if Fallback Algorithm picked alternate language */}
                    {resolved?.isFallback && resolved.fallbackReason && (
                        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-[11px] font-mono flex items-center gap-2">
                            <span className="text-sm">ℹ️</span>
                            <span>{resolved.fallbackReason}</span>
                        </div>
                    )}

                    {/* Main Content Area */}
                    {viewMode === 'VIDEO' && videoId ? (
                        /* Responsive In-App 16:9 Video Container with Poster Fallback & Error State */
                        <div className="relative w-full aspect-video bg-black shrink-0 border-b border-white/10 overflow-hidden group">
                            {playerError ? (
                                /* Specification-Compliant Error State with 5 Action Buttons */
                                <div className="absolute inset-0 bg-[#060c18] flex flex-col items-center justify-center p-4 text-center space-y-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-lg shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                        ⚠️
                                    </div>
                                    <div className="space-y-1 max-w-sm">
                                        <h4 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
                                            Відео тимчасово недоступне
                                        </h4>
                                        <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                                            Відкрийте офіційну статтю або англійську версію.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-md">
                                        <button
                                            type="button"
                                            onClick={() => { setPlayerError(null); setIsPlayerActive(true); }}
                                            className="px-3 py-1.5 rounded-xl bg-brand-cyan text-black font-orbitron font-bold text-[9px] uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                                        >
                                            ↻ Повторити
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenExternal(directWatchUrl)}
                                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all"
                                        >
                                            <PlayIcon className="w-2.5 h-2.5 fill-current" />
                                            <span>Відкрити на YouTube ↗</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenExternal(variant?.officialArticleUrl || variant?.fallbackUrl || directWatchUrl)}
                                            className="px-3 py-1.5 rounded-xl bg-brand-purple hover:bg-brand-purple/80 text-white font-orbitron font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all"
                                        >
                                            <BookOpenIcon className="w-2.5 h-2.5" />
                                            <span>Відкрити офіційну статтю</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCycleLanguage}
                                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-orbitron font-bold text-[9px] uppercase tracking-wider active:scale-95 transition-all"
                                        >
                                            🌐 Перемкнути мову
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-mono text-[9px] active:scale-95 transition-all"
                                        >
                                            Закрити
                                        </button>
                                    </div>
                                </div>
                            ) : isPlayerActive ? (
                                <iframe
                                    src={embedUrl}
                                    title={variant?.title || lesson.term}
                                    className="absolute inset-0 w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                                                {variant?.title || lesson.term}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-300 flex items-center justify-center gap-2">
                                                <span className="text-brand-cyan">HD 1080p</span>
                                                <span>•</span>
                                                <span>⏱️ {variant?.duration || lesson.videoData?.duration}</span>
                                            </div>
                                        </div>

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
                        /* Exchange Academy Hub View / Article View */
                        <div className="p-4 bg-gradient-to-b from-[#060f1e] to-[#020617] border-b border-white/10 space-y-3 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GlobeIcon className="w-4 h-4 text-brand-cyan" />
                                    <h4 className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
                                        Офіційний навчальний матеріал біржі
                                    </h4>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                                    {variant?.provider ? variant.provider.toUpperCase() : 'VERIFIED'}
                                </span>
                            </div>

                            <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                                {variant?.description || lesson.definition}
                            </p>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenExternal(variant?.officialArticleUrl || variant?.fallbackUrl || 'https://academy.binance.com/uk')}
                                    className="w-full p-3 rounded-xl bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 border border-brand-cyan/40 hover:border-brand-cyan text-white font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-between group active:scale-98 transition-all"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <BookOpenIcon className="w-4 h-4 text-brand-cyan" />
                                        <span>Читати повний офіційний посібник на {variant?.provider?.toUpperCase() || 'EXCHANGE'}</span>
                                    </div>
                                    <ExternalLinkIcon className="w-4 h-4 text-brand-cyan group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Lesson Overview & Honest Language Labels */}
                    <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                        {/* Section 3.4 Honest Language Labels */}
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                            <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                                <span className="text-slate-400">Мова озвучки: </span>
                                <span className="font-bold text-white uppercase">{variant?.spokenLanguage || 'English'}</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                                <span className="text-slate-400">Субтитри: </span>
                                <span className="font-bold text-white uppercase">{variant?.subtitleLanguages?.join(', ') || 'UK, RU, EN'}</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                                <span className="text-slate-400">Мова UI: </span>
                                <span className="font-bold text-brand-cyan uppercase">
                                    {currentLang === 'uk' ? 'Українська' : currentLang === 'ru' ? 'Російська' : 'English'}
                                </span>
                            </div>
                        </div>

                        {/* Summary description */}
                        <div>
                            <h4 className="text-[11px] font-orbitron font-bold text-brand-cyan uppercase tracking-wider mb-1.5">
                                Короткий зміст уроку
                            </h4>
                            <p className="text-xs text-slate-300 font-mono leading-relaxed">
                                {variant?.description || lesson.definition}
                            </p>
                        </div>

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
