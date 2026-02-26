
import { soundscapes } from './audio';

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection') => {
    // 1. Play Soundscape
    switch (type) {
        case 'light':
        case 'medium':
        case 'heavy':
            soundscapes.playClick();
            break;
        case 'selection':
            soundscapes.playSelect();
            break;
        case 'success':
            soundscapes.playSuccess();
            break;
        case 'error':
            soundscapes.playAlert();
            break;
    }

    // 2. Trigger Haptic (Vibration) - KEPT FOR TACTILE FEEDBACK
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        switch (type) {
            case 'light': 
                navigator.vibrate(5); 
                break;
            case 'medium': 
                navigator.vibrate(15); 
                break;
            case 'heavy': 
                navigator.vibrate(30); 
                break;
            case 'selection':
                navigator.vibrate(10);
                break;
            case 'success': 
                navigator.vibrate([10, 30, 10]); 
                break;
            case 'error': 
                navigator.vibrate([50, 30, 50]); 
                break;
        }
    }
    
    // 3. Telegram Haptics (if available)
    // @ts-ignore
    if (window.Telegram?.WebApp?.HapticFeedback) {
        // @ts-ignore
        const haptic = window.Telegram.WebApp.HapticFeedback;
        switch (type) {
            case 'light': haptic.impactOccurred('light'); break;
            case 'medium': haptic.impactOccurred('medium'); break;
            case 'heavy': haptic.impactOccurred('heavy'); break;
            case 'selection': haptic.selectionChanged(); break;
            case 'success': haptic.notificationOccurred('success'); break;
            case 'error': haptic.notificationOccurred('error'); break;
        }
    }
};
