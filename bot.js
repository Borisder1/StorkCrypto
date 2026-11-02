/**
 * STORKCRYPTO SENTINEL BOT (Backend Service)
 * 
 * Version 9.0 (Render.com Production Release):
 * - Personalization: Addresses users by First Name & Username
 * - Ethical Educational Disclaimer: Clear rules (no get-rich-quick, no financial advice)
 * - User-Configurable Coin Alerts: Each user toggles BTC, ETH, TON, SOL in 1 tap
 * - Persistent Storage: Autonomous JSON database in `data/subscribers.json`
 * - Volatility Engine: Multi-coin tracking with 1.5% movement threshold
 * - Anti-Flood Rate Limiting: 35ms dispatch queue to respect Telegram limits
 * - Health Check Server: Preserved for Render.com Web Service uptime
 */

import TelegramBot from 'node-telegram-bot-api';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 1. КОНФІГУРАЦІЯ ТА ЗМІННІ ОТОЧЕННЯ
// ============================================================================
const token = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://storkcrypto.pages.dev';
const ALERT_THRESHOLD_PERCENT = 1.5; // 1.5% поріг за узгодженням
const POLL_INTERVAL_MS = 45000; // Опитування ринку кожні 45 секунд

if (!token) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is not defined in environment variables.');
}

const bot = new TelegramBot(token || 'dummy_token', { polling: !!token });

// ============================================================================
// 2. HEALTH CHECK СЕРВЕР ДЛЯ RENDER.COM
// ============================================================================
const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'online',
            service: 'StorkCrypto Sentinel Bot',
            subscribers: subscribersMap.size,
            monitoredCoins: Object.keys(TRACKED_COINS_META),
            timestamp: new Date().toISOString()
        }));
        return;
    }
    res.writeHead(404);
    res.end();
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`[RENDER HEALTHCHECK WARNING] Port ${PORT} already bound, continuing bot execution.`);
    } else {
        console.error('[RENDER HEALTHCHECK ERROR]', err);
    }
});

server.listen(PORT, () => {
    console.log(`[RENDER HEALTHCHECK] Server active on port ${PORT}`);
});

// ============================================================================
// 3. АВТОНОМНЕ СХОВИЩЕ ДАНИХ (data/subscribers.json)
// ============================================================================
const DATA_DIR = path.join(__dirname, 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

const TRACKED_COINS_META = {
    BTC: { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
    ETH: { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
    TON: { symbol: 'TONUSDT', name: 'Toncoin', icon: '💎' },
    SOL: { symbol: 'SOLUSDT', name: 'Solana', icon: '☀️' }
};

const DEFAULT_COINS = ['BTC', 'ETH', 'TON', 'SOL'];

/** @type {Map<number, {chatId: number, username: string, firstName: string, joinedAt: string, trackedCoins: string[], alertThreshold: number, lastNotifiedAt: number}>} */
const subscribersMap = new Map();

function initStorage() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (fs.existsSync(SUBSCRIBERS_FILE)) {
            const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
            const data = JSON.parse(raw);
            for (const [id, sub] of Object.entries(data)) {
                subscribersMap.set(Number(id), sub);
            }
            console.log(`[STORAGE] Loaded ${subscribersMap.size} subscribers from ${SUBSCRIBERS_FILE}`);
        } else {
            fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify({}, null, 2), 'utf8');
            console.log(`[STORAGE] Created fresh storage file at ${SUBSCRIBERS_FILE}`);
        }
    } catch (err) {
        console.error('[STORAGE ERROR] Failed initializing subscriber storage:', err);
    }
}

function saveStorage() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        const obj = {};
        for (const [id, sub] of subscribersMap.entries()) {
            obj[String(id)] = sub;
        }
        fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
        console.error('[STORAGE ERROR] Failed saving subscribers:', err);
    }
}

initStorage();

function getOrCreateSubscriber(chatId, from) {
    let sub = subscribersMap.get(chatId);
    const firstName = from?.first_name || 'Трейдер';
    const username = from?.username ? `@${from.username}` : '';
    const now = Date.now();

    if (!sub) {
        sub = {
            chatId,
            username,
            firstName,
            joinedAt: new Date(now).toISOString(),
            trialExpiresAt: new Date(now + 24 * 3600 * 1000).toISOString(), // 1 день (24 години) тріалу
            plan: 'TRIAL', // 'TRIAL' | 'STARTER' | 'PRO' | 'WHALE' | 'BASIC'
            trackedCoins: [...DEFAULT_COINS],
            alertThreshold: ALERT_THRESHOLD_PERCENT,
            lastNotifiedAt: 0,
            lastTrialPromptAt: 0
        };
        subscribersMap.set(chatId, sub);
        saveStorage();
        console.log(`[NEW SUBSCRIBER] Registered ${firstName} (${chatId}) with 24h trial. Total: ${subscribersMap.size}`);
    } else {
        if (!sub.trialExpiresAt) {
            const joinedTime = new Date(sub.joinedAt || now).getTime();
            sub.trialExpiresAt = new Date(joinedTime + 24 * 3600 * 1000).toISOString();
            if (!sub.plan) sub.plan = 'TRIAL';
            saveStorage();
        }
        // Оновлюємо ім'я чи username, якщо змінилися в Telegram
        if (sub.firstName !== firstName || sub.username !== username) {
            sub.firstName = firstName;
            sub.username = username;
            saveStorage();
        }
    }
    return sub;
}

// ============================================================================
// 4. ОПИТУВАННЯ КОТИРУВАНЬ (BINANCE API)
// ============================================================================
const lastPrices = {};

function fetchCoinPrices() {
    return new Promise((resolve) => {
        const symbolsParam = JSON.stringify(Object.values(TRACKED_COINS_META).map(c => c.symbol));
        const url = `https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(symbolsParam)}`;

        https.get(url, (resp) => {
            let data = '';
            resp.on('data', chunk => { data += chunk; });
            resp.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const result = {};
                    if (Array.isArray(parsed)) {
                        parsed.forEach(item => {
                            for (const [coin, meta] of Object.entries(TRACKED_COINS_META)) {
                                if (meta.symbol === item.symbol) {
                                    result[coin] = parseFloat(item.price);
                                }
                            }
                        });
                    }
                    resolve(result);
                } catch {
                    resolve({});
                }
            });
        }).on('error', () => resolve({}));
    });
}

// ============================================================================
// 5. ANTI-FLOOD ЧЕРГА ДЛЯ НАДСИЛАННЯ ПОВІДОМЛЕНЬ
// ============================================================================
async function broadcastMessage(targetUserIds, messageBuilder, optionsBuilder) {
    let successCount = 0;
    for (const chatId of targetUserIds) {
        const sub = subscribersMap.get(chatId);
        if (!sub) continue;

        const text = messageBuilder(sub);
        const options = optionsBuilder ? optionsBuilder(sub) : { parse_mode: 'Markdown' };

        try {
            await bot.sendMessage(chatId, text, options);
            successCount++;
        } catch (err) {
            if (err?.response?.statusCode === 403) {
                // Користувач заблокував бота
                subscribersMap.delete(chatId);
                saveStorage();
                console.log(`[CLEANUP] Removed inactive/blocked user ${chatId}`);
            } else {
                console.error(`[SEND ERROR] Failed delivery to ${chatId}:`, err?.message || err);
            }
        }
        // Затримка 40мс = ~25 msg/s (безпечно в межах Telegram 30 msg/s limit)
        await new Promise(r => setTimeout(r, 40));
    }
    return successCount;
}

// ============================================================================
// 6. SENTINEL VOLATILITY ENGINE (МОНІТОРИНГ РИНКУ)
// ============================================================================
async function checkMarketVolatility() {
    try {
        const currentPrices = await fetchCoinPrices();
        const coins = Object.keys(TRACKED_COINS_META);

        for (const coin of coins) {
            const currentPrice = currentPrices[coin];
            if (!currentPrice) continue;

            const previousPrice = lastPrices[coin];
            if (!previousPrice) {
                lastPrices[coin] = currentPrice;
                continue;
            }

            const change = ((currentPrice - previousPrice) / previousPrice) * 100;

            if (Math.abs(change) >= ALERT_THRESHOLD_PERCENT) {
                const isPump = change > 0;
                const emoji = isPump ? '🚀' : '🔻';
                const trendTitle = isPump ? 'BULLISH PUMP // РИНОК ЗРОСТАЄ' : 'BEARISH DUMP // ТИСК ПРОДАВЦІВ';
                const sign = isPump ? '+' : '';
                const timeStr = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

                console.log(`[ALERT TRIGGERED] ${coin}: ${sign}${change.toFixed(2)}% ($${currentPrice})`);

                // Відбираємо користувачів з урахуванням 1-денного тріалу та тарифних планів
                const now = Date.now();
                const eligibleChatIds = [];
                const expiredTrialChatIds = [];

                for (const [chatId, sub] of subscribersMap.entries()) {
                    if (sub.trackedCoins && sub.trackedCoins.includes(coin)) {
                        const trialExpires = new Date(sub.trialExpiresAt || sub.joinedAt || now).getTime();
                        const isTrialActive = now < trialExpires;
                        const hasPaidPlan = sub.plan === 'STARTER' || sub.plan === 'PRO' || sub.plan === 'WHALE';

                        if (hasPaidPlan || isTrialActive) {
                            eligibleChatIds.push(chatId);
                        } else {
                            // Тріал закінчився — нагадуємо не частіше ніж раз на 12 годин
                            if (!sub.lastTrialPromptAt || (now - sub.lastTrialPromptAt > 12 * 3600 * 1000)) {
                                sub.lastTrialPromptAt = now;
                                expiredTrialChatIds.push(chatId);
                            }
                        }
                    }
                }

                // 1. Надсилаємо повний сигнал активним користувачам (з тріалом або підпискою)
                if (eligibleChatIds.length > 0) {
                    await broadcastMessage(
                        eligibleChatIds,
                        (sub) => `🚨 *РИНКОВИЙ СИГНАЛ // ${TRACKED_COINS_META[coin].icon} ${coin}*\n\n` +
                                 `Шановний(а) *${sub.firstName}*, зафіксовано різкий ціновий рух!\n\n` +
                                 `💰 *Поточний курс:* \`$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}\`\n` +
                                 `📊 *Зміна:* ${emoji} *${sign}${change.toFixed(2)}%* (поріг > ${ALERT_THRESHOLD_PERCENT}%)\n` +
                                 `🎯 *Статус імпульсу:* \`${trendTitle}\`\n` +
                                 `⏱ *Час фіксації:* \`${timeStr} UTC+2\`\n` +
                                 `📡 *Джерело:* Binance Spot Live Feed\n\n` +
                                 `💡 *Порада від StorkCrypto:* Не піддавайтеся емоціям та FOMO. Завжди контролюйте рівень ризику (Risk/Reward 1:2 або 1:3) та ставте Stop-Loss.\n`,
                        () => ({
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: '📊 Відкрити термінал StorkCrypto', web_app: { url: WEB_APP_URL } }
                                    ],
                                    [
                                        { text: '⚙️ Налаштувати мої монети', callback_data: 'open_alerts_menu' }
                                    ]
                                ]
                            }
                        })
                    );
                }

                // 2. Користувачам із завершеним 1-денним тріалом пропонуємо вибір тарифу
                if (expiredTrialChatIds.length > 0) {
                    await broadcastMessage(
                        expiredTrialChatIds,
                        (sub) => `⏳ *ВАШ 1-ДЕННИЙ ТРІАЛ ЗАВЕРШИВСЯ*\n\n` +
                                 `Шановний(а) *${sub.firstName}*, на ринку зафіксовано сильний ціновий рух (${TRACKED_COINS_META[coin].icon} ${coin} ${sign}${change.toFixed(2)}%), проте ваш 24-годинний пробний період завершено.\n\n` +
                                 `Щоб продовжувати безперервно отримувати персональні сигнали 24/7 та ончейн-радар китів, оберіть тарифний план:\n` +
                                 `• *STARTER* — 1.0 TON / 99 Stars\n` +
                                 `• *PRO* (Популярний) — 2.5 TON / 250 Stars\n` +
                                 `• *WHALE* — 5.0 TON / 500 Stars\n\n` +
                                 `💎 *Оплата доступна як через TON-гаманець, так і через Stars!*`,
                        () => ({
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: '💎 Обрати тарифний план', web_app: { url: WEB_APP_URL } }
                                    ]
                                ]
                            }
                        })
                    );
                    saveStorage();
                }

                // Оновлюємо базову ціну після спрацьовування
                lastPrices[coin] = currentPrice;
            }
        }
    } catch (err) {
        console.error('[SENTINEL ERROR] Volatility check failed:', err?.message || err);
    }
}

setInterval(checkMarketVolatility, POLL_INTERVAL_MS);

// ============================================================================
// 7. КЛАВІАТУРА НАЛАШТУВАННЯ АКТИВІВ
// ============================================================================
function buildAlertsKeyboard(sub) {
    const rows = [];
    const coins = Object.keys(TRACKED_COINS_META);

    // Кнопки по 2 в ряд
    for (let i = 0; i < coins.length; i += 2) {
        const row = [];
        const coin1 = coins[i];
        const isTracked1 = sub.trackedCoins && sub.trackedCoins.includes(coin1);
        row.push({
            text: `${isTracked1 ? '✅' : '❌'} ${TRACKED_COINS_META[coin1].icon} ${coin1}`,
            callback_data: `toggle_coin_${coin1}`
        });

        if (i + 1 < coins.length) {
            const coin2 = coins[i + 1];
            const isTracked2 = sub.trackedCoins && sub.trackedCoins.includes(coin2);
            row.push({
                text: `${isTracked2 ? '✅' : '❌'} ${TRACKED_COINS_META[coin2].icon} ${coin2}`,
                callback_data: `toggle_coin_${coin2}`
            });
        }
        rows.push(row);
    }

    // Додаткові дії
    rows.push([
        { text: '🔄 Увімкнути всі монети', callback_data: 'enable_all_coins' },
        { text: '🚫 Вимкнути всі', callback_data: 'disable_all_coins' }
    ]);
    rows.push([
        { text: '🚀 Відкрити Web Terminal', web_app: { url: WEB_APP_URL } }
    ]);

    return { inline_keyboard: rows };
}

function buildWelcomeKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '🦅 Відкрити Термінал StorkCrypto', web_app: { url: WEB_APP_URL } }
            ],
            [
                { text: '⚙️ Мої активи для сповіщень', callback_data: 'open_alerts_menu' },
                { text: '💰 Топ-котирування', callback_data: 'check_prices' }
            ],
            [
                { text: '📰 Ринкові новини та макро', callback_data: 'show_news' },
                { text: 'ℹ️ Про проект та статус', callback_data: 'show_status' }
            ]
        ]
    };
}

// ============================================================================
// 8. ОБРОБКА КОМАНД TELEGRAM
// ============================================================================

bot.on('polling_error', (error) => {
    console.error(`[Polling Error] ${error?.code || 'ERR'}: ${error?.message || error}`);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = (msg.text || '').trim();
    const sub = getOrCreateSubscriber(chatId, msg.from);

    // КОМАНДА /start — Персоналізований онбординг з чесним дисклеймером та 1-денним тріалом
    if (text === '/start') {
        const now = Date.now();
        const trialExpires = new Date(sub.trialExpiresAt || sub.joinedAt || now).getTime();
        const isTrialActive = now < trialExpires;
        const remainingHours = isTrialActive ? Math.max(1, Math.round((trialExpires - now) / 3600000)) : 0;

        const trialStatusBadge = isTrialActive 
            ? `🎁 *ВАМ НАДАНО 1 ДЕНЬ БЕЗКОШТОВНОГО ТРІАЛУ (TRIAL)*\n• Активно ще: ~${remainingHours} год.\n• Усі персональні алерти волатильності (> 1.5%) надходять безкоштовно прямо в цей чат!`
            : `ℹ️ *ВАШ ТРІАЛ ЗАВЕРШЕНО*\n• Оберіть тарифний план (STARTER / PRO / WHALE) у терміналі, щоб отримувати сигнали 24/7.`;

        const welcomeMessage = 
`🦅 *STORKCRYPTO // NEURAL COMPANION*

Вітаю, *${sub.firstName}*! 👋
Ваш інтелектуальний помічник трейдера та аналітичний Web3-термінал активовано.

━━━━━━━━━━━━━━━━━━━━━
🎓 *ОСВІТА ТА НАВИЧКИ, А НЕ "ЛЕГКІ МІЛЬЙОНИ"*
• *StorkCrypto* створений, щоб навчати, розвивати навички аналізу та допомагати приймати обґрунтовані торгові рішення.
• Ми пропонуємо AI-асистентів, тактичну Академію трейдингу, радар китів, симулятор стратегій та моніторинг ринку 24/7.
• ⚠️ *Чесне застереження:* Цей бот *НЕ гарантує надприбутків* і *НЕ надає фінансових або інвестиційних порад*. Трейдинг пов'язаний із ризиком втрати капіталу. Усі торгові дії ви здійснюєте свідомо та під особисту відповідальність.
━━━━━━━━━━━━━━━━━━━━━

${trialStatusBadge}

━━━━━━━━━━━━━━━━━━━━━
⚡ *ВАШІ ПЕРСОНАЛЬНІ МОЖЛИВОСТІ:*
🔹 *Індивідуальні сповіщення:* ви самі обираєте монети (BTC, ETH, TON, SOL) для алерту про волатильність (> 1.5%).
🔹 *Свіжі новини:* стислі макро-зведення та вплив подій на ринок.
🔹 *Web App Термінал:* повноцінний кібер-інтерфейс із графіками та аналітикою.

👇 Оберіть дію в меню нижче або налаштуйте монети для відстеження:`;

        await bot.sendMessage(chatId, welcomeMessage, {
            parse_mode: 'Markdown',
            reply_markup: buildWelcomeKeyboard()
        });
        return;
    }

    // КОМАНДА /alerts — Налаштування монет для користувача
    if (text === '/alerts' || text === '/settings') {
        const trackedList = sub.trackedCoins && sub.trackedCoins.length > 0
            ? sub.trackedCoins.map(c => `${TRACKED_COINS_META[c]?.icon || '•'} ${c}`).join(', ')
            : 'жодної (сповіщення вимкнено)';

        const alertsMsg = 
`⚙️ *НАЛАШТУВАННЯ СПОВІЩЕНЬ // ${sub.firstName}*

Ви самі контролюєте, які монети моніторить бот!
Коли обраний актив зростає або падає більше ніж на *${sub.alertThreshold}%*, ви отримаєте персональне сповіщення.

📍 *Ваші поточні монети:* ${trackedList}

Натискайте на кнопки нижче, щоб увімкнути (✅) або вимкнути (❌) сповіщення для кожного активу:`;

        await bot.sendMessage(chatId, alertsMsg, {
            parse_mode: 'Markdown',
            reply_markup: buildAlertsKeyboard(sub)
        });
        return;
    }

    // КОМАНДА /price — Огляд актуальних курсів
    if (text === '/price' || text === '/prices') {
        try {
            const prices = await fetchCoinPrices();
            let priceMsg = `💰 *АКТУАЛЬНІ КОТИРУВАННЯ РИНКУ*\n\n` +
                           `Шановний(а) *${sub.firstName}*, ось свіжі дані з біржі Binance:\n\n`;

            for (const [coin, meta] of Object.entries(TRACKED_COINS_META)) {
                const val = prices[coin];
                const priceFormatted = val ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : 'Завантаження...';
                const isTracked = sub.trackedCoins && sub.trackedCoins.includes(coin) ? '🔔 Відстежується' : '🔕';
                priceMsg += `${meta.icon} *${coin}* (${meta.name}): \`${priceFormatted}\` · ${isTracked}\n`;
            }

            priceMsg += `\n⏱ _Дані оновлюються в реальному часі_`;

            await bot.sendMessage(chatId, priceMsg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🔄 Оновити котирування', callback_data: 'check_prices' },
                            { text: '⚙️ Змінити монети', callback_data: 'open_alerts_menu' }
                        ],
                        [
                            { text: '📊 Детальні графіки у додатку', web_app: { url: WEB_APP_URL } }
                        ]
                    ]
                }
            });
        } catch {
            await bot.sendMessage(chatId, `❌ Не вдалося отримати ціни з біржі. Спробуйте через кілька секунд.`, { parse_mode: 'Markdown' });
        }
        return;
    }

    // КОМАНДА /news — Свіжі макро- та крипто-новини
    if (text === '/news') {
        const newsMsg = 
`📰 *МАКРОЕКОНОМІЧНИЙ ДАЙДЖЕСТ ДЛЯ ${sub.firstName.toUpperCase()}*

🏛 *Ключові фактори впливу на ринок сьогодні:*

1️⃣ *Індекс долара (DXY) та ліквідність:*
Американський долар коливається біля ключових рівнів опору. Зниження тиску DXY відкриває вікно можливостей для біткоїна та провідних альткоїнів.

2️⃣ *Інституційні потоки у спотові ETF:*
Приплив капіталу у BTC та ETH фонди залишається стабільно позитивним, що свідчить про довгострокове накопичення великими гравцями (Smart Money).

3️⃣ *Екосистема TON & Telegram Web3:*
Активність у мережі TON демонструє високий темп ончейн-транзакцій. Інтеграція криптотерміналів продовжує розширювати аудиторію.

💡 *Висновок AI-аналітика:*
Ринок перебуває у фазі активного розподілу ліквідності. Зберігайте дисципліну, фіксуйте прибуток частинами і не перевищуйте комфортний розмір позиції.

[Повний аналітичний блок доступний у терміналі StorkCrypto]`;

        await bot.sendMessage(chatId, newsMsg, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📊 Читати стрічку новин у Web App', web_app: { url: WEB_APP_URL } }
                    ],
                    [
                        { text: '💰 Перевірити ціни', callback_data: 'check_prices' }
                    ]
                ]
            }
        });
        return;
    }

    // КОМАНДА /status — Системний стан бота та підписки користувача
    if (text === '/status') {
        const uptimeHours = (process.uptime() / 3600).toFixed(1);
        const now = Date.now();
        const trialExpires = new Date(sub.trialExpiresAt || sub.joinedAt || now).getTime();
        const isTrialActive = now < trialExpires;
        const remainingHours = isTrialActive ? Math.max(1, Math.round((trialExpires - now) / 3600000)) : 0;
        const hasPaidPlan = sub.plan === 'STARTER' || sub.plan === 'PRO' || sub.plan === 'WHALE';

        let planStatusText = '';
        if (hasPaidPlan) {
            planStatusText = `💎 *Активний план:* \`${sub.plan}\` (Безлімітні сигнали 24/7)`;
        } else if (isTrialActive) {
            planStatusText = `🎁 *Пробний період (Trial):* \`АКТИВНИЙ\`\n⏳ *Залишилось часу:* ~${remainingHours} год.`;
        } else {
            planStatusText = `🔴 *Пробний період (Trial):* \`ВИЧЕРПАНО\`\n⚠️ Сигнали призупинено. Оберіть тариф для продовження.`;
        }

        const statusMsg = 
`🟢 *СИСТЕМНИЙ СТАТУС: ОНЛАЙН*

👤 *Ваш профіль:* ${sub.firstName} (${sub.username ? '@' + sub.username : 'без username'})
${planStatusText}
👥 *Усього користувачів бота:* ${subscribersMap.size}
⏱ *Час безперервної роботи:* ${uptimeHours} год.
📡 *Моніторинг пар:* ${Object.keys(TRACKED_COINS_META).join(', ')}
🎯 *Поріг спрацьовування:* ${sub.alertThreshold}%
💾 *Сховище бази:* \`data/subscribers.json\` (Автономне, активне)
🌐 *Web App:* [storkcrypto.pages.dev](${WEB_APP_URL})`;

        await bot.sendMessage(chatId, statusMsg, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💎 Тарифні плани (TON / Stars)', web_app: { url: WEB_APP_URL } }
                    ],
                    [
                        { text: '⚙️ Налаштувати мої монети', callback_data: 'open_alerts_menu' },
                        { text: '💰 Котирування', callback_data: 'check_prices' }
                    ]
                ]
            }
        });
        return;
    }

    // КОМАНДА /broadcast (Тільки для адміністратора)
    if (text.startsWith('/broadcast')) {
        const message = text.replace('/broadcast', '').trim();
        if (!message) {
            await bot.sendMessage(chatId, `⚠️ Використання: /broadcast [текст повідомлення]`);
            return;
        }

        const allIds = Array.from(subscribersMap.keys());
        const count = await broadcastMessage(
            allIds,
            (targetSub) => `📢 *ОФІЦІЙНЕ ПОВІДОМЛЕННЯ STORKCRYPTO*\n\n` +
                           `Шановний(а) *${targetSub.firstName}*,\n\n${message}`
        );

        await bot.sendMessage(chatId, `✅ Повідомлення успішно доставлено ${count} користувачам.`);
        return;
    }

    // Невідоме повідомлення — підказка
    await bot.sendMessage(
        chatId,
        `Привіт, ${sub.firstName}! Використовуйте кнопки або команди:\n/start — Меню та привітання\n/alerts — Налаштувати монети\n/price — Курси криптовалют\n/news — Огляд новин\n/status — Стан бота`,
        { reply_markup: buildWelcomeKeyboard() }
    );
});

// ============================================================================
// 9. ОБРОБКА ІНТЕРАКТИВНИХ ІНЛАЙН-КНОПОК (CALLBACK QUERIES)
// ============================================================================
bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    if (!chatId) return;

    const data = query.data || '';
    const sub = getOrCreateSubscriber(chatId, query.from);

    // Перемикання окремої монети: toggle_coin_BTC тощо
    if (data.startsWith('toggle_coin_')) {
        const coin = data.replace('toggle_coin_', '');
        if (TRACKED_COINS_META[coin]) {
            if (!sub.trackedCoins) sub.trackedCoins = [];
            if (sub.trackedCoins.includes(coin)) {
                sub.trackedCoins = sub.trackedCoins.filter(c => c !== coin);
                await bot.answerCallbackQuery(query.id, { text: `🔕 Сповіщення для ${coin} вимкнено` });
            } else {
                sub.trackedCoins.push(coin);
                await bot.answerCallbackQuery(query.id, { text: `🔔 Сповіщення для ${coin} увімкнено!` });
            }
            saveStorage();

            try {
                await bot.editMessageReplyMarkup(buildAlertsKeyboard(sub), {
                    chat_id: chatId,
                    message_id: query.message?.message_id
                });
            } catch {}
        }
        return;
    }

    // Увімкнути всі монети
    if (data === 'enable_all_coins') {
        sub.trackedCoins = Object.keys(TRACKED_COINS_META);
        saveStorage();
        await bot.answerCallbackQuery(query.id, { text: '✅ Усі 4 активи увімкнено для сповіщень' });
        try {
            await bot.editMessageReplyMarkup(buildAlertsKeyboard(sub), {
                chat_id: chatId,
                message_id: query.message?.message_id
            });
        } catch {}
        return;
    }

    // Вимкнути всі монети
    if (data === 'disable_all_coins') {
        sub.trackedCoins = [];
        saveStorage();
        await bot.answerCallbackQuery(query.id, { text: '🔕 Усі сповіщення вимкнено' });
        try {
            await bot.editMessageReplyMarkup(buildAlertsKeyboard(sub), {
                chat_id: chatId,
                message_id: query.message?.message_id
            });
        } catch {}
        return;
    }

    // Відкрити меню налаштувань сповіщень
    if (data === 'open_alerts_menu') {
        await bot.answerCallbackQuery(query.id);
        const trackedList = sub.trackedCoins && sub.trackedCoins.length > 0
            ? sub.trackedCoins.map(c => `${TRACKED_COINS_META[c]?.icon || '•'} ${c}`).join(', ')
            : 'жодної (сповіщення вимкнено)';

        const alertsMsg = 
`⚙️ *НАЛАШТУВАННЯ СПОВІЩЕНЬ // ${sub.firstName}*

Ви самі контролюєте, які монети моніторить бот!
Коли актив зростає або падає більше ніж на *${sub.alertThreshold}%*, ви отримаєте персональне сповіщення.

📍 *Ваші поточні монети:* ${trackedList}

Натискайте на кнопки, щоб увімкнути (✅) або вимкнути (❌):`;

        await bot.sendMessage(chatId, alertsMsg, {
            parse_mode: 'Markdown',
            reply_markup: buildAlertsKeyboard(sub)
        });
        return;
    }

    // Перевірити поточні ціни через кнопку
    if (data === 'check_prices') {
        await bot.answerCallbackQuery(query.id, { text: 'Завантажуємо курси...' });
        const prices = await fetchCoinPrices();
        let priceMsg = `💰 *АКТУАЛЬНІ КОТИРУВАННЯ РИНКУ*\n\n` +
                       `Шановний(а) *${sub.firstName}*, свіжі котирування Binance:\n\n`;

        for (const [coin, meta] of Object.entries(TRACKED_COINS_META)) {
            const val = prices[coin];
            const priceFormatted = val ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : 'Завантаження...';
            const isTracked = sub.trackedCoins && sub.trackedCoins.includes(coin) ? '🔔' : '🔕';
            priceMsg += `${meta.icon} *${coin}* (${meta.name}): \`${priceFormatted}\` · ${isTracked}\n`;
        }

        priceMsg += `\n⏱ _Оновлено щойно_`;

        await bot.sendMessage(chatId, priceMsg, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔄 Оновити ще раз', callback_data: 'check_prices' },
                        { text: '⚙️ Налаштувати монети', callback_data: 'open_alerts_menu' }
                    ],
                    [
                        { text: '📊 Детальний графік у StorkCrypto', web_app: { url: WEB_APP_URL } }
                    ]
                ]
            }
        });
        return;
    }

    // Показати новини через кнопку
    if (data === 'show_news') {
        await bot.answerCallbackQuery(query.id);
        const newsMsg = 
`📰 *МАКРОЕКОНОМІЧНИЙ ДАЙДЖЕСТ ДЛЯ ${sub.firstName.toUpperCase()}*

🏛 *Головні тренди ринку:*
• *BTC & Macro:* Біткоїн утримує стратегічні рівні підтримки на тлі стабільності індексу DXY.
• *ETH & DeFi:* Спостерігається приплив стейблкоїнів у протоколи ліквідного стейкінгу.
• *TON Network:* Зростання щоденних активних гаманців (DAU) у Telegram Mini Apps.

💡 *Порада від StorkCrypto:* Трейдинг вимагає холодної голови та дисципліни. Слідкуйте за трендами у нашому терміналі!`;

        await bot.sendMessage(chatId, newsMsg, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🦅 Відкрити повний дайджест у додатку', web_app: { url: WEB_APP_URL } }
                    ]
                ]
            }
        });
        return;
    }

    // Показати статус через кнопку
    if (data === 'show_status') {
        await bot.answerCallbackQuery(query.id);
        const uptimeHours = (process.uptime() / 3600).toFixed(1);
        const now = Date.now();
        const trialExpires = new Date(sub.trialExpiresAt || sub.joinedAt || now).getTime();
        const isTrialActive = now < trialExpires;
        const remainingHours = isTrialActive ? Math.max(1, Math.round((trialExpires - now) / 3600000)) : 0;
        const hasPaidPlan = sub.plan === 'STARTER' || sub.plan === 'PRO' || sub.plan === 'WHALE';

        let planStatusText = '';
        if (hasPaidPlan) {
            planStatusText = `💎 *Активний план:* \`${sub.plan}\``;
        } else if (isTrialActive) {
            planStatusText = `🎁 *Пробний період (Trial):* \`АКТИВНИЙ\` (~${remainingHours} год.)`;
        } else {
            planStatusText = `🔴 *Пробний період (Trial):* \`ВИЧЕРПАНО\``;
        }

        const statusMsg = 
`🟢 *СИСТЕМНИЙ СТАТУС: ОНЛАЙН*

👤 *Користувач:* ${sub.firstName} (${sub.username ? '@' + sub.username : 'без username'})
${planStatusText}
👥 *Підписників бота:* ${subscribersMap.size}
⏱ *Час роботи процесу:* ${uptimeHours} год.
📡 *Моніторинг:* BTC, ETH, TON, SOL (поріг > 1.5%)
💾 *Сховище даних:* автономне (\`data/subscribers.json\`)`;

        await bot.sendMessage(chatId, statusMsg, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💎 Тарифні плани (TON / Stars)', web_app: { url: WEB_APP_URL } }
                    ],
                    [
                        { text: '⚙️ Налаштувати мої монети', callback_data: 'open_alerts_menu' }
                    ]
                ]
            }
        });
        return;
    }

    await bot.answerCallbackQuery(query.id);
});

console.log('🦅 StorkCrypto Sentinel Bot v9.0 is online!');
console.log(`📊 Monitored pairs: ${Object.keys(TRACKED_COINS_META).join(', ')} (threshold > ${ALERT_THRESHOLD_PERCENT}%)`);
console.log(`🛡️ Subscriber database: ${SUBSCRIBERS_FILE}`);
