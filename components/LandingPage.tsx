import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ZapIcon, RadarIcon, ActivityIcon, ShieldIcon, UsersIcon, AwardIcon, BotIcon, ArrowUpRightIcon } from './icons';

interface LandingPageProps {
    onOpenApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const faqItems = [
        {
            q: "Що таке StorkCrypto Neural Terminal?",
            a: "Це автономний AI-крипто-термінал, що аналізує ринок у реальному часі за допомогою нейромереж, видає алгоритмічні торгові сигнали та відстежує рух капіталу китів."
        },
        {
            q: "Як підключити гаманець чи Telegram?",
            a: "Ви можете використовувати термінал безпосередньо в Telegram WebApp через TonConnect або авторизуватись через MetaMask, Phantom чи Telegram Wallet."
        },
        {
            q: "Чи безпечно підключати свої гаманці?",
            a: "Абсолютно. StorkCrypto використовує розмежовану архітектуру (Non-Custodial) та інтегрований інструмент захисту Sentinel Security. Ми не маємо доступу до ваших приватних ключів."
        },
        {
            q: "Які сигнали надають AI-агенти?",
            a: "Агенти генерують сигнали LONG/SHORT з аналізом рівнів Take-Profit, Stop-Loss, розрахунком Leverage та поясненням причини входу (Reasoning Chain)."
        },
        {
            q: "Яка вартість використання?",
            a: "Базовий термінал, новини та моніторинг безкоштовні. Для розширених AI-сигналів та автотрейдингу доступний тариф PRO та події з нагородами у Gram/Stars."
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white font-mono selection:bg-brand-cyan selection:text-black relative overflow-x-hidden">
            {/* JSON-LD Schema.org Structured Data for SEO */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "StorkCrypto Neural Crypto Terminal",
                "operatingSystem": "Web, Telegram WebApp, Android, iOS",
                "applicationCategory": "FinanceApplication",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "description": "Next-generation AI-powered crypto terminal featuring real-time trading signals, market sentiment analysis, whale tracking, and portfolio management."
            })}} />

            {/* Background Accent Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-cyan/10 blur-[150px] pointer-events-none -z-10"></div>
            <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] pointer-events-none -z-10"></div>

            {/* Header */}
            <header className="sticky top-0 z-sticky backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center">
                            <BotIcon className="w-5 h-5 text-brand-cyan" />
                        </div>
                        <span className="font-orbitron font-extrabold text-base tracking-wider text-white">
                            STORK<span className="text-brand-cyan">CRYPTO</span>
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300">
                        <a href="#features" className="hover:text-brand-cyan transition-colors">Можливості</a>
                        <a href="#how-it-works" className="hover:text-brand-cyan transition-colors">Як це працює</a>
                        <a href="#faq" className="hover:text-brand-cyan transition-colors">FAQ</a>
                    </nav>

                    <button 
                        onClick={onOpenApp}
                        className="px-4 py-2 rounded-xl bg-brand-cyan text-black font-orbitron font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95"
                    >
                        Відкрити Термінал ⚡
                    </button>
                </div>
            </header>

            <main>
                {/* HERO SECTION */}
                <section className="px-4 pt-16 pb-20 text-center max-w-4xl mx-auto relative">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[11px] font-bold uppercase tracking-widest mb-6">
                            <ZapIcon className="w-3.5 h-3.5" /> Next-Gen AI Crypto Terminal
                        </span>

                        <h1 className="font-orbitron font-black text-3xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-none mb-6">
                            Нейронний Асистент <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-teal-300 to-purple-400">
                                Для Торгівлі Криптою
                            </span>
                        </h1>

                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8">
                            Аналіз 1000+ пар у реальному часі, автономний моніторинг китів, автоматичні торгові сигнали та Telegram-інтеграція у кіберпанк-інтерфейсі.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button 
                                onClick={onOpenApp}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-cyan text-black font-orbitron font-extrabold text-sm uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_30px_rgba(0,240,255,0.5)] active:scale-95 flex items-center justify-center gap-2"
                            >
                                🚀 Запустити Термінал Зараз
                            </button>
                            <a 
                                href="https://t.me/storkcrypto" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                Telegram Спільнота <ArrowUpRightIcon className="w-4 h-4 text-brand-cyan" />
                            </a>
                        </div>
                    </motion.div>

                    {/* Preview Mockup Card */}
                    <div className="mt-12 p-3 sm:p-4 rounded-3xl bg-gradient-to-b from-white/10 to-black/80 border border-white/15 shadow-2xl relative overflow-hidden">
                        <div className="aspect-video rounded-2xl bg-[#050b14] border border-white/10 p-4 flex flex-col justify-between text-left relative">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span className="text-xs text-slate-400 font-mono ml-2">STORKCRYPTO_NEURAL_LINK_v4.2</span>
                                </div>
                                <span className="text-xs text-brand-green font-bold flex items-center gap-1">
                                    ● LIVE BINANCE FEED
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] text-slate-400">BTC/USDT</p>
                                    <p className="font-bold text-sm text-brand-green">$68,450.00 (+3.4%)</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] text-slate-400">AI SIGNAL</p>
                                    <p className="font-bold text-sm text-brand-cyan">LONG (94% CONF)</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] text-slate-400">WHALE FLOW</p>
                                    <p className="font-bold text-sm text-purple-400">+$14.2M INFLOW</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] text-slate-400">MARKET BIAS</p>
                                    <p className="font-bold text-sm text-emerald-400">EXTREME BULLISH</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-xs text-brand-cyan font-mono flex items-center justify-between">
                                <span>🎯 AI Target Locked: BTC Breakout Target $71,200</span>
                                <span className="font-bold uppercase">READY</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section id="features" className="py-20 px-4 bg-slate-950/60 border-t border-white/10">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="font-orbitron font-bold text-2xl sm:text-4xl text-white uppercase mb-3">
                                Ключові Можливості
                            </h2>
                            <p className="text-slate-400 text-sm max-w-xl mx-auto">
                                Повний стек інструментів для професійного криптотрейдингу в одному терміналі
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-cyan/50 transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center mb-4">
                                    <ActivityIcon className="w-6 h-6 text-brand-cyan" />
                                </div>
                                <h3 className="font-orbitron font-bold text-lg text-white mb-2">AI Торгові Сигнали</h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Алгоритмічний аналіз ринку 24/7. Автоматична генерація рівнів входу, TP/SL та пояснення ланцюжка міркувань штучного інтелекту.
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-cyan/50 transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mb-4">
                                    <RadarIcon className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="font-orbitron font-bold text-lg text-white mb-2">Whale Radar & Flow</h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Відстеження транзакцій на мільйони доларів у реальному часі. Виявлення накопичення та скидання монет великими гравцями.
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-cyan/50 transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4">
                                    <ShieldIcon className="w-6 h-6 text-amber-400" />
                                </div>
                                <h3 className="font-orbitron font-bold text-lg text-white mb-2">Sentinel Security</h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Захист депозиту від аномальної волатильності, моніторинг ліквідацій та сповіщення про ризикові ринкові фази.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="py-20 px-4 max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-orbitron font-bold text-2xl sm:text-4xl text-white uppercase mb-3">
                            Як Це Працює
                        </h2>
                        <p className="text-slate-400 text-sm">3 прості кроки для старту роботи з терміналом</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center relative">
                            <div className="w-10 h-10 rounded-full bg-brand-cyan text-black font-orbitron font-black text-lg flex items-center justify-center mx-auto mb-4">1</div>
                            <h3 className="font-bold text-white text-base mb-2">Відкрий у Telegram</h3>
                            <p className="text-xs text-slate-400">Запусти StorkCrypto WebApp безпосередньо в Telegram або у будь-якому браузері.</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center relative">
                            <div className="w-10 h-10 rounded-full bg-brand-cyan text-black font-orbitron font-black text-lg flex items-center justify-center mx-auto mb-4">2</div>
                            <h3 className="font-bold text-white text-base mb-2">Підключи Гаманець</h3>
                            <p className="text-xs text-slate-400">Авторизуйся через TonConnect, MetaMask чи Telegram Wallet без передачи приватних ключів.</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center relative">
                            <div className="w-10 h-10 rounded-full bg-brand-cyan text-black font-orbitron font-black text-lg flex items-center justify-center mx-auto mb-4">3</div>
                            <h3 className="font-bold text-white text-base mb-2">Отримуй Сигнали</h3>
                            <p className="text-xs text-slate-400">Аналізуй графіки, отримуй сповіщення та виконуй прибуткові угоди з підтримкою AI.</p>
                        </div>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section id="faq" className="py-20 px-4 bg-slate-950/80 border-t border-white/10">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white uppercase text-center mb-12">
                            Часті Запитання (FAQ)
                        </h2>

                        <div className="space-y-4">
                            {faqItems.map((item, index) => (
                                <div key={index} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                                    <button 
                                        onClick={() => toggleFaq(index)}
                                        className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between hover:text-brand-cyan transition-colors"
                                    >
                                        <span>{item.q}</span>
                                        <span className="text-brand-cyan text-lg">{activeFaq === index ? '−' : '+'}</span>
                                    </button>
                                    {activeFaq === index && (
                                        <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-white/10 py-10 px-4 bg-[#020617] text-slate-400 text-xs">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <span className="font-orbitron font-bold text-white text-sm">STORKCRYPTO NEURAL LINK</span>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-brand-cyan">v4.2</span>
                    </div>

                    <p className="text-center md:text-left text-[11px]">
                        © 2026 StorkCrypto Neural Link. Всі права захищено. Торгівля криптовалютою пов'язана з ризиками.
                    </p>

                    <button onClick={onOpenApp} className="text-brand-cyan hover:underline font-bold">
                        Запустити Термінал →
                    </button>
                </div>
            </footer>
        </div>
    );
};
