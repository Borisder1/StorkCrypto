import React from 'react';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';
import { 
    BookIcon, ShieldIcon, ZapIcon, SparklesIcon, ChevronRightIcon, BrainIcon, AwardIcon 
} from './icons';

export const AcademyBannerWidget: React.FC = () => {
    const { settings, openAcademy } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);

    const handleOpen = (category?: 'TECHNICAL' | 'PATTERNS' | 'PSYCHOLOGY' | 'SECURITY') => {
        triggerHaptic('medium');
        openAcademy(category);
    };

    return (
        <section 
            aria-labelledby="academy-widget-title"
            className="relative rounded-3xl bg-gradient-to-b from-[#0a1122] via-[#050b14] to-[#020617] border border-brand-purple/30 p-4 sm:p-5 shadow-[0_0_30px_rgba(189,0,255,0.08)] overflow-hidden transition-all"
        >
            {/* Ambient Background Glows */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-purple/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple shadow-lg shadow-brand-purple/10">
                        <BookIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 id="academy-widget-title" className="font-orbitron font-black text-white text-sm sm:text-base tracking-wide uppercase">
                                {t('academy.title')}
                            </h2>
                            <span className="text-[9px] font-mono font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 px-2 py-0.5 rounded-full tracking-wider">
                                {t('academy.widget_badge')}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                            {t('academy.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Direct link to all topics */}
                <button
                    onClick={() => handleOpen()}
                    aria-label="Відкрити всю Академію трейдингу"
                    className="hidden sm:flex items-center gap-1.5 text-xs font-orbitron font-bold text-brand-purple hover:text-white bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/30 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                >
                    <span>Всі теми</span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* 2-Column Bento Cards: Beginners & Pros */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
                
                {/* Card 1: For Beginners (Основи & Безпека) */}
                <div 
                    onClick={() => handleOpen('SECURITY')}
                    className="group relative rounded-2xl bg-black/40 hover:bg-black/60 border border-emerald-500/25 hover:border-emerald-400/60 p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-inner"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                    
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                                <ShieldIcon className="w-3 h-3" />
                                {t('academy.beginners_badge')}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">Рівень 1</span>
                        </div>

                        <h3 className="font-orbitron font-black text-white text-sm sm:text-base group-hover:text-emerald-300 transition-colors mb-1.5">
                            {t('academy.beginners_title')}
                        </h3>
                        
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            {t('academy.beginners_desc')}
                        </p>

                        {/* Visual chips */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-300">
                                🛡️ 2FA & Сід-фрази
                            </span>
                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-300">
                                🧠 FOMO / FUD
                            </span>
                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-300">
                                📊 Базові свічки
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpen('SECURITY');
                        }}
                        aria-label="Перейти до уроків для початківців"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 group-hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 group-hover:text-white font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                        <span>{t('academy.beginners_btn')}</span>
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Card 2: For Experienced / PRO (Smart Money, SMC, Order Blocks) */}
                <div 
                    onClick={() => handleOpen('PATTERNS')}
                    className="group relative rounded-2xl bg-black/40 hover:bg-black/60 border border-brand-cyan/25 hover:border-brand-cyan/60 p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-inner"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full blur-2xl group-hover:bg-brand-cyan/10 transition-all pointer-events-none" />
                    
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase text-brand-cyan bg-brand-cyan/15 border border-brand-cyan/30 px-2.5 py-0.5 rounded-lg">
                                <ZapIcon className="w-3 h-3" />
                                {t('academy.pros_badge')}
                            </span>
                            <span className="text-[10px] font-mono text-brand-purple">PRO SMC</span>
                        </div>

                        <h3 className="font-orbitron font-black text-white text-sm sm:text-base group-hover:text-brand-cyan transition-colors mb-1.5">
                            {t('academy.pros_title')}
                        </h3>
                        
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            {t('academy.pros_desc')}
                        </p>

                        {/* Visual chips */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-300">
                                🎯 Smart Money (SMC)
                            </span>
                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-300">
                                📦 Order Blocks & FVG
                            </span>
                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-300">
                                ⚡ 15с Тактичні дріли
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpen('PATTERNS');
                        }}
                        aria-label="Перейти до PRO аналітики та дрілів"
                        className="w-full py-2.5 px-3 rounded-xl bg-brand-cyan/15 group-hover:bg-brand-cyan/25 border border-brand-cyan/40 text-brand-cyan group-hover:text-white font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                        <span>{t('academy.pros_btn')}</span>
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>

            </div>

            {/* Bottom Info Strip */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/5 text-[11px] text-slate-400 font-space-mono">
                <div className="flex items-center gap-2 text-center sm:text-left">
                    <SparklesIcon className="w-4 h-4 text-brand-purple shrink-0" />
                    <span>{t('academy.footer_note')}</span>
                </div>

                <button
                    onClick={() => handleOpen()}
                    aria-label="Відкрити всю Академію"
                    className="sm:hidden w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-orbitron font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                    <span>Переглянути всі матеріали</span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
            </div>
        </section>
    );
};
