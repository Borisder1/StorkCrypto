import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { getTranslation } from '../../utils/translations';
import { BookIcon, SearchIcon, ChevronRightIcon, ShieldIcon, CheckIcon, ZapIcon } from '../icons';
import { triggerHaptic } from '../../utils/haptics';
import { AcademyTerm, Language } from '../../types';
import { ChartPattern } from '../ChartPatterns';
import QuizModal from '../QuizModal';
import UpgradeBanner from '../UpgradeBanner';
import { TacticalBackground } from '../TacticalBackground';
import { ACADEMY_DATABASE } from '../MediaContent';
import { HelpIndicator } from '../HelpIndicator';

const STORAGE_KEY = 'stork_academy_completed_ids';

const QUIZZES: Record<Language, Record<string, { question: string; options: string[]; answer: string }>> = {
    en: {
        rsi: { question: "Is RSI > 70 considered Overbought or Oversold?", options: ["Overbought", "Oversold"], answer: "Overbought" },
        macd: { question: "What does a Golden Cross suggest?", options: ["Bullish Entry", "Bearish Exit"], answer: "Bullish Entry" },
        ob: { question: "What does Order Block (OB) act as?", options: ["Strong Support/Resistance", "Irrelevant Price Point"], answer: "Strong Support/Resistance" },
        orderblock: { question: "What does Order Block (OB) act as?", options: ["Strong Support/Resistance", "Irrelevant Price Point"], answer: "Strong Support/Resistance" },
        fvg: { question: "What does FVG represent in price action?", options: ["Price Imbalance / Gap", "Perfect Volume Balance"], answer: "Price Imbalance / Gap" },
        hns: { question: "Head & Shoulders is what type of pattern?", options: ["Reversal", "Continuation"], answer: "Reversal" },
        bullflag: { question: "Bull Flag signals potential movement in which direction?", options: ["Upward Continuation", "Downward Reversal"], answer: "Upward Continuation" },
        fomo: { question: "What does FOMO stand for?", options: ["Fear Of Missing Out", "Future Options Market Order"], answer: "Fear Of Missing Out" },
        fud: { question: "What does FUD usually cause in traders?", options: ["Panic Selling", "Rational Hodling"], answer: "Panic Selling" },
        seed: { question: "Who should you share your secret seed phrase with?", options: ["Nobody", "StorkCrypto Support"], answer: "Nobody" },
        seedphrase: { question: "Who should you share your seed phrase with?", options: ["Nobody", "StorkCrypto Support"], answer: "Nobody" },
        coldwallet: { question: "Where does a Cold Wallet store private keys?", options: ["Offline on Hardware", "Online in Cloud"], answer: "Offline on Hardware" },
        coldstorage: { question: "Where does a Cold Wallet store private keys?", options: ["Offline on Hardware", "Online in Cloud"], answer: "Offline on Hardware" },
        '2fa': { question: "Which 2FA method is most secure against SIM swapping?", options: ["Hardware Key / Authenticator App", "SMS Text Message"], answer: "Hardware Key / Authenticator App" },
        onepercentrule: { question: "How much capital should you risk per single trade?", options: ["1% - 2% of total capital", "25% - 50% of total capital"], answer: "1% - 2% of total capital" },
        smc: { question: "What do Smart Money Concepts primarily track?", options: ["Institutional order flow & liquidity", "Random price noise"], answer: "Institutional order flow & liquidity" }
    },
    ua: {
        rsi: { question: "Показник RSI > 70 означає Перекупленість чи Перепроданість?", options: ["Перекупленість", "Перепроданість"], answer: "Перекупленість" },
        macd: { question: "На що вказує 'Золотий хрест'?", options: ["Вхід у лонг", "Вихід з позиції"], answer: "Вхід у лонг" },
        ob: { question: "Чим виступає Ордер Блок (OB)?", options: ["Підтримкою/Опором", "Жодним чином не впливає"], answer: "Підтримкою/Опором" },
        orderblock: { question: "Чим виступає Ордер Блок (OB)?", options: ["Підтримкою/Опором", "Жодним чином не впливає"], answer: "Підтримкою/Опором" },
        fvg: { question: "Що таке Імбаланс (FVG)?", options: ["Неефективність ціни / Розрив", "Рівномірний розподіл купівель"], answer: "Неефективність ціни / Розрив" },
        hns: { question: "Який тип патерну 'Голова і Плечі'?", options: ["Патерн розвороту", "Патерн продовження тренду"], answer: "Патерн розвороту" },
        bullflag: { question: "Бичачий Прапор сигналізує про:", options: ["Продовження росту", "Розворот тренду вниз"], answer: "Продовження росту" },
        fomo: { question: "Що означає FOMO?", options: ["Страх втраченої вигоди", "Швидке виконання ордерів"], answer: "Страх втраченої вигоди" },
        fud: { question: "Що зазвичай провокує FUD?", options: ["Панічні продажі", "Раціональне утримання"], answer: "Панічні продажі" },
        seed: { question: "З ким можна ділитися сід-фразою?", options: ["Ні з ким", "Підтримка StorkCrypto"], answer: "Ні з ким" },
        seedphrase: { question: "З ким можна ділитися сід-фразою?", options: ["Ні з ким", "Підтримка StorkCrypto"], answer: "Ні з ким" },
        coldwallet: { question: "Де зберігає приватні ключі Холодний Гаманець?", options: ["Офлайн на пристрої", "Онлайн в хмарі"], answer: "Офлайн на пристрої" },
        coldstorage: { question: "Де зберігає приватні ключі Холодний Гаманець?", options: ["Офлайн на пристрої", "Онлайн в хмарі"], answer: "Офлайн на пристрої" },
        '2fa': { question: "Який метод 2FA найбільш захищений від перехоплення SIM-карти?", options: ["Апаратний ключ / Додаток-автентифікатор", "SMS повідомлення"], answer: "Апаратний ключ / Додаток-автентифікатор" },
        onepercentrule: { question: "Який максимальний відсоток депозиту радять ризикувати в одній угоді?", options: ["1% - 2% капіталу", "25% - 50% капіталу"], answer: "1% - 2% капіталу" },
        smc: { question: "Що в першу чергу відстежують концепції Smart Money (SMC)?", options: ["Інституційні пули ліквідності та ордери", "Випадкові коливання ціни"], answer: "Інституційні пули ліквідності та ордери" }
    },
    pl: {
        rsi: { question: "Czy RSI > 70 oznacza Wykupienie czy Wyprzedanie?", options: ["Wykupienie", "Wyprzedanie"], answer: "Wykupienie" },
        macd: { question: "Co sugeruje Złoty Krzyż?", options: ["Wejście (Bullish)", "Wyjście (Bearish)"], answer: "Wejście (Bullish)" },
        ob: { question: "Czym jest Order Block (OB)?", options: ["Silnym wsparciem/oporem", "Nieistotnym punktem"], answer: "Silnym wsparciem/oporem" },
        orderblock: { question: "Czym jest Order Block (OB)?", options: ["Silnym wsparciem/oporem", "Nieistotnym punktem"], answer: "Silnym wsparciem/oporem" },
        fvg: { question: "Co FVG reprezentuje w akcji cenowej?", options: ["Nierównowagę cenową / Lukę", "Idealny bilans wolumenu"], answer: "Nierównowagę cenową / Lukę" },
        hns: { question: "Jakim typem formacji jest Głowa z Ramionami?", options: ["Odwrócenia", "Kontynuacji"], answer: "Odwrócenia" },
        bullflag: { question: "W jakim kierunku sugeruje ruch Flaga Byka?", options: ["Kontynuacja wzrostów", "Odwrócenie spadków"], answer: "Kontynuacja wzrostów" },
        fomo: { question: "Co oznacza skrót FOMO?", options: ["Strach przed pominięciem", "Zlecenie opcji rynkowych"], answer: "Strach przed pominięciem" },
        fud: { question: "Co zazwyczaj wywołuje FUD u inwestorów?", options: ["Paniczną sprzedaż", "Racjonalny HODLing"], answer: "Paniczną sprzedaż" },
        seed: { question: "Komu powinieneś udostępnić frazę seed?", options: ["Nikomu", "Wsparciu StorkCrypto"], answer: "Nikomu" },
        seedphrase: { question: "Komu powinieneś udostępnić frazę seed?", options: ["Nikomu", "Wsparciu StorkCrypto"], answer: "Nikomu" },
        coldwallet: { question: "Gdzie zimny portfel przechowuje klucze prywatne?", options: ["Offline na urządzeniu", "Online w chmurze"], answer: "Offline na urządzeniu" },
        coldstorage: { question: "Gdzie zimny portfel przechowuje klucze prywatne?", options: ["Offline na urządzeniu", "Online w chmurze"], answer: "Offline na urządzeniu" },
        '2fa': { question: "Która metoda 2FA jest najbezpieczniejsza przed atakiem SIM-swap?", options: ["Klucz sprzętowy / Aplikacja Authenticator", "Wiadomości SMS"], answer: "Klucz sprzętowy / Aplikacja Authenticator" },
        onepercentrule: { question: "Ile kapitału należy maksymalnie ryzykować w jednej transakcji?", options: ["1% - 2% całego kapitału", "25% - 50% całego kapitału"], answer: "1% - 2% całego kapitału" },
        smc: { question: "Co głównie śledzą koncepcje Smart Money (SMC)?", options: ["Instytucjonalne pule płynności i zlecenia", "Przypadkowy szum rynkowy"], answer: "Instytucjonalne pule płynności i zlecenia" }
    }
};

const MediaScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { settings, selectedAcademyCategory, addXp, grantXp, updateQuestProgress, showToast } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);

    const [filter, setFilter] = useState<'TECHNICAL' | 'PATTERNS' | 'PSYCHOLOGY' | 'SECURITY'>(
        selectedAcademyCategory || 'PATTERNS'
    );
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [activeDrillTerm, setActiveDrillTerm] = useState<AcademyTerm | null>(null);

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
                if (activeDrillTerm) {
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
    }, [activeDrillTerm, activeInlineQuizId, onClose]);

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

        // Smart Category-based fallback questions
        if (item.category === 'PATTERNS') {
            const isBull = item.term.toLowerCase().includes('bull') || 
                           item.term.toLowerCase().includes('hammer') || 
                           item.term.toLowerCase().includes('cup') || 
                           item.term.toLowerCase().includes('bottom') ||
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

        if (item.category === 'SECURITY') {
            return {
                question: currentLanguage === 'ua'
                    ? `Яке головне правило безпеки стосується "${item.term}"?`
                    : currentLanguage === 'pl'
                    ? `Jaka jest kluczowa zasada bezpieczeństwa dla "${item.term}"?`
                    : `What is the core security rule for "${item.term}"?`,
                options: currentLanguage === 'ua'
                    ? ["Зберігати конфіденційно і перевіряти підписи", "Поділитися у відкритому чаті для перевірки"]
                    : currentLanguage === 'pl'
                    ? ["Zachować poufność i weryfikować podpisy", "Udostępnić na czacie do weryfikacji"]
                    : ["Keep secure/offline and verify signatures", "Share in public chat to test"],
                answer: currentLanguage === 'ua' ? "Зберігати конфіденційно і перевіряти підписи"
                    : currentLanguage === 'pl' ? "Zachować poufność i weryfikować podpisy"
                    : "Keep secure/offline and verify signatures"
            };
        }

        return {
            question: currentLanguage === 'ua'
                ? `Чи розумієте ви практичне застосування "${item.term}"?`
                : currentLanguage === 'pl'
                ? `Czy rozumiesz praktyczne zastosowanie "${item.term}"?`
                : `Do you understand the trading application of "${item.term}"?`,
            options: currentLanguage === 'ua'
                ? ["Так, концепція зрозуміла", "Ні, потрібен повтор"]
                : currentLanguage === 'pl'
                ? ["Tak, pojęcie zrozumiałe", "Nie, muszę powtórzyć"]
                : ["Yes, concept understood", "Need more practice"],
            answer: currentLanguage === 'ua' ? "Так, концепція зрозуміла"
                : currentLanguage === 'pl' ? "Tak, pojęcie zrozumiałe"
                : "Yes, concept understood"
        };
    }, [currentLanguage]);

    const handleInlineOptionClick = (item: AcademyTerm, optionText: string, correctAnswer: string) => {
        if (optionText === correctAnswer || optionText.startsWith("Yes") || optionText.startsWith("Так") || optionText.startsWith("Tak")) {
            triggerHaptic('success');
            addXp(50);
            grantXp(50, `Express Quiz: ${item.term}`);
            updateQuestProgress('ACADEMY', 1);
            markTermCompleted(item.id);
            setActiveInlineQuizId(null);
            setInlineQuizError(null);
            showToast(t('academy.correct_toast'));
        } else {
            triggerHaptic('error');
            setInlineQuizError(true);
            showToast(t('academy.incorrect_toast'));
            setTimeout(() => setInlineQuizError(null), 1600);
        }
    };

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
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0 relative z-20">
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
                        <p className="text-[9px] text-brand-cyan font-mono uppercase tracking-widest">
                            {t('academy.subtitle')}
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

                {/* Category Navigation Tabs */}
                <div 
                    role="tablist"
                    aria-label="Academy categories"
                    className="grid grid-cols-4 gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-6 shadow-inner"
                >
                    <button 
                        role="tab"
                        aria-selected={filter === 'PATTERNS'}
                        onClick={() => { triggerHaptic('selection'); setFilter('PATTERNS'); }} 
                        className={`py-3 rounded-xl text-[8px] sm:text-[9px] font-black font-orbitron transition-all uppercase tracking-wider text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${filter === 'PATTERNS' ? 'bg-brand-card text-brand-cyan shadow-xl border border-brand-cyan/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('academy.patterns')}
                    </button>
                    <button 
                        role="tab"
                        aria-selected={filter === 'TECHNICAL'}
                        onClick={() => { triggerHaptic('selection'); setFilter('TECHNICAL'); }} 
                        className={`py-3 rounded-xl text-[8px] sm:text-[9px] font-black font-orbitron transition-all uppercase tracking-wider text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${filter === 'TECHNICAL' ? 'bg-brand-card text-brand-cyan shadow-xl border border-brand-cyan/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('academy.technical')}
                    </button>
                    <button 
                        role="tab"
                        aria-selected={filter === 'PSYCHOLOGY'}
                        onClick={() => { triggerHaptic('selection'); setFilter('PSYCHOLOGY'); }} 
                        className={`py-3 rounded-xl text-[8px] sm:text-[9px] font-black font-orbitron transition-all uppercase tracking-wider text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${filter === 'PSYCHOLOGY' ? 'bg-brand-card text-brand-cyan shadow-xl border border-brand-cyan/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('academy.psychology')}
                    </button>
                    <button 
                        role="tab"
                        aria-selected={filter === 'SECURITY'}
                        onClick={() => { triggerHaptic('selection'); setFilter('SECURITY'); }} 
                        className={`py-3 rounded-xl text-[8px] sm:text-[9px] font-black font-orbitron transition-all uppercase tracking-wider text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${filter === 'SECURITY' ? 'bg-brand-card text-brand-cyan shadow-xl border border-brand-cyan/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('academy.security')}
                    </button>
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
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                                                isExpanded 
                                                    ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' 
                                                    : isCompleted
                                                    ? 'bg-brand-emerald/10 border-brand-emerald/40 text-brand-emerald'
                                                    : 'bg-white/5 border-white/10 text-slate-500'
                                            }`}>
                                                <ChevronRightIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                            </div>

                                            <div>
                                                <h4 className={`font-bold text-xs sm:text-sm tracking-wide ${isExpanded ? 'text-brand-cyan' : isCompleted ? 'text-slate-200' : 'text-white'}`}>
                                                    {item.term}
                                                </h4>
                                                <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">
                                                    {t(`academy.${item.category.toLowerCase()}`)}
                                                </span>
                                            </div>
                                        </div>

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
