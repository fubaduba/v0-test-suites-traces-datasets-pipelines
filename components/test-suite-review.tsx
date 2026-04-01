"use client"

import { useState } from "react"
import { CheckCircle2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface Evaluator {
  id: string
  name: string
  category: "quality" | "safety" | "custom"
  type: "built-in" | "custom rubric"
  enabled: boolean
  isOnline?: boolean
}

interface TestCase {
  id: string
  query: string
  expectedBehavior: string
  toolsExpected: string[]
  source: "synthetic"
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
  { id: "7", name: "Task adherence", category: "quality", type: "built-in", enabled: true, isOnline: true },
  { id: "8", name: "Violence", category: "safety", type: "built-in", enabled: true, isOnline: true },
]

const testCases: TestCase[] = [
  {
    id: "1",
    query: "Book a round-trip flight from NYC to LAX for next Friday",
    expectedBehavior: "Agent should use flight_search tool with correct parameters and confirm booking details",
    toolsExpected: ["flight_search", "booking_create"],
    source: "synthetic",
  },
  {
    id: "2",
    query: "Cancel my hotel reservation #HT-29481",
    expectedBehavior: "Agent should look up reservation, confirm cancellation policy, and process cancellation",
    toolsExpected: ["reservation_lookup", "cancel_booking"],
    source: "synthetic",
  },
  {
    id: "3",
    query: "What visa do I need to travel to Japan from the US?",
    expectedBehavior: "Agent should provide accurate visa requirements without hallucinating policies",
    toolsExpected: ["visa_lookup"],
    source: "synthetic",
  },
  {
    id: "4",
    query: "Find hotels near Times Square under $200/night",
    expectedBehavior: "Agent should search with location and price filters, return relevant results",
    toolsExpected: ["hotel_search"],
    source: "synthetic",
  },
]

function getCategoryIcon(category: "quality" | "safety" | "custom") {
  const baseClasses = "w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
  switch (category) {
    case "quality":
      return <div className={`${baseClasses} bg-primary/20 text-primary`}>Q</div>
    case "safety":
      return <div className={`${baseClasses} bg-destructive/20 text-destructive`}>S</div>
    case "custom":
      return <div className={`${baseClasses} bg-success/20 text-success`}>C</div>
  }
}

interface TestSuiteReviewProps {
  onSkip?: () => void
  onEditEvaluators?: () => void
  onRunTestSuites?: () => void
}

export function TestSuiteReview({ onSkip, onEditEvaluators, onRunTestSuites }: TestSuiteReviewProps) {
  const [offlineEvals, setOfflineEvals] = useState(offlineEvaluators)
  const [continuousEvals, setContinuousEvals] = useState(continuousEvaluators)

  const toggleOfflineEval = (id: string) => {
    setOfflineEvals(offlineEvals.map(e => 
      e.id === id ? { ...e, enabled: !e.enabled } : e
    ))
  }

  const toggleContinuousEval = (id: string) => {
    setContinuousEvals(continuousEvals.map(e => 
      e.id === id ? { ...e, enabled: !e.enabled } : e
    ))
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Success Banner */}
      <div className="mx-6 mt-6 rounded-lg bg-primary/10 border border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Test suite generated for twitter-support-agent</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Foundry analyzed your agent&apos;s system prompt, 4 tools, and model (gpt-4o) to generate context-specific evaluators and a starter dataset. Review below and adjust before running.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">Review generated test suite</h2>
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">auto-generated</span>
        </div>

        {/* Test Suite 1: Offline Eval */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium text-foreground">Test suite 1: offline eval</h3>
            <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">dataset-backed</span>
          </div>

          {/* Evaluator Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {offlineEvals.map((evaluator) => (
              <div
                key={evaluator.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(evaluator.category)}
                  <div>
                    <p className="text-sm font-medium text-foreground">{evaluator.name}</p>
                    <p className="text-xs text-muted-foreground">{evaluator.type}</p>
                  </div>
                </div>
                <Switch
                  checked={evaluator.enabled}
                  onCheckedChange={() => toggleOfflineEval(evaluator.id)}
                />
              </div>
            ))}
          </div>

          {/* Generated Dataset */}
          <div className="mt-6 space-y-3">
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
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Query</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expected behavior</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tools expected</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {testCases.map((testCase) => (
                    <tr key={testCase.id} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="px-4 py-3 text-foreground max-w-[200px]">
                        <p className="truncate">{testCase.query}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[300px]">
                        <p className="truncate">{testCase.expectedBehavior}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {testCase.toolsExpected.map((tool) => (
                            <span key={tool} className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-mono text-secondary-foreground">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-foreground">synthetic</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 bg-secondary/30 text-sm text-muted-foreground">
                + 21 more test cases...
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Test Suite 2: Continuous Eval */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium text-foreground">Test suite 2: continuous eval</h3>
            <span className="inline-flex items-center rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">evaluator-only</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {continuousEvals.map((evaluator) => (
              <div
                key={evaluator.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(evaluator.category)}
                  <div>
                    <p className="text-sm font-medium text-foreground">{evaluator.name}</p>
                    <p className="text-xs text-muted-foreground">Online eval - sampled traffic</p>
                  </div>
                </div>
                <Switch
                  checked={evaluator.enabled}
                  onCheckedChange={() => toggleContinuousEval(evaluator.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Auto-configured Section */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-foreground">Auto-configured</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
              <p className="text-sm text-foreground">Trace-to-dataset pipeline will keep the golden dataset current with production traces</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
              <p className="text-sm text-foreground">Filtering: rule-based quality + semantic dedup + LLM quality gate</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
              <p className="text-sm text-foreground">Schedule: weekly - new dataset version created each run</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            These settings can be customized later from the Data tab.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 pb-8">
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={onEditEvaluators}>
            Edit evaluators
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={onRunTestSuites}>
            Run test suites
          </Button>
        </div>
      </div>
    </div>
  )
}
