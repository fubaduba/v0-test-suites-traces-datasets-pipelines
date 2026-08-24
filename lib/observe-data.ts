export type AgentStatus = "healthy" | "attention" | "critical" | "unmonitored"

export interface FleetAgent {
  id: string
  name: string
  status: AgentStatus
  attention: number // 0-100 rank score
  attentionWhy: string
  invocations: number
  errorRate: number | null
  taskCompletion: number | null
  qualityTrend: number[]
  qualityDelta: number | null
  p95: number
  cost: number
  lastDeployment: string
  version: string
  coverage: { tracing: boolean; evals: boolean }
  drawerContext: string
}

export const fleetAgents: FleetAgent[] = [
  {
    id: "luffy-travel-approver-002",
    name: "luffy-travel-approver-002",
    status: "critical",
    attention: 96,
    attentionWhy: "Groundedness −9 pts · 38% of fleet cost · shared deployment gpt4o-prod-eastus2",
    invocations: 48210,
    errorRate: 4.9,
    taskCompletion: 71.4,
    qualityTrend: [82, 81, 80, 78, 74, 71, 69],
    qualityDelta: -9.1,
    p95: 4820,
    cost: 156.4,
    lastDeployment: "Aug 22, 14:10",
    version: "v17",
    coverage: { tracing: true, evals: true },
    drawerContext:
      "Opens agent Monitor tab with context: timeframe 24h · filter: groundedness regression · suspected cause: gpt4o-prod-eastus2",
  },
  {
    id: "faos-ado-memory-agent",
    name: "faos-ado-memory-agent",
    status: "attention",
    attention: 88,
    attentionWhy: "22 invocations failed before spans emitted · recurring auth misconfiguration",
    invocations: 12904,
    errorRate: 6.2,
    taskCompletion: 64.8,
    qualityTrend: [78, 77, 76, 74, 70, 68, 67],
    qualityDelta: -7.4,
    p95: 3910,
    cost: 61.2,
    lastDeployment: "Aug 21, 09:02",
    version: "v9",
    coverage: { tracing: true, evals: true },
    drawerContext:
      "Opens agent Monitor tab with context: timeframe 24h · filter: invocation failures without spans · suspected cause: auth misconfiguration",
  },
  {
    id: "acrtest-py-bzip-20260717",
    name: "acrtest-py-bzip-20260717",
    status: "attention",
    attention: 74,
    attentionWhy: "Groundedness −6 pts · shares deployment gpt4o-prod-eastus2",
    invocations: 8640,
    errorRate: 2.8,
    taskCompletion: 80.2,
    qualityTrend: [86, 85, 85, 83, 81, 80, 80],
    qualityDelta: -6.0,
    p95: 2240,
    cost: 38.9,
    lastDeployment: "Aug 22, 14:10",
    version: "v6",
    coverage: { tracing: true, evals: true },
    drawerContext:
      "Opens agent Monitor tab with context: timeframe 24h · filter: groundedness regression · suspected cause: gpt4o-prod-eastus2",
  },
  {
    id: "acrtest-net-img-20260717",
    name: "acrtest-net-img-20260717",
    status: "attention",
    // token anomaly — see insight-tokens
    attention: 69,
    attentionWhy: "Tokens/run 4.1× baseline since v12 · +$61/day",
    invocations: 6120,
    errorRate: 1.9,
    taskCompletion: null,
    qualityTrend: [74, 74, 75, 75, 74, 74, 73],
    qualityDelta: -0.8,
    p95: 5310,
    cost: 84.7,
    lastDeployment: "Aug 23, 18:44",
    version: "v12",
    coverage: { tracing: true, evals: false },
    drawerContext:
      "Opens agent Monitor tab with context: timeframe 24h · filter: token consumption anomaly · suspected cause: tool call retry loop",
  },
  {
    id: "math-prompt-agent",
    name: "math-prompt-agent",
    status: "healthy",
    attention: 31,
    attentionWhy: "P95 latency regression resolved Aug 23 after prompt rollback",
    invocations: 15330,
    errorRate: 0.7,
    taskCompletion: 92.6,
    qualityTrend: [88, 86, 83, 82, 88, 91, 92],
    qualityDelta: 3.9,
    p95: 1180,
    cost: 21.4,
    lastDeployment: "Aug 23, 07:15",
    version: "v22",
    coverage: { tracing: true, evals: true },
    drawerContext:
      "Opens agent Monitor tab with context: timeframe 24h · filter: latency recovery · suspected cause: prompt v21 (rolled back)",
  },
  {
    id: "testprompt727",
    name: "testprompt727",
    status: "unmonitored",
    attention: 0,
    attentionWhy: "No signal — tracing not configured",
    invocations: 0,
    errorRate: null,
    taskCompletion: null,
    qualityTrend: [],
    qualityDelta: null,
    p95: 0,
    cost: 0,
    lastDeployment: "Aug 12, 11:30",
    version: "v2",
    coverage: { tracing: false, evals: false },
    drawerContext: "No telemetry connected. Enable tracing to populate the Monitor tab for this agent.",
  },
  {
    id: "acrtest-py-img-20260717",
    name: "acrtest-py-img-20260717",
    status: "healthy",
    attention: 41,
    attentionWhy: "Error rate within baseline · no evals configured",
    invocations: 4410,
    errorRate: 1.4,
    taskCompletion: null,
    qualityTrend: [80, 79, 79, 78, 77, 77, 76],
    qualityDelta: -3.2,
    p95: 2890,
    cost: 12.8,
    lastDeployment: "Aug 20, 16:02",
    version: "v4",
    coverage: { tracing: true, evals: false },
    drawerContext:
      "Opens agent Monitor tab with context: timeframe 24h · filter: coverage gaps · no active findings",
  },
  {
    id: "acrtest-py-rbzip-20260717",
    name: "acrtest-py-rbzip-20260717",
    status: "healthy",
    attention: 22,
    attentionWhy: "Stable across all monitored signals",
    invocations: 3220,
    errorRate: 0.9,
    taskCompletion: null,
    qualityTrend: [84, 84, 85, 85, 84, 85, 85],
    qualityDelta: 0.6,
    p95: 1520,
    cost: 9.6,
    lastDeployment: "Aug 19, 10:41",
    version: "v3",
    coverage: { tracing: true, evals: false },
    drawerContext: "Opens agent Monitor tab with context: timeframe 24h · no active findings",
  },
  {
    id: "acrtest-net-bzip-20260717",
    name: "acrtest-net-bzip-20260717",
    status: "healthy",
    attention: 18,
    attentionWhy: "Stable across all monitored signals",
    invocations: 2870,
    errorRate: 0.6,
    taskCompletion: null,
    qualityTrend: [83, 83, 84, 84, 84, 84, 85],
    qualityDelta: 1.1,
    p95: 1340,
    cost: 8.2,
    lastDeployment: "Aug 18, 13:20",
    version: "v3",
    coverage: { tracing: true, evals: false },
    drawerContext: "Opens agent Monitor tab with context: timeframe 24h · no active findings",
  },
  {
    id: "acrtest-net-rbzip-20260717",
    name: "acrtest-net-rbzip-20260717",
    status: "healthy",
    attention: 14,
    attentionWhy: "Stable across all monitored signals",
    invocations: 1940,
    errorRate: 0.5,
    taskCompletion: null,
    qualityTrend: [85, 85, 85, 86, 86, 86, 86],
    qualityDelta: 0.9,
    p95: 1210,
    cost: 6.4,
    lastDeployment: "Aug 18, 13:20",
    version: "v2",
    coverage: { tracing: true, evals: false },
    drawerContext: "Opens agent Monitor tab with context: timeframe 24h · no active findings",
  },
  {
    id: "acrtest-py-bzip-depmiss-20260717",
    name: "acrtest-py-bzip-depmiss-20260717",
    status: "unmonitored",
    attention: 0,
    attentionWhy: "Telemetry stale — last span 31h ago",
    invocations: 210,
    errorRate: null,
    taskCompletion: null,
    qualityTrend: [],
    qualityDelta: null,
    p95: 0,
    cost: 1.1,
    lastDeployment: "Aug 15, 08:55",
    version: "v1",
    coverage: { tracing: false, evals: false },
    drawerContext: "Telemetry stale >24h. Diagnose the exporter to restore Monitor data.",
  },
  {
    id: "faos-ado-skills-agent",
    name: "faos-ado-skills-agent",
    status: "healthy",
    attention: 11,
    attentionWhy: "Stable across all monitored signals",
    invocations: 5680,
    errorRate: 0.4,
    taskCompletion: 89.1,
    qualityTrend: [87, 87, 88, 88, 88, 89, 89],
    qualityDelta: 1.4,
    p95: 1490,
    cost: 11.3,
    lastDeployment: "Aug 21, 09:02",
    version: "v8",
    coverage: { tracing: true, evals: true },
    drawerContext: "Opens agent Monitor tab with context: timeframe 24h · no active findings",
  },
]

export type InsightSeverity = "critical" | "warning" | "info"
export type InsightState = "Open" | "Resolved" | "Recurred"

/** Mirrors the per-agent insight taxonomy so fleet and agent views stay consistent. */
export type InsightCategory = "Output quality" | "Cost" | "Invocation failure" | "Latency"

export const insightCategories: InsightCategory[] = [
  "Output quality",
  "Cost",
  "Invocation failure",
  "Latency",
]

export interface Insight {
  id: string
  severity: InsightSeverity
  category: InsightCategory
  title: string
  state: InsightState
  stateTooltip?: string
  affectedAgents: string[]
  evidence: string
  impact: string
  customerImpact: string
  likelyCause: string
  alertPrefill: {
    metric: string
    scope: string
    threshold: string
    channel: string
  }
}

export const insights: Insight[] = [
  {
    id: "insight-groundedness",
    severity: "critical",
    category: "Output quality",
    title: "Groundedness regression across 3 agents sharing deployment gpt4o-prod-eastus2",
    state: "Open",
    affectedAgents: ["luffy-travel-approver-002", "faos-ado-memory-agent", "acrtest-py-bzip-20260717"],
    evidence: "34 failing eval runs, 12 linked traces · sampled at 10%",
    impact: "groundedness −9 pts since Aug 22, coincides with model version update",
    customerImpact: "~1,840 sessions in affected flows",
    likelyCause:
      "shared model deployment updated Aug 22, 14:10 UTC (cross-agent cluster — not isolated)",
    alertPrefill: {
      metric: "groundedness",
      scope: "3 affected agents",
      threshold: "−5 pts vs baseline",
      channel: "Teams",
    },
  },
  {
    id: "insight-tokens",
    severity: "warning",
    category: "Cost",
    title: "Token consumption anomaly: acrtest-net-img-20260717",
    state: "Open",
    affectedAgents: ["acrtest-net-img-20260717"],
    evidence: "18 traces with >40 tool spans per run · sampled at 25%",
    impact: "4.1× baseline tokens/run since last deployment (v12) · +$61/day",
    customerImpact: "~260 sessions with elevated latency",
    likelyCause: "retry loop in tool call",
    alertPrefill: {
      metric: "tokens per run",
      scope: "1 affected agent",
      threshold: "2× baseline",
      channel: "Teams",
    },
  },
  {
    id: "insight-invocation",
    severity: "warning",
    category: "Invocation failure",
    title: "Invocation failures before traces exist: faos-ado-memory-agent",
    state: "Recurred",
    stateTooltip: "Recurred Aug 24 · previously seen Aug 11 · 2 occurrences in 30d",
    affectedAgents: ["faos-ado-memory-agent"],
    evidence: "no trace evidence — detected from invocation telemetry",
    impact: "22 failed invocations with no spans",
    customerImpact: "~22 sessions failed at entry point",
    likelyCause: "auth misconfiguration",
    alertPrefill: {
      metric: "invocation failure rate",
      scope: "1 affected agent",
      threshold: "> 10 failures / hour",
      channel: "Teams",
    },
  },
  {
    id: "insight-latency",
    severity: "info",
    category: "Latency",
    title: "P95 latency regression: math-prompt-agent",
    state: "Resolved",
    stateTooltip: "Resolved Aug 23 · re-evaluated · no recurrence in 24h",
    affectedAgents: ["math-prompt-agent"],
    evidence: "9 traces above 6s P95 before rollback",
    impact: "resolved Aug 23 after prompt rollback — health recovered ✓",
    customerImpact: "~140 sessions affected before rollback",
    likelyCause: "prompt v21 added an extra retrieval hop",
    alertPrefill: {
      metric: "P95 latency",
      scope: "1 affected agent",
      threshold: "> 3000 ms",
      channel: "Teams",
    },
  },
]

export interface ReadinessItem {
  id: string
  label: string
  action: string
}

export const readinessItems: ReadinessItem[] = [
  { id: "tracing", label: "testprompt727: tracing not configured", action: "Connect" },
  { id: "evals", label: "8 agents without evals", action: "Enable" },
  { id: "stale", label: "2 agents stale >24h", action: "Diagnose" },
  {
    id: "eval-failed",
    label: "Scheduled eval failed: faos-ado-memory-agent — quality data stale",
    action: "Diagnose",
  },
]

export interface FiredAlert {
  id: string
  severity: InsightSeverity
  title: string
  meta: string
}

export const firedAlerts: FiredAlert[] = [
  {
    id: "alert-1",
    severity: "critical",
    title: "Eval score drop · luffy-travel-approver-002",
    meta: "Fired 2h ago · Teams",
  },
  {
    id: "alert-2",
    severity: "warning",
    title: "Cost anomaly · project daily spend",
    meta: "Fired 5h ago · Teams, Email",
  },
  {
    id: "alert-3",
    severity: "warning",
    title: "Telemetry stale · acrtest-py-bzip-depmiss-20260717",
    meta: "Fired 9h ago · Email",
  },
]

/* ---------------------------------------------------------------------------
 * Quality trends module (opens from the Quality trend KPI tile)
 * ------------------------------------------------------------------------- */

export type Evaluator = "Groundedness" | "Task adherence" | "Relevance" | "Safety"

/** Only Groundedness is instrumented today; the rest render an honest empty state. */
export const evaluators: { name: Evaluator; hasData: boolean }[] = [
  { name: "Groundedness", hasData: true },
  { name: "Task adherence", hasData: false },
  { name: "Relevance", hasData: false },
  { name: "Safety", hasData: false },
]

/** The four agents that actually have evaluations enabled. */
export const qualitySeriesAgents = [
  { key: "luffy", name: "luffy-travel-approver-002", color: "var(--chart-1)" },
  { key: "faos", name: "faos-ado-memory-agent", color: "var(--chart-2)" },
  { key: "bzip", name: "acrtest-py-bzip-20260717", color: "var(--chart-4)" },
  { key: "math", name: "math-prompt-agent", color: "var(--chart-5)" },
] as const

export const qualityRegressionMarker = "Aug 22"
export const qualityRegressionLabel = "gpt4o-prod-eastus2 updated"

export interface QualityPoint {
  day: string
  luffy: number
  faos: number
  bzip: number
  math: number
}

/** 14 days of groundedness. Three lines step down after the Aug 22 marker. */
export const qualityTrendSeries: QualityPoint[] = [
  { day: "Aug 11", luffy: 82, faos: 76, bzip: 86, math: 90 },
  { day: "Aug 12", luffy: 82, faos: 77, bzip: 86, math: 90 },
  { day: "Aug 13", luffy: 83, faos: 77, bzip: 85, math: 91 },
  { day: "Aug 14", luffy: 83, faos: 77, bzip: 86, math: 91 },
  { day: "Aug 15", luffy: 82, faos: 76, bzip: 86, math: 90 },
  { day: "Aug 16", luffy: 82, faos: 76, bzip: 86, math: 90 },
  { day: "Aug 17", luffy: 83, faos: 77, bzip: 86, math: 91 },
  { day: "Aug 18", luffy: 83, faos: 77, bzip: 85, math: 91 },
  { day: "Aug 19", luffy: 83, faos: 77, bzip: 86, math: 91 },
  { day: "Aug 20", luffy: 82, faos: 76, bzip: 86, math: 90 },
  { day: "Aug 21", luffy: 82, faos: 76, bzip: 86, math: 90 },
  { day: "Aug 22", luffy: 78, faos: 72, bzip: 82, math: 91 },
  { day: "Aug 23", luffy: 74, faos: 69, bzip: 80, math: 90 },
  { day: "Aug 24", luffy: 73, faos: 67, bzip: 80, math: 91 },
]

/* ---------------------------------------------------------------------------
 * Evaluations panel (right rail)
 * ------------------------------------------------------------------------- */

export interface EvaluationSetup {
  id: string
  agent: string
  mode: string
  lastRun: string
  failed?: boolean
}

export const evaluationSummary = "Continuous: 4 agents · Scheduled: 2 agents · Fleet default: off"

export const evaluationSetups: EvaluationSetup[] = [
  {
    id: "eval-luffy",
    agent: "luffy-travel-approver-002",
    mode: "Continuous · 10% sampling",
    lastRun: "last run 14m ago",
  },
  {
    id: "eval-faos",
    agent: "faos-ado-memory-agent",
    mode: "Scheduled daily",
    lastRun: "last run FAILED Aug 23",
    failed: true,
  },
  {
    id: "eval-bzip",
    agent: "acrtest-py-bzip-20260717",
    mode: "Continuous · 10%",
    lastRun: "last run 22m ago",
  },
  {
    id: "eval-math",
    agent: "math-prompt-agent",
    mode: "Scheduled daily",
    lastRun: "last run 6h ago",
  },
]

/* ---------------------------------------------------------------------------
 * Hosting (drawer tab) — vCPU / GiB hours, last 12 buckets
 * ------------------------------------------------------------------------- */

export const hostingVcpuHours = [12, 13, 12, 14, 15, 14, 16, 18, 17, 19, 21, 22]
export const hostingGibHours = [48, 50, 49, 52, 55, 54, 58, 63, 61, 66, 71, 74]

export const suggestedAlerts = [
  "Error rate spike",
  "Eval score drop",
  "Cost anomaly",
  "Quota exhaustion",
  "Telemetry stale",
]
