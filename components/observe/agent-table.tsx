"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { HelpCircle, Search } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Sparkline } from "./sparkline"
import { fleetAgents, type AgentStatus, type FleetAgent } from "@/lib/observe-data"

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

function CoverageBadges({ coverage }: { coverage: FleetAgent["coverage"] }) {
  const badges = [
    { key: "T", on: coverage.tracing, title: "Tracing" },
    { key: "E", on: coverage.evals, title: "Evaluations" },
    { key: "ext", on: coverage.criteria, title: "Success criteria" },
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

interface AgentTableProps {
  filter: FilterId
  onFilterChange: (filter: FilterId) => void
  onSelectAgent: (agent: FleetAgent) => void
}

export function AgentTable({ filter, onFilterChange, onSelectAgent }: AgentTableProps) {
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    return fleetAgents
      .filter((agent) => {
        if (filter === "attention") return agent.status === "attention" || agent.status === "critical"
        if (filter === "critical") return agent.status === "critical"
        if (filter === "unmonitored") return agent.status === "unmonitored"
        return true
      })
      .filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.attention - a.attention)
  }, [filter, query])

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Agents</h2>
          <div className="flex items-center gap-1">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onFilterChange(item.id)}
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
            placeholder="Search agents"
            aria-label="Search agents"
            className="w-40 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse">
          <thead>
            <tr className="bg-secondary/60 text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="text-left font-medium px-3 py-2">Agent</th>
              <th className="text-left font-medium px-3 py-2">Status</th>
              <th className="text-left font-medium px-3 py-2">Attention</th>
              <th className="text-right font-medium px-3 py-2">Invocations</th>
              <th className="text-right font-medium px-3 py-2">Error rate</th>
              <th className="text-right font-medium px-3 py-2">Task completion</th>
              <th className="text-left font-medium px-3 py-2">Quality trend</th>
              <th className="text-right font-medium px-3 py-2">P95</th>
              <th className="text-right font-medium px-3 py-2">Cost</th>
              <th className="text-left font-medium px-3 py-2">Last deployment</th>
              <th className="text-left font-medium px-3 py-2">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((agent) => {
              const isMuted = agent.status === "unmonitored"
              return (
                <tr
                  key={agent.id}
                  onClick={() => onSelectAgent(agent)}
                  className={cn(
                    "border-t border-border cursor-pointer transition-colors hover:bg-secondary/50",
                    isMuted && "opacity-55",
                  )}
                >
                  <td className="px-3 py-1.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-foreground">{agent.name}</span>
                      {isMuted && !agent.coverage.tracing && (
                        <button
                          type="button"
                          onClick={(event) => event.stopPropagation()}
                          className="w-fit text-[11px] text-primary hover:underline"
                        >
                          Set up tracing
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <span
                      className={cn(
                        "inline-block px-1.5 py-0.5 text-[11px] border whitespace-nowrap",
                        statusStyle[agent.status].className,
                      )}
                    >
                      {statusStyle[agent.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-16 h-1.5 bg-secondary">
                        <span
                          className={cn(
                            "block h-1.5",
                            agent.attention >= 80
                              ? "bg-danger"
                              : agent.attention >= 50
                                ? "bg-warning"
                                : "bg-muted-foreground/60",
                          )}
                          style={{ width: `${agent.attention}%` }}
                        />
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground w-6">{agent.attention}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Why ${agent.name} is ranked here`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs text-xs">
                          {agent.attentionWhy}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-right text-xs tabular-nums text-foreground/90">
                    {agent.invocations.toLocaleString()}
                  </td>
                  <td className="px-3 py-1.5 text-right text-xs tabular-nums">
                    {agent.errorRate === null ? (
                      <span className="text-muted-foreground/60">—</span>
                    ) : (
                      <span className={agent.errorRate >= 3 ? "text-danger" : "text-foreground/90"}>
                        {agent.errorRate.toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right text-xs tabular-nums">
                    {agent.taskCompletion === null ? (
                      <span className="italic text-muted-foreground/70">not defined</span>
                    ) : (
                      <span className="text-foreground/90">{agent.taskCompletion.toFixed(1)}%</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkline
                        data={agent.qualityTrend}
                        tone={
                          agent.qualityDelta === null ? "flat" : agent.qualityDelta < -1 ? "down" : agent.qualityDelta > 1 ? "up" : "flat"
                        }
                      />
                      {agent.qualityDelta !== null && (
                        <span
                          className={cn(
                            "text-[11px] tabular-nums",
                            agent.qualityDelta < -1
                              ? "text-warning"
                              : agent.qualityDelta > 1
                                ? "text-success"
                                : "text-muted-foreground",
                          )}
                        >
                          {agent.qualityDelta > 0 ? "+" : ""}
                          {agent.qualityDelta.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-right text-xs tabular-nums text-foreground/90">
                    {agent.p95 ? `${(agent.p95 / 1000).toFixed(2)}s` : <span className="text-muted-foreground/60">—</span>}
                  </td>
                  <td className="px-3 py-1.5 text-right text-xs tabular-nums text-foreground/90">
                    ${agent.cost.toFixed(1)}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    {agent.lastDeployment}
                    <span className="ml-1.5 text-foreground/70">{agent.version}</span>
                  </td>
                  <td className="px-3 py-1.5">
                    <CoverageBadges coverage={agent.coverage} />
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr className="border-t border-border">
                <td colSpan={11} className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No agents match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Sorted by attention rank · {rows.length} of {fleetAgents.length} agents
      </p>
    </section>
  )
}
