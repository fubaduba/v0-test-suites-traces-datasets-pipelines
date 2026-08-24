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
  coverage: { tracing: boolean; evals: boolean; criteria: boolean }
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
    coverage: { tracing: true, evals: true, criteria: true },
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
    coverage: { tracing: true, evals: true, criteria: false },
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
    coverage: { tracing: true, evals: true, criteria: true },
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
    coverage: { tracing: true, evals: false, criteria: false },
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
    coverage: { tracing: true, evals: true, criteria: true },
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
    coverage: { tracing: false, evals: false, criteria: false },
    drawerContext: "No telemetry connected. Enable tracing to populate the Monitor tab for this agent.",
  },
  {
    id: "acrtest-py-img-20260717",
    name: "acrtest-py-img-20260717",
    status: "healthy",
    attention: 41,
    attentionWhy: "Error rate within baseline · no success criteria defined",
    invocations: 4410,
    errorRate: 1.4,
    taskCompletion: null,
    qualityTrend: [80, 79, 79, 78, 77, 77, 76],
    qualityDelta: -3.2,
    p95: 2890,
    cost: 12.8,
    lastDeployment: "Aug 20, 16:02",
    version: "v4",
    coverage: { tracing: true, evals: false, criteria: false },
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
    coverage: { tracing: true, evals: false, criteria: false },
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
    coverage: { tracing: true, evals: false, criteria: false },
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
    coverage: { tracing: true, evals: false, criteria: false },
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
    coverage: { tracing: false, evals: false, criteria: false },
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
    coverage: { tracing: true, evals: true, criteria: false },
    drawerContext: "Opens agent Monitor tab with context: timeframe 24h · no active findings",
  },
]

export type InsightSeverity = "critical" | "warning" | "info"
export type InsightState = "Open" | "Resolved" | "Recurred"

export interface Insight {
  id: string
  severity: InsightSeverity
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
  { id: "criteria", label: "9 agents without success criteria", action: "Define" },
  { id: "stale", label: "2 agents stale >24h", action: "Diagnose" },
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

export const suggestedAlerts = [
  "Error rate spike",
  "Eval score drop",
  "Cost anomaly",
  "Quota exhaustion",
  "Telemetry stale",
]
