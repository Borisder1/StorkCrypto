# ПЛАН: Покрокове завершення Production, Stars, TON Connect та Безпеки StorkCrypto

## Мета та узгоджені рішення
1. **Подвійний платіжний потік (Dual Rails):** Збереження прямої оплати криптовалютою TON (1.0 / 2.5 / 5.0 TON) через TON Connect на публічний гаманець власника паралельно з Telegram Stars (99 / 250 / 500 XTR). Повна відсутність застарілої назви «Gram» у платіжному UI.
2. **Безпека Webhook та бекенду:** Статус-API `/api/payments/stars/status` та `/api/payment/verify` використовуються без блокування long-polling бота на Render. Ніяких витоків секретів у клієнтський бандл.
3. **Виконання 18 пунктів фінального аудиту (Частини A–J).**

---

## Пропоновані зміни

### 1. Платіжна архітектура та захист валют (Частини A, D, E)
- Перевірити та підтвердити у `/functions/api/payments/stars/create.ts`:
  - Строга валідація `initData` через HMAC-SHA256 (код 401 при невірних або відсутніх даних).
  - Серверний каталог цін: `STARTER` (99 XTR), `PRO` (250 XTR), `WHALE` (500 XTR).
- Перевірити `/functions/api/payments/stars/status.ts`:
  - Гарантоване повернення JSON (401, 403, 404, 200 PENDING/PAID).
  - Захист від SPA HTML fallback (Cloudflare не повинен віддавати `index.html` для `/api/*`).
- Перевірити `/functions/api/payment/intent.ts` та `/functions/api/payment/verify.ts`:
  - Розрахунок `amountNano` для тарифів (1.0 TON, 2.5 TON, 5.0 TON).
  - Переказ коштів виключно на публічну адресу казначейства власника (`ADMIN_TREASURY_WALLET`).

### 2. TON Connect та гаманці (Частина F)
- Перевірити `/public/tonconnect-manifest.json` та `/functions/tonconnect-manifest.json.js`:
  - URL іконки вказує на валідний PNG `https://storkcrypto.pages.dev/icon-180.png`.
  - Доступність без CORS-блокувань.
- Перевірити поведінку в `PortfolioScreen.tsx` та `SubscriptionModal.tsx`:
  - Автоматичне закриття пікера гаманців при виборі.
  - Коректне відображення підключеної адреси та кнопка Disconnect.
  - Заборона активації статусу PRO лише від факту підключення гаманця (тільки після підтвердженої транзакції).

### 3. Модальні вікна та тарифна матриця (Частини G, H)
- `SubscriptionModal.tsx`:
  - Зрозуміла презентація 4 рівнів: `BASIC` (free), `STARTER`, `PRO` (Popular), `WHALE`.
  - Прозорий перемикач: `💎 TON (1.0 / 2.5 / 5.0 TON)` або `⭐ Stars (99 / 250 / 500 XTR)`.
  - Відсутність оманливих термінів.
- Збереження незмінних стандартів:
  - `LoadingScreen.tsx`: суворо 6.5 секунд, стиль Midnight `#020617`.
  - Академія: перемикання 3 мов (UA/EN/RU) для всіх 13 уроків.
  - Ринкові бейджі: уніфікація `LIVE`, `STALE`, `DEMO`, `OFFLINE`.

### 4. Комплексний Acceptance тест та звіт (Частини I, J)
- Запуск E2E тестів: `npm run test:security` (16 перевірок) та `npm run test:stars` (54 перевірки).
- Перевірка компіляції: `compile_applet` та `tsc --noEmit`.
- Перевірка синтаксису бота: `node --check bot.js`.
- Формування підсумкового звіту за всіма 18 пунктами вимог специфікації.

---

## План верифікації
1. `compile_applet` — перевірка повної збірки проєкту.
2. `npm run lint` (`tsc --noEmit`) — перевірка типізації TypeScript.
3. `npm run test:security && npm run test:stars` — виконання 70 автоматизованих тестів безпеки та Stars.
4. `node --check bot.js` — перевірка валідності коду бота для Render.
