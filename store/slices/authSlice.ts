
import { StateCreator } from 'zustand';
import { StoreState, AuthSlice } from '../../types';
import { supabase } from '../../services/supabaseClient';

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get) => ({
    login: async (type, email, password) => {
        let userId = get().userStats.id;
        let isAdmin = false;
        let isFullyAuthenticated = false;

        try {
            // 1. GUEST MODE SHORTCUT - strictly standard USER privileges, never admin
            if (type === 'guest') {
                set(state => ({ 
                    settings: { ...state.settings, isAuthenticated: true },
                    userStats: { 
                        ...state.userStats, 
                        role: 'USER', 
                        subscriptionTier: 'FREE',
                        id: 'GUEST_' + Math.random().toString(36).substr(2, 5) 
                    }
                }));
                return { success: true };
            }

            // 2. EMAIL LOGIN (Server-side Supabase Auth only, zero hardcoded credentials)
            if (type === 'email' && email && password) {
                const { data, error } = await (supabase.auth as any).signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    return { success: false, message: error.message };
                }

                if (data.user) {
                    userId = data.user.id; 
                    isFullyAuthenticated = true;
                    // Determine admin privileges exclusively from server-side claims / app_metadata
                    const appMeta = data.user.app_metadata || {};
                    const userMeta = data.user.user_metadata || {};
                    if (appMeta.role === 'admin' || userMeta.role === 'admin') {
                        isAdmin = true;
                    }
                }
            } 

            // 3. TELEGRAM / OTHER
            let username = 'GUEST_PILOT';
            if (type === 'telegram') {
                try {
                    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
                    if (tgUser) {
                        userId = tgUser.id.toString();
                        username = tgUser.username || tgUser.first_name || 'TG_PILOT';
                    } else {
                        userId = 'TG_' + Math.random().toString(36).substr(2, 5);
                        username = 'WEB_PILOT';
                    }
                } catch (err) {
                    console.error("Telegram Auth Error:", err);
                }
            }

            // 4. UPDATE STORE (local state defaults to USER unless verified server-side)
            set(state => ({ 
                settings: { ...state.settings, isAuthenticated: true },
                userStats: {
                    ...state.userStats,
                    id: userId,
                    username: username !== 'GUEST_PILOT' ? username : state.userStats.username,
                    role: isAdmin ? 'ADMIN' : 'USER',
                    subscriptionTier: isAdmin ? 'WHALE' : state.userStats.subscriptionTier
                }
            }));

            // 5. DB SYNC (Only for Authenticated Users)
            if (isFullyAuthenticated) {
                const userProfile = {
                    id: userId, 
                    role: isAdmin ? 'ADMIN' : 'USER',
                    subscription_tier: isAdmin ? 'WHALE' : 'FREE',
                    last_active: new Date().toISOString()
                };

                const { error: dbError } = await supabase
                    .from('profiles')
                    .upsert(userProfile);

                if (dbError) {
                    console.error("DB Sync Warning:", dbError.message);
                }
            }

            return { success: true };

        } catch (e: any) {
            console.error("Login System Error:", e);
            return { success: false, message: e.message || 'System Error' };
        }
    },

    register: async (email, password) => {
        try {
            const { data, error } = await (supabase.auth as any).signUp({
                email,
                password,
            });

            if (error) return { success: false, message: error.message };
            
            if (data.user) {
                 await supabase.from('profiles').upsert({
                    id: data.user.id,
                    role: 'USER',
                    subscription_tier: 'FREE',
                    last_active: new Date().toISOString()
                 });
            }

            return { success: true, message: 'Account created! Please login.' };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    },

    logout: async () => {
        try {
            await (supabase.auth as any).signOut();
        } catch (err) {
            console.warn("SignOut notice:", err);
        }
        // Purge sensitive client caches on logout
        try {
            localStorage.removeItem('stork_ai_memory');
            sessionStorage.clear();
        } catch (_) {}

        set(state => ({ 
            settings: { ...state.settings, isAuthenticated: false },
            userStats: { 
                ...state.userStats, 
                role: 'USER',
                subscriptionTier: 'FREE'
            } 
        }));
    },
});
