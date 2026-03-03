
/**
 * STORKCRYPTO SENTINEL BOT (Backend Service)
 * 
 * Upgraded Version:
 * - Removed hardcoded Web App URL
 * - Added /status and /price commands
 * - Improved error handling and logging
 * - Better broadcast functionality
 */

import TelegramBot from 'node-telegram-bot-api';
import https from 'https';
import http from 'http';

// ВСТАВТЕ СЮДИ ТОКЕН ВАШОГО БОТА
const token = process.env.TELEGRAM_BOT_TOKEN || '8501512462:AAFR_bSDLp3jiqKgDQnkimOAuwiWrA9xdWs'; 

const bot = new TelegramBot(token, { polling: true });

// Health Check Server for Railway/Render
const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('StorkCrypto Sentinel Bot is running and fully operational!');
});
server.listen(PORT, () => {
    console.log(`[SERVER] Listening on port ${PORT}`);
});

// Зберігання користувачів (У реальному проекті використовуйте базу даних)
const userIds = new Set();

// Зберігання останньої ціни для відстеження змін
let lastPrice = 0;

// Функція для отримання ціни BTC
const getBTCPrice = (): Promise<number> => {
    return new Promise((resolve, reject) => {
        https.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', (resp) => {
            let data = '';
            resp.on('data', (chunk) => { data += chunk; });
            resp.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(parseFloat(json.price));
                } catch (e) {
                    reject(e);
                }
            });
        }).on("error", reject);
    });
};

// --- SENTINEL LOGIC ---
const checkPrices = async () => {
    try {
        const currentPrice = await getBTCPrice();
        
        // Якщо це перший запуск
        if (lastPrice === 0) {
            lastPrice = currentPrice;
            console.log(`[SENTINEL] Baseline price set: $${lastPrice.toFixed(2)}`);
            return;
        }

        // Логіка сповіщення: якщо ціна змінилася на > 0.5%
        const change = ((currentPrice - lastPrice) / lastPrice) * 100;
        
        if (Math.abs(change) > 0.5) {
            const emoji = change > 0 ? '🚀' : '🔻';
            const trend = change > 0 ? 'PUMP' : 'DUMP';
            const msg = `🚨 **SENTINEL ALERT: ${trend} DETECTED** 🚨\n\n` +
                        `💰 **BTC Price:** $${currentPrice.toFixed(2)}\n` +
                        `📊 **Change:** ${change > 0 ? '+' : ''}${change.toFixed(2)}%\n\n` +
                        `⚡ *Market volatility is high. Stay alert, Pilot!*`;
            
            console.log(`[SENTINEL] Triggered! Price: $${currentPrice.toFixed(2)} (${change.toFixed(2)}%)`);
            
            // Розсилка всім активним користувачам
            let successCount = 0;
            for (const id of userIds) {
                try {
                    await bot.sendMessage(id, msg, { parse_mode: 'Markdown' });
                    successCount++;
                } catch (e) {
                    console.error(`[ERROR] Failed to send alert to ${id}`);
                }
            }
            console.log(`[SENTINEL] Alert sent to ${successCount}/${userIds.size} users.`);
            
            lastPrice = currentPrice; // Оновлюємо базову ціну
        }
    } catch (e) {
        console.error("[ERROR] Price check failed:", e.message);
    }
};

// Запуск моніторингу кожні 60 секунд
setInterval(checkPrices, 60000);

bot.on('polling_error', (error) => {
    console.error(`[Polling Error] ${error.code}: ${error.message}`);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const firstName = msg.from?.first_name || 'Pilot';
    
    // Реєструємо користувача для розсилки
    if (!userIds.has(chatId)) {
        userIds.add(chatId);
        console.log(`[NEW USER] Registered ${firstName} (${chatId}). Total users: ${userIds.size}`);
    }

    if (text === '/start') {
        const welcomeMessage = `
🦅 **StorkCrypto Sentinel V8 Active**

Вітаю, ${firstName}!
Система нейро-моніторингу успішно підключена до вашого терміналу.

Ви отримуватимете екстрені пуш-сповіщення про різкі зміни на ринку (волатильність > 0.5%), щоб завжди бути на крок попереду.

**Доступні команди:**
/status - Перевірити стан системи
/price - Отримати поточну ціну BTC
        `;

        await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    }
    
    else if (text === '/status') {
        const statusMsg = `
🟢 **SYSTEM STATUS: ONLINE**
👥 Active Pilots: ${userIds.size}
📡 Monitoring: BTC/USDT
⏱ Update Interval: 60s
🎯 Alert Threshold: 0.5%
        `;
        await bot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
    }
    
    else if (text === '/price') {
        try {
            const price = await getBTCPrice();
            await bot.sendMessage(chatId, `💰 **Current BTC Price:** $${price.toFixed(2)}`, { parse_mode: 'Markdown' });
        } catch (e) {
            await bot.sendMessage(chatId, `❌ **Error:** Unable to fetch price data.`, { parse_mode: 'Markdown' });
        }
    }

    // BROADCAST COMMAND (Admin Only)
    else if (text.startsWith('/broadcast')) {
        const message = text.replace('/broadcast', '').trim();
        if (!message) {
            await bot.sendMessage(chatId, `⚠️ Usage: /broadcast [message]`);
            return;
        }

        let sentCount = 0;
        for (const id of userIds) {
            try {
                await bot.sendMessage(id, `📢 **GLOBAL TRANSMISSION**:\n\n${message}`, { parse_mode: 'Markdown' });
                sentCount++;
            } catch (e) {
                console.error(`[ERROR] Broadcast failed for ${id}`);
            }
        }

        await bot.sendMessage(chatId, `✅ Broadcast successfully delivered to ${sentCount} pilots.`);
    }
});

console.log('🦅 StorkCrypto Sentinel Bot is booting up...');
console.log('📊 Market Monitor: ACTIVE');
console.log('🛡️ Awaiting connections...');
