# AGENTS.md — StorkCrypto Project Rules & Current State

## 1. Project Context & Rules
- **Application**: StorkCrypto (Neural Crypto Terminal) — Telegram Mini App + PWA
- **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, Motion, Zustand / Custom Store
- **Design Tokens & Theme**:
  - Dark mode: `#020617` (surface-0), `#050b14`, cyan `#00F0FF`, emerald `#00FF9D`, purple `#BD00FF`, rose `#FF0055`, amber `#FBBF24`
  - Daylight mode: high-contrast `#f8fafc` / `#f1f5f9` slate base with dark `#0f172a` readable text and high contrast badges.
  - Fonts: Orbitron (headings) + JetBrains Mono (data/numbers)

## 2. Recent Updates & Completed Fixes
- **Top Ticker (`/components/MarketTicker.tsx`)**:
  - Smooth 150s ultra-slow, flicker-free CSS ticker (`translate3d`, `will-change: transform`).
  - Pauses on hover / touch (`:hover`, `:active`) for easy reading.
  - Tapping/clicking any crypto ticker opens `AssetDetailModal` with full chart analytics and haptic feedback.
  - Status badge simplified to "LIVE" for compact mobile layout.
  - Enhanced Theme Switcher (`☀️ DAY` / `🌙 NIGHT`) for clear readability in both light & dark modes.
- **Loading Screen (`/components/LoadingScreen.tsx`) (IMMUTABLE 6.5s)**:
  - Суворо 6.5с послідовність (2.5с 3D-лазерне сканування зверху вниз + 3.2с зарядка нейромережі + 0.8с фіналізація).
  - Усунено статичні знаки `?`: впроваджено `CIPHER_POOL` із перебором літер `S T O R K C R Y P T O`, ASCII-hex (`0x53`–`0x4B`) та міток (`NODE`, `HASH`, `SYNC`, `SCAN`, `LIVE`, `BLOCK`, `SIGNAL`, `READY`).
  - Додано рядок телеметрії та відсотків (0–100%) над прогрес-баром із динамічними стадіями ядра від `INITIALIZING // NEURAL CORE` до `SYSTEM READY // CONNECTED`.
- **Дані, Trial та A11y (Етапи 1-2)**:
  - `UpgradeBanner`: статус `TRIAL EXPIRED` / `BASIC` без оманливого бейджа `LIVE` при закінченні терміну.
  - `WhaleTrackerWidget`: реальний розрахунок `netFlow` на базі транзакцій або статус `ANALYZING...` замість фіктивного `$0k`.
  - `ScannerScreen` / `ScannerModal`: бейдж `N/A` замість `$0.0000` при відсутності котирування.
  - **Крок 2 (Modal Accessibility — WCAG & a11y)**: повна реалізація `role="dialog"`, `aria-modal="true"`, `aria-labelledby` для заголовків та обробників клавіші `Escape` в усіх модальних вікнах (`AssetDetailModal`, `DexAggregatorModal`, `ScannerModal`, `CategorizedHubModal`, `ChatScreen`, `SubscriptionModal`, `AirdropModal`, `WhaleRadarProModal`, `LiquidationHeatmapModal`, `ReferralModal`, `CalendarModal`, `WalletConnectModal`, `LeaderboardModal`). Семантичні `aria-label` для кнопок закриття та 44px touch targets.
- **Крок 3 (Варіант А — Академія та Гейміфікація & Варіант Б — Доступність форм і навігації)**:
  - **Варіант А (Академія)**: Інтегровано `QuizModal` та `AcademyModal` із підтримкою місій `ACADEMY` в квестах (`Tactical Academy`). Додано вибір між «Експрес-квізом (+50 XP)» та «Тактичним дрілом (15с)». Успішне проходження автоматично зараховує прогрес у квест, нараховує XP та викликає тактильний відгук (`triggerHaptic('success')`).
  - **Варіант Б (Доступність)**:
    - `BottomNav`: Повноцінна імплементація W3C APG Tablist (`role="tablist"`, `role="tab"`, `aria-selected`, клавіатурна навігація стрілками `ArrowLeft`/`ArrowRight`/`Home`/`End`, roving `tabIndex`).
    - `DexAggregatorModal`: Семантичні підписи (`aria-label`) для інпутів суми, селекторів валют, чипів швидкого заповнення відсотків (25%, 50%, 75%, MAX), кнопки перевертання пари (`#swap_flip_btn` як accessible `<button>`), пресетів проковзування (`aria-pressed`), та фокус-станів (`focus-visible:ring-2`).
- **Telegram WebApp v6.0 compatibility**:
  - `openInvoice` безпечно огорожено перевіркою версії `isTelegramVersionAtLeast('6.1')` у `utils/telegram.ts` та `SubscriptionModal.tsx`.
  - Забезпечено автоматичний плавний fallback на прямий баланс Stars при виклику у версіях Telegram WebApp < 6.1 без викидання помилки.

## 3. Architecture Constraints
- z-index hierarchy: base:0, elevated:10, dropdown:20, sticky:30, modal:40, toast:50.
- All text strings localized via `t('key')` in `translations.ts`.
- Pure Tailwind tokens and responsive 100dvh layout for Telegram Mini App environment.
