import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { getTranslation } from '../../utils/translations';
import { BookIcon, SearchIcon, ChevronRightIcon, ShieldIcon, CheckIcon, ZapIcon, PlayIcon, SparklesIcon } from '../icons';
import { triggerHaptic } from '../../utils/haptics';
import { AcademyTerm, AcademyCategory, Language } from '../../types';
import { ChartPattern } from '../ChartPatterns';
import QuizModal from '../QuizModal';
import UpgradeBanner from '../UpgradeBanner';
import { TacticalBackground } from '../TacticalBackground';
import { ACADEMY_DATABASE } from '../MediaContent';
import { HelpIndicator } from '../HelpIndicator';
import { VideoLessonModal } from '../VideoLessonModal';

const STORAGE_KEY = 'stork_academy_completed_ids';

const QUIZZES: Record<Language, Record<string, { question: string; options: string[]; answer: string }>> = {
    en: {
        blockchain_basics: { question: "Can a central bank reverse or delete confirmed blockchain transactions?", options: ["No, blockchain records are immutable", "Yes, with a court order"], answer: "No, blockchain records are immutable" },
        bitcoin_intro: { question: "What is the maximum hard cap of Bitcoin ever to exist?", options: ["21,000,000 BTC", "100,000,000 BTC"], answer: "21,000,000 BTC" },
        account_security_2fa: { question: "Which 2FA method is most secure against SIM swapping?", options: ["Hardware Key / Authenticator App", "SMS Text Message"], answer: "Hardware Key / Authenticator App" },
        p2p_trading_guide: { question: "When should you release crypto in a P2P trade?", options: ["Only after checking funds in bank app", "Immediately after buyer sends a screenshot"], answer: "Only after checking funds in bank app" },
        spot_vs_futures: { question: "Does spot trading have a liquidation risk without leverage?", options: ["No, you own the underlying asset", "Yes, upon 10% drop"], answer: "No, you own the underlying asset" },
        orders_guide: { question: "Which order type ensures you never buy above your target limit price?", options: ["Limit Order", "Market Order"], answer: "Limit Order" },
        pinbar_hammer: { question: "What does a long lower wick on a hammer indicate?", options: ["Aggressive buyer price rejection", "Seller domination"], answer: "Aggressive buyer price rejection" },
        wallets_storage: { question: "Where should you store your 12-24 word secret seed phrase?", options: ["Offline on paper or metal", "In notes / cloud screenshot"], answer: "Offline on paper or metal" },
        fomo_psychology: { question: "What should a trader do when an asset has already pumped 200%?", options: ["Wait for pullback / seek another setup", "Ape in with maximum leverage"], answer: "Wait for pullback / seek another setup" },
        rsi: { question: "Is RSI > 70 considered Overbought or Oversold?", options: ["Overbought", "Oversold"], answer: "Overbought" },
        macd: { question: "What does a Golden Cross suggest?", options: ["Bullish Entry", "Bearish Exit"], answer: "Bullish Entry" },
        orderblock: { question: "What does Order Block (OB) act as?", options: ["Strong Support/Resistance", "Irrelevant Price Point"], answer: "Strong Support/Resistance" },
        fvg: { question: "What does FVG represent in price action?", options: ["Price Imbalance / Gap", "Perfect Volume Balance"], answer: "Price Imbalance / Gap" },
        hns: { question: "Head & Shoulders is what type of pattern?", options: ["Reversal", "Continuation"], answer: "Reversal" },
        bullflag: { question: "Bull Flag signals potential movement in which direction?", options: ["Upward Continuation", "Downward Reversal"], answer: "Upward Continuation" },
        onepercentrule: { question: "How much capital should you risk per single trade?", options: ["1% - 2% of total capital", "25% - 50% of total capital"], answer: "1% - 2% of total capital" },
        smc: { question: "What do Smart Money Concepts primarily track?", options: ["Institutional order flow & liquidity", "Random price noise"], answer: "Institutional order flow & liquidity" },
        stablecoins_intro: { question: "What primarily backs fiat-pegged stablecoins like USDT?", options: ["US Treasuries & Cash Reserves", "Zero Collateral"], answer: "US Treasuries & Cash Reserves" },
        p2p_scam_prevention: { question: "When should you release crypto in P2P escrow?", options: ["Only when money cleared in bank balance", "When buyer claims payment was sent"], answer: "Only when money cleared in bank balance" },
        api_keys_security: { question: "Which permission MUST be disabled on exchange API keys?", options: ["Withdrawal Permissions", "Read Permissions"], answer: "Withdrawal Permissions" },
        risk_reward_calc: { question: "What is the recommended minimum Risk-to-Reward (R:R)?", options: ["1:2 or 1:3", "1:0.5"], answer: "1:2 or 1:3" }
    },
    ua: {
        blockchain_basics: { question: "Чи може окремий банк або уряд видалити транзакцію в блокчейні?", options: ["Ні, транзакції незворотні та захищені", "Так, за спеціальним запитом"], answer: "Ні, транзакції незворотні та захищені" },
        bitcoin_intro: { question: "Яка максимальна фіксована кількість монет Bitcoin існуватиме?", options: ["21,000,000 BTC", "100,000,000 BTC"], answer: "21,000,000 BTC" },
        account_security_2fa: { question: "Який метод 2FA найбільш захищений від перехоплення SIM-карти?", options: ["Апаратний ключ / Додаток-автентифікатор", "SMS повідомлення"], answer: "Апаратний ключ / Додаток-автентифікатор" },
        p2p_trading_guide: { question: "Коли слід натискати 'Підтвердити отримання' в P2P угоді?", options: ["Тільки після перевірки балансу в банківському додатку", "Одразу як покупець скинув чек у чат"], answer: "Тільки після перевірки балансу в банківському додатку" },
        spot_vs_futures: { question: "Чи існує ризик ліквідації депозиту на звичайному спотовому ринку?", options: ["Ні, ви володієте реальною монетою", "Так, при падінні ціни на 10%"], answer: "Ні, ви володієте реальною монетою" },
        orders_guide: { question: "Який тип ордера гарантує вхід за точно обраною вами ціною?", options: ["Limit-ордер", "Market-ордер"], answer: "Limit-ордер" },
        pinbar_hammer: { question: "Що означає довгий нижній ґніт (тінь) у свічці Молот (Пін-бар)?", options: ["Агресивне відхилення ціни покупцями", "Перевагу продавців"], answer: "Агресивне відхилення ціни покупцями" },
        wallets_storage: { question: "Де безпечно зберігати сід-фразу з 12-24 слів?", options: ["Офлайн на папері або металі", "У нотатках або фото на телефоні"], answer: "Офлайн на папері або металі" },
        fomo_psychology: { question: "Що робити, якщо актив уже виріс на +300% (FOMO)?", options: ["Чекати корекції або шукати іншу угоду", "Заходити на всю котлету на піку"], answer: "Чекати корекції або шукати іншу угоду" },
        rsi: { question: "Показник RSI > 70 означає Перекупленість чи Перепроданість?", options: ["Перекупленість", "Перепроданість"], answer: "Перекупленість" },
        macd: { question: "На що вказує 'Золотий хрест'?", options: ["Вхід у лонг", "Вихід з позиції"], answer: "Вхід у лонг" },
        orderblock: { question: "Чим виступає Ордер Блок (OB)?", options: ["Підтримкою/Опором", "Жодним чином не впливає"], answer: "Підтримкою/Опором" },
        fvg: { question: "Що таке Імбаланс (FVG)?", options: ["Неефективність ціни / Розрив", "Рівномірний розподіл купівель"], answer: "Неефективність ціни / Розрив" },
        hns: { question: "Який тип патерну 'Голова і Плечі'?", options: ["Патерн розвороту", "Патерн продовження тренду"], answer: "Патерн розвороту" },
        bullflag: { question: "Бичачий Прапор сигналізує про:", options: ["Продовження росту", "Розворот тренду вниз"], answer: "Продовження росту" },
        onepercentrule: { question: "Який максимальний відсоток депозиту радять ризикувати в одній угоді?", options: ["1% - 2% капіталу", "25% - 50% капіталу"], answer: "1% - 2% капіталу" },
        smc: { question: "Що в першу чергу відстежують концепції Smart Money (SMC)?", options: ["Інституційні пули ліквідності та ордери", "Випадкові коливання ціни"], answer: "Інституційні пули ліквідності та ордери" },
        stablecoins_intro: { question: "Чим підкріплений стейблкоїн USDT (Tether)?", options: ["Фіатними резервами та держоблігаціями США", "Тільки обіцянками без забезпечення"], answer: "Фіатними резервами та держоблігаціями США" },
        p2p_scam_prevention: { question: "Що робити, якщо покупець у P2P просить відпустити крипту без грошей на картці?", options: ["Нізащо не підтверджувати та відкрити апеляцію", "Підтвердити і повірити покупцю"], answer: "Нізащо не підтверджувати та відкрити апеляцію" },
        api_keys_security: { question: "Який дозвіл обов'язково вимикати при створенні біржових API ключів?", options: ["Withdrawal (Виведення коштів)", "Read-Only (Читання)"], answer: "Withdrawal (Виведення коштів)" },
        risk_reward_calc: { question: "Яке рекомендоване співвідношення Ризик/Прибуток (Risk/Reward)?", options: ["Мінімум 1:2 або 1:3", "1:0.5 (ризик більший за прибуток)"], answer: "Мінімум 1:2 або 1:3" }
    },
    pl: {
        blockchain_basics: { question: "Czy bank centralny może cofnąć potwierdzoną transakcję w blockchainie?", options: ["Nie, zapisy są niezmienne", "Tak, na wniosek sądu"], answer: "Nie, zapisy są niezmienne" },
        bitcoin_intro: { question: "Jaki jest ścisły maksymalny limit podaży Bitcoin?", options: ["21,000,000 BTC", "100,000,000 BTC"], answer: "21,000,000 BTC" },
        account_security_2fa: { question: "Która metoda 2FA jest najbezpieczniejsza przed atakiem SIM-swap?", options: ["Klucz sprzętowy / Aplikacja Authenticator", "Wiadomości SMS"], answer: "Klucz sprzętowy / Aplikacja Authenticator" },
        p2p_trading_guide: { question: "Kiedy należy zwolnić krypto w transakcji P2P?", options: ["Dopiero po sprawdzeniu salda w aplikacji banku", "Od razu po wiadomości od kupującego"], answer: "Dopiero po sprawdzeniu salda w aplikacji banku" },
        spot_vs_futures: { question: "Czy na rynku Spot bez dźwigni istnieje ryzyko likwidacji?", options: ["Nie, posiadasz rzeczywistą monetę", "Tak, przy spadku o 10%"], answer: "Nie, posiadasz rzeczywistą monetę" },
        orders_guide: { question: "Który typ zlecenia gwarantuje zakup po ustalonej przez Ciebie cenie?", options: ["Zlecenie Limit", "Zlecenie Market"], answer: "Zlecenie Limit" },
        pinbar_hammer: { question: "Co oznacza długi dolny knot świecy młota?", options: ["Agresywne odrzucenie ceny przez kupujących", "Dominację sprzedających"], answer: "Agresywne odrzucenie ceny przez kupujących" },
        wallets_storage: { question: "Gdzie bezpiecznie przechowywać frazę seed?", options: ["Offline na papierze lub tytanie", "W chmurze lub notatkach telefonu"], answer: "Offline na papierze lub tytanie" },
        fomo_psychology: { question: "Co powinien zrobić trader, gdy aktywo wzrosło już o 300% (FOMO)?", options: ["Poczekać na korektę lub szukać nowego setupu", "Kupować na samej górce z dźwignią"], answer: "Poczekać na korektę lub szukać nowego setupu" },
        rsi: { question: "Czy RSI > 70 oznacza Wykupienie czy Wyprzedanie?", options: ["Wykupienie", "Wyprzedanie"], answer: "Wykupienie" },
        macd: { question: "Co sugeruje Złoty Krzyż?", options: ["Wejście (Bullish)", "Wyjście (Bearish)"], answer: "Wejście (Bullish)" },
        orderblock: { question: "Czym jest Order Block (OB)?", options: ["Silnym wsparciem/oporem", "Nieistotnym punktem"], answer: "Silnym wsparciem/oporem" },
        fvg: { question: "Co FVG reprezentuje w akcji cenowej?", options: ["Nierównowagę cenową / Lukę", "Idealny bilans wolumenu"], answer: "Nierównowagę cenową / Lukę" },
        hns: { question: "Jakim typem formacji jest Głowa z Ramionami?", options: ["Odwrócenia", "Kontynuacji"], answer: "Odwrócenia" },
        bullflag: { question: "W jakim kierunku sugeruje ruch Flaga Byka?", options: ["Kontynuacja wzrostów", "Odwrócenie spadków"], answer: "Kontynuacja wzrostów" },
        onepercentrule: { question: "Ile kapitału należy maksymalnie ryzykować w jednej transakcji?", options: ["1% - 2% całego kapitału", "25% - 50% całego kapitału"], answer: "1% - 2% całego kapitału" },
        smc: { question: "Co głównie śledzą koncepcje Smart Money (SMC)?", options: ["Instytucjonalne pule płynności i zlecenia", "Przypadkowy szum rynkowy"], answer: "Instytucjonalne pule płynności i zlecenia" },
        stablecoins_intro: { question: "Czym zabezpieczony jest stablecoin USDT?", options: ["Rezerwami fiat i obligacjami USA", "Brak zabezpieczenia"], answer: "Rezerwami fiat i obligacjami USA" },
        p2p_scam_prevention: { question: "Kiedy zwolnić środki krypto w P2P?", options: ["Dopiero po wpływie pieniędzy na konto", "Na prośbę kupującego"], answer: "Dopiero po wpływie pieniędzy na konto" },
        api_keys_security: { question: "Jakie uprawnienie należy zawsze wyłączyć w kluczach API?", options: ["Wypłaty (Withdrawal)", "Odczyt (Read-Only)"], answer: "Wypłaty (Withdrawal)" },
        risk_reward_calc: { question: "Jaki jest zalecany minimalny stosunek Risk-to-Reward?", options: ["Minimum 1:2 lub 1:3", "1:0.5"], answer: "Minimum 1:2 lub 1:3" }
    }
};

const MediaScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { settings, selectedAcademyCategory, addXp, grantXp, updateQuestProgress, showToast } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);

    const [filter, setFilter] = useState<AcademyCategory>(
        selectedAcademyCategory || 'BASICS'
    );
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [activeDrillTerm, setActiveDrillTerm] = useState<AcademyTerm | null>(null);
    const [activeVideoLesson, setActiveVideoLesson] = useState<AcademyTerm | null>(null);

    // Interactive Inline Express Quiz state
    const [activeInlineQuizId, setActiveInlineQuizId] = useState<string | null>(null);
    const [inlineQuizError, setInlineQuizError] = useState<boolean | null>(null);

    // Progress persistence
    const [completedIds, setCompletedIds] = useState<Record<string, boolean>>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    // Sync progress to localStorage
    const markTermCompleted = useCallback((termId: string) => {
        setCompletedIds(prev => {
            const updated = { ...prev, [termId]: true };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
        });
    }, []);

    // Escape listener for a11y
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (activeVideoLesson) {
                    setActiveVideoLesson(null);
                } else if (activeDrillTerm) {
                    setActiveDrillTerm(null);
                } else if (activeInlineQuizId) {
                    setActiveInlineQuizId(null);
                } else {
                    onClose?.();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeVideoLesson, activeDrillTerm, activeInlineQuizId, onClose]);

    useEffect(() => {
        if (selectedAcademyCategory) {
            setFilter(selectedAcademyCategory);
        }
    }, [selectedAcademyCategory]);

    const currentLanguage = (settings?.language === 'ua' || settings?.language === 'pl') ? settings.language : 'en';
    const currentContent = useMemo(() => {
        return ACADEMY_DATABASE?.[currentLanguage] || ACADEMY_DATABASE?.['en'] || [];
    }, [currentLanguage]);

    const filteredItems = useMemo(() => {
        return (currentContent || []).filter(item => {
            const matchesFilter = item.category === filter;
            const matchesSearch = (item.term || '').toLowerCase().includes((search || '').toLowerCase()) ||
                                  (item.definition || '').toLowerCase().includes((search || '').toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [currentContent, filter, search]);

    // Overall Progress Calculation
    const totalTermsCount = currentContent.length || 1;
    const completedCount = useMemo(() => {
        return currentContent.filter(item => completedIds[item.id]).length;
    }, [currentContent, completedIds]);
    const progressPercent = Math.min(100, Math.round((completedCount / totalTermsCount) * 100));

    // Dynamic Quiz generator for any term
    const getQuizForTerm = useCallback((item: AcademyTerm) => {
        const specific = QUIZZES[currentLanguage]?.[item.id] || QUIZZES['en']?.[item.id];
        if (specific) return specific;

        if (item.category === 'PATTERNS') {
            const isBull = item.term.toLowerCase().includes('bull') || 
                           item.term.toLowerCase().includes('hammer') || 
                           item.term.toLowerCase().includes('cup') || 
                           item.term.toLowerCase().includes('bottom') ||
                           item.term.toLowerCase().includes('молот') ||
                           item.term.toLowerCase().includes('бичач');
            return {
                question: currentLanguage === 'ua' 
                    ? `Який потенційний напрямок руху сигналізує "${item.term}"?` 
                    : currentLanguage === 'pl'
                    ? `Jaki kierunek ruchu sugeruje formacja "${item.term}"?`
                    : `What direction does the "${item.term}" pattern typically indicate?`,
                options: currentLanguage === 'ua'
                    ? (isBull ? ["Висхідний (Бичачий)", "Низхідний (Ведмежий)"] : ["Низхідний (Ведмежий)", "Висхідний (Бичачий)"])
                    : currentLanguage === 'pl'
                    ? (isBull ? ["Wzrostowy (Byczy)", "Spadkowy (Niedźwiedzi)"] : ["Spadkowy (Niedźwiedzi)", "Wzrostowy (Byczy)"])
                    : (isBull ? ["Bullish Continuation", "Bearish Breakdown"] : ["Bearish Reversal", "Bullish Surge"]),
                answer: currentLanguage === 'ua' ? (isBull ? "Висхідний (Бичачий)" : "Низхідний (Ведмежий)")
                    : currentLanguage === 'pl' ? (isBull ? "Wzrostowy (Byczy)" : "Spadkowy (Niedźwiedzi)")
                    : (isBull ? "Bullish Continuation" : "Bearish Reversal")
            };
        }

        return {
            question: currentLanguage === 'ua'
                ? `Яке головне правило стосується теми "${item.term}"?`
                : currentLanguage === 'pl'
                ? `Jaka jest kluczowa zasada dla "${item.term}"?`
                : `What is the core rule for "${item.term}"?`,
            options: currentLanguage === 'ua'
                ? ["Дотримуватися ризик-менеджменту та верифікації", "Ігнорувати правила безпеки"]
                : currentLanguage === 'pl'
                ? ["Stosować zarządzanie ryzykiem i weryfikację", "Ignorować zasady bezpieczeństwa"]
                : ["Maintain strict risk management & verification", "Ignore security guidelines"],
            answer: currentLanguage === 'ua' ? "Дотримуватися ризик-менеджменту та верифікації"
                : currentLanguage === 'pl' ? "Stosować zarządzanie ryzykiem i weryfikację"
                : "Maintain strict risk management & verification"
        };
    }, [currentLanguage]);

    const handleInlineOptionClick = (item: AcademyTerm, chosen: string, correct: string) => {
        triggerHaptic('medium');
        if (chosen === correct) {
            setInlineQuizError(false);
            markTermCompleted(item.id);
            addXp(50);
            grantXp(50, `Academy Quiz: ${item.term}`);
            updateQuestProgress('ACADEMY', 1);
            showToast(t('academy.correct_toast'));
            triggerHaptic('success');
            setTimeout(() => {
                setActiveInlineQuizId(null);
                setInlineQuizError(null);
            }, 600);
        } else {
            setInlineQuizError(true);
            triggerHaptic('error');
            setTimeout(() => setInlineQuizError(null), 1500);
        }
    };

    const categoriesList: { id: AcademyCategory; label: string; icon: string }[] = [
        { id: 'BASICS', label: t('academy.basics') || 'Основи', icon: '🚀' },
        { id: 'TRADING', label: t('academy.trading') || 'Трейдинг', icon: '📈' },
        { id: 'PATTERNS', label: t('academy.patterns') || 'Патерни', icon: '🕯️' },
        { id: 'SECURITY', label: t('academy.security') || 'Безпека', icon: '🛡️' },
        { id: 'PSYCHOLOGY', label: t('academy.psychology') || 'Психологія', icon: '🧠' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="region"
            aria-label={t('academy.title')}
            className="fixed inset-0 z-[110] bg-brand-bg flex flex-col overflow-hidden h-[100dvh] w-full"
        >
            <TacticalBackground />
            
            {/* Top Navigation Bar */}
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose?.(); }}
                        aria-label={t('common.close')}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 hover:border-brand-cyan/40 hover:text-white transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
                    >
                        <ChevronRightIcon className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="font-orbitron text-base sm:text-lg font-black text-white tracking-wider uppercase italic">
                                {t('academy.title')}
                            </h1>
                            <HelpIndicator id="academy_hub" />
                        </div>
                        <p className="text-[9px] text-brand-cyan font-mono uppercase tracking-widest flex items-center gap-1">
                            <span>StorkCrypto Academy</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-emerald-400 font-bold">{t('academy.badge_subtitle') || 'Офіційна Програма'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[9px] font-mono text-brand-purple font-bold">
                            +{completedCount * 50} XP
                        </span>
                        <span className="text-[8px] text-slate-400 font-mono">
                            {completedCount}/{totalTermsCount}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple shadow-xl">
                        <BookIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 pt-4 pb-32 relative z-10">
                <UpgradeBanner />

                {/* Interactive Academy Progress Card */}
                <div className="bg-brand-card/70 border border-brand-border/60 rounded-2xl p-4 mb-6 shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ZapIcon className="w-4 h-4 text-brand-cyan animate-pulse" />
                            <span className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">
                                {t('academy.progress')}
                            </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-brand-cyan">
                            {completedCount} / {totalTermsCount} ({progressPercent}%)
                        </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-2 rounded-full bg-black/60 border border-white/5 overflow-hidden p-0.5">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-emerald transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2.5 text-[9px] font-mono text-slate-400">
                        <span>{completedCount} {t('academy.lessons_completed')}</span>
                        <span className="text-brand-purple font-bold">+{completedCount * 50} XP EARNED</span>
                    </div>
                </div>

                {/* Responsive Category Navigation Tabs */}
                <div 
                    role="tablist"
                    aria-label="Academy categories"
                    className="flex sm:grid sm:grid-cols-5 gap-1.5 overflow-x-auto no-scrollbar bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-6 shadow-inner"
                >
                    {categoriesList.map(cat => {
                        const isSelected = filter === cat.id;
                        return (
                            <button
                                key={cat.id}
                                role="tab"
                                aria-selected={isSelected}
                                onClick={() => { triggerHaptic('selection'); setFilter(cat.id); }}
                                className={`shrink-0 sm:shrink py-3 px-3 rounded-xl text-[9px] sm:text-[10px] font-black font-orbitron transition-all uppercase tracking-wider text-center flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${
                                    isSelected 
                                        ? 'bg-brand-card text-brand-cyan shadow-xl border border-brand-cyan/30' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <span className="text-xs">{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        id="academy-search-input"
                        type="text" 
                        placeholder={t('academy.search_placeholder')}
                        aria-label={t('academy.search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-brand-card/40 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-all font-mono text-xs shadow-inner"
                    />
                    {search && (
                        <button 
                            onClick={() => setSearch('')}
                            aria-label="Очистити пошук"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white bg-white/5 rounded-md px-2 py-1"
                        >
                            ESC
                        </button>
                    )}
                </div>

                {/* Lesson List */}
                <div className="space-y-3.5">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-white/10 rounded-2xl">
                            {currentLanguage === 'ua' ? 'Уроків за цим фільтром не знайдено' : 'No lessons found for this query'}
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const isCompleted = !!completedIds[item.id];
                            const isExpanded = expandedId === item.id;
                            const isInlineQuiz = activeInlineQuizId === item.id;
                            const quizData = getQuizForTerm(item);

                            return (
                                <div 
                                    key={item.id} 
                                    className={`bg-brand-card/60 border rounded-2xl overflow-hidden transition-all duration-300 ${
                                        isExpanded 
                                            ? 'border-brand-cyan shadow-[0_0_25px_rgba(0,240,255,0.12)]' 
                                            : isCompleted
                                            ? 'border-brand-emerald/30 hover:border-brand-emerald/50'
                                            : 'border-white/5 hover:border-brand-cyan/30'
                                    }`}
                                >
                                    {/* Card Header Accordion Trigger */}
                                    <button
                                        type="button"
                                        aria-expanded={isExpanded}
                                        onClick={() => { 
                                            triggerHaptic('selection'); 
                                            setExpandedId(isExpanded ? null : item.id);
                                            if (isInlineQuiz && isExpanded) {
                                                setActiveInlineQuizId(null);
                                            }
                                        }}
                                        className="w-full p-4 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/70"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden pr-2">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                                                isExpanded 
                                                    ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' 
                                                    : isCompleted
                                                    ? 'bg-brand-emerald/10 border-brand-emerald/40 text-brand-emerald'
                                                    : 'bg-white/5 border-white/10 text-slate-500'
                                            }`}>
                                                <ChevronRightIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className={`font-bold text-xs sm:text-sm tracking-wide truncate ${isExpanded ? 'text-brand-cyan' : isCompleted ? 'text-slate-200' : 'text-white'}`}>
                                                        {item.term}
                                                    </h4>
                                                    {item.videoData && (
                                                        <span className="text-[8px] font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/30 flex items-center gap-1 shrink-0">
                                                            <PlayIcon className="w-2.5 h-2.5 fill-current" />
                                                            {item.videoData.duration}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">
                                                    {t(`academy.${item.category.toLowerCase()}`)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {isCompleted ? (
                                                <span className="text-[9px] font-black text-brand-emerald bg-brand-emerald/10 px-2.5 py-1 rounded-lg border border-brand-emerald/30 flex items-center gap-1">
                                                    <CheckIcon className="w-3 h-3" />
                                                    ✓ {currentLanguage === 'ua' ? 'ВИВЧЕНО' : currentLanguage === 'pl' ? 'UKOŃCZONE' : 'MASTERED'}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded-lg border border-brand-purple/30">
                                                    +50 XP
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded Lesson Drawer */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="px-4 pb-5 bg-black/30 border-t border-white/5"
                                            >
                                                <div className="pt-4 space-y-4">
                                                    {/* In-App Video Banner Callout if Lesson has Video */}
                                                    {item.videoData && (
                                                        <div className="rounded-2xl p-4 bg-gradient-to-r from-yellow-500/10 via-brand-purple/10 to-brand-cyan/10 border border-yellow-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-[9px] font-mono font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                                                                        <span>🎬</span>
                                                                        <span>{item.videoData.sourceName || 'Binance Academy'}</span>
                                                                    </span>
                                                                    <span className="text-[9px] font-mono text-slate-400">
                                                                        ⏱️ {item.videoData.duration}
                                                                    </span>
                                                                </div>
                                                                <h5 className="text-xs font-bold text-white font-orbitron">
                                                                    {item.videoData.title || item.term}
                                                                </h5>
                                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                    Відео відтворюється всередині додатка без виходу в браузер
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    triggerHaptic('medium');
                                                                    setActiveVideoLesson(item);
                                                                }}
                                                                aria-label={`Дивитися відео-урок ${item.term}`}
                                                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-orbitron font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                                                            >
                                                                <PlayIcon className="w-3.5 h-3.5 fill-current" />
                                                                <span>{t('academy.watch_video')}</span>
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Chart Visualization if Pattern */}
                                                    {item.visualType && item.visualType !== 'NONE' && (
                                                        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                                                            <ChartPattern type={item.visualType} />
                                                        </div>
                                                    )}

                                                    {/* Definition */}
                                                    <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
                                                        {item.definition}
                                                    </p>

                                                    {/* Practical Trade Example */}
                                                    {item.example && (
                                                        <div className="bg-brand-cyan/5 rounded-xl p-3 border-l-2 border-brand-cyan">
                                                            <p className="text-[9px] text-brand-cyan uppercase font-bold tracking-wider mb-0.5">
                                                                {currentLanguage === 'ua' ? 'ПРАКТИЧНИЙ ПРИКЛАД:' : 'PRACTICAL EXAMPLE:'}
                                                            </p>
                                                            <p className="text-xs text-slate-300 italic font-mono">
                                                                "{item.example}"
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Completed Status State or Practice Mode */}
                                                    {isCompleted && !isInlineQuiz && (
                                                        <div className="p-3 rounded-xl border border-brand-emerald/30 bg-brand-emerald/10 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <CheckIcon className="w-4 h-4 text-brand-emerald" />
                                                                <span className="text-xs font-bold text-brand-emerald uppercase">
                                                                    {t('academy.completed')}
                                                                </span>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    triggerHaptic('selection');
                                                                    setActiveInlineQuizId(item.id);
                                                                }}
                                                                className="text-[10px] text-slate-300 hover:text-white underline font-mono uppercase"
                                                            >
                                                                {t('academy.practice_again')}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Interactive Inline Express Quiz */}
                                                    {isInlineQuiz ? (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="p-4 rounded-xl border border-brand-purple/40 bg-brand-purple/5 space-y-3"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[9px] font-mono font-bold text-brand-purple uppercase tracking-wider flex items-center gap-1">
                                                                    <ZapIcon className="w-3 h-3" />
                                                                    {t('academy.express_quiz')}
                                                                </span>
                                                                <button 
                                                                    onClick={() => setActiveInlineQuizId(null)}
                                                                    className="text-[10px] text-slate-400 hover:text-white"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>

                                                            <p className="text-xs font-bold text-white font-mono">
                                                                {quizData.question}
                                                            </p>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                                                {quizData.options.map((option) => (
                                                                    <button
                                                                        key={option}
                                                                        onClick={() => handleInlineOptionClick(item, option, quizData.answer)}
                                                                        className="py-3 px-3.5 rounded-xl bg-white/5 hover:bg-brand-purple/20 border border-white/10 hover:border-brand-purple text-xs font-mono text-white text-left transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                                                                    >
                                                                        {option}
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            {inlineQuizError && (
                                                                <p className="text-[10px] text-brand-danger font-mono text-center animate-bounce">
                                                                    {t('academy.incorrect_toast')}
                                                                </p>
                                                            )}
                                                        </motion.div>
                                                    ) : !isCompleted && (
                                                        /* Dual-Mode Action Buttons: Express Quiz OR Tactical 15s Drill */
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    triggerHaptic('selection');
                                                                    setActiveInlineQuizId(item.id);
                                                                }}
                                                                className="w-full py-3.5 px-4 bg-brand-purple hover:bg-brand-purple/80 text-white font-black font-orbitron rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                                                            >
                                                                <ZapIcon className="w-4 h-4" />
                                                                {t('academy.express_quiz')}
                                                            </button>

                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    triggerHaptic('medium');
                                                                    setActiveDrillTerm(item);
                                                                }}
                                                                className="w-full py-3.5 px-4 bg-white text-black hover:bg-slate-200 font-black font-orbitron rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                                            >
                                                                <ShieldIcon className="w-4 h-4 text-black" />
                                                                {t('academy.tactical_drill')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* In-App Video Lesson Modal */}
            {activeVideoLesson && (
                <VideoLessonModal 
                    lesson={activeVideoLesson}
                    isCompleted={!!completedIds[activeVideoLesson.id]}
                    onClose={() => setActiveVideoLesson(null)}
                    onMarkCompleted={(termId) => {
                        markTermCompleted(termId);
                    }}
                />
            )}

            {/* 15s Timed Tactical Drill Modal */}
            {activeDrillTerm && (
                <QuizModal 
                    term={activeDrillTerm} 
                    onClose={() => setActiveDrillTerm(null)} 
                    onSuccess={(termId) => {
                        markTermCompleted(termId);
                    }}
                />
            )}
        </motion.div>
    );
};

export default MediaScreen;
