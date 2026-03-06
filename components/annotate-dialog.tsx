"use client"

import { useState } from "react"
import { X, Plus, ChevronDown } from "lucide-react"
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

interface MultipleChoiceOption {
  id: string
  label: string
}

interface MultipleChoiceQuestion {
  id: string
  question: string
  options: MultipleChoiceOption[]
}

interface FreeFormQuestion {
  id: string
  label: string
}

export interface FullTemplate {
  id: string
  name: string
  version: string
  thumbQuestions: ThumbQuestion[]
  sliderQuestions: SliderQuestion[]
  multipleChoiceQuestions: MultipleChoiceQuestion[]
  freeFormQuestions: FreeFormQuestion[]
}

interface AnnotateDialogProps {
  selectedCount: number
  onClose: () => void
  onStartAnnotation: (template: FullTemplate) => void
}

// Mock existing templates with full data
const existingTemplates: FullTemplate[] = [
  {
    id: "1",
    name: "Customer Support Evaluation",
    version: "2",
    thumbQuestions: [
      { id: "1", label: "Groundedness" },
      { id: "2", label: "Fluency" },
    ],
    sliderQuestions: [
      { id: "1", question: "What is your level of agreement with this response?", range: "1 - 5" },
    ],
    multipleChoiceQuestions: [
      {
        id: "1",
        question: "How would you rate the quality of this response?",
        options: [
          { id: "1", label: "Bad" },
          { id: "2", label: "Average" },
          { id: "3", label: "Good" },
        ],
      },
    ],
    freeFormQuestions: [
      { id: "1", label: "Additional comments" },
    ],
  },
  {
    id: "2",
    name: "Response Quality Check",
    version: "1",
    thumbQuestions: [
      { id: "1", label: "Accuracy" },
      { id: "2", label: "Helpfulness" },
    ],
    sliderQuestions: [
      { id: "1", question: "Rate the overall response quality", range: "1 - 10" },
    ],
    multipleChoiceQuestions: [],
    freeFormQuestions: [
      { id: "1", label: "Improvement suggestions" },
    ],
  },
  {
    id: "3",
    name: "Agent Performance Review",
    version: "3",
    thumbQuestions: [
      { id: "1", label: "Task Completion" },
      { id: "2", label: "Professional Tone" },
      { id: "3", label: "Correct Information" },
    ],
    sliderQuestions: [
      { id: "1", question: "How well did the agent handle the request?", range: "1 - 5" },
    ],
    multipleChoiceQuestions: [
      {
        id: "1",
        question: "Would you recommend this agent to others?",
        options: [
          { id: "1", label: "Definitely not" },
          { id: "2", label: "Probably not" },
          { id: "3", label: "Maybe" },
          { id: "4", label: "Probably yes" },
          { id: "5", label: "Definitely yes" },
        ],
      },
    ],
    freeFormQuestions: [
      { id: "1", label: "What could be improved?" },
      { id: "2", label: "What was done well?" },
    ],
  },
]

export function AnnotateDialog({ selectedCount, onClose, onStartAnnotation }: AnnotateDialogProps) {
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [templates, setTemplates] = useState<FullTemplate[]>(existingTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [showDropdown, setShowDropdown] = useState(false)

  const handleCreateTemplate = (template: { name: string; version: string; description: string }) => {
    const newTemplate: FullTemplate = {
      id: Date.now().toString(),
      name: template.name,
      version: template.version,
      thumbQuestions: [
        { id: "1", label: "Groundedness" },
        { id: "2", label: "Fluency" },
      ],
      sliderQuestions: [
        { id: "1", question: "What is your level of agreement with this response?", range: "1 - 5" },
      ],
      multipleChoiceQuestions: [
        {
          id: "1",
          question: "How would you rate the quality of this response?",
          options: [
            { id: "1", label: "Bad" },
            { id: "2", label: "Average" },
            { id: "3", label: "Good" },
          ],
        },
      ],
      freeFormQuestions: [
        { id: "1", label: "Additional comments" },
      ],
    }
    setTemplates([...templates, newTemplate])
    setSelectedTemplate(newTemplate.id)
    setShowCreateTemplate(false)
  }

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate)

  const handleStartAnnotation = () => {
    if (selectedTemplateData) {
      onStartAnnotation(selectedTemplateData)
    }
  }

  if (showCreateTemplate) {
    return (
      <CreateTemplateForm
        onClose={() => setShowCreateTemplate(false)}
        onSave={handleCreateTemplate}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Annotate Traces
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCount} trace{selectedCount !== 1 ? "s" : ""} selected for annotation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Template Selection */}
          <div>
            <label className="text-sm text-foreground mb-1.5 block">
              Select evaluation template
            </label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <span className={selectedTemplateData ? "text-foreground" : "text-muted-foreground"}>
                  {selectedTemplateData
                    ? `${selectedTemplateData.name} (v${selectedTemplateData.version})`
                    : "Choose a template..."}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id)
                        setShowDropdown(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
                    >
                      <span className="text-foreground">{template.name}</span>
                      <span className="text-muted-foreground ml-2">(v{template.version})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Create New Template */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-border"></div>
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowCreateTemplate(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Template
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button
            variant="secondary"
            onClick={handleStartAnnotation}
            disabled={!selectedTemplate}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground"
          >
            Start Annotation
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
