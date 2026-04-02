'use client'

import { useState } from 'react'

import { usePythPrices } from '@/hooks/usePythPrices'
import { usePositions } from '@/hooks/usePositions'
import { useAlerts } from '@/hooks/useAlerts'

import MacroPanel from '@/components/MacroPanel'
import PositionsTab from '@/components/PositionsTab'
import AlertsTab from '@/components/AlertsTab'

type Tab = 'positions' | 'alerts'

export default function Home() {
  const [tab, setTab] = useState<Tab>('positions')

  const { prices, macroData, dangerScore, sessionStart, connected, lastUpdated } = usePythPrices()
  const { positions, addPosition, removePosition, getHealth } = usePositions(prices, sessionStart)
  const {
    alerts, triggered, addAlert, removeAlert, dismissTriggered,
    notifPermission, enableNotifications,
  } = useAlerts(prices)

  const totalPositions = positions.length
  const dangerPositions = positions.filter(p => {
    const h = getHealth(p)
    return h && (h.status === 'danger' || h.status === 'liquidated')
  }).length

  const activeAlerts = alerts.filter(a => a.active).length

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] font-syne">
      {/* Scanline */}
      <div className="scanline pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-[#1f1f1f] bg-[#080808]/95 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-extrabold tracking-[.14em] uppercase">
            Pyth<span className="text-[#e8ff4a]">Guard</span>
          </span>
          <span className="hidden sm:block font-mono text-[9px] tracking-[.12em] text-[#555] uppercase border border-[#1f1f1f] px-2 py-0.5 rounded">
            Liquidation shield
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[#555]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#22c55e]' : 'bg-red-500'}`}
            style={{ animation: connected ? 'pulse-dot 1.4s ease-in-out infinite' : undefined }}
          />
          <span>
            {connected
              ? lastUpdated
                ? `Live · ${lastUpdated.toLocaleTimeString()}`
                : 'Connecting...'
              : 'Feed error'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              dangerScore.level === 'high' ? 'bg-red-500' :
              dangerScore.level === 'mid'  ? 'bg-amber-400' : 'bg-green-500'
            }`}
          />
          <span className="font-mono text-[10px] text-[#555] hidden md:block">
            Macro {dangerScore.score}%
          </span>
        </div>
      </nav>

      {/* Triggered alert banners */}
      {triggered.length > 0 && (
        <div className="px-8 pt-4 flex flex-col gap-2">
          {triggered.slice(0, 3).map(a => (
            <div
              key={a.id}
              className="flex items-center justify-between bg-red-500/8 border border-red-500/30 rounded-xl px-4 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: 'pulse-dot 1s ease infinite' }} />
                <span className="text-[12px] font-semibold text-red-400">
                  Alert triggered — {a.assetId}/USD {a.condition} ${a.thresholdPrice.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => dismissTriggered(a.id)}
                className="font-mono text-[10px] text-[#555] hover:text-[#f0f0f0] ml-4"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hero */}
      <div className="px-8 pt-10 pb-0">
        <p className="flex items-center gap-2 font-mono text-[10px] tracking-[.22em] uppercase text-[#e8ff4a] mb-3">
          <span className="block w-6 h-px bg-[#e8ff4a]" />
          Liquidation intelligence
        </p>
        <h1 className="text-[clamp(28px,3.5vw,48px)] font-extrabold leading-[1.04] tracking-[-0.025em] mb-2">
          Guard your position.<br />
          <span className="text-[#e8ff4a]">Before it&rsquo;s too late.</span>
        </h1>
        <p className="font-mono text-[12px] text-[#555] leading-relaxed max-w-md">
          Real-time liquidation monitoring across crypto, commodities & FX — powered by Pyth Network and Pyth Pro.
        </p>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] mt-8 border-t border-[#1f1f1f] gap-px bg-[#1f1f1f]">

        {/* Left — tabs */}
        <div className="bg-[#080808] px-8 py-7">
          {/* Tab bar */}
          <div className="flex items-center gap-1 mb-6 border-b border-[#1f1f1f] pb-5">
            {([
              { key: 'positions', label: 'Positions', count: totalPositions, danger: dangerPositions },
              { key: 'alerts',    label: 'Alerts',    count: activeAlerts },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 font-mono text-[11px] tracking-[.1em] uppercase px-3 py-1.5 rounded-md transition-all ${
                  tab === t.key
                    ? 'bg-[#e8ff4a] text-[#080808] font-bold'
                    : 'text-[#555] hover:text-[#f0f0f0]'
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      tab === t.key
                        ? 'bg-[#080808]/20 text-[#080808]'
                        : ('danger' in t && t.danger && t.danger > 0)
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-[#1f1f1f] text-[#555]'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'positions' ? (
            <PositionsTab
              positions={positions}
              getHealth={getHealth}
              onAdd={addPosition}
              onRemove={removePosition}
              prices={prices}
            />
          ) : (
            <AlertsTab
              alerts={alerts}
              triggered={triggered}
              onAdd={async (assetId, condition, threshold) => { await addAlert(assetId, condition, threshold) }}
              onRemove={removeAlert}
              onDismiss={dismissTriggered}
              prices={prices}
              notifPermission={notifPermission}
              enableNotifications={enableNotifications}
            />
          )}
        </div>

        {/* Right — macro panel */}
        <div className="bg-[#0f0f0f] px-5 py-7 flex flex-col">
          <MacroPanel macroData={macroData} dangerScore={dangerScore} />
          <div className="mt-auto pt-6 border-t border-[#1f1f1f] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff4a]" style={{ animation: 'pulse-dot 2.2s ease infinite' }} />
            <span className="font-mono text-[9px] text-[#555] tracking-wide">
              Pyth Network · Real-time oracle
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}