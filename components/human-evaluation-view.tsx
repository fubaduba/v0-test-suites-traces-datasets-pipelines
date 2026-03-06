"use client"

import { useState } from "react"
import { Plus, Download, Settings, X, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  // Flatten all results from all templates with template info
  const allResults = templates.flatMap((template) =>
    template.results.map((result) => ({
      ...result,
      templateName: template.name,
      template,
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Get all unique score columns from templates
  const getScoreColumns = () => {
    const columns: { key: string; label: string; type: "thumb" | "slider" | "multipleChoice" }[] = []
    
    templates.forEach((template) => {
      template.thumbQuestions?.forEach((q) => {
        if (!columns.find((c) => c.key === `thumb_${q.id}` && c.label === q.label)) {
          columns.push({ key: `thumb_${q.id}`, label: q.label, type: "thumb" })
        }
      })
      template.sliderQuestions?.forEach((q) => {
        if (!columns.find((c) => c.key === `slider_${q.id}` && c.label === q.question)) {
          columns.push({ key: `slider_${q.id}`, label: q.question, type: "slider" })
        }
      })
      template.multipleChoiceQuestions?.forEach((q) => {
        if (!columns.find((c) => c.key === `mc_${q.id}` && c.label === q.question)) {
          columns.push({ key: `mc_${q.id}`, label: q.question, type: "multipleChoice" })
        }
      })
    })
    
    return columns
  }

  const scoreColumns = getScoreColumns()

  const getScoreValue = (
    result: EvaluationResult & { template: FullTemplateData },
    column: { key: string; label: string; type: "thumb" | "slider" | "multipleChoice" }
  ) => {
    if (column.type === "thumb") {
      // Find matching question by label
      const question = result.template.thumbQuestions?.find((q) => q.label === column.label)
      if (question && result.thumbAnswers[question.id] !== undefined) {
        const value = result.thumbAnswers[question.id]
        if (value === true) return "👍"
        if (value === false) return "👎"
        return "-"
      }
    } else if (column.type === "slider") {
      const question = result.template.sliderQuestions?.find((q) => q.question === column.label)
      if (question && result.sliderAnswers[question.id] !== undefined) {
        return result.sliderAnswers[question.id].toString()
      }
    } else if (column.type === "multipleChoice") {
      const question = result.template.multipleChoiceQuestions?.find((q) => q.question === column.label)
      if (question && result.multipleChoiceAnswers[question.id]) {
        return result.multipleChoiceAnswers[question.id]
      }
    }
    return "-"
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
        <h3 className="text-base font-medium text-foreground">Evaluation Results</h3>
        <div className="flex items-center gap-2">
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
            Download results
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto">
        {allResults.length > 0 ? (
          <table className="w-full">
            <thead className="bg-secondary/30 sticky top-0">
              <tr>
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
                  className="border-b border-border hover:bg-secondary/20 transition-colors"
                >
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
                      className="px-4 py-3 text-sm text-foreground text-center"
                    >
                      {getScoreValue(result, col)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
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
