"use client"

import { useState } from "react"
import { Search, Plus, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EvaluationsPageProps {
  onNavigateToAgent?: (agentName: string) => void
}

// Tab types
type TabId = "agent-health" | "evaluator-catalog" | "red-team" | "all-runs"

const tabs: { id: TabId; label: string; badge?: string }[] = [
  { id: "agent-health", label: "Evaluations" },
  { id: "evaluator-catalog", label: "Evaluator catalog" },
  { id: "red-team", label: "Red team", badge: "Preview" },
  { id: "all-runs", label: "All runs" },
]

// Mock data for Agent Health tab
interface AgentHealthData {
  id: string
  name: string
  status: "Running" | "Stopped"
  evalScore: number | null
  trend: number[] // last 5 scores
  continuousEval: { status: "Active" | "Paused" | "Not configured"; sampleRate?: string }
  testSuites: number
  lastEvalRun: string | null
}

const agentHealthData: AgentHealthData[] = [
  {
    id: "1",
    name: "twitter-support-agent",
    status: "Running",
    evalScore: 78,
    trend: [85, 82, 80, 79, 78],
    continuousEval: { status: "Active", sampleRate: "10%" },
    testSuites: 3,
    lastEvalRun: "2 hours ago",
  },
  {
    id: "2",
    name: "travel-booking-agent",
    status: "Running",
    evalScore: 92,
    trend: [91, 92, 92, 91, 92],
    continuousEval: { status: "Active", sampleRate: "5%" },
    testSuites: 2,
    lastEvalRun: "1 day ago",
  },
  {
    id: "3",
    name: "customer-faq-agent",
    status: "Running",
    evalScore: 64,
    trend: [75, 72, 70, 68, 64],
    continuousEval: { status: "Active", sampleRate: "10%" },
    testSuites: 2,
    lastEvalRun: "3 hours ago",
  },
  {
    id: "4",
    name: "internal-hr-agent",
    status: "Running",
    evalScore: 88,
    trend: [87, 88, 88, 88, 88],
    continuousEval: { status: "Paused" },
    testSuites: 1,
    lastEvalRun: "5 days ago",
  },
  {
    id: "5",
    name: "code-review-agent",
    status: "Stopped",
    evalScore: null,
    trend: [],
    continuousEval: { status: "Not configured" },
    testSuites: 0,
    lastEvalRun: null,
  },
  {
    id: "6",
    name: "sales-outreach-agent",
    status: "Running",
    evalScore: 71,
    trend: [80, 78, 75, 73, 71],
    continuousEval: { status: "Active", sampleRate: "15%" },
    testSuites: 2,
    lastEvalRun: "6 hours ago",
  },
]

// Mock data for Evaluator Catalog tab
interface EvaluatorData {
  id: string
  name: string
  category: "Quality" | "Safety" | "Custom"
  type: "built-in" | "custom"
  description: string
  usedByAgents: string[]
  usedBySuites: string[]
  createdOn: string
}

const evaluatorCatalogData: EvaluatorData[] = [
  {
    id: "1",
    name: "task_adherence",
    category: "Quality",
    type: "built-in",
    description: "Evaluates how well the agent follows the task instructions and achieves the specified goals",
    usedByAgents: ["twitter-support-agent", "travel-booking-agent", "customer-faq-agent", "internal-hr-agent"],
    usedBySuites: ["support-quality-suite", "booking-accuracy-suite", "faq-test-suite"],
    createdOn: "Built-in",
  },
  {
    id: "2",
    name: "tool_call_accuracy",
    category: "Quality",
    type: "built-in",
    description: "Measures the accuracy of tool/function calls made by the agent including parameter correctness",
    usedByAgents: ["twitter-support-agent", "travel-booking-agent", "sales-outreach-agent"],
    usedBySuites: ["support-quality-suite", "booking-accuracy-suite"],
    createdOn: "Built-in",
  },
  {
    id: "3",
    name: "coherence",
    category: "Quality",
    type: "built-in",
    description: "Assesses the logical flow and consistency of the agent responses across conversation turns",
    usedByAgents: ["twitter-support-agent", "travel-booking-agent", "customer-faq-agent", "internal-hr-agent", "sales-outreach-agent"],
    usedBySuites: ["support-quality-suite", "booking-accuracy-suite", "faq-test-suite", "hr-eval-suite", "sales-metrics"],
    createdOn: "Built-in",
  },
  {
    id: "4",
    name: "groundedness",
    category: "Quality",
    type: "built-in",
    description: "Verifies that agent responses are grounded in the provided context and source documents",
    usedByAgents: ["twitter-support-agent", "customer-faq-agent", "internal-hr-agent", "sales-outreach-agent"],
    usedBySuites: ["support-quality-suite", "faq-test-suite", "hr-eval-suite"],
    createdOn: "Built-in",
  },
  {
    id: "5",
    name: "violence",
    category: "Safety",
    type: "built-in",
    description: "Detects violent content, threats, or harmful language in agent responses",
    usedByAgents: ["twitter-support-agent", "travel-booking-agent", "customer-faq-agent", "internal-hr-agent", "code-review-agent", "sales-outreach-agent"],
    usedBySuites: ["safety-red-team", "continuous-monitoring"],
    createdOn: "Built-in",
  },
  {
    id: "6",
    name: "hate_unfairness",
    category: "Safety",
    type: "built-in",
    description: "Identifies hate speech, discrimination, and unfair bias in agent responses",
    usedByAgents: ["twitter-support-agent", "travel-booking-agent", "customer-faq-agent", "internal-hr-agent", "code-review-agent", "sales-outreach-agent"],
    usedBySuites: ["safety-red-team", "continuous-monitoring"],
    createdOn: "Built-in",
  },
  {
    id: "7",
    name: "booking_accuracy",
    category: "Custom",
    type: "custom",
    description: "Custom evaluator for verifying travel booking details match user requirements",
    usedByAgents: ["travel-booking-agent"],
    usedBySuites: ["booking-accuracy-suite"],
    createdOn: "1/15/26",
  },
  {
    id: "8",
    name: "customer_satisfaction",
    category: "Custom",
    type: "custom",
    description: "Predicts customer satisfaction based on conversation quality indicators",
    usedByAgents: ["twitter-support-agent", "customer-faq-agent"],
    usedBySuites: ["support-quality-suite", "faq-test-suite"],
    createdOn: "2/10/26",
  },
]

// Mock data for All Runs tab
interface EvalRun {
  id: string
  name: string
  agentName: string
  status: "Completed" | "Running" | "Failed"
  dataset: string
  evaluatorCount: number
  score: number | null
  createdBy: string
  createdOn: string
}

const allRunsData: EvalRun[] = [
  { id: "1", name: "Scheduled Run", agentName: "twitter-support-agent", status: "Completed", dataset: "twitter-eval-dataset", evaluatorCount: 6, score: 78, createdBy: "Sebastian Kohlmeier", createdOn: "3/6/26, 9:20 AM" },
  { id: "2", name: "Scheduled Run", agentName: "travel-booking-agent", status: "Completed", dataset: "booking-test-cases", evaluatorCount: 4, score: 92, createdBy: "System", createdOn: "3/5/26, 9:21 AM" },
  { id: "3", name: "Ad-hoc Run", agentName: "customer-faq-agent", status: "Completed", dataset: "faq-golden-set", evaluatorCount: 5, score: 64, createdBy: "Jane Smith", createdOn: "3/5/26, 3:45 PM" },
  { id: "4", name: "Scheduled Run", agentName: "twitter-support-agent", status: "Running", dataset: "twitter-eval-dataset", evaluatorCount: 6, score: null, createdBy: "System", createdOn: "3/6/26, 10:00 AM" },
  { id: "5", name: "Safety Check", agentName: "internal-hr-agent", status: "Completed", dataset: "safety-attack-set", evaluatorCount: 3, score: 96, createdBy: "Security Team", createdOn: "3/1/26, 2:00 PM" },
  { id: "6", name: "Regression Test", agentName: "sales-outreach-agent", status: "Failed", dataset: "sales-conversations", evaluatorCount: 4, score: null, createdBy: "CI Pipeline", createdOn: "3/4/26, 11:30 AM" },
  { id: "7", name: "Scheduled Run", agentName: "customer-faq-agent", status: "Completed", dataset: "faq-golden-set", evaluatorCount: 5, score: 68, createdBy: "System", createdOn: "3/4/26, 9:20 AM" },
  { id: "8", name: "Ad-hoc Run", agentName: "twitter-support-agent", status: "Completed", dataset: "twitter-eval-dataset", evaluatorCount: 6, score: 79, createdBy: "Sebastian Kohlmeier", createdOn: "3/3/26, 4:15 PM" },
]

// Mock data for Red Team tab
interface RedTeamRun {
  id: string
  name: string
  statusOfLastRun: "Completed" | "Running" | "Failed"
  issuesInLastRun: number
  runs: string
  category: "Agent" | "Model"
  createdOn: string
  createdBy: string
}

const redTeamData: RedTeamRun[] = [
  {
    id: "1",
    name: "redteam-vto9nw1u",
    statusOfLastRun: "Completed",
    issuesInLastRun: 0,
    runs: "10+",
    category: "Agent",
    createdOn: "2/27/26, 9:20:59 AM",
    createdBy: "Sebastian Kohlmeier",
  },
  {
    id: "2",
    name: "redteam-x8b2f5q8",
    statusOfLastRun: "Completed",
    issuesInLastRun: 0,
    runs: "10+",
    category: "Agent",
    createdOn: "11/15/25, 8:52:19 PM",
    createdBy: "Sebastian Kohlmeier",
  },
  {
    id: "3",
    name: "redteam-0gb9em5g",
    statusOfLastRun: "Completed",
    issuesInLastRun: 0,
    runs: "10+",
    category: "Agent",
    createdOn: "11/13/25, 2:21:19 PM",
    createdBy: "Sebastian Kohlmeier",
  },
]

// Helper functions
function getScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground"
  if (score >= 80) return "text-success"
  if (score >= 60) return "text-amber-500"
  return "text-destructive"
}

function getScoreBgColor(score: number | null): string {
  if (score === null) return ""
  if (score >= 80) return ""
  if (score >= 60) return ""
  return ""
}

function TrendIndicator({ trend }: { trend: number[] }) {
  if (trend.length === 0) {
    return <span className="text-muted-foreground text-xs">--</span>
  }
  
  // Calculate if trending up, down, or stable
  const lastValue = trend[trend.length - 1]
  const firstValue = trend[0]
  const isDecline = lastValue < firstValue - 3
  const isStable = Math.abs(lastValue - firstValue) <= 3
  
  return (
    <div className="flex items-center gap-0.5">
      {trend.slice(-5).map((score, index) => {
        let color = "bg-success"
        if (score < 60) color = "bg-destructive"
        else if (score < 80) color = "bg-amber-500"
        
        // Scale height based on score (min 4px, max 16px)
        const height = Math.max(4, Math.min(16, Math.floor(score / 6)))
        
        return (
          <div
            key={index}
            className={`w-1.5 rounded-sm ${color}`}
            style={{ height: `${height}px` }}
          />
        )
      })}
      {isDecline && <span className="text-destructive text-xs ml-1">&#8595;</span>}
      {isStable && <span className="text-muted-foreground text-xs ml-1">&#8212;</span>}
      {!isDecline && !isStable && <span className="text-success text-xs ml-1">&#8593;</span>}
    </div>
  )
}

function ContinuousEvalBadge({ status, sampleRate }: { status: "Active" | "Paused" | "Not configured"; sampleRate?: string }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success border border-success/20">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        Active {sampleRate}
      </span>
    )
  }
  if (status === "Paused") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Paused
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
      Not configured
    </span>
  )
}

function CategoryBadge({ category }: { category: "Quality" | "Safety" | "Custom" }) {
  const styles = {
    Quality: "bg-primary/10 text-primary border-primary/20",
    Safety: "bg-destructive/10 text-destructive border-destructive/20",
    Custom: "bg-success/10 text-success border-success/20",
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[category]}`}>
      {category}
    </span>
  )
}

export function EvaluationsPage({ onNavigateToAgent }: EvaluationsPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("agent-health")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [redTeamSearch, setRedTeamSearch] = useState("")

  // Calculate summary stats for agent health
  const totalAgents = agentHealthData.length
  const activeEvalCount = agentHealthData.filter(a => a.continuousEval.status === "Active").length
  const alertCount = agentHealthData.filter(a => a.evalScore !== null && a.evalScore < 70).length
  const notConfiguredCount = agentHealthData.filter(a => a.continuousEval.status === "Not configured").length

  // Filter all runs data
  const filteredRuns = allRunsData.filter(run => {
    const matchesSearch = run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         run.agentName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || run.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  // Filter red team data
  const filteredRedTeamRuns = redTeamData.filter(run => 
    run.name.toLowerCase().includes(redTeamSearch.toLowerCase()) ||
    run.createdBy.toLowerCase().includes(redTeamSearch.toLowerCase())
  )

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Evaluations</h1>
              <p className="text-sm text-muted-foreground mt-1">Agent health across your fleet</p>
            </div>
            {activeTab === "evaluator-catalog" && (
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New evaluator
              </Button>
            )}
            {activeTab === "red-team" && (
              <Button className="bg-success hover:bg-success/90 text-success-foreground">
                Create
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 text-sm pb-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-foreground border-primary font-medium"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {/* Agent Health Tab */}
          {activeTab === "agent-health" && (
            <div className="px-6 py-4">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground font-medium">Agent name</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Eval score</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Trend</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Continuous eval</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Test suites</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Last eval run</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentHealthData.map((agent) => {
                    const isAlert = agent.evalScore !== null && agent.evalScore < 70
                    const isNotConfigured = agent.continuousEval.status === "Not configured"
                    
                    return (
                      <TableRow
                        key={agent.id}
                        className={`
                          ${isAlert ? "bg-destructive/5 border-l-2 border-l-destructive" : ""}
                          ${isNotConfigured ? "bg-muted/30" : ""}
                        `}
                      >
                        <TableCell>
                          <button
                            onClick={() => onNavigateToAgent?.(agent.name)}
                            className="text-primary hover:underline font-medium"
                          >
                            {agent.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                agent.status === "Running" ? "bg-success" : "bg-muted-foreground"
                              }`}
                            />
                            <span className="text-sm text-foreground">{agent.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {agent.evalScore !== null ? (
                            <span className={`text-lg font-semibold ${getScoreColor(agent.evalScore)}`}>
                              {agent.evalScore}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <TrendIndicator trend={agent.trend} />
                        </TableCell>
                        <TableCell>
                          <ContinuousEvalBadge
                            status={agent.continuousEval.status}
                            sampleRate={agent.continuousEval.sampleRate}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground">
                            {agent.testSuites} {agent.testSuites === 1 ? "suite" : "suites"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {agent.lastEvalRun ?? "Never"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isAlert ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              Investigate
                            </Button>
                          ) : isNotConfigured ? (
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                            >
                              Setup eval
                            </Button>
                          ) : agent.continuousEval.status === "Paused" ? (
                            <Button variant="outline" size="sm">
                              Resume eval
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              View results
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Summary Stats */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {totalAgents} agents total. {activeEvalCount} with continuous eval active. {alertCount} alert{alertCount !== 1 ? "s" : ""} (below threshold). {notConfiguredCount} not configured.
                </p>
              </div>
            </div>
          )}

          {/* Evaluator Catalog Tab */}
          {activeTab === "evaluator-catalog" && (
            <div className="px-6 py-4">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground font-medium">Name</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Category</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Type</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium max-w-xs">Description</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Used by</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Created on</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluatorCatalogData.map((evaluator) => (
                    <TableRow key={evaluator.id}>
                      <TableCell>
                        <button className="text-primary hover:underline font-medium">
                          {evaluator.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={evaluator.category} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{evaluator.type}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-muted-foreground truncate block">
                          {evaluator.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-sm text-foreground hover:text-primary cursor-help">
                              {evaluator.usedByAgents.length} agents, {evaluator.usedBySuites.length} test suites
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-medium mb-1">Agents:</p>
                                <p className="text-xs">{evaluator.usedByAgents.join(", ")}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium mb-1">Test Suites:</p>
                                <p className="text-xs">{evaluator.usedBySuites.join(", ")}</p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{evaluator.createdOn}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Red Team Tab */}
          {activeTab === "red-team" && (
            <div className="px-6 py-4">
              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6">
                Run automated groups of red teaming scans using the AI red teaming agent on your models or agents to identify safety and security risks.{" "}
                <a href="#" className="text-primary hover:underline inline-flex items-center gap-1">
                  Learn how to create a red teaming run.
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>

              {/* Search */}
              <div className="flex items-center justify-between mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search red teaming runs"
                    value={redTeamSearch}
                    onChange={(e) => setRedTeamSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Name</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Status of last run</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Issues in last run</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Runs</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Category</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Created on</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Created by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRedTeamRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="w-8">
                        <div className="w-4 h-4 rounded-full border border-border" />
                      </TableCell>
                      <TableCell>
                        <button className="text-primary hover:underline font-medium">
                          {run.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${
                            run.statusOfLastRun === "Completed" ? "text-success" :
                            run.statusOfLastRun === "Running" ? "text-primary" :
                            "text-destructive"
                          }`} />
                          <span className={`text-sm ${
                            run.statusOfLastRun === "Completed" ? "text-success" :
                            run.statusOfLastRun === "Running" ? "text-primary" :
                            "text-destructive"
                          }`}>{run.statusOfLastRun}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{run.issuesInLastRun}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{run.runs}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{run.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{run.createdOn}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{run.createdBy}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>1-{filteredRedTeamRuns.length} of {filteredRedTeamRuns.length}</span>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-muted rounded disabled:opacity-50" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>Prev</span>
                  <span>Next</span>
                  <button className="p-1 hover:bg-muted rounded disabled:opacity-50" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* All Runs Tab */}
          {activeTab === "all-runs" && (
            <div className="px-6 py-4">
              {/* Search and Filters */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search runs or agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground font-medium">Run name</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Agent</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Dataset</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Evaluators</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Score</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Created by</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">Created on</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>
                        <button className="text-primary hover:underline font-medium">
                          {run.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => onNavigateToAgent?.(run.agentName)}
                          className="text-primary hover:underline"
                        >
                          {run.agentName}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              run.status === "Completed"
                                ? "bg-success"
                                : run.status === "Running"
                                ? "bg-primary animate-pulse"
                                : "bg-destructive"
                            }`}
                          />
                          <span className="text-sm text-foreground">{run.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{run.dataset}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{run.evaluatorCount}</span>
                      </TableCell>
                      <TableCell>
                        {run.score !== null ? (
                          <span className={`text-sm font-medium ${getScoreColor(run.score)}`}>
                            {run.score}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{run.createdBy}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{run.createdOn}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
