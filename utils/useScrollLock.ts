
import { useEffect } from 'react';

let lockCount = 0;
let scrollY = 0;
let previousBodyStyles: {
    overflow: string;
    position: string;
    top: string;
    left: string;
    right: string;
    width: string;
} | null = null;
let previousHtmlOverflow = '';

/**
 * Хук для надійного блокування скролу body на мобільних пристроях / WebKit / Telegram Mini App.
 * - Запобігає інерційному прокручуванню та випаданню через pull-to-refresh.
 * - Підтримує стек модальних вікон через глобальний лічильник lockCount.
 * - Відновлює точну позицію скролу без смикання сторінки (layout shift).
 */
export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (!isLocked || typeof document === 'undefined') return;

        if (lockCount === 0) {
            scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            previousBodyStyles = {
                overflow: document.body.style.overflow,
                position: document.body.style.position,
                top: document.body.style.top,
                left: document.body.style.left,
                right: document.body.style.right,
                width: document.body.style.width,
            };
            previousHtmlOverflow = document.documentElement.style.overflow;

            // Блокуємо body та html з фіксованою позицією для iOS WebKit
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
        }

        lockCount++;

        return () => {
            lockCount = Math.max(0, lockCount - 1);

            if (lockCount === 0) {
                if (previousBodyStyles) {
                    document.body.style.overflow = previousBodyStyles.overflow;
                    document.body.style.position = previousBodyStyles.position;
                    document.body.style.top = previousBodyStyles.top;
                    document.body.style.left = previousBodyStyles.left;
                    document.body.style.right = previousBodyStyles.right;
                    document.body.style.width = previousBodyStyles.width;
                    previousBodyStyles = null;
                } else {
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.left = '';
                    document.body.style.right = '';
                    document.body.style.width = '';
                }

                document.documentElement.style.overflow = previousHtmlOverflow || '';
                window.scrollTo(0, scrollY);
            }
        };
    }, [isLocked]);
};

