import { metricDefs, type MetricId, type TimeWindow, type TrendFilters } from "./metric-trends"
import type { Insight } from "./observe-data"

/* ---------------------------------------------------------------------------
 * Project-scoped trace explorer model.
 *
 * The explorer is query-first: a filter set is the single source of truth, and
 * everything else — the KQL box, the natural-language bar, the recipe chips,
 * and the entry-point hand-offs — is just another way to produce that same
 * filter set. Two-way sync means filters -> KQL and KQL -> filters both round
 * trip through the same helpers below.
 * ------------------------------------------------------------------------- */

export type TraceStatus = "Completed" | "Failed" | "Running"

export const traceStatuses: TraceStatus[] = ["Completed", "Failed", "Running"]

export const errorTypes = ["Timeout", "ToolError", "RateLimit", "Groundedness", "SchemaValidation"] as const
export type ErrorType = (typeof errorTypes)[number]

/** Assets reused verbatim from the fleet so the explorer filters real names. */
export const traceAgents = [
  "luffy-travel-approver-002",
  "faos-ado-memory-agent",
  "acrtest-net-img-20260717",
  "acrtest-py-bzip-20260717",
]

export const traceTools = [
  "knowledge-base-search",
  "document-retrieval",
  "code-interpreter",
  "rest-api-connector",
  "calculator",
]

export const traceModels = ["gpt4o-prod-eastus2", "gpt4o-mini", "gpt-35-turbo", "llama-3-70b"]

export interface TraceWindow {
  id: string
  label: string
  /** Upper bound in hours; `yesterday` is special-cased in matching. */
  hours: number
}

export const traceWindows: TraceWindow[] = [
  { id: "1h", label: "1h", hours: 1 },
  { id: "24h", label: "24h", hours: 24 },
  { id: "yesterday", label: "Yesterday", hours: 48 },
  { id: "7d", label: "7d", hours: 168 },
  { id: "30d", label: "30d", hours: 720 },
]

/* -------------------------------------------------------------------------- */

export interface TraceFilters {
  agent: string
  tool: string
  model: string
  status: TraceStatus | ""
  errorType: ErrorType | ""
  latencyMin: number | null // seconds
  latencyMax: number | null // seconds
  timeWindow: string
}

export const emptyTraceFilters: TraceFilters = {
  agent: "",
  tool: "",
  model: "",
  status: "",
  errorType: "",
  latencyMin: null,
  latencyMax: null,
  timeWindow: "7d",
}

/* ------------------------------- span trees ------------------------------- */

export type SpanKind = "agent" | "tool" | "model"

export interface SpanNode {
  id: string
  kind: SpanKind
  name: string
  status: "ok" | "error"
  durationMs: number
  detail?: string
  children?: SpanNode[]
}

let spanCounter = 0
const nextId = () => `sp-${(spanCounter += 1)}`

function agentSpan(name: string, durationMs: number, children: SpanNode[], status: "ok" | "error" = "ok"): SpanNode {
  return { id: nextId(), kind: "agent", name, status, durationMs, children }
}
function modelSpan(name: string, durationMs: number, tokens: number, status: "ok" | "error" = "ok"): SpanNode {
  return { id: nextId(), kind: "model", name, status, durationMs, detail: `${tokens.toLocaleString()} tokens` }
}
function toolSpan(name: string, durationMs: number, detail: string, status: "ok" | "error" = "ok"): SpanNode {
  return { id: nextId(), kind: "tool", name, status, durationMs, detail }
}

/* -------------------------------- traces --------------------------------- */

export interface ParentTrace {
  id: string
  title: string
  entryAgent: string
  status: TraceStatus
  errorType: ErrorType | null
  startTime: string
  hoursAgo: number
  durationMs: number
  tokens: number
  cost: number
  agents: string[]
  tools: string[]
  models: string[]
  tree: SpanNode
}

function collect(tree: SpanNode): { agents: string[]; tools: string[]; models: string[]; spanCount: number } {
  const agents = new Set<string>()
  const tools = new Set<string>()
  const models = new Set<string>()
  let spanCount = 0
  const walk = (node: SpanNode) => {
    spanCount += 1
    if (node.kind === "agent") agents.add(node.name)
    if (node.kind === "tool") tools.add(node.name)
    if (node.kind === "model") models.add(node.name)
    node.children?.forEach(walk)
  }
  walk(tree)
  return { agents: [...agents], tools: [...tools], models: [...models], spanCount }
}

interface TraceSeed {
  id: string
  title: string
  status: TraceStatus
  errorType: ErrorType | null
  startTime: string
  hoursAgo: number
  cost: number
  tokens: number
  tree: SpanNode
}

const seeds: TraceSeed[] = [
  {
    id: "cv_9f21",
    title: "Approve multi-city travel request for Q3 offsite",
    status: "Failed",
    errorType: "Groundedness",
    startTime: "3/6/26, 12:04 PM",
    hoursAgo: 2,
    cost: 0.021,
    tokens: 5210,
    tree: agentSpan(
      "luffy-travel-approver-002",
      6210,
      [
        modelSpan("gpt4o-prod-eastus2", 2100, 2740),
        toolSpan("knowledge-base-search", 640, "policy corpus · 8 hits"),
        agentSpan(
          "faos-ado-memory-agent",
          2980,
          [
            modelSpan("gpt4o-prod-eastus2", 1980, 1480, "error"),
            toolSpan("document-retrieval", 420, "prior approvals · 3 docs"),
          ],
          "error",
        ),
      ],
      "error",
    ),
  },
  {
    id: "cv_4a08",
    title: "Look up per-diem cap for Zurich",
    status: "Completed",
    errorType: null,
    startTime: "3/6/26, 9:12 AM",
    hoursAgo: 5,
    cost: 0.008,
    tokens: 3040,
    tree: agentSpan("luffy-travel-approver-002", 3810, [
      modelSpan("gpt4o-prod-eastus2", 2400, 2735),
      toolSpan("knowledge-base-search", 610, "policy corpus · 5 hits"),
    ]),
  },
  {
    id: "cv_71bd",
    title: "Sync sprint memory from Azure DevOps board",
    status: "Failed",
    errorType: "Timeout",
    startTime: "3/6/26, 1:20 PM",
    hoursAgo: 1,
    cost: 0.014,
    tokens: 3920,
    tree: agentSpan(
      "faos-ado-memory-agent",
      12420,
      [
        modelSpan("gpt4o-mini", 1600, 1820),
        toolSpan("document-retrieval", 900, "work items · 42 docs"),
        toolSpan("rest-api-connector", 9600, "GET /workitems · gateway timeout", "error"),
      ],
      "error",
    ),
  },
  {
    id: "cv_2c55",
    title: "Summarize last standup notes",
    status: "Completed",
    errorType: null,
    startTime: "3/5/26, 6:30 PM",
    hoursAgo: 20,
    cost: 0.009,
    tokens: 3110,
    tree: agentSpan("faos-ado-memory-agent", 4120, [
      modelSpan("gpt4o-mini", 2600, 2210),
      toolSpan("document-retrieval", 780, "standup notes · 6 docs"),
    ]),
  },
  {
    id: "cv_88e3",
    title: "Generate thumbnail set from product render",
    status: "Failed",
    errorType: "RateLimit",
    startTime: "3/5/26, 8:05 AM",
    hoursAgo: 30,
    cost: 0.012,
    tokens: 2680,
    tree: agentSpan(
      "acrtest-net-img-20260717",
      8900,
      [
        modelSpan("gpt-35-turbo", 1400, 1260),
        toolSpan("rest-api-connector", 7100, "POST /render · 429 throttled", "error"),
      ],
      "error",
    ),
  },
  {
    id: "cv_1d90",
    title: "Compute compression ratio for archive batch",
    status: "Completed",
    errorType: null,
    startTime: "3/3/26, 2:00 PM",
    hoursAgo: 72,
    cost: 0.006,
    tokens: 1980,
    tree: agentSpan("acrtest-py-bzip-20260717", 2910, [
      modelSpan("gpt4o-mini", 1500, 1420),
      toolSpan("calculator", 190, "ratio = 3.21x"),
    ]),
  },
  {
    id: "cv_63f7",
    title: "Run cleanup script over stale branches",
    status: "Failed",
    errorType: "ToolError",
    startTime: "3/6/26, 10:40 AM",
    hoursAgo: 4,
    cost: 0.011,
    tokens: 3350,
    tree: agentSpan(
      "acrtest-py-bzip-20260717",
      5600,
      [
        modelSpan("llama-3-70b", 2200, 2010),
        toolSpan("code-interpreter", 3100, "git prune · exit code 1", "error"),
      ],
      "error",
    ),
  },
  {
    id: "cv_0b12",
    title: "Draft itinerary with hotel + rail options",
    status: "Completed",
    errorType: null,
    startTime: "2/28/26, 11:15 AM",
    hoursAgo: 144,
    cost: 0.019,
    tokens: 4870,
    tree: agentSpan("luffy-travel-approver-002", 7320, [
      modelSpan("gpt4o-prod-eastus2", 3100, 3240),
      toolSpan("knowledge-base-search", 700, "policy corpus · 9 hits"),
      agentSpan("faos-ado-memory-agent", 2600, [
        modelSpan("gpt4o-prod-eastus2", 1800, 1490),
        toolSpan("document-retrieval", 500, "traveler prefs · 4 docs"),
      ]),
    ]),
  },
  {
    id: "cv_5e44",
    title: "Reconcile memory index (in progress)",
    status: "Running",
    errorType: null,
    startTime: "3/6/26, 1:52 PM",
    hoursAgo: 0.2,
    cost: 0.004,
    tokens: 1240,
    tree: agentSpan("faos-ado-memory-agent", 2100, [
      modelSpan("gpt4o-mini", 1400, 1240),
      toolSpan("document-retrieval", 700, "reindex · streaming"),
    ]),
  },
  {
    id: "cv_a7c1",
    title: "Fetch CDN status for asset pipeline",
    status: "Completed",
    errorType: null,
    startTime: "3/6/26, 1:30 AM",
    hoursAgo: 12,
    cost: 0.007,
    tokens: 2260,
    tree: agentSpan("acrtest-net-img-20260717", 3300, [
      modelSpan("gpt-35-turbo", 1900, 1980),
      toolSpan("rest-api-connector", 800, "GET /status · 200 ok"),
    ]),
  },
  {
    id: "cv_c934",
    title: "Validate expense schema before submit",
    status: "Failed",
    errorType: "SchemaValidation",
    startTime: "3/5/26, 11:48 AM",
    hoursAgo: 26,
    cost: 0.01,
    tokens: 3020,
    tree: agentSpan(
      "luffy-travel-approver-002",
      4720,
      [
        modelSpan("gpt4o-prod-eastus2", 2400, 2560),
        toolSpan("rest-api-connector", 1600, "POST /expenses · 422 invalid field", "error"),
      ],
      "error",
    ),
  },
  {
    id: "cv_2f6a",
    title: "Batch transcode + checksum verification",
    status: "Completed",
    errorType: null,
    startTime: "3/4/26, 3:10 PM",
    hoursAgo: 48,
    cost: 0.013,
    tokens: 3680,
    tree: agentSpan("acrtest-py-bzip-20260717", 5120, [
      modelSpan("llama-3-70b", 2600, 2380),
      toolSpan("code-interpreter", 1400, "ffmpeg batch · ok"),
      toolSpan("calculator", 220, "checksum match"),
    ]),
  },
  {
    id: "cv_9ab5",
    title: "Pull linked work items for release notes",
    status: "Failed",
    errorType: "Timeout",
    startTime: "3/6/26, 6:00 AM",
    hoursAgo: 8,
    cost: 0.016,
    tokens: 4210,
    tree: agentSpan(
      "faos-ado-memory-agent",
      15200,
      [
        modelSpan("gpt4o-mini", 1700, 1900),
        toolSpan("rest-api-connector", 13100, "GET /workitems?rel · gateway timeout", "error"),
      ],
      "error",
    ),
  },
  {
    id: "cv_3d71",
    title: "Confirm visa requirement for layover",
    status: "Completed",
    errorType: null,
    startTime: "3/4/26, 10:20 PM",
    hoursAgo: 40,
    cost: 0.008,
    tokens: 2900,
    tree: agentSpan("luffy-travel-approver-002", 3520, [
      modelSpan("gpt4o-prod-eastus2", 2300, 2680),
      toolSpan("knowledge-base-search", 560, "policy corpus · 4 hits"),
    ]),
  },
]

export const parentTraces: ParentTrace[] = seeds.map((seed) => {
  const { agents, tools, models } = collect(seed.tree)
  return {
    id: seed.id,
    title: seed.title,
    entryAgent: seed.tree.name,
    status: seed.status,
    errorType: seed.errorType,
    startTime: seed.startTime,
    hoursAgo: seed.hoursAgo,
    durationMs: seed.tree.durationMs,
    tokens: seed.tokens,
    cost: seed.cost,
    agents,
    tools,
    models,
    tree: seed.tree,
  }
})

export function spanCountOf(tree: SpanNode): number {
  let count = 0
  const walk = (node: SpanNode) => {
    count += 1
    node.children?.forEach(walk)
  }
  walk(tree)
  return count
}

/* ------------------------------- filtering -------------------------------- */

function withinWindow(hoursAgo: number, windowId: string): boolean {
  if (windowId === "yesterday") return hoursAgo >= 24 && hoursAgo <= 48
  const win = traceWindows.find((w) => w.id === windowId)
  if (!win) return true
  return hoursAgo <= win.hours
}

export function filterTraces(traces: ParentTrace[], filters: TraceFilters): ParentTrace[] {
  return traces.filter((trace) => {
    if (filters.agent && !trace.agents.includes(filters.agent)) return false
    if (filters.tool && !trace.tools.includes(filters.tool)) return false
    if (filters.model && !trace.models.includes(filters.model)) return false
    if (filters.status && trace.status !== filters.status) return false
    if (filters.errorType && trace.errorType !== filters.errorType) return false
    const seconds = trace.durationMs / 1000
    if (filters.latencyMin != null && seconds < filters.latencyMin) return false
    if (filters.latencyMax != null && seconds > filters.latencyMax) return false
    if (!withinWindow(trace.hoursAgo, filters.timeWindow)) return false
    return true
  })
}

export function activeFilterCount(filters: TraceFilters): number {
  let count = 0
  if (filters.agent) count += 1
  if (filters.tool) count += 1
  if (filters.model) count += 1
  if (filters.status) count += 1
  if (filters.errorType) count += 1
  if (filters.latencyMin != null) count += 1
  if (filters.latencyMax != null) count += 1
  return count
}

/* ------------------------- KQL <-> filters (2-way) ------------------------ */

function windowToAgo(windowId: string): string {
  if (windowId === "yesterday") return "startofday(ago(1d)) .. startofday(now())"
  const win = traceWindows.find((w) => w.id === windowId)
  return win ? `ago(${win.id})` : "ago(7d)"
}

export function filtersToKql(filters: TraceFilters): string {
  const lines: string[] = ["Traces"]
  if (filters.timeWindow === "yesterday") {
    lines.push(`| where Timestamp between (${windowToAgo(filters.timeWindow)})`)
  } else {
    lines.push(`| where Timestamp > ${windowToAgo(filters.timeWindow)}`)
  }
  if (filters.status) lines.push(`| where Status == "${filters.status}"`)
  if (filters.errorType) lines.push(`| where ErrorType == "${filters.errorType}"`)
  if (filters.latencyMin != null) lines.push(`| where DurationMs > ${Math.round(filters.latencyMin * 1000)}`)
  if (filters.latencyMax != null) lines.push(`| where DurationMs < ${Math.round(filters.latencyMax * 1000)}`)
  if (filters.agent) lines.push(`| where Agent == "${filters.agent}"`)
  if (filters.tool) lines.push(`| where Tool == "${filters.tool}"`)
  if (filters.model) lines.push(`| where Model == "${filters.model}"`)
  return lines.join("\n")
}

/** Parse a KQL string back into a filter set. Unknown clauses are ignored. */
export function kqlToFilters(kql: string): TraceFilters {
  const filters: TraceFilters = { ...emptyTraceFilters }
  let sawWindow = false

  const statusMatch = kql.match(/Status\s*==\s*"([^"]+)"/i)
  if (statusMatch && (traceStatuses as string[]).includes(statusMatch[1])) {
    filters.status = statusMatch[1] as TraceStatus
  }
  const errorMatch = kql.match(/ErrorType\s*==\s*"([^"]+)"/i)
  if (errorMatch && (errorTypes as readonly string[]).includes(errorMatch[1])) {
    filters.errorType = errorMatch[1] as ErrorType
  }
  const gtMatch = kql.match(/DurationMs\s*>\s*(\d+)/i)
  if (gtMatch) filters.latencyMin = Number(gtMatch[1]) / 1000
  const ltMatch = kql.match(/DurationMs\s*<\s*(\d+)/i)
  if (ltMatch) filters.latencyMax = Number(ltMatch[1]) / 1000

  const agentMatch = kql.match(/Agent\s*==\s*"([^"]+)"/i)
  if (agentMatch) filters.agent = agentMatch[1]
  const toolMatch = kql.match(/Tool\s*==\s*"([^"]+)"/i)
  if (toolMatch) filters.tool = toolMatch[1]
  const modelMatch = kql.match(/Model\s*==\s*"([^"]+)"/i)
  if (modelMatch) filters.model = modelMatch[1]

  if (/Timestamp\s+between/i.test(kql) && /startofday/i.test(kql)) {
    filters.timeWindow = "yesterday"
    sawWindow = true
  } else {
    const agoMatch = kql.match(/ago\((\d+[hd])\)/i)
    if (agoMatch) {
      const id = agoMatch[1].toLowerCase()
      if (traceWindows.some((w) => w.id === id)) {
        filters.timeWindow = id
        sawWindow = true
      }
    }
  }
  if (!sawWindow) filters.timeWindow = "7d"
  return filters
}

/** True when a KQL string yields at least one recognized clause. */
export function isParseableKql(kql: string): boolean {
  return /Status\s*==|ErrorType\s*==|DurationMs\s*[<>]|Agent\s*==|Tool\s*==|Model\s*==|Timestamp\s*(>|between)/i.test(kql)
}

/* --------------------------- natural language ----------------------------- */

/** Best-effort translation of an English prompt into a partial filter set. */
export function parseNaturalLanguage(text: string): Partial<TraceFilters> {
  const q = text.toLowerCase()
  const out: Partial<TraceFilters> = {}

  if (/\bfail(ed|ing|ure)?\b|\berror(s|ed)?\b|\bbroke/.test(q)) out.status = "Failed"
  else if (/\bcomplet|success|succeed|passed\b/.test(q)) out.status = "Completed"
  else if (/\brunning\b|in progress|in-progress|still going/.test(q)) out.status = "Running"

  // latency: "over 5 seconds", "> 5s", "slower than 5", "longer than 5 sec"
  const over = q.match(/(?:over|above|slower than|longer than|more than|greater than|>)\s*(\d+(?:\.\d+)?)\s*(?:s\b|sec|second)/)
  if (over) out.latencyMin = Number(over[1])
  const under = q.match(/(?:under|below|faster than|less than|shorter than|<)\s*(\d+(?:\.\d+)?)\s*(?:s\b|sec|second)/)
  if (under) out.latencyMax = Number(under[1])

  if (/yesterday/.test(q)) out.timeWindow = "yesterday"
  else if (/today|last 24|past 24|past day|last day/.test(q)) out.timeWindow = "24h"
  else if (/last hour|past hour|last 1h|past 1h/.test(q)) out.timeWindow = "1h"
  else if (/last 7|past 7|this week|last week/.test(q)) out.timeWindow = "7d"
  else if (/last 30|past 30|this month|last month/.test(q)) out.timeWindow = "30d"

  if (/time ?out/.test(q)) out.errorType = "Timeout"
  else if (/rate ?limit|throttl|429/.test(q)) out.errorType = "RateLimit"
  else if (/tool error|tool failure|exit code/.test(q)) out.errorType = "ToolError"
  else if (/groundedness|hallucinat/.test(q)) out.errorType = "Groundedness"
  else if (/schema|validation|invalid field/.test(q)) out.errorType = "SchemaValidation"

  const agent = traceAgents.find((a) => q.includes(a.toLowerCase()))
  if (agent) out.agent = agent
  const tool = traceTools.find((t) => q.includes(t.toLowerCase()))
  if (tool) out.tool = tool
  const model = traceModels.find((m) => q.includes(m.toLowerCase()))
  if (model) out.model = model

  // If an error type was named, it implies a failed run.
  if (out.errorType && !out.status) out.status = "Failed"

  return out
}

/* ------------------------------ query recipes ----------------------------- */

export interface QueryRecipe {
  id: string
  label: string
  kind: "saved" | "suggested"
  filters: Partial<TraceFilters>
}

export const queryRecipes: QueryRecipe[] = [
  { id: "r-failed-24h", label: "Failed traces · last 24h", kind: "saved", filters: { status: "Failed", timeWindow: "24h" } },
  { id: "r-slow", label: "Slow runs > 5s", kind: "saved", filters: { latencyMin: 5, timeWindow: "7d" } },
  { id: "r-prod-model", label: "gpt4o-prod-eastus2 traffic", kind: "saved", filters: { model: "gpt4o-prod-eastus2" } },
  { id: "r-timeouts", label: "Timeouts this week", kind: "suggested", filters: { errorType: "Timeout", timeWindow: "7d" } },
  { id: "r-tool-errors", label: "Tool errors", kind: "suggested", filters: { errorType: "ToolError", timeWindow: "30d" } },
  { id: "r-kb", label: "knowledge-base-search calls", kind: "suggested", filters: { tool: "knowledge-base-search" } },
  { id: "r-yesterday-fail", label: "Yesterday's failures", kind: "suggested", filters: { status: "Failed", timeWindow: "yesterday" } },
]

/* --------------------------- entry-point hand-offs ------------------------ */

export interface TraceQueryInit {
  /** Human-readable provenance shown in the explorer banner. */
  source: string
  filters: Partial<TraceFilters>
}

const metricToWindow = (window: TimeWindow): string => (window === "custom" ? "7d" : window)

/** Build an explorer hand-off from a KPI trend view. */
export function initFromMetric(metricId: MetricId, window: TimeWindow, trend: TrendFilters): TraceQueryInit {
  const filters: Partial<TraceFilters> = {
    timeWindow: metricToWindow(window),
  }
  if (trend.agent) filters.agent = trend.agent
  if (trend.tool) filters.tool = trend.tool
  if (trend.model) filters.model = trend.model
  // Error-rate trends naturally investigate failed runs.
  if (metricId === "errorRate") filters.status = "Failed"
  return { source: `${metricDefs[metricId].label} trend`, filters }
}

const categoryToFilters: Record<Insight["category"], Partial<TraceFilters>> = {
  "Invocation failure": { status: "Failed" },
  Latency: { latencyMin: 5 },
  "Output quality": { errorType: "Groundedness", status: "Failed" },
  Cost: {},
}

/** Build an explorer hand-off from an insight card. */
export function initFromInsight(insight: Insight): TraceQueryInit {
  const filters: Partial<TraceFilters> = {
    timeWindow: "7d",
    ...categoryToFilters[insight.category],
  }
  // Pin to a single affected agent when the insight names exactly one that we
  // can filter on; multi-agent insights stay fleet-wide.
  const named = insight.affectedAgents.find((name) => traceAgents.includes(name))
  if (insight.affectedAgents.length === 1 && named) filters.agent = named
  return { source: `Insight · ${insight.title}`, filters }
}
