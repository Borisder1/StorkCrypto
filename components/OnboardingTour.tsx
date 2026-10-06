import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';
import { BotIcon, ActivityIcon, WalletIcon, SettingsIcon, ZapIcon, SparklesIcon } from './icons';

export const OnboardingTour: React.FC = () => {
    const { settings, updateSettings, addXp, showToast } = useStore();
    const [step, setStep] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !settings.onboardingComplete) {
                finishTour();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [settings.onboardingComplete]);

    if (settings.onboardingComplete) return null;

    const lang = settings?.language || 'ua';

    const tourSteps = lang === 'ua' ? [
        {
            title: "AI Ринкові Сигнали 🧠",
            icon: <ActivityIcon className="w-8 h-8 text-brand-green" />,
            desc: "Цілодобовий нейронний моніторинг ринку, аналіз рівнів входу, цілей та управління ризиками в реальному часі."
        },
        {
            title: "Whale Radar & Аналітика 🐋",
            icon: <ZapIcon className="w-8 h-8 text-brand-cyan" />,
            desc: "Відстеження великих транзакцій китів, теплові карти ліквідацій та індекс настроїв ринку Fear & Greed."
        },
        {
            title: "Крипто-Академія та Квести 🎓",
            icon: <SparklesIcon className="w-8 h-8 text-purple-400" />,
            desc: "13 практичних уроків, 15с тактичні дріли та щоденні квести. Отримайте свої перші +50 XP прямо зараз!"
        }
    ] : [
        {
            title: "AI Market Signals 🧠",
            icon: <ActivityIcon className="w-8 h-8 text-brand-green" />,
            desc: "24/7 neural market surveillance with precise entry targets, stop-loss calculations, and real-time execution."
        },
        {
            title: "Whale Radar & Heatmaps 🐋",
            icon: <ZapIcon className="w-8 h-8 text-brand-cyan" />,
            desc: "Track institutional whale flows, liquidation heatmaps, and live Fear & Greed sentiment index."
        },
        {
            title: "Academy & Quests 🎓",
            icon: <SparklesIcon className="w-8 h-8 text-purple-400" />,
            desc: "13 tactical lessons, 15s speed drills, and daily mission rewards. Claim your first +50 XP right now!"
        }
    ];

    const currentStep = tourSteps[step];

    const handleNext = () => {
        triggerHaptic('light');
        if (step < tourSteps.length - 1) {
            setStep(step + 1);
        } else {
            finishTour();
        }
    };

    const finishTour = () => {
        triggerHaptic('success');
        addXp(50);
        showToast(lang === 'ua' ? '🎉 Вітаємо на борту! +50 XP нараховано' : '🎉 Welcome aboard! +50 XP unlocked');
        updateSettings({ onboardingComplete: true });
        try {
            localStorage.setItem('stork_onboarding_completed_v1', 'true');
        } catch (_) {}
    };

    return (
        <AnimatePresence>
            <div 
                role="dialog"
                aria-modal="true"
                aria-labelledby="onboarding-tour-title"
                className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
            >
                <motion.div 
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="w-full max-w-sm bg-[#050b14] border border-brand-cyan/40 rounded-t-[2.5rem] sm:rounded-3xl p-6 shadow-[0_0_40px_rgba(0,240,255,0.25)] relative text-center overflow-hidden"
                >
                    {/* Mobile Sheet Drag Handle */}
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

                    {/* Top Progress Dots */}
                    <div className="flex items-center justify-center gap-1.5 mb-6">
                        {tourSteps.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'w-6 bg-brand-cyan' : 'w-1.5 bg-white/20'}`}
                            />
                        ))}
                    </div>

                    {/* Step Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-inner">
                        {currentStep.icon}
                    </div>

                    {/* Step Content */}
                    <h3 id="onboarding-tour-title" className="font-orbitron font-bold text-base text-white uppercase tracking-wider mb-2">
                        {currentStep.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed mb-6">
                        {currentStep.desc}
                    </p>

                    {/* Action Controls */}
                    <div className="flex items-center justify-between gap-3">
                        <button
                            onClick={finishTour}
                            className="px-4 py-3 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                        >
                            {lang === 'ua' ? 'Пропустити' : 'Skip'}
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 px-4 rounded-xl bg-brand-cyan text-black font-orbitron font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                        >
                            {step === tourSteps.length - 1 ? (lang === 'ua' ? 'Почати (+50 XP) 🎉' : 'Start (+50 XP) 🎉') : (lang === 'ua' ? 'Далі →' : 'Next →')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
