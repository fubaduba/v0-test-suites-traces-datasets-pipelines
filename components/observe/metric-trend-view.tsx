"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, GitCompare, X } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  buildTrend,
  emptyFilters,
  filterDimensions,
  filterKeyOf,
  formatMetric,
  metricDefs,
  metricOrder,
  timeWindows,
  trendSummary,
  type MetricId,
  type TimeWindow,
  type TracesHandoff,
  type TrendFilters,
} from "@/lib/metric-trends"

const ALL = "__all__"

interface MetricTrendViewProps {
  metricId: MetricId
  onBack: () => void
  onViewTraces: (handoff: TracesHandoff) => void
}

export function MetricTrendView({ metricId, onBack, onViewTraces }: MetricTrendViewProps) {
  const [window, setWindow] = useState<TimeWindow>("7d")
  const [filters, setFilters] = useState<TrendFilters>(emptyFilters)
  const [compareOn, setCompareOn] = useState(false)
  const [compareId, setCompareId] = useState<MetricId>(metricId === "errorRate" ? "cost" : "errorRate")

  const def = metricDefs[metricId]
  const compareDef = metricDefs[compareId]
  const filterKey = filterKeyOf(filters)

  const data = useMemo(
    () => buildTrend({ metricId, window, compareId: compareOn ? compareId : null, filterKey }),
    [metricId, window, compareOn, compareId, filterKey],
  )

  const { latest, delta } = useMemo(() => trendSummary(data), [data])
  const deltaGood = def.goodDirection === "up" ? delta >= 0 : delta <= 0
  const deltaRising = delta >= 0

  const chartConfig = useMemo(
    () => ({
      value: { label: def.label, color: def.color },
      compare: { label: compareDef.label, color: "var(--muted-foreground)" },
    }),
    [def, compareDef],
  )

  const activeFilterSummary = filterDimensions
    .map((dimension) => filters[dimension.id])
    .filter(Boolean)

  const setFilter = (id: (typeof filterDimensions)[number]["id"], value: string) =>
    setFilters((current) => ({ ...current, [id]: value === ALL ? "" : value }))

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-4">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Overview
          </button>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold text-foreground leading-tight">{def.label} trend</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground tabular-nums">
                  {formatMetric(metricId, latest)}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs tabular-nums",
                    deltaGood ? "text-success" : "text-danger",
                  )}
                >
                  {deltaRising ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {formatMetric(metricId, Math.abs(delta))}
                </span>
                <span className="text-[11px] text-muted-foreground">vs window start</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onViewTraces({ metricId, window, filters })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Investigate in traces
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground max-w-2xl text-pretty">{def.blurb}</p>
        </header>

        {/* Controls: time window + comparison */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center border border-border bg-secondary">
            {timeWindows.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setWindow(option.id)}
                className={cn(
                  "px-2.5 py-1 text-[11px] transition-colors",
                  window === option.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCompareOn((current) => !current)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-[11px] border transition-colors",
                compareOn
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <GitCompare className="w-3.5 h-3.5" />
              Compare
            </button>
            {compareOn && (
              <Select value={compareId} onValueChange={(value) => setCompareId(value as MetricId)}>
                <SelectTrigger size="sm" className="h-7 w-[150px] text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metricOrder
                    .filter((id) => id !== metricId)
                    .map((id) => (
                      <SelectItem key={id} value={id} className="text-xs">
                        {metricDefs[id].label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Custom range hint */}
        {window === "custom" && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span>Range</span>
            <input
              type="date"
              defaultValue="2026-08-11"
              className="bg-secondary border border-border px-2 py-1 text-foreground [color-scheme:dark]"
              aria-label="Custom range start"
            />
            <span>to</span>
            <input
              type="date"
              defaultValue="2026-08-24"
              className="bg-secondary border border-border px-2 py-1 text-foreground [color-scheme:dark]"
              aria-label="Custom range end"
            />
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 border border-border bg-card px-3 py-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Scope</span>
          {filterDimensions.map((dimension) => (
            <Select
              key={dimension.id}
              value={filters[dimension.id] || ALL}
              onValueChange={(value) => setFilter(dimension.id, value)}
            >
              <SelectTrigger size="sm" className="h-7 w-[190px] text-[11px]">
                <SelectValue placeholder={dimension.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL} className="text-xs">
                  {`All ${dimension.label.toLowerCase()}s`}
                </SelectItem>
                {dimension.options.map((option) => (
                  <SelectItem key={option} value={option} className="text-xs font-mono">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {activeFilterSummary.length > 0 && (
            <button
              type="button"
              onClick={() => setFilters(emptyFilters)}
              className="flex items-center gap-1 px-1.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Chart */}
        <section className="bg-card border border-border p-3">
          <div className="flex items-center justify-between gap-2 pb-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2.5 h-0.5" style={{ background: def.color }} aria-hidden="true" />
                {def.label}
              </span>
              {compareOn && (
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span
                    className="w-2.5 h-0.5"
                    style={{ background: "var(--muted-foreground)" }}
                    aria-hidden="true"
                  />
                  {compareDef.label}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {activeFilterSummary.length > 0 ? activeFilterSummary.join(" · ") : "All traffic"}
            </span>
          </div>

          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={data} margin={{ top: 12, right: compareOn ? 8 : 8, bottom: 0, left: -12 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 4" />
              <XAxis
                dataKey="t"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                yAxisId="left"
                domain={def.domain ?? ["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                width={44}
              />
              {compareOn && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={compareDef.domain ?? ["auto", "auto"]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  width={44}
                />
              )}
              <ChartTooltip content={<ChartTooltipContent className="text-xs" />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3 }}
              />
              {compareOn && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="compare"
                  stroke="var(--color-compare)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ChartContainer>
        </section>
      </div>
    </div>
  )
}
