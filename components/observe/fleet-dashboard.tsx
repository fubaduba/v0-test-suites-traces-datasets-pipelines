"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle, ArrowDown, ArrowUp, ExternalLink, HelpCircle, Search } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sparkline } from "./sparkline"
import type { AgentStatus } from "@/lib/observe-data"
import type { FleetKpi, FleetRow, FleetStatusSummary } from "@/lib/fleet-data"

const timeframes = ["1h", "24h", "7d", "30d"] as const

const filters = [
  { id: "all", label: "All" },
  { id: "attention", label: "Needs attention" },
  { id: "critical", label: "Critical" },
  { id: "unmonitored", label: "Not monitored" },
] as const

type FilterId = (typeof filters)[number]["id"]

const statusStyle: Record<AgentStatus, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "bg-success/15 text-success border-success/25" },
  attention: { label: "Needs attention", className: "bg-warning/15 text-warning border-warning/25" },
  critical: { label: "Critical", className: "bg-danger/20 text-danger border-danger/40" },
  unmonitored: { label: "Not monitored", className: "bg-secondary text-muted-foreground border-border" },
}

function CoverageBadges({ coverage }: { coverage: FleetRow["coverage"] }) {
  const badges = [
    { key: "T", on: coverage.tracing, title: "Tracing" },
    { key: "E", on: coverage.evals, title: "Evaluations" },
  ]
  return (
    <span className="flex items-center gap-1">
      {badges.map((badge) => (
        <span
          key={badge.key}
          title={`${badge.title}: ${badge.on ? "configured" : "not configured"}`}
          className={cn(
            "px-1 min-w-[16px] text-center text-[10px] leading-4 border",
            badge.on
              ? "bg-primary/20 border-primary/50 text-primary"
              : "bg-transparent border-border text-muted-foreground/50",
          )}
        >
          {badge.key}
        </span>
      ))}
    </span>
  )
}

function StatusTile({ summary, onFilterCritical }: { summary: FleetStatusSummary; onFilterCritical: () => void }) {
  const total = summary.healthy + summary.attention + summary.critical + summary.unmonitored
  const pct = (n: number) => `${(n / total) * 100}%`
  return (
    <div className="group flex flex-col gap-1.5 bg-card border border-border px-3 py-2.5 text-left min-w-0">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">Fleet status</span>
      <div className="flex flex-col gap-1">
        <div className="flex items-stretch h-1.5 gap-px">
          <span className="bg-success" style={{ width: pct(summary.healthy) }} aria-hidden="true" />
          <span className="bg-warning" style={{ width: pct(summary.attention) }} aria-hidden="true" />
          <span className="bg-danger" style={{ width: pct(summary.critical) }} aria-hidden="true" />
          <span className="bg-secondary" style={{ width: pct(summary.unmonitored) }} aria-hidden="true" />
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] leading-tight">
          <span className="text-success">{summary.healthy} healthy</span>
          <span className="text-warning">{summary.attention} attention</span>
          <span
            role="button"
            tabIndex={0}
            onClick={onFilterCritical}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onFilterCritical()
            }}
            className="w-fit text-danger underline decoration-danger/40 underline-offset-2 cursor-pointer hover:decoration-danger"
          >
            {summary.critical} critical
          </span>
          <span className="text-muted-foreground">{summary.unmonitored} not monitored</span>
        </div>
      </div>
    </div>
  )
}

function KpiTile({ kpi }: { kpi: FleetKpi }) {
  const notes = kpi.sub === undefined ? [] : Array.isArray(kpi.sub) ? kpi.sub : [kpi.sub]
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 bg-card border border-border px-3 py-2.5 text-left min-w-0",
        kpi.warn && "border-l-2 border-l-warning",
      )}
    >
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{kpi.name}</span>
      <div className="flex items-end justify-between gap-2">
        <span className={cn("text-lg font-semibold text-foreground leading-none", kpi.valueClassName)}>
          {kpi.value}
        </span>
        {kpi.spark && kpi.spark.length > 0 && (
          <Sparkline data={kpi.spark} tone={kpi.tone ?? "flat"} width={34} className="shrink-0" />
        )}
      </div>
      {notes.length > 0 && (
        <span className="flex flex-col gap-0.5 text-[10px] leading-tight text-muted-foreground">
          {notes.map((note) => (
            <span key={note} className="truncate">
              {note}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}

interface FleetDashboardProps {
  title: string
  subtitle: string
  entityPlural: string // "tools" / "models"
  nameHeader: string // "Tool" / "Model"
  typeHeader: string // "Type" / "Family"
  kpis: FleetKpi[]
  statusSummary: FleetStatusSummary
  rows: FleetRow[]
  externalLabel?: string
}

export function FleetDashboard({
  title,
  subtitle,
  entityPlural,
  nameHeader,
  typeHeader,
  kpis,
  statusSummary,
  rows,
  externalLabel = "Open in Azure Monitor",
}: FleetDashboardProps) {
  const [timeframe, setTimeframe] = useState<(typeof timeframes)[number]>("24h")
  const [filter, setFilter] = useState<FilterId>("all")
  const [query, setQuery] = useState("")

  const visibleRows = useMemo(() => {
    return rows
      .filter((row) => {
        if (filter === "attention") return row.status === "attention" || row.status === "critical"
        if (filter === "critical") return row.status === "critical"
        if (filter === "unmonitored") return row.status === "unmonitored"
        return true
      })
      .filter((row) => row.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.attention - a.attention)
  }, [rows, filter, query])

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 px-5 py-4">
          {/* Page title */}
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground leading-tight">{title}</h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border bg-secondary">
                {timeframes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTimeframe(option)}
                    className={cn(
                      "px-2 py-1 text-[11px] transition-colors",
                      timeframe === option
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-[11px] bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                {externalLabel}
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </header>

          {/* Layer 1 — KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-2">
            <StatusTile summary={statusSummary} onFilterCritical={() => setFilter("critical")} />
            {kpis.map((kpi) => (
              <KpiTile key={kpi.id} kpi={kpi} />
            ))}
          </div>

          {/* Layer 2 — fleet table */}
          <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-foreground capitalize">{entityPlural}</h2>
                <div className="flex items-center gap-1">
                  {filters.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={cn(
                        "px-2 py-0.5 text-[11px] border transition-colors",
                        filter === item.id
                          ? "bg-primary/15 border-primary/50 text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-1 bg-input border border-border">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${entityPlural}`}
                  aria-label={`Search ${entityPlural}`}
                  className="w-40 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            <div className="border border-border bg-card overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse">
                <thead>
                  <tr className="bg-secondary/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="text-left font-medium px-3 py-2">{nameHeader}</th>
                    <th className="text-left font-medium px-3 py-2">{typeHeader}</th>
                    <th className="text-left font-medium px-3 py-2">Status</th>
                    <th className="text-left font-medium px-3 py-2">Attention</th>
                    <th className="text-right font-medium px-3 py-2">Call volume</th>
                    <th className="text-right font-medium px-3 py-2">Failure rate</th>
                    <th className="text-right font-medium px-3 py-2">P95 latency</th>
                    <th className="text-right font-medium px-3 py-2">Token cost</th>
                    <th className="text-left font-medium px-3 py-2">Volume trend</th>
                    <th className="text-left font-medium px-3 py-2">Last used</th>
                    <th className="text-left font-medium px-3 py-2">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => {
                    const isMuted = row.status === "unmonitored"
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-t border-border transition-colors hover:bg-secondary/50",
                          isMuted && "opacity-55",
                        )}
                      >
                        <td className="px-3 py-1.5">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-foreground">{row.name}</span>
                            {isMuted && !row.coverage.tracing && (
                              <button type="button" className="w-fit text-[11px] text-primary hover:underline">
                                Set up tracing
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap">{row.kind}</td>
                        <td className="px-3 py-1.5">
                          <span
                            className={cn(
                              "inline-block px-1.5 py-0.5 text-[11px] border whitespace-nowrap",
                              statusStyle[row.status].className,
                            )}
                          >
                            {statusStyle[row.status].label}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-16 h-1.5 bg-secondary">
                              <span
                                className={cn(
                                  "block h-1.5",
                                  row.attention >= 80
                                    ? "bg-danger"
                                    : row.attention >= 50
                                      ? "bg-warning"
                                      : "bg-muted-foreground/60",
                                )}
                                style={{ width: `${row.attention}%` }}
                              />
                            </span>
                            <span className="text-xs tabular-nums text-muted-foreground w-6">{row.attention}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" aria-label={`Why ${row.name} is ranked here`}>
                                  <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs text-xs">
                                {row.attentionWhy}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-right text-xs tabular-nums text-foreground/90">
                          {row.callVolume ? row.callVolume.toLocaleString() : <span className="text-muted-foreground/60">—</span>}
                        </td>
                        <td className="px-3 py-1.5 text-right text-xs tabular-nums">
                          {row.failureRate === null ? (
                            <span className="text-muted-foreground/60">—</span>
                          ) : (
                            <span className={row.failureRate >= 5 ? "text-danger" : row.failureRate >= 3 ? "text-warning" : "text-foreground/90"}>
                              {row.failureRate.toFixed(1)}%
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-right text-xs tabular-nums text-foreground/90">
                          {row.p95 ? `${(row.p95 / 1000).toFixed(2)}s` : <span className="text-muted-foreground/60">—</span>}
                        </td>
                        <td className="px-3 py-1.5 text-right text-xs tabular-nums text-foreground/90">
                          {row.tokenCost ? `$${row.tokenCost.toFixed(1)}` : <span className="text-muted-foreground/60">—</span>}
                        </td>
                        <td className="px-3 py-1.5">
                          {row.volumeTrend.length > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <Sparkline
                                data={row.volumeTrend}
                                tone={
                                  row.volumeDelta === null
                                    ? "flat"
                                    : row.volumeDelta > 1
                                      ? "up"
                                      : row.volumeDelta < -1
                                        ? "down"
                                        : "flat"
                                }
                              />
                              {row.volumeDelta !== null && (
                                <span
                                  className={cn(
                                    "text-[11px] tabular-nums",
                                    row.volumeDelta > 1
                                      ? "text-success"
                                      : row.volumeDelta < -1
                                        ? "text-warning"
                                        : "text-muted-foreground",
                                  )}
                                >
                                  {row.volumeDelta > 0 ? "+" : ""}
                                  {row.volumeDelta.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap">{row.lastUsed}</td>
                        <td className="px-3 py-1.5">
                          <CoverageBadges coverage={row.coverage} />
                        </td>
                      </tr>
                    )
                  })}
                  {visibleRows.length === 0 && (
                    <tr className="border-t border-border">
                      <td colSpan={11} className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No {entityPlural} match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sorted by attention rank · {visibleRows.length} of {rows.length} {entityPlural}
            </p>
          </section>
        </div>
      </div>
    </TooltipProvider>
  )
}
