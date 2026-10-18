# Implementation Plan: Telegram Stars (XTR) End-to-End Payment, Architecture & Global StorkCrypto Stabilization

This plan outlines the end-to-end implementation of the Telegram Stars (`XTR`) payment architecture, server-authoritative subscription verification, clean decoupling from TON/crypto assets, modal geometry stability, and complete regression compliance for StorkCrypto.

---

## 1. Requirements Analysis & Scope Alignment

### Clarifications & User Decisions
- **Payment Method**: Strictly **Telegram Stars (`currency: XTR`)** for all in-app digital upgrades (`PRO` / `WHALE`). No GRAM as a Telegram currency. No mixing of Stars with TON or jettons in the invoice flow.
- **Development Environment**: Server endpoints supporting Telegram bot token configuration alongside an automated test simulator for verifying `pre_checkout_query` and `successful_payment` without real financial transactions during testing.
- **Zero Client-Side Trust**: PRO tier is never activated via button click handlers, client state modifications, or `localStorage`. Activation occurs solely through server-side verification of `successful_payment` with unique `telegram_payment_charge_id`.

---

## 2. Architecture & Technical Design

### A. End-to-End Telegram Stars (`XTR`) Payment Flow
1. **Frontend Initiation**:
   - User opens `SubscriptionModal` and clicks **"Pay with Telegram Stars"**.
   - Modal enters `Awaiting payment` status and issues `POST /api/payments/stars/create` with verified Telegram `initData` and `planId` (`PRO` / `WHALE`).
2. **Backend Order Creation (`/api/payments/stars/create`)**:
   - Validates Telegram `initData` HMAC signature and extracts `userId`.
   - Generates an immutable internal order:
     - `orderId`: Unique prefixed string (`STARS_ORD_...`)
     - `userId`: Telegram user ID
     - `planId`: `PRO` (250 Stars) or `WHALE` (500 Stars)
     - `amount`: Integer Stars amount
     - `currency`: strictly `'XTR'`
     - `uniquePayload`: cryptographically signed or randomized nonce tied to `orderId` and `userId`
     - `expiry`: ISO timestamp (30 minutes TTL)
     - `status`: `'PENDING'`
   - Generates Telegram invoice link using Telegram Bot API `createInvoiceLink` (or simulated test invoice link when bot token is running in mock/dev mode).
   - Returns `{ success: true, orderId, invoiceLink, amount, currency: 'XTR' }`.
3. **Mini App Invoice Display**:
   - Modal checks WebApp API support (`Telegram.WebApp.openInvoice`).
   - If supported, calls `Telegram.WebApp.openInvoice(invoiceLink, (status) => ...)`.
   - On invoice close/callback, transitions UI state to `Confirming` and polls `GET /api/subscription/status?orderId=...`.
4. **Backend Webhook & Query Validation (`/api/payments/stars/webhook`)**:
   - **`pre_checkout_query`**: Backend validates `orderId`, `payload`, user ID, currency (`XTR`), and amount. Responds with `answerPreCheckoutQuery(ok: true)` within 10 seconds.
   - **`successful_payment`**: Backend verifies matching `payload`, `currency: 'XTR'`, `total_amount`, and stores `telegram_payment_charge_id`.
   - **Idempotency**: Duplicate calls with the same `telegram_payment_charge_id` or `orderId` return HTTP 200 without duplicate credit or double activation.
   - Updates order status to `'PAID'` and activates the subscription record for `userId`.
5. **Subscription Status Endpoint (`/api/subscription/status`)**:
   - `GET /api/subscription/status` accepts `orderId` or Telegram `initData` / bearer header.
   - Returns verified tier (`BASIC` | `PRO` | `WHALE`), `isPro: boolean`, `status` (`pending` | `paid` | `cancelled` | `failed`), and `expiresAt`.

### B. Payment UX Modal (`SubscriptionModal.tsx`)
- Displays exact plain-text descriptors:
  - **Payment method**: Telegram Stars
  - **Currency**: XTR
  - **Status**: `Ready` / `Awaiting payment` / `Confirming` / `Active` / `Failed` / `Cancelled`
- Buttons:
  - `Pay with Telegram Stars`
  - `Cancel`
  - `Retry payment`
  - `View payment status`
- Compact centered modal format (restricted specifically to Pro/Whale subscription modal as allowed in P1-4; other informational windows remain full-screen bottom-sheet / modal overlays).
- No simulated `Stars Purchased`, `demoBalance`, or local increments of Telegram Stars.

### C. TON Wallet & Asset Decoupling (P1-1 & P1-2)
- Explicit prohibition of GRAM as a Telegram currency.
- `Connect TON Wallet` button in `PortfolioScreen` handles discrete connection states:
  - `disconnected`, `opening chooser`, `connecting`, `connected`, `cancelled`, `failed`, `disconnected again`.
- Does not display verified balance until fetch completes. No payment action without connected wallet and server-issued intent.

### D. AI Chat Resilience (P1-3)
- Endpoint `/api/chat` returns:
  - HTTP 200 with non-empty answer when upstream is healthy.
  - HTTP 502/504 with safe message and status `OFFLINE` when upstream is unavailable.
  - Zero fake `LIVE AI` indicators when offline.

### E. Modal Stability & Geometry (P1-4)
- Portals to `#modal-root` with strict viewport geometry (`fixed inset-0`, `w-screen`, `h-[100dvh]`).
- Reference-counted `useScrollLock` to ensure `lockCount` matches visible dialogs.
- `max visible dialogs = 1` (unless deliberate nested flow). `final visible dialogs = 0` on close.
- Support for `X` button, `Escape` key, Telegram `BackButton`, and proper focus return.

---

## 3. Implementation Steps

### Step 1: Backend Telegram Stars Flow (`functions/api/payments/stars/`)
- Create `/functions/api/payments/stars/create.ts`:
  - Validates input and Telegram `initData`.
  - Creates order in memory / KV / server store with status `PENDING`, currency `XTR`.
  - Calls Telegram Bot `createInvoiceLink` (or simulator if `TELEGRAM_BOT_TOKEN` is unset).
- Create `/functions/api/payments/stars/webhook.ts`:
  - Handles `pre_checkout_query` and answers within 10s.
  - Handles `successful_payment`, verifies charge ID, enforces idempotency, updates order to `PAID`.
- Create/Update `/functions/api/subscription/status.ts`:
  - Returns server-authoritative subscription status and order state.
- Update `vite.config.ts` dev middleware to support `/api/payments/stars/create`, `/api/payments/stars/webhook`, and `/api/subscription/status` locally.

### Step 2: Payment Modal UX (`SubscriptionModal.tsx`)
- Implement required status machine (`Ready`, `Awaiting payment`, `Confirming`, `Active`, `Failed`, `Cancelled`).
- Display clear Telegram Stars (`XTR`) information.
- Implement buttons: `Pay with Telegram Stars`, `Cancel`, `Retry payment`, `View payment status`.
- Eliminate any client-side PRO activation from click handlers.
- Query backend `/api/subscription/status` after invoice closes.

### Step 3: TON Wallet Decoupling & UI Guardrails
- Verify no references to GRAM as a Telegram currency.
- Ensure `Connect TON Wallet` button in `PortfolioScreen` implements all required connection states without unverified balance displays.

### Step 4: AI Chat Resilience & Upstream Offline Handling
- Audit `/functions/api/chat.ts` and dev proxy in `vite.config.ts` to ensure HTTP 502/504 responses are returned gracefully when upstream models fail, with honest `OFFLINE` indicators.

### Step 5: Modal Stability Verification (30-Cycle Test)
- Test open/close cycles across `Subscription`, `AI Insight`, `Quests`, `Mining`, `Sentinel`, `Terminal details`, `News details`, `Academy video`, and `Wallet chooser`.
- Verify scroll lock cleanup, Telegram `BackButton` binding, and focus restoration.

### Step 6: Full Regression & Automated Validation
- Run `npm run test:security` and `npm run test:academy`.
- Verify loading screen (6.5s immutable), Day/Night persistence, Terminal 35 assets, CSP/HSTS/CORS headers, and mobile viewport adaptability (360x800, 390x844, 412x915).
- Run `compile_applet` and `lint_applet`.

---

## 4. Verification & Final Deliverables
- Detailed report with all 14 required sections:
  1. Changed files
  2. Stars invoice evidence
  3. `pre_checkout_query` evidence
  4. `successful_payment` evidence without revealing secrets
  5. Duplicate payment test
  6. Cancelled payment test
  7. No-PRO-before-receipt evidence
  8. TON/jetton contract and network evidence
  9. `/api/chat` status
  10. Modal geometry and 30-cycle result
  11. Mobile results (360x800, 390x844, 412x915)
  12. Security headers (CSP, HSTS, CORS)
  13. Residual risks
  14. Final release verdict
