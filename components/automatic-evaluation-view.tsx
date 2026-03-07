"use client"

import { useState } from "react"
import { Search, CheckCircle2, ChevronLeft, ChevronRight, Plus, X, ArrowLeft, ChevronDown, Download, AlertCircle, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AnnotateDialog, FullTemplate } from "./annotate-dialog"
import { AnnotationWizard } from "./annotation-wizard"

interface AutomaticEvaluation {
  id: string
  name: string
  status: "Completed" | "Running" | "Failed"
  runs: number | string
  createdBy: string
  createdOn: string
}

interface EvaluationRun {
  id: string
  name: string
  subName: string
  target: string
  dataset: string
  datasetVersion: string
  status: "Partial" | "Completed" | "Failed"
  createdBy: string
  createdOn: string
  completionTokens: number
  promptTokens: number
  groundedness: { percentage: number; count: string }
  coherence: { percentage: number; count: string }
  relevance: { percentage: number; count: string }
  deflectionScore: { percentage: number; count: string }
  escalationSentiment: { percentage: number; count: string }
}

// Mock data matching the screenshot
const mockEvaluations: AutomaticEvaluation[] = [
  {
    id: "1",
    name: "continuous_evaluation_twitter-support-agent_2026-01-07",
    status: "Completed",
    runs: "20+",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "2/24/26, 9:47:58 AM",
  },
  {
    id: "2",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 2,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/9/26, 8:13:53 AM",
  },
  {
    id: "3",
    name: "continuous_evaluation_twitter-support-agent_2026-01-07",
    status: "Completed",
    runs: "20+",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "1/6/26, 5:34:14 PM",
  },
  {
    id: "4",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/5/26, 12:59:14 PM",
  },
  {
    id: "5",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/5/26, 9:51:05 AM",
  },
  {
    id: "6",
    name: "eval-8sv55j06",
    status: "Completed",
    runs: 10,
    createdBy: "Sebastian Kohlmeier",
    createdOn: "1/4/26, 5:13:24 PM",
  },
  {
    id: "7",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/4/26, 3:31:45 PM",
  },
  {
    id: "8",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/4/26, 3:27:01 PM",
  },
  {
    id: "9",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/4/26, 3:24:15 PM",
  },
  {
    id: "10",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/4/26, 3:05:19 PM",
  },
]

// Mock evaluation runs for detail view
const mockEvaluationRuns: EvaluationRun[] = [
  {
    id: "1",
    name: "Scheduled Run",
    subName: "[twitter-support-agent-schedule-evaluation]",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "3/6/26, 9:20:59 AM",
    completionTokens: 16513,
    promptTokens: 206718,
    groundedness: { percentage: 60, count: "21/35" },
    coherence: { percentage: 100, count: "35/35" },
    relevance: { percentage: 100, count: "35/35" },
    deflectionScore: { percentage: 51, count: "18/35" },
    escalationSentiment: { percentage: 63, count: "22/35" },
  },
  {
    id: "2",
    name: "Scheduled Run",
    subName: "[twitter-support-agent-schedule-evaluation]",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "3/5/26, 9:21:00 AM",
    completionTokens: 16914,
    promptTokens: 202139,
    groundedness: { percentage: 65, count: "22/34" },
    coherence: { percentage: 100, count: "35/35" },
    relevance: { percentage: 100, count: "35/35" },
    deflectionScore: { percentage: 43, count: "15/35" },
    escalationSentiment: { percentage: 31, count: "11/35" },
  },
  {
    id: "3",
    name: "Scheduled Run",
    subName: "[twitter-support-agent-schedule-evaluation]",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "3/4/26, 9:21:00 AM",
    completionTokens: 16233,
    promptTokens: 206265,
    groundedness: { percentage: 63, count: "22/35" },
    coherence: { percentage: 100, count: "34/34" },
    relevance: { percentage: 100, count: "35/35" },
    deflectionScore: { percentage: 43, count: "15/35" },
    escalationSentiment: { percentage: 46, count: "16/35" },
  },
  {
    id: "4",
    name: "Scheduled Run",
    subName: "[twitter-support-agent-schedule-evaluation]",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "3/3/26, 9:20:59 AM",
    completionTokens: 16437,
    promptTokens: 205027,
    groundedness: { percentage: 63, count: "22/35" },
    coherence: { percentage: 100, count: "35/35" },
    relevance: { percentage: 100, count: "35/35" },
    deflectionScore: { percentage: 29, count: "10/35" },
    escalationSentiment: { percentage: 43, count: "15/35" },
  },
  {
    id: "5",
    name: "Scheduled Run",
    subName: "[twitter-support-agent-schedule-evaluation]",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "3/2/26, 9:21:00 AM",
    completionTokens: 16222,
    promptTokens: 202088,
    groundedness: { percentage: 60, count: "21/35" },
    coherence: { percentage: 100, count: "33/33" },
    relevance: { percentage: 100, count: "35/35" },
    deflectionScore: { percentage: 34, count: "12/35" },
    escalationSentiment: { percentage: 31, count: "11/35" },
  },
  {
    id: "6",
    name: "Scheduled Run",
    subName: "[twitter-support-agent-schedule-evaluation]",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "3/1/26, 9:20:59 AM",
    completionTokens: 16542,
    promptTokens: 205461,
    groundedness: { percentage: 63, count: "22/35" },
    coherence: { percentage: 100, count: "35/35" },
    relevance: { percentage: 100, count: "35/35" },
    deflectionScore: { percentage: 43, count: "15/35" },
    escalationSentiment: { percentage: 51, count: "18/35" },
  },
  {
    id: "7",
    name: "Scheduled Run",
    subName: "[twitter-support-agent-schedule-evaluation]",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "2/28/26, 9:20:58 AM",
    completionTokens: 16797,
    promptTokens: 201012,
    groundedness: { percentage: 57, count: "20/35" },
    coherence: { percentage: 100, count: "35/35" },
    relevance: { percentage: 100, count: "33/33" },
    deflectionScore: { percentage: 29, count: "10/35" },
    escalationSentiment: { percentage: 40, count: "14/35" },
  },
  {
    id: "8",
    name: "twitter-support-agent",
    subName: "agent: 17",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "1/9/26, 2:24:24 PM",
    completionTokens: 16688,
    promptTokens: 264169,
    groundedness: { percentage: 71, count: "25/35" },
    coherence: { percentage: 100, count: "35/35" },
    relevance: { percentage: 100, count: "35/35" },
    deflectionScore: { percentage: 87, count: "27/31" },
    escalationSentiment: { percentage: 71, count: "22/31" },
  },
  {
    id: "9",
    name: "twitter-support-agent",
    subName: "agent: 15",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "1/4/26, 5:31:18 PM",
    completionTokens: 15428,
    promptTokens: 267169,
    groundedness: { percentage: 74, count: "26/35" },
    coherence: { percentage: 100, count: "33/33" },
    relevance: { percentage: 100, count: "33/33" },
    deflectionScore: { percentage: 77, count: "27/35" },
    escalationSentiment: { percentage: 65, count: "22/34" },
  },
  {
    id: "10",
    name: "twitter-support-agent",
    subName: "agent: 14",
    target: "twitter-support-agent",
    dataset: "twitter-eval-dataset...",
    datasetVersion: "Version 1",
    status: "Partial",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "1/4/26, 5:13:26 PM",
    completionTokens: 16400,
    promptTokens: 264876,
    groundedness: { percentage: 77, count: "27/35" },
    coherence: { percentage: 100, count: "35/35" },
    relevance: { percentage: 100, count: "35/35" },
    deflectionScore: { percentage: 83, count: "29/35" },
    escalationSentiment: { percentage: 64, count: "21/33" },
  },
]

export function AutomaticEvaluationView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRow, setSelectedRow] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<AutomaticEvaluation | null>(null)
  const [showEvaluationDetails, setShowEvaluationDetails] = useState(true)
  const [selectedRuns, setSelectedRuns] = useState<Set<string>>(new Set())
  const [showAnnotateDialog, setShowAnnotateDialog] = useState(false)
  const [showAnnotationWizard, setShowAnnotationWizard] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<FullTemplate | null>(null)

  const filteredEvaluations = mockEvaluations.filter((evaluation) =>
    evaluation.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEvaluationClick = (evaluation: AutomaticEvaluation) => {
    setSelectedEvaluation(evaluation)
    setSelectedRuns(new Set())
  }

  const handleBackToList = () => {
    setSelectedEvaluation(null)
    setSelectedRuns(new Set())
  }

  const toggleRunSelection = (runId: string) => {
    const newSelection = new Set(selectedRuns)
    if (newSelection.has(runId)) {
      newSelection.delete(runId)
    } else {
      newSelection.add(runId)
    }
    setSelectedRuns(newSelection)
  }

  const toggleAllRuns = () => {
    if (selectedRuns.size === mockEvaluationRuns.length) {
      setSelectedRuns(new Set())
    } else {
      setSelectedRuns(new Set(mockEvaluationRuns.map((r) => r.id)))
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-success"
    if (percentage >= 50) return "text-yellow-500"
    return "text-destructive"
  }

  // Generate trace data from selected evaluation runs for annotation
  const getTracesFromSelectedRuns = () => {
    const selectedRunsList = mockEvaluationRuns.filter(run => selectedRuns.has(run.id))
    return selectedRunsList.map((run, index) => ({
      id: run.id,
      conversationId: `conv_${run.id}_${run.name.replace(/\s+/g, '_')}`,
      traceId: `trace_${run.id}_${Date.now()}`,
      responseId: `resp_${run.id}_${Date.now()}`,
      startTime: run.createdOn,
      input: `Evaluation run input for ${run.name} targeting ${run.target}. Dataset: ${run.dataset} (${run.datasetVersion}). This run processed ${run.promptTokens.toLocaleString()} prompt tokens and generated ${run.completionTokens.toLocaleString()} completion tokens.`,
      output: `Evaluation Results Summary:\n\n- Groundedness: ${run.groundedness.percentage}% (${run.groundedness.count})\n- Coherence: ${run.coherence.percentage}% (${run.coherence.count})\n- Relevance: ${run.relevance.percentage}% (${run.relevance.count})\n- Deflection Score: ${run.deflectionScore.percentage}% (${run.deflectionScore.count})\n- Escalation Sentiment: ${run.escalationSentiment.percentage}% (${run.escalationSentiment.count})\n\nStatus: ${run.status}\nCreated by: ${run.createdBy}`,
    }))
  }

  const handleStartAnnotation = (template: FullTemplate) => {
    setSelectedTemplate(template)
    setShowAnnotateDialog(false)
    setShowAnnotationWizard(true)
  }

  const handleAnnotationComplete = (results: unknown[]) => {
    setShowAnnotationWizard(false)
    setSelectedTemplate(null)
    setSelectedRuns(new Set())
    alert(`Annotation completed for ${results.length} evaluation run(s)!`)
  }

  // Detail View
  if (selectedEvaluation) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {selectedEvaluation.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button className="bg-secondary hover:bg-secondary/80 text-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add run
            </Button>
          </div>
        </div>

        {/* Evaluation Details Collapsible */}
        <div className="border-b border-border">
          <button
            onClick={() => setShowEvaluationDetails(!showEvaluationDetails)}
            className="flex items-center gap-2 px-6 py-3 w-full text-left hover:bg-secondary/20 transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                showEvaluationDetails ? "" : "-rotate-90"
              }`}
            />
            <span className="text-sm font-medium text-foreground">Evaluation details</span>
          </button>
          {showEvaluationDetails && (
            <div className="px-6 pb-4 flex items-start gap-16">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Create time</p>
                <p className="text-sm text-foreground">{selectedEvaluation.createdOn}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created by</p>
                <p className="text-sm text-foreground">{selectedEvaluation.createdBy}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">See all properties</p>
                <button className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary">
                  <FileText className="w-4 h-4" />
                  Raw JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Runs Tab */}
        <div className="px-6 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground border-b-2 border-foreground pb-3">
            Runs
          </span>
        </div>

        {/* Evaluation Runs Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-medium text-foreground">Evaluation runs</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select multiple runs to compare results statistically or use AI to analyze failed tests.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={selectedRuns.size === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Cancel runs
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={selectedRuns.size === 0}
                onClick={() => setShowAnnotateDialog(true)}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <FileText className="w-4 h-4 mr-1.5" />
                Annotate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={selectedRuns.size < 2}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Compare runs
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={selectedRuns.size === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Analyze Results
              </Button>
            </div>
          </div>
        </div>

        {/* Runs Table */}
        <div className="flex-1 overflow-auto px-6">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b border-border">
                <th className="w-10 py-3 text-left">
                  <Checkbox
                    checked={selectedRuns.size === mockEvaluationRuns.length && mockEvaluationRuns.length > 0}
                    onCheckedChange={toggleAllRuns}
                  />
                </th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Target</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Dataset</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Created by</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Created on</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">
                  <div>Completion</div>
                  <div>tokens</div>
                </th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Prompt tokens</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Groundedness</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Coherence</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">Relevance</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">deflection score</th>
                <th className="py-3 text-left text-xs font-medium text-muted-foreground">escalationsentiment</th>
              </tr>
            </thead>
            <tbody>
              {mockEvaluationRuns.map((run) => (
                <tr
                  key={run.id}
                  className={`border-b border-border/50 hover:bg-secondary/20 ${
                    selectedRuns.has(run.id) ? "bg-secondary/30" : ""
                  }`}
                >
                  <td className="py-3">
                    <Checkbox
                      checked={selectedRuns.has(run.id)}
                      onCheckedChange={() => toggleRunSelection(run.id)}
                    />
                  </td>
                  <td className="py-3">
                    <div>
                      <span className="text-primary hover:underline cursor-pointer">{run.name}</span>
                      <div className="text-xs text-muted-foreground">{run.subName}</div>
                    </div>
                  </td>
                  <td className="py-3 text-foreground">{run.target}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-primary hover:underline cursor-pointer">{run.dataset}</span>
                      <Download className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground">{run.datasetVersion}</div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-500">{run.status}</span>
                    </div>
                  </td>
                  <td className="py-3 text-foreground">{run.createdBy}</td>
                  <td className="py-3 text-foreground">{run.createdOn}</td>
                  <td className="py-3 text-foreground">{run.completionTokens.toLocaleString()}</td>
                  <td className="py-3 text-foreground">{run.promptTokens.toLocaleString()}</td>
                  <td className="py-3">
                    <div className={getScoreColor(run.groundedness.percentage)}>
                      {run.groundedness.percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">{run.groundedness.count}</div>
                  </td>
                  <td className="py-3">
                    <div className={getScoreColor(run.coherence.percentage)}>
                      {run.coherence.percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">{run.coherence.count}</div>
                  </td>
                  <td className="py-3">
                    <div className={getScoreColor(run.relevance.percentage)}>
                      {run.relevance.percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">{run.relevance.count}</div>
                  </td>
                  <td className="py-3">
                    <div className={getScoreColor(run.deflectionScore.percentage)}>
                      {run.deflectionScore.percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">{run.deflectionScore.count}</div>
                  </td>
                  <td className="py-3">
                    <div className={getScoreColor(run.escalationSentiment.percentage)}>
                      {run.escalationSentiment.percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">{run.escalationSentiment.count}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Annotate Dialog */}
        {showAnnotateDialog && (
          <AnnotateDialog
            selectedCount={selectedRuns.size}
            onClose={() => setShowAnnotateDialog(false)}
            onStartAnnotation={handleStartAnnotation}
          />
        )}

        {/* Annotation Wizard */}
        {showAnnotationWizard && selectedTemplate && (
          <AnnotationWizard
            traces={getTracesFromSelectedRuns()}
            template={selectedTemplate}
            onComplete={handleAnnotationComplete}
            onClose={() => {
              setShowAnnotationWizard(false)
              setSelectedTemplate(null)
            }}
          />
        )}
      </div>
    )
  }

  // List View
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with search and create */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search evaluations by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-transparent border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary w-[280px]"
          />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-secondary hover:bg-secondary/80 text-foreground"
        >
          Create
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 py-3"></th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Name
              </th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Status of last run
              </th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Runs
              </th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Created by
              </th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Created on
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEvaluations.map((evaluation) => (
              <tr
                key={evaluation.id}
                onClick={() => setSelectedRow(evaluation.id)}
                className={`border-b border-border/50 cursor-pointer transition-colors ${
                  selectedRow === evaluation.id
                    ? "bg-secondary/30"
                    : "hover:bg-secondary/20"
                }`}
              >
                <td className="py-3 pl-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedRow === evaluation.id
                        ? "border-primary"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {selectedRow === evaluation.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </td>
                <td className="py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEvaluationClick(evaluation)
                    }}
                    className="text-sm text-primary hover:underline cursor-pointer text-left"
                  >
                    {evaluation.name}
                  </button>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm text-success">{evaluation.status}</span>
                  </div>
                </td>
                <td className="py-3">
                  <span className="text-sm text-foreground">{evaluation.runs}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm text-foreground">{evaluation.createdBy}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm text-foreground">{evaluation.createdOn}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Create Automatic Evaluation
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter evaluation name"
                  className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Evaluation Type
                </label>
                <select className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                  <option value="continuous">Continuous Evaluation</option>
                  <option value="single">Single Run</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Metrics
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Relevance
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Coherence
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" className="rounded" />
                    Fluency
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" className="rounded" />
                    Groundedness
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Description
                </label>
                <textarea
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowCreateModal(false)
                  alert("Evaluation created!")
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
