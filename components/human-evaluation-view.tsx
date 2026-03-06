"use client"

import { useState } from "react"
import { Plus, Download, Settings, X, Trash2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CreateTemplateForm } from "./create-template-form"

interface ThumbQuestion {
  id: string
  label: string
}

interface SliderQuestion {
  id: string
  question: string
  range: string
}

interface MultipleChoiceQuestion {
  id: string
  question: string
  options: { id: string; label: string }[]
}

interface FreeFormQuestion {
  id: string
  label: string
}

interface FullTemplateData {
  id: string
  name: string
  version?: string
  status: "Active" | "Inactive"
  thumbQuestions: ThumbQuestion[]
  sliderQuestions: SliderQuestion[]
  multipleChoiceQuestions: MultipleChoiceQuestion[]
  freeFormQuestions: FreeFormQuestion[]
  results: EvaluationResult[]
}

interface EvaluationResult {
  id: string
  timestamp: string
  traceId: string
  conversationId: string
  responseId: string
  thumbAnswers: Record<string, boolean | null>
  sliderAnswers: Record<string, number>
  multipleChoiceAnswers: Record<string, string>
  freeFormAnswers: Record<string, string>
}

interface HumanEvaluationViewProps {
  templates: FullTemplateData[]
  onCreateTemplate: (template: {
    name: string
    version: string
    description: string
    thumbQuestions: ThumbQuestion[]
    sliderQuestions: SliderQuestion[]
    multipleChoiceQuestions: MultipleChoiceQuestion[]
    freeFormQuestions: FreeFormQuestion[]
  }) => void
  onDeleteTemplate?: (templateId: string) => void
}

export function HumanEvaluationView({ templates, onCreateTemplate, onDeleteTemplate }: HumanEvaluationViewProps) {
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [selectedResult, setSelectedResult] = useState<EvaluationResult | null>(null)
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set())
  const [showOptimizeModal, setShowOptimizeModal] = useState(false)

  // Flatten all results from all templates with template info
  const allResults = templates.flatMap((template) =>
    template.results.map((result) => ({
      ...result,
      templateName: template.name,
      template,
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Toggle result selection
  const toggleResultSelection = (resultId: string) => {
    const newSelected = new Set(selectedResults)
    if (newSelected.has(resultId)) {
      newSelected.delete(resultId)
    } else {
      newSelected.add(resultId)
    }
    setSelectedResults(newSelected)
  }

  // Toggle all results
  const toggleAllResults = () => {
    if (selectedResults.size === allResults.length) {
      setSelectedResults(new Set())
    } else {
      setSelectedResults(new Set(allResults.map((r) => r.id)))
    }
  }

  // Get all unique score columns from templates
  const getScoreColumns = () => {
    const columns: { key: string; label: string; type: "thumb" | "slider" | "multipleChoice"; questionId: string }[] = []
    
    templates.forEach((template) => {
      template.thumbQuestions?.forEach((q) => {
        if (!columns.find((c) => c.label === q.label && c.type === "thumb")) {
          columns.push({ key: `thumb_${q.label}`, label: q.label, type: "thumb", questionId: q.id })
        }
      })
      template.sliderQuestions?.forEach((q) => {
        if (!columns.find((c) => c.label === q.question && c.type === "slider")) {
          columns.push({ key: `slider_${q.question}`, label: q.question, type: "slider", questionId: q.id })
        }
      })
      template.multipleChoiceQuestions?.forEach((q) => {
        if (!columns.find((c) => c.label === q.question && c.type === "multipleChoice")) {
          columns.push({ key: `mc_${q.question}`, label: q.question, type: "multipleChoice", questionId: q.id })
        }
      })
    })
    
    return columns
  }

  const scoreColumns = getScoreColumns()

  // Calculate aggregate stats for a column
  const getColumnStats = (column: { key: string; label: string; type: "thumb" | "slider" | "multipleChoice" }) => {
    if (column.type === "thumb") {
      let thumbsUp = 0
      let thumbsDown = 0
      let total = 0

      allResults.forEach((result) => {
        const question = result.template.thumbQuestions?.find((q) => q.label === column.label)
        if (question && result.thumbAnswers[question.id] !== undefined && result.thumbAnswers[question.id] !== null) {
          total++
          if (result.thumbAnswers[question.id] === true) thumbsUp++
          else thumbsDown++
        }
      })

      if (total === 0) return null
      const percentage = Math.round((thumbsUp / total) * 100)
      return { thumbsUp, thumbsDown, total, percentage }
    } else if (column.type === "slider") {
      const values: number[] = []
      allResults.forEach((result) => {
        const question = result.template.sliderQuestions?.find((q) => q.question === column.label)
        if (question && result.sliderAnswers[question.id] !== undefined) {
          values.push(result.sliderAnswers[question.id])
        }
      })
      if (values.length === 0) return null
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      return { avg: avg.toFixed(1), count: values.length }
    }
    return null
  }

  const getScoreValue = (
    result: EvaluationResult & { template: FullTemplateData },
    column: { key: string; label: string; type: "thumb" | "slider" | "multipleChoice" }
  ) => {
    if (column.type === "thumb") {
      const question = result.template.thumbQuestions?.find((q) => q.label === column.label)
      if (question && result.thumbAnswers[question.id] !== undefined) {
        const value = result.thumbAnswers[question.id]
        if (value === true) return <span className="text-success">Positive</span>
        if (value === false) return <span className="text-destructive">Negative</span>
        return <span className="text-muted-foreground">-</span>
      }
    } else if (column.type === "slider") {
      const question = result.template.sliderQuestions?.find((q) => q.question === column.label)
      if (question && result.sliderAnswers[question.id] !== undefined) {
        const value = result.sliderAnswers[question.id]
        const range = question.range.split(" - ").map(Number)
        const max = range[1] || 5
        const percentage = Math.round((value / max) * 100)
        return (
          <div className="flex items-center gap-2">
            <span>{value}/{max}</span>
            <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      }
    } else if (column.type === "multipleChoice") {
      const question = result.template.multipleChoiceQuestions?.find((q) => q.question === column.label)
      if (question && result.multipleChoiceAnswers[question.id]) {
        return <span className="text-foreground">{result.multipleChoiceAnswers[question.id]}</span>
      }
    }
    return <span className="text-muted-foreground">-</span>
  }

  const downloadResults = () => {
    const dataStr = JSON.stringify(allResults, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `human-evaluation-results.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleTemplateCreate = (template: {
    name: string
    version: string
    description: string
    thumbQuestions: ThumbQuestion[]
    sliderQuestions: SliderQuestion[]
    multipleChoiceQuestions: MultipleChoiceQuestion[]
    freeFormQuestions: FreeFormQuestion[]
  }) => {
    onCreateTemplate(template)
    setShowCreateTemplate(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-medium text-foreground">Evaluation Results</h3>
          {selectedResults.size > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
              {selectedResults.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOptimizeModal(true)}
            disabled={selectedResults.size === 0}
            className={selectedResults.size > 0 ? "border-primary text-primary hover:bg-primary/10" : ""}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Optimize
            {selectedResults.size > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                {selectedResults.size}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateManager(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Templates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadResults}
            disabled={allResults.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Aggregate Stats */}
      {allResults.length > 0 && scoreColumns.length > 0 && (
        <div className="px-6 py-3 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Aggregate Scores:
            </span>
            {scoreColumns.map((col) => {
              const stats = getColumnStats(col)
              if (!stats) return null
              
              if (col.type === "thumb" && "percentage" in stats) {
                return (
                  <div key={col.key} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{col.label}:</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${
                        stats.percentage >= 70 ? "text-success" : 
                        stats.percentage >= 40 ? "text-yellow-500" : "text-destructive"
                      }`}>
                        {stats.percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground">positive</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({stats.thumbsUp}/{stats.total})
                    </span>
                  </div>
                )
              } else if (col.type === "slider" && "avg" in stats) {
                return (
                  <div key={col.key} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{col.label.length > 20 ? col.label.substring(0, 20) + "..." : col.label}:</span>
                    <span className="text-sm font-medium text-foreground">{stats.avg}</span>
                    <span className="text-xs text-muted-foreground">avg ({stats.count} responses)</span>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="flex-1 overflow-auto">
        {allResults.length > 0 ? (
          <table className="w-full">
            <thead className="bg-secondary/30 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedResults.size === allResults.length && allResults.length > 0}
                    onCheckedChange={toggleAllResults}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Evaluated At
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Trace ID
                </th>
                {scoreColumns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap max-w-[150px] truncate"
                    title={col.label}
                  >
                    {col.label.length > 20 ? col.label.substring(0, 20) + "..." : col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((result) => (
                <tr
                  key={result.id}
                  className={`border-b border-border transition-colors cursor-pointer ${
                    selectedResults.has(result.id) ? "bg-primary/5" : "hover:bg-secondary/20"
                  }`}
                  onClick={() => toggleResultSelection(result.id)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedResults.has(result.id)}
                      onCheckedChange={() => toggleResultSelection(result.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                      {result.templateName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                    {result.timestamp}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                    {result.traceId.substring(0, 12)}...
                  </td>
                  {scoreColumns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm"
                    >
                      {getScoreValue(result, col)}
                    </td>
                  ))}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedResult(result)}
                      className="text-xs"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground py-16">
            <div className="text-center">
              <p className="text-sm mb-4">No evaluation results yet</p>
              <p className="text-xs text-muted-foreground">
                Select traces in the Traces tab and click Annotate to begin evaluating.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Optimize Modal */}
      {showOptimizeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Optimize from Evaluations</h2>
              </div>
              <button
                onClick={() => setShowOptimizeModal(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the {selectedResults.size} selected evaluation result{selectedResults.size > 1 ? "s" : ""} to improve your agent. Choose an optimization strategy:
              </p>

              <div className="space-y-3">
                <button
                  className="w-full p-4 text-left bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border transition-colors group"
                  onClick={() => {
                    setShowOptimizeModal(false)
                    alert("Tune Evaluators: This would use the selected results to fine-tune automatic evaluation metrics to better align with human judgments.")
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        Tune Evaluators
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Calibrate automatic evaluation metrics based on human feedback to improve alignment between automated and human scores.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  className="w-full p-4 text-left bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border transition-colors group"
                  onClick={() => {
                    setShowOptimizeModal(false)
                    alert("Improve Dataset: This would add the selected traces and their human evaluations to your training/evaluation dataset for the agent.")
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                      <Plus className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-success transition-colors">
                        Improve Dataset
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add the selected traces and their evaluations to the agent&apos;s evaluation suite to expand test coverage and quality benchmarks.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  className="w-full p-4 text-left bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border transition-colors group"
                  onClick={() => {
                    setShowOptimizeModal(false)
                    alert("Fine-tune Agent: This would use the selected results (especially highly-rated responses) to fine-tune the underlying model.")
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-chart-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-chart-4 transition-colors">
                        Fine-tune Agent
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use highly-rated responses as training examples to fine-tune the agent&apos;s underlying model for improved performance.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end">
              <Button variant="outline" onClick={() => setShowOptimizeModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Manage Templates</h2>
              <button
                onClick={() => setShowTemplateManager(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {templates.length > 0 ? (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          template.status === "Active" ? "bg-success" : "bg-muted-foreground"
                        }`} />
                        <div>
                          <span className="text-sm font-medium text-foreground">{template.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({template.results?.length || 0} results)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          template.status === "Active"
                            ? "bg-success/20 text-success"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {template.status}
                        </span>
                        {onDeleteTemplate && (
                          <button
                            onClick={() => onDeleteTemplate(template.id)}
                            className="p-1.5 hover:bg-secondary rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No templates created yet
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border">
              <Button
                onClick={() => {
                  setShowTemplateManager(false)
                  setShowCreateTemplate(true)
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <CreateTemplateForm
          onClose={() => setShowCreateTemplate(false)}
          onSave={handleTemplateCreate}
        />
      )}

      {/* Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Evaluation Details</h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="text-xs text-foreground font-mono whitespace-pre-wrap bg-secondary/30 p-4 rounded-md">
                {JSON.stringify(selectedResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
