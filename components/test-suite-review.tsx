"use client"

import { useState } from "react"
import { MoreHorizontal, Play, ChevronDown, Settings, ArrowDown, ArrowUp, ArrowLeft, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EvalResultsView } from "./eval-results-view"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TestSuite {
  id: string
  name: string
  kind: "dataset-backed" | "evaluator-only"
  dataset: string | null
  datasetVersion: string | null
  datasetItems: number | null
  evaluatorCount: number
  evaluators: string[]
  lastRun: string
  lastScore: number | null
  scoreChange: number | null
  isActive?: boolean
  sampleRate?: string
}

const testSuites: TestSuite[] = [
  {
    id: "1",
    name: "support-quality-suite",
    kind: "dataset-backed",
    dataset: "twitter-eval-dataset",
    datasetVersion: "v1",
    datasetItems: 150,
    evaluatorCount: 6,
    evaluators: ["task_adherence", "tool_call_accuracy", "coherence", "booking_accuracy", "violence", "hate_unfairness"],
    lastRun: "2 hours ago",
    lastScore: 78,
    scoreChange: -9,
  },
  {
    id: "2",
    name: "safety-red-team",
    kind: "dataset-backed",
    dataset: "safety-attack-set",
    datasetVersion: "v2",
    datasetItems: 40,
    evaluatorCount: 3,
    evaluators: ["violence", "hate_unfairness", "jailbreak_resistance"],
    lastRun: "1 day ago",
    lastScore: 96,
    scoreChange: 0,
  },
  {
    id: "3",
    name: "continuous-monitoring",
    kind: "evaluator-only",
    dataset: null,
    datasetVersion: null,
    datasetItems: null,
    evaluatorCount: 2,
    evaluators: ["task_adherence", "violence"],
    lastRun: "Running · 10% sample",
    lastScore: null,
    scoreChange: null,
    isActive: true,
    sampleRate: "10%",
  },
]

// Evaluator definitions for detail view
interface Evaluator {
  id: string
  name: string
  category: "quality" | "safety" | "custom"
  type: string
  enabled: boolean
}

const offlineEvaluators: Evaluator[] = [
  { id: "1", name: "Task adherence", category: "quality", type: "built-in", enabled: true },
  { id: "2", name: "Tool-call accuracy", category: "quality", type: "built-in", enabled: true },
  { id: "3", name: "Coherence", category: "quality", type: "built-in", enabled: true },
  { id: "4", name: "Booking accuracy", category: "custom", type: "custom rubric", enabled: true },
  { id: "5", name: "Violence", category: "safety", type: "built-in", enabled: true },
  { id: "6", name: "Hate/unfairness", category: "safety", type: "built-in", enabled: true },
]

const continuousEvaluators: Evaluator[] = [
  { id: "7", name: "Task adherence", category: "quality", type: "Online eval · sampled traffic", enabled: true },
  { id: "8", name: "Violence", category: "safety", type: "Online eval · sampled traffic", enabled: true },
]

const generatedDataset = [
  { id: "1", query: "Book a flight from NYC to LA for tomorrow", expected: "Search flights, present options, confirm booking", tools: "search_flights, book_flight", source: "synthetic" },
  { id: "2", query: "Cancel my hotel reservation #12345", expected: "Look up reservation, confirm cancellation policy, process cancellation", tools: "get_reservation, cancel_booking", source: "synthetic" },
  { id: "3", query: "What documents do I need for a visa to Japan?", expected: "Provide accurate visa requirements for user's nationality", tools: "get_visa_requirements", source: "synthetic" },
  { id: "4", query: "Find hotels near Times Square under $200", expected: "Search hotels with filters, present sorted options", tools: "search_hotels", source: "synthetic" },
]

interface TestSuiteReviewProps {
  onSkip?: () => void
  onEditEvaluators?: () => void
  onRunTestSuites?: () => void
}

export function TestSuiteReview({ onSkip, onEditEvaluators, onRunTestSuites }: TestSuiteReviewProps) {
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)
  const [showRunResults, setShowRunResults] = useState(false)
  const [offlineEvals, setOfflineEvals] = useState(offlineEvaluators)
  const [continuousEvals, setContinuousEvals] = useState(continuousEvaluators)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "quality": return { letter: "Q", color: "bg-primary text-primary-foreground" }
      case "safety": return { letter: "S", color: "bg-destructive text-destructive-foreground" }
      case "custom": return { letter: "C", color: "bg-success text-success-foreground" }
      default: return { letter: "?", color: "bg-muted text-muted-foreground" }
    }
  }

  const toggleEvaluator = (id: string, isOffline: boolean) => {
    if (isOffline) {
      setOfflineEvals(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e))
    } else {
      setContinuousEvals(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e))
    }
  }

  // Show eval results when clicking a run
  if (showRunResults && selectedSuite) {
    return (
      <EvalResultsView
        onClose={() => setShowRunResults(false)}
        runName={`${selectedSuite.name}`}
        evaluationName={selectedSuite.name}
      />
    )
  }

  // Detail View - Review generated test suite
  if (selectedSuite) {
    return (
      <TooltipProvider>
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Back button */}
            <button 
              onClick={() => setSelectedSuite(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to test suites
            </button>

            {/* Purple Success Banner */}
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <h3 className="text-base font-semibold text-primary">Test suite generated for twitter-support-agent</h3>
              <p className="text-sm text-primary/80 mt-1">
                Foundry analyzed your agent&apos;s system prompt, 4 tools, and model (gpt-4o) to generate context-specific evaluators and a starter dataset. Review below and adjust before running.
              </p>
            </div>

            {/* Heading with badge */}
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">Review generated test suite</h2>
              <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                auto-generated
              </span>
            </div>

            {/* Test suite 1: offline eval */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-medium text-foreground">Test suite 1: offline eval</h3>
                <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  dataset-backed
                </span>
              </div>

              {/* Evaluator cards grid */}
              <div className="grid grid-cols-2 gap-3">
                {offlineEvals.map((evaluator) => {
                  const icon = getCategoryIcon(evaluator.category)
                  return (
                    <div
                      key={evaluator.id}
                      className={`p-4 rounded-lg border transition-colors ${evaluator.enabled ? 'border-border bg-card' : 'border-border/50 bg-secondary/30 opacity-60'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold ${icon.color}`}>
                            {icon.letter}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground">{evaluator.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{evaluator.type}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleEvaluator(evaluator.id, true)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${evaluator.enabled ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${evaluator.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Generated dataset section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">Generated dataset (25 test cases)</h4>
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Pencil className="w-3 h-3" />
                    edit
                  </button>
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Query</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Expected behavior</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Tools expected</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedDataset.map((row) => (
                        <tr key={row.id} className="border-b border-border/50">
                          <td className="px-4 py-3 text-foreground">{row.query}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.expected}</td>
                          <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.tools}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                              {row.source}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-2 bg-secondary/30 text-sm text-muted-foreground">
                    + 21 more test cases...
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Test suite 2: continuous eval */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-medium text-foreground">Test suite 2: continuous eval</h3>
                <span className="inline-flex items-center rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  evaluator-only
                </span>
              </div>

              {/* Continuous evaluator cards */}
              <div className="grid grid-cols-2 gap-3">
                {continuousEvals.map((evaluator) => {
                  const icon = getCategoryIcon(evaluator.category)
                  return (
                    <div
                      key={evaluator.id}
                      className={`p-4 rounded-lg border transition-colors ${evaluator.enabled ? 'border-border bg-card' : 'border-border/50 bg-secondary/30 opacity-60'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold ${icon.color}`}>
                            {icon.letter}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground">{evaluator.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{evaluator.type}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleEvaluator(evaluator.id, false)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${evaluator.enabled ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${evaluator.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Auto-configured section */}
            <div className="space-y-3">
              <h3 className="text-base font-medium text-foreground">Auto-configured</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                  <span className="text-sm text-foreground">Trace-to-dataset pipeline will keep the golden dataset current with production traces</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                  <span className="text-sm text-foreground">Filtering: rule-based quality + semantic dedup + LLM quality gate</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                  <span className="text-sm text-foreground">Schedule: weekly - new dataset version created each run</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">These settings can be customized later from the Data tab.</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setSelectedSuite(null)}>
                Skip for now
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={onEditEvaluators}>
                Edit evaluators
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowRunResults(true)}>
                Run test suites
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // List View - All test suites
  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">Test suites</h2>
              <span className="text-muted-foreground">({testSuites.length})</span>
            </div>
            <Button className="bg-primary hover:bg-primary/90" onClick={onRunTestSuites}>
              Generate test suite
            </Button>
          </div>

          {/* Test Suites Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kind</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dataset</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Evaluators</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last run</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last score</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testSuites.map((suite) => (
                  <tr
                    key={suite.id}
                    className="border-b border-border/50 hover:bg-secondary/20 cursor-pointer"
                    onClick={() => setSelectedSuite(suite)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-primary hover:underline font-medium">{suite.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {suite.kind === "dataset-backed" ? (
                        <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          dataset-backed
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          evaluator-only
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {suite.dataset ? (
                        <span>
                          {suite.dataset} {suite.datasetVersion} - {suite.datasetItems} items
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-foreground cursor-help underline decoration-dotted underline-offset-2">
                            {suite.evaluatorCount} evaluators
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="text-xs space-y-1">
                            {suite.evaluators.map((e) => (
                              <div key={e} className="font-mono">{e}</div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {suite.isActive ? (
                        <span className="flex items-center gap-2">
                          <span>{suite.lastRun}</span>
                        </span>
                      ) : (
                        suite.lastRun
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {suite.lastScore !== null ? (
                        <span className="flex items-center gap-1.5">
                          <span className={suite.lastScore >= 90 ? "text-success font-medium" : suite.lastScore >= 70 ? "text-amber-500 font-medium" : "text-destructive font-medium"}>
                            {suite.lastScore}%
                          </span>
                          {suite.scoreChange !== null && suite.scoreChange !== 0 && (
                            <span className={`flex items-center text-xs ${suite.scoreChange > 0 ? "text-success" : "text-destructive"}`}>
                              {suite.scoreChange > 0 ? (
                                <ArrowUp className="w-3 h-3" />
                              ) : (
                                <ArrowDown className="w-3 h-3" />
                              )}
                              {Math.abs(suite.scoreChange)}%
                            </span>
                          )}
                        </span>
                      ) : suite.isActive ? (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          <span className="text-success text-sm">Active</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {suite.isActive ? (
                          <button className="text-primary text-sm hover:underline">
                            Configure
                          </button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 px-2">
                                <Play className="w-3 h-3 mr-1" />
                                Run
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem>Run batch eval</DropdownMenuItem>
                              <DropdownMenuItem>Run on specific version</DropdownMenuItem>
                              <DropdownMenuItem>Compare with previous</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>Run now</DropdownMenuItem>
                            <DropdownMenuItem>Use in CI/CD</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Trace-to-dataset Pipeline Section */}
          <div className="space-y-3 pt-4">
            <h3 className="text-base font-medium text-foreground">Trace-to-dataset pipeline</h3>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                <span className="text-sm text-foreground">
                  Active - weekly schedule - last run 3 days ago - <span className="text-primary">793 traces</span> added to twitter-eval-dataset v1
                </span>
              </div>
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Configure pipeline
              </button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
