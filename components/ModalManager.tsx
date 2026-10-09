import React, { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import ErrorBoundary from './ErrorBoundary';
import { useScrollLock } from '../utils/useScrollLock';

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
const WhaleRadarProModal = React.lazy(() => import('./WhaleRadarProModal'));
const StrategyBuilderModal = React.lazy(() => import('./StrategyBuilderModal'));
const SentimentPulseModal = React.lazy(() => import('./SentimentPulseModal'));
const LiquidationHeatmapModal = React.lazy(() => import('./LiquidationHeatmapModal'));
const TaxCalculatorModal = React.lazy(() => import('./TaxCalculatorModal'));
const CompetitorComparisonModal = React.lazy(() => import('./CompetitorComparisonModal'));

const ScannerModal = React.lazy(() => import('./ScannerModal'));
const AnalyticsModal = React.lazy(() => import('./AnalyticsModal'));
const NewsModal = React.lazy(() => import('./NewsModal'));
const MediaScreen = React.lazy(() => import('./screens/MediaScreen'));
const ChatScreen = React.lazy(() => import('./screens/ChatScreen'));
const CategorizedHubModal = React.lazy(() => import('./CategorizedHubModal').then(m => ({ default: m.CategorizedHubModal })));

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
        setShowLeaderboard,
        showWhaleRadar,
        setShowWhaleRadar,
        showStrategyBuilder,
        setShowStrategyBuilder,
        showSentimentPulse,
        setShowSentimentPulse,
        showLiquidationHeatmap,
        setShowLiquidationHeatmap,
        showTaxCalculator,
        setShowTaxCalculator,
        showCompetitorMatrix,
        setShowCompetitorMatrix
    } = useStore();

    const hasOpenModal = Boolean(
        showReferral || showCalendar || isSubscriptionOpen || showAdInquiry || 
        showAirdrop || showSentinel || showLeaderboard || showWhaleRadar || 
        showStrategyBuilder || showSentimentPulse || showLiquidationHeatmap || 
        showTaxCalculator || showCompetitorMatrix || isAIChatOpen || activeTab !== 'home'
    );

    useScrollLock(hasOpenModal);

    // Global keyboard Escape handler to close modals cleanly
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isAIChatOpen) { setIsAIChatOpen(false); return; }
                if (showReferral) { setShowReferral(false); return; }
                if (showCalendar) { setShowCalendar(false); return; }
                if (isSubscriptionOpen) { setSubscriptionOpen(false); return; }
                if (showAdInquiry) { setShowAdInquiry(false); return; }
                if (showAirdrop) { setShowAirdrop(false); return; }
                if (showSentinel) { setShowSentinel(false); return; }
                if (showLeaderboard) { setShowLeaderboard(false); return; }
                if (showWhaleRadar) { setShowWhaleRadar(false); return; }
                if (showStrategyBuilder) { setShowStrategyBuilder(false); return; }
                if (showSentimentPulse) { setShowSentimentPulse(false); return; }
                if (showLiquidationHeatmap) { setShowLiquidationHeatmap(false); return; }
                if (showTaxCalculator) { setShowTaxCalculator(false); return; }
                if (showCompetitorMatrix) { setShowCompetitorMatrix(false); return; }
                if (activeTab !== 'home') { navigateTo('home'); return; }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        isAIChatOpen, showReferral, showCalendar, isSubscriptionOpen, showAdInquiry,
        showAirdrop, showSentinel, showLeaderboard, showWhaleRadar,
        showStrategyBuilder, showSentimentPulse, showLiquidationHeatmap,
        showTaxCalculator, showCompetitorMatrix, activeTab, navigateTo,
        setIsAIChatOpen, setShowReferral, setShowCalendar, setSubscriptionOpen,
        setShowAdInquiry, setShowAirdrop, setShowSentinel, setShowLeaderboard,
        setShowWhaleRadar, setShowStrategyBuilder, setShowSentimentPulse,
        setShowLiquidationHeatmap, setShowTaxCalculator, setShowCompetitorMatrix
    ]);

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
                        {activeTab === 'more' && <CategorizedHubModal key="more" isOpen={true} onClose={goHome} />}
                    </AnimatePresence>
                </div>
                
                {/* Secondary Modals (Z-150+) - Strictly Single Modal Invariant (active modal count <= 1) */}
                <div className="relative z-[150]">
                    <AnimatePresence mode="wait">
                        {(() => {
                            // 1. Subscription Exception -> Compact Presentation
                            if (isSubscriptionOpen) {
                                return <SubscriptionModal key="subscription" onClose={() => setSubscriptionOpen(false)} />;
                            }
                            // 2. All other modals -> Fullscreen Presentation (100vw x 100dvh)
                            if (showReferral) {
                                return (
                                    <div key="referral" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <ReferralModal onClose={() => setShowReferral(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showCalendar) {
                                return (
                                    <div key="calendar" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <CalendarModal onClose={() => setShowCalendar(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showAirdrop) {
                                return (
                                    <div key="airdrop" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <AirdropModal onClose={() => setShowAirdrop(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showSentinel) {
                                return (
                                    <div key="sentinel" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <SentinelModal onClose={() => setShowSentinel(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showLeaderboard) {
                                return (
                                    <div key="leaderboard" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showWhaleRadar) {
                                return (
                                    <div key="whaleradar" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <WhaleRadarProModal onClose={() => setShowWhaleRadar(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showStrategyBuilder) {
                                return (
                                    <div key="strategybuilder" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <StrategyBuilderModal onClose={() => setShowStrategyBuilder(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showSentimentPulse) {
                                return (
                                    <div key="sentimentpulse" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <SentimentPulseModal onClose={() => setShowSentimentPulse(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showLiquidationHeatmap) {
                                return (
                                    <div key="liqheatmap" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <LiquidationHeatmapModal onClose={() => setShowLiquidationHeatmap(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showTaxCalculator) {
                                return (
                                    <div key="taxcalc" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <TaxCalculatorModal onClose={() => setShowTaxCalculator(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showCompetitorMatrix) {
                                return (
                                    <div key="competitormatrix" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <CompetitorComparisonModal onClose={() => setShowCompetitorMatrix(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            if (showAdInquiry) {
                                return (
                                    <div key="adinquiry" className="modal-layer modal-layer--fullscreen">
                                        <div data-modal-panel className="modal-panel">
                                            <AdInquiryModal onClose={() => setShowAdInquiry(false)} />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </AnimatePresence>
                </div>

                {/* AI Chat (Top Layer Z-200) */}
                <AnimatePresence>
                    {isAIChatOpen && (
                        <div className="fixed inset-0 z-[200] overflow-hidden" role="region" aria-label="AI Chat Layer">
                            <ChatScreen key="chat" onClose={() => setIsAIChatOpen(false)} />
                        </div>
                    )}
                </AnimatePresence>
            </React.Suspense>
        </ErrorBoundary>
    );
};

export default ModalManager;
