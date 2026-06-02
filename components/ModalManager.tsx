import React from 'react';
import { AnimatePresence } from 'motion/react';
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
import LeaderboardModal from './LeaderboardModal';

import ScannerModal from './ScannerModal';
import AnalyticsModal from './AnalyticsModal';
import NewsModal from './NewsModal';
import MediaScreen from './screens/MediaScreen';
import ChatScreen from './screens/ChatScreen';

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
        </ErrorBoundary>
    );
};

export default ModalManager;