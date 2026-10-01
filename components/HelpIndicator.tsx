import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { EXPLANATIONS } from '../utils/explanations';
import InfoModal from './InfoModal';
import { triggerHaptic } from '../utils/haptics';

// Global single-dialog coordinator ensuring only ONE info modal is active at any time
let activeHelpModalId: string | null = null;
const modalListeners = new Set<(activeId: string | null) => void>();

export const closeAllHelpModals = () => {
    activeHelpModalId = null;
    modalListeners.forEach(listener => listener(null));
};

interface HelpIndicatorProps {
    id: string; // Key of the explanation in EXPLANATIONS
    className?: string; // Additional classes for positioning
}

export const HelpIndicator: React.FC<HelpIndicatorProps> = ({ id, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const { settings } = useStore();

    // Determine current language, fallback to English
    const rawLang = settings.language || 'en';
    const lang: 'en' | 'ua' | 'pl' = (rawLang === 'ua' || rawLang === 'pl' || rawLang === 'en') 
        ? rawLang 
        : 'en';

    const item = EXPLANATIONS[id]?.[lang] || EXPLANATIONS[id]?.['en'];

    useEffect(() => {
        const listener = (activeId: string | null) => {
            if (activeId !== id) {
                setIsOpen(false);
            }
        };
        modalListeners.add(listener);
        return () => {
            modalListeners.delete(listener);
        };
    }, [id]);

    if (!item) {
        return null;
    }

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Immediately close any other open dialog before opening this one
        activeHelpModalId = id;
        modalListeners.forEach(listener => listener(id));

        triggerHaptic('medium');
        setIsOpen(true);
    };

    const handleClose = () => {
        triggerHaptic('light');
        if (activeHelpModalId === id) {
            activeHelpModalId = null;
            modalListeners.forEach(listener => listener(null));
        }
        setIsOpen(false);
        // Accessible focus return to trigger button
        setTimeout(() => {
            btnRef.current?.focus();
        }, 50);
    };

    // Semantic aria-labels per Section 7 of specification
    const ariaLabel = id === 'ai_market_summary' 
        ? 'Пояснення AI Market Insight' 
        : id === 'quests_center' 
        ? 'Пояснення Quests System' 
        : `Пояснення ${item.title}`;

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={handleOpen}
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 p-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan rounded-full transition-transform select-none shrink-0 ${className}`}
                title={item.title || "Help"}
                id={`help-btn-${id}`}
            >
                <span className="w-5 h-5 rounded-full border border-brand-cyan/40 bg-brand-cyan/15 text-[10px] font-black text-brand-cyan flex items-center justify-center hover:bg-brand-cyan/30 shadow-[0_0_10px_rgba(0,217,255,0.2)] hover:scale-110 active:scale-90 transition-all">
                    ?
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <InfoModal
                        title={item.title}
                        description={item.description}
                        features={item.features}
                        onClose={handleClose}
                        freshness="LIVE"
                    />
                )}
            </AnimatePresence>
        </>
    );
};
