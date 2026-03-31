import { HERMES_URL, PYTH_PRO_URL, PYTH_PRO_KEY, ASSETS, MACRO_FEEDS } from '@/lib/constants'
import type { PriceFeed } from '@/types/index'

// ─── Fetch all asset prices from Hermes ───────────────────────────────────────
// Using Hermes REST API v2: /v2/updates/price/latest?ids[]=0x...&parsed=true

export async function fetchAllPrices(): Promise<Map<string, PriceFeed>> {
  try {
    if (!HERMES_URL) {
      throw new Error('NEXT_PUBLIC_PYTH_HERMES environment variable not set')
    }

    // Build query: convert hermesIds to uppercase for Hermes (some APIs are case-sensitive)
    const idParams = ASSETS.map(a => {
      const id = a.hermesId.startsWith('0x') ? a.hermesId : `0x${a.hermesId}`
      return `ids[]=${id}`
    }).join('&')

    const url = `${HERMES_URL}/v2/updates/price/latest?${idParams}&parsed=true`
    console.log('[fetchAllPrices] Fetching from:', HERMES_URL)
    console.log('[fetchAllPrices] URL params:', idParams.substring(0, 80) + '...')

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    })

    if (!res.ok) {
      console.error(`[fetchAllPrices] HTTP ${res.status} ${res.statusText}`)
      // Try fallback: single request without parsed flag
      console.log('[fetchAllPrices] Trying fallback without parsed flag...')
      return await fetchAllPricesFallback()
    }

    const data = await res.json()
    console.log('[fetchAllPrices] Response received, entries:', data.parsed?.length || 0)

    const map = new Map<string, PriceFeed>()

    if (!data.parsed || !Array.isArray(data.parsed)) {
      console.warn('[fetchAllPrices] No parsed array in response')
      return map
    }

    for (const feed of data.parsed) {
      try {
        // Normalize feed ID: remove 0x and lowercase
        const feedId = String(feed.id || '').toLowerCase().replace(/^0x/, '')
        if (!feedId) {
          console.warn('[fetchAllPrices] Empty feed ID in entry')
          continue
        }

        // Find matching asset
        const asset = ASSETS.find(a => a.hermesId.toLowerCase().replace(/^0x/, '') === feedId)
        if (!asset) {
          console.warn(`[fetchAllPrices] Unknown asset for feed ID: ${feedId.substring(0, 16)}...`)
          continue
        }

        // Extract price data
        const price = Number(feed.price?.price)
        const expo = Number(feed.price?.expo)
        const conf = Number(feed.price?.conf)
        const publishTime = Number(feed.price?.publish_time)

        if (!isFinite(price) || !isFinite(expo)) {
          console.warn(`[fetchAllPrices] Invalid data for ${asset.id}:`, { price, expo })
          continue
        }

        // Apply exponent
        const scaledPrice = price * Math.pow(10, expo)
        const scaledConf = conf * Math.pow(10, expo)

        if (!isFinite(scaledPrice) || scaledPrice <= 0) {
          console.warn(`[fetchAllPrices] Invalid scaled price for ${asset.id}: ${scaledPrice}`)
          continue
        }

        map.set(asset.id, {
          assetId: asset.id,
          price: scaledPrice,
          conf: scaledConf,
          publishTime,
          expo,
        })

        console.log(`[fetchAllPrices] ✓ ${asset.id}: $${scaledPrice.toFixed(asset.decimals)}`)
      } catch (err) {
        console.error(`[fetchAllPrices] Parse error:`, err)
      }
    }

    if (map.size === 0) {
      console.warn('[fetchAllPrices] No valid prices extracted')
    }

    return map
  } catch (err) {
    console.error('[fetchAllPrices] Fetch error:', err)
    throw err
  }
}

// ─── Fallback: Try fetching without parsed flag ─────────────────────────────

async function fetchAllPricesFallback(): Promise<Map<string, PriceFeed>> {
  const idParams = ASSETS.map(a => {
    const id = a.hermesId.startsWith('0x') ? a.hermesId : `0x${a.hermesId}`
    return `ids[]=${id}`
  }).join('&')

  const url = `${HERMES_URL}/v2/updates/price/latest?${idParams}`
  console.log('[fetchAllPricesFallback] Trying:', url.substring(0, 100) + '...')

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Hermes HTTP ${res.status}`)

  const data = await res.json()
  const map = new Map<string, PriceFeed>()

  if (!data.data) return map

  for (const item of data.data) {
    try {
      const feedId = String(item.id || '').toLowerCase().replace(/^0x/, '')
      const asset = ASSETS.find(a => a.hermesId.toLowerCase().replace(/^0x/, '') === feedId)
      if (!asset) continue

      const price = Number(item.price)
      const expo = Number(item.expo)

      if (!isFinite(price) || !isFinite(expo)) continue

      const scaledPrice = price * Math.pow(10, expo)
      if (!isFinite(scaledPrice) || scaledPrice <= 0) continue

      map.set(asset.id, {
        assetId: asset.id,
        price: scaledPrice,
        conf: 0,
        publishTime: Date.now(),
        expo,
      })

      console.log(`[fetchAllPricesFallback] ✓ ${asset.id}: $${scaledPrice.toFixed(asset.decimals)}`)
    } catch (err) {
      console.error('[fetchAllPricesFallback] Parse error:', err)
    }
  }

  return map
}

// ─── Fetch macro feeds via Pyth Pro, fallback to Hermes ──────────────────────

export async function fetchMacroFeeds(): Promise<Map<string, number>> {
  // Try Pyth Pro REST first
  try {
    const feedsWithIds = MACRO_FEEDS.filter(f => f.lazerFeedId != null)
    if (feedsWithIds.length > 0) {
      const body = {
        feeds: feedsWithIds.map(f => ({ feedId: f.lazerFeedId })),
        properties: ['price'],
      }

      console.log('[fetchMacroFeeds] Trying Pyth Pro...')

      const res = await fetch(`${PYTH_PRO_URL}/v1/latest_price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PYTH_PRO_KEY}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        console.log('[fetchMacroFeeds] Pyth Pro response OK')

        const map = new Map<string, number>()

        if (Array.isArray(data.feeds)) {
          for (const feed of data.feeds) {
            const macro = MACRO_FEEDS.find(f => f.lazerFeedId === feed.feedId)
            if (!macro || !feed.price) continue

            const expo = Number(feed.price.exponent ?? macro.expo)
            const price = Number(feed.price.price) * Math.pow(10, expo)

            if (isFinite(price) && price > 0) {
              map.set(macro.id, price)
              console.log(`[fetchMacroFeeds] ✓ ${macro.id} (Pro): $${price.toFixed(4)}`)
            }
          }
        }

        if (map.size > 0) {
          console.log('[fetchMacroFeeds] Pyth Pro success')
          return map
        }
      } else {
        console.warn(`[fetchMacroFeeds] Pyth Pro HTTP ${res.status}, trying Hermes`)
      }
    }
  } catch (err) {
    console.warn('[fetchMacroFeeds] Pyth Pro error:', err)
  }

  // ── Hermes fallback ────────────────────────────────────────────
  console.log('[fetchMacroFeeds] Using Hermes fallback')

  const idParams = MACRO_FEEDS.map(f => {
    const id = f.hermesId.startsWith('0x') ? f.hermesId : `0x${f.hermesId}`
    return `ids[]=${id}`
  }).join('&')

  const url = `${HERMES_URL}/v2/updates/price/latest?${idParams}&parsed=true`

  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
    })

    if (!res.ok) throw new Error(`Hermes macro HTTP ${res.status}`)

    const data = await res.json()
    const map = new Map<string, number>()

    if (!Array.isArray(data.parsed)) return map

    for (const feed of data.parsed) {
      try {
        const feedId = String(feed.id || '').toLowerCase().replace(/^0x/, '')
        const macro = MACRO_FEEDS.find(f => f.hermesId.toLowerCase().replace(/^0x/, '') === feedId)
        if (!macro) continue

        const price = Number(feed.price?.price) * Math.pow(10, Number(feed.price?.expo))
        if (isFinite(price) && price > 0) {
          map.set(macro.id, price)
          console.log(`[fetchMacroFeeds] ✓ ${macro.id} (Hermes): $${price.toFixed(4)}`)
        }
      } catch (err) {
        console.error('[fetchMacroFeeds] Hermes parse error:', err)
      }
    }

    return map
  } catch (err) {
    console.error('[fetchMacroFeeds] Hermes fallback error:', err)
    throw err
  }
}

// ─── Entropy receipt ──────────────────────────────────────────────────────────

export interface EntropyReceipt {
  sequence: number
  hash: string
  timestamp: string
}

export async function registerEntropyAlert(): Promise<EntropyReceipt> {
  // Full on-chain: POST https://fortuna.dourolabs.app/v1/chains/<chain>/revelations
  // Demo implementation: generates a verifiable-style receipt showing the pattern
  const sequence = Math.floor(Math.random() * 900000 + 100000)
  const hashBytes = Array.from(
    { length: 64 },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join('')
  return {
    sequence,
    hash: '0x' + hashBytes,
    timestamp: new Date().toISOString(),
  }
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function fmtPrice(price: number, decimals: number): string {
  if (!isFinite(price) || price <= 0) return '—'
  if (price >= 1000) return '$' + price.toLocaleString(undefined, { maximumFractionDigits: decimals })
  if (price >= 1) return '$' + price.toFixed(decimals)
  return '$' + price.toFixed(Math.max(decimals, 5))
}

export function fmtPct(pct: number): string {
  return (pct >= 0 ? '+' : '') + pct.toFixed(3) + '%'
}