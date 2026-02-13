
import React, { useState, useEffect } from 'react';
import { BotIcon, ShieldIcon, TrendingUpIcon, ActivityIcon, PlayIcon } from './icons';
import { generateProactiveInsight, playAudio } from '../services/geminiService';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';
import PortfolioAuditModal from './PortfolioAuditModal';

const TypewriterText: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => prev + text[index]);
                setIndex(index + 1);
            }, 20); // Faster typing
            return () => clearTimeout(timer);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, text]);

    return <span>{displayedText}</span>;
};

const AIInsightWidget: React.FC = () => {
    const { assets, navigateTo } = useStore();
    const [insight, setInsight] = useState<{type: string, text: string} | null>(null);
    const [visible, setVisible] = useState(false);
    const [showAudit, setShowAudit] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const fetchNewInsight = async () => {
        if (assets.length === 0) return;
        setInsight(null);
        setVisible(false);
        
        await new Promise(r => setTimeout(r, 1000));
        const data = await generateProactiveInsight(assets.map(a => a.ticker));
        setInsight(data);
        setVisible(true);
        setIsTyping(true);
        triggerHaptic('medium');
    };

    useEffect(() => {
        const initialDelay = setTimeout(fetchNewInsight, 3000);
        const interval = setInterval(fetchNewInsight, 60000);
        return () => { clearTimeout(initialDelay); clearInterval(interval); };
    }, [assets.length]);

    const handleSpeak = () => {
        if (insight) { triggerHaptic('selection'); playAudio(insight.text); }
    };

    const handleAction = () => {
        triggerHaptic('heavy');
        if (insight?.type === 'OPPORTUNITY') navigateTo('signals');
        else if (insight?.type === 'ALERT') navigateTo('scanner');
        else setShowAudit(true);
    };

    if (!visible || !insight) return null;

    const isAlert = insight.type === 'ALERT';

    return (
        <div className="px-6 mb-8 relative z-20">
            <div className={`relative bg-black/80 backdrop-blur-xl border ${isAlert ? 'border-red-500/40' : 'border-brand-cyan/30'} p-4 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up`}>
                
                {/* Decor Line */}
                <div className={`absolute top-0 left-0 w-1 h-full ${isAlert ? 'bg-red-500' : 'bg-brand-cyan'}`}></div>

                <div className="flex justify-between items-start mb-3 pl-3">
                    <div className="flex items-center gap-2">
                        <BotIcon className={`w-4 h-4 ${isAlert ? 'text-red-500 animate-pulse' : 'text-brand-cyan'}`} />
                        <span className={`text-[10px] font-black font-orbitron uppercase tracking-widest ${isAlert ? 'text-red-400' : 'text-brand-cyan'}`}>
                            {isAlert ? 'CRITICAL_ALERT' : 'NEURAL_INSIGHT'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSpeak} className="opacity-50 hover:opacity-100 transition-opacity"><PlayIcon className="w-3 h-3 text-white" /></button>
                        <button onClick={() => setVisible(false)} className="opacity-50 hover:opacity-100 text-[10px] font-bold text-white">✕</button>
                    </div>
                </div>

                <div className="pl-3 mb-4">
                    <p className="text-[11px] text-slate-200 font-mono leading-relaxed">
                        <span className="text-slate-500 mr-2">{'>'}</span>
                        <TypewriterText text={insight.text} onComplete={() => setIsTyping(false)} />
                        {isTyping && <span className="animate-pulse">_</span>}
                    </p>
                </div>

                <div className="pl-3 flex gap-2">
                    <button 
                        onClick={handleAction}
                        className={`flex-1 py-2 text-[9px] font-black font-orbitron uppercase tracking-widest border transition-all hover:bg-white hover:text-black ${isAlert ? 'border-red-500 text-red-400 hover:border-white' : 'border-brand-cyan text-brand-cyan hover:border-white'}`}
                    >
                        {isAlert ? 'INVESTIGATE' : 'ANALYZE'}
                    </button>
                </div>
            </div>
            
            {showAudit && <PortfolioAuditModal onClose={() => setShowAudit(false)} />}
        </div>
    );
};

export default AIInsightWidget;
