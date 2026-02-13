import { createClient } from '@supabase/supabase-js';

// ✅ ТВОЇ РЕАЛЬНІ ДАНІ
const SUPABASE_URL = 'https://ercabbqautbsktrgzbft.supabase.co'; 
// Fixed duplication error in key (removed repeated 'R7IY8mIt' segment)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyY2FiYnFhdXRic2t0cmd6YmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NzQ5MTgsImV4cCI6MjA3OTU1MDkxOH0.CuaPGcnZ3a144S_HAQs_cJMit8ztHXR7IY8mItRBOUE'; 

// Створення клієнта
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to get persistent user ID
export const getDeviceId = (): string => {
    try {
        // @ts-ignore
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser && tgUser.id) {
            return `tg_${tgUser.id}`;
        }
    } catch (e) {
        console.warn("Telegram WebApp data not available");
    }

    let deviceId = localStorage.getItem('stork_device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('stork_device_id', deviceId);
    }
    return deviceId;
};