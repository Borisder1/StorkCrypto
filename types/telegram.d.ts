
interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    platform: string;
    initData: string;
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    /**
     * Method to open a payment invoice.
     */
    openInvoice: (url: string, callback?: (status: string) => void) => void;
    BackButton: {
        isVisible: boolean;
        show: () => void;
        hide: () => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
    };
    HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        selectionChanged: () => void;
    };
    initDataUnsafe: {
        user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
        };
        start_param?: string;
    };
    themeParams: {
        bg_color?: string;
        text_color?: string;
        hint_color?: string;
        link_color?: string;
        button_color?: string;
        button_text_color?: string;
    };
}

interface Window {
    Telegram?: {
        WebApp: TelegramWebApp;
    };
}
