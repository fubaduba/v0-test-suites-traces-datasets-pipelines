"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AgentDrawer } from "@/components/observe/agent-drawer"
import { fleetAgents, type AgentStatus, type FleetAgent } from "@/lib/observe-data"

const statusStyle: Record<AgentStatus, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "bg-success/15 text-success border-success/25" },
  attention: { label: "Needs attention", className: "bg-warning/15 text-warning border-warning/25" },
  critical: { label: "Critical", className: "bg-danger/20 text-danger border-danger/40" },
  unmonitored: { label: "Not monitored", className: "bg-secondary text-muted-foreground border-border" },
}

function CoverageBadge({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      title={`${label}: ${on ? "configured" : "not configured"}`}
      className={cn(
        "px-1.5 py-0.5 text-[10px] leading-4 border whitespace-nowrap",
        on
          ? "bg-primary/20 border-primary/50 text-primary"
          : "bg-transparent border-border text-muted-foreground/50",
      )}
    >
      {label}
    </span>
  )
}

export function AssetsView() {
  const [query, setQuery] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<FleetAgent | null>(null)

  const rows = useMemo(
    () =>
      fleetAgents
        .filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [query],
  )

  const monitored = fleetAgents.filter((agent) => agent.coverage.tracing).length

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 px-5 py-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-foreground leading-tight">Assets</h1>
                <p className="text-xs text-muted-foreground">
                  Agents and models in this project · {monitored} of {fleetAgents.length} monitored
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-input border border-border">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search assets"
                  aria-label="Search assets"
                  className="w-40 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </header>

            <div className="border border-border bg-card overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="bg-secondary/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="text-left font-medium px-3 py-2">Asset</th>
                    <th className="text-left font-medium px-3 py-2">Type</th>
                    <th className="text-left font-medium px-3 py-2">Status</th>
                    <th className="text-left font-medium px-3 py-2">Version</th>
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
                        onClick={() => setSelectedAgent(agent)}
                        className={cn(
                          "border-t border-border cursor-pointer transition-colors hover:bg-secondary/50",
                          isMuted && "opacity-55",
                        )}
                      >
                        <td className="px-3 py-1.5 font-mono text-xs text-foreground">{agent.name}</td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground">Agent</td>
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
                        <td className="px-3 py-1.5 text-xs text-foreground/70">{agent.version}</td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                          {agent.lastDeployment}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className="flex items-center gap-1">
                            <CoverageBadge label="Tracing" on={agent.coverage.tracing} />
                            <CoverageBadge label="Evals" on={agent.coverage.evals} />
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {rows.length === 0 && (
                    <tr className="border-t border-border">
                      <td colSpan={6} className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No assets match this search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {rows.length} of {fleetAgents.length} assets
            </p>
          </div>
        </div>

        <AgentDrawer agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      </div>
    </TooltipProvider>
  )
}
