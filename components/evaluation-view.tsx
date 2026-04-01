"use client"

import { useState } from "react"
import { HumanEvaluationView } from "./human-evaluation-view"
import { AutomaticEvaluationView } from "./automatic-evaluation-view"
import { TestSuiteReview } from "./test-suite-review"

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

interface EvaluationViewProps {
  templates: EvaluationTemplate[]
  onCreateTemplate: (template: {
    name: string
    version: string
    description: string
    thumbQuestions: ThumbQuestion[]
    sliderQuestions: SliderQuestion[]
    multipleChoiceQuestions: MultipleChoiceQuestion[]
    freeFormQuestions: FreeFormQuestion[]
  }) => void
  onNavigateToMonitor?: () => void
}

const subTabs = [
  { label: "Test Suite", id: "testsuite" },
  { label: "Automatic Evaluation", id: "automatic" },
  { label: "Human Evaluation", id: "human" },
  { label: "Red team", id: "redteam" },
]

export function EvaluationView({ templates, onCreateTemplate, onNavigateToMonitor }: EvaluationViewProps) {
  const [activeSubTab, setActiveSubTab] = useState("testsuite")

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeSubTab === tab.id
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSubTab === "testsuite" && (
        <TestSuiteReview 
          onSkip={() => setActiveSubTab("automatic")}
          onEditEvaluators={() => setActiveSubTab("automatic")}
          onRunTestSuites={() => setActiveSubTab("automatic")}
          onNavigateToMonitor={onNavigateToMonitor}
        />
      )}

      {activeSubTab === "human" && (
        <HumanEvaluationView 
          templates={templates.map(t => ({
            ...t,
            thumbQuestions: t.thumbQuestions || [],
            sliderQuestions: t.sliderQuestions || [],
            multipleChoiceQuestions: t.multipleChoiceQuestions || [],
            freeFormQuestions: t.freeFormQuestions || [],
          }))}
          onCreateTemplate={onCreateTemplate}
        />
      )}

      {activeSubTab === "automatic" && <AutomaticEvaluationView />}

      {activeSubTab === "redteam" && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Red team content coming soon
        </div>
      )}
    </div>
  )
}
