'use client'

import { MACRO_FEEDS } from '@/lib/constants'
import { fmtPrice, fmtPct } from '@/lib/pyth'
import type { DangerScore, MacroDataPoint } from '@/types/index'

interface MacroPanelProps {
  macroData:   MacroDataPoint[]
  dangerScore: DangerScore
}

export default function MacroPanel({ macroData, dangerScore }: MacroPanelProps) {
  const dangerColor =
    dangerScore.level === 'high' ? '#ef4444' :
    dangerScore.level === 'mid'  ? '#f59e0b' : '#22c55e'

  const badgeCls =
    dangerScore.level === 'high'
      ? 'border-red-500/30 text-red-400'
      : dangerScore.level === 'mid'
      ? 'border-amber-500/30 text-amber-400'
      : 'border-green-500/30 text-green-500'

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold tracking-wide">Macro danger score</p>
          <p className="font-mono text-[9px] tracking-widest text-[#555] mt-0.5 uppercase">
            Pyth Pro · commodity + FX
          </p>
        </div>
        <span className={`font-mono text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-[#1c1c1c] ${badgeCls}`}>
          {dangerScore.score}%
        </span>
      </div>

      {/* Feed rows */}
      <div>
        {MACRO_FEEDS.map(feed => {
          const point = macroData.find(p => p.feedId === feed.id)
          const price      = point?.price ?? 0
          const changePct  = point?.changePct ?? 0
          const isRisk     = point?.isRisk ?? false

          const badgeStyle =
            feed.type === 'commodity'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'

          const priceDisplay =
            price > 100  ? `$${price.toFixed(2)}` :
            price > 1    ? price.toFixed(5) :
            price > 0    ? price.toFixed(6) : '—'

          return (
            <div
              key={feed.id}
              className="flex items-center justify-between py-2.5 border-b border-[#1f1f1f] last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[8px] tracking-wider px-1.5 py-0.5 rounded border uppercase font-medium ${badgeStyle}`}>
                  {feed.type}
                </span>
                <span className="text-[12px] font-semibold tracking-wide">{feed.desc}</span>
                {isRisk && (
                  <span className="text-[9px] tracking-wide text-red-400/80 font-mono">risk</span>
                )}
              </div>
              <div className="text-right">
                {price > 0 ? (
                  <>
                    <p className="font-mono text-[12px] font-medium tabular-nums">{priceDisplay}</p>
                    <p className={`font-mono text-[10px] mt-0.5 ${changePct >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {fmtPct(changePct)}
                    </p>
                  </>
                ) : (
                  <p className="font-mono text-[11px] text-[#555]">Connecting...</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Composite bar */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-3.5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-semibold tracking-wide">Composite signal</span>
          <span
            className="font-mono text-[12px] font-medium"
            style={{ color: dangerColor }}
          >
            {dangerScore.score}%
          </span>
        </div>
        <div className="h-0.5 bg-[#2a2a2a] rounded overflow-hidden mb-2.5">
          <div
            className="h-full rounded transition-all duration-1000 ease-out"
            style={{ width: `${dangerScore.score}%`, background: dangerColor }}
          />
        </div>
        <p className="font-mono text-[9px] text-[#555] leading-relaxed">
          {dangerScore.description}
        </p>
      </div>
    </div>
  )
}
