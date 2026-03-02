import React, { useState, useEffect } from 'react';
import { AcademyTerm } from '../types';
import { useStore } from '../store';
import { ShieldIcon, ActivityIcon, BotIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

interface QuizModalProps {
    term: AcademyTerm;
    onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ term, onClose }) => {
    const { grantXp } = useStore();
    const [status, setStatus] = useState<'QUESTION' | 'SUCCESS' | 'FAILURE'>('QUESTION');
    const [timeLeft, setTimeLeft] = useState(15);

    // Mock Question Generator (In production, this would be AI generated or DB driven)
    const generateQuestion = (t: AcademyTerm) => {
        if (t.category === 'PATTERNS') {
            return {
                q: `What does the "${t.term}" pattern typically indicate?`,
                options: [
                    { text: 'Market Indecision', correct: false },
                    { text: t.term.includes('Bull') || t.term.includes('Bottom') || t.term.includes('Cup') ? 'Bullish Movement' : 'Bearish Movement', correct: true },
                    { text: 'Volume Decrease only', correct: false },
                ].sort(() => Math.random() - 0.5)
            };
        }
        if (t.category === 'TECHNICAL') {
            return {
                q: `How is ${t.term} primarily used in trading?`,
                options: [
                    { text: 'To measure momentum/trend', correct: true },
                    { text: 'To predict exact news events', correct: false },
                    { text: 'To guarantee 100% profit', correct: false },
                ].sort(() => Math.random() - 0.5)
            };
        }
        return {
            q: `Which statement about "${t.term}" is true?`,
            options: [
                { text: 'It is irrelevant in crypto.', correct: false },
                { text: 'It helps manage risk or identify trends.', correct: true },
                { text: 'It is a guaranteed signal.', correct: false },
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
        <div className="fixed inset-0 z-[150] grid place-items-center p-6 touch-none">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm bg-brand-card border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,217,255,0.2)] animate-zoom-in">
                
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
                    <h2 className="font-orbitron font-bold text-white text-xl mb-1">TACTICAL DRILL</h2>
                    <p className="text-xs text-slate-400 font-mono">SUBJECT: {term.term}</p>
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
                                        className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-brand-cyan/20 hover:border-brand-cyan/50 transition-all text-sm font-mono text-left active:scale-[0.98]"
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
                                <ShieldIcon className="w-10 h-10 text-black" />
                            </div>
                            <h3 className="text-2xl font-black text-green-400 font-orbitron mb-2">CORRECT</h3>
                            <p className="text-white font-mono text-sm">+50 XP GRANTED</p>
                        </div>
                    )}

                    {status === 'FAILURE' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_30px_#ef4444]">
                                <ActivityIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-red-500 font-orbitron mb-2">FAILED</h3>
                            <p className="text-slate-400 font-mono text-sm">Resync Neural Link...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;