
export type Language = 'en' | 'ua' | 'pl';
export type ThemeColor = 'cyan' | 'purple' | 'green';
export type ThemeMode = 'midnight' | 'dark' | 'concrete' | 'solar' | 'matrix' | 'vaporwave' | 'twilight';
export type NavItem = 'home' | 'signals' | 'scanner' | 'news' | 'media' | 'portfolio' | 'profile' | 'analytics';
export type RiskLevel = 'CONSERVATIVE' | 'AGGRESSIVE';
export type MarketOverride = 'NORMAL' | 'PUMP' | 'DUMP';

export interface Asset {
    ticker: string;
    name: string;
    icon: string;
    amount: number;
    value: number;
    change: number;
    buyPrice?: number;
    volatilityScore?: number;
}

export interface Transaction {
    id: string;
    hash: string;
    type: 'SEND' | 'RECEIVE' | 'SWAP' | 'CONTRACT_INTERACTION';
    asset: string;
    amount: number;
    counterparty?: string;
    status: 'CONFIRMED' | 'PENDING';
    timestamp: string;
}

export interface Position {
    id: string;
    ticker: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    currentPrice: number;
    amount: number;
    leverage: number;
    size: number;
    liquidationPrice: number;
    openTime: string;
    pnl: number;
    roi: number;
    tp?: number;
    sl?: number;
}

export interface MiningStats {
    isActive: boolean;
    miningRate: number; // Tokens per second
    lastClaimTime: string; // ISO String
    storageCapacity: number; // Max hours (e.g., 8)
}

export interface AirdropTask {
    id: string;
    title: string;
    reward: number;
    icon: 'TELEGRAM' | 'TWITTER' | 'WALLET' | 'INVITE' | 'PARTNER';
    isCompleted: boolean;
    link?: string;
    isPartner?: boolean; // Custom tasks via Admin
}

export interface BannerConfig {
    id: string;
    title: string;
    subtitle: string;
    link: string;
    colorFrom: string;
    colorTo: string;
    active: boolean;
}

export interface SentinelConfig {
    active: boolean;
    whaleThreshold: number; // USD value
    trackWhales: boolean;
    trackVolatility: boolean;
    trackSentiment: boolean;
    quietHoursStart: string; // "22:00"
    quietHoursEnd: string; // "07:00"
}

export interface UserStats {
    id: string;
    username?: string;
    firstName?: string;
    storkBalance: number;
    signalsGenerated: number;
    subscriptionTier: 'FREE' | 'PRO' | 'WHALE';
    trialActive: boolean;
    trialEndsAt: string;
    xp: number;
    level: number;
    referralCount: number; // PHASE 2
    demoBalance: number;
    shadowHistory: ShadowTrade[];
    role: 'USER' | 'ADMIN';
    mining: MiningStats;
    tasks: AirdropTask[];
    sentinel: SentinelConfig;
}

export interface ShadowTrade {
    id: string;
    asset: string;
    entry: number;
    exit: number;
    pnl: number;
    timestamp: string;
    aiComment: string;
}

export interface WhaleTransaction {
    id: string;
    asset: string;
    amount: number;
    valueUsd: number;
    from: string;
    to: string;
    type: 'EXCHANGE_INFLOW' | 'WHALE_ACCUMULATION';
    timestamp: string;
    aiComment: string;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'ALERT' | 'SUCCESS';
    read: boolean;
    timestamp: string;
}

export interface NewsArticle {
    headline: string;
    summary: string;
    sources?: { uri: string; title: string }[];
    sentimentMock?: 'POS' | 'NEG' | 'NEU';
    isVerified?: boolean;
    isFud?: boolean;
}

export interface InfluencerPost {
    id: string;
    author: string;
    handle: string;
    text: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    time: string;
    avatar: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isAudit?: boolean;
}

export interface SearchStrategy {
    id: string;
    name: string;
    conditions: StrategyCondition[];
    isActive: boolean;
}

export interface StrategyCondition {
    id: string;
    indicator: 'RSI' | 'VOLUME' | 'PRICE' | 'CHANGE_24H';
    operator: 'GREATER' | 'LESS' | 'EQUAL';
    value: number;
}

export interface PriceAlert {
    id: string;
    asset: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    active: boolean;
    createdAt: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    rewardXp: number;
    progress: number;
    target: number;
    isClaimed: boolean;
    type: 'TRADE' | 'SCAN' | 'SOCIAL';
}

export interface CopiedTrader {
    id: string;
    name: string;
    roi: number;
    tvl: number;
    winRate: number;
    riskScore: number;
    activeVault?: CopyVaultConfig;
}

export interface CopyVaultConfig {
    collateral: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    status: 'ACTIVE' | 'PAUSED';
    currentPnL: number;
}

export interface SocialActivity {
    id: string;
    userName: string;
    type: 'TRADE_PROFIT' | 'TRADE_OPEN' | 'RANK_UP';
    asset?: string;
    value?: string;
    timestamp: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    features: string[];
}

export interface SubscriptionRequest {
    id: string;
    userId: string;
    planId: string;
    method: 'TON' | 'STRIPE' | 'CRYPTO' | 'STARS';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    timestamp: string;
    txHash?: string;
}

export interface MarketPriceMap {
    [key: string]: {
        usd: number;
        usd_24h_change: number;
        lastUpdate: number;
        source: 'BINANCE' | 'COINCAP' | 'GEKO' | 'CACHE';
    };
}

export interface AgentAnalysis {
    market_sentiment_score: number;
    market_phase: string;
    macro_context?: {
        btc_dominance: number;
        session: 'ASIAN' | 'LONDON' | 'NEW_YORK';
        volatility_index: 'LOW' | 'MED' | 'HIGH';
    };
    signals: TradingSignal[];
}

export interface TradingSignal {
    signal_type: 'LONG' | 'SHORT';
    strategy_type: 'SCALP' | 'SWING' | 'BREAKOUT' | 'REVERSAL';
    asset: string;
    entry_zone: string;
    confidence: number;
    timeframe: string;
    technical_summary: string;
    reasoning_chain: string[];
    entryPrice: number;
    takeProfit: number;
    stopLoss: number;
    valid_until?: number;
}

export interface AssetReport {
    ticker: string;
    summary: string;
    score: number;
}

export interface MarketBriefing {
    headline: string;
    key_takeaways: string[];
}

export interface MarketNarrative {
    name: string;
    strength: number;
    color: string;
    bg: string;
}

export interface AssetMetrics {
    ticker: string;
    price: number;
    change: number;
    rsi: number;
    volatility: string;
    signal: string;
    isRealData: boolean;
    category?: string;
}

export interface MomentumData {
    ticker: string;
    change_1h: number;
    velocity: 'PUMP' | 'DUMP' | 'STABLE';
}

export type PatternType = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface AcademyTerm {
    id: string;
    term: string;
    category: 'TECHNICAL' | 'PATTERNS' | 'PSYCHOLOGY' | 'SECURITY';
    definition: string;
    example: string;
    visualType?: VisualType;
}

export type VisualType = 'NONE' | 'CHART_HEAD_SHOULDERS' | 'CHART_DOUBLE_TOP' | 'CHART_DOUBLE_BOTTOM' | 'CHART_BULL_FLAG' | 'CHART_CUP_HANDLE' | 'CHART_ASC_TRIANGLE' | 'CHART_DESC_TRIANGLE' | 'CHART_WEDGE_BULL' | 'CHART_WEDGE_BEAR' | 'CANDLE_DOJI';

export interface AppSettings {
    language: Language;
    theme: ThemeColor;
    themeMode: ThemeMode;
    riskLevel: RiskLevel;
    isAuthenticated: boolean;
    soundEnabled: boolean;
    adsEnabled: boolean;
    dataSaver: boolean;
    onboardingComplete: boolean;
    marketOverride: MarketOverride;
    adminTreasuryWallet: string;
    xpToProRate: number;
    pendingSubRequests: SubscriptionRequest[];
    subscriptionPlans: SubscriptionPlan[];
}

export interface AuthSlice {
    login: (type: 'email' | 'google' | 'telegram' | 'guest', email?: string, password?: string) => Promise<{ success: boolean; message?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
}

export interface TradeSlice {
    assets: Asset[];
    marketPrices: MarketPriceMap; // NEW: Shared prices
    updateMarketPrices: (prices: MarketPriceMap) => void;
    addAsset: (asset: Asset) => void;
    updateAssetPrice: (ticker: string, price: number, change: number) => void;
    positions: Position[];
    openPosition: (ticker: string, side: 'LONG' | 'SHORT', margin: number, leverage: number, price: number, tp?: number, sl?: number) => void;
    liquidateAll: () => void;
    wallet: { isConnected: boolean; address: string | null; totalValueUsd: number; isSyncing: boolean; walletType?: string; chain?: string; balance?: string; txHistory: Transaction[] };
    connectWallet: (address: string, walletType: string, chain: string) => void;
    disconnectWallet: () => void;
    syncChainAssets: () => Promise<void>;
    swapState: { isOpen: boolean; fromToken: string; toToken: string; amount?: number };
    openSwap: (from: string, to: string, amount?: number) => void;
    closeSwap: () => void;
    executeSwap: (from: string, to: string, amount: number, toAmount: number) => Promise<{ success: boolean }>;
}

export interface WhaleStats {
    buyVolume1h: number;
    sellVolume1h: number;
    netFlow1h: number;
    sentimentBias: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL';
}

export interface AppSlice {
    whaleHistory: WhaleTransaction[];
    addWhaleTransaction: (tx: WhaleTransaction) => void;
    getWhaleStats: () => WhaleStats;
    settings: AppSettings;
    updateSettings: (settings: Partial<AppSettings>) => void;
    activeTab: NavItem;
    navigateTo: (tab: NavItem) => void;
    isAIChatOpen: boolean;
    setIsAIChatOpen: (isOpen: boolean) => void;
    showCalendar: boolean;
    setShowCalendar: (show: boolean) => void;
    showReferral: boolean;
    setShowReferral: (show: boolean) => void;

    showAirdrop: boolean;
    setShowAirdrop: (show: boolean) => void;
    claimMining: () => void;
    upgradeMining: (type: 'RATE' | 'STORAGE') => void; // NEW
    completeAirdropTask: (taskId: string) => void;

    // NEW: Partner Tasks & Banners
    partnerTasks: AirdropTask[];
    addPartnerTask: (task: AirdropTask) => void;
    removePartnerTask: (id: string) => void;
    activeBanners: BannerConfig[];
    addBanner: (banner: BannerConfig) => void;
    removeBanner: (id: string) => void;

    // NEW: Sentinel Config Management
    showSentinel: boolean;
    setShowSentinel: (show: boolean) => void;
    updateSentinelConfig: (config: Partial<SentinelConfig>) => void;

    toast: { visible: boolean; message: string };
    showToast: (message: string) => void;
    isSubscriptionOpen: boolean;
    setSubscriptionOpen: (open: boolean) => void;
    network: { latency: number; status: 'OPTIMAL' | 'DEGRADED' | 'OFFLINE'; lastSync: string };
    updateNetwork: (latency: number) => void;
    maintenanceMode: boolean;
    toggleMaintenance: (val: boolean) => void;
    userStats: UserStats;
    grantXp: (amount: number, reason: string) => void;
    upgradeUserTier: (tier: string, days?: number) => void;
    redeemXpForPro: (days: number) => void;
    checkTrialStatus: () => void;
    hasProAccess: () => boolean;
    getRankName: () => string;
    levelUpState: { visible: boolean; level: number; rewards: string[] };
    closeLevelUp: () => void;
    notifications: AppNotification[];
    customNews: NewsArticle[];
    injectNews: (news: NewsArticle) => void;
    chatHistory: ChatMessage[];
    addChatMessage: (msg: ChatMessage) => void;
    clearChat: () => void;
    strategies: SearchStrategy[];
    saveStrategy: (s: SearchStrategy) => void;
    deleteStrategy: (id: string) => void;
    alerts: PriceAlert[];
    addAlert: (a: PriceAlert) => void;
    removeAlert: (id: string) => void;
    quests: Quest[];
    claimQuestReward: (id: string) => void;
    updateQuestProgress: (type: 'TRADE' | 'SCAN' | 'SOCIAL', amount: number) => void;
    copiedTraders: CopiedTrader[];
    copyTrader: (trader: CopiedTrader, config: CopyVaultConfig) => void;
    stopCopying: (id: string) => void;
    updateCopiedTraderPnL: (traderId: string, pnlChange: number, isProfit: boolean) => void;
    socialFeed: SocialActivity[];
    following: string[];
    followUser: (id: string) => void;
    unfollowUser: (id: string) => void;
    isPublicProfile: boolean;
    togglePublicProfile: () => void;
    watchlist: string[];
    focusedAcademyId: string | null;
    adRequests: any[];
    submitAdRequest: (req: any) => void;
    updateAdRequestStatus: (id: string, status: string) => void;
    fetchAdRequests: () => void;
    updateSubscriptionPrice: (tier, price) => void;
    requestSubscriptionAction: (userId: string, planId: string, method: 'TON' | 'STRIPE' | 'CRYPTO' | 'STARS', txHash?: string) => void;
    processSubscriptionRequest: (requestId: string, approve: boolean) => void;
    telegramBotConnected: boolean;
    connectTelegramBot: () => void;
    syncUserData: (tgUser?: any) => void;
    redeemReferral: (referrerId: string) => void;
    exportData: () => void;
    importData: (data: string) => void;
    showAdInquiry: boolean;
    setShowAdInquiry: (show: boolean) => void;
    fetchPendingSubscriptions: () => Promise<void>;

    adminBroadcast: { message: string; type: 'INFO' | 'ALERT' | 'SUCCESS'; id: string } | null;
    sendBroadcast: (message: string, type: 'INFO' | 'ALERT' | 'SUCCESS') => void;
}

export type StoreState = AuthSlice & TradeSlice & AppSlice;
