"use client"

import { useState } from "react"
import { Plus, Download, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateTemplateForm } from "./create-template-form"

interface EvaluationTemplate {
  id: string
  name: string
  status: "Active" | "Inactive"
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
  templates: EvaluationTemplate[]
  onCreateTemplate: (template: { name: string; version: string; description: string }) => void
}

export function HumanEvaluationView({ templates, onCreateTemplate }: HumanEvaluationViewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EvaluationTemplate | null>(
    templates.length > 0 ? templates[0] : null
  )
  const [selectedResult, setSelectedResult] = useState<EvaluationResult | null>(null)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const handleTemplateCreate = (template: { name: string; version: string; description: string }) => {
    onCreateTemplate(template)
    setShowCreateTemplate(false)
  }

  const downloadResults = () => {
    if (!selectedTemplate) return
    
    const dataStr = JSON.stringify(selectedTemplate.results, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${selectedTemplate.name}-results.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel - Templates list */}
      <div className="w-[400px] border-r border-border flex flex-col">
        {/* Table header */}
        <div className="grid grid-cols-2 px-4 py-3 border-b border-border bg-secondary/30">
          <span className="text-sm font-medium text-muted-foreground">Template name</span>
          <span className="text-sm font-medium text-muted-foreground">Status</span>
        </div>

        {/* Template rows */}
        <div className="flex-1 overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template)
                setSelectedResult(null)
              }}
              className={`grid grid-cols-2 px-4 py-3 border-b border-border cursor-pointer transition-colors ${
                selectedTemplate?.id === template.id
                  ? "bg-secondary/50"
                  : "hover:bg-secondary/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  template.status === "Active" ? "bg-success" : "bg-muted-foreground"
                }`} />
                <span className="text-sm text-foreground">{template.name}</span>
                <button className="p-1 hover:bg-secondary rounded">
                  <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <div>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  template.status === "Active"
                    ? "bg-secondary text-foreground"
                    : "bg-secondary/50 text-muted-foreground"
                }`}>
                  {template.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-1 hover:bg-secondary rounded text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">Prev</span>
          <span className="text-sm text-muted-foreground mx-2">Next</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1 hover:bg-secondary rounded text-muted-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Create button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setShowCreateTemplate(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Right panel - Evaluation results */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-medium text-foreground">Evaluation results</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadResults}
            disabled={!selectedTemplate || selectedTemplate.results.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Download results
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Agent responses list */}
          <div className="w-1/2 border-r border-border flex flex-col">
            <div className="px-6 py-3 border-b border-border">
              <h4 className="text-sm font-medium text-foreground">Agent responses</h4>
            </div>
            <div className="flex-1 overflow-y-auto">
              {selectedTemplate?.results && selectedTemplate.results.length > 0 ? (
                selectedTemplate.results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`w-full text-left px-6 py-3 border-b border-border transition-colors ${
                      selectedResult?.id === result.id
                        ? "bg-secondary/50"
                        : "hover:bg-secondary/30"
                    }`}
                  >
                    <span className="text-sm text-foreground">{result.timestamp}</span>
                  </button>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No evaluation results yet
                </div>
              )}
            </div>
          </div>

          {/* JSON output */}
          <div className="w-1/2 flex flex-col">
            <div className="px-6 py-3 border-b border-border">
              <h4 className="text-sm font-medium text-foreground">JSON output</h4>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {selectedResult ? (
                <pre className="text-xs text-foreground font-mono whitespace-pre-wrap bg-secondary/30 p-4 rounded-md">
                  {JSON.stringify(selectedResult, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a result to view JSON output
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <CreateTemplateForm
          onClose={() => setShowCreateTemplate(false)}
          onSave={handleTemplateCreate}
        />
      )}
    </div>
  )
}
