import React from 'react';
import { AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import ErrorBoundary from './ErrorBoundary';

// 🚀 CODE SPLITTING: Lazy load heavy modal modules to minimize initial JS Bundle size
const ReferralModal = React.lazy(() => import('./ReferralModal'));
const CalendarModal = React.lazy(() => import('./CalendarModal'));
const ProfileScreen = React.lazy(() => import('./screens/ProfileScreen'));
const PortfolioScreen = React.lazy(() => import('./screens/PortfolioScreen'));
const SignalsScreen = React.lazy(() => import('./screens/SignalsScreen'));
const SubscriptionModal = React.lazy(() => import('./SubscriptionModal')); 
const AdInquiryModal = React.lazy(() => import('./AdInquiryModal'));
const AirdropModal = React.lazy(() => import('./AirdropModal'));
const SentinelModal = React.lazy(() => import('./SentinelModal'));
const LeaderboardModal = React.lazy(() => import('./LeaderboardModal'));

const ScannerModal = React.lazy(() => import('./ScannerModal'));
const AnalyticsModal = React.lazy(() => import('./AnalyticsModal'));
const NewsModal = React.lazy(() => import('./NewsModal'));
const MediaScreen = React.lazy(() => import('./screens/MediaScreen'));
const ChatScreen = React.lazy(() => import('./screens/ChatScreen'));

// Modern sleek loading indicator for lazy-loaded tabs
const LazyPreloader = () => (
    <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md z-[200] flex flex-col items-center justify-center font-mono text-brand-cyan text-[10px] uppercase tracking-[0.2em] gap-3">
        <div className="w-10 h-10 border border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin"></div>
        <p className="animate-pulse">Connecting neural module...</p>
    </div>
);

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
        setShowSentinel,
        showLeaderboard,
        setShowLeaderboard
    } = useStore();

    const goHome = () => navigateTo('home');

    return (
        <ErrorBoundary>
            <React.Suspense fallback={<LazyPreloader />}>
                {/* Full Screen Screens (Z-110) */}
                <div className="relative z-[110]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'portfolio' && <PortfolioScreen key="portfolio" onClose={goHome} />}
                        {activeTab === 'signals' && <SignalsScreen key="signals" onClose={goHome} />}
                        {activeTab === 'profile' && <ProfileScreen key="profile" onClose={goHome} />}
                        {activeTab === 'media' && <MediaScreen key="media" onClose={goHome} />}
                        
                        {activeTab === 'scanner' && <ScannerModal key="scanner" onClose={goHome} />}
                        {activeTab === 'analytics' && <AnalyticsModal key="analytics" onClose={goHome} />}
                        {activeTab === 'news' && <NewsModal key="news" onClose={goHome} />}
                    </AnimatePresence>
                </div>
                
                {/* Secondary Modals (Z-150+) */}
                <div className="relative z-[150]">
                    <AnimatePresence>
                        {showReferral && <ReferralModal key="referral" onClose={() => setShowReferral(false)} />}
                        {showCalendar && <CalendarModal key="calendar" onClose={() => setShowCalendar(false)} />}
                        {isSubscriptionOpen && <SubscriptionModal key="subscription" onClose={() => setSubscriptionOpen(false)} />}
                        {showAdInquiry && <AdInquiryModal key="adinquiry" onClose={() => setShowAdInquiry(false)} />}
                        {showAirdrop && <AirdropModal key="airdrop" onClose={() => setShowAirdrop(false)} />}
                        {showSentinel && <SentinelModal key="sentinel" onClose={() => setShowSentinel(false)} />}
                        {showLeaderboard && <LeaderboardModal key="leaderboard" onClose={() => setShowLeaderboard(false)} />}
                    </AnimatePresence>
                </div>

                {/* AI Chat (Top Layer Z-200) */}
                <AnimatePresence>
                    {isAIChatOpen && <ChatScreen key="chat" onClose={() => setIsAIChatOpen(false)} />}
                </AnimatePresence>
            </React.Suspense>
        </ErrorBoundary>
    );
};

export default ModalManager;
