import React, { useEffect, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import BottomNav from './components/BottomNav';
import HomeScreen from './components/screens/HomeScreen';
import MarketTicker from './components/MarketTicker';
import LevelUpOverlay from './components/LevelUpOverlay';
import OfflineIndicator from './components/OfflineIndicator';
import ModalManager from './components/ModalManager';
import MaintenanceScreen from './components/MaintenanceScreen';
import SimulationManager from './components/SimulationManager';
import SentinelSystem from './components/SentinelSystem';
import WalletListener from './components/WalletListener';
import { LoadingScreen } from './components/LoadingScreen';
import { HomeIcon, NewspaperIcon, ActivityIcon, RadarIcon, PieChartIcon, BookIcon, BotIcon } from './components/icons';
import { useStore } from './store';
import { getTranslation } from './utils/translations';
import { triggerHaptic } from './utils/haptics';

const THEME_BG_MODES = {
    midnight: '#020617',
    twilight: '#0f172a',
    concrete: '#18181b',
    solar: '#1e293b'
};

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const {
        settings = {} as any,
        activeTab = 'home',
        navigateTo,
        isAIChatOpen = false,
        setIsAIChatOpen,
        maintenanceMode = false,
        syncUserData,
        updateSettings,
        redeemReferral
    } = useStore();

    const t = (key: string) => getTranslation(settings?.language || 'en', key);

    const navItems = [
        { id: 'home', label: t('nav.home'), icon: <HomeIcon /> },
        { id: 'signals', label: 'Terminal', icon: <ActivityIcon /> },
        { id: 'scanner', label: t('nav.scanner'), icon: <RadarIcon /> },
        { id: 'news', label: t('nav.news'), icon: <NewspaperIcon /> },
        { id: 'media', label: t('nav.media'), icon: <BookIcon /> },
        { id: 'portfolio', label: t('nav.assets'), icon: <PieChartIcon /> },
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 6500);

        // @ts-ignore
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            const tgUser = tg.initDataUnsafe?.user;

            // Синхронізація з урахуванням chat_id для пушів
            if (tgUser) {
                syncUserData({
                    ...tgUser,
                    telegram_chat_id: tgUser.id.toString() // Використовуємо ID користувача як Chat ID
                });
            } else {
                syncUserData();
            }

            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam) redeemReferral(startParam);

            try {
                tg.expand();
                const bgColor = THEME_BG_MODES[settings.themeMode as keyof typeof THEME_BG_MODES] || '#0f172a';

                // Перевірка підтримки методів перед викликом (для версій < 6.1)
                if (tg.setHeaderColor) {
                    try { tg.setHeaderColor(bgColor); } catch (e) { }
                }
                if (tg.setBackgroundColor) {
                    try { tg.setBackgroundColor(bgColor); } catch (e) { }
                }
            } catch (e) { }
        } else {
            syncUserData();
        }

        return () => clearTimeout(timer);
    }, [syncUserData, settings.themeMode, updateSettings, redeemReferral]);

    const [isNavigating, setIsNavigating] = useState(false);

    const handleNavigation = (tab: string) => {
        if (tab === activeTab) return;
        setIsNavigating(true);
        triggerHaptic('selection');
        setTimeout(() => {
            navigateTo(tab);
            setIsNavigating(false);
        }, 600);
    };

    if (isLoading) return <LoadingScreen onComplete={() => setIsLoading(false)} />;
    if (maintenanceMode && settings?.isAuthenticated) return <MaintenanceScreen />;

    return (
        <div className="h-[100dvh] w-screen bg-brand-bg text-white overflow-hidden flex flex-col font-sans relative">
            <OfflineIndicator />
            <SimulationManager />
            <SentinelSystem />
            <WalletListener />

            {/* Navigation Loading Overlay */}
            {isNavigating && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <ActivityIcon className="w-10 h-10 text-brand-cyan animate-spin" />
                            <div className="absolute inset-0 border-2 border-brand-cyan/30 rounded-full animate-ping"></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-brand-cyan font-mono text-xs font-bold tracking-[0.2em] animate-pulse">SCANNING</span>
                            <span className="text-[8px] text-brand-cyan/50 font-mono mt-1">ENCRYPTING CONNECTION</span>
                        </div>
                    </div>
                </div>
            )}

            {!settings?.isAuthenticated ? (
                <AuthScreen />
            ) : (
                <div className="h-full flex flex-col relative">
                    <MarketTicker />
                    <LevelUpOverlay />

                    <main className="flex-grow overflow-y-auto overflow-x-hidden relative z-0 pt-10 pb-24 no-scrollbar">
                        <HomeScreen onNavigate={handleNavigation} />
                    </main>

                    <ModalManager />

                    <button
                        onClick={() => { triggerHaptic('medium'); setIsAIChatOpen(!isAIChatOpen); }}
                        className={`fixed bottom-24 right-4 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border border-brand-cyan/50 shadow-[0_0_20px_rgba(0,217,255,0.3)] ${isAIChatOpen ? 'scale-0' : 'bg-brand-cyan text-black'}`}
                        style={{ backgroundColor: isAIChatOpen ? 'transparent' : 'var(--primary-color)' }}
                    >
                        <BotIcon className="w-8 h-8" />
                    </button>

                    <BottomNav items={navItems} activeTab={activeTab} onTabChange={handleNavigation} />
                </div>
            )}
        </div>
    );
};

export default App;