
import { StateCreator } from 'zustand';
import { StoreState, AuthSlice } from '../../types';
import { supabase } from '../../services/supabaseClient';

// Твій email адміністратора (оновлено)
const ADMIN_EMAIL = 'storkcrypto90@gmail.com';

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get) => ({
    login: async (type, email, password) => {
        let userId = get().userStats.id;
        let isAdmin = false;
        let isFullyAuthenticated = false;

        try {
            // 1. GUEST MODE SHORTCUT
            if (type === 'guest') {
                set(state => ({ 
                    settings: { ...state.settings, isAuthenticated: true },
                    userStats: { ...state.userStats, role: 'USER', id: 'GUEST_' + Math.random().toString(36).substr(2, 5) }
                }));
                return { success: true };
            }

            // 2. EMAIL LOGIN
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
                    // Check against admin email (case-insensitive)
                    if (data.user.email && data.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                        isAdmin = true;
                    }
                }
            } 

            // 3. TELEGRAM / OTHER (Placeholder)

            // 4. UPDATE STORE
            set(state => ({ 
                settings: { ...state.settings, isAuthenticated: true },
                userStats: {
                    ...state.userStats,
                    id: userId,
                    role: isAdmin ? 'ADMIN' : 'USER',
                    subscriptionTier: isAdmin ? 'WHALE' : state.userStats.subscriptionTier
                }
            }));

            // 5. DB SYNC (Only for Real Users)
            if (isFullyAuthenticated) {
                const userProfile = {
                    id: userId, 
                    role: isAdmin ? 'ADMIN' : 'USER',
                    subscription_tier: isAdmin ? 'WHALE' : 'FREE',
                    last_active: new Date().toISOString()
                };

                // Upsert profile with updated role
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
        await (supabase.auth as any).signOut();
        set(state => ({ 
            settings: { ...state.settings, isAuthenticated: false },
            userStats: { ...state.userStats, role: 'USER' } 
        }));
    },
});
