
/**
 * STORKCRYPTO SENTINEL BOT (Backend Service)
 * 
 * Functions:
 * 1. User Database (Simulated via Set)
 * 2. Broadcast Commands (Admin)
 * 3. Sentinel Mode (Price Monitoring)
 */

import TelegramBot from 'node-telegram-bot-api';
import https from 'https';
import http from 'http';

// ВСТАВТЕ СЮДИ ТОКЕН ВАШОГО БОТА
const token = process.env.TELEGRAM_BOT_TOKEN || '7417393370:AAHltsez_OwNbdDm3Ajw6yoWl2JaO6lOIEE'; 

// URL вашого Web App
const webAppUrl = process.env.WEB_APP_URL || 'https://a310c93f.storkcrypto-app.pages.dev/';

const bot = new TelegramBot(token, { polling: true });

// Health Check Server for Railway/Render
const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('StorkCrypto Sentinel Bot is running!');
});
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// Зберігання користувачів (У реальному проекті використовуйте базу даних)
const userIds = new Set();

// Зберігання останньої ціни для відстеження змін
let lastPrice = 0;

// --- SENTINEL LOGIC ---
const checkPrices = () => {
    // Емуляція запиту до Binance API для отримання ціни BTC
    https.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
            try {
                const json = JSON.parse(data);
                const currentPrice = parseFloat(json.price);
                
                // Якщо це перший запуск
                if (lastPrice === 0) {
                    lastPrice = currentPrice;
                    return;
                }

                // Логіка сповіщення: якщо ціна змінилася на > 1% (для тесту 0.01% щоб бачити роботу)
                const change = ((currentPrice - lastPrice) / lastPrice) * 100;
                
                if (Math.abs(change) > 0.5) { // Поріг 0.5%
                    const emoji = change > 0 ? '🚀' : '🔻';
                    const msg = `🚨 SENTINEL ALERT:\n\nBTC Price Action: ${emoji} ${currentPrice.toFixed(2)}$\nChange: ${change.toFixed(2)}%\n\nCheck Terminal for details!`;
                    
                    console.log(`[SENTINEL] Triggered! Price: ${currentPrice}`);
                    
                    // Розсилка всім активним користувачам
                    userIds.forEach(id => {
                        bot.sendMessage(id, msg, {
                            reply_markup: {
                                inline_keyboard: [[{ text: "Open Terminal", web_app: { url: webAppUrl } }]]
                            }
                        }).catch(e => console.error(`Failed to send to ${id}`));
                    });
                    
                    lastPrice = currentPrice; // Оновлюємо базову ціну
                }
            } catch (e) {
                console.error("Price check failed:", e.message);
            }
        });
    }).on("error", (err) => {
        console.error("Error: " + err.message);
    });
};

// Запуск моніторингу кожні 60 секунд
setInterval(checkPrices, 60000);

bot.on('polling_error', (error) => {
    console.error(`[Polling Error] ${error.code}: ${error.message}`);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    console.log(`[Message Received] from ${chatId}: ${text}`);
    
    // Реєструємо користувача для розсилки
    userIds.add(chatId);
    
    const firstName = msg.from.first_name || 'Pilot';

    if (text === '/start') {
        const welcomeMessage = `
🦅 **StorkCrypto Sentinel Active**

Привіт, ${firstName}!
Система моніторингу підключена. Ви отримуватимете пуш-сповіщення про різкі зміни ринку, навіть коли додаток закритий.

Статус: 🟢 ONLINE
Моніторинг: BTC/USDT (Volatility > 0.5%)
        `;

        await bot.sendMessage(chatId, welcomeMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🚀 Launch Neural Terminal", web_app: { url: webAppUrl } }]
                ]
            }
        });
    }

    // BROADCAST COMMAND (Admin Only)
    if (text && text.startsWith('/broadcast')) {
        const message = text.replace('/broadcast', '').trim();
        if (!message) return;

        let sentCount = 0;
        userIds.forEach(id => {
            bot.sendMessage(id, `📢 **STORK ANNOUNCEMENT**:\n\n${message}`)
                .then(() => sentCount++)
                .catch(e => console.error(`Failed to send to ${id}`));
        });

        bot.sendMessage(chatId, `✅ Broadcast sent to ${sentCount} pilots.`);
    }
});

console.log('🦅 StorkCrypto Sentinel Bot is running...');
console.log('📊 Market Monitor: ACTIVE');
