import React, { Suspense, lazy } from 'react';
import { useStore } from '../store';
import ErrorBoundary from './ErrorBoundary';
import ReferralModal from './ReferralModal';
import CalendarModal from './CalendarModal';
import ProfileScreen from './screens/ProfileScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import SignalsScreen from './screens/SignalsScreen';
import SubscriptionModal from './SubscriptionModal'; 
import AdInquiryModal from './AdInquiryModal';
import AirdropModal from './AirdropModal';
import SentinelModal from './SentinelModal';

// Lazy Loaded Heavy Components
const ScannerModal = lazy(() => import('./ScannerModal'));
const AnalyticsModal = lazy(() => import('./AnalyticsModal'));
const NewsModal = lazy(() => import('./NewsModal'));
const MediaScreen = lazy(() => import('./screens/MediaScreen'));
const ChatScreen = lazy(() => import('./ChatScreen'));

const ModalManager: React.FC = () => {
    const { 
        activeTab, 
        navigateTo, 
        isAIChatOpen, 
        setIsAIChatOpen, 
        showReferral, 
        setShowReferral, 
        showCalendar, 
        setShowCalendar,
        isSubscriptionOpen,
        setSubscriptionOpen,
        showAdInquiry,
        setShowAdInquiry,
        showAirdrop,
        setShowAirdrop,
        showSentinel,
        setShowSentinel
    } = useStore();

    const goHome = () => navigateTo('home');

    return (
        <Suspense fallback={null}>
            <ErrorBoundary>
                {/* Full Screen Screens (Z-110) */}
                <div className="relative z-[110]">
                    {activeTab === 'portfolio' && <PortfolioScreen onClose={goHome} />}
                    {activeTab === 'signals' && <SignalsScreen onClose={goHome} />}
                    {activeTab === 'profile' && <ProfileScreen onClose={goHome} />}
                    {activeTab === 'media' && <MediaScreen onClose={goHome} />}
                    
                    {activeTab === 'scanner' && <ScannerModal onClose={goHome} />}
                    {activeTab === 'analytics' && <AnalyticsModal onClose={goHome} />}
                    {activeTab === 'news' && <NewsModal onClose={goHome} />}
                </div>
                
                {/* Secondary Modals (Z-150+) */}
                <div className="relative z-[150]">
                    {showReferral && <ReferralModal onClose={() => setShowReferral(false)} />}
                    {showCalendar && <CalendarModal onClose={() => setShowCalendar(false)} />}
                    {isSubscriptionOpen && <SubscriptionModal onClose={() => setSubscriptionOpen(false)} />}
                    {showAdInquiry && <AdInquiryModal onClose={() => setShowAdInquiry(false)} />}
                    {showAirdrop && <AirdropModal onClose={() => setShowAirdrop(false)} />}
                    {showSentinel && <SentinelModal onClose={() => setShowSentinel(false)} />}
                </div>

                {/* AI Chat (Top Layer Z-200) */}
                {isAIChatOpen && (
                    <div className="fixed inset-0 z-[200] bg-black/80 flex justify-center animate-slide-up-mobile">
                        <div className="w-full max-w-md h-full bg-brand-bg relative shadow-2xl">
                            <ChatScreen onClose={() => setIsAIChatOpen(false)} />
                        </div>
                    </div>
                )}
            </ErrorBoundary>
        </Suspense>
    );
};

export default ModalManager;
