'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  loadAlerts,
  addAlert as addAlertToStorage,
  removeAlert as removeAlertFromStorage,
  saveAlerts,
} from '@/lib/storage'
import { registerEntropyAlert, fmtPrice } from '@/lib/pyth'
import { ASSETS } from '@/lib/constants'
import type { PriceAlert, AlertCondition, PriceFeed } from '@/types/index'

// ─── Browser notification helper ─────────────────────────────────────────────

async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function fireNotification(alert: PriceAlert) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const asset = ASSETS.find(a => a.id === alert.assetId)
  if (!asset) return

  const direction = alert.condition === 'below' ? '↓ dropped below' : '↑ rose above'
  const price     = fmtPrice(alert.thresholdPrice, asset.decimals)

  try {
    const n = new Notification(`🚨 PythGuard Alert — ${asset.label}`, {
      body: `${asset.label} ${direction} ${price}`,
      icon: '/favicon.ico',
      tag:  `pythguard-alert-${alert.id}`, // prevents duplicate stacking
      requireInteraction: false,
    })

    // Auto-close after 8 seconds
    setTimeout(() => n.close(), 8000)
  } catch {
    // Notifications may be blocked silently in some browsers — ignore
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAlerts(prices: Map<string, PriceFeed>) {
  const [alerts,             setAlerts]            = useState<PriceAlert[]>([])
  const [triggered,          setTriggered]         = useState<PriceAlert[]>([])
  const [notifPermission,    setNotifPermission]   = useState<NotificationPermission | 'unsupported'>('default')
  const processedRef = useRef<Set<string>>(new Set())

  // Load persisted alerts from localStorage on mount + read current permission state
  useEffect(() => {
    setAlerts(loadAlerts())
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission)
    } else {
      setNotifPermission('unsupported')
    }
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
        fireNotification(fired)  // 🔔 push browser notification
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
    // Request permission the first time user sets an alert
    const granted = await requestNotificationPermission()
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission)
    }

    if (!granted) {
      console.warn('[useAlerts] Notification permission denied — alerts will only show in-app')
    }

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

  // Manual permission request — can be called from UI
  const enableNotifications = useCallback(async () => {
    await requestNotificationPermission()
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission)
    }
  }, [])

  return {
    alerts,
    triggered,
    addAlert,
    removeAlert,
    dismissTriggered,
    notifPermission,
    enableNotifications,
  }
}