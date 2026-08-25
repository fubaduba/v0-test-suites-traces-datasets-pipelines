"use client"

import { cn } from "@/lib/utils"
import { dominantStage, type LatencyStage } from "@/lib/observe-data"

const formatMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`)

/** Stacked proportional bar — the at-a-glance answer to "which stage is this?" */
export function LatencyStageBar({ stages, className }: { stages: LatencyStage[]; className?: string }) {
  return (
    <div className={cn("flex items-stretch h-1.5 gap-px", className)} aria-hidden="true">
      {stages.map((stage) => (
        <span key={stage.key} className={stage.tone} style={{ width: `${stage.pct}%` }} />
      ))}
    </div>
  )
}

interface LatencyBreakdownProps {
  stages: LatencyStage[]
  /** End-to-end total the stages must reconcile to. */
  total: number
  /** Which percentile band this split describes, e.g. "P95". */
  band: string
  className?: string
}

/**
 * Decomposes an end-to-end duration into its four stages. Shared by the KPI
 * tile hover, the table hover and the drawer tab so the views cannot diverge.
 */
export function LatencyBreakdown({ stages, total, band, className }: LatencyBreakdownProps) {
  const summed = stages.reduce((sum, stage) => sum + stage.ms, 0)
  const owner = dominantStage(stages)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <LatencyStageBar stages={stages} />

      <ul className="flex flex-col gap-1">
        {stages.map((stage) => {
          const owns = stage.key === owner.key
          return (
            <li key={stage.key} className="flex items-center gap-2">
              <span className={cn("w-1.5 h-1.5 shrink-0", stage.tone)} aria-hidden="true" />
              <span className={cn("flex-1 text-xs truncate", owns ? "text-foreground" : "text-foreground/80")}>
                {stage.label}
              </span>
              <span className="w-14 text-right text-[11px] tabular-nums text-foreground/90">
                {formatMs(stage.ms)}
              </span>
              <span
                className={cn(
                  "w-10 text-right text-[11px] tabular-nums",
                  owns ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {stage.pct.toFixed(0)}%
              </span>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-2 pt-1.5 border-t border-border">
        <span className="flex-1 text-[11px] text-muted-foreground">
          {band} end-to-end <span className="tabular-nums text-foreground">{formatMs(total)}</span>
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground">stages {formatMs(summed)}</span>
      </div>

      <p className="text-[11px] leading-tight text-muted-foreground text-pretty">
        <span className="text-foreground">{owner.label}</span> owns the tail at {owner.pct.toFixed(0)}% of{" "}
        {band}.
      </p>
    </div>
  )
}

/**
 * Stage percentiles are not additive, so the split is a mean across tail
 * traces. Stated wherever the breakdown appears so the numbers aren't
 * misread as per-stage percentiles.
 */
export function LatencyMethodNote({ band, className }: { band: string; className?: string }) {
  return (
    <p className={cn("text-[11px] leading-relaxed text-muted-foreground text-pretty", className)}>
      Stage durations are the mean across traces in the {band} band. Per-stage percentiles are not additive,
      so they cannot be summed to an end-to-end {band} — this split attributes the tail without implying a{" "}
      {band} per stage.
    </p>
  )
}

/** Shown where an agent has no tracing data, instead of a zeroed split. */
export function LatencyUnavailable({ reason }: { reason?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-foreground/90">No stage data</p>
      {reason && <p className="text-[11px] leading-relaxed text-muted-foreground text-pretty">{reason}</p>}
      <p className="text-[11px] leading-relaxed text-muted-foreground text-pretty">
        Splitting end-to-end duration requires span-level tracing. Until spans arrive this agent reports no
        latency rather than a zeroed breakdown.
      </p>
    </div>
  )
}
