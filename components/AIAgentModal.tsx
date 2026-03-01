import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { TacticalBackground } from './TacticalBackground';
import { ChevronRightIcon, ShieldIcon, ActivityIcon, BotIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getAIAgentAnalysis } from '../services/geminiService';
import Skeleton from './Skeleton';

interface AIAgentModalProps {
    onClose: () => void;
}

const AIAgentModal: React.FC<AIAgentModalProps> = ({ onClose }) => {
    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    
    const [selectedAgent, setSelectedAgent] = useState<'SNIPER' | 'WHALE' | 'GUARDIAN'>('SNIPER');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const fetchAnalysis = async (agent: 'SNIPER' | 'WHALE' | 'GUARDIAN') => {
        setLoading(true);
        setAnalysis(null);
        try {
            const result = await getAIAgentAnalysis(agent, settings.language);
            setAnalysis(result);
        } catch (e) {
            setAnalysis("Failed to connect to AI Core. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis(selectedAgent);
    }, [selectedAgent, settings.language]);

    const agents = [
        { id: 'SNIPER', name: 'Sniper', icon: ActivityIcon, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/30', desc: 'Aggressive scalping & momentum' },
        { id: 'WHALE', name: 'Whale Tracker', icon: BotIcon, color: 'text-brand-purple', bg: 'bg-brand-purple/10', border: 'border-brand-purple/30', desc: 'On-chain & smart money flow' },
        { id: 'GUARDIAN', name: 'Guardian', icon: ShieldIcon, color: 'text-brand-success', bg: 'bg-brand-success/10', border: 'border-brand-success/30', desc: 'Conservative macro & risk management' }
    ] as const;

    const modalContent = (
        <div className="fixed inset-0 z-[300] bg-brand-bg flex flex-col animate-fade-in overflow-hidden h-[100dvh] w-full">
            <TacticalBackground />
            
            {/* Header */}
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase">AI_Agents</h1>
                        <p className="text-[8px] text-brand-purple font-mono uppercase">Neural_Advisors: ONLINE</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-32 relative z-10">
                
                {/* Agent Selection */}
                <div className="grid grid-cols-1 gap-3">
                    {agents.map(agent => {
                        const Icon = agent.icon;
                        const isSelected = selectedAgent === agent.id;
                        return (
                            <button
                                key={agent.id}
                                onClick={() => { triggerHaptic('selection'); setSelectedAgent(agent.id); }}
                                className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-left ${
                                    isSelected 
                                    ? `bg-brand-card border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]` 
                                    : 'bg-black/40 border-white/5 hover:bg-white/5'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${agent.bg} ${agent.border} border`}>
                                    <Icon className={`w-6 h-6 ${agent.color}`} />
                                </div>
                                <div>
                                    <h3 className={`font-orbitron font-bold text-sm uppercase ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                        {agent.name}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">{agent.desc}</p>
                                </div>
                                {isSelected && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Analysis Output */}
                <div className="bg-brand-card/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden min-h-[200px]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-purple to-transparent opacity-50"></div>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <BotIcon className="w-4 h-4 text-brand-purple" />
                        <span className="text-[10px] font-mono text-brand-purple uppercase tracking-widest">Live_Analysis_Feed</span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="w-full h-4 rounded" />
                            <Skeleton className="w-[90%] h-4 rounded" />
                            <Skeleton className="w-[95%] h-4 rounded" />
                            <Skeleton className="w-[80%] h-4 rounded mt-4" />
                            <Skeleton className="w-[85%] h-4 rounded" />
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none font-space-mono text-slate-300 leading-relaxed text-xs">
                            {analysis?.split('\n').map((paragraph, idx) => (
                                <p key={idx} className="mb-3 last:mb-0">{paragraph}</p>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AIAgentModal;
