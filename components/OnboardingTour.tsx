import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';
import { BotIcon, ActivityIcon, WalletIcon, SettingsIcon, ZapIcon } from './icons';

export const OnboardingTour: React.FC = () => {
    const { settings, updateSettings } = useStore();
    const [step, setStep] = useState(0);

    if (settings.onboardingComplete) return null;

    const tourSteps = [
        {
            title: "Вітаємо у StorkCrypto Terminal! 🚀",
            icon: <BotIcon className="w-8 h-8 text-brand-cyan" />,
            desc: "Це ваш інтелектуальний нейронний термінал для роботи з криптовалютами. Давайте за 30 секунд ознайомимося з основними можливостями."
        },
        {
            title: "AI Торгові Сигнали 🧠",
            icon: <ActivityIcon className="w-8 h-8 text-brand-green" />,
            desc: "Розділ Signals надає алгоритмічні сетапи в режимі 24/7 з точними рівнями входу, цілями та розрахунком стоп-лосу від автономних AI-агентів."
        },
        {
            title: "Мультичейн Гаманець 👛",
            icon: <WalletIcon className="w-8 h-8 text-purple-400" />,
            desc: "Підключайте TON, MetaMask чи Web3 гаманці для відстеження балансів, швидкого обміну та моніторингу активів у єдиному вікні."
        },
        {
            title: "Налаштування та Кастомізація ⚙️",
            icon: <SettingsIcon className="w-8 h-8 text-amber-400" />,
            desc: "Вибирайте кіберпанк-теми (Midnight, Solar, Matrix), керуйте сповіщеннями Sentinel Security та приєднуйтесь до Airdrop Station."
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
        updateSettings({ onboardingComplete: true });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-sm bg-[#050b14] border border-brand-cyan/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.3)] relative text-center overflow-hidden"
                >
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
                    <h3 className="font-orbitron font-bold text-base text-white uppercase tracking-wider mb-2">
                        {currentStep.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed mb-6">
                        {currentStep.desc}
                    </p>

                    {/* Action Controls */}
                    <div className="flex items-center justify-between gap-3">
                        <button
                            onClick={finishTour}
                            className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors"
                        >
                            Пропустити
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 px-4 rounded-xl bg-brand-cyan text-black font-orbitron font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95"
                        >
                            {step === tourSteps.length - 1 ? 'Завершити 🎉' : 'Далі →'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
