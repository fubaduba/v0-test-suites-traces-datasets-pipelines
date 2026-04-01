"use client"

import { useState } from "react"
import { X, ChevronDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface EvalResultsViewProps {
  onClose: () => void
  onPromoteToDataset?: (selectedIds: string[]) => void
  runName?: string
  evaluationName?: string
}

// Mock data for the eval run results
const evalRunData = {
  runNumber: 14,
  agentName: "twitter-support-agent",
  agentVersion: 21,
  totalCases: 25,
  failures: 3,
  regressions: 2,
  metrics: {
    overall: { value: 78, change: -9, status: "warning" as const },
    toolCallAccuracy: { value: 64, change: -18, status: "error" as const },
    groundedness: { value: 92, change: 0, status: "success" as const },
    safety: { value: 100, change: 0, status: "success" as const },
  },
  failingCases: [
    {
      id: "case-1",
      testCase: "Multi-city booking with transfers",
      toolAccuracy: 0.31,
      reasoning: "Agent called search_flights 3x redundantly; missed transfer_booking tool entirely",
      traceId: "t-8f2a...c41d",
      fullTraceId: "t-8f2a1b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o-c41d",
    },
    {
      id: "case-2",
      testCase: "Hotel cancellation with refund",
      toolAccuracy: 0.42,
      reasoning: "Used cancel_booking but skipped refund_check; user asked about refund policy twice",
      traceId: "t-1bc7...e928",
      fullTraceId: "t-1bc7-2d3e-4f5g-6h7i-8j9k-0l1m-2n3o-e928",
    },
    {
      id: "case-3",
      testCase: "Visa requirement lookup + booking",
      toolAccuracy: 0.55,
      reasoning: "Correct visa lookup but booked wrong date; date extraction failed on multi-turn context",
      traceId: "t-4de3...f712",
      fullTraceId: "t-4de3-5e6f-7g8h-9i0j-1k2l-3m4n-5o6p-f712",
    },
  ],
}

const existingDatasets = [
  { id: "1", name: "twitter-eval-dataset", version: "v1", count: 150 },
  { id: "2", name: "support-golden-set", version: "v2", count: 75 },
  { id: "3", name: "edge-cases-dataset", version: "v1", count: 42 },
]

export function EvalResultsView({ onClose, onPromoteToDataset, runName, evaluationName }: EvalResultsViewProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "failures" | "regressions">("failures")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(
    new Set(evalRunData.failingCases.map((c) => c.id))
  )
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState("support-golden-set")
  const [tagAsRegressionGuard, setTagAsRegressionGuard] = useState(true)
  const [includeReasoningAsNotes, setIncludeReasoningAsNotes] = useState(true)
  const [reRunAfterAdding, setReRunAfterAdding] = useState(true)

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const toggleAllRows = () => {
    if (selectedRows.size === evalRunData.failingCases.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(evalRunData.failingCases.map((c) => c.id)))
    }
  }

  const isAllSelected = selectedRows.size === evalRunData.failingCases.length
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < evalRunData.failingCases.length

  const getStatusColor = (status: "success" | "warning" | "error") => {
    switch (status) {
      case "success":
        return "text-success"
      case "warning":
        return "text-amber-500"
      case "error":
        return "text-destructive"
    }
  }

  const getStatusBg = (status: "success" | "warning" | "error") => {
    switch (status) {
      case "success":
        return "bg-success/10 border-success/20"
      case "warning":
        return "bg-amber-500/10 border-amber-500/20"
      case "error":
        return "bg-destructive/10 border-destructive/20"
    }
  }

  const handlePromote = () => {
    if (onPromoteToDataset) {
      onPromoteToDataset(Array.from(selectedRows))
    }
    setShowPromoteDialog(false)
    alert(`Promoted ${selectedRows.size} failing cases to dataset "${selectedDataset}" (v3)`)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {runName || `Eval run #${evalRunData.runNumber} — ${evalRunData.agentName} v${evalRunData.agentVersion}`}
          </h2>
          <span className="px-2.5 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-full">
            {evalRunData.failures} failures
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-secondary rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Overall Score */}
          <div className={`p-4 rounded-lg border ${getStatusBg(evalRunData.metrics.overall.status)}`}>
            <div className="text-sm text-muted-foreground mb-1">Overall score</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-semibold ${getStatusColor(evalRunData.metrics.overall.status)}`}>
                {evalRunData.metrics.overall.value}%
              </span>
              <span className="text-xs text-destructive">
                ↓ {Math.abs(evalRunData.metrics.overall.change)}% vs v20
              </span>
            </div>
          </div>

          {/* Tool-call Accuracy */}
          <div className={`p-4 rounded-lg border ${getStatusBg(evalRunData.metrics.toolCallAccuracy.status)}`}>
            <div className="text-sm text-muted-foreground mb-1">Tool-call accuracy</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-semibold ${getStatusColor(evalRunData.metrics.toolCallAccuracy.status)}`}>
                {evalRunData.metrics.toolCallAccuracy.value}%
              </span>
              <span className="text-xs text-destructive">
                ↓ {Math.abs(evalRunData.metrics.toolCallAccuracy.change)}% vs v20
              </span>
            </div>
          </div>

          {/* Groundedness */}
          <div className={`p-4 rounded-lg border ${getStatusBg(evalRunData.metrics.groundedness.status)}`}>
            <div className="text-sm text-muted-foreground mb-1">Groundedness</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-semibold ${getStatusColor(evalRunData.metrics.groundedness.status)}`}>
                {evalRunData.metrics.groundedness.value}%
              </span>
            </div>
          </div>

          {/* Safety */}
          <div className={`p-4 rounded-lg border ${getStatusBg(evalRunData.metrics.safety.status)}`}>
            <div className="text-sm text-muted-foreground mb-1">Safety</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-semibold ${getStatusColor(evalRunData.metrics.safety.status)}`}>
                {evalRunData.metrics.safety.value}%
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs and Promote Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeFilter === "all"
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              All ({evalRunData.totalCases})
            </button>
            <button
              onClick={() => setActiveFilter("failures")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeFilter === "failures"
                  ? "bg-destructive/10 text-destructive font-medium ring-1 ring-destructive/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              Failures ({evalRunData.failures})
            </button>
            <button
              onClick={() => setActiveFilter("regressions")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeFilter === "regressions"
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              Regressions ({evalRunData.regressions})
            </button>
          </div>

          <Button
            onClick={() => setShowPromoteDialog(true)}
            disabled={selectedRows.size === 0}
            className="bg-primary hover:bg-primary/90"
          >
            Promote to dataset
          </Button>
        </div>

        {/* Results Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="border-b border-border">
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleAllRows}
                    aria-label="Select all rows"
                    className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-20">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Test case</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">Tool acc.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Evaluator reasoning</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-32">Trace</th>
              </tr>
            </thead>
            <tbody>
              {evalRunData.failingCases.map((testCase) => (
                <tr
                  key={testCase.id}
                  className={`border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors ${
                    selectedRows.has(testCase.id) ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedRows.has(testCase.id)}
                      onCheckedChange={() => toggleRow(testCase.id)}
                      aria-label={`Select ${testCase.testCase}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      Fail
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-foreground font-medium">{testCase.testCase}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-destructive font-mono">{testCase.toolAccuracy.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                      {testCase.reasoning}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono">
                      {testCase.traceId}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Promote to Dataset Panel */}
        {showPromoteDialog && (
          <div className="mt-6 p-5 rounded-lg border-2 border-primary/30 bg-primary/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Promote {selectedRows.size} failing case{selectedRows.size !== 1 ? "s" : ""} to dataset
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  These cases will become permanent regression guards. Included in every future eval run.
                </p>
              </div>
              <button
                onClick={() => setShowPromoteDialog(false)}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Target Dataset Dropdown */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Target dataset
              </label>
              <div className="relative">
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                  {existingDatasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.name}>
                      {dataset.name} (create version v3)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={tagAsRegressionGuard}
                  onCheckedChange={(checked) => setTagAsRegressionGuard(!!checked)}
                />
                <span className="text-sm text-foreground">Tag as regression guard</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={includeReasoningAsNotes}
                  onCheckedChange={(checked) => setIncludeReasoningAsNotes(!!checked)}
                />
                <span className="text-sm text-foreground">Include evaluator reasoning as expected behavior notes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={reRunAfterAdding}
                  onCheckedChange={(checked) => setReRunAfterAdding(!!checked)}
                />
                <span className="text-sm text-foreground">Re-run eval suite after adding</span>
              </label>
            </div>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded">
                source: eval_failure
              </span>
              <span className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded">
                run: #14
              </span>
              {tagAsRegressionGuard && (
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                  regression_guard
                </span>
              )}
              <span className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded">
                evaluator: tool-call-accuracy
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePromote} className="bg-primary hover:bg-primary/90">
                Promote to dataset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
