"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Sparkline } from "./sparkline"
import { AlertTriangle, ArrowDown, ArrowUp } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { LatencyBreakdown, LatencyStageBar } from "./latency-breakdown"
import { dominantStage, fleetLatency, fleetVolume, latencyBreakdown } from "@/lib/observe-data"

interface KpiStripProps {
  onFilterCritical: () => void
  onFocusReadiness: () => void
  onOpenQuality: () => void
  onFocusTable: () => void
  /** Latency tile click-through — focuses the table for per-agent stage data. */
  onOpenLatency: () => void
}

// Fleet stage splits are static, so compute them once at module scope.
const p50Stages = latencyBreakdown(fleetLatency.p50.coldStart, fleetLatency.p50.stages)
const p95Stages = latencyBreakdown(fleetLatency.p95.coldStart, fleetLatency.p95.stages)

const formatCount = (value: number) => value.toLocaleString("en-US")
const formatDuration = (ms: number) => `${(ms / 1000).toFixed(1)}s`

/**
 * Percentage change vs the prior period. `tone="inverse"` is for metrics where
 * an increase is bad (latency); the default treats direction as neutral, since
 * more traffic is neither good nor bad on its own.
 */
function Trend({ deltaPct, tone = "neutral" }: { deltaPct: number; tone?: "neutral" | "inverse" }) {
  const up = deltaPct >= 0
  const Icon = up ? ArrowUp : ArrowDown
  return (
    <span
      className={cn(
        "flex items-center text-[11px] shrink-0",
        tone === "inverse" ? (up ? "text-warning" : "text-success") : "text-muted-foreground",
      )}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(deltaPct).toFixed(1)}%
    </span>
  )
}

/**
 * Forwards its ref and spreads unknown props onto the button so the tile can be
 * used as a Radix `asChild` trigger — without that, hover handlers never reach
 * the DOM node and the drill-in silently does nothing.
 */
const Tile = forwardRef<
  HTMLButtonElement,
  {
    name: string
    warn?: boolean
    children: React.ReactNode
    onClick?: () => void
    partial?: string | string[]
  } & React.ComponentPropsWithoutRef<"button">
>(function Tile({ name, warn, children, onClick, partial, className, ...rest }, ref) {
  const notes = partial === undefined ? [] : Array.isArray(partial) ? partial : [partial]
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      {...rest}
      className={cn(
        "group flex flex-col gap-1.5 bg-card border border-border px-3 py-2.5 text-left min-w-0 transition-colors hover:border-primary/50",
        warn && "border-l-2 border-l-warning",
        className,
      )}
    >
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{name}</span>
      {children}
      {notes.length > 0 && (
        <span className="flex flex-col gap-0.5 pt-0.5 border-t border-dashed border-warning/40">
          {notes.map((note) => (
            <span key={note} className="flex items-center gap-1 text-[10px] text-warning/90 leading-tight">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{note}</span>
            </span>
          ))}
        </span>
      )}
    </button>
  )
})

export function KpiStrip({
  onFilterCritical,
  onFocusReadiness,
  onOpenQuality,
  onFocusTable,
  onOpenLatency,
}: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
      {/* Fleet status */}
      <Tile name="Fleet status" onClick={onFocusTable}>
        <div className="flex flex-col gap-1">
          <div className="flex items-stretch h-1.5 gap-px">
            <span className="bg-success" style={{ width: "50%" }} aria-hidden="true" />
            <span className="bg-warning" style={{ width: "25%" }} aria-hidden="true" />
            <span className="bg-danger" style={{ width: "8.33%" }} aria-hidden="true" />
            <span className="bg-secondary" style={{ width: "16.67%" }} aria-hidden="true" />
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] leading-tight">
            <span className="text-success">6 healthy</span>
            <span className="text-warning">3 attention</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation()
                onFilterCritical()
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.stopPropagation()
                  onFilterCritical()
                }
              }}
              className="w-fit text-danger underline decoration-danger/40 underline-offset-2 cursor-pointer hover:decoration-danger"
            >
              1 critical
            </span>
            <span className="text-muted-foreground">2 not monitored</span>
          </div>
        </div>
      </Tile>

      {/* Invocations & sessions */}
      <Tile name="Invocations & sessions" onClick={onFocusTable}>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-lg font-semibold text-foreground leading-none">
              {formatCount(fleetVolume.invocations.value)}
            </span>
            <span className="text-[11px] text-muted-foreground">runs</span>
            <Trend deltaPct={fleetVolume.invocations.deltaPct} />
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[13px] font-medium text-foreground leading-none">
              {formatCount(fleetVolume.sessions.value)}
            </span>
            <span className="text-[11px] text-muted-foreground">sessions</span>
            <Trend deltaPct={fleetVolume.sessions.deltaPct} />
          </div>
        </div>
        <span className="text-[10px] leading-tight text-muted-foreground">vs prior period</span>
      </Tile>

      {/* Latency — hover drills into the stage split for each band */}
      <HoverCard openDelay={120} closeDelay={80}>
        <HoverCardTrigger asChild>
          <Tile name="Latency" onClick={onOpenLatency}>
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-lg font-semibold text-foreground leading-none">
                  {formatDuration(fleetLatency.p50.value)}
                </span>
                <span className="text-[11px] text-muted-foreground">P50</span>
                <Trend deltaPct={fleetLatency.p50.deltaPct} tone="inverse" />
              </div>
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-[13px] font-medium text-foreground leading-none">
                  {formatDuration(fleetLatency.p95.value)}
                </span>
                <span className="text-[11px] text-muted-foreground">P95</span>
                <Trend deltaPct={fleetLatency.p95.deltaPct} tone="inverse" />
              </div>
            </div>
            {p95Stages && <LatencyStageBar stages={p95Stages} />}
            <span className="text-[10px] leading-tight text-muted-foreground">
              end-to-end duration · by stage
            </span>
          </Tile>
        </HoverCardTrigger>
        <HoverCardContent side="bottom" align="start" className="w-80 flex flex-col gap-3">
          <span className="text-xs font-semibold text-foreground">Fleet latency by stage</span>
          {p95Stages && (
            <LatencyBreakdown stages={p95Stages} total={fleetLatency.p95.value} band="P95" />
          )}
          {p50Stages && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                P50 for comparison — {formatDuration(fleetLatency.p50.value)}
              </span>
              <LatencyStageBar stages={p50Stages} />
              <span className="text-[11px] text-muted-foreground text-pretty">
                {dominantStage(p50Stages).label} leads the median at{" "}
                {dominantStage(p50Stages).pct.toFixed(0)}%.
              </span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground">Click to open the agent table</span>
        </HoverCardContent>
      </HoverCard>

      {/* Error rate */}
      <Tile name="Error rate" warn onClick={onFocusTable}>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-foreground leading-none">2.3%</span>
          <ArrowUp className="w-3 h-3 text-danger" />
        </div>
        <span className="text-[11px] text-muted-foreground">was 1.1%</span>
      </Tile>

      {/* Cost */}
      <Tile name="Cost" onClick={onFocusTable}>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-foreground leading-none">$412</span>
          <span className="text-[11px] text-muted-foreground">/day</span>
          <span className="flex items-center text-[11px] text-warning">
            <ArrowUp className="w-3 h-3" />
            18%
          </span>
        </div>
        <div className="flex flex-col text-[10px] leading-tight text-muted-foreground">
          <span className="truncate">Tokens $348 · Hosting $64</span>
          <span className="truncate">top: luffy-travel-approver-002 (38%)</span>
        </div>
      </Tile>

      {/* Capacity */}
      <Tile name="Capacity" onClick={onFocusTable}>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-foreground leading-none">71%</span>
          <span className="text-[11px] text-muted-foreground">PTU utilization</span>
        </div>
        <div className="h-1 bg-secondary">
          <div className="h-1 bg-primary" style={{ width: "71%" }} />
        </div>
        <span className="text-[10px] leading-tight text-muted-foreground">
          429 rate 0.8% · hosting 54% vCPU · headroom ~9 days
        </span>
      </Tile>

      {/* Coverage */}
      <Tile name="Coverage" warn onClick={onFocusReadiness} partial={"2 agents stale >24h"}>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" aria-hidden="true" />
          <span className="text-[13px] font-medium text-foreground leading-tight">Tracing 9/12</span>
          <ArrowDown className="w-3 h-3 text-warning" />
        </div>
        <div className="flex flex-col text-[10px] leading-tight text-muted-foreground">
          <span>Evals 4/12</span>
        </div>
      </Tile>

      {/* Quality trend — final tile in the strip */}
      <Tile
        name="Quality trend"
        warn
        onClick={onOpenQuality}
        partial={["across 4 of 12 agents with evals", "partial data — 1 eval run failed"]}
      >
        <div className="flex items-end justify-between gap-2">
          <span className="text-base font-semibold text-warning leading-none whitespace-nowrap">−4.2 pts</span>
          <Sparkline data={[86, 85, 84, 83, 81, 80, 79]} tone="down" width={34} className="shrink-0" />
        </div>
        <span className="text-[11px] text-muted-foreground">vs 7-day baseline</span>
      </Tile>
    </div>
  )
}
