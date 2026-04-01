import { ASSETS, MACRO_FEEDS } from '@/lib/constants'
import type { PriceFeed } from '@/types/index'

// Calls our Next.js API proxy (/api/prices) which fetches from Hermes server-side.
// Direct browser → Hermes fetches 404 in Next.js 14 due to internal route interception.
async function hermesRequest(hermesIds: string[]): Promise<{ parsed: any[] }> {
  const params = new URLSearchParams()
  hermesIds.forEach(id => {
    const clean = id.replace(/^0x/i, '').toLowerCase()
    params.append('ids[]', `0x${clean}`)
  })
  params.set('parsed', 'true')

  const res = await fetch(`/api/prices?${params.toString()}`, {
    headers: { accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Prices API ${res.status} ${res.statusText}`)
  return res.json()
}

// ─── Fetch all asset prices ───────────────────────────────────────────────────
export async function fetchAllPrices(): Promise<Map<string, PriceFeed>> {
  console.log('[fetchAllPrices] Requesting via proxy...')
  const data = await hermesRequest(ASSETS.map(a => a.hermesId))
  const map  = new Map<string, PriceFeed>()

  if (!data.parsed || !Array.isArray(data.parsed)) {
    console.warn('[fetchAllPrices] No parsed array in response')
    return map
  }

  for (const feed of data.parsed) {
    try {
      const feedId = String(feed.id ?? '').toLowerCase().replace(/^0x/, '')
      const asset  = ASSETS.find(
        a => a.hermesId.toLowerCase().replace(/^0x/, '') === feedId
      )
      if (!asset) continue

      const priceRaw    = Number(feed.price?.price)
      const expo        = Number(feed.price?.expo)
      const conf        = Number(feed.price?.conf ?? 0)
      const publishTime = Number(feed.price?.publish_time ?? Date.now())

      if (!isFinite(priceRaw) || !isFinite(expo)) continue

      const price      = priceRaw * Math.pow(10, expo)
      const scaledConf = conf     * Math.pow(10, expo)

      if (!isFinite(price) || price <= 0) continue

      map.set(asset.id, { assetId: asset.id, price, conf: scaledConf, publishTime, expo })
      console.log(`[fetchAllPrices] ✓ ${asset.id}: $${price.toFixed(asset.decimals ?? 2)}`)
    } catch (err) {
      console.error('[fetchAllPrices] Parse error:', err)
    }
  }

  console.log(`[fetchAllPrices] Loaded ${map.size}/${ASSETS.length} prices`)
  return map
}

// ─── Fetch macro feeds ────────────────────────────────────────────────────────
export async function fetchMacroFeeds(): Promise<Map<string, number>> {
  console.log('[fetchMacroFeeds] Requesting via proxy...')
  const data = await hermesRequest(MACRO_FEEDS.map(f => f.hermesId))
  const map  = new Map<string, number>()

  if (!Array.isArray(data.parsed)) return map

  for (const feed of data.parsed) {
    try {
      const feedId = String(feed.id ?? '').toLowerCase().replace(/^0x/, '')
      const macro  = MACRO_FEEDS.find(
        f => f.hermesId.toLowerCase().replace(/^0x/, '') === feedId
      )
      if (!macro) continue

      const price = Number(feed.price?.price) * Math.pow(10, Number(feed.price?.expo))
      if (isFinite(price) && price > 0) {
        map.set(macro.id, price)
        console.log(`[fetchMacroFeeds] ✓ ${macro.id}: $${price.toFixed(4)}`)
      }
    } catch (err) {
      console.error('[fetchMacroFeeds] Parse error:', err)
    }
  }

  console.log(`[fetchMacroFeeds] Loaded ${map.size}/${MACRO_FEEDS.length} macro feeds`)
  return map
}

// ─── Entropy receipt (demo) ───────────────────────────────────────────────────
export interface EntropyReceipt {
  sequence:  number
  hash:      string
  timestamp: string
}

export async function registerEntropyAlert(): Promise<EntropyReceipt> {
  const sequence  = Math.floor(Math.random() * 900_000 + 100_000)
  const hashBytes = Array.from(
    { length: 64 },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join('')
  return { sequence, hash: '0x' + hashBytes, timestamp: new Date().toISOString() }
}

// ─── Display helpers ──────────────────────────────────────────────────────────
export function fmtPrice(price: number, decimals: number): string {
  if (!isFinite(price) || price <= 0) return '—'
  if (price >= 1000) return '$' + price.toLocaleString(undefined, { maximumFractionDigits: decimals })
  if (price >= 1)    return '$' + price.toFixed(decimals)
  return '$' + price.toFixed(Math.max(decimals, 5))
}

export function fmtPct(pct: number): string {
  return (pct >= 0 ? '+' : '') + pct.toFixed(3) + '%'
}