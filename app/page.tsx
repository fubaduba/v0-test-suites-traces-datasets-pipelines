"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AgentHeader } from "@/components/agent-header"
import { TracesTable } from "@/components/traces-table"
import { EvaluationView } from "@/components/evaluation-view"

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

interface EvaluationTemplate {
  id: string
  name: string
  status: "Active" | "Inactive"
  thumbQuestions?: ThumbQuestion[]
  sliderQuestions?: SliderQuestion[]
  multipleChoiceQuestions?: MultipleChoiceQuestion[]
  freeFormQuestions?: FreeFormQuestion[]
  results: EvaluationResult[]
}

export default function AgentMonitoringPage() {
  const [activeTab, setActiveTab] = useState("traces")
  const [evaluationTemplates, setEvaluationTemplates] = useState<EvaluationTemplate[]>([
    {
      id: "1",
      name: "test",
      status: "Active",
      thumbQuestions: [
        { id: "1", label: "Groundedness" },
        { id: "2", label: "Fluency" },
      ],
      sliderQuestions: [],
      multipleChoiceQuestions: [],
      freeFormQuestions: [],
      results: [],
    },
  ])

  const handleCreateTemplate = (template: {
    name: string
    version: string
    description: string
    thumbQuestions: ThumbQuestion[]
    sliderQuestions: SliderQuestion[]
    multipleChoiceQuestions: MultipleChoiceQuestion[]
    freeFormQuestions: FreeFormQuestion[]
  }) => {
    const newTemplate: EvaluationTemplate = {
      id: Date.now().toString(),
      name: template.name,
      status: "Active",
      thumbQuestions: template.thumbQuestions,
      sliderQuestions: template.sliderQuestions,
      multipleChoiceQuestions: template.multipleChoiceQuestions,
      freeFormQuestions: template.freeFormQuestions,
      results: [],
    }
    setEvaluationTemplates([...evaluationTemplates, newTemplate])
  }

  const handleAnnotationComplete = (results: EvaluationResult[], templateName: string) => {
    // Find or create the template in evaluation templates
    const existingIndex = evaluationTemplates.findIndex(
      (t) => t.name.toLowerCase() === templateName.toLowerCase()
    )

    if (existingIndex >= 0) {
      // Add results to existing template
      setEvaluationTemplates(
        evaluationTemplates.map((t, i) =>
          i === existingIndex
            ? { ...t, results: [...t.results, ...results] }
            : t
        )
      )
    } else {
      // Create new template with results
      const newTemplate: EvaluationTemplate = {
        id: Date.now().toString(),
        name: templateName,
        status: "Active",
        results: results,
      }
      setEvaluationTemplates([...evaluationTemplates, newTemplate])
    }

    // Switch to evaluation tab to show results
    setActiveTab("evaluation")
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Agent Header with tabs */}
        <AgentHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content based on active tab */}
        {activeTab === "traces" && (
          <TracesTable onAnnotationComplete={handleAnnotationComplete} />
        )}

        {activeTab === "evaluation" && (
          <EvaluationView
            templates={evaluationTemplates}
            onCreateTemplate={handleCreateTemplate}
          />
        )}

        {activeTab === "playground" && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Playground content coming soon
          </div>
        )}

        {activeTab === "monitor" && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Monitor content coming soon
          </div>
        )}
      </div>
    </div>
  )
}
