
// 🦅 STORK SENTINEL: CLOUD WATCHDOG
// Deployed via: supabase functions deploy sentinel-bot
// Scheduled via: pg_cron in Database

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any;

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Simple in-memory cache for the function instance (Note: Edge functions are ephemeral, so we rely on DB for state)
const BINANCE_API = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';

serve(async (req) => {
  try {
    // 1. Fetch Market Data
    const priceRes = await fetch(BINANCE_API);
    const priceData = await priceRes.json();
    const currentPrice = parseFloat(priceData.price);

    // 2. Initialize Supabase Admin Client
    // We need to fetch the last recorded price from DB to compare
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch System Config (create a simple table for system state if not exists, or use a known record)
    let { data: state, error } = await supabase.from('system_state').select('*').eq('key', 'sentinel_btc_last').single();
    
    let lastPrice = currentPrice;
    if (state) {
        lastPrice = state.value;
    } else {
        // Init state if missing
        await supabase.from('system_state').insert({ key: 'sentinel_btc_last', value: currentPrice });
    }

    // 3. Calculate Volatility
    const change = ((currentPrice - lastPrice) / lastPrice) * 100;
    const threshold = 0.5; // 0.5% movement threshold

    let alertSent = false;

    if (Math.abs(change) >= threshold) {
        // 4. TRIGGER ALERT
        const emoji = change > 0 ? '🚀' : '🔻';
        const msg = `🦅 **SENTINEL ALERT**\n\nBTC: ${emoji} $${currentPrice.toFixed(2)}\nChange: ${change.toFixed(2)}%\n\n_System: Neural Grid V8_`;

        // Fetch all users who have registered a telegram_chat_id
        // Note: You need to ensure users map their chat_id in profiles. 
        // For this demo, we broadcast to a hardcoded admin or list from DB.
        
        // Let's assume we have a table 'sentinel_subscribers' or utilize 'profiles' with chat_id
        const { data: users } = await supabase.from('profiles').select('telegram_chat_id').not('telegram_chat_id', 'is', null);

        if (users && users.length > 0) {
            const promises = users.map(u => {
                return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: u.telegram_chat_id,
                        text: msg,
                        parse_mode: 'Markdown'
                    })
                });
            });
            await Promise.all(promises);
            alertSent = true;
        }

        // Update State
        await supabase.from('system_state').update({ value: currentPrice }).eq('key', 'sentinel_btc_last');
    }

    return new Response(JSON.stringify({ 
        status: 'OK', 
        price: currentPrice, 
        change: change.toFixed(2),
        alert: alertSent 
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
