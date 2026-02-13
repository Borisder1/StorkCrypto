
import React, { useEffect } from 'react';
import { InfoIcon, ChevronRightIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

interface InfoModalProps {
    title: string;
    description: string;
    features: string[];
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ title, description, features, onClose }) => {
    
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] grid place-items-center p-4 overflow-hidden overscroll-none touch-none animate-fade-in">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md touch-none" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm bg-brand-card border border-brand-border rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,217,255,0.15)] animate-zoom-in flex flex-col max-h-[85dvh]">
                
                {/* Header for Info Modal */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-brand-card/50">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronRightIcon className="w-5 h-5 rotate-180" />
                    </button>
                    <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest font-orbitron">Information_Hub</span>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,217,255,0.2)]">
                            <InfoIcon className="w-8 h-8 text-brand-cyan" />
                        </div>
                        <h2 className="text-xl font-bold text-white font-orbitron mb-2 uppercase tracking-tight">{title}</h2>
                        <div className="h-1 w-12 bg-brand-cyan rounded-full opacity-50"></div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-space-mono mb-8 text-center px-2">
                        {description}
                    </p>

                    <div className="space-y-3">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-black/30 p-4 rounded-2xl border border-white/5 group hover:border-brand-cyan/20 transition-all">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0 shadow-[0_0_5px_var(--primary-color)]"></div>
                                <p className="text-xs text-slate-200 font-bold leading-tight">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-5 bg-black/40 border-t border-white/5 shrink-0 touch-none">
                    <button 
                        onClick={() => { triggerHaptic('medium'); onClose(); }}
                        className="w-full py-4 rounded-2xl bg-brand-cyan text-black font-black font-orbitron hover:opacity-90 transition-opacity uppercase text-[10px] tracking-[0.2em] shadow-2xl"
                    >
                        Acknowledged
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
