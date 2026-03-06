"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TraceData {
  id: string
  conversationId: string
  traceId: string
  responseId: string
  startTime: string
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

interface Template {
  id: string
  name: string
  version: string
  thumbQuestions: ThumbQuestion[]
  sliderQuestions: SliderQuestion[]
  multipleChoiceQuestions: MultipleChoiceQuestion[]
  freeFormQuestions: FreeFormQuestion[]
}

interface AnnotationResult {
  traceId: string
  conversationId: string
  responseId: string
  startTime: string
  timestamp: string
  thumbAnswers: Record<string, boolean | null>
  sliderAnswers: Record<string, number>
  multipleChoiceAnswers: Record<string, string>
  freeFormAnswers: Record<string, string>
}

interface AnnotationWizardProps {
  traces: TraceData[]
  template: Template
  onClose: () => void
  onComplete: (results: AnnotationResult[]) => void
}

export function AnnotationWizard({ traces, template, onClose, onComplete }: AnnotationWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [annotations, setAnnotations] = useState<AnnotationResult[]>(
    traces.map((trace) => ({
      traceId: trace.traceId,
      conversationId: trace.conversationId,
      responseId: trace.responseId,
      startTime: trace.startTime,
      timestamp: new Date().toLocaleString(),
      thumbAnswers: {},
      sliderAnswers: {},
      multipleChoiceAnswers: {},
      freeFormAnswers: {},
    }))
  )

  const currentTrace = traces[currentIndex]
  const currentAnnotation = annotations[currentIndex]

  const updateCurrentAnnotation = (updates: Partial<AnnotationResult>) => {
    setAnnotations(
      annotations.map((a, i) => (i === currentIndex ? { ...a, ...updates } : a))
    )
  }

  const handleThumbAnswer = (questionId: string, value: boolean) => {
    updateCurrentAnnotation({
      thumbAnswers: {
        ...currentAnnotation.thumbAnswers,
        [questionId]: currentAnnotation.thumbAnswers[questionId] === value ? null : value,
      },
    })
  }

  const handleSliderAnswer = (questionId: string, value: number) => {
    updateCurrentAnnotation({
      sliderAnswers: {
        ...currentAnnotation.sliderAnswers,
        [questionId]: value,
      },
    })
  }

  const handleMultipleChoiceAnswer = (questionId: string, value: string) => {
    updateCurrentAnnotation({
      multipleChoiceAnswers: {
        ...currentAnnotation.multipleChoiceAnswers,
        [questionId]: value,
      },
    })
  }

  const handleFreeFormAnswer = (questionId: string, value: string) => {
    updateCurrentAnnotation({
      freeFormAnswers: {
        ...currentAnnotation.freeFormAnswers,
        [questionId]: value,
      },
    })
  }

  const goNext = () => {
    if (currentIndex < traces.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleComplete = () => {
    // Update timestamps for all annotations
    const finalAnnotations = annotations.map((a) => ({
      ...a,
      timestamp: new Date().toLocaleString(),
    }))
    onComplete(finalAnnotations)
  }

  const parseRange = (range: string): [number, number] => {
    const parts = range.split(" - ").map((p) => parseInt(p.trim()))
    return [parts[0], parts[1]]
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Annotate Trace ({currentIndex + 1} of {traces.length})
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Using template: {template.name} (v{template.version})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Trace Info */}
        <div className="px-6 py-4 bg-secondary/30 border-b border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Conversation ID:</span>
              <span className="ml-2 font-mono text-xs text-primary">
                {currentTrace.conversationId.substring(0, 30)}...
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Start Time:</span>
              <span className="ml-2 text-foreground">{currentTrace.startTime}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Trace ID:</span>
              <span className="ml-2 font-mono text-xs text-foreground">
                {currentTrace.traceId.substring(0, 20)}...
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Response ID:</span>
              <span className="ml-2 font-mono text-xs text-foreground">
                {currentTrace.responseId.substring(0, 25)}...
              </span>
            </div>
          </div>
        </div>

        {/* Annotation Form */}
        <div className="px-6 py-6 space-y-6">
          {/* Thumb up/down questions */}
          {template.thumbQuestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Thumbs Up/Down Evaluation
              </h3>
              <div className="space-y-3">
                {template.thumbQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-md"
                  >
                    <span className="text-sm text-foreground">{q.label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleThumbAnswer(q.id, true)}
                        className={`p-2 rounded-md transition-colors ${
                          currentAnnotation.thumbAnswers[q.id] === true
                            ? "bg-success/20 text-success"
                            : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleThumbAnswer(q.id, false)}
                        className={`p-2 rounded-md transition-colors ${
                          currentAnnotation.thumbAnswers[q.id] === false
                            ? "bg-destructive/20 text-destructive"
                            : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                        }`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slider questions */}
          {template.sliderQuestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Rating Scale
              </h3>
              <div className="space-y-4">
                {template.sliderQuestions.map((q) => {
                  const [min, max] = parseRange(q.range)
                  const value = currentAnnotation.sliderAnswers[q.id] ?? min
                  return (
                    <div key={q.id} className="p-3 bg-secondary/50 rounded-md">
                      <p className="text-sm text-foreground mb-3">{q.question}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground w-4">{min}</span>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={value}
                          onChange={(e) => handleSliderAnswer(q.id, parseInt(e.target.value))}
                          className="flex-1 accent-primary"
                        />
                        <span className="text-xs text-muted-foreground w-4">{max}</span>
                        <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-medium min-w-[2rem] text-center">
                          {value}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Multiple choice questions */}
          {template.multipleChoiceQuestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Multiple Choice
              </h3>
              <div className="space-y-4">
                {template.multipleChoiceQuestions.map((q) => (
                  <div key={q.id} className="p-3 bg-secondary/50 rounded-md">
                    <p className="text-sm text-foreground mb-3">{q.question}</p>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleMultipleChoiceAnswer(q.id, option.id)}
                          className={`px-4 py-2 text-sm rounded-md transition-colors ${
                            currentAnnotation.multipleChoiceAnswers[q.id] === option.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80 text-foreground"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Free form questions */}
          {template.freeFormQuestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Free Form Feedback
              </h3>
              <div className="space-y-4">
                {template.freeFormQuestions.map((q) => (
                  <div key={q.id}>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      {q.label}
                    </label>
                    <textarea
                      value={currentAnnotation.freeFormAnswers[q.id] || ""}
                      onChange={(e) => handleFreeFormAnswer(q.id, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
                      placeholder="Enter your feedback..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={goNext}
              disabled={currentIndex === traces.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Progress dots */}
            <div className="flex items-center gap-1 mr-4">
              {traces.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-primary"
                      : index < currentIndex
                        ? "bg-success"
                        : "bg-secondary"
                  }`}
                />
              ))}
            </div>

            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {currentIndex === traces.length - 1 ? (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleComplete}
              >
                Complete Annotation
              </Button>
            ) : (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={goNext}
              >
                Save & Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
