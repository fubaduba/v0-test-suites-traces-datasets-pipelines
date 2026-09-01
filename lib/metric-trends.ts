import { fleetAgents } from "./observe-data"

/* ---------------------------------------------------------------------------
 * Shared metric-trend model.
 *
 * One definition table + one series generator power the trend view for every
 * KPI. Nothing here is metric-specific beyond the config rows, so the chart,
 * filters, window selector, and comparison overlay are reused everywhere.
 * ------------------------------------------------------------------------- */

export type MetricId = "quality" | "errorRate" | "cost" | "capacity" | "coverage" | "fleet"

export interface MetricDef {
  id: MetricId
  label: string
  /** Column key shown on the KPI strip so tiles map to the same metric. */
  prefix?: string
  suffix: string
  color: string
  /** Curve endpoints across the visible window (start → most recent). */
  base: number
  end: number
  volatility: number
  decimals: number
  /** Whether an increase is a good thing — drives the delta color. */
  goodDirection: "up" | "down"
  /** Y-axis domain override; otherwise derived from the data. */
  domain?: [number, number]
  blurb: string
}

export const metricDefs: Record<MetricId, MetricDef> = {
  quality: {
    id: "quality",
    label: "Quality score",
    suffix: " pts",
    color: "var(--chart-2)",
    base: 86,
    end: 79,
    volatility: 0.8,
    decimals: 1,
    goodDirection: "up",
    domain: [50, 100],
    blurb: "Fleet-average groundedness across agents with evaluations enabled.",
  },
  errorRate: {
    id: "errorRate",
    label: "Error rate",
    suffix: "%",
    color: "var(--chart-1)",
    base: 1.1,
    end: 2.3,
    volatility: 0.18,
    decimals: 2,
    goodDirection: "down",
    domain: [0, 6],
    blurb: "Share of invocations that ended in an error response.",
  },
  cost: {
    id: "cost",
    label: "Cost",
    prefix: "$",
    suffix: "/day",
    color: "var(--chart-4)",
    base: 340,
    end: 412,
    volatility: 9,
    decimals: 0,
    goodDirection: "down",
    blurb: "Combined token and hosting spend per day.",
  },
  capacity: {
    id: "capacity",
    label: "PTU utilization",
    suffix: "%",
    color: "var(--chart-5)",
    base: 62,
    end: 71,
    volatility: 2.4,
    decimals: 0,
    goodDirection: "down",
    domain: [0, 100],
    blurb: "Provisioned throughput consumed against the reserved capacity.",
  },
  coverage: {
    id: "coverage",
    label: "Tracing coverage",
    suffix: "%",
    color: "var(--chart-3)",
    base: 82,
    end: 75,
    volatility: 1.2,
    decimals: 0,
    goodDirection: "up",
    domain: [0, 100],
    blurb: "Percent of agents emitting spans in the selected window.",
  },
  fleet: {
    id: "fleet",
    label: "Healthy agents",
    suffix: " of 12",
    color: "var(--chart-3)",
    base: 8,
    end: 6,
    volatility: 0.5,
    decimals: 0,
    goodDirection: "up",
    domain: [0, 12],
    blurb: "Agents reporting a healthy status across all monitored signals.",
  },
}

export const metricOrder: MetricId[] = ["quality", "errorRate", "cost", "capacity", "coverage", "fleet"]

/* -------------------------------------------------------------------------- */

export type TimeWindow = "1h" | "24h" | "7d" | "30d" | "custom"

export const timeWindows: { id: TimeWindow; label: string }[] = [
  { id: "1h", label: "1h" },
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "custom", label: "Custom" },
]

const windowPoints: Record<TimeWindow, number> = {
  "1h": 12,
  "24h": 24,
  "7d": 7,
  "30d": 30,
  custom: 14,
}

const monthDays = [
  "Jul 26", "Jul 27", "Jul 28", "Jul 29", "Jul 30", "Jul 31",
  "Aug 1", "Aug 2", "Aug 3", "Aug 4", "Aug 5", "Aug 6", "Aug 7", "Aug 8",
  "Aug 9", "Aug 10", "Aug 11", "Aug 12", "Aug 13", "Aug 14", "Aug 15", "Aug 16",
  "Aug 17", "Aug 18", "Aug 19", "Aug 20", "Aug 21", "Aug 22", "Aug 23", "Aug 24",
]

function buildLabels(window: TimeWindow): string[] {
  const n = windowPoints[window]
  if (window === "1h") {
    // 5-minute buckets ending at 14:00.
    return Array.from({ length: n }, (_, i) => {
      const minutesBack = (n - 1 - i) * 5
      const total = 14 * 60 - minutesBack
      const h = Math.floor(total / 60)
      const m = total % 60
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    })
  }
  if (window === "24h") {
    return Array.from({ length: n }, (_, i) => `${String(i).padStart(2, "0")}:00`)
  }
  // day-based windows read from the tail of the calendar
  return monthDays.slice(monthDays.length - n)
}

/** Stable string hash so a given filter selection always yields the same shape. */
function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function seededNoise(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x) // 0..1
}

/** Smoothstep easing — gives the base→end drift an organic S-curve. */
function ease(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Deterministic 0.7–1.25 multiplier for a given filter selection. */
function filterFactor(filterKey: string): number {
  if (!filterKey) return 1
  return 0.7 + (hashString(filterKey) % 56) / 100
}

export interface TrendPoint {
  t: string
  value: number
  compare?: number
}

function seriesFor(metric: MetricDef, window: TimeWindow, filterKey: string, labels: string[]): number[] {
  const factor = filterFactor(`${metric.id}:${filterKey}`)
  const n = labels.length
  const seedBase = hashString(`${metric.id}:${window}:${filterKey}`)
  return labels.map((_, i) => {
    const t = n === 1 ? 1 : i / (n - 1)
    const drift = metric.base + (metric.end - metric.base) * ease(t)
    const noise = (seededNoise(seedBase + i * 7.3) - 0.5) * 2 * metric.volatility
    let value = (drift + noise) * factor
    if (metric.domain) {
      value = Math.max(metric.domain[0], Math.min(metric.domain[1], value))
    } else {
      value = Math.max(0, value)
    }
    const p = Math.pow(10, metric.decimals)
    return Math.round(value * p) / p
  })
}

export interface BuildTrendArgs {
  metricId: MetricId
  window: TimeWindow
  compareId?: MetricId | null
  filterKey?: string
}

export function buildTrend({ metricId, window, compareId, filterKey = "" }: BuildTrendArgs): TrendPoint[] {
  const labels = buildLabels(window)
  const primary = seriesFor(metricDefs[metricId], window, filterKey, labels)
  const compare = compareId ? seriesFor(metricDefs[compareId], window, filterKey, labels) : null
  return labels.map((t, i) => ({
    t,
    value: primary[i],
    ...(compare ? { compare: compare[i] } : {}),
  }))
}

export function formatMetric(metricId: MetricId, value: number): string {
  const def = metricDefs[metricId]
  const num = value.toFixed(def.decimals)
  return `${def.prefix ?? ""}${num}${def.suffix}`
}

/** Latest value and its delta vs. the start of the window. */
export function trendSummary(points: TrendPoint[]): { latest: number; delta: number } {
  if (points.length === 0) return { latest: 0, delta: 0 }
  const latest = points[points.length - 1].value
  const first = points[0].value
  return { latest, delta: latest - first }
}

/* -------------------------------------------------------------------------- */

export type FilterDimension = "agent" | "tool" | "model"

export const filterDimensions: { id: FilterDimension; label: string; options: string[] }[] = [
  {
    id: "agent",
    label: "Agent",
    options: fleetAgents.filter((agent) => agent.coverage.tracing).map((agent) => agent.name),
  },
  {
    id: "tool",
    label: "Tool",
    options: [
      "knowledge-base-search",
      "document-retrieval",
      "code-interpreter",
      "rest-api-connector",
      "calculator",
    ],
  },
  {
    id: "model",
    label: "Model",
    options: ["gpt4o-prod-eastus2", "gpt4o-mini", "gpt-35-turbo", "llama-3-70b"],
  },
]

export type TrendFilters = Record<FilterDimension, string>

export const emptyFilters: TrendFilters = { agent: "", tool: "", model: "" }

/** Collapses the active filters into a stable key for the series generator. */
export function filterKeyOf(filters: TrendFilters): string {
  return filterDimensions
    .map((dimension) => filters[dimension.id])
    .filter(Boolean)
    .join("|")
}

export interface TracesHandoff {
  metricId: MetricId
  window: TimeWindow
  filters: TrendFilters
}
