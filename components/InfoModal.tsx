
import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { InfoIcon, ChevronRightIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

interface InfoModalProps {
    title: string;
    description: string;
    features: string[];
    onClose: () => void;
    dataSource?: string;
    freshness?: 'LIVE' | 'DELAYED' | 'STALE' | 'DEMO';
    disclaimer?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ 
    title, 
    description, 
    features, 
    onClose,
    dataSource = 'Stork Neural Core / On-Chain Feeds',
    freshness = 'LIVE',
    disclaimer = 'Аналітична інформація для ознайомлення, а не гарантія прибутку.'
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        // Auto-focus first accessible control
        closeBtnRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                return;
            }

            // Accessible focus trap within dialog
            if (e.key === 'Tab' && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length > 0) {
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];

                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => { 
            document.body.style.overflow = 'unset'; 
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <motion.div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-modal-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
        >
            <div 
                className="fixed inset-0 bg-black/90 backdrop-blur-md" 
                onClick={onClose}
                aria-hidden="true"
            ></div>
            
            <div 
                ref={modalRef}
                className="relative z-10 w-full max-w-sm bg-brand-card border border-brand-border rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,217,255,0.15)] flex flex-col max-h-[90vh] sm:max-h-[85vh] my-auto"
            >
                {/* Header for Info Modal */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-brand-card/50">
                    <button 
                        ref={closeBtnRef}
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        aria-label="Закрити інформаційне вікно"
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                    >
                        <ChevronRightIcon className="w-5 h-5 rotate-180" />
                    </button>
                    <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest font-orbitron">Information_Hub</span>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
                    <div className="flex flex-col items-center text-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,217,255,0.2)]">
                            <InfoIcon className="w-7 h-7 text-brand-cyan" />
                        </div>
                        <h2 id="info-modal-title" className="text-lg font-bold text-white font-orbitron mb-2 uppercase tracking-tight">{title}</h2>
                        <div className="h-0.5 w-10 bg-brand-cyan rounded-full opacity-60"></div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-space-mono mb-5 text-center px-1">
                        {description}
                    </p>

                    {/* Telemetry / Freshness status */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-3 mb-5 space-y-2 text-[10px] font-mono">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">DATA_SOURCE</span>
                            <span className="text-brand-cyan font-bold truncate max-w-[170px]">{dataSource}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">FRESHNESS</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                freshness === 'LIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                freshness === 'DELAYED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                                {freshness}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-white/5">
                            <span className="text-slate-400">LAST_SYNC</span>
                            <span className="text-slate-300">REALTIME // VERIFIED</span>
                        </div>
                    </div>

                    <div className="space-y-2.5 mb-5">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 bg-black/30 p-3 rounded-2xl border border-white/5">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0 shadow-[0_0_5px_var(--primary-color)]"></div>
                                <p className="text-xs text-slate-200 font-bold leading-tight">{feature}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-300/90 font-mono leading-relaxed text-center">
                        ⚠️ {disclaimer}
                    </div>
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5 shrink-0">
                    <button 
                        onClick={() => { triggerHaptic('medium'); onClose(); }}
                        className="w-full py-3.5 rounded-2xl bg-brand-cyan text-black font-black font-orbitron hover:opacity-90 transition-opacity uppercase text-[10px] tracking-[0.2em] shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                    >
                        Acknowledged
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default InfoModal;
