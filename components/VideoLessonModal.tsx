import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollLock } from '../utils/useScrollLock';
import { triggerHaptic } from '../utils/haptics';
import { useStore } from '../store';
import { AcademyTerm } from '../types';
import { PlayIcon, CheckIcon, ShieldIcon, SparklesIcon, GlobeIcon } from './icons';
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
    const originParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
    const embedUrl = `https://www.youtube.com/embed/${videoData.youtubeId}?enablejsapi=1&origin=${originParam}&playsinline=1&modestbranding=1&rel=0`;

    const handleClaimWatchReward = () => {
        if (rewardClaimed) return;
        triggerHaptic('success');
        setRewardClaimed(true);
        grantXp(35, `Watched Academy Video: ${lesson.term}`);
        showToast('✓ Відео-урок засвоєно! +35 XP нараховано до профілю.');
        onMarkCompleted?.(lesson.id);
    };

    const handleOpenExternal = () => {
        triggerHaptic('medium');
        safeOpenTelegramLink(directWatchUrl);
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
                    className="relative z-10 w-full max-w-2xl bg-[#030712] border border-brand-cyan/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.2)] flex flex-col my-auto max-h-[92vh]"
                >
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-[#050b14] via-[#091224] to-[#050b14] border-b border-white/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                            <div className="w-8 h-8 rounded-xl bg-brand-cyan/15 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan shrink-0">
                                <PlayIcon className="w-4 h-4 ml-0.5 fill-current" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full border border-brand-cyan/25">
                                        StorkCrypto Video Lab
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

                    {/* Quick Link bar for Telegram WebApp */}
                    <div className="bg-[#050b14] px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>HD Плеєр уроку (вбудовано)</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleOpenExternal}
                            aria-label="Дивитися у вікні Telegram або YouTube"
                            className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-white border border-red-500/30 flex items-center gap-1.5 active:scale-95 transition-all font-orbitron font-bold text-[9px] uppercase tracking-wider"
                        >
                            <PlayIcon className="w-3 h-3 fill-current" />
                            <span>Дивитися в Telegram / YouTube ↗</span>
                        </button>
                    </div>

                    {/* Responsive In-App 16:9 Video Container */}
                    <div className="relative w-full aspect-video bg-black shrink-0 border-b border-white/10">
                        <iframe
                            src={embedUrl}
                            title={videoData.title || lesson.term}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                            loading="lazy"
                        />
                    </div>

                    {/* Lesson Overview & Key Takeaways */}
                    <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                        {/* Notice for nested iframes */}
                        <div className="text-[10px] text-slate-400 font-mono bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                            <span className="text-yellow-400 text-xs shrink-0">💡</span>
                            <span>
                                Якщо вбудований плеєр показує «Відео недоступне» через політику YouTube щодо сторонніх cookies або sandbox — натисніть червону кнопку <strong>«Дивитися в Telegram / YouTube ↗»</strong> вище для перегляду у вікні Telegram.
                            </span>
                        </div>

                        {/* Source Attribution Tag */}
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono">
                            <span className="text-slate-400">
                                Матеріали відеокурсу:
                            </span>
                            <span className="text-yellow-400 font-bold flex items-center gap-1">
                                🟡 {videoData.sourceName || 'StorkCrypto Academy (Binance Academy)'}
                            </span>
                        </div>

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
                                aria-label="Зарахувати перегляд уроку"
                                className={`w-full py-3.5 px-4 rounded-xl font-orbitron font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                                    rewardClaimed
                                        ? 'bg-brand-emerald/15 border border-brand-emerald/40 text-brand-emerald cursor-default'
                                        : 'bg-brand-cyan hover:bg-white text-black active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                                }`}
                            >
                                {rewardClaimed ? (
                                    <>
                                        <CheckIcon className="w-4 h-4 text-brand-emerald" />
                                        <span>УРОК ПЕРЕГЛЯНУТО (+35 XP ЗАРАХОВАНО)</span>
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-4 h-4 text-black" />
                                        <span>ЗАРАХУВАТИ ПЕРЕГЛЯД (+35 XP)</span>
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
