# Комплексний план реалізації: StorkCrypto Production Fix, Security & Три Тарифні Плани

Цей план повністю базується на документі **«ПОКРОКОВЕ ЗАВДАННЯ ДЛЯ AI-АГЕНТА: STORKCRYPTO: PRODUCTION FIX, SECURITY І ТРИ ПЛАНИ»** та охоплює виконання всіх 14 етапів без компромісів із безпекою, фінансовою логікою та UX.

---

## ⚠️ User Review Required (Зверніть увагу)

1. **Безпека тестових оплат (Етап 13)**: За правилом технічного завдання, жодні реальні кошти (Telegram Stars XTR) не списуються автоматично. Усі тести виконуються спочатку в ізольованому режимі перевірки статусів (401 на відсутність auth, 401 на підроблені дані, валідація invoiceUrl, ідемпотентність webhook).
2. **Git репозиторій (Етап 0)**: Локальне робоче середовище спочатку не містило ініціалізованого git-репозиторію (`fatal: not a git repository`). Ми локально ініціалізуємо git, створимо гілку `fix/production-stars-ton-plans` та зафіксуємо baseline commit SHA, зберігаючи повну історію без спроб несанкціонованого push без ключів.
3. **Платні плани (Етап 5)**: Впроваджується точна трійка планів:
   - **STARTER**: 99 XTR / 30 днів (актуальні сигнали з fair-use, 10–20 AI-сканів, базові алерти, Basic Academy, базовий Whale Radar).
   - **PRO** (позначка `POPULAR`): 250 XTR / 30 днів (безлімітні сигнали, AI Market Scan, Whale Radar, Liquidation Heatmap, без реклами, повна Academy, розширені алерти, кастомізація).
   - **WHALE**: 500 XTR / 30 днів (усе з PRO + VIP Whale Radar, ончейн-аналітика, пріоритетна черга AI, early access, розширені метрики).
   Безкоштовний план **BASIC** залишається доступним за замовчуванням.

---

## 📋 Запропоновані зміни за етапами (14 Етапів)

### ЕТАП 0. Створити baseline і backup
- Ініціалізувати локальний git (якщо відсутній), створити гілку `fix/production-stars-ton-plans`.
- Зафіксувати поточний commit SHA.
- Задокументувати перелік функцій Cloudflare Pages у `/functions/api/` (`chat.ts`, `validate.js`, `payments/stars/create.ts`, `status.ts`, `create-link.ts`, `webhook.ts`).
- Зафіксувати перелік змінних середовища (без розкриття значень секретів у логах/звіті).
- Підтвердити збереження бекапу `LoadingScreen_Backup.tsx` та незмінність 6.5с таймінгу.

### ЕТАП 1. Вилучити production DEV/payment bypass
- Усунути кнопку `⚡ Simulate Test Confirmation (Dev)` та функцію `handleSimulatePayment` з production-бандлу в `components/SubscriptionModal.tsx` (відображення виключно у локальному dev-середовищі або повне вилучення клієнтського тригера).
- Переконатися, що у production-збірці відсутні рядки `SIMULATE TEST CONFIRMATION`, `tg_user`, `fake payment`, `fake transaction`.
- Жоден click handler, `localStorage` чи стан Zustand не має права встановлювати `isPro = true` без підтвердження бекенду.
- Перевірити, що підключення гаманця TON не активує PRO-підписку.

### ЕТАП 2. Telegram Stars Authentication
- **POST `/api/payments/stars/create`**:
  - Приймати заголовок `Authorization: tma <Telegram.WebApp.initData>`.
  - Перевіряти криптографічний HMAC `initData` на сервері проти `TELEGRAM_BOT_TOKEN`.
  - Отримувати Telegram `userId` виключно з перевіреного `initData`.
  - Ігнорувати будь-який `userId`, `amount` або `currency` з JSON-тіла запиту клієнта; валідувати дозволений `planId` (`STARTER` | `PRO` | `WHALE`) та встановлювати фіксовану ціну на сервері (99, 250, 500 XTR).
  - Створювати замовлення в базі/сховищі зі статусом `PENDING`, формувати унікальний `invoice_payload` з прив'язкою до `orderId` та валютою strictly `XTR`.
  - Повертати строгі помилки: 401 при відсутності/підробці авторизації.

### ЕТАП 3. Реалізувати повний payment webhook
- **`pre_checkout_query`**:
  - Пошук замовлення за `invoice_payload`.
  - Перевірка `userId`, валюти (`currency === 'XTR'`), суми та тарифного плану.
  - Перевірка статусу `PENDING`.
  - Швидка відповідь Telegram `answerPreCheckoutQuery` (до 10 секунд).
- **`successful_payment`**:
  - Активація підписки суворо лише за наявності `message.successful_payment`.
  - Фіксація `telegram_payment_charge_id`, `telegram_user_id`, `invoice_payload`, `amount`, `planId`, `paid_at`.
  - Забезпечення суворої ідемпотентності: повторний виклик вебхука з тим самим `telegram_payment_charge_id` не подвоює підписку і не створює дублікати записів.

### ЕТАП 4. Реальний Status API
- **GET `/api/payments/stars/status?orderId=...`**:
  - Вимагати валідний заголовок `Authorization: tma <initData>` (повертати `401 JSON` без нього).
  - Повертати `404 JSON` при невідомому замовленні.
  - Повертати `403 JSON` при спробі запитати чуже замовлення іншого користувача.
  - Повертати `200 JSON` зі статусом `PENDING` або `PAID` (`paymentVerified: true, subscriptionActive: true, planId: ...`).
  - Ніколи не повертати SPA `index.html` для `/api/*`.

### ЕТАП 5. Реалізувати три платні плани
- Додати підтримку тарифу `STARTER` (99 XTR) на додаток до `PRO` (250 XTR) та `WHALE` (500 XTR) у:
  - Бекенд-конфігурації `/functions/api/payments/stars/ordersStore.ts`, `create.ts`, `webhook.ts`, `status.ts`.
  - Dev-сервері `vite.config.ts`.
  - Модальному вікні `components/SubscriptionModal.tsx` із відображенням 3 табів/карток:
    - `STARTER` (99 XTR): швидкий старт, 10-20 AI сканів, базові алерти, базовий радар.
    - `PRO` (250 XTR, бейдж **POPULAR**): безлімітні сигнали, ліквідаційна теплокарта, повна академія.
    - `WHALE` (500 XTR): VIP Whale Radar, субсекундні ордер-блоки, приватна аналітика.
  - Клієнт передає на сервер виключно `planId`.

### ЕТАП 6. TON Wallet Connect
- Залишити тільки **TON Connect** (жодних MetaMask або біржових опцій).
- Єдиний кореневий `TonConnectUIProvider` в `index.tsx`.
- Кнопка в `components/screens/PortfolioScreen.tsx`: "Connect TON Wallet" (або opening chooser / connecting / retry).
- Автоматичне закриття пікера після успішного підключення.
- Відображення: дружня адреса `UQ12...ABCD`, кнопки "Copy", "Explorer" (`tonscan.org`), "Disconnect", статус мережі `TON Mainnet · Online`.
- Валідні `tonconnect-manifest.json` та `icon-180.png`.

### ЕТАП 7. Академія — повна локалізація на 3 мови (UA / EN / RU)
- Кнопки перемикання мов перекладають увесь контент:
  - Заголовки, описи карток, рівні (`beginner` / `advanced`), теги, кнопки дії (CTA), назви уроків та відео.
  - Інтерактивні квізи: додати повний словник запитань та варіантів відповідей російською мовою `ru` у `components/screens/MediaScreen.tsx` на додаток до `ua` та `en`.
  - Стани помилок, пейволу та завантаження.
  - Збереження обраної мови у `localStorage` (`stork_academy_lang`).

### ЕТАП 8. Ринкові статуси свіжості даних
- Уніфікувати бейджі та стани у `AIMarketSummary.tsx`, `MarketTicker.tsx` та графіках:
  - `LIVE`: тільки після успішного свіжого API response.
  - `DELAYED` / `STALE`: при використанні кешу після встановленого порогу (35с).
  - `DEMO`: при активному режимі симулятора ринку.
  - `ERROR`: при відмові мережі/API.
  - Відображати час останнього оновлення (`lastUpdatedAt`) та кнопку повторної спроби `[↻ Повторити]`.
  - Сувора заборона виводити `LIVE` на застарілих кешованих даних.

### ЕТАП 9. LoadingScreen і дизайн
- Зберегти 100% відповідність `PROJECT_MANIFESTO.md`:
  - Строго 6.5 секунд ініціалізації.
  - Вертикальна колонка літер `S T O R K C R Y P T O` із лазерним скануванням зверху вниз.
  - `CIPHER_POOL` без статичних знаків `?`.
  - 8 стадій телеметрії ядра та прогрес-бар.
  - Відсутність зайвих непередбачених елементів (обертові кільця, монета).

### ЕТАП 10. Модальні вікна (A11y, Z-index, Scroll Lock)
- Інформаційні та аналітичні модальні вікна — fullscreen.
- Вікно підписки PRO — компактний виняток (bottom sheet / centered card).
- Наявність `role="dialog"`, `aria-modal="true"`, закриття за Escape, touch-target >= 44px.
- Відсутність зависаючих напівпрозорих бекдропів (no orphan overlays) при закритті.

### ЕТАП 11. Безпековий аудит та заголовки
- Перевірка відсутності бот-токенів, приватних ключів чи секретів у клієнтському коді.
- Валідація тіла запитів та rate limiting.
- Захищені заголовки та CSP.
- Заборона логування повного чутливого `initData`.

### ЕТАП 12–14. Тестування, верифікація та фінальний звіт
- Запуск повного пакету тестів:
  - `npm run test:stars` (E2E тести Telegram Stars, auth, 3 планів, ідемпотентності).
  - `npm run test:security` (сканування секретів та вразливостей).
  - `npm run test:academy` (перевірка 13 навчальних модулів).
  - `npm run build` / `compile_applet`.
- Формування фінального звіту за 15-пунктовим шаблоном із розділу «Формат фінального звіту» (стор. 15–16 PDF).

---

## 🔍 Verification Plan

### Автоматизовані тести:
1. `npm run test:stars` — верифікація:
   - 401 при неавторизованому запиті
   - Генерація замовлень для STARTER (99 XTR), PRO (250 XTR), WHALE (500 XTR)
   - Обробка pre_checkout_query та successful_payment
   - Ідемпотентність вебхука (повторний chargeId повертає `idempotent: true`)
   - Strict JSON у `/api/payments/stars/status` (401/404/403/200)
2. `npm run test:security` — 0 витоків секретів та DEV-байпасів.
3. `npm run test:academy` — валідація ресурсів Академії.
4. `compile_applet` — успішна збірка TypeScript без помилок.

### Ручна та стрес-перевірка:
- Перевірка перемикання тарифів STARTER / PRO / WHALE у `SubscriptionModal`.
- Перевірка перемикання мов UA / EN / RU в Академії (включно із запуском квізу).
- Перевірка відображення кнопки "Connect TON Wallet" у вкладці "Портфель".
- Підтвердження LoadingScreen (вертикальний сканер, 6.5с).
- Формування фінального 15-пунктового звіту.
