import type { Position, PriceAlert } from '@/types/index'
import { STORAGE_KEYS } from './constants'

// ─── Generic safe storage ────────────────────────────────────────────────────

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded — silently ignore
  }
}

// ─── Positions ───────────────────────────────────────────────────────────────

export function loadPositions(): Position[] {
  return safeGet<Position[]>(STORAGE_KEYS.POSITIONS, [])
}

export function savePositions(positions: Position[]): void {
  safeSet(STORAGE_KEYS.POSITIONS, positions)
}

export function addPosition(pos: Omit<Position, 'id' | 'createdAt'>): Position {
  const positions = loadPositions()
  const newPos: Position = {
    ...pos,
    id:        crypto.randomUUID(),
    createdAt: Date.now(),
  }
  positions.push(newPos)
  savePositions(positions)
  return newPos
}

export function removePosition(id: string): void {
  const positions = loadPositions().filter(p => p.id !== id)
  savePositions(positions)
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export function loadAlerts(): PriceAlert[] {
  return safeGet<PriceAlert[]>(STORAGE_KEYS.ALERTS, [])
}

export function saveAlerts(alerts: PriceAlert[]): void {
  safeSet(STORAGE_KEYS.ALERTS, alerts)
}

export function addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): PriceAlert {
  const alerts = loadAlerts()
  const newAlert: PriceAlert = {
    ...alert,
    id:        crypto.randomUUID(),
    createdAt: Date.now(),
  }
  alerts.push(newAlert)
  saveAlerts(alerts)
  return newAlert
}

export function triggerAlert(id: string): void {
  const alerts = loadAlerts().map(a =>
    a.id === id ? { ...a, triggeredAt: Date.now(), active: false } : a
  )
  saveAlerts(alerts)
}

export function removeAlert(id: string): void {
  const alerts = loadAlerts().filter(a => a.id !== id)
  saveAlerts(alerts)
}

export function dismissTriggeredAlerts(): void {
  const alerts = loadAlerts().filter(a => a.active)
  saveAlerts(alerts)
}
