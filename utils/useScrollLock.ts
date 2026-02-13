
import { useEffect } from 'react';

/**
 * Хук для блокування скролу body.
 * Використовується в модальних вікнах для запобігання "прокручування крізь".
 */
export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (isLocked) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isLocked]);
};
