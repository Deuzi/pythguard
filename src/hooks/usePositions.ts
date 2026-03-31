'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  loadPositions, savePositions, addPosition as addPositionToStorage, removePosition as removePositionFromStorage
} from '@/lib/storage'
import { ASSETS } from '@/lib/constants'
import type { Position, PositionHealth, PriceFeed } from '@/types/index'

export function usePositions(prices: Map<string, PriceFeed>, sessionStart: Map<string, number>) {
  const [positions, setPositions] = useState<Position[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    setPositions(loadPositions())
  }, [])

  const addPosition = useCallback((pos: Omit<Position, 'id' | 'createdAt'>) => {
    const newPos = addPositionToStorage(pos)
    setPositions(prev => [...prev, newPos])
    return newPos
  }, [])

  const removePosition = useCallback((id: string) => {
    removePositionFromStorage(id)
    setPositions(prev => prev.filter(p => p.id !== id))
  }, [])

  const getHealth = useCallback((pos: Position): PositionHealth | null => {
    const feed  = prices.get(pos.assetId)
    if (!feed) return null

    const asset      = ASSETS.find(a => a.id === pos.assetId)
    const cur        = feed.price
    const start      = sessionStart.get(pos.assetId) ?? cur
    const dist       = cur - pos.liqPrice
    const distPct    = pos.liqPrice > 0 ? (dist / cur * 100) : 0
    const changePct  = start > 0 ? ((cur - start) / start * 100) : 0
    const healthScore = pos.liqPrice > 0
      ? Math.max(0, Math.min(100, Math.round(distPct * 4.2)))
      : 100

    let status: PositionHealth['status']
    if (dist <= 0)       status = 'liquidated'
    else if (distPct < 8)  status = 'danger'
    else if (distPct < 20) status = 'warn'
    else                   status = 'safe'

    return {
      currentPrice:   cur,
      distanceDollars: dist,
      distancePct:    distPct,
      healthScore,
      status,
      changePct,
      conf:           feed.conf,
    }
  }, [prices, sessionStart])

  return { positions, addPosition, removePosition, getHealth }
}
