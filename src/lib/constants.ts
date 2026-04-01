import type { Asset, MacroFeed } from '@/types/index'

export const HERMES_URL   = process.env.NEXT_PUBLIC_PYTH_HERMES  || 'https://hermes.pyth.network'
export const PYTH_PRO_URL = process.env.NEXT_PUBLIC_PYTH_PRO_URL || 'https://pyth-lazer.dourolabs.app'

// All hermesIds verified directly from Hermes /v2/price_feeds search
export const ASSETS: Asset[] = [
  // ── Crypto ────────────────────────────────────────────────────
  {
    id: 'BTC', label: 'BTC/USD', type: 'crypto',
    hermesId: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    expo: -8, defaultEntry: 85000, defaultLiq: 72000, decimals: 0,
  },
  {
    id: 'ETH', label: 'ETH/USD', type: 'crypto',
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
  // ── Commodities ───────────────────────────────────────────────
  {
    id: 'XAU', label: 'XAU/USD', type: 'pro-commodity',
    hermesId: '765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2',
    expo: -5, defaultEntry: 3100, defaultLiq: 2900, decimals: 2,
  },
  {
    // WTI continuous spot — verified: Commodities.USOILSPOT/USD
    id: 'WTI', label: 'WTI/USD', type: 'pro-commodity',
    hermesId: '925ca92ff005ae943c158e3563f59698ce7e75c5a8c8dd43303a0a154887b3e6',
    expo: -5, defaultEntry: 72, defaultLiq: 60, decimals: 2,
  },
  // ── FX ────────────────────────────────────────────────────────
  {
    id: 'EURUSD', label: 'EUR/USD', type: 'pro-fx',
    hermesId: 'a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
    expo: -9, defaultEntry: 1.08, defaultLiq: 1.02, decimals: 5,
  },
  {
    // GBP/USD spot — verified: FX.GBP/USD
    id: 'GBPUSD', label: 'GBP/USD', type: 'pro-fx',
    hermesId: '84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1',
    expo: -9, defaultEntry: 1.29, defaultLiq: 1.22, decimals: 5,
  },
]

export const MACRO_FEEDS: MacroFeed[] = [
  {
    id: 'XAU', label: 'XAU/USD', type: 'commodity', desc: 'Gold',
    hermesId: '765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2',
    lazerFeedId: 344,
    bearish: true, expo: -5,
  },
  {
    // WTI continuous spot — verified: Commodities.USOILSPOT/USD
    id: 'WTI', label: 'WTI/USD', type: 'commodity', desc: 'WTI Crude',
    hermesId: '925ca92ff005ae943c158e3563f59698ce7e75c5a8c8dd43303a0a154887b3e6',
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
    // GBP/USD spot — verified: FX.GBP/USD
    id: 'GBPUSD', label: 'GBP/USD', type: 'fx', desc: 'Pound',
    hermesId: '84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1',
    lazerFeedId: 333,
    bearish: false, expo: -9,
  },
]

export const STORAGE_KEYS = {
  POSITIONS:  'pythguard_positions',
  ALERTS:     'pythguard_alerts',
  ACTIVE_TAB: 'pythguard_tab',
} as const