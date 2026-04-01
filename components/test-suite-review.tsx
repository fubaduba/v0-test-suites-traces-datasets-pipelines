"use client"

import { useState } from "react"
import { MoreHorizontal, Play, ChevronDown, Settings, ArrowDown, ArrowUp } from "lucide-react"
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

interface TestSuiteReviewProps {
  onSkip?: () => void
  onEditEvaluators?: () => void
  onRunTestSuites?: () => void
}

export function TestSuiteReview({ onSkip, onEditEvaluators, onRunTestSuites }: TestSuiteReviewProps) {
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)

  // If a suite is selected, show the eval results view
  if (selectedSuite) {
    return (
      <EvalResultsView
        onClose={() => setSelectedSuite(null)}
        runName={`${selectedSuite.name}`}
        evaluationName={selectedSuite.name}
      />
    )
  }

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
                          {suite.dataset} {suite.datasetVersion} · {suite.datasetItems} items
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
                  Active · weekly schedule · last run 3 days ago · <span className="text-primary">793 traces</span> added to twitter-eval-dataset v1
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
