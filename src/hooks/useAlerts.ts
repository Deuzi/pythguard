'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  loadAlerts,
  addAlert as addAlertToStorage,
  removeAlert as removeAlertFromStorage,
  saveAlerts,
} from '@/lib/storage'
import { registerEntropyAlert } from '@/lib/pyth'
import type { PriceAlert, AlertCondition, PriceFeed } from '@/types/index'

export function useAlerts(prices: Map<string, PriceFeed>) {
  const [alerts,    setAlerts]    = useState<PriceAlert[]>([])
  const [triggered, setTriggered] = useState<PriceAlert[]>([])
  const processedRef = useRef<Set<string>>(new Set())

  // Load persisted alerts from localStorage on mount
  useEffect(() => {
    setAlerts(loadAlerts())
  }, [])

  // Auto-check alerts every time prices tick
  useEffect(() => {
    if (prices.size === 0) return

    const current = loadAlerts()
    let changed   = false

    const updated = current.map(alert => {
      if (!alert.active || processedRef.current.has(alert.id)) return alert

      const feed = prices.get(alert.assetId)
      if (!feed) return alert

      const shouldFire =
        (alert.condition === 'below' && feed.price <= alert.thresholdPrice) ||
        (alert.condition === 'above' && feed.price >= alert.thresholdPrice)

      if (shouldFire) {
        processedRef.current.add(alert.id)
        changed = true
        const fired: PriceAlert = { ...alert, triggeredAt: Date.now(), active: false }
        setTriggered(prev => [...prev, fired])
        return fired
      }
      return alert
    })

    if (changed) {
      saveAlerts(updated)
      setAlerts(updated)
    }
  }, [prices])

  const addAlert = useCallback(async (
    assetId:        string,
    condition:      AlertCondition,
    thresholdPrice: number
  ): Promise<PriceAlert> => {
    const receipt  = await registerEntropyAlert()
    const newAlert = addAlertToStorage({
      assetId,
      condition,
      thresholdPrice,
      active:          true,
      entropySequence: receipt.sequence,
      entropyHash:     receipt.hash,
    })
    setAlerts(prev => [...prev, newAlert])
    return newAlert
  }, [])

  const removeAlert = useCallback((id: string) => {
    removeAlertFromStorage(id)
    setAlerts(prev    => prev.filter(a => a.id !== id))
    setTriggered(prev => prev.filter(a => a.id !== id))
  }, [])

  const dismissTriggered = useCallback((id: string) => {
    setTriggered(prev => prev.filter(a => a.id !== id))
  }, [])

  return { alerts, triggered, addAlert, removeAlert, dismissTriggered }
}