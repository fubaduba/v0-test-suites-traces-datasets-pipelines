"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { insights, type Insight } from "@/lib/observe-data"

const severityDot = {
  critical: "bg-danger",
  warning: "bg-warning",
  info: "bg-muted-foreground",
}

const severityBorder = {
  critical: "border-l-2 border-l-danger",
  warning: "border-l-2 border-l-warning",
  info: "border-l-2 border-l-border",
}

const statePill: Record<Insight["state"], string> = {
  Open: "bg-secondary text-foreground border-border",
  Recurred: "bg-warning/15 text-warning border-warning/30",
  Resolved: "bg-success/12 text-success/80 border-success/25",
}

function DetailRow({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex gap-3 py-1.5 border-b border-border/60 last:border-b-0">
      <span className="w-32 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground pt-0.5">{label}</span>
      <span className={cn("text-[13px] leading-relaxed", muted ? "text-muted-foreground" : "text-foreground/90")}>
        {value}
      </span>
    </div>
  )
}

interface InsightsPanelProps {
  onOpenAlertModal: (insight: Insight) => void
  onViewTraces: (insight: Insight) => void
}

export function InsightsPanel({ onOpenAlertModal, onViewTraces }: InsightsPanelProps) {
  const [expanded, setExpanded] = useState<string[]>([insights[0].id])

  const toggle = (id: string) =>
    setExpanded((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <h2 className="text-sm font-semibold text-foreground">Insights</h2>
        <span className="text-xs text-muted-foreground">Prioritized by impact</span>
      </div>

      <div className="flex flex-col gap-2">
        {insights.map((insight) => {
          const isOpen = expanded.includes(insight.id)
          const isResolved = insight.state === "Resolved"

          return (
            <article
              key={insight.id}
              className={cn(
                "bg-card border border-border",
                severityBorder[insight.severity],
                isResolved && "opacity-60",
              )}
            >
              <button
                type="button"
                onClick={() => toggle(insight.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-secondary/40 transition-colors"
              >
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
                <span
                  className={cn("w-2 h-2 rounded-full shrink-0", severityDot[insight.severity])}
                  aria-hidden="true"
                />
                <span className="flex-1 text-[13px] font-medium text-foreground text-pretty">{insight.title}</span>
                {insight.stateTooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-[11px] border shrink-0 cursor-help",
                          statePill[insight.state],
                        )}
                      >
                        {insight.state}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      {insight.stateTooltip}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className={cn("px-1.5 py-0.5 text-[11px] border shrink-0", statePill[insight.state])}>
                    {insight.state}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pl-[38px]">
                  <div className="flex flex-col">
                    <DetailRow
                      label="Affected agents"
                      value={
                        <span className="flex flex-wrap gap-1">
                          {insight.affectedAgents.map((agent) => (
                            <span
                              key={agent}
                              className="px-1.5 py-0.5 font-mono text-[11px] bg-secondary border border-border text-foreground/80"
                            >
                              {agent}
                            </span>
                          ))}
                        </span>
                      }
                    />
                    <DetailRow label="Evidence" value={insight.evidence} muted={insight.evidence.startsWith("no ")} />
                    <DetailRow label="Impact" value={insight.impact} />
                    <DetailRow label="Customer impact" value={insight.customerImpact} />
                    <DetailRow label="Likely cause" value={insight.likelyCause} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Open in Optimize
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewTraces(insight)}
                      className="px-2.5 py-1 text-xs bg-secondary text-foreground border border-border hover:border-primary/50 transition-colors"
                    >
                      View traces
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAlertModal(insight)}
                      className="px-2.5 py-1 text-xs bg-secondary text-foreground border border-border hover:border-primary/50 transition-colors"
                    >
                      Create alert from this insight
                    </button>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
