# PythGuard — Liquidation Shield

> Real-time DeFi liquidation monitoring across crypto, commodities & FX — built on Pyth Network for the Pyth Community Hackathon 2026.

## What it does

PythGuard monitors your leveraged positions in real-time and alerts you before you get liquidated. Unlike other liquidation tools, it uses **all three Pyth features**:

| Feature | How it's used |
|---|---|
| **Pyth Price Feeds** | Live prices for 8 crypto assets (BTC, ETH, SOL, PYTH, BNB, XRP, DOGE, AVAX) |
| **Pyth Pro** | Commodity + FX feeds (Gold, WTI Crude, EUR/USD, GBP/USD) for the macro danger score — and as selectable collateral assets |
| **Pyth Entropy** | Generates a tamper-proof, verifiable receipt when you register a price alert |

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript** — fully typed throughout
- **Tailwind CSS** — custom dark theme
- **localStorage** — positions and alerts persist for the browser session, no backend needed

## Features

### Positions tab
- Add any of 12 assets as collateral (8 crypto + 4 Pyth Pro)
- Live health score, distance to liquidation in $ and %
- Visual price bar showing where you are relative to liquidation
- Confidence interval from Pyth feeds
- Persists in localStorage — survives page refresh

### Alerts tab
- Set price alerts with above/below conditions on any asset
- Live distance-to-trigger meter updates every 3 seconds
- Auto-fires when price crosses threshold — banner notification
- Each alert gets a **Pyth Entropy receipt** (sequence number + hash) proving it was registered before the price moved
- Alert history persists in localStorage

### Macro danger score (right panel)
- Watches Gold, WTI Crude, EUR/USD, GBP/USD via Pyth Pro
- Calculates a composite danger score based on cross-asset risk signals
- Gold surging + DXY rising = historical precursor to crypto selloff
- Falls back to Hermes if Pyth Pro endpoint is unavailable

## Deploy

### Option A — Vercel (recommended, 2 minutes)

```bash
npm install
npm run build       # verify it builds locally first
npx vercel --prod
```

### Option B — Any Node host

```bash
npm install
npm run build
npm start           # runs on port 3000
```

### Environment variables

The API key is baked in for the hackathon demo. To use env vars instead:

1. Create `.env.local`:
   ```
   NEXT_PUBLIC_PYTH_PRO_KEY=your_key_here
   ```

2. In `lib/constants.ts`, change:
   ```ts
   export const PYTH_PRO_KEY = 'your_key_here'
   ```
   to:
   ```ts
   export const PYTH_PRO_KEY = process.env.NEXT_PUBLIC_PYTH_PRO_KEY ?? ''
   ```

3. Add the env var in Vercel dashboard → Project Settings → Environment Variables

## Project structure

```
pythguard/
├── app/
│   ├── layout.tsx       # Root layout, Google Fonts
│   ├── page.tsx         # Main page — nav, hero, tab layout
│   └── globals.css      # Base styles, animations
├── components/
│   ├── MacroPanel.tsx   # Pyth Pro danger score panel
│   ├── PositionsTab.tsx # Position CRUD + live health cards
│   └── AlertsTab.tsx    # Alert CRUD + Entropy receipts
├── hooks/
│   ├── usePythPrices.ts # Polls Hermes + Pyth Pro, computes macro
│   ├── usePositions.ts  # Position state + health calculation
│   └── useAlerts.ts     # Alert state + auto-trigger detection
├── lib/
│   ├── constants.ts     # All asset definitions + feed IDs
│   ├── pyth.ts          # API calls (Hermes, Pyth Pro, Entropy)
│   └── storage.ts       # localStorage CRUD helpers
├── types/
│   └── index.ts         # All TypeScript types
├── tailwind.config.ts
├── next.config.js
└── vercel.json
```

## Pyth feed IDs used

All IDs sourced from https://pyth.dourolabs.app/v1/symbols

### Crypto (Pyth Price Feeds via Hermes)
| Asset | Hermes ID |
|---|---|
| BTC/USD | `e62df6c8...` |
| ETH/USD | `ff61491a...` |
| SOL/USD | `ef0d8b6f...` |
| PYTH/USD | `0bbf28e9...` |
| BNB/USD | `2f95862b...` |
| XRP/USD | `ec5d3998...` |
| DOGE/USD | `dcef50dd...` |
| AVAX/USD | `93da3352...` |

### Pyth Pro (commodity + FX)
| Asset | Hermes ID |
|---|---|
| XAU/USD | `765d2ba9...` |
| WTI/USD | `8392b84b...` |
| EUR/USD | `a995d00b...` |
| GBP/USD | `84c2dde9...` |

## License

Apache 2.0 — as required by the Pyth Community Hackathon rules.
