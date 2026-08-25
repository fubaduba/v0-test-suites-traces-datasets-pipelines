export type AgentStatus = "healthy" | "attention" | "critical" | "unmonitored"

export type AgentEnvironment = "prod" | "staging" | "dev"

export const agentEnvironments: AgentEnvironment[] = ["prod", "staging", "dev"]

export type AttentionFactorKey = "regressions" | "errors" | "cost" | "capacity"

/**
 * The attention model. Weights are fixed across the fleet and sum to 1 — only
 * the per-agent inputs vary. Exported so the UI can show the weight next to
 * each factor rather than presenting an unexplained composite.
 */
export const attentionFactorMeta: { key: AttentionFactorKey; label: string; weight: number }[] = [
  { key: "regressions", label: "Active regressions", weight: 0.4 },
  { key: "errors", label: "Error contribution", weight: 0.3 },
  { key: "cost", label: "Cost outlier", weight: 0.15 },
  { key: "capacity", label: "Capacity risk", weight: 0.15 },
]

export interface AttentionFactor {
  /** 0-100 severity for this factor alone. */
  score: number
  /** The measured value behind the score, in human terms. */
  value: string
}

export type AttentionFactors = Record<AttentionFactorKey, AttentionFactor>

/**
 * The composite is always computed from the factors, never stored, so the score
 * in the table and the breakdown in the hover card can never disagree.
 * `null` factors mean no telemetry — the agent is unscored, not scored zero.
 */
export function computeAttention(factors: AttentionFactors | null): number | null {
  if (!factors) return null
  return Math.round(
    attentionFactorMeta.reduce((total, factor) => total + factor.weight * factors[factor.key].score, 0),
  )
}

/** Weighted points a single factor contributes to the composite. */
export function factorContribution(factors: AttentionFactors, key: AttentionFactorKey): number {
  const meta = attentionFactorMeta.find((item) => item.key === key)
  return meta ? meta.weight * factors[key].score : 0
}

export interface FleetAgent {
  id: string
  name: string
  status: AgentStatus
  /** Derived from attentionFactors. `null` when the agent has no telemetry. */
  attention: number | null
  attentionFactors: AttentionFactors | null
  attentionWhy: string
  environment: AgentEnvironment
  tags: string[]
  invocations: number
  sessions: number
  errorRate: number | null
  taskCompletion: number | null
  qualityTrend: number[]
  qualityDelta: number | null
  // Cold start in ms. 0 means no telemetry, rendered as an em dash like p95.
  coldStart: number
  p95: number
  cost: number
  lastDeployment: string
  version: string
  coverage: { tracing: boolean; evals: boolean }
  drawerContext: string
}

const rawAgents: Omit<FleetAgent, "attention">[] = [
  {
    id: "luffy-travel-approver-002",
    name: "luffy-travel-approver-002",
    status: "critical",
    attentionFactors: {
      regressions: { score: 100, value: "Groundedness −9.1 pts over 7 days · 3 evals failing" },
      errors: { score: 95, value: "4.9% error rate · 2,362 failed runs" },
      cost: { score: 100, value: "$156.40 · 38% of fleet spend" },
      capacity: { score: 85, value: "gpt4o-prod-eastus2 at 92% of TPM quota" },
    },
    attentionWhy: "Groundedness −9 pts · 38% of fleet cost · shared deployment gpt4o-prod-eastus2",
    environment: "prod",
    tags: ["travel", "approvals", "gpt-4o"],
    invocations: 48210,
    sessions: 16070,
    errorRate: 4.9,
    taskCompletion: 71.4,
    qualityTrend: [82, 81, 80, 78, 74, 71, 69],
    qualityDelta: -9.1,
    coldStart: 890,
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
    attentionFactors: {
      regressions: { score: 90, value: "Groundedness −7.4 pts over 7 days · 2 evals failing" },
      errors: { score: 100, value: "6.2% error rate · 22 runs failed before spans emitted" },
      cost: { score: 70, value: "$61.20 · 15% of fleet spend" },
      capacity: { score: 75, value: "auth retry loop consuming 3.1× baseline quota" },
    },
    attentionWhy: "22 invocations failed before spans emitted · recurring auth misconfiguration",
    environment: "prod",
    tags: ["ado", "memory"],
    invocations: 12904,
    sessions: 4301,
    errorRate: 6.2,
    taskCompletion: 64.8,
    qualityTrend: [78, 77, 76, 74, 70, 68, 67],
    qualityDelta: -7.4,
    coldStart: 1240,
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
    attentionFactors: {
      regressions: { score: 90, value: "Groundedness −6.0 pts over 7 days · 1 eval failing" },
      errors: { score: 65, value: "2.8% error rate · 242 failed runs" },
      cost: { score: 62, value: "$38.90 · 9% of fleet spend" },
      capacity: { score: 60, value: "shares gpt4o-prod-eastus2 at 92% of TPM quota" },
    },
    attentionWhy: "Groundedness −6 pts · shares deployment gpt4o-prod-eastus2",
    environment: "staging",
    tags: ["acrtest", "python"],
    invocations: 8640,
    sessions: 2880,
    errorRate: 2.8,
    taskCompletion: 80.2,
    qualityTrend: [86, 85, 85, 83, 81, 80, 80],
    qualityDelta: -6.0,
    coldStart: 620,
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
    attentionFactors: {
      regressions: { score: 58, value: "Quality flat (−0.8 pts) · no evals configured" },
      errors: { score: 54, value: "1.9% error rate · 116 failed runs" },
      cost: { score: 100, value: "$84.70 · tokens/run 4.1× baseline since v12" },
      capacity: { score: 100, value: "tool retry loop · P95 5.31s against 6s timeout" },
    },
    attentionWhy: "Tokens/run 4.1× baseline since v12 · +$61/day",
    environment: "staging",
    tags: ["acrtest", "dotnet"],
    invocations: 6120,
    sessions: 2040,
    errorRate: 1.9,
    taskCompletion: null,
    qualityTrend: [74, 74, 75, 75, 74, 74, 73],
    qualityDelta: -0.8,
    coldStart: 1580,
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
    attentionFactors: {
      regressions: { score: 23, value: "Quality +3.9 pts · latency regression resolved Aug 23" },
      errors: { score: 19, value: "0.7% error rate · 107 failed runs" },
      cost: { score: 38, value: "$21.40 · 5% of fleet spend" },
      capacity: { score: 66, value: "highest invocation volume in fleet (15,330 runs)" },
    },
    attentionWhy: "P95 latency regression resolved Aug 23 after prompt rollback",
    environment: "prod",
    tags: ["math", "prompt"],
    invocations: 15330,
    sessions: 5110,
    errorRate: 0.7,
    taskCompletion: 92.6,
    qualityTrend: [88, 86, 83, 82, 88, 91, 92],
    qualityDelta: 3.9,
    coldStart: 310,
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
    // No telemetry: unscored rather than scored zero.
    attentionFactors: null,
    attentionWhy: "No signal — tracing not configured",
    environment: "dev",
    tags: ["sandbox"],
    invocations: 0,
    sessions: 0,
    errorRate: null,
    taskCompletion: null,
    qualityTrend: [],
    qualityDelta: null,
    coldStart: 0,
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
    attentionFactors: {
      regressions: { score: 47, value: "Quality −3.2 pts · no evals configured to confirm" },
      errors: { score: 32, value: "1.4% error rate · 62 failed runs" },
      cost: { score: 32, value: "$12.80 · 3% of fleet spend" },
      capacity: { score: 55, value: "P95 2.89s · within deployment headroom" },
    },
    attentionWhy: "Error rate within baseline · no evals configured",
    environment: "staging",
    tags: ["acrtest", "python"],
    invocations: 4410,
    sessions: 1470,
    errorRate: 1.4,
    taskCompletion: null,
    qualityTrend: [80, 79, 79, 78, 77, 77, 76],
    qualityDelta: -3.2,
    coldStart: 740,
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
    attentionFactors: {
      regressions: { score: 20, value: "Quality +0.6 pts · no active regression" },
      errors: { score: 18, value: "0.9% error rate · 29 failed runs" },
      cost: { score: 25, value: "$9.60 · 2% of fleet spend" },
      capacity: { score: 30, value: "P95 1.52s · within deployment headroom" },
    },
    attentionWhy: "Stable across all monitored signals",
    environment: "staging",
    tags: ["acrtest", "python"],
    invocations: 3220,
    sessions: 1073,
    errorRate: 0.9,
    taskCompletion: null,
    qualityTrend: [84, 84, 85, 85, 84, 85, 85],
    qualityDelta: 0.6,
    coldStart: 450,
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
    attentionFactors: {
      regressions: { score: 16, value: "Quality +1.1 pts · no active regression" },
      errors: { score: 14, value: "0.6% error rate · 17 failed runs" },
      cost: { score: 20, value: "$8.20 · 2% of fleet spend" },
      capacity: { score: 26, value: "P95 1.34s · within deployment headroom" },
    },
    attentionWhy: "Stable across all monitored signals",
    environment: "staging",
    tags: ["acrtest", "dotnet"],
    invocations: 2870,
    sessions: 957,
    errorRate: 0.6,
    taskCompletion: null,
    qualityTrend: [83, 83, 84, 84, 84, 84, 85],
    qualityDelta: 1.1,
    coldStart: 420,
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
    attentionFactors: {
      regressions: { score: 12, value: "Quality +0.9 pts · no active regression" },
      errors: { score: 11, value: "0.5% error rate · 10 failed runs" },
      cost: { score: 16, value: "$6.40 · 1% of fleet spend" },
      capacity: { score: 20, value: "P95 1.21s · within deployment headroom" },
    },
    attentionWhy: "Stable across all monitored signals",
    environment: "staging",
    tags: ["acrtest", "dotnet"],
    invocations: 1940,
    sessions: 647,
    errorRate: 0.5,
    taskCompletion: null,
    qualityTrend: [85, 85, 85, 86, 86, 86, 86],
    qualityDelta: 0.9,
    coldStart: 390,
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
    // Telemetry stale: unscored rather than scored zero.
    attentionFactors: null,
    attentionWhy: "Telemetry stale — last span 31h ago",
    environment: "dev",
    tags: ["acrtest", "python"],
    invocations: 210,
    sessions: 70,
    errorRate: null,
    taskCompletion: null,
    qualityTrend: [],
    qualityDelta: null,
    coldStart: 0,
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
    attentionFactors: {
      regressions: { score: 10, value: "Quality +1.4 pts · no active regression" },
      errors: { score: 9, value: "0.4% error rate · 23 failed runs" },
      cost: { score: 14, value: "$11.30 · 3% of fleet spend" },
      capacity: { score: 16, value: "P95 1.49s · within deployment headroom" },
    },
    attentionWhy: "Stable across all monitored signals",
    environment: "prod",
    tags: ["ado", "skills"],
    invocations: 5680,
    sessions: 1893,
    errorRate: 0.4,
    taskCompletion: 89.1,
    qualityTrend: [87, 87, 88, 88, 88, 89, 89],
    qualityDelta: 1.4,
    coldStart: 480,
    p95: 1490,
    cost: 11.3,
    lastDeployment: "Aug 21, 09:02",
    version: "v8",
    coverage: { tracing: true, evals: true },
    drawerContext: "Opens agent Monitor tab with context: timeframe 24h · no active findings",
  },
]

export const fleetAgents: FleetAgent[] = rawAgents.map((agent) => ({
  ...agent,
  attention: computeAttention(agent.attentionFactors),
}))

export interface FleetMetric {
  value: number
  deltaPct: number
}

// Fleet-wide volume. Both totals are summed from the agent rows so the KPI
// tile and the table can never disagree.
export const fleetVolume: { invocations: FleetMetric; sessions: FleetMetric } = {
  invocations: {
    value: fleetAgents.reduce((total, agent) => total + agent.invocations, 0),
    deltaPct: 12.4,
  },
  sessions: {
    value: fleetAgents.reduce((total, agent) => total + agent.sessions, 0),
    deltaPct: 8.1,
  },
}

// End-to-end duration across the fleet. Stored as explicit fleet-level figures
// rather than derived from each agent's `p95`: percentiles cannot be aggregated
// by averaging them, so a fleet P95 has to be measured, not computed here.
export const fleetLatency: { p50: FleetMetric; p95: FleetMetric } = {
  p50: { value: 1150, deltaPct: -3.2 },
  p95: { value: 4180, deltaPct: 14.6 },
}

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
