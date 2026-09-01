import type { AgentStatus } from "./observe-data"

/* ---------------------------------------------------------------------------
 * Shared fleet model — powers both the Tools and Models fleet dashboards.
 * One row shape and one KPI shape so the same dashboard renders both.
 * ------------------------------------------------------------------------- */

export interface FleetRow {
  id: string
  name: string
  kind: string // tool type / model family
  status: AgentStatus
  attention: number // 0-100 rank
  attentionWhy: string
  callVolume: number // calls / day
  failureRate: number | null // %
  p95: number // ms
  tokenCost: number // $ / day
  /** Call-volume trend (up = more throughput). Rendered as a sparkline. */
  volumeTrend: number[]
  volumeDelta: number | null // % vs 7-day baseline
  lastUsed: string
  coverage: { tracing: boolean; evals: boolean }
}

export interface FleetKpi {
  id: string
  name: string
  value: string
  sub?: string | string[]
  spark?: number[]
  tone?: "up" | "down" | "flat"
  warn?: boolean
  valueClassName?: string
}

export interface FleetStatusSummary {
  healthy: number
  attention: number
  critical: number
  unmonitored: number
}

/* ---------------------------------------------------------------------------
 * Tools fleet
 * ------------------------------------------------------------------------- */

export const toolsFleet: FleetRow[] = [
  {
    id: "sql-query",
    name: "sql-query",
    kind: "Data connector",
    status: "critical",
    attention: 94,
    attentionWhy: "Failure rate 11.4% since Aug 22 · timeouts against reporting replica · 41% of tool token cost",
    callVolume: 184300,
    failureRate: 11.4,
    p95: 5210,
    tokenCost: 118.2,
    volumeTrend: [162, 168, 171, 175, 179, 182, 184],
    volumeDelta: 6.4,
    lastUsed: "12s ago",
    coverage: { tracing: true, evals: true },
  },
  {
    id: "http-fetch",
    name: "http-fetch",
    kind: "HTTP tool",
    status: "attention",
    attention: 82,
    attentionWhy: "P95 latency +1.8s since v6 · ret/loop suspected in acrtest-net-img-20260717",
    callVolume: 96400,
    failureRate: 5.7,
    p95: 4120,
    tokenCost: 22.6,
    volumeTrend: [70, 74, 79, 83, 88, 92, 96],
    volumeDelta: 18.2,
    lastUsed: "4s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "vector-retrieval",
    name: "vector-retrieval",
    kind: "Retrieval",
    status: "attention",
    attention: 71,
    attentionWhy: "Groundedness-linked: recall dropped 6 pts after index rebuild Aug 21",
    callVolume: 142800,
    failureRate: 3.2,
    p95: 2280,
    tokenCost: 44.1,
    volumeTrend: [131, 134, 136, 138, 140, 141, 143],
    volumeDelta: 4.9,
    lastUsed: "2s ago",
    coverage: { tracing: true, evals: true },
  },
  {
    id: "web-search",
    name: "web-search",
    kind: "HTTP tool",
    status: "healthy",
    attention: 38,
    attentionWhy: "Within baseline across latency and failure rate",
    callVolume: 77900,
    failureRate: 1.9,
    p95: 1840,
    tokenCost: 18.4,
    volumeTrend: [72, 73, 74, 75, 76, 77, 78],
    volumeDelta: 3.1,
    lastUsed: "1s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "code-interpreter",
    name: "code-interpreter",
    kind: "Sandbox",
    status: "healthy",
    attention: 34,
    attentionWhy: "Stable · sandbox cold starts within SLO",
    callVolume: 41200,
    failureRate: 2.1,
    p95: 3020,
    tokenCost: 31.8,
    volumeTrend: [39, 39, 40, 40, 41, 41, 41],
    volumeDelta: 1.4,
    lastUsed: "8s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "email-send",
    name: "email-send",
    kind: "Action",
    status: "attention",
    attention: 63,
    attentionWhy: "3.8% failures on Graph API throttling · bursts at top of hour",
    callVolume: 12600,
    failureRate: 3.8,
    p95: 2460,
    tokenCost: 4.2,
    volumeTrend: [11, 11, 12, 12, 12, 12, 13],
    volumeDelta: 2.7,
    lastUsed: "31s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "calendar-lookup",
    name: "calendar-lookup",
    kind: "Action",
    status: "healthy",
    attention: 21,
    attentionWhy: "Stable across all monitored signals",
    callVolume: 28900,
    failureRate: 0.8,
    p95: 940,
    tokenCost: 3.1,
    volumeTrend: [27, 28, 28, 28, 29, 29, 29],
    volumeDelta: 1.1,
    lastUsed: "6s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "file-reader",
    name: "file-reader",
    kind: "Retrieval",
    status: "healthy",
    attention: 18,
    attentionWhy: "Stable · P95 well within budget",
    callVolume: 33400,
    failureRate: 1.2,
    p95: 1120,
    tokenCost: 6.7,
    volumeTrend: [31, 32, 32, 33, 33, 33, 33],
    volumeDelta: 0.9,
    lastUsed: "3s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "image-generate",
    name: "image-generate",
    kind: "Action",
    status: "unmonitored",
    attention: 0,
    attentionWhy: "No signal — tracing not configured for this tool",
    callVolume: 0,
    failureRate: null,
    p95: 0,
    tokenCost: 0,
    volumeTrend: [],
    volumeDelta: null,
    lastUsed: "unknown",
    coverage: { tracing: false, evals: false },
  },
  {
    id: "translate",
    name: "translate",
    kind: "Action",
    status: "healthy",
    attention: 14,
    attentionWhy: "Stable across all monitored signals",
    callVolume: 9800,
    failureRate: 0.6,
    p95: 780,
    tokenCost: 2.4,
    volumeTrend: [9, 9, 9, 10, 10, 10, 10],
    volumeDelta: 0.7,
    lastUsed: "44s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "calculator",
    name: "calculator",
    kind: "Function",
    status: "healthy",
    attention: 9,
    attentionWhy: "Deterministic · negligible failure surface",
    callVolume: 21500,
    failureRate: 0.1,
    p95: 120,
    tokenCost: 0.4,
    volumeTrend: [20, 20, 21, 21, 21, 21, 22],
    volumeDelta: 1.8,
    lastUsed: "5s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "ado-workitems",
    name: "ado-workitems",
    kind: "Action",
    status: "unmonitored",
    attention: 0,
    attentionWhy: "Telemetry stale — last span 27h ago",
    callVolume: 340,
    failureRate: null,
    p95: 0,
    tokenCost: 0.2,
    volumeTrend: [],
    volumeDelta: null,
    lastUsed: "27h ago",
    coverage: { tracing: false, evals: false },
  },
]

export const toolsStatusSummary: FleetStatusSummary = {
  healthy: 6,
  attention: 3,
  critical: 1,
  unmonitored: 2,
}

export const toolsKpis: FleetKpi[] = [
  {
    id: "call-volume",
    name: "Call volume",
    value: "693K",
    sub: "calls / day · +7.9% vs 7d",
    spark: [612, 628, 641, 655, 668, 681, 693],
    tone: "up",
  },
  {
    id: "failure-rate",
    name: "Failure rate",
    value: "3.4%",
    valueClassName: "text-danger",
    sub: "was 1.9% · sql-query driving 41%",
    warn: true,
    spark: [1.9, 2.1, 2.4, 2.7, 3.0, 3.2, 3.4],
    tone: "down",
  },
  {
    id: "latency",
    name: "Latency (P95)",
    value: "2.4s",
    sub: "+0.6s vs 7d · http-fetch slowest",
    warn: true,
    spark: [1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4],
    tone: "down",
  },
  {
    id: "token-cost",
    name: "Token cost",
    value: "$255",
    sub: ["/day across tools", "top: sql-query 46%"],
    spark: [228, 234, 240, 245, 249, 252, 255],
    tone: "up",
  },
  {
    id: "coverage",
    name: "Coverage",
    value: "Tracing 10/12",
    sub: "Evals 3/12 · 2 stale >24h",
    warn: true,
  },
]

/* ---------------------------------------------------------------------------
 * Models fleet (project-scoped — see ModelsView gate)
 * ------------------------------------------------------------------------- */

export const modelsFleet: FleetRow[] = [
  {
    id: "gpt-4o-prod-eastus2",
    name: "gpt4o-prod-eastus2",
    kind: "GPT-4o",
    status: "critical",
    attention: 97,
    attentionWhy: "Shared deployment behind groundedness regression across 3 agents · 38% of model spend",
    callVolume: 512400,
    failureRate: 4.1,
    p95: 4680,
    tokenCost: 214.6,
    volumeTrend: [468, 476, 484, 492, 499, 506, 512],
    volumeDelta: 5.2,
    lastUsed: "1s ago",
    coverage: { tracing: true, evals: true },
  },
  {
    id: "gpt-4o-mini",
    name: "gpt4o-mini-eastus2",
    kind: "GPT-4o mini",
    status: "attention",
    attention: 68,
    attentionWhy: "429 rate 1.9% during peak · PTU headroom ~4 days",
    callVolume: 1284000,
    failureRate: 2.4,
    p95: 1320,
    tokenCost: 96.3,
    volumeTrend: [1120, 1160, 1195, 1225, 1250, 1268, 1284],
    volumeDelta: 12.1,
    lastUsed: "1s ago",
    coverage: { tracing: true, evals: true },
  },
  {
    id: "text-embedding-3-large",
    name: "text-embedding-3-large",
    kind: "Embedding",
    status: "healthy",
    attention: 24,
    attentionWhy: "Stable · batch throughput within budget",
    callVolume: 842000,
    failureRate: 0.4,
    p95: 320,
    tokenCost: 18.9,
    volumeTrend: [810, 818, 824, 830, 835, 839, 842],
    volumeDelta: 2.1,
    lastUsed: "2s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "o1-preview",
    name: "o1-preview-eastus2",
    kind: "Reasoning",
    status: "attention",
    attention: 72,
    attentionWhy: "P95 12.4s · cost/run 6.2× baseline · used by 2 agents",
    callVolume: 8600,
    failureRate: 1.8,
    p95: 12400,
    tokenCost: 61.2,
    volumeTrend: [7, 7, 8, 8, 8, 8, 9],
    volumeDelta: 9.4,
    lastUsed: "18s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "gpt-35-turbo",
    name: "gpt-35-turbo",
    kind: "GPT-3.5",
    status: "healthy",
    attention: 19,
    attentionWhy: "Legacy · stable, scheduled for deprecation review",
    callVolume: 214000,
    failureRate: 0.9,
    p95: 680,
    tokenCost: 9.7,
    volumeTrend: [228, 225, 222, 219, 217, 215, 214],
    volumeDelta: -6.1,
    lastUsed: "7s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "phi-3-medium",
    name: "phi-3-medium",
    kind: "SLM",
    status: "unmonitored",
    attention: 0,
    attentionWhy: "No signal — tracing not configured",
    callVolume: 0,
    failureRate: null,
    p95: 0,
    tokenCost: 0,
    volumeTrend: [],
    volumeDelta: null,
    lastUsed: "unknown",
    coverage: { tracing: false, evals: false },
  },
  {
    id: "llama-3-70b",
    name: "llama-3-70b-instruct",
    kind: "Open weights",
    status: "healthy",
    attention: 33,
    attentionWhy: "Self-hosted · GPU utilization 63%",
    callVolume: 46700,
    failureRate: 1.3,
    p95: 2140,
    tokenCost: 27.4,
    volumeTrend: [43, 44, 45, 45, 46, 46, 47],
    volumeDelta: 3.6,
    lastUsed: "9s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "mistral-large",
    name: "mistral-large-2407",
    kind: "Open weights",
    status: "healthy",
    attention: 27,
    attentionWhy: "Stable across monitored signals",
    callVolume: 31200,
    failureRate: 1.1,
    p95: 1780,
    tokenCost: 16.1,
    volumeTrend: [29, 30, 30, 30, 31, 31, 31],
    volumeDelta: 2.2,
    lastUsed: "14s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "claude-3-5-sonnet",
    name: "claude-3-5-sonnet",
    kind: "Anthropic",
    status: "attention",
    attention: 59,
    attentionWhy: "Cross-region calls add +0.9s P95 · egress cost trending up",
    callVolume: 58400,
    failureRate: 2.2,
    p95: 2960,
    tokenCost: 52.8,
    volumeTrend: [50, 52, 54, 55, 56, 57, 58],
    volumeDelta: 8.3,
    lastUsed: "3s ago",
    coverage: { tracing: true, evals: true },
  },
  {
    id: "gemini-1-5-pro",
    name: "gemini-1.5-pro",
    kind: "Google",
    status: "healthy",
    attention: 29,
    attentionWhy: "Stable · long-context calls within SLO",
    callVolume: 22800,
    failureRate: 1.0,
    p95: 3240,
    tokenCost: 23.5,
    volumeTrend: [21, 21, 22, 22, 22, 22, 23],
    volumeDelta: 1.9,
    lastUsed: "22s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "whisper-large-v3",
    name: "whisper-large-v3",
    kind: "Speech",
    status: "healthy",
    attention: 12,
    attentionWhy: "Transcription batch jobs stable",
    callVolume: 6400,
    failureRate: 0.7,
    p95: 4100,
    tokenCost: 5.2,
    volumeTrend: [6, 6, 6, 6, 6, 6, 6],
    volumeDelta: 0.5,
    lastUsed: "51s ago",
    coverage: { tracing: true, evals: false },
  },
  {
    id: "dall-e-3",
    name: "dall-e-3",
    kind: "Image",
    status: "unmonitored",
    attention: 0,
    attentionWhy: "Telemetry stale — last span 33h ago",
    callVolume: 210,
    failureRate: null,
    p95: 0,
    tokenCost: 1.4,
    volumeTrend: [],
    volumeDelta: null,
    lastUsed: "33h ago",
    coverage: { tracing: false, evals: false },
  },
]

export const modelsStatusSummary: FleetStatusSummary = {
  healthy: 6,
  attention: 3,
  critical: 1,
  unmonitored: 2,
}

export const modelsKpis: FleetKpi[] = [
  {
    id: "call-volume",
    name: "Call volume",
    value: "3.15M",
    sub: "calls / day · +9.1% vs 7d",
    spark: [2.78, 2.86, 2.94, 3.01, 3.07, 3.11, 3.15],
    tone: "up",
  },
  {
    id: "failure-rate",
    name: "Failure rate",
    value: "2.6%",
    valueClassName: "text-danger",
    sub: "was 1.4% · gpt4o-prod-eastus2 driving",
    warn: true,
    spark: [1.4, 1.7, 1.9, 2.1, 2.3, 2.5, 2.6],
    tone: "down",
  },
  {
    id: "latency",
    name: "Latency (P95)",
    value: "3.1s",
    sub: "+0.4s vs 7d · o1-preview slowest",
    warn: true,
    spark: [2.7, 2.8, 2.9, 2.9, 3.0, 3.0, 3.1],
    tone: "down",
  },
  {
    id: "token-cost",
    name: "Token cost",
    value: "$523",
    sub: ["/day across models", "top: gpt4o-prod-eastus2 41%"],
    spark: [472, 486, 498, 507, 514, 519, 523],
    tone: "up",
  },
  {
    id: "coverage",
    name: "Coverage",
    value: "Tracing 10/12",
    sub: "Evals 4/12 · 2 stale >24h",
    warn: true,
  },
]

/* ---------------------------------------------------------------------------
 * Projects — the Models view is gated to the default project only.
 * ------------------------------------------------------------------------- */

export interface FleetProject {
  id: string
  name: string
  isDefault?: boolean
}

export const ALL_PROJECTS = "all" as const

export const fleetProjects: FleetProject[] = [
  { id: "faos-prod-eastus2", name: "faos-prod-eastus2 (default)", isDefault: true },
  { id: "faos-staging", name: "faos-staging" },
  { id: "acrtest-sandbox", name: "acrtest-sandbox" },
]

export const defaultProject = fleetProjects.find((project) => project.isDefault)!
