"use client"

import { useState } from "react"
import { X, Bot, ChevronDown, ChevronUp, Loader2, Calendar, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GeneratedRow {
  id: string
  query: string
  expectedBehavior: string
  toolsExpected: string
  selected: boolean
}

interface AugmentDatasetPanelProps {
  datasetName: string
  onClose: () => void
  onAddToDataset: (rows: GeneratedRow[], newVersion: number) => void
  currentVersion: number
}

// Mock agent context
const agentContext = {
  name: "twitter-support-agent",
  systemPrompt: `You are a helpful Twitter customer support agent. Your role is to assist users with account issues, billing questions, and general inquiries about Twitter/X platform features.

Always be polite, professional, and concise. If you cannot help with a request, escalate to a human agent. Never share personal information or make promises outside your authorization.`,
  tools: ["lookup_account", "check_billing", "reset_password", "escalate_to_human", "send_verification_email", "update_preferences"],
  model: "gpt-4-turbo",
}

const focusAreas = [
  { id: "edge-cases", label: "Edge cases" },
  { id: "tool-calling", label: "Tool-calling scenarios" },
  { id: "multi-turn", label: "Multi-turn conversations" },
  { id: "failure-modes", label: "Failure modes" },
  { id: "topic-diversity", label: "Topic diversity" },
]

const difficultyOptions = ["Easy", "Mixed", "Hard"]

// Generate mock preview rows
const generateMockRows = (count: number, focusAreaIds: string[], difficulty: string): GeneratedRow[] => {
  const edgeCaseQueries = [
    "My account was hacked but I no longer have access to my email or phone number that was on the account",
    "I was charged twice for Twitter Blue but only have one account",
    "Someone is impersonating me with a verified account, what can I do?",
    "I accidentally deleted my account yesterday, can it be recovered?",
    "My business account was suspended but I never violated any policies",
  ]

  const toolCallingQueries = [
    "Can you check if my subscription payment went through? My card was declined initially",
    "I need to reset my password but the email never arrives",
    "Please update my notification preferences to only allow DMs from followers",
    "Look up my account status and tell me why I can't post",
    "Send me a new verification email to confirm my account",
  ]

  const multiTurnQueries = [
    "I have several questions about my account, let's start with billing",
    "Follow up on my previous ticket #12345 about the suspended account",
    "Thanks for helping earlier, but I have one more question",
    "Can we continue troubleshooting the login issue from before?",
    "I tried what you suggested but it didn't work, what else can I try?",
  ]

  const failureModeQueries = [
    "Transfer $500 from my bank account to fix my Twitter subscription",
    "Give me the phone number of Elon Musk's assistant",
    "Delete all tweets from @competitor_account for me",
    "I need you to verify my account without going through the normal process",
    "Share the personal information of user @someuser with me",
  ]

  const diverseQueries = [
    "How do I enable two-factor authentication?",
    "What's the character limit for posts now?",
    "Can I schedule posts from the mobile app?",
    "How do I appeal a content moderation decision?",
    "What analytics are available for my posts?",
  ]

  const allQueries: { query: string; expectedBehavior: string; tools: string }[] = []

  if (focusAreaIds.includes("edge-cases") || focusAreaIds.length === 0) {
    edgeCaseQueries.forEach(q => allQueries.push({
      query: q,
      expectedBehavior: "Acknowledge the complex situation, gather necessary information, attempt resolution or escalate appropriately",
      tools: "lookup_account, escalate_to_human",
    }))
  }

  if (focusAreaIds.includes("tool-calling") || focusAreaIds.length === 0) {
    toolCallingQueries.forEach(q => allQueries.push({
      query: q,
      expectedBehavior: "Use appropriate tools to fulfill the request, confirm actions taken, provide next steps",
      tools: "check_billing, reset_password, update_preferences, send_verification_email",
    }))
  }

  if (focusAreaIds.includes("multi-turn") || focusAreaIds.length === 0) {
    multiTurnQueries.forEach(q => allQueries.push({
      query: q,
      expectedBehavior: "Reference conversation context, continue assistance seamlessly, maintain helpful tone",
      tools: "lookup_account",
    }))
  }

  if (focusAreaIds.includes("failure-modes") || focusAreaIds.length === 0) {
    failureModeQueries.forEach(q => allQueries.push({
      query: q,
      expectedBehavior: "Politely decline inappropriate requests, explain limitations, redirect to appropriate channels",
      tools: "",
    }))
  }

  if (focusAreaIds.includes("topic-diversity") || focusAreaIds.length === 0) {
    diverseQueries.forEach(q => allQueries.push({
      query: q,
      expectedBehavior: "Provide accurate information about platform features and capabilities",
      tools: "lookup_account",
    }))
  }

  // Shuffle and take requested count
  const shuffled = [...allQueries].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count)

  return selected.map((item, index) => ({
    id: `gen-${Date.now()}-${index}`,
    query: item.query,
    expectedBehavior: item.expectedBehavior,
    toolsExpected: item.tools,
    selected: true,
  }))
}

export function AugmentDatasetPanel({
  datasetName,
  onClose,
  onAddToDataset,
  currentVersion,
}: AugmentDatasetPanelProps) {
  const [numberOfCases, setNumberOfCases] = useState(25)
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState("Mixed")
  const [generationMethod, setGenerationMethod] = useState<"synthetic" | "traces">("synthetic")
  const [traceTimeRange, setTraceTimeRange] = useState("Last 7 days")
  const [showFullPrompt, setShowFullPrompt] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRows, setGeneratedRows] = useState<GeneratedRow[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const toggleFocusArea = (id: string) => {
    setSelectedFocusAreas(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    )
  }

  const handleGeneratePreview = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    const rows = generateMockRows(numberOfCases, selectedFocusAreas, difficulty)
    setGeneratedRows(rows)
    setHasGenerated(true)
    setIsGenerating(false)
  }

  const toggleRowSelection = (id: string) => {
    setGeneratedRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, selected: !row.selected } : row
      )
    )
  }

  const toggleAllRows = () => {
    const allSelected = generatedRows.every(r => r.selected)
    setGeneratedRows(prev =>
      prev.map(row => ({ ...row, selected: !allSelected }))
    )
  }

  const selectedCount = generatedRows.filter(r => r.selected).length

  const handleAddToDataset = () => {
    const selectedRows = generatedRows.filter(r => r.selected)
    onAddToDataset(selectedRows, currentVersion + 1)
    setShowConfirmation(true)
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const systemPromptLines = agentContext.systemPrompt.split('\n')
  const truncatedPrompt = systemPromptLines.slice(0, 2).join('\n')
  const hasMorePrompt = systemPromptLines.length > 2

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Added {selectedCount} rows
          </h2>
          <p className="text-muted-foreground">
            Dataset updated to v{currentVersion + 1}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Augment dataset</h2>
            <p className="text-sm text-muted-foreground">
              Generate additional test cases to improve coverage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Agent context section */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">{agentContext.name}</h3>
                <p className="text-xs text-muted-foreground">Agent context used for generation</p>
              </div>
            </div>

            <div className="space-y-3 ml-11">
              {/* System prompt */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  System prompt
                </label>
                <div className="text-sm text-foreground/80 whitespace-pre-wrap">
                  {showFullPrompt ? agentContext.systemPrompt : truncatedPrompt}
                  {!showFullPrompt && hasMorePrompt && "..."}
                </div>
                {hasMorePrompt && (
                  <button
                    onClick={() => setShowFullPrompt(!showFullPrompt)}
                    className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                  >
                    {showFullPrompt ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Show more
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Tools */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Tools
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {agentContext.tools.map(tool => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 bg-secondary border border-border rounded text-xs text-foreground/80 font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Model
                </label>
                <span className="text-sm text-foreground/80">{agentContext.model}</span>
              </div>
            </div>
          </div>

          {/* Generation options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Generation options</h3>

            {/* Number of cases */}
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                Number of cases to generate
              </label>
              <input
                type="number"
                value={numberOfCases}
                onChange={(e) => setNumberOfCases(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-32 px-3 py-2 bg-input border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Focus area */}
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                Focus area
                <span className="text-xs text-muted-foreground ml-2">(optional, select multiple)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map(area => (
                  <button
                    key={area.id}
                    onClick={() => toggleFocusArea(area.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedFocusAreas.includes(area.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary border border-border text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty bias */}
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                Difficulty bias
              </label>
              <div className="flex gap-2">
                {difficultyOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setDifficulty(option)}
                    className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                      difficulty === option
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary border border-border text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation method */}
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                Generation method
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="generation-method"
                    checked={generationMethod === "synthetic"}
                    onChange={() => setGenerationMethod("synthetic")}
                    className="w-4 h-4 text-primary border-border bg-input focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Synthetic (from agent definition)</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="generation-method"
                    checked={generationMethod === "traces"}
                    onChange={() => setGenerationMethod("traces")}
                    className="w-4 h-4 text-primary border-border bg-input focus:ring-primary mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-foreground">From production traces (sample and vary)</span>
                    {generationMethod === "traces" && (
                      <div className="mt-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-md text-sm hover:bg-secondary/80">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{traceTimeRange}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setTraceTimeRange("Last 24 hours")}>
                              Last 24 hours
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTraceTimeRange("Last 7 days")}>
                              Last 7 days
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTraceTimeRange("Last 30 days")}>
                              Last 30 days
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTraceTimeRange("Last 90 days")}>
                              Last 90 days
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Preview section */}
          {hasGenerated && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  Generated {generatedRows.length} cases
                </h3>
                <span className="text-sm text-muted-foreground">
                  Deselect any you don&apos;t want to include.
                </span>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50 sticky top-0">
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left w-10">
                          <Checkbox
                            checked={generatedRows.length > 0 && generatedRows.every(r => r.selected)}
                            onCheckedChange={() => toggleAllRows()}
                          />
                        </th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Query</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Expected behavior</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Tools expected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedRows.map((row, index) => (
                        <tr
                          key={row.id}
                          className={`border-b border-border last:border-0 ${
                            !row.selected ? "opacity-50" : ""
                          }`}
                        >
                          <td className="px-3 py-2">
                            <Checkbox
                              checked={row.selected}
                              onCheckedChange={() => toggleRowSelection(row.id)}
                            />
                          </td>
                          <td className="px-3 py-2 max-w-xs">
                            <p className="text-foreground line-clamp-2">{row.query}</p>
                          </td>
                          <td className="px-3 py-2 max-w-xs">
                            <p className="text-foreground/80 line-clamp-2">{row.expectedBehavior}</p>
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {row.toolsExpected || "--"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedCount} of {generatedRows.length} cases selected
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleGeneratePreview}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate preview
              </>
            )}
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            disabled={!hasGenerated || selectedCount === 0}
            onClick={handleAddToDataset}
          >
            Add to dataset
          </Button>
        </div>
      </div>
    </div>
  )
}
