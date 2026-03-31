import type { Asset, MacroFeed } from '@/types/index'

// Replace with env var: process.env.NEXT_PUBLIC_PYTH_PRO_KEY
export const PYTH_PRO_KEY = 'lOgUpYBgJ6Zo5b8hEFECjiP0zsnE4HoS1CC-hackathon'

export const HERMES_URL   = 'https://hermes.pyth.network'
export const PYTH_PRO_URL = 'https://pyth-lazer.dourolabs.app'

// All hermesIds verified from https://pyth.dourolabs.app/v1/symbols
export const ASSETS: Asset[] = [
  // ── Crypto — Pyth Price Feeds ──────────────────────────────────
  {
    id: 'BTC', label: 'BTC/USD', type: 'crypto',
    hermesId: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    expo: -8, defaultEntry: 85000, defaultLiq: 72000, decimals: 0,
  },
  {
    id: 'ETH', label: 'ETH/USD', type: 'crypto',
    // FIX: was c96458d3... (wrong) — correct ID below
    hermesId: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    expo: -8, defaultEntry: 1820, defaultLiq: 1400, decimals: 2,
  },
  {
    id: 'SOL', label: 'SOL/USD', type: 'crypto',
    hermesId: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    expo: -8, defaultEntry: 130, defaultLiq: 90, decimals: 3,
  },
  {
    id: 'PYTH', label: 'PYTH/USD', type: 'crypto',
    hermesId: '0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff',
    expo: -8, defaultEntry: 0.35, defaultLiq: 0.20, decimals: 5,
  },
  {
    id: 'BNB', label: 'BNB/USD', type: 'crypto',
    hermesId: '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
    expo: -8, defaultEntry: 580, defaultLiq: 440, decimals: 2,
  },
  {
    id: 'XRP', label: 'XRP/USD', type: 'crypto',
    hermesId: 'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
    expo: -8, defaultEntry: 2.2, defaultLiq: 1.5, decimals: 4,
  },
  {
    id: 'DOGE', label: 'DOGE/USD', type: 'crypto',
    hermesId: 'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
    expo: -8, defaultEntry: 0.18, defaultLiq: 0.12, decimals: 5,
  },
  {
    id: 'AVAX', label: 'AVAX/USD', type: 'crypto',
    hermesId: '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
    expo: -8, defaultEntry: 28, defaultLiq: 18, decimals: 3,
  },
  // ── Pyth Pro — Commodity ───────────────────────────────────────
  {
    id: 'XAU', label: 'XAU/USD', type: 'pro-commodity',
    hermesId: '765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2',
    expo: -5, defaultEntry: 3100, defaultLiq: 2900, decimals: 2,
  },
  {
    id: 'WTI', label: 'WTI/USD', type: 'pro-commodity',
    hermesId: '8392b84b64e2d3b26d4ad88f94c6d38c8e536476827af4f47b96f1ebf7ddce80',
    expo: -5, defaultEntry: 72, defaultLiq: 60, decimals: 2,
  },
  // ── Pyth Pro — FX ─────────────────────────────────────────────
  {
    id: 'EURUSD', label: 'EUR/USD', type: 'pro-fx',
    hermesId: 'a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
    expo: -9, defaultEntry: 1.08, defaultLiq: 1.02, decimals: 5,
  },
  {
    id: 'GBPUSD', label: 'GBP/USD', type: 'pro-fx',
    hermesId: '84c2dde9633d93d1619d6776b19a9bc0364068da431f2308debef7d7fe6a6a26',
    expo: -9, defaultEntry: 1.29, defaultLiq: 1.22, decimals: 5,
  },
]

// Macro feeds for the danger score panel — right sidebar
// lazerFeedIds from https://pyth.dourolabs.app/v1/symbols (real IDs)
export const MACRO_FEEDS: MacroFeed[] = [
  {
    id: 'XAU', label: 'XAU/USD', type: 'commodity', desc: 'Gold',
    hermesId: '765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2',
    lazerFeedId: 344,
    bearish: true, expo: -5,
  },
  {
    id: 'WTI', label: 'WTI/USD', type: 'commodity', desc: 'WTI Crude',
    hermesId: '8392b84b64e2d3b26d4ad88f94c6d38c8e536476827af4f47b96f1ebf7ddce80',
    lazerFeedId: 2314,
    bearish: false, expo: -5,
  },
  {
    id: 'EURUSD', label: 'EUR/USD', type: 'fx', desc: 'Euro',
    hermesId: 'a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
    lazerFeedId: 327,
    bearish: false, expo: -9,
  },
  {
    id: 'GBPUSD', label: 'GBP/USD', type: 'fx', desc: 'Pound',
    hermesId: '84c2dde9633d93d1619d6776b19a9bc0364068da431f2308debef7d7fe6a6a26',
    lazerFeedId: 333,
    bearish: false, expo: -9,
  },
]

export const STORAGE_KEYS = {
  POSITIONS:  'pythguard_positions',
  ALERTS:     'pythguard_alerts',
  ACTIVE_TAB: 'pythguard_tab',
} as const