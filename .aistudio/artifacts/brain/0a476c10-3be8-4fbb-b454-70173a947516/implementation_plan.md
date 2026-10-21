# Implementation Plan: Telegram Stars (XTR), Web Invoice & TON Wallet Architecture Fix

Based on the Technical Specification: "ВИПРАВЛЕННЯ ОПЛАТИ TELEGRAM STARS, WEB INVOICE І TON WALLET" (21.10.2026) and user clarifying choices:
- **TON Connect integration**: Custom StorkCrypto themed modal synced directly with `TonConnectUI.onStatusChange` with auto-closing overlay upon connection.
- **Web external checkout**: Direct invoice link with "Open in Telegram" fallback and backend polling.
- **Strict Telegram Rules**: PRO subscription sold exclusively via Telegram Stars (`currency: XTR`). TON Wallet reserved for blockchain integrations and wallet connection, never substituting Stars for in-app digital subscriptions.

---

## 1. Requirements Analysis & Core Invariants

### A. Telegram Stars (`XTR`) in Mini App
1. **Backend Order & Invoice Creation (`POST /api/payments/stars/create` & `POST /api/payments/stars/create-link`)**:
   - Extract and validate Telegram `initData` via HMAC signature (when `TELEGRAM_BOT_TOKEN` is configured).
   - Derive the real Telegram `user_id` from validated `initData`. Do NOT trust unverified `user_id` from client body.
   - Enforce pricing on server: `pro_monthly` / `PRO` = 250 Stars (`amount: 250`), `WHALE` = 500 Stars (`amount: 500`).
   - Currency strictly `'XTR'`. Reject any attempts with `'GRAM'` or other tokens.
   - Generate unique cryptographic `invoice_payload` tied to order ID and user ID.
   - Return `{ success: true, invoiceUrl, invoiceLink, order: { orderId, amount, currency: 'XTR', status: 'PENDING', ... } }`.
2. **Frontend Mini App Invoice Launch**:
   - Call `Telegram.WebApp.openInvoice(invoiceUrl, callback)`.
   - The invoice callback is strictly informational and is NOT accepted as proof of payment.
   - Frontend polls `GET /api/me/subscription` or `GET /api/subscription/status?orderId=...` to confirm activation.
3. **Mandatory Webhook Processing (`POST /api/payments/stars/webhook`)**:
   - `pre_checkout_query`: Validate `order_id`, `invoice_payload`, currency (`XTR`), amount. Respond within 10 seconds via `answerPreCheckoutQuery(ok: true)`. Reject non-XTR currencies.
   - `successful_payment`: Verify payload, total amount, currency (`XTR`). Idempotently check `telegram_payment_charge_id`. Transition order to `'PAID'` and activate subscription for 30 days.
4. **Authoritative Source of Truth**:
   - `GET /api/me/subscription` returns:
     ```json
     {
       "plan": "pro",
       "status": "active",
       "source": "TELEGRAM_STARS",
       "expiresAt": "2026-11-20T10:00:00.000Z"
     }
     ```
   - No `isPro = true` in frontend without this server response.

### B. External Web Invoice Flow (Browser outside Telegram)
1. User clicks "Оплатити через Telegram" / "Pay via Telegram".
2. Web requests `POST /api/payments/stars/create-link`.
3. Opens HTTPS link to Telegram invoice (`https://t.me/$...`).
4. If Telegram is not installed or invoice fails, displays fallback button: `Open in Telegram`.
5. Web polls `/api/subscription/status?orderId=...` and activates PRO strictly after backend confirmation.

### C. TON Connect Wallet Picker & Address Display
1. **Root Configuration & Singleton Instance**:
   - Singleton `getTonConnectUI()` with `tonconnect-manifest.json`.
   - Update `public/tonconnect-manifest.json` with official parameters (`url: "https://storkcrypto.pages.dev"`, `termsOfUseUrl`, `privacyPolicyUrl`, `iconUrl`).
2. **Auto-closing Custom Modal Overlay**:
   - In `WalletConnectModal.tsx`, subscribe to `tonConnectUI.onStatusChange((wallet) => { ... })`.
   - When `wallet !== null` (connection confirmed), IMMEDIATELY call `onClose()` / `setWalletPickerOpen(false)` so the overlay vanishes from DOM without lingering.
3. **Masked Friendly Address Display**:
   - Display masked friendly address: `UQAb12…xYz9` instead of raw hexadecimal or full string on mobile screens.
   - Actions provided:
     - Copy address (with toast feedback and haptic)
     - Open in TON explorer (`tonscan.org/address/...`)
     - Disconnect (clearing both SDK and Zustand state)
     - Connected wallet name (e.g. Tonkeeper, Telegram Wallet)
     - Network status (Mainnet)
     - Error / Retry state

### D. PRO Modal States Machine
Implement full UI states in `SubscriptionModal.tsx`:
- `BASIC`
- `Invoice preparing...` (with spinner, disabled repeat clicks, client request ID)
- `Waiting for Telegram payment...`
- `Payment verification...`
- `PRO active`
- `Payment canceled`
- `Payment failed`
- `Payment pending`
- Timeout after 60-90 seconds with Retry button.

### E. Design Invariants & Readability (Chief Design Developer role)
1. **Loading Screen (Manifesto)**:
   - Keep 6.5s ± 100ms duration, vertical layout, dark background, fog emergence, pixel-by-pixel disintegration into progress bar.
   - Absolutely no replacement with generic spinners or premature cutoff.
2. **Typography & Readability**:
   - Increase text size of key market indicators by ~10% ($2.1T Market Cap, +3.2% 24h Change, asset prices, LIVE / DELAYED / STALE / DEMO badges, Pay / Connect Wallet / Disconnect buttons).
   - Ensure clean dark terminal aesthetic without rainbow or excess neon colors.
   - Ensure mobile compatibility (360x800, 390x844, 412x915).

---

## 2. Proposed Code Changes

### Step 1: Telegram Stars Backend Endpoints
- **`/functions/api/payments/stars/create.ts`**:
  - Support `Authorization: tma <initData>` header and body.
  - Map `plan: 'pro_monthly'` to `PRO` (250 Stars) and `WHALE` (500 Stars).
  - Return both `invoiceUrl` and `invoiceLink`.
  - Validate HMAC signature when `TELEGRAM_BOT_TOKEN` is present.
- **`/functions/api/payments/stars/create-link.ts`**:
  - Create alias or dedicated web link creation endpoint.
- **`/functions/api/me/subscription.ts`**:
  - Update format to return `{ plan: 'pro', status: 'active', source: 'TELEGRAM_STARS', expiresAt: '...' }` matching Section 2.4.
- **`/vite.config.ts`**:
  - Update dev middleware to support `/api/payments/stars/create-link` and header-based `Authorization: tma ...`.

### Step 2: TON Connect Manifest & Singleton Service
- **`/public/tonconnect-manifest.json` & `/tonconnect-manifest.json`**:
  - Update with compliant metadata:
    ```json
    {
      "url": "https://storkcrypto.pages.dev",
      "name": "StorkCrypto",
      "iconUrl": "https://storkcrypto.pages.dev/icon-180.png",
      "termsOfUseUrl": "https://storkcrypto.pages.dev/terms",
      "privacyPolicyUrl": "https://storkcrypto.pages.dev/privacy"
    }
    ```
- **`/services/tonConnectService.ts`**:
  - Ensure singleton stability, correct manifest loading with fallback, and safe error suppression in iframe.

### Step 3: TON Wallet Picker Lifecycle & Address UI
- **`/components/WalletConnectModal.tsx`**:
  - Hook into `tonConnectUI.onStatusChange((wallet) => { if (wallet) onClose(); })` to close picker immediately upon connect.
- **`/components/screens/PortfolioScreen.tsx`**:
  - Add friendly address display: `UQAb12…xYz9`.
  - Add Copy address button with haptic feedback.
  - Add "Open in explorer" link with `noopener,noreferrer`.
  - Add Disconnect button and connected wallet app name (e.g. Tonkeeper).
  - Handle all connection states (`disconnected`, `opening chooser`, `connecting`, `connected`, `cancelled`, `failed`, `disconnected again`).

### Step 4: PRO Subscription Modal States & Web Fallback
- **`/components/SubscriptionModal.tsx`**:
  - Update states to: `BASIC`, `Invoice preparing...`, `Waiting for Telegram payment...`, `Payment verification...`, `PRO active`, `Payment canceled`, `Payment failed`, `Payment pending`.
  - Disable buttons during preparation to prevent double clicks.
  - Add 60-90s timeout with Retry button.
  - Add Web fallback button "Open in Telegram" if outside Telegram or invoice cannot open directly.
  - Query `/api/me/subscription` and activate PRO only upon successful server response.

### Step 5: Readability & Design Polish
- **`/components/AIMarketSummary.tsx` & `/components/screens/HomeScreen.tsx`**:
  - Increase market indicator font size by ~10% ($2.1T Market Cap, +3.2% 24h Change, prices, badges).
  - Ensure contrast and readability in Telegram Android WebView and iOS Safari.
- **`/components/LoadingScreen.tsx`**:
  - Verify strict 6.5s sequence and single-line responsive branding on 360x800.

---

## 3. Verification Plan

1. **E2E Telegram Stars Payment Test**:
   - `npm run test:stars`: verify order creation with `currency: 'XTR'`, `amount: 250`, `invoiceUrl`, `pre_checkout_query` within 10s, `successful_payment` verification, idempotency on duplicate charge ID, and No-PRO-before-receipt.
2. **Security & Regression Test**:
   - `npm run test:security`: verify no credentials leaked, demo simulation transparency, 44px touch targets.
   - `npm run test:academy`: verify all 13 academy modules.
3. **Manifest & TON Connect Test**:
   - Verify `tonconnect-manifest.json` returns HTTP 200 with valid schema.
   - Verify `onStatusChange` closes the custom modal immediately when wallet connects.
4. **Build & Lint Verification**:
   - `lint_applet` (`tsc --noEmit`).
   - `compile_applet` (`npm run build`).
5. **Final 14-Section Audit Report**:
   - Render the exact report specified in Section 10 of the specification.
