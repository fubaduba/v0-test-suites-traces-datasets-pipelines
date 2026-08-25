"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ExternalLink, PanelRightOpen } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { KpiStrip } from "@/components/observe/kpi-strip"
import { QualityPanel } from "@/components/observe/quality-panel"
import { InsightsPanel } from "@/components/observe/insights-panel"
import { AgentTable } from "@/components/observe/agent-table"
import { RightRail } from "@/components/observe/right-rail"
import { AgentDrawer, type DrawerTab } from "@/components/observe/agent-drawer"
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
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("Traces")
  const [alertInsight, setAlertInsight] = useState<Insight | null>(null)

  // Entry points can request a specific drawer tab (e.g. the attention score).
  const openAgent = (agent: FleetAgent, tab: DrawerTab = "Traces") => {
    setDrawerTab(tab)
    setSelectedAgent(agent)
  }

  // Quality trends and Insights are both collapsed by default.
  const [qualityOpen, setQualityOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)

  const insightsRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const qualityRef = useRef<HTMLDivElement>(null)

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

  const openQuality = () => {
    setQualityOpen(true)
    // Let the panel mount before scrolling it into view.
    window.requestAnimationFrame(() => scrollTo(qualityRef))
  }

  // Insights is collapsed by default, so expand it before scrolling there.
  const openInsights = () => {
    setInsightsOpen(true)
    window.requestAnimationFrame(() => scrollTo(insightsRef))
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
                <button
                  type="button"
                  className="flex items-center gap-1 px-2 py-1 text-[11px] bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  Open in Azure Monitor
                  <ExternalLink className="w-3 h-3" />
                </button>
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
              onOpenQuality={openQuality}
              onFocusTable={() => scrollTo(tableRef)}
            />

            {/* Layer 2 — agent table sits above the quality and insights modules */}
            <div ref={tableRef} className="scroll-mt-4">
              <AgentTable
                filter={filter}
                onFilterChange={setFilter}
                onSelectAgent={openAgent}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </div>

            {/* Quality module — expands from the Quality trend tile */}
            <div ref={qualityRef} className="scroll-mt-4">
              <QualityPanel
                open={qualityOpen}
                onToggle={() => setQualityOpen((current) => !current)}
                onClose={() => setQualityOpen(false)}
                onViewRegressionInsight={openInsights}
              />
            </div>

            {/* Layer 4 */}
            <div ref={insightsRef} className="scroll-mt-4">
              <InsightsPanel
                open={insightsOpen}
                onToggle={() => setInsightsOpen((current) => !current)}
                onOpenAlertModal={setAlertInsight}
                onViewTraces={(insight) => {
                  const agent = fleetAgents.find((item) => item.name === insight.affectedAgents[0])
                  if (agent) openAgent(agent, "Traces")
                }}
              />
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

        <AgentDrawer agent={selectedAgent} initialTab={drawerTab} onClose={() => setSelectedAgent(null)} />
        <CreateAlertModal insight={alertInsight} onClose={() => setAlertInsight(null)} />
      </div>
    </TooltipProvider>
  )
}
