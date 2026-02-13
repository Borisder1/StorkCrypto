
# 🦅 STORKCRYPTO: SYSTEM KERNEL & VISUAL BLUEPRINT (v10.0)

> **CRITICAL INSTRUCTION FOR AI AGENTS:**
> This document is the **GENETIC CODE** of StorkCrypto.
> If you are recreating this project, you MUST use the technical specifications defined below (Tailwind config, CSS, State Logic) exactly as written.
> **DO NOT IMPROVISE ON VISUALS.**

---

## 1. 🎨 VISUAL DNA (TAILWIND CONFIGURATION)

To replicate the "StorkCrypto Look", you must inject this configuration into `tailwind.config`.

### A. Colors & Fonts
```js
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'], // Headers, Data
        'space-mono': ['"Space Mono"', 'monospace'], // Numbers, Terminal text
        sans: ['Inter', 'sans-serif'], // Body
      },
      colors: {
        'brand-bg': '#020617', // The Void (Main Background)
        'brand-card': 'rgba(15, 23, 42, 0.9)', // Glass Panels
        'brand-cyan': '#00d9ff', // Primary Action / Scanner
        'brand-green': '#10b981', // Success / Profit
        'brand-purple': '#8b5cf6', // AI / Premium / Whales
        'brand-danger': '#ef4444', // Error / Loss / Sniper Mode
      }
    }
  }
}
```

### B. Mandatory Animations (CSS Keyframes)
You must define these in `tailwind.config` `theme.extend.keyframes`:

1.  **`scanline`** (Used for tactical overlays):
    ```css
    '0%': { top: '-10%' }, '100%': { top: '110%' }
    ```
2.  **`marquee`** (Used for the top price ticker):
    ```css
    '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-50%)' }
    ```
3.  **`gridFly`** (Used for the 3D floor effect):
    ```css
    '0%': { transform: 'translateY(0) rotateX(60deg)' }, 
    '100%': { transform: 'translateY(40px) rotateX(60deg)' }
    ```

---

## 2. 🧠 THE LOGIC KERNEL (FUNCTIONAL DNA)

### A. The Quantitative Engine (`quantService.ts`)
Logic must run in a Web Worker or async function to prevent freezing.

1.  **Monte Carlo Simulation:**
    -   **Inputs:** `Current Price`, `Volatility` (0.05 default), `Steps` (24h), `Simulations` (50).
    -   **Visualization:** SVG Polyline paths. Green lines if `> TakeProfit`, Red if `< StopLoss`.

2.  **Institutional Conviction:**
    -   **Logic:** Detects divergence between Price and CVD (Cumulative Volume Delta).
    -   **Rule:** Price Down + CVD Up = **ACCUMULATION** (Bullish). Price Up + CVD Down = **DISTRIBUTION** (Bearish).

3.  **Kelly Criterion (Risk Management):**
    -   **Formula:** `f* = (bp - q) / b` where `b` = odds received, `p` = probability of winning, `q` = probability of losing.
    -   **Safety:** Always output "Half-Kelly" to protect users.

### B. The AI Persona (`geminiService.ts`)
-   **Model:** `gemini-3-flash-preview`.
-   **Tone:** Cyberpunk, Military-Grade, Concise.
-   **System Prompt:** "You are StorkCrypto AI. Analyze strictly. Output JSON signals. Do not use filler words. Status: OPERATIONAL."

---

## 3. 🧩 COMPONENT ARCHITECTURE (UX BLUEPRINTS)

### 🧭 Navigation (`BottomNav`)
-   **Design:** Floating Glass Capsule (`rounded-full`).
-   **Active State:** "Light Pillar" effect (vertical gradient fading up from the icon).
-   **Feedback:** Haptic `selection` on every click.

### 🏠 Dashboard (`HomeScreen`)
-   **Top Layer:** `MarketTicker` (Infinite scrolling marquee).
-   **Hero:** Net Liquidity Card with `NumberTicker` animation.
-   **Widgets:** 
    -   `AIInsightWidget`: Typewriter text effect.
    -   `WhaleTrackerWidget`: Shows transactions > $100k.

### 📈 Signals Terminal (`SignalsScreen`)
-   **Modes:** Standard vs. **Sniper Mode** (Red theme, strictly high-confidence signals).
-   **Visuals:** 3D Rotating Radar HUD (CSS animation).
-   **Cards:** Hybrid Card design with "Tech Corners" (SVG borders).

### 📡 Market Scanner (`ScannerScreen`)
-   **Views:** List vs. Globe.
-   **Holographic Globe:** HTML Canvas, 300 particles on a sphere, rotating.
-   **Data:** RSI Heatmap (Green < 30, Red > 70).

---

## 4. 💾 DATA ARCHITECTURE (STATE)

### `store.tsx` (Zustand)
-   **Persistence:** `localStorage` (key: 'stork-storage-v6').
-   **Slices:**
    -   `authSlice`: User ID, Role, XP.
    -   `tradeSlice`: Portfolio, Positions, Wallet.
    -   `appSlice`: Settings, Alerts, Chat History.

### External Services
1.  **Price Feeds:** Binance WebSocket (`wss://stream.binance.com:443/ws`). Fallback to CoinCap REST API.
2.  **Supabase:** Used for user profiles and admin configuration.
3.  **Web3:** Simulated integration for demo, ready for `wagmi`/`tonconnect`.

---

## 5. ⚠️ CRITICAL RULES (ZERO TOLERANCE)

1.  **NO LOADING SCREEN:** The app must boot instantly.
2.  **NO WHITE FLASHES:** `html` background must be `#020617`.
3.  **ERROR HANDLING:** `ErrorBoundary` must show a "SYSTEM FAILURE" terminal screen.
4.  **HAPTICS:** Every interactive element must trigger `navigator.vibrate`.

---

## 6. FILE STRUCTURE MAP

```text
/
├── index.html              # Tailwind Config embedded here
├── index.tsx               # Root
├── App.tsx                 # Main Layout
├── store.tsx               # Global State
├── types.ts                # TypeScript Interfaces
├── PROJECT_CONTEXT.md      # THIS FILE
│
├── components/
│   ├── icons.tsx           # SVG Library
│   ├── BottomNav.tsx       # Navigation
│   ├── ...Screens          # Main Views
│   └── ...Widgets          # UI Blocks
│
└── services/
    ├── geminiService.ts    # AI Brain
    ├── quantService.ts     # Math Kernel
    ├── priceService.ts     # Data Fetching
    └── websocketService.ts # Real-time Stream
```

**END OF SYSTEM BLUEPRINT**