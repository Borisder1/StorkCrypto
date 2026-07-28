// Telegram WebApp Native Integration Helper
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
    is_premium?: boolean;
}

export const getTelegramWebApp = () => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        return (window as any).Telegram.WebApp;
    }
    return null;
};

export const initTelegramApp = () => {
    const tg = getTelegramWebApp();
    if (tg) {
        try {
            tg.ready();
            tg.expand();
            
            // Set native header/bg colors
            if (tg.setHeaderColor) tg.setHeaderColor('#020617');
            if (tg.setBackgroundColor) tg.setBackgroundColor('#020617');
            
            // Enable closing confirmation for active trading sessions
            if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
        } catch (e) {
            console.warn("Telegram WebApp initialization warning:", e);
        }
    }
};

export const getTelegramUser = (): TelegramUser | null => {
    const tg = getTelegramWebApp();
    if (tg?.initDataUnsafe?.user) {
        return tg.initDataUnsafe.user as TelegramUser;
    }
    return null;
};

export const tgCloudStorage = {
    setItem: (key: string, value: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const tg = getTelegramWebApp();
            if (tg?.CloudStorage) {
                tg.CloudStorage.setItem(key, value, (err: any, success: boolean) => {
                    resolve(!err && success);
                });
            } else {
                try {
                    localStorage.setItem(`tg_cloud_${key}`, value);
                    resolve(true);
                } catch {
                    resolve(false);
                }
            }
        });
    },

    getItem: (key: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const tg = getTelegramWebApp();
            if (tg?.CloudStorage) {
                tg.CloudStorage.getItem(key, (err: any, value: string) => {
                    if (err) resolve(null);
                    else resolve(value || null);
                });
            } else {
                try {
                    resolve(localStorage.getItem(`tg_cloud_${key}`));
                } catch {
                    resolve(null);
                }
            }
        });
    }
};

export const updateTelegramMainButton = (params: { text: string; visible: boolean; onClick?: () => void }) => {
    const tg = getTelegramWebApp();
    if (tg?.MainButton) {
        if (params.visible) {
            tg.MainButton.setText(params.text);
            tg.MainButton.show();
            if (params.onClick) {
                tg.MainButton.offClick(params.onClick);
                tg.MainButton.onClick(params.onClick);
            }
        } else {
            tg.MainButton.hide();
        }
    }
};
