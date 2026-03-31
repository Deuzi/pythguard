'use client'

import { useState } from 'react'
import { ASSETS } from '@/lib/constants'
import { fmtPrice, fmtPct } from '@/lib/pyth'
import type { Position, PositionHealth, PriceFeed } from '@/types/index'

interface PositionsTabProps {
  positions:     Position[]
  getHealth:     (pos: Position) => PositionHealth | null
  onAdd:         (pos: Omit<Position, 'id' | 'createdAt'>) => void
  onRemove:      (id: string) => void
  prices:        Map<string, PriceFeed>
}

function HealthBar({ pct, status }: { pct: number; status: PositionHealth['status'] }) {
  const color =
    status === 'liquidated' ? '#ef4444' :
    status === 'danger'     ? '#ef4444' :
    status === 'warn'       ? '#f59e0b' : '#22c55e'
  return (
    <div className="h-0.5 w-full bg-[#2a2a2a] rounded overflow-hidden">
      <div
        className="h-full rounded transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(2, pct))}%`, background: color }}
      />
    </div>
  )
}

export default function PositionsTab({ positions, getHealth, onAdd, onRemove, prices }: PositionsTabProps) {
  const [assetId,    setAssetId]    = useState(ASSETS[0].id)
  const [entryPrice, setEntryPrice] = useState('')
  const [liqPrice,   setLiqPrice]   = useState('')
  const [label,      setLabel]      = useState('')
  const [adding,     setAdding]     = useState(false)
  const [formError,  setFormError]  = useState('')

  const selectedAsset = ASSETS.find(a => a.id === assetId)!

  function handleAdd() {
    const entry = parseFloat(entryPrice)
    const liq   = parseFloat(liqPrice)
    if (!entry || !liq)       { setFormError('Enter entry and liquidation prices.'); return }
    if (liq >= entry)         { setFormError('Liquidation price must be below entry price.'); return }
    setFormError('')
    onAdd({ assetId, entryPrice: entry, liqPrice: liq, label: label || undefined })
    setEntryPrice('')
    setLiqPrice('')
    setLabel('')
    setAdding(false)
    // Auto-fill defaults for next time
    setEntryPrice(String(selectedAsset.defaultEntry))
    setLiqPrice(String(selectedAsset.defaultLiq))
  }

  function handleAssetChange(id: string) {
    setAssetId(id)
    const a = ASSETS.find(a => a.id === id)!
    setEntryPrice(String(a.defaultEntry))
    setLiqPrice(String(a.defaultLiq))
  }

  const statusLabel = (s: PositionHealth['status']) =>
    s === 'liquidated' ? 'Liquidated' :
    s === 'danger'     ? 'Critical'   :
    s === 'warn'       ? 'Caution'    : 'Safe'

  const statusColor = (s: PositionHealth['status']) =>
    s === 'liquidated' || s === 'danger' ? 'text-red-400' :
    s === 'warn' ? 'text-amber-400' : 'text-green-500'

  return (
    <div className="flex flex-col gap-6">

      {/* Add position form */}
      {adding ? (
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-5">
          <p className="font-mono text-[9px] tracking-[.18em] uppercase text-[#555] mb-4">
            New position
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Asset selector */}
            <div className="col-span-2">
              <label className="font-mono text-[9px] tracking-[.14em] uppercase text-[#555] block mb-1.5">
                Collateral asset
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ASSETS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => handleAssetChange(a.id)}
                    className={`font-mono text-[10px] px-2.5 py-1 rounded border transition-all ${
                      assetId === a.id
                        ? 'bg-[#e8ff4a] text-[#080808] border-[#e8ff4a] font-bold'
                        : 'bg-[#161616] text-[#555] border-[#2a2a2a] hover:text-[#f0f0f0]'
                    }`}
                  >
                    {a.id}
                    {a.type !== 'crypto' && (
                      <span className="ml-1 text-[7px] opacity-60">pro</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[.14em] uppercase text-[#555] block mb-1.5">
                Entry price (USD)
              </label>
              <input
                type="number"
                value={entryPrice}
                onChange={e => setEntryPrice(e.target.value)}
                placeholder={String(selectedAsset.defaultEntry)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-md px-3 py-2 text-[13px] font-medium text-[#f0f0f0] outline-none focus:border-[#e8ff4a] transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[.14em] uppercase text-[#555] block mb-1.5">
                Liquidation price (USD)
              </label>
              <input
                type="number"
                value={liqPrice}
                onChange={e => setLiqPrice(e.target.value)}
                placeholder={String(selectedAsset.defaultLiq)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-md px-3 py-2 text-[13px] font-medium text-[#f0f0f0] outline-none focus:border-[#e8ff4a] transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="font-mono text-[9px] tracking-[.14em] uppercase text-[#555] block mb-1.5">
                Label (optional)
              </label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Aave BTC long"
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
              className="bg-[#e8ff4a] text-[#080808] font-bold text-[11px] tracking-[.1em] uppercase px-4 py-2 rounded-md hover:opacity-85 active:scale-95 transition-all"
            >
              Add position
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
          onClick={() => {
            setAdding(true)
            setEntryPrice(String(selectedAsset.defaultEntry))
            setLiqPrice(String(selectedAsset.defaultLiq))
          }}
          className="w-full bg-[#0f0f0f] border border-dashed border-[#2a2a2a] rounded-xl py-3.5 text-[11px] font-mono tracking-[.1em] uppercase text-[#555] hover:text-[#f0f0f0] hover:border-[#555] transition-all"
        >
          + Add position
        </button>
      )}

      {/* Position cards */}
      {positions.length === 0 && !adding && (
        <p className="font-mono text-[11px] text-[#555] text-center py-8">
          No positions yet. Add one above.
        </p>
      )}

      {positions.map(pos => {
        const health = getHealth(pos)
        const asset  = ASSETS.find(a => a.id === pos.assetId)!
        const borderColor =
          !health               ? 'border-[#1f1f1f]' :
          health.status === 'liquidated' || health.status === 'danger' ? 'border-red-500/25' :
          health.status === 'warn'       ? 'border-amber-500/25' : 'border-[#1f1f1f]'

        return (
          <div
            key={pos.id}
            className={`bg-[#0f0f0f] border rounded-xl p-5 transition-all ${borderColor} ${
              health?.status === 'danger' || health?.status === 'liquidated'
                ? 'animate-pulse-subtle'
                : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-bold tracking-wide">{asset.label}</span>
                  {pos.label && (
                    <span className="font-mono text-[9px] text-[#555] border border-[#2a2a2a] px-2 py-0.5 rounded">
                      {pos.label}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[9px] text-[#555]">
                  Entry {fmtPrice(pos.entryPrice, asset.decimals)} · Liq. {fmtPrice(pos.liqPrice, asset.decimals)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {health && (
                  <span className={`font-mono text-[11px] font-medium ${statusColor(health.status)}`}>
                    {statusLabel(health.status)}
                  </span>
                )}
                <button
                  onClick={() => onRemove(pos.id)}
                  className="text-[#333] hover:text-red-400 transition-colors font-mono text-[12px]"
                  title="Remove position"
                >
                  ✕
                </button>
              </div>
            </div>

            {health ? (
              <>
                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#161616] rounded-lg p-3">
                    <p className="font-mono text-[8px] tracking-[.14em] uppercase text-[#555] mb-1.5">
                      Current price
                    </p>
                    <p className="text-[16px] font-bold tabular-nums leading-none">
                      {fmtPrice(health.currentPrice, asset.decimals)}
                    </p>
                    <p className={`font-mono text-[9px] mt-1.5 ${health.changePct >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {fmtPct(health.changePct)}
                    </p>
                  </div>
                  <div className="bg-[#161616] rounded-lg p-3">
                    <p className="font-mono text-[8px] tracking-[.14em] uppercase text-[#555] mb-1.5">
                      Distance to liq.
                    </p>
                    <p className={`text-[16px] font-bold tabular-nums leading-none ${statusColor(health.status)}`}>
                      {health.status === 'liquidated'
                        ? 'Liq!'
                        : fmtPrice(health.distanceDollars, asset.decimals)}
                    </p>
                    <p className="font-mono text-[9px] text-[#555] mt-1.5">
                      {health.status !== 'liquidated' && `${health.distancePct.toFixed(2)}% away`}
                    </p>
                  </div>
                  <div className="bg-[#161616] rounded-lg p-3">
                    <p className="font-mono text-[8px] tracking-[.14em] uppercase text-[#555] mb-1.5">
                      Health score
                    </p>
                    <p className={`text-[16px] font-bold leading-none ${statusColor(health.status)}`}>
                      {health.healthScore}
                    </p>
                    <p className="font-mono text-[9px] text-[#555] mt-1.5">/ 100</p>
                  </div>
                </div>

                {/* Price bar */}
                <div className="bg-[#161616] rounded-lg px-3 py-2.5">
                  <HealthBar
                    pct={health.distancePct * 4}
                    status={health.status}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="font-mono text-[8px] text-[#555]">
                      Liq. {fmtPrice(pos.liqPrice, asset.decimals)}
                    </span>
                    <span className="font-mono text-[8px] text-[#e8ff4a]">
                      {fmtPrice(health.currentPrice, asset.decimals)} live
                    </span>
                  </div>
                </div>

                {health.conf > 0 && (
                  <p className="font-mono text-[8px] text-[#333] mt-2">
                    Confidence interval: ±{fmtPrice(health.conf, asset.decimals + 1)}
                  </p>
                )}
              </>
            ) : (
              <p className="font-mono text-[11px] text-[#555]">Waiting for price feed...</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
