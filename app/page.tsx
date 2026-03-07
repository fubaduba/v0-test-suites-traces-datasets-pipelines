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
      name: "Thumbs Up/Down",
      status: "Active",
      thumbQuestions: [
        { id: "1", label: "Response Quality" },
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

  const handleAnnotationComplete = (
    results: EvaluationResult[],
    templateName: string,
    templateData: {
      thumbQuestions: ThumbQuestion[]
      sliderQuestions: SliderQuestion[]
      multipleChoiceQuestions: MultipleChoiceQuestion[]
      freeFormQuestions: FreeFormQuestion[]
    }
  ) => {
    // Find or create the template in evaluation templates
    const existingIndex = evaluationTemplates.findIndex(
      (t) => t.name.toLowerCase() === templateName.toLowerCase()
    )

    if (existingIndex >= 0) {
      // Add results to existing template and update questions if they don't exist
      setEvaluationTemplates(
        evaluationTemplates.map((t, i) =>
          i === existingIndex
            ? {
                ...t,
                thumbQuestions: t.thumbQuestions?.length ? t.thumbQuestions : templateData.thumbQuestions,
                sliderQuestions: t.sliderQuestions?.length ? t.sliderQuestions : templateData.sliderQuestions,
                multipleChoiceQuestions: t.multipleChoiceQuestions?.length ? t.multipleChoiceQuestions : templateData.multipleChoiceQuestions,
                freeFormQuestions: t.freeFormQuestions?.length ? t.freeFormQuestions : templateData.freeFormQuestions,
                results: [...t.results, ...results],
              }
            : t
        )
      )
    } else {
      // Create new template with results and full template data
      const newTemplate: EvaluationTemplate = {
        id: Date.now().toString(),
        name: templateName,
        status: "Active",
        thumbQuestions: templateData.thumbQuestions,
        sliderQuestions: templateData.sliderQuestions,
        multipleChoiceQuestions: templateData.multipleChoiceQuestions,
        freeFormQuestions: templateData.freeFormQuestions,
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
