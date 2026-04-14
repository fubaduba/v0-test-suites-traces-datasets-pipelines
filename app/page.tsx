"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AgentHeader } from "@/components/agent-header"
import { TracesTable } from "@/components/traces-table"
import { EvaluationView } from "@/components/evaluation-view"
import { ContinuousEvalMonitor } from "@/components/continuous-eval-monitor"
import { DataView } from "@/components/data-view"

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

// Store annotations by trace ID
interface TraceAnnotation {
  traceId: string
  annotation: boolean | null // thumbs up = true, thumbs down = false
  comments: string
  timestamp: string
  feedbackKind: "thumbs" | "rating" | "text"
  source: "builder" | "end-user"
  userId: number
}

export default function AgentMonitoringPage() {
  const [activeTab, setActiveTab] = useState("traces")
  const [sidebarSection, setSidebarSection] = useState("agents")
  const [dataSubTab, setDataSubTab] = useState("datasets")
  const [traceAnnotations, setTraceAnnotations] = useState<Record<string, TraceAnnotation>>({
    // Prepopulated end-user annotations
    "7a6bf85a13a84c58b38d001f6e973870": {
      traceId: "7a6bf85a13a84c58b38d001f6e973870",
      annotation: true,
      comments: "Very helpful response!",
      timestamp: "3/5/26, 12:30:15 PM",
      feedbackKind: "thumbs",
      source: "end-user",
      userId: 10842,
    },
    "04d96fd4fdf19f69d0a55a6a5c22a5f0": {
      traceId: "04d96fd4fdf19f69d0a55a6a5c22a5f0",
      annotation: true,
      comments: "",
      timestamp: "3/5/26, 9:25:00 AM",
      feedbackKind: "thumbs",
      source: "end-user",
      userId: 10843,
    },
    "110169b515f177fead90686d80caef4a": {
      traceId: "110169b515f177fead90686d80caef4a",
      annotation: false,
      comments: "Response was too long and confusing",
      timestamp: "3/5/26, 9:24:30 AM",
      feedbackKind: "thumbs",
      source: "end-user",
      userId: 10844,
    },
    "a0566515dd63b9d27e34679210b34b39": {
      traceId: "a0566515dd63b9d27e34679210b34b39",
      annotation: true,
      comments: "",
      timestamp: "3/5/26, 9:24:00 AM",
      feedbackKind: "thumbs",
      source: "end-user",
      userId: 10845,
    },
    "62ee87ceaeab8eaaf1c9f7a3184a770f": {
      traceId: "62ee87ceaeab8eaaf1c9f7a3184a770f",
      annotation: false,
      comments: "Did not answer my question",
      timestamp: "3/5/26, 9:23:45 AM",
      feedbackKind: "thumbs",
      source: "end-user",
      userId: 10846,
    },
  })
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

    // Store annotations for display in traces table
    const newAnnotations: Record<string, TraceAnnotation> = { ...traceAnnotations }
    results.forEach((result) => {
      // Get the thumbs up/down value (assuming "1" is the Response Quality question ID)
      const thumbValue = result.thumbAnswers["1"] ?? null
      // Get comments (assuming "comments" is the additional comments question ID)
      const comments = result.freeFormAnswers["comments"] || ""
      
      newAnnotations[result.traceId] = {
        traceId: result.traceId,
        annotation: thumbValue,
        comments: comments,
        timestamp: result.timestamp,
        feedbackKind: "thumbs",
        source: "builder",
        userId: 1001, // Current builder user ID
      }
    })
    setTraceAnnotations(newAnnotations)

    // Stay on traces tab to show the annotations
    // setActiveTab("evaluation") - removed, stay on traces
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        activeSection={sidebarSection} 
        onSectionChange={(section) => {
          setSidebarSection(section)
          if (section === "data") {
            setActiveTab("data")
          } else if (section === "agents") {
            setActiveTab("traces")
          }
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Agent Header with tabs */}
        <AgentHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content based on active tab */}
        {activeTab === "traces" && (
          <TracesTable 
            onAnnotationComplete={handleAnnotationComplete} 
            annotations={traceAnnotations}
          />
        )}

        {activeTab === "evaluation" && (
          <EvaluationView
            templates={evaluationTemplates}
            onCreateTemplate={handleCreateTemplate}
            onNavigateToMonitor={() => setActiveTab("monitor")}
          />
        )}

        {activeTab === "playground" && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Playground content coming soon
          </div>
        )}

        {activeTab === "monitor" && (
          <ContinuousEvalMonitor />
        )}

        {activeTab === "data" && (
          <DataView 
            defaultSubTab={dataSubTab} 
            onClose={() => setActiveTab("traces")} 
          />
        )}
      </div>
    </div>
  )
}
