"use client"

import { cn } from "@/lib/utils"
import { Sparkline } from "./sparkline"
import { AlertTriangle, ArrowDown, ArrowUp } from "lucide-react"

interface KpiStripProps {
  onFilterCritical: () => void
  onFocusReadiness: () => void
  onOpenQuality: () => void
  onFocusTable: () => void
}

function Tile({
  name,
  warn,
  children,
  onClick,
  partial,
}: {
  name: string
  warn?: boolean
  children: React.ReactNode
  onClick?: () => void
  partial?: string | string[]
}) {
  const notes = partial === undefined ? [] : Array.isArray(partial) ? partial : [partial]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-1.5 bg-card border border-border px-3 py-2.5 text-left min-w-0 transition-colors hover:border-primary/50",
        warn && "border-l-2 border-l-warning",
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
}

export function KpiStrip({ onFilterCritical, onFocusReadiness, onOpenQuality, onFocusTable }: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-2">
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

      {/* Quality trend */}
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
          <span>Success criteria 3/12</span>
        </div>
      </Tile>
    </div>
  )
}
