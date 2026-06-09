import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { EXPLANATIONS } from '../utils/explanations';
import InfoModal from './InfoModal';
import { triggerHaptic } from '../utils/haptics';

interface HelpIndicatorProps {
    id: string; // Key of the explanation in EXPLANATIONS
    className?: string; // Additional classes for positioning
}

export const HelpIndicator: React.FC<HelpIndicatorProps> = ({ id, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { settings } = useStore();

    // Determine current language, fallback to English
    const rawLang = settings.language || 'en';
    const lang: 'en' | 'ua' | 'pl' = (rawLang === 'ua' || rawLang === 'pl' || rawLang === 'en') 
        ? rawLang 
        : 'en';

    const item = EXPLANATIONS[id]?.[lang] || EXPLANATIONS[id]?.['en'];

    if (!item) {
        return null;
    }

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic('medium');
        setIsOpen(true);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className={`w-5 h-5 min-w-[20px] min-h-[20px] rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-[9px] font-black text-brand-cyan flex items-center justify-center hover:bg-brand-cyan/25 cursor-pointer shadow-[0_0_10px_rgba(0,217,255,0.15)] hover:scale-110 active:scale-90 transition-all outline-none font-sans select-none shrink-0 ${className}`}
                title={item.title || "Help"}
                id={`help-btn-${id}`}
            >
                ?
            </button>

            <AnimatePresence>
                {isOpen && (
                    <InfoModal
                        title={item.title}
                        description={item.description}
                        features={item.features}
                        onClose={() => {
                            triggerHaptic('light');
                            setIsOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};
