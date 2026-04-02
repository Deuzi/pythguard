'use client'

import { useState } from 'react'
import { ASSETS } from '@/lib/constants'
import { fmtPrice } from '@/lib/pyth'
import type { PriceAlert, AlertCondition, PriceFeed } from '@/types/index'

interface AlertsTabProps {
  alerts:              PriceAlert[]
  triggered:           PriceAlert[]
  onAdd:               (assetId: string, condition: AlertCondition, threshold: number) => Promise<void>
  onRemove:            (id: string) => void
  onDismiss:           (id: string) => void
  prices:              Map<string, PriceFeed>
  notifPermission:     NotificationPermission | 'unsupported'
  enableNotifications: () => Promise<void>
}

export default function AlertsTab({
  alerts, triggered, onAdd, onRemove, onDismiss, prices,
  notifPermission, enableNotifications,
}: AlertsTabProps) {
  const [assetId,    setAssetId]    = useState(ASSETS[0].id)
  const [condition,  setCondition]  = useState<AlertCondition>('below')
  const [threshold,  setThreshold]  = useState('')
  const [adding,     setAdding]     = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [formError,  setFormError]  = useState('')

  const selectedAsset = ASSETS.find(a => a.id === assetId)!
  const currentFeed   = prices.get(assetId)

  async function handleAdd() {
    const t = parseFloat(threshold)
    if (!t) { setFormError('Enter a valid price threshold.'); return }
    setFormError('')
    setLoading(true)
    await onAdd(assetId, condition, t)
    setLoading(false)
    setThreshold('')
    setAdding(false)
  }

  const activeAlerts   = alerts.filter(a => a.active)
  const inactiveAlerts = alerts.filter(a => !a.active)

  return (
    <div className="flex flex-col gap-6">

      {/* Notification permission banner */}
      {notifPermission === 'default' && (
        <div className="flex items-center justify-between bg-[#e8ff4a]/5 border border-[#e8ff4a]/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[14px]">🔔</span>
            <div>
              <p className="text-[11px] font-semibold text-[#e8ff4a]">Enable push notifications</p>
              <p className="font-mono text-[9px] text-[#555] mt-0.5">
                Get browser alerts the moment a price target is hit — even in another tab
              </p>
            </div>
          </div>
          <button
            onClick={enableNotifications}
            className="font-mono text-[10px] font-bold tracking-[.08em] uppercase px-3 py-1.5 rounded-md bg-[#e8ff4a] text-[#080808] hover:opacity-85 transition-all ml-4 shrink-0"
          >
            Enable
          </button>
        </div>
      )}

      {notifPermission === 'denied' && (
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
          <span className="text-[14px]">🔕</span>
          <div>
            <p className="text-[11px] font-semibold text-[#555]">Notifications blocked</p>
            <p className="font-mono text-[9px] text-[#444] mt-0.5">
              Allow notifications for this site in your browser settings to receive push alerts
            </p>
          </div>
        </div>
      )}

      {notifPermission === 'granted' && alerts.some(a => a.active) && (
        <div className="flex items-center gap-2 px-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"
            style={{ animation: 'pulse-dot 1.4s ease-in-out infinite' }}
          />
          <p className="font-mono text-[9px] text-[#555]">
            Push notifications active — you'll be alerted even in other tabs
          </p>
        </div>
      )}

      {/* Triggered notifications */}
      {triggered.length > 0 && (
        <div className="flex flex-col gap-2">
          {triggered.map(a => {
            const asset = ASSETS.find(x => x.id === a.assetId)!
            return (
              <div
                key={a.id}
                className="flex items-center justify-between bg-red-500/8 border border-red-500/25 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-[12px] font-semibold text-red-400">
                    Alert fired — {asset.label} {a.condition} {fmtPrice(a.thresholdPrice, asset.decimals)}
                  </p>
                  <p className="font-mono text-[9px] text-[#555] mt-0.5">
                    {a.triggeredAt ? new Date(a.triggeredAt).toLocaleTimeString() : ''}
                  </p>
                </div>
                <button
                  onClick={() => onDismiss(a.id)}
                  className="text-[#555] hover:text-red-400 transition-colors font-mono text-[11px] ml-4"
                >
                  Dismiss
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add alert form */}
      {adding ? (
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-5">
          <p className="font-mono text-[9px] tracking-[.18em] uppercase text-[#555] mb-4">
            New alert · Pyth Entropy
          </p>

          {/* Asset tabs */}
          <div className="mb-3">
            <label className="font-mono text-[9px] tracking-[.14em] uppercase text-[#555] block mb-1.5">
              Asset
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ASSETS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAssetId(a.id)}
                  className={`font-mono text-[10px] px-2.5 py-1 rounded border transition-all ${
                    assetId === a.id
                      ? 'bg-[#e8ff4a] text-[#080808] border-[#e8ff4a] font-bold'
                      : 'bg-[#161616] text-[#555] border-[#2a2a2a] hover:text-[#f0f0f0]'
                  }`}
                >
                  {a.id}
                </button>
              ))}
            </div>
          </div>

          {/* Condition + threshold */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-mono text-[9px] tracking-[.14em] uppercase text-[#555] block mb-1.5">
                Condition
              </label>
              <div className="flex rounded-md overflow-hidden border border-[#2a2a2a]">
                {(['below', 'above'] as AlertCondition[]).map(c => (
                  <button
                    key={c}
                    onClick={() => setCondition(c)}
                    className={`flex-1 py-2 text-[11px] font-mono uppercase tracking-wide transition-colors ${
                      condition === c
                        ? 'bg-[#e8ff4a] text-[#080808] font-bold'
                        : 'bg-[#161616] text-[#555] hover:text-[#f0f0f0]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[.14em] uppercase text-[#555] block mb-1.5">
                Price threshold (USD)
                {currentFeed && (
                  <span className="ml-2 text-[#e8ff4a]">
                    Live: {fmtPrice(currentFeed.price, selectedAsset.decimals)}
                  </span>
                )}
              </label>
              <input
                type="number"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                placeholder={String(
                  condition === 'below' ? selectedAsset.defaultLiq : selectedAsset.defaultEntry
                )}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-md px-3 py-2 text-[13px] font-medium text-[#f0f0f0] outline-none focus:border-[#e8ff4a] transition-colors"
              />
            </div>
          </div>

          {formError && (
            <p className="font-mono text-[10px] text-red-400 mb-3">{formError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-[#e8ff4a] text-[#080808] font-bold text-[11px] tracking-[.1em] uppercase px-4 py-2 rounded-md hover:opacity-85 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register on-chain'}
            </button>
            <button
              onClick={() => { setAdding(false); setFormError('') }}
              className="text-[#555] text-[11px] tracking-[.1em] uppercase px-4 py-2 rounded-md border border-[#2a2a2a] hover:text-[#f0f0f0] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full bg-[#0f0f0f] border border-dashed border-[#2a2a2a] rounded-xl py-3.5 text-[11px] font-mono tracking-[.1em] uppercase text-[#555] hover:text-[#f0f0f0] hover:border-[#555] transition-all"
        >
          + New alert
        </button>
      )}

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <p className="font-mono text-[9px] tracking-[.18em] uppercase text-[#555] mb-3">
            Active alerts
          </p>
          <div className="flex flex-col gap-2">
            {activeAlerts.map(a => {
              const asset       = ASSETS.find(x => x.id === a.assetId)!
              const feed        = prices.get(a.assetId)
              const distance    = feed
                ? a.condition === 'below'
                  ? feed.price - a.thresholdPrice
                  : a.thresholdPrice - feed.price
                : null
              const distancePct = feed && distance !== null
                ? (distance / feed.price * 100)
                : null

              return (
                <div key={a.id} className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[12px] font-semibold">
                        {asset.label}{' '}
                        <span className="text-[#555] font-normal">{a.condition}</span>{' '}
                        {fmtPrice(a.thresholdPrice, asset.decimals)}
                      </p>
                      <p className="font-mono text-[9px] text-[#555] mt-0.5">
                        Set {new Date(a.createdAt).toLocaleString()}
                        {notifPermission === 'granted' && (
                          <span className="ml-2 text-[#22c55e]">· push on</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(a.id)}
                      className="text-[#333] hover:text-red-400 transition-colors font-mono text-[11px]"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Distance meter */}
                  {distancePct !== null && feed && (
                    <div className="mb-3">
                      <div className="flex justify-between text-[9px] font-mono text-[#555] mb-1">
                        <span>
                          {distancePct > 0
                            ? `${distancePct.toFixed(2)}% away from trigger`
                            : 'Trigger imminent'}
                        </span>
                        <span>Live: {fmtPrice(feed.price, asset.decimals)}</span>
                      </div>
                      <div className="h-0.5 bg-[#2a2a2a] rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.max(2, Math.abs(distancePct) * 3))}%`,
                            background: distancePct < 5 ? '#ef4444' : distancePct < 15 ? '#f59e0b' : '#22c55e',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Entropy receipt */}
                  {a.entropySequence && (
                    <div className="bg-[#161616] rounded-md px-3 py-2 border-l-2 border-[#e8ff4a]">
                      <p className="font-mono text-[8px] text-[#e8ff4a] tracking-[.1em] mb-0.5">
                        Pyth Entropy receipt
                      </p>
                      <p className="font-mono text-[8px] text-[#555] leading-relaxed break-all">
                        Seq #{a.entropySequence} · {a.entropyHash?.slice(0, 24)}...
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Triggered history */}
      {inactiveAlerts.length > 0 && (
        <div>
          <p className="font-mono text-[9px] tracking-[.18em] uppercase text-[#555] mb-3">
            History
          </p>
          <div className="flex flex-col gap-2">
            {inactiveAlerts.map(a => {
              const asset = ASSETS.find(x => x.id === a.assetId)!
              return (
                <div
                  key={a.id}
                  className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl px-4 py-3 flex items-center justify-between opacity-50"
                >
                  <div>
                    <p className="text-[11px] font-medium line-through text-[#555]">
                      {asset.label} {a.condition} {fmtPrice(a.thresholdPrice, asset.decimals)}
                    </p>
                    <p className="font-mono text-[8px] text-[#555] mt-0.5">
                      Triggered {a.triggeredAt ? new Date(a.triggeredAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(a.id)}
                    className="text-[#333] hover:text-red-400 transition-colors font-mono text-[11px] ml-4"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {alerts.length === 0 && !adding && (
        <p className="font-mono text-[11px] text-[#555] text-center py-8">
          No alerts set. Add one above.
        </p>
      )}
    </div>
  )
}