# План реалізації: Фінальне виправлення StorkCrypto (Аудит 14.10.2026)

## 1. Розуміння проблеми та вимоги

Після live-аудиту від 14.10.2026 виявлено критичні проблеми (P0) та архітектурні недоліки (P1):
1. **P0-1 `/api/chat`**: Production ендпоінт повертав HTTP 503 `AI_UNAVAILABLE`. Необхідно забезпечити стабільну роботу в Cloudflare Pages Functions (`functions/api/chat.ts`) та dev middleware (`vite.config.ts`), параметризувати модель через `GEMINI_MODEL || AI_MODEL || 'gemini-2.5-flash'`, додати таймаут 15с, валідацію вхідного payload (HTTP 400), ліміт розміру (HTTP 413), та безпечні помилки (HTTP 502/504) без витоку ключів.
2. **P0-2 Заборона фальшивих транзакцій (Обрано Варіант B)**: Впровадити повноцінний TonConnect потік транзакцій:
   - Сервер генерує `payment intent` (ідентифікатор, nonce, сума, адреса отримувача з allowlist, expiry).
   - Клієнт підписує транзакцію виключно на основі сервера.
   - Сервер верифікує транзакцію on-chain, перевіряючи хеш на ідемпотентність.
   - Видалити всі псевдо-симуляції з production flow; жодна кнопка не має імітувати реальний блокчейн.
3. **P0-3 Серверна оплата (Telegram Stars & TON)**:
   - Telegram Stars: `create-invoice` через Bot API -> клієнт викликає `Telegram.WebApp.openInvoice` -> обробка успішного платежу сервером -> запис `telegram_payment_charge_id` як unique -> оновлення статусу через `/api/me/subscription`.
   - Заборона клієнтського підвищення tier (`upgradeUserTier()` лише за наявності валідованого чека).
4. **P1-1 & P1-2 Безпека адмін-панелі**:
   - Приховати Admin Central з публічного UI до отримання підтвердженої серверної сесії / JWT-claims.
   - Всі мутації захищені серверним middleware `requireAdmin()` з audit log.
   - Очищення чутливих даних сесії при logout.
5. **P1 Modal Manager & Fullscreen**:
   - Єдиний `ModalManager` / `ModalProvider` з API: `openModal({ id, kind, content, onClose, returnFocusTo })`, `closeModal(id)`, `closeTopModal()`.
   - Не більше 1 активного діалогу одночасно, заборона orphan overlays.
   - Стандартизована геометрія (`position: fixed; inset: 0; width: 100vw; height: 100dvh` для fullscreen) та compact для підписки.
   - Підтримка safe area, Escape, Telegram BackButton, WCAG (`role="dialog"`, `aria-modal="true"`).
6. **P1 TON Wallet UX**:
   - Явна кнопка «Connect TON Wallet» у Mainnet mode з `aria-label`.
   - Очищення даних портфеля при disconnect, чіткі loading/empty/error стани.
7. **P1 Цілісність даних (Data Integrity) & Новини**:
   - Єдиний `snapshotId`, `lastUpdatedAt` та часовий пояс для ринкових котирувань.
   - Чесні статуси (`LIVE`, `DELAYED`, `STALE`, `ERROR`), заборона показу `LIVE` при використанні кешу.
   - Повноцінна робота аудіо «Listen 30s» або стан `disabled` з чітким поясненням.
8. **P1 CSP, CORS та відсутність секретів**:
   - Видалення `*` з identity-sensitive маршрутів, жорсткий allowlist джерел, заборона витоку секретних ключів у bundle.
9. **Accessibility & Design**:
   - Семантичні `aria-label` для всіх інтерактивних елементів (SIMPLE, PILOT, AI MARKET SCAN, WHALE RADAR, LIQ HEATMAP, MINING_HUB, SENTINEL_BOT, УКР/ENG/РУС, UPGRADE TO PRO, LISTEN 30s, SIGNALS, кнопки зірочок та закриття).
   - Збереження незмінного Loading Screen (суворо 6.5с, стиль Midnight `#020617`).

---

## 2. Архітектура та дизайн-рішення

### A. Контракт API `/api/chat`
- Модель: `env.GEMINI_MODEL || env.AI_MODEL || 'gemini-2.5-flash'` з автоматичним фолбеком на `gemini-3.8-flash`.
- Валідація: наявність `messages` (масив з об'єктами `role` та `content`), ліміт довжини контексту.
- Статуси відповідей:
  - 200: `{ choices: [{ message: { content: "..." } }] }`
  - 400: `{ error: "INVALID_REQUEST_BODY" }`
  - 413: `{ error: "PAYLOAD_TOO_LARGE" }`
  - 502/504: `{ error: "UPSTREAM_TIMEOUT", message: "AI provider did not respond in time" }`
  - 503: `{ error: "AI_UNAVAILABLE" }` (якщо ключ не сконфігуровано)

### B. TonConnect Server-Verified Flow (Варіант B)
- **Маршрут `/api/ton/intent`**:
  - Приймає `planId` ('pro' | 'whale'), генерує унікальний `nonce`, суму в nanoTON, адресу казначейства з безпечного конфігу, час дії (15 хв).
- **Клієнтський виклик `sendTransaction`**:
  - Використовує payload, наданий сервером.
- **Маршрут `/api/ton/verify`**:
  - Приймає `intentId`, `boc` / `transactionHash`, адресу відправника.
  - Звіряє хеш on-chain, перевіряє унікальність хешу в базі/пам'яті (idempotency).
  - При успіху активує підписку та повертає статус `CONFIRMED`.

### C. Telegram Stars Server Flow
- **Маршрут `/api/payment/create-invoice`**:
  - Створює Stars інвойс через Bot API та повертає `invoiceLink`.
- **Клієнт**:
  - Відкриває `Telegram.WebApp.openInvoice(invoiceLink, callback)`.
- **Маршрут `/api/payment/verify-stars`**:
  - Перевіряє статус списання Telegram Stars за `telegram_payment_charge_id`.

### D. ModalManager v2
- Створення централізованого менеджера діалогів з чергою та стеком:
  ```ts
  type ModalKind = 'fullscreen' | 'compact';
  interface ModalConfig {
    id: string;
    kind: ModalKind;
    content: React.ReactNode;
    onClose?: () => void;
    returnFocusTo?: HTMLElement | string;
    ariaLabelledBy?: string;
  }
  ```
- Гарантія: `visible dialogs <= 1` (крім вкладених селекторів, де попередній приховується або стає неінтерактивним).
- Єдиний z-index з конфігурації, блокування скролу `body` через `lockCount`, закриття через клавішу Escape та `BackButton`.

### E. Приховування Admin Central
- Компонент `AdminScreen` / `AdminCentral` не рендериться в публічному дереві навігації без підтвердженої ролі `role === 'admin'` у серверній сесії.
- Доступ до адмін-маршрутів повертає HTTP 403 при відсутності валідного токена.

---

## 3. Пофайловий план реалізації

### 1. Серверні функції та API (`functions/api/`, `vite.config.ts`, `server.ts`)
- **`functions/api/chat.ts`**:
  - Оновити резолв моделі: `env.GEMINI_MODEL || env.AI_MODEL || 'gemini-2.5-flash'`.
  - Додати AbortController з таймаутом 15 секунд (повернення HTTP 504 при перевищенні).
  - Додати валідацію вхідного JSON (HTTP 400) та ліміт 64 КБ (HTTP 413).
  - Уніфікувати структуру відповіді `{ choices: [{ message: { content: string } }] }`.
- **`functions/api/payment.ts` / `functions/api/ton.ts`**:
  - Створити безпечні серверні ендпоінти для генерації intent, інвойсів та перевірки хешів.
- **`vite.config.ts`**:
  - Синхронізувати поведінку dev-сервера з продакшн контрактом (HTTP 200/400/413/502/504).

### 2. Управління модальними вікнами (`components/ModalManager.tsx`, `index.css`)
- Оновити `ModalManager.tsx`:
  - Впровадити строгий стек модалок, що гарантує відсутність залишкових оверлеїв (orphan overlays).
  - Реалізувати auto-focus на першому елементі та повернення фокусу на елемент-ініціатор при закритті.
  - Додати семантичні атрибути `role="dialog"`, `aria-modal="true"`.
- Оновити `index.css`:
  - Забезпечити класи `.modal-layer--fullscreen` з `max-width: 100%`, `max-height: 100%`, `box-sizing: border-box`, `padding-top: max(16px, env(safe-area-inset-top))`.

### 3. Гаманець та оплата (`components/SubscriptionModal.tsx`, `components/PortfolioScreen.tsx`, `services/walletService.ts`)
- **`components/SubscriptionModal.tsx`**:
  - Заборонити клієнтське нарахування PRO без серверного підтвердження.
  - Відображати стани: `INITIALIZING` -> `PENDING` -> `CONFIRMED` / `FAILED`.
  - Підключити TonConnect виклик транзакції на основі серверного payload.
- **`components/PortfolioScreen.tsx`**:
  - Додати явну кнопку «Connect TON Wallet» у Mainnet режимі з `aria-label="Підключити TON гаманець"`.
  - Забезпечити повне очищення даних портфеля при натисканні «Disconnect».
- **`services/walletService.ts`**:
  - Повністю усунути імітаційні функції, що генерують випадкові хеші для транзакцій.

### 4. Адмін-панель та безпека ролей (`components/ProfileScreen.tsx`, `store/slices/authSlice.ts`, `components/AdminCentralModal.tsx`)
- Приховати кнопку входу в Admin Central для звичайних користувачів.
- Рендерити адмін-панель виключно після верифікації через серверний бекенд.
- Захистити критичні параметри (адреса treasury, ціни тарифів) від зміни на клієнті.

### 5. Цілісність ринкових даних та новин (`components/MarketTicker.tsx`, `components/NewsModal.tsx`, `services/marketService.ts`)
- Додати `snapshotId` та часовий пояс до котирувань.
- Заборонити показ статусу `LIVE`, якщо дані взято з локального кешу.
- У `NewsModal.tsx`: додати стан `disabled` для кнопки «Listen 30s», якщо аудіо-рушій недоступний, або забезпечити стабільне відтворення.

### 6. Доступність (A11y) та CSP (`index.html`, `public/_headers`, компоненти UI)
- Додати `aria-label` для кнопок: SIMPLE, PILOT, AI MARKET SCAN, WHALE RADAR, LIQ HEATMAP, MINING_HUB, SENTINEL_BOT, вибору мов, UPGRADE TO PRO, LISTEN 30s, зірочок обраного, кнопок «Назад» і «Закрити».
- Посилити CSP у `public/_headers`: обмежити `connect-src` та видалити зайві wildcard дозволи.

---

## 4. Верифікація та тести (Evidence & Acceptance)

1. **API /chat**:
   - `curl -i -X POST /api/chat -d '{"messages":[{"role":"user","content":"ping"}]}'` -> HTTP 200.
   - `curl -i -X POST /api/chat -d '{}'` -> HTTP 400.
   - Тест на велике тіло запиту (>64 КБ) -> HTTP 413.
2. **DOM & Modal Manager**:
   - Стрес-тест 30 циклів відкриття/закриття модалок: кількість видимих оверлеїв у DOM = 0 після закриття.
   - Перевірка геометрії на екранах 360x800, 390x844, 412x915, 1280x1100.
3. **Security & Bundle Scan**:
   - Повний скан продакшн-бандлу `dist/` на відсутність ключів (Gemini, Bot Token, Service Role, Private Key).
   - `npm run test:security` -> 100% успішних перевірок.
4. **Payments & Transactions**:
   - Тест сценаріїв TonConnect та Telegram Stars: перевірка обробки статусу pending, відхилення невалідного хешу, захист від подвійного зарахування.
5. **Loading Screen**:
   - Збереження незмінним: 6.5с, стиль Midnight `#020617`.

---

## 5. Аналіз ризиків та запобігання

| Ризик | Ймовірність | Вплив | Запобіжні заходи |
|---|---|---|---|
| Блокування запитів до Telegram Bot API або Cloudflare | Середня | Високий | Фолбек на коректні HTTP 502/504 коди та повідомлення користувачу без зламу UI |
| Помилки TonConnect у мобільних WebView | Низька | Середній | Використання стандартного `tonconnect-manifest.json` та обробка стану скасування користувачем |
| Регресія швидкості завантаження через перевірки | Низька | Низький | Кешування публічних котирувань з явним маркуванням свіжості (`CACHE`/`LIVE`) |
