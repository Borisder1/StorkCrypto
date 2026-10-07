
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
            data-modal-layer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="modal-layer modal-layer--fullscreen"
        >
            <button 
                data-modal-backdrop
                className="modal-backdrop"
                onClick={onClose}
                aria-label="Закрити вікно підказки"
            />
            
            <motion.section 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="info-modal-title"
                tabIndex={-1}
                data-modal-panel
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2 }}
                className="modal-panel w-full h-full min-h-[100dvh] max-h-[100dvh] bg-[#050b14] flex flex-col overflow-hidden text-white"
            >
                {/* Header for Info Modal */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/60 shrink-0 safe-area-pt">
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

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar overscroll-contain max-w-2xl mx-auto w-full">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,217,255,0.25)]">
                            <InfoIcon className="w-8 h-8 text-brand-cyan" />
                        </div>
                        <h2 id="info-modal-title" className="text-xl sm:text-2xl font-black text-white font-orbitron mb-2 uppercase tracking-wide">{title}</h2>
                        <div className="h-0.5 w-16 bg-brand-cyan rounded-full opacity-70"></div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-space-mono mb-6 text-center px-2">
                        {description}
                    </p>

                    {/* Telemetry / Freshness status */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 space-y-2.5 text-xs font-mono">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">DATA_SOURCE</span>
                            <span className="text-brand-cyan font-bold truncate max-w-[220px]">{dataSource}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">FRESHNESS</span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                                freshness === 'LIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                freshness === 'DELAYED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                                {freshness}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className="text-slate-400">LAST_SYNC</span>
                            <span className="text-slate-300">REALTIME // VERIFIED</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-black/30 p-4 rounded-2xl border border-white/5">
                                <div className="mt-1 w-2 h-2 rounded-full bg-brand-cyan shrink-0 shadow-[0_0_6px_var(--primary-color)]"></div>
                                <p className="text-xs sm:text-sm text-slate-200 font-bold leading-relaxed">{feature}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 font-mono leading-relaxed text-center mb-6">
                        ⚠️ {disclaimer}
                    </div>
                </div>

                <div className="p-4 bg-black/60 border-t border-white/5 shrink-0 safe-area-pb max-w-2xl mx-auto w-full">
                    <button 
                        onClick={() => { triggerHaptic('medium'); onClose(); }}
                        className="w-full py-4 rounded-2xl bg-brand-cyan text-black font-black font-orbitron hover:opacity-90 transition-opacity uppercase text-xs tracking-[0.2em] shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                    >
                        Acknowledged
                    </button>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default InfoModal;
