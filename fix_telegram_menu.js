
// ІНСТРУКЦІЯ ЗАПУСКУ:
// 1. Відкрийте термінал у папці проекту.
// 2. Запустіть команду: node fix_telegram_menu.js
// 3. Якщо успішно - перезапустіть Telegram.

const https = require('https');

// КОНФІГУРАЦІЯ (Взято з вашого опису)
const BOT_TOKEN = '7417393370:AAHltsez_OwNbdDm3Ajw6yoWl2JaO6lOIEE';
const WEB_APP_URL = 'https://storkcrypto.borishanter12.workers.dev/';
const BUTTON_TEXT = 'Stork Terminal'; // Назва кнопки

const payload = JSON.stringify({
    menu_button: {
        type: "web_app",
        text: BUTTON_TEXT,
        web_app: {
            url: WEB_APP_URL
        }
    }
});

const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/setChatMenuButton`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

console.log(`[SYSTEM] Sending request to Telegram API...`);
console.log(`[TARGET] URL: ${WEB_APP_URL}`);
console.log(`[TARGET] Button Text: ${BUTTON_TEXT}`);

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.ok) {
                console.log('\n✅ SUCCESS! Button updated.');
                console.log('Result:', response);
                console.log('\nПерезапустіть додаток Telegram на телефоні, щоб побачити зміни.');
            } else {
                console.error('\n❌ TELEGRAM ERROR:', response);
                console.log('Перевірте токен бота або підключення до інтернету.');
            }
        } catch (e) {
            console.error('Error parsing response:', e);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(payload);
req.end();
