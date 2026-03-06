"use client"

import { useState } from "react"
import { X, Trash2, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface CreateTemplateFormProps {
  onClose: () => void
  onSave: (template: {
    name: string
    version: string
    description: string
  }) => void
}

export function CreateTemplateForm({ onClose, onSave }: CreateTemplateFormProps) {
  const [name, setName] = useState("")
  const [version, setVersion] = useState("1")
  const [description, setDescription] = useState("")

  // Thumb up/down questions
  const [thumbQuestions, setThumbQuestions] = useState<ThumbQuestion[]>([
    { id: "1", label: "Groundedness" },
    { id: "2", label: "Fluency" },
  ])

  // Slider questions
  const [sliderQuestions, setSliderQuestions] = useState<SliderQuestion[]>([
    { id: "1", question: "What is your level of agreement with this response?", range: "1 - 5" },
  ])

  // Multiple choice questions
  const [multipleChoiceQuestions, setMultipleChoiceQuestions] = useState<MultipleChoiceQuestion[]>([
    {
      id: "1",
      question: "How would you rate the quality of this response?",
      options: [
        { id: "1", label: "Bad" },
        { id: "2", label: "Average" },
        { id: "3", label: "Good" },
      ],
    },
  ])

  // Free form questions
  const [freeFormQuestions, setFreeFormQuestions] = useState<FreeFormQuestion[]>([
    { id: "1", label: "Additional comments" },
  ])

  const addThumbQuestion = () => {
    setThumbQuestions([
      ...thumbQuestions,
      { id: Date.now().toString(), label: "" },
    ])
  }

  const removeThumbQuestion = (id: string) => {
    setThumbQuestions(thumbQuestions.filter((q) => q.id !== id))
  }

  const addSliderQuestion = () => {
    setSliderQuestions([
      ...sliderQuestions,
      { id: Date.now().toString(), question: "", range: "1 - 5" },
    ])
  }

  const removeSliderQuestion = (id: string) => {
    setSliderQuestions(sliderQuestions.filter((q) => q.id !== id))
  }

  const addMultipleChoiceQuestion = () => {
    setMultipleChoiceQuestions([
      ...multipleChoiceQuestions,
      {
        id: Date.now().toString(),
        question: "",
        options: [{ id: "1", label: "" }],
      },
    ])
  }

  const removeMultipleChoiceQuestion = (id: string) => {
    setMultipleChoiceQuestions(multipleChoiceQuestions.filter((q) => q.id !== id))
  }

  const addOptionToMultipleChoice = (questionId: string) => {
    setMultipleChoiceQuestions(
      multipleChoiceQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [...q.options, { id: Date.now().toString(), label: "" }],
            }
          : q
      )
    )
  }

  const removeOptionFromMultipleChoice = (questionId: string, optionId: string) => {
    setMultipleChoiceQuestions(
      multipleChoiceQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter((o) => o.id !== optionId),
            }
          : q
      )
    )
  }

  const addFreeFormQuestion = () => {
    setFreeFormQuestions([
      ...freeFormQuestions,
      { id: Date.now().toString(), label: "" },
    ])
  }

  const removeFreeFormQuestion = (id: string) => {
    setFreeFormQuestions(freeFormQuestions.filter((q) => q.id !== id))
  }

  const handleCreate = () => {
    onSave({ name, version, description })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Create human evaluation template
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and customize evaluation questions, with clear labels by type for easy use.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm text-foreground mb-1.5 block">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a friendly display name for your template"
              className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Version */}
          <div>
            <label className="text-sm text-foreground mb-1.5 block">
              Version <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-foreground mb-1.5 block">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Scoring method: thumb up/down */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Scoring method: thumb up/down
            </label>
            <div className="space-y-2">
              {thumbQuestions.map((q) => (
                <div key={q.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) =>
                      setThumbQuestions(
                        thumbQuestions.map((tq) =>
                          tq.id === q.id ? { ...tq, label: e.target.value } : tq
                        )
                      )
                    }
                    className="flex-1 px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => removeThumbQuestion(q.id)}
                    className="p-2 hover:bg-secondary/80 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addThumbQuestion}
              className="mt-2 text-xs"
            >
              Add
            </Button>
          </div>

          {/* Scoring method: slider */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Scoring method: slider
            </label>
            <div className="space-y-2">
              {sliderQuestions.map((q) => (
                <div key={q.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) =>
                      setSliderQuestions(
                        sliderQuestions.map((sq) =>
                          sq.id === q.id ? { ...sq, question: e.target.value } : sq
                        )
                      )
                    }
                    className="flex-1 px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="relative">
                    <select
                      value={q.range}
                      onChange={(e) =>
                        setSliderQuestions(
                          sliderQuestions.map((sq) =>
                            sq.id === q.id ? { ...sq, range: e.target.value } : sq
                          )
                        )
                      }
                      className="appearance-none px-3 py-2.5 pr-8 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="1 - 5">1 - 5</option>
                      <option value="1 - 10">1 - 10</option>
                      <option value="1 - 3">1 - 3</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  <button
                    onClick={() => removeSliderQuestion(q.id)}
                    className="p-2 hover:bg-secondary/80 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addSliderQuestion}
              className="mt-2 text-xs"
            >
              Add
            </Button>
          </div>

          {/* Scoring method: multiple choice */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Scoring method: multiple choice
            </label>
            <div className="space-y-3">
              {multipleChoiceQuestions.map((q) => (
                <div
                  key={q.id}
                  className="border border-border rounded-md p-3"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) =>
                        setMultipleChoiceQuestions(
                          multipleChoiceQuestions.map((mq) =>
                            mq.id === q.id ? { ...mq, question: e.target.value } : mq
                          )
                        )
                      }
                      placeholder="Enter question"
                      className="flex-1 px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={() => removeMultipleChoiceQuestion(q.id)}
                      className="p-2 hover:bg-secondary/80 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="space-y-2 ml-4">
                    {q.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-6">
                          {optionIndex + 1}:
                        </span>
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) =>
                            setMultipleChoiceQuestions(
                              multipleChoiceQuestions.map((mq) =>
                                mq.id === q.id
                                  ? {
                                      ...mq,
                                      options: mq.options.map((o) =>
                                        o.id === option.id
                                          ? { ...o, label: e.target.value }
                                          : o
                                      ),
                                    }
                                  : mq
                              )
                            )
                          }
                          className="flex-1 px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          onClick={() => removeOptionFromMultipleChoice(q.id, option.id)}
                          className="p-2 hover:bg-secondary/80 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOptionToMultipleChoice(q.id)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm ml-6"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addMultipleChoiceQuestion}
              className="mt-2 text-xs"
            >
              Add
            </Button>
          </div>

          {/* Scoring method: free form question */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Scoring method: free form question
            </label>
            <div className="space-y-2">
              {freeFormQuestions.map((q) => (
                <div key={q.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) =>
                      setFreeFormQuestions(
                        freeFormQuestions.map((fq) =>
                          fq.id === q.id ? { ...fq, label: e.target.value } : fq
                        )
                      )
                    }
                    className="flex-1 px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => removeFreeFormQuestion(q.id)}
                    className="p-2 hover:bg-secondary/80 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addFreeFormQuestion}
              className="mt-2 text-xs"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button
            variant="secondary"
            onClick={handleCreate}
            disabled={!name || !version}
            className="bg-secondary text-muted-foreground hover:text-foreground"
          >
            Create
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
