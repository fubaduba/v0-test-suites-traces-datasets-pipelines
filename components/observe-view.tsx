"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { PanelRightOpen } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { KpiStrip } from "@/components/observe/kpi-strip"
import { InsightsPanel } from "@/components/observe/insights-panel"
import { AgentTable } from "@/components/observe/agent-table"
import { RightRail } from "@/components/observe/right-rail"
import { AgentDrawer } from "@/components/observe/agent-drawer"
import { CreateAlertModal } from "@/components/observe/create-alert-modal"
import { fleetAgents, type FleetAgent, type Insight } from "@/lib/observe-data"

const timeframes = ["1h", "24h", "7d", "30d"] as const
type Filter = "all" | "attention" | "critical" | "unmonitored"

export function ObserveView() {
  const [timeframe, setTimeframe] = useState<(typeof timeframes)[number]>("24h")
  const [filter, setFilter] = useState<Filter>("all")
  const [railOpen, setRailOpen] = useState(false)
  const [highlightReadiness, setHighlightReadiness] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<FleetAgent | null>(null)
  const [alertInsight, setAlertInsight] = useState<Insight | null>(null)

  const insightsRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  // Open the rail by default only where it can dock beside the content (xl and up).
  // Done after mount so server and client render the same initial markup.
  useEffect(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) setRailOpen(true)
  }, [])

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  const focusReadiness = () => {
    setRailOpen(true)
    setHighlightReadiness(true)
    window.setTimeout(() => setHighlightReadiness(false), 2200)
  }

  const filterCritical = () => {
    setFilter("critical")
    scrollTo(tableRef)
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 px-5 py-4">
            {/* Page title */}
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-foreground leading-tight">Observe</h1>
                <p className="text-xs text-muted-foreground">
                  Fleet health for this project · {fleetAgents.length} agents · Last 24 hours
                </p>
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
                {!railOpen && (
                  <button
                    type="button"
                    onClick={() => setRailOpen(true)}
                    className="flex items-center gap-1.5 px-2 py-1 text-[11px] bg-secondary border border-border text-muted-foreground hover:text-foreground"
                  >
                    <PanelRightOpen className="w-3.5 h-3.5" />
                    Readiness
                  </button>
                )}
              </div>
            </header>

            {/* Layer 1 */}
            <KpiStrip
              onFilterCritical={filterCritical}
              onFocusReadiness={focusReadiness}
              onFocusInsights={() => scrollTo(insightsRef)}
              onFocusTable={() => scrollTo(tableRef)}
            />

            {/* Layer 2 */}
            <div ref={insightsRef} className="scroll-mt-4">
              <InsightsPanel
                onOpenAlertModal={setAlertInsight}
                onViewTraces={(insight) => {
                  const agent = fleetAgents.find((item) => item.name === insight.affectedAgents[0])
                  if (agent) setSelectedAgent(agent)
                }}
              />
            </div>

            {/* Layer 3 */}
            <div ref={tableRef} className="scroll-mt-4">
              <AgentTable filter={filter} onFilterChange={setFilter} onSelectAgent={setSelectedAgent} />
            </div>
          </div>
        </div>

        {railOpen && (
          <>
            <button
              type="button"
              aria-label="Close readiness panel"
              onClick={() => setRailOpen(false)}
              className="absolute inset-0 z-20 bg-background/60 xl:hidden"
            />
            <RightRail highlightReadiness={highlightReadiness} onCollapse={() => setRailOpen(false)} />
          </>
        )}

        <AgentDrawer agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        <CreateAlertModal insight={alertInsight} onClose={() => setAlertInsight(null)} />
      </div>
    </TooltipProvider>
  )
}
