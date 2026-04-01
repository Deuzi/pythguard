'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchAllPrices, fetchMacroFeeds } from '@/lib/pyth'
import { MACRO_FEEDS } from '@/lib/constants'
import type { PriceFeed, MacroDataPoint, DangerScore } from '@/types/index'

const CRYPTO_INTERVAL = 3_000   // 3 s
const MACRO_INTERVAL  = 8_000   // 8 s
const RETRY_DELAY     = 3_000   // 3 s on error

export interface PythPricesState {
  prices:       Map<string, PriceFeed>
  macroData:    MacroDataPoint[]
  dangerScore:  DangerScore
  sessionStart: Map<string, number>
  lastUpdated:  Date | null
  connected:    boolean
  error:        string | null
}

const INITIAL_STATE: PythPricesState = {
  prices:       new Map(),
  macroData:    [],
  dangerScore:  { score: 0, level: 'low', description: 'Connecting to Pyth...', feeds: [] },
  sessionStart: new Map(),
  lastUpdated:  null,
  connected:    false,
  error:        null,
}

function computeDanger(points: MacroDataPoint[]): DangerScore {
  let total = 0
  for (const p of points) {
    if (p.isRisk) total += Math.abs(p.changePct) * 15
  }
  const score = Math.min(100, Math.round(total * 5))
  const level: DangerScore['level'] = score > 60 ? 'high' : score > 30 ? 'mid' : 'low'
  const description =
    score > 60
      ? 'High macro risk — safe-haven flows detected. Historical precursor to crypto selloffs. Review positions immediately.'
      : score > 30
        ? 'Moderate macro signals across commodity and FX feeds. Stay alert.'
        : 'Macro environment stable. No unusual cross-asset signals detected.'
  return { score, level, description, feeds: points }
}

export function usePythPrices(): PythPricesState {
  const [state, setState]       = useState<PythPricesState>(INITIAL_STATE)
  const sessionStartRef         = useRef<Map<string, number>>(new Map())
  const macroStartRef           = useRef<Map<string, number>>(new Map())
  const retryTimeoutRef         = useRef<NodeJS.Timeout | null>(null)
  const mountedRef              = useRef(true)

  const pollPrices = useCallback(async () => {
    try {
      const priceMap = await fetchAllPrices()

      if (!mountedRef.current) return

      if (priceMap.size === 0) throw new Error('Empty price response from Hermes')

      // Capture session-start prices (once per session)
      priceMap.forEach((feed, id) => {
        if (!sessionStartRef.current.has(id)) {
          sessionStartRef.current.set(id, feed.price)
        }
      })

      setState(prev => ({
        ...prev,
        prices:       priceMap,
        sessionStart: new Map(sessionStartRef.current),
        lastUpdated:  new Date(),
        connected:    true,
        error:        null,
      }))
    } catch (e) {
      if (!mountedRef.current) return
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[usePythPrices] Price poll error:', msg)
      setState(prev => ({ ...prev, connected: false, error: msg }))

      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = setTimeout(pollPrices, RETRY_DELAY)
    }
  }, [])

  const pollMacro = useCallback(async () => {
    try {
      const macroMap = await fetchMacroFeeds()

      if (!mountedRef.current) return

      macroMap.forEach((price, id) => {
        if (!macroStartRef.current.has(id)) {
          macroStartRef.current.set(id, price)
        }
      })

      const points: MacroDataPoint[] = MACRO_FEEDS.map(feed => {
        const price      = macroMap.get(feed.id) ?? 0
        const startPrice = macroStartRef.current.get(feed.id) ?? price
        const changePct  = startPrice > 0 ? ((price - startPrice) / startPrice * 100) : 0
        const isRisk     = feed.bearish ? changePct > 0.04 : changePct < -0.04
        return { feedId: feed.id, price, startPrice, isRisk, changePct }
      })

      setState(prev => ({
        ...prev,
        macroData:   points,
        dangerScore: computeDanger(points),
      }))
    } catch (e) {
      // Non-fatal — keep previous macro data
      console.warn('[usePythPrices] Macro poll error (non-fatal):', e instanceof Error ? e.message : e)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    console.log('[usePythPrices] Mounting — initial poll')

    pollPrices()
    pollMacro()

    const t1 = setInterval(pollPrices, CRYPTO_INTERVAL)
    const t2 = setInterval(pollMacro,  MACRO_INTERVAL)

    return () => {
      mountedRef.current = false
      clearInterval(t1)
      clearInterval(t2)
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [pollPrices, pollMacro])

  return state
}