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

## 3. Architecture Constraints
- z-index hierarchy: base:0, elevated:10, dropdown:20, sticky:30, modal:40, toast:50.
- All text strings localized via `t('key')` in `translations.ts`.
- Pure Tailwind tokens and responsive 100dvh layout for Telegram Mini App environment.
