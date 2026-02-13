
import React, { useState, useEffect } from 'react';
import { StorkIcon, ShieldIcon, ActivityIcon, ChevronRightIcon, TrendingUpIcon, BotIcon } from './icons';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';

const STEPS_DATA = [
    {
        title: "Система StorkCrypto",
        desc: "Вітаємо. Ви підключились до автономного терміналу аналізу ринків. ШІ вже обробляє гігабайти даних блокчейну.",
        icon: <StorkIcon className="w-12 h-12 text-brand-cyan" />,
        color: 'from-brand-cyan/20'
    },
    {
        title: "Детектор Китів",
        desc: "Наші алгоритми слідкують за гаманцями маркет-мейкерів. Коли 'розумні гроші' рухаються, ви отримуєте сигнал першими.",
        icon: <ActivityIcon className="w-12 h-12 text-brand-purple" />,
        color: 'from-brand-purple/20'
    },
    {
        title: "Налаштування Пілота",
        desc: "Оберіть протокол торгівлі. Це визначить агресивність ваших AI-асистентів.",
        icon: <BotIcon className="w-12 h-12 text-brand-success" />,
        color: 'from-brand-success/20',
        isRiskStep: true
    },
    {
        title: "Готовність 100%",
        desc: "Ініціалізація завершена. Активуйте демо-портфель для тестування систем або налаштуйте вручну.",
        icon: <div className="text-4xl animate-bounce">🚀</div>,
        color: 'from-white/20'
    }
];

const OnboardingTour: React.FC = () => {
    const { settings, updateSettings, addAsset } = useStore();
    const [step, setStep] = useState(0);
    const [typedTitle, setTypedTitle] = useState('');

    const currentStepData = STEPS_DATA[step] || STEPS_DATA[0];

    // Typing effect for titles - hooks must run unconditionally
    useEffect(() => {
        if (settings.onboardingComplete) return;

        let i = 0;
        const text = currentStepData.title;
        setTypedTitle('');
        const interval = setInterval(() => {
            setTypedTitle(text.slice(0, i + 1));
            i++;
            if (i > text.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, [step, settings.onboardingComplete, currentStepData.title]);

    // Guard clause MOVED to bottom to respect Rules of Hooks
    if (settings.onboardingComplete) return null;

    const handleFinish = (autoSetup: boolean) => {
        if (autoSetup) {
            // Starter Pack
            addAsset({ name: 'Bitcoin', ticker: 'BTC', icon: 'btc', amount: 0.05, value: 0, change: 0, buyPrice: 67000 });
            addAsset({ name: 'Ethereum', ticker: 'ETH', icon: 'eth', amount: 0.5, value: 0, change: 0, buyPrice: 3600 });
            addAsset({ name: 'Solana', ticker: 'SOL', icon: 'sol', amount: 10, value: 0, change: 0, buyPrice: 145 });
            triggerHaptic('success');
        }
        updateSettings({ onboardingComplete: true });
    };

    const setRisk = (level: 'CONSERVATIVE' | 'AGGRESSIVE') => {
        triggerHaptic('selection');
        updateSettings({ riskLevel: level });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-cyber-grid opacity-30 animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
            
            <div className="w-full max-w-sm relative z-10 max-h-[90vh] overflow-y-auto hide-scrollbar rounded-[2.5rem]">
                <div className={`bg-gradient-to-br ${currentStepData.color} to-transparent p-[1px] rounded-[2.5rem] transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
                    <div className="bg-brand-bg border border-white/10 rounded-[2.4rem] p-8 text-center min-h-[520px] flex flex-col items-center justify-center relative overflow-hidden">
                        
                        {/* Background Tech Elements */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>

                        <div className="mb-8 relative">
                            <div className="w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center mb-4 animate-float shadow-xl relative z-10">
                                {currentStepData.icon}
                            </div>
                            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20"></div>
                        </div>

                        <h2 className="font-orbitron font-bold text-2xl text-white mb-4 leading-tight h-16 flex items-center justify-center">
                            {typedTitle}<span className="animate-pulse text-brand-cyan">_</span>
                        </h2>
                        
                        <p className="text-slate-400 text-sm font-space-mono leading-relaxed mb-8 min-h-[80px]">
                            {currentStepData.desc}
                        </p>

                        {/* Custom Content for Risk Step */}
                        {currentStepData.isRiskStep && (
                            <div className="w-full animate-fade-in-up">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button 
                                        onClick={() => setRisk('CONSERVATIVE')}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 relative overflow-hidden group ${settings.riskLevel === 'CONSERVATIVE' ? 'bg-brand-cyan text-black border-brand-cyan shadow-[0_0_20px_rgba(0,240,255,0.4)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                        <ShieldIcon className="w-8 h-8 relative z-10" />
                                        <span className="font-bold text-xs font-orbitron relative z-10">Safe Mode</span>
                                        <span className="text-[8px] font-mono opacity-70 relative z-10">BTC, ETH</span>
                                    </button>
                                    <button 
                                        onClick={() => setRisk('AGGRESSIVE')}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 relative overflow-hidden group ${settings.riskLevel === 'AGGRESSIVE' ? 'bg-brand-danger text-white border-brand-danger shadow-[0_0_20px_rgba(255,42,109,0.4)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                        <TrendingUpIcon className="w-8 h-8 relative z-10" />
                                        <span className="font-bold text-xs font-orbitron relative z-10">Degen Mode</span>
                                        <span className="text-[8px] font-mono opacity-70 relative z-10">Alts, Risky</span>
                                    </button>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <p className="text-xs text-slate-300 text-center font-space-mono">
                                        <span className="text-brand-cyan">{'>'}</span> Профіль ризику калібрує AI-сенсори.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 mb-8 mt-auto">
                            {STEPS_DATA.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-brand-cyan shadow-[0_0_10px_#00F0FF]' : 'w-2 bg-slate-700'}`}></div>
                            ))}
                        </div>

                        {step < STEPS_DATA.length - 1 ? (
                            <button 
                                onClick={() => {
                                    triggerHaptic('selection');
                                    setStep(step + 1);
                                }}
                                className="w-full py-4 rounded-2xl bg-white text-black font-bold font-orbitron hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-lg relative z-50 cursor-pointer"
                            >
                                <span className="group-hover:mr-2 transition-all">Далі</span>
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="w-full flex flex-col gap-3 animate-fade-in-up relative z-50">
                                <button 
                                    onClick={() => handleFinish(true)}
                                    className="w-full py-4 rounded-2xl bg-brand-cyan text-black font-bold font-orbitron hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.4)] relative overflow-hidden group cursor-pointer"
                                >
                                    <span className="relative z-10">Starter Pack (Recommended)</span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </button>
                                <button 
                                    onClick={() => handleFinish(false)}
                                    className="w-full py-3 rounded-2xl bg-transparent border border-white/20 text-slate-400 text-xs font-bold hover:text-white hover:border-white/50 transition-colors font-space-mono cursor-pointer"
                                >
                                    Налаштувати вручну
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
