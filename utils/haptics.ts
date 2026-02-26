
// SFX ASSETS (Removed to silence app)
const SFX = {};

// Audio Context disabled for silence
const audioCtx = null;

const playTone = (freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number, vol: number = 0.1) => {
    // SILENCED: Sound FX removed per user request
    return;
};

const playSound = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection') => {
    // SILENCED
    return;
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection') => {
    // 1. Play Sound (DISABLED)
    // playSound(type);

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
    try {
        const haptic = window.Telegram?.WebApp?.HapticFeedback;
        if (haptic) {
            switch (type) {
                case 'light': haptic.impactOccurred('light'); break;
                case 'medium': haptic.impactOccurred('medium'); break;
                case 'heavy': haptic.impactOccurred('heavy'); break;
                case 'selection': haptic.selectionChanged(); break;
                case 'success': haptic.notificationOccurred('success'); break;
                case 'error': haptic.notificationOccurred('error'); break;
            }
        }
    } catch (e) {
        // HapticFeedback not supported in this Telegram version
    }
};
