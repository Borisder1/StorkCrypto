
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
import WalletListener from './components/WalletListener'; 
import { LoadingScreen } from './components/LoadingScreen';
import { HomeIcon, NewspaperIcon, ActivityIcon, RadarIcon, PieChartIcon, BookIcon, BotIcon } from './components/icons';
import { useStore } from './store';
import { getTranslation } from './utils/translations';
import { triggerHaptic } from './utils/haptics';
import { soundscapes } from './utils/audio';

const THEME_BG_MODES = {
    midnight: '#020617', // Deepest Black/Blue
    twilight: '#0f172a',
    concrete: '#18181b',
    solar: '#1e293b'
};

const App: React.FC = () => {
    // 🔒 SYSTEM CRITICAL: LOADING SEQUENCE RESTORED. IMMUTABLE.
    // DO NOT REMOVE OR SHORTEN THIS TIMER.
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Force Boot Timer - 6.5s Signature Sequence
        const timer = setTimeout(() => setIsLoading(false), 6500);
        return () => clearTimeout(timer);
    }, []);

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
        soundscapes.setEnabled(settings?.soundEnabled ?? true);
    }, [settings?.soundEnabled]);

    // Android Back Button Handler
    useEffect(() => {
        // Safe check for Telegram WebApp
        // @ts-ignore
        const tg = typeof window !== 'undefined' && window.Telegram?.WebApp;
        if (tg) {
            tg.BackButton.onClick(() => {
                if (activeTab !== 'home') {
                    navigateTo('home');
                } else {
                    tg.close();
                }
            });
        }
    }, [activeTab, navigateTo]);

    // Show/Hide Back Button based on navigation state
    useEffect(() => {
        // @ts-ignore
        const tg = typeof window !== 'undefined' && window.Telegram?.WebApp;
        if (tg) {
            if (activeTab !== 'home' || isAIChatOpen) {
                tg.BackButton.show();
            } else {
                tg.BackButton.hide();
            }
        }
    }, [activeTab, isAIChatOpen]);

    useEffect(() => {
        // @ts-ignore
        const tg = typeof window !== 'undefined' && window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            const tgUser = tg.initDataUnsafe?.user;
            
            if (tgUser) {
                syncUserData({
                    ...tgUser,
                    telegram_chat_id: tgUser.id.toString()
                });
            } else {
                syncUserData();
            }

            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam) redeemReferral(startParam);

            try {
                tg.expand(); 
                const bgColor = THEME_BG_MODES[settings.themeMode as keyof typeof THEME_BG_MODES] || '#020617';
                tg.setHeaderColor(bgColor);
                tg.setBackgroundColor(bgColor);
            } catch (e) {}
        } else {
            syncUserData();
        }
    }, [syncUserData, settings.themeMode, updateSettings, redeemReferral]);

    // ⚡ RENDER LOADING SCREEN (High Priority)
    if (isLoading) return <LoadingScreen onSkip={() => setIsLoading(false)} />;

    if (maintenanceMode && settings?.isAuthenticated) return <MaintenanceScreen />; 

    return (
        <div className="h-[100dvh] w-screen bg-brand-bg text-white overflow-hidden flex flex-col font-sans relative">
            <OfflineIndicator />
            <SimulationManager />
            <WalletListener /> 
            
            {!settings?.isAuthenticated ? (
                <AuthScreen />
            ) : (
                <div className="h-full flex flex-col relative">
                    <MarketTicker />
                    <LevelUpOverlay />
                    
                    <main className="flex-grow overflow-y-auto overflow-x-hidden relative z-0 pt-10 pb-24 no-scrollbar">
                        <HomeScreen onNavigate={navigateTo} />
                    </main>

                    <ModalManager />

                    <button 
                        onClick={() => { triggerHaptic('medium'); setIsAIChatOpen(!isAIChatOpen); }} 
                        className={`fixed bottom-24 right-4 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border border-brand-cyan/50 shadow-[0_0_20px_rgba(0,217,255,0.3)] ${isAIChatOpen ? 'scale-0' : 'bg-brand-cyan text-black'}`}
                        style={{ backgroundColor: isAIChatOpen ? 'transparent' : 'var(--primary-color)' }}
                    >
                        <BotIcon className="w-8 h-8" />
                    </button>

                    <BottomNav items={navItems} activeTab={activeTab} onTabChange={navigateTo} />
                </div>
            )}
        </div>
    );
};

export default App;
