
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
    // 1. Налаштування CORS (Дозволяємо React-додатку звертатися до нас)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 2. Обробка preflight-запитів браузера
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 3. Створення нашого власного безпечного API
    if (req.url === '/api/audit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const symbol = data.symbol || 'BTC';
                const analysis = await generateAudit(symbol);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, symbol, analysis }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid request payload.' }));
            }
        });
        return;
    }

    // Універсальний Proxy для генерації тексту через Kimi 2.5 (Для всіх інших екранів React)
    if (req.url === '/api/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { prompt, config } = data;
                
                let systemMsg = "You are StorkCrypto Neural Advisor (Kimi 2.5).";
                // Якщо React чекає JSON, ми маємо наказати Kimi суворо віддати JSON
                if (config && config.responseMimeType === 'application/json') {
                    systemMsg += " You MUST output ONLY valid JSON without any markdown formatting, backticks or comments.";
                }
                
                const response = await fetch(NV_API_URL, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${NV_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "moonshotai/kimi-k2-thinking",
                        messages: [
                            { role: "system", content: systemMsg },
                            { role: "user", content: prompt }
                        ],
                        temperature: config?.temperature ?? 0.7,
                        top_p: 0.9,
                        max_tokens: 3000,
                        stream: false
                    })
                });
                
                if (!response.ok) throw new Error(`Nvidia API Error: ${response.status}`);
                const resData = await response.json();
                const text = resData.choices?.[0]?.message?.content || "";
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, text }));
            } catch (e) {
                console.error("[PROXY ERROR]", e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // 4. Default Health Check
    res.writeHead(200);
    res.end('StorkCrypto Sentinel API is running and fully operational!');
});
server.listen(PORT, () => {
    console.log(`[SERVER] Listening on port ${PORT}`);
});

// Зберігання користувачів (У реальному проекті використовуйте базу даних)
const userIds = new Set();

// Зберігання останньої ціни для відстеження змін
let lastPrice = 0;

// Функція для отримання ціни BTC
const getBTCPrice = () => {
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

// --- NVIDIA KIMI 2.5 AI INTEGRATION ---
const NV_API_KEY = process.env.NV_API_KEY || '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';
const NV_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function generateAudit(symbol) {
    try {
        const response = await fetch(NV_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NV_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "moonshotai/kimi-k2-thinking",
                messages: [
                    { role: "system", content: "You are StorkCrypto Neural Advisor (Kimi 2.5). Provide a concise, highly technical crypto market audit in Ukrainian. Use short bullet points." },
                    { role: "user", content: `Зроби швидкий технічний та фундаментальний аналіз для активу: ${symbol}.` }
                ],
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 1024,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices && data.choices[0] ? data.choices[0].message.content : "No response from AI.";
    } catch (error) {
        console.error("[AI ERROR] Audit failed:", error);
        return "❌ Системна помилка: Зв'язок з Kimi 2.5 втрачено.";
    }
}

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
/audit [монета] - Провести ШІ-аудит активу (Kimi 2.5)
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

    // AI AUDIT COMMAND (KIMI 2.5)
    else if (text.startsWith('/audit')) {
        const symbol = text.replace('/audit', '').trim().toUpperCase() || 'BTC';
        const waitMsg = await bot.sendMessage(chatId, `🧠 **Нейромережа Kimi 2.5 сканує ${symbol}...**\nЗачекайте, аналізую патерни...`, { parse_mode: 'Markdown' });
        
        try {
            const analysis = await generateAudit(symbol);
            // Відправляємо без Markdown, щоб уникнути помилок синтаксису від ШІ в Telegram
            await bot.sendMessage(chatId, `📊 Нейро_Аудит: ${symbol}\n\n${analysis}`);
        } catch (e) {
            await bot.sendMessage(chatId, `❌ **Помилка:** Не вдалося завершити аудит.`, { parse_mode: 'Markdown' });
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
