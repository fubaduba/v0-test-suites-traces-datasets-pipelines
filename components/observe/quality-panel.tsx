"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, TrendingDown, X } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  evaluators,
  qualityRegressionLabel,
  qualityRegressionMarker,
  qualitySeriesAgents,
  qualityTrendSeries,
  type Evaluator,
} from "@/lib/observe-data"

const chartConfig = {
  luffy: { label: "luffy-travel-approver-002", color: "var(--chart-1)" },
  faos: { label: "faos-ado-memory-agent", color: "var(--chart-2)" },
  bzip: { label: "acrtest-py-bzip-20260717", color: "var(--chart-4)" },
  math: { label: "math-prompt-agent", color: "var(--chart-5)" },
}

interface QualityPanelProps {
  open: boolean
  onToggle: () => void
  onClose: () => void
  onViewRegressionInsight: () => void
}

export function QualityPanel({ open, onToggle, onClose, onViewRegressionInsight }: QualityPanelProps) {
  const [evaluator, setEvaluator] = useState<Evaluator>("Groundedness")
  const active = evaluators.find((item) => item.name === evaluator)

  return (
    <section className="bg-card border border-border">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 text-left min-w-0"
        >
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm font-semibold text-foreground shrink-0">Quality trends</span>
          <span className="text-xs text-muted-foreground truncate">
            Per-evaluator scores across the fleet · production traffic only
          </span>
        </button>
        {open && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quality trends"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="flex flex-col gap-3 p-3 lg:flex-row">
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Evaluator tabs */}
            <nav className="flex items-center gap-3 border-b border-border">
              {evaluators.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setEvaluator(item.name)}
                  className={cn(
                    "py-1.5 text-xs border-b-2 -mb-px transition-colors whitespace-nowrap",
                    evaluator === item.name
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                  {!item.hasData && <span className="ml-1 text-muted-foreground/60">·</span>}
                </button>
              ))}
            </nav>

            {active?.hasData ? (
              <>
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <LineChart data={qualityTrendSeries} margin={{ top: 16, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 4" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[50, 100]}
                      ticks={[50, 60, 70, 80, 90, 100]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    {/* Regression zone after the deployment update */}
                    <ReferenceArea
                      x1={qualityRegressionMarker}
                      x2="Aug 24"
                      fill="var(--danger)"
                      fillOpacity={0.07}
                    />
                    <ReferenceLine
                      x={qualityRegressionMarker}
                      stroke="var(--danger)"
                      strokeDasharray="3 3"
                      label={{
                        value: qualityRegressionLabel,
                        position: "top",
                        fill: "var(--danger)",
                        fontSize: 10,
                      }}
                    />
                    <ChartTooltip content={<ChartTooltipContent className="text-xs" />} />
                    {qualitySeriesAgents.map((agent) => (
                      <Line
                        key={agent.key}
                        type="monotone"
                        dataKey={agent.key}
                        stroke={`var(--color-${agent.key})`}
                        strokeWidth={1.75}
                        dot={false}
                        activeDot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ChartContainer>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {qualitySeriesAgents.map((agent) => (
                    <span key={agent.key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span
                        className="w-2 h-0.5 shrink-0"
                        style={{ background: agent.color }}
                        aria-hidden="true"
                      />
                      <span className="font-mono">{agent.name}</span>
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground text-pretty">
                  4 of 12 agents have evaluations enabled — this chart describes a third of the fleet. Y-axis
                  starts at 50 to keep the regression legible.
                </p>
              </>
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center gap-1 border border-dashed border-border bg-secondary/20">
                <span className="text-xs text-muted-foreground">Insufficient data</span>
                <span className="text-[11px] text-muted-foreground/70">
                  {evaluator} is not evaluated on any agent in this project
                </span>
              </div>
            )}
          </div>

          {/* Regressions summary */}
          <aside className="lg:w-56 shrink-0 flex flex-col gap-2 border-t border-border pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-3">
            <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground">Regressions</h3>
            <button
              type="button"
              onClick={onViewRegressionInsight}
              className="flex items-start gap-2 p-2 bg-danger/10 border border-danger/25 text-left hover:border-danger/50 transition-colors"
            >
              <TrendingDown className="w-3.5 h-3.5 mt-0.5 text-danger shrink-0" />
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs text-foreground/90 leading-snug text-pretty">
                  3 agents regressed vs 7-day baseline
                </span>
                <span className="text-[10px] text-primary">View insight →</span>
              </span>
            </button>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              math-prompt-agent held flat through the deployment update, which isolates the cause to the shared
              deployment rather than the agents themselves.
            </p>
          </aside>
        </div>
      )}
    </section>
  )
}
