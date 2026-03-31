// ─── Asset definitions ───────────────────────────────────────────────────────

export type AssetType = 'crypto' | 'pro-commodity' | 'pro-fx'

export interface Asset {
  id: string
  label: string
  type: AssetType
  hermesId: string   // Pyth Hermes price feed ID (no 0x prefix)
  expo: number       // price exponent e.g. -8
  lazerIds?: number[] // Pyth Pro lazer IDs (for macro panel)
  defaultEntry: number
  defaultLiq: number
  decimals: number   // display decimal places
}

// ─── Live price data ──────────────────────────────────────────────────────────

export interface PriceFeed {
  assetId: string
  price: number
  conf: number
  publishTime: number
  expo: number
}

// ─── Position ────────────────────────────────────────────────────────────────

export interface Position {
  id: string
  assetId: string
  entryPrice: number
  liqPrice: number
  createdAt: number  // unix ms
  label?: string
}

export interface PositionHealth {
  currentPrice: number
  distanceDollars: number
  distancePct: number
  healthScore: number        // 0-100
  status: 'safe' | 'warn' | 'danger' | 'liquidated'
  changePct: number
  conf: number
}

// ─── Alert ───────────────────────────────────────────────────────────────────

export type AlertCondition = 'below' | 'above'

export interface PriceAlert {
  id: string
  assetId: string
  condition: AlertCondition
  thresholdPrice: number
  createdAt: number
  triggeredAt?: number
  entropySequence?: number
  entropyHash?: string
  active: boolean
}

// ─── Macro feed ───────────────────────────────────────────────────────────────

export interface MacroFeed {
  id: string
  label: string
  type: 'commodity' | 'fx'
  hermesId: string
  lazerFeedId?: number
  bearish: boolean    // true = rising price = risk for crypto
  desc: string
  expo: number
}

export interface MacroDataPoint {
  feedId: string
  price: number
  startPrice: number
  isRisk: boolean
  changePct: number
}

export interface DangerScore {
  score: number                     // 0-100
  level: 'low' | 'mid' | 'high'
  description: string
  feeds: MacroDataPoint[]
}
