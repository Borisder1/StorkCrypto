# Production Remediation Plan: StorkCrypto Live Audit Fix (28.10.2026)

Based on the global live audit report (`https://storkcrypto.pages.dev/?audit=20261028`) and user clarification:
- **Telegram initData validation**: Enforce strict HTTP 401 when `BOT_TOKEN` or `TELEGRAM_BOT_TOKEN` is configured or on production hosts (`*.pages.dev`, `storkcrypto.pages.dev`), with local dev-test token support. Eliminate `"tg_user"` fallback entirely from production code.
- **Academy localization**: Instant reactive UI and curriculum update across all 13 modules for Ukrainian (UA), English (EN), and Russian (RU) with `localStorage` persistence.

---

## 1. Identified Production Blockers & Root Causes

1. **P0: Insecure Stars Invoice Endpoint (`/api/payments/stars/create`)**:
   - *Issue*: Orders can be created without `initData`, falling back to `userId: "tg_user"`.
   - *Fix*: Require Telegram `initData` with HMAC-SHA256 signature verification. Missing/invalid `initData` returns HTTP 401. Strip all client-supplied trusted fields (`userId`, `amount`, `currency`).
2. **P0: Missing Order Status API Endpoint (`/api/payments/stars/status`)**:
   - *Issue*: Cloudflare Pages returns SPA HTML fallback (`index.html`) because `/functions/api/payments/stars/status.ts` does not exist in the filesystem.
   - *Fix*: Create `/functions/api/payments/stars/status.ts` Cloudflare Pages Function. Authenticate caller via Telegram `initData` or order payload token. Verify user ownership (403 for foreign orders, 404 for unknown orders, 401 for unauthenticated). Return strict JSON: `{ orderId, status, paymentVerified, subscriptionActive, expiresAt }`.
3. **P0: Payment Lifecycle & Idempotency**:
   - *Issue*: Webhook and payment confirmation must be strictly validated server-side.
   - *Fix*: Ensure `pre_checkout_query` answers in <10s with `ok: true` only for valid `XTR` orders, and `successful_payment` records unique `telegram_payment_charge_id`.
4. **P1: TON Connect Manifest & PNG Icon**:
   - *Issue*: Live manifest references `logo.jpg` (JPEG) instead of PNG/ICO.
   - *Fix*: Create `public/icon-180.png` (180x180 PNG asset) and update `public/tonconnect-manifest.json` and root manifest.
5. **P1: TON Wallet Connect Integration in Portfolio**:
   - *Issue*: Wallet picker must close automatically upon connection, show masked friendly address `UQAb12…xYz9`, wallet name, Copy, Explorer link, Disconnect, and use `useIsConnectionRestored` before rendering Disconnected state.
   - *Fix*: Wrap App in single root `TonConnectUIProvider` with dynamic manifest URL; implement auto-close and full account display in `PortfolioScreen.tsx`.
6. **P1: Market Data Status & Stale Transparency**:
   - *Issue*: Stale cache shows without exact timestamp or retry trigger.
   - *Fix*: In `AIMarketSummary.tsx` and `MarketTicker.tsx`, add `lastUpdatedAt` formatted timestamp, stale threshold indication, and manual `[↻ Повторити]` button. Never display `LIVE` when source is `CACHE`.
7. **P1: Academy Tri-Lingual Curriculum Localization (UA / EN / RU)**:
   - *Issue*: Switching language switches active tab button, but card descriptions and lesson curriculum remain mixed English/Ukrainian.
   - *Fix*: Expand `AcademyLessonsData.ts` to supply fully translated titles, descriptions, difficulty levels, category tags, quiz questions, and video fallbacks in Ukrainian, English, and Russian.
8. **P1: Manifesto Loading Screen & Onboarding Alignment**:
   - *Issue*: Loading screen must retain vertical layout, rotating concentric rings transforming into StorkCrypto at 100%, 6.5s ± 100ms duration, single-line text on 360x800, without semicircle disappearance or confusion with the subsequent onboarding tour.

---

## 2. Proposed Changes Step-by-Step

### Phase 1: P0 Payment Security & Cloudflare Function Status API
- **`functions/api/payments/stars/create.ts`**:
  - Implement HMAC-SHA256 validation for Telegram `initData` using Web Crypto API.
  - Return HTTP 401 `{ error: 'UNAUTHORIZED', message: 'Valid Telegram initData required' }` if `initData` is missing or invalid.
  - Remove all `"tg_user"` fallback logic from production execution path.
  - Extract genuine Telegram user ID from HMAC-verified payload.
  - Enforce server-side pricing (`amount: 250` for PRO, `amount: 500` for WHALE; `currency: 'XTR'`).
- **`functions/api/payments/stars/status.ts`** (NEW FILE):
  - Cloudflare Pages Function at `/api/payments/stars/status`.
  - Handle `GET` and `OPTIONS` with CORS.
  - Validate Telegram `initData` from `Authorization: tma <initData>` header or query.
  - Return HTTP 401 if unauthenticated, 404 if order not found, 403 if user ID does not match order owner.
  - Return JSON:
    ```json
    {
      "orderId": "STARS_ORD_...",
      "status": "PENDING" | "PAID" | "CANCELLED" | "FAILED",
      "paymentVerified": boolean,
      "subscriptionActive": boolean,
      "expiresAt": string | null
    }
    ```
- **`vite.config.ts`**:
  - Mirror the new `/api/payments/stars/status` route in dev middleware so local development matches Cloudflare Functions exactly.

### Phase 2: TON Connect Manifest, Icon & Portfolio UX
- **`public/icon-180.png`**:
  - Generate a valid 180x180 PNG icon with StorkCrypto cyber branding.
- **`public/tonconnect-manifest.json`** & **`tonconnect-manifest.json`**:
  - Ensure `iconUrl: "https://storkcrypto.pages.dev/icon-180.png"`.
- **`index.tsx`**:
  - Ensure single root `TonConnectUIProvider` wraps `<App />` using the dynamic manifest URL.
- **`components/screens/PortfolioScreen.tsx`**:
  - Use `useTonAddress()`, `useTonWallet()`, and `useIsConnectionRestored()`.
  - While `!restored`, show subtle restoring state instead of falsely reporting "Disconnected".
  - Show masked address `UQAb12…xYz9`, wallet app name (e.g., Tonkeeper), Copy address button, Explorer link (`tonscan.org/address/...`), and Disconnect button.
  - Prohibit activating PRO on wallet connection alone.

### Phase 3: Market Data Freshness & STALE Transparency
- **`components/AIMarketSummary.tsx`**:
  - Track `lastUpdatedAt` date timestamp.
  - Display exact timestamp (e.g. `Оновлено: 14:32:05`).
  - Add explicit stale badge and interactive `[↻ Оновити]` retry button.
  - Show honest `CACHE (Затримка)` when API responds from cache.

### Phase 4: Academy Tri-Lingual Content (UA / EN / RU)
- **`components/AcademyLessonsData.ts`**:
  - Provide full localized content for all 13 modules across `uk`, `en`, and `ru`:
    - `title`, `description`, `levelLabel` (Початківець / Beginner / Начинающий), `tags`, `quiz` questions and answers.
- **`components/screens/MediaScreen.tsx`** & **`components/AcademyBannerWidget.tsx`**:
  - Ensure selecting UA, EN, or RU immediately re-renders all lesson cards and drill exercises with the active language without page reload.

### Phase 5: Loading Screen (Manifesto) Polish & Onboarding Separation
- **`components/LoadingScreen.tsx`**:
  - Verify rotating concentric rings visual motif with particle stream converging into `StorkCrypto` letters at 100%.
  - Verify strict 6.5s timing.
  - Ensure single-line text layout on 360x800 viewport.
  - Verify clean handoff to dashboard without glitching or appearing stuck on onboarding.

---

## 3. Verification & Testing Plan

1. **Automated E2E Audit (`npm run test:stars`)**:
   - Verify `/api/payments/stars/create` returns HTTP 401 when `initData` is missing or invalid.
   - Verify `/api/payments/stars/create` returns HTTP 200 with valid `initData`.
   - Verify `/api/payments/stars/status` exists as a JSON API (not HTML) and returns 401 without auth, 404 for unknown order, 200 for matching owner.
   - Verify `pre_checkout_query` and `successful_payment` lifecycle and idempotency.
2. **Security & Academy Audits**:
   - `npm run test:security`: credential leak scan, 44px touch targets.
   - `npm run test:academy`: all 13 lessons and language variants verified.
3. **Compilation & Linter**:
   - `lint_applet` (`tsc --noEmit`).
   - `compile_applet` (`npm run build`).
4. **Final 10-Item Release Report**:
   - Format matching Section 10/13 of the audit specification.
