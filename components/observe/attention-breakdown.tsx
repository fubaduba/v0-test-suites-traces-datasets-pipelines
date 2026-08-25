"use client"

import { cn } from "@/lib/utils"
import { attentionFactorMeta, factorContribution, type AttentionFactors } from "@/lib/observe-data"

function barTone(score: number) {
  if (score >= 80) return "bg-danger"
  if (score >= 50) return "bg-warning"
  return "bg-muted-foreground/60"
}

interface AttentionBreakdownProps {
  factors: AttentionFactors
  /** The rounded composite shown in the table, for reconciliation. */
  total: number
  className?: string
}

/**
 * Decomposes an attention score into its weighted factors. Shared by the table
 * hover card and the drawer tab so the two views can never diverge.
 */
export function AttentionBreakdown({ factors, total, className }: AttentionBreakdownProps) {
  const weightedSum = attentionFactorMeta.reduce(
    (sum, meta) => sum + factorContribution(factors, meta.key),
    0,
  )

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span className="flex-1">Factor</span>
        <span className="w-8 text-right">Weight</span>
        <span className="w-8 text-right">Score</span>
        <span className="w-10 text-right">Points</span>
      </div>

      <ul className="flex flex-col gap-2">
        {attentionFactorMeta.map((meta) => {
          const factor = factors[meta.key]
          const contribution = factorContribution(factors, meta.key)
          return (
            <li key={meta.key} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-xs text-foreground/90">{meta.label}</span>
                <span className="w-8 text-right text-[11px] tabular-nums text-muted-foreground">
                  {Math.round(meta.weight * 100)}%
                </span>
                <span className="w-8 text-right text-[11px] tabular-nums text-foreground/90">{factor.score}</span>
                <span className="w-10 text-right text-[11px] tabular-nums text-foreground">
                  {contribution.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 h-1 bg-secondary shrink-0" aria-hidden="true">
                  <span className={cn("block h-1", barTone(factor.score))} style={{ width: `${factor.score}%` }} />
                </span>
                <span className="flex-1 text-[11px] leading-tight text-muted-foreground text-pretty">
                  {factor.value}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-2 pt-1.5 border-t border-border">
        <span className="flex-1 text-[11px] text-muted-foreground">
          Composite <span className="tabular-nums text-foreground">{total}</span>
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          weighted sum {weightedSum.toFixed(1)}
        </span>
      </div>
    </div>
  )
}

/**
 * Shown wherever an agent has no telemetry, instead of a misleading zero.
 * `reason` is omitted where the surrounding UI already states it.
 */
export function AttentionUnscored({ reason }: { reason?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-foreground/90">Not scored</p>
      {reason && <p className="text-[11px] leading-relaxed text-muted-foreground text-pretty">{reason}</p>}
      <p className="text-[11px] leading-relaxed text-muted-foreground text-pretty">
        Attention requires tracing data. Until spans arrive this agent is excluded from ranking rather than
        ranked at zero.
      </p>
    </div>
  )
}
