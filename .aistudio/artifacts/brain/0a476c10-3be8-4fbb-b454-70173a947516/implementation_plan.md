# План реалізації: Повторний аудит StorkCrypto (15.10.2026)

## 1. Розуміння проблеми та результати повторного аудиту

За результатами live regression-аудиту від 15.10.2026:
- Реліз має статус **NO-GO**.
- **P0-1 `/api/chat`**: Production ендпоінт повернув HTTP 502 `AI_UNAVAILABLE`. Необхідно налагодити Cloudflare Pages Function `/functions/api/chat.ts` та dev middleware `vite.config.ts`, задіяти актуальну доступну модель `gemini-3.8-flash` із надійним каскадом, забезпечити повернення HTTP 200 на валідний ping, HTTP 400 на порожнє тіло, HTTP 413 на овердоз (>64KB), та HTTP 502/504 без витоку ключів. При використанні локального резерву обов'язково відображати статус `OFFLINE/LOCAL`, а не `LIVE AI`.
- **P0-2 Заборона двозначних demo transactions**: За рішенням користувача (Варіант B) впроваджується повноцінний TonConnect потік (`tonConnectUI.sendTransaction` на основі server intent + server verification з ідемпотентністю). Будь-які псевдотранзакційні дії без реального хешу вилучаються з public production UI.
- **P0-3 Payments & Subscriptions**: Жодної активації підписки на клієнті. Створення Stars інвойсу через бекенд, перевірка callback бекендом, унікальний `telegram_payment_charge_id`, серверний payment intent для TON з nonce, expiry та allowlist отримувача. Стани: `PENDING`, `CONFIRMED`, `FAILED`, `CANCELLED`.
- **P1-1 Quests / Info Modal Geometry**: Виявлено критичний дефект `viewport 1280x1100, x=960, width=1280, height=1100`. Причина: інлайн-модалки всередині трансформованих карток. Виправлення: винесення модальних вікон через React Portal у `#modal-root` на рівні `document.body` зі строгою геометрією `position: fixed; inset: 0; width: 100vw; height: 100dvh; margin: 0; transform: none;`, `role="dialog"`, `aria-modal="true"`, focus trap, Escape та Telegram BackButton. Збереження компактного exception для підписки.
- **P1-2 TON Wallet Entry Point**: Додати окрему кнопку «Connect TON Wallet» у Portfolio, чіткі стани loading/empty/error, очищення верифікованих даних при disconnect, приховування балансу як verified до завершення запиту.
- **P1-3 CORS & Security Headers**: Позбутися `access-control-allow-origin: *` для `/api/validate` та auth-чутливих маршрутів (заміна на строгий allowlist доменів). Звузити CSP `connect-src`.
- **P1-4 Admin**: Захист мутацій сервером (`requireAdmin`), повний deny-by-default, відсутність довіри до локальної ролі в localStorage.
- **P1-5 Terminal Data Integrity**: Зберегти 35 активів, запровадити єдиний `snapshotId`, `lastUpdatedAt`, чесні статуси `LIVE/DELAYED/STALE/ERROR`.
- **P1-6 News**: Канонічні URL, джерела, ISO дати (publishedAt, fetchedAt), унікальні ID, категорії, чесний маркер fallback, робоче аудіо «Listen 30s» або пояснення disabled.
- **P1-7 Accessibility**: Семантичні `aria-label`/`title` для всіх елементів інтерфейсу: SIMPLE, PILOT, AI MARKET SCAN, WHALE RADAR, LIQ HEATMAP, MINING_HUB, SENTINEL_BOT, УКР/ENG/РУС, UPGRADE TO PRO, Listen 30s, Signals, зірочки обраного, кнопки закриття.

---

## 2. Покроковий план впровадження

### Крок 1: P0-1 Відновлення AI Chat (`functions/api/chat.ts`, `vite.config.ts`, `services/geminiService.ts`)
1. **`functions/api/chat.ts`**:
   - Перевірити доступність `context.env?.GEMINI_API_KEY || context.env?.API_KEY`.
   - Встановити модель за замовчуванням `gemini-3.8-flash` (офіційна сучасна модель для базових текстових завдань) з fallback на `gemini-flash-latest` або `gemini-3.1-flash-lite`.
   - Забезпечити контракт acceptance:
     - `POST /api/chat` з `{"messages":[{"role":"user","content":"ping"}]}` -> HTTP 200 + валідний JSON `choices[0].message.content`.
     - Невалідне або порожнє тіло -> HTTP 400 `INVALID_REQUEST`.
     - Тіло >64 КБ -> HTTP 413 `PAYLOAD_TOO_LARGE`.
     - Відсутність ключів або збій upstream -> HTTP 502/504 із безпечним повідомленням без витоку ключів.
2. **`services/geminiService.ts`**:
   - Якщо сервер повертає 502/503/504 або мережа офлайн, і вмикається локальне детерміноване ядро, виставляти статус `OFFLINE/LOCAL` замість оманливого `LIVE AI`.
3. **`vite.config.ts`**:
   - Синхронізувати поведінку dev middleware з Cloudflare Function за всіма статус-кодами.

### Крок 2: P0-2 & P0-3 Транзакції та серверні платежі
1. **`services/walletService.ts` & `components/CopyStrategyModal.tsx`**:
   - Видалити повернення псевдосимуляцій із публічного UI або перевести демо-трейдинг у суворо ізольований режим без імітації відправки транзакцій.
   - Забезпечити, що реальні транзакції здійснюються виключно через TonConnect.
2. **`components/SubscriptionModal.tsx`**:
   - Заборонити клієнтську активацію через `upgradeUserTier()` без отримання `status === 'CONFIRMED'` від сервера.
   - Для Stars: генерувати `invoiceId` та лінк через сервер `/api/payment/create-invoice`, верифікувати списання за унікальним `telegram_payment_charge_id`.
   - Для TON: сервер видає intent (`intentId`, `amountNano`, `receiver`, `nonce`, `expiry`), клієнт викликає `tonConnectUI.sendTransaction()`, сервер перевіряє хеш на ідемпотентність.
   - Відображати чесні статуси: `PENDING`, `CONFIRMED`, `FAILED`, `CANCELLED`.

### Крок 3: P1-1 Виправлення геометрії Quests / Info Modal через React Portal
1. **Створення `#modal-root`**:
   - Додати `<div id="modal-root"></div>` безпосередньо в `index.html` як прямий нащадок `<body>`.
2. **`components/InfoModal.tsx`**:
   - Рендерити модальне вікно через `createPortal(..., document.getElementById('modal-root') || document.body)`.
   - Гарантувати стилі безпосередньо на контейнері:
     ```css
     position: fixed;
     inset: 0;
     width: 100vw;
     height: 100dvh;
     margin: 0;
     transform: none;
     ```
   - Забезпечити `x=0, y=0, width=100vw, height=100dvh` у тестах `getBoundingClientRect()`.
   - Реалізувати focus trap, focus return, обробку Escape, Telegram BackButton, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
3. **`components/ModalManager.tsx`**:
   - Перевірити всі повноекранні шари, щоб вони монтувалися поза трансформованими блоками карток/грідів.

### Крок 4: P1-2 TON Wallet Entry Point (`components/screens/PortfolioScreen.tsx`)
1. У режимі `MAINNET (TON)` додати помітну кнопку з точним текстом `Connect TON Wallet` з `aria-label="Connect TON Wallet"`.
2. Реалізувати повний життєвий цикл:
   - Клік -> відкриття селектора TonConnect (`tonConnectUI.openModal()`).
   - Стан `loading` під час з'єднання.
   - `connected` -> відображення валідного скороченого формату адреси (`EQ...` або `UQ...`).
   - `cancelled` -> чистий стабільний empty state без помилок.
   - `error` -> зрозуміле повідомлення користувачу.
   - `disconnect` -> повне очищення верифікованих даних портфеля.
   - Не відображати баланс як `verified` до завершення завантаження даних із мережі.

### Крок 5: P1-3 CORS & Security Headers (`functions/api/`, `vite.config.ts`, `public/_headers`)
1. Видалити `access-control-allow-origin: *` з `/api/validate`, `/api/payment/*`, `/api/chat`.
2. Впровадити строгий allowlist:
   - `https://storkcrypto.pages.dev`
   - `*.pages.dev`
   - `*.run.app`
   - `https://web.telegram.org`
   - `https://telegram.org`
   - `localhost` / `127.0.0.1`
3. У `public/_headers` зберегти HSTS, nosniff, Referrer-Policy, Permissions-Policy та звузити CSP.

### Крок 6: P1-4 Безпека адмін-панелі (`components/AdminDashboard.tsx`, серверні API)
1. Реалізувати відхилення будь-яких неавторизованих запитів на серверному рівні (HTTP 401/403).
2. Заборонити клієнтські мутації без підтвердженої серверної сесії (deny-by-default).
3. Додати валідацію вхідних схем та аудит-лог для всіх адміністративних дій.

### Крок 7: P1-5 & P1-6 Цілісність даних терміналу та Новини
1. **Термінал (`services/priceService.ts`)**:
   - Гарантувати наявність рівно 35 унікальних активів у `MASTER_ASSET_LIST`.
   - Генерувати спільний `snapshotId` та `lastUpdatedAt` (ISO) для узгодженості між тікером, картками та графіком.
   - Чесні статуси свіжості (`LIVE`, `DELAYED`, `STALE`, `ERROR`).
2. **Новини (`services/newsService.ts`, `components/NewsModal.tsx`)**:
   - Кожна новина повинна мати: `canonicalUrl`, `source`, `publishedAt` (ISO), `fetchedAt` (ISO), `id`, `category`, `isFallback`.
   - Кнопка «Listen 30s» повинна коректно відтворювати аудіо або мати стан `disabled` із чітким поясненням причини недоступності синтезу мови.

### Крок 8: P1-7 Accessibility
1. Додати атрибути `aria-label` та `title` для контролів:
   - `SIMPLE`, `PILOT`
   - `AI MARKET SCAN`, `WHALE RADAR`, `LIQ HEATMAP`, `MINING_HUB`, `SENTINEL_BOT`
   - Селектор мов (`УКР`, `ENG`, `РУС`)
   - `UPGRADE TO PRO`, `Listen 30s`, `Signals`
   - Зірочки додавання активів до обраного (`asset stars`)
   - Кнопки закриття (`close/back controls`)

---

## 3. Верифікація та Acceptance Criteria

1. **Self-Test API `/api/chat`**:
   - `curl -i -X POST /api/chat -d '{"messages":[{"role":"user","content":"ping"}]}'` -> **HTTP 200**.
   - `curl -i -X POST /api/chat -d '{}'` -> **HTTP 400**.
   - Тест переповнення (>64 КБ) -> **HTTP 413**.
2. **Modal Geometry**:
   - Для Quests modal (InfoModal) та інших повноекранних вікон:
     ```js
     const r = dialog.getBoundingClientRect();
     console.assert(r.x === 0 && r.y === 0);
     console.assert(r.right <= innerWidth + 1);
     console.assert(r.bottom <= innerHeight + 1);
     ```
3. **Wallet**:
   - Наявність кнопки «Connect TON Wallet» та коректна обробка станів.
4. **Payment**:
   - Жодного підвищення статусу без валідного server receipt.
   - Відхилення симуляцій та дублікатів транзакцій.
5. **Stress Test**:
   - 30 циклів відкриття/закриття модальних вікон: кількість видимих оверлеїв у DOM після закриття = 0.
   - Тести viewports: 360×800, 390×844, 412×915.
6. **Security Test Suite**:
   - `npm run test:security` -> 100% PASS.
   - `npm run test:academy` -> 100% PASS.
   - Скан `dist/` на відсутність ключів (0 витоків).
7. **Незмінний актив**:
   - `LoadingScreen.tsx` (суворо 6.5с, стиль Midnight `#020617`).

---

## 4. Залишкові ризики та план їх усунення

| Ризик | Ймовірність | Вплив | Запобіжні заходи |
|---|---|---|---|
| Нестабільність квот або мережева затримка upstream AI | Середня | Середній | Автоматичний каскадний перехід між моделями Gemini та безпечний HTTP 504 при таймауті 15с |
| Обмеження мобільних WebKit браузерів щодо Web Speech API | Середня | Низький | Делікатна перевірка `window.speechSynthesis` та стан `disabled` із підказкою |
| Зависання відкритих підключень WebSocket | Низька | Низький | Автоматичний реконект із лімітом спроб та перехід на HTTP polling |
