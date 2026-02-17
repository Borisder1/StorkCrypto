import { StateCreator } from 'zustand';
import { StoreState, AppSlice, SubscriptionRequest, WhaleTransaction } from '../../types';
import { getDeviceId, supabase } from '../../services/supabaseClient';

export const createAppSlice: StateCreator<StoreState, [], [], AppSlice> = (set, get) => ({
    settings: {
        language: 'en', theme: 'cyan', themeMode: 'twilight', riskLevel: 'CONSERVATIVE',
        isAuthenticated: false,
        soundEnabled: false,
        adsEnabled: true, dataSaver: false,
        onboardingComplete: false, marketOverride: 'NORMAL',
        adminTreasuryWallet: 'UQAz12...88nxP',
        xpToProRate: 500,
        pendingSubRequests: [],
        subscriptionPlans: [
            { id: 'PRO', name: 'PRO', price: 9.99, features: ['Unlimited Signals', 'No Ads'] },
            { id: 'WHALE', name: 'WHALE', price: 49.99, features: ['On-Chain Intel', 'Personal Advisor'] }
        ]
    },
    updateSettings: (newSettings) => set(state => ({ settings: { ...state.settings, ...newSettings } })),
    activeTab: 'home',
    navigateTo: (tab) => set({ activeTab: tab }),
    isAIChatOpen: false,
    setIsAIChatOpen: (isOpen) => set({ isAIChatOpen: isOpen }),
    showCalendar: false,
    setShowCalendar: (show) => set({ showCalendar: show }),
    showReferral: false,
    setShowReferral: (show) => set({ showReferral: show }),
    showAirdrop: false,
    setShowAirdrop: (show) => set({ showAirdrop: show }),

    claimMining: async () => {
        const state = get();
        const userId = state.userStats.id;
        const now = Date.now();
        const lastClaim = new Date(state.userStats.mining.lastClaimTime).getTime();
        const diffSeconds = Math.min((now - lastClaim) / 1000, state.userStats.mining.storageCapacity * 3600);
        const estimatedEarned = diffSeconds * state.userStats.mining.miningRate;

        if (estimatedEarned < 0.01) return;

        const newBalance = state.userStats.storkBalance + estimatedEarned;
        const newTime = new Date().toISOString();

        set(s => ({
            userStats: {
                ...s.userStats,
                storkBalance: newBalance,
                mining: { ...s.userStats.mining, lastClaimTime: newTime }
            }
        }));

        if (userId && userId !== 'INIT' && !userId.startsWith('GUEST')) {
            try {
                await supabase.from('profiles').update({
                    stork_balance: newBalance,
                    last_claim_time: newTime
                }).eq('id', userId);
            } catch (e) {
                console.error("Failed to sync mining claim to DB");
            }
        }
    },

    upgradeMining: (type) => {
        const state = get();
        const cost = type === 'RATE' ? 500 : 300; // 500 STORK for Rate, 300 for Storage

        if (state.userStats.storkBalance < cost) {
            get().showToast('Insufficient STORK for Upgrade');
            return;
        }

        const newMining = { ...state.userStats.mining };
        if (type === 'RATE') newMining.miningRate += 0.01;
        if (type === 'STORAGE') newMining.storageCapacity += 4;

        set(s => ({
            userStats: {
                ...s.userStats,
                storkBalance: s.userStats.storkBalance - cost,
                mining: newMining
            }
        }));

        get().showToast(`Mining ${type === 'RATE' ? 'Speed' : 'Storage'} Upgraded!`);
        get().grantXp(50, 'Upgrade_Module');
    },

    completeAirdropTask: async (taskId) => {
        const state = get();
        const task = state.userStats.tasks.find(t => t.id === taskId);
        if (task && !task.isCompleted) {
            set(s => ({
                userStats: {
                    ...s.userStats,
                    storkBalance: s.userStats.storkBalance + task.reward,
                    tasks: s.userStats.tasks.map(t => t.id === taskId ? { ...t, isCompleted: true } : t)
                }
            }));
            const userId = state.userStats.id;
            if (userId && userId !== 'INIT' && !userId.startsWith('GUEST')) {
                await supabase.rpc('claim_task_reward', { user_id_input: userId, task_id_input: taskId, reward_amount: task.reward });
            }
        }
    },

    partnerTasks: [],
    addPartnerTask: (task) => set(state => ({ partnerTasks: [...state.partnerTasks, task] })),
    removePartnerTask: (id) => set(state => ({ partnerTasks: state.partnerTasks.filter(t => t.id !== id) })),
    activeBanners: [{ id: 'd1', title: 'Bybit Bonus', subtitle: 'Join Now', link: 'https://bybit.com', colorFrom: '#F7A600', colorTo: '#000000', active: true }],
    addBanner: (banner) => set(state => ({ activeBanners: [...state.activeBanners, banner] })),
    removeBanner: (id) => set(state => ({ activeBanners: state.activeBanners.filter(b => b.id !== id) })),

    showSentinel: false,
    setShowSentinel: (show) => set({ showSentinel: show }),
    updateSentinelConfig: (config) => set(state => ({
        userStats: { ...state.userStats, sentinel: { ...state.userStats.sentinel, ...config } }
    })),

    toast: { visible: false, message: '' },
    showToast: (message) => {
        set({ toast: { visible: true, message } });
        setTimeout(() => set({ toast: { visible: false, message: '' } }), 3000);
    },
    isSubscriptionOpen: false,
    setSubscriptionOpen: (open) => set({ isSubscriptionOpen: open }),

    network: { latency: 42, status: 'OPTIMAL', lastSync: new Date().toISOString() },
    updateNetwork: (latency) => set(state => ({ network: { latency, status: 'OPTIMAL', lastSync: new Date().toISOString() } })),
    maintenanceMode: false,
    toggleMaintenance: (val) => set({ maintenanceMode: val }),

    userStats: {
        id: 'INIT', username: 'GUEST', firstName: 'OPERATOR',
        storkBalance: 0, signalsGenerated: 0, subscriptionTier: 'FREE',
        trialActive: true,
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        xp: 0, level: 1, referralCount: 0, demoBalance: 10000,
        shadowHistory: [], role: 'USER',
        mining: { isActive: true, miningRate: 0.01, lastClaimTime: new Date().toISOString(), storageCapacity: 8 },
        tasks: [
            { id: 't1', title: 'Connect Wallet', reward: 500, icon: 'WALLET', isCompleted: false },
            { id: 't2', title: 'Join Channel', reward: 1000, icon: 'TELEGRAM', isCompleted: false, link: 'https://t.me/StorkCrypto' }
        ],
        sentinel: { active: false, whaleThreshold: 500000, trackWhales: true, trackVolatility: true, trackSentiment: false, quietHoursStart: '23:00', quietHoursEnd: '07:00' }
    },

    checkTrialStatus: () => set(state => ({ userStats: { ...state.userStats, trialActive: new Date() < new Date(state.userStats.trialEndsAt) } })),
    hasProAccess: () => get().userStats.subscriptionTier !== 'FREE' || get().userStats.trialActive,

    whaleHistory: [],
    addWhaleTransaction: (tx) => set(state => ({ whaleHistory: [tx, ...state.whaleHistory].slice(0, 50) })),
    getWhaleStats: () => ({ buyVolume1h: 0, sellVolume1h: 0, netFlow1h: 0, sentimentBias: 'NEUTRAL' }),

    grantXp: (amount) => {
        const state = get();
        const newXp = state.userStats.xp + amount;
        set(s => ({ userStats: { ...s.userStats, xp: newXp, level: Math.floor(newXp / 500) + 1 } }));
        if (state.userStats.id !== 'INIT' && !state.userStats.id.startsWith('GUEST')) {
            supabase.from('profiles').update({ xp: newXp }).eq('id', state.userStats.id).then();
        }
    },

    upgradeUserTier: (tier) => set(s => ({ userStats: { ...s.userStats, subscriptionTier: tier as any } })),
    redeemXpForPro: (days) => { get().showToast('XP Redeemed'); },
    getRankName: () => 'DATA_SENTINEL',
    levelUpState: { visible: false, level: 1, rewards: [] },
    closeLevelUp: () => set(state => ({ levelUpState: { ...state.levelUpState, visible: false } })),
    notifications: [],
    customNews: [],
    injectNews: (news) => set(state => ({ customNews: [news, ...state.customNews] })),
    chatHistory: [],
    addChatMessage: (msg) => set(state => ({ chatHistory: [...state.chatHistory, msg] })),
    clearChat: () => set({ chatHistory: [] }),
    strategies: [],
    saveStrategy: (s) => set(state => ({ strategies: [...state.strategies, s] })),
    deleteStrategy: (id) => set(state => ({ strategies: state.strategies.filter(s => s.id !== id) })),
    alerts: [],
    addAlert: (a) => set(state => ({ alerts: [...state.alerts, a] })),
    removeAlert: (id) => set(state => ({ alerts: state.alerts.filter(a => a.id !== id) })),
    quests: [],
    claimQuestReward: (id) => { },
    updateQuestProgress: (type, amount) => { },
    copiedTraders: [],
    copyTrader: (trader, config) => { },
    stopCopying: (id) => { },
    updateCopiedTraderPnL: (id, change, isProfit) => { },
    socialFeed: [],
    following: [],
    followUser: (id) => { },
    unfollowUser: (id) => { },
    isPublicProfile: true,
    togglePublicProfile: () => { },
    watchlist: ['BTC', 'ETH'],
    focusedAcademyId: null,
    adRequests: [],
    submitAdRequest: (req) => { },
    updateAdRequestStatus: (id, status) => { },
    fetchAdRequests: () => { },
    updateSubscriptionPrice: (tier, price) => { },
    requestSubscriptionAction: (userId, planId, method, txHash) => { },
    processSubscriptionRequest: (requestId, approve) => { },
    telegramBotConnected: false,
    connectTelegramBot: () => set({ telegramBotConnected: true }),

    syncUserData: async (tgUser) => {
        let id = getDeviceId();
        if (tgUser?.id) id = `tg_${tgUser.id}`;

        try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();

            if (profile) {
                set(state => ({
                    userStats: {
                        ...state.userStats,
                        id: profile.id,
                        firstName: profile.first_name || state.userStats.firstName,
                        xp: Number(profile.xp) || 0,
                        storkBalance: Number(profile.stork_balance) || 0,
                        subscriptionTier: (profile.subscription_tier as any) || 'FREE'
                    }
                }));

                // Update existing profile with latest TG info
                if (tgUser) {
                    await supabase.from('profiles').update({
                        first_name: tgUser.first_name || 'OPERATOR',
                        username: tgUser.username || '',
                        last_active: new Date().toISOString()
                    }).eq('id', id);
                }
            } else {
                // Use upsert to prevent 409 Conflict if record was created between select and insert
                const { error: insErr } = await supabase.from('profiles').upsert({
                    id,
                    first_name: tgUser?.first_name || 'OPERATOR',
                    username: tgUser?.username || '',
                    telegram_chat_id: tgUser?.telegram_chat_id || null,
                    trial_ends_at: get().userStats.trialEndsAt,
                    subscription_tier: get().userStats.subscriptionTier,
                    last_active: new Date().toISOString()
                }); // Removed { onConflict: 'id' } as it causes 400 in PostgREST without explicit column

                if (insErr) console.warn("Profile Upsert Warning:", insErr.message);
            }
        } catch (e) {
            console.warn("DB_UPLINK_OFFLINE");
        } finally {
            set(state => ({ userStats: { ...state.userStats, id } }));
        }
    },

    redeemReferral: async (referrerId) => { },
    exportData: () => { },
    importData: (data) => { },
    showAdInquiry: false,
    setShowAdInquiry: (show) => set({ showAdInquiry: show }),
    fetchPendingSubscriptions: async () => { },
    adminBroadcast: null,
    sendBroadcast: (message, type) => { set({ adminBroadcast: { message, type, id: Date.now().toString() } }); }
});