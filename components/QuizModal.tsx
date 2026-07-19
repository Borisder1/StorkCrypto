import React, { useState, useEffect } from 'react';
import { AcademyTerm } from '../types';
import { useStore } from '../store';
import { ShieldIcon, ActivityIcon, BotIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

interface QuizModalProps {
    term: AcademyTerm;
    onClose: () => void;
}

const QUIZ_LANGS: Record<string, Record<string, string>> = {
    'en': {
        'title': 'TACTICAL DRILL',
        'subject': 'SUBJECT',
        'correct': 'CORRECT',
        'failed': 'FAILED',
        'xp_granted': '+50 XP GRANTED',
        'resync': 'Resync Neural Link...',
        'q_pattern': 'What does the "{term}" pattern typically indicate?',
        'q_technical': 'How is {term} primarily used in trading?',
        'q_other': 'Which statement about "{term}" is true?',
        'opt_indecision': 'Market Indecision',
        'opt_bullish': 'Bullish Movement',
        'opt_bearish': 'Bearish Movement',
        'opt_volume_only': 'Volume Decrease only',
        'opt_tech_use': 'To measure momentum/trend',
        'opt_tech_news': 'To predict exact news events',
        'opt_tech_profit': 'To guarantee 100% profit',
        'opt_other_irrelevant': 'It is irrelevant in crypto.',
        'opt_other_risk': 'It helps manage risk or identify trends.',
        'opt_other_guarantee': 'It is a guaranteed signal.'
    },
    'ua': {
        'title': 'ТАКТИЧНЕ ТРЕНУВАННЯ',
        'subject': 'ПРЕДМЕТ',
        'correct': 'ПРАВИЛЬНО',
        'failed': 'НЕПРАВИЛЬНО',
        'xp_granted': '+50 XP НАРАХОВАНО',
        'resync': 'Спробуйте ще раз пізніше...',
        'q_pattern': 'Що зазвичай показує патерн "{term}" на графіку?',
        'q_technical': 'Для чого в першу чергу використовується {term} трейдерами?',
        'q_other': 'Яке твердження про "{term}" є правильним?',
        'opt_indecision': 'Нерішучість ринку та баланс сил',
        'opt_bullish': 'Висхідний (Бичачий) рух',
        'opt_bearish': 'Низхідний (Ведмежий) рух',
        'opt_volume_only': 'Лише зменшення обсягів торгів',
        'opt_tech_use': 'Для вимірювання імпульсу, тренду або зон перекупленості/перепроданості',
        'opt_tech_news': 'Для точного прогнозування світових новин',
        'opt_tech_profit': 'Для гарантування 100% прибутку в кожній угоді',
        'opt_other_irrelevant': 'Це не має значення для криптовалют.',
        'opt_other_risk': 'Це допомагає контролювати ризики та виявляти ринкові тренди.',
        'opt_other_guarantee': 'Це стовідсотковий грааль, який ніколи не помиляється.'
    },
    'pl': {
        'title': 'TRENING TAKTYCZNY',
        'subject': 'TEMAT',
        'correct': 'DOSKONALE',
        'failed': 'BŁĄD',
        'xp_granted': 'OTRZYMANO +50 XP',
        'resync': 'Zsynchronizuj ponownie...',
        'q_pattern': 'Co zazwyczaj wskazuje formacja "{term}"?',
        'q_technical': 'Jak {term} jest głównie używany w tradingu?',
        'q_other': 'Które twierdzenie o "{term}" jest prawdziwe?',
        'opt_indecision': 'Niezdecydowanie rynku',
        'opt_bullish': 'Ruch wzrostowy (Byczy)',
        'opt_bearish': 'Ruch spadkowe (Niedźwiedzi)',
        'opt_volume_only': 'Tylko spadek wolumenu',
        'opt_tech_use': 'Do pomiaru pędu lub trendu',
        'opt_tech_news': 'Do przewidywania konkretnych wydarzeń informacyjnych',
        'opt_tech_profit': 'Gwarantuje 100% zysku',
        'opt_other_irrelevant': 'Jest mało istotny w krypto.',
        'opt_other_risk': 'Pomaga zarządzać ryzykiem lub określić trendy.',
        'opt_other_guarantee': 'Daje gwarantowane sygnały bez ryzyka.'
    }
};

const QuizModal: React.FC<QuizModalProps> = ({ term, onClose }) => {
    const { grantXp, settings } = useStore();
    const lang = settings?.language || 'en';
    const dict = QUIZ_LANGS[lang] || QUIZ_LANGS['en'];

    const [status, setStatus] = useState<'QUESTION' | 'SUCCESS' | 'FAILURE'>('QUESTION');
    const [timeLeft, setTimeLeft] = useState(15);

    // Question Generator based on localized database
    const generateQuestion = (t: AcademyTerm) => {
        if (t.category === 'PATTERNS') {
            const safeTerm = t.term || '';
            const isBullWord = safeTerm.includes('Bull') || safeTerm.includes('Bottom') || safeTerm.includes('Cup') || safeTerm.includes('Бичачий') || safeTerm.includes('Дно') || safeTerm.includes('Чашка') || safeTerm.includes('Flaga') || safeTerm.includes('Wstęgi');
            return {
                q: dict['q_pattern'].replace('{term}', safeTerm),
                options: [
                    { text: dict['opt_indecision'], correct: false },
                    { text: isBullWord ? dict['opt_bullish'] : dict['opt_bearish'], correct: true },
                    { text: dict['opt_volume_only'], correct: false },
                ].sort(() => Math.random() - 0.5)
            };
        }
        if (t.category === 'TECHNICAL') {
            return {
                q: dict['q_technical'].replace('{term}', t.term || ''),
                options: [
                    { text: dict['opt_tech_use'], correct: true },
                    { text: dict['opt_tech_news'], correct: false },
                    { text: dict['opt_tech_profit'], correct: false },
                ].sort(() => Math.random() - 0.5)
            };
        }
        return {
            q: dict['q_other'].replace('{term}', t.term || ''),
            options: [
                { text: dict['opt_other_irrelevant'], correct: false },
                { text: dict['opt_other_risk'], correct: true },
                { text: dict['opt_other_guarantee'], correct: false },
            ].sort(() => Math.random() - 0.5)
        };
    };

    const [question] = useState(() => generateQuestion(term));

    useEffect(() => {
        if (status !== 'QUESTION') return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStatus('FAILURE');
                    triggerHaptic('error');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [status]);

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            triggerHaptic('success');
            setStatus('SUCCESS');
            grantXp(50, `Drill: ${term.term}`);
            setTimeout(onClose, 2000);
        } else {
            triggerHaptic('error');
            setStatus('FAILURE');
            setTimeout(onClose, 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 overflow-y-auto overscroll-contain">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm bg-brand-card border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,217,255,0.2)] animate-zoom-in my-auto max-h-[90vh] sm:max-h-[85vh] flex flex-col">
                
                {/* Header */}
                <div className="p-6 text-center border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                        <div 
                            className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-brand-cyan'}`} 
                            style={{ width: `${(timeLeft / 15) * 100}%` }}
                        ></div>
                    </div>
                    
                    <div className="w-16 h-16 bg-brand-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-cyan/30">
                        <BotIcon className="w-8 h-8 text-brand-cyan animate-pulse" />
                    </div>
                    <h2 className="font-orbitron font-bold text-white text-md tracking-wider mb-1">{dict['title']}</h2>
                    <p className="text-[9px] text-slate-400 font-mono">{dict['subject']}: {term.term}</p>
                </div>
                
                <div className="p-6">
                    {status === 'QUESTION' && (
                        <>
                            <p className="text-white text-sm font-bold mb-6 text-center leading-relaxed">
                                {question.q}
                            </p>
                            <div className="space-y-3">
                                {question.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(opt.correct)}
                                        className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-brand-cyan/20 hover:border-brand-cyan/50 transition-all text-xs font-mono text-left active:scale-[0.98]"
                                    >
                                        <span className="text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span> 
                                        <span className="text-slate-200">{opt.text}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {status === 'SUCCESS' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-[0_0_30px_#22c55e]">
                                <ShieldIcon className="w-10 h-10 text-black z-10" />
                            </div>
                            <h3 className="text-xl font-black text-green-400 font-orbitron mb-2">{dict['correct']}</h3>
                            <p className="text-white font-mono text-xs">{dict['xp_granted']}</p>
                        </div>
                    )}

                    {status === 'FAILURE' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_30px_#ef4444]">
                                <ActivityIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-red-500 font-orbitron mb-2">{dict['failed']}</h3>
                            <p className="text-slate-400 font-mono text-xs">{dict['resync']}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;