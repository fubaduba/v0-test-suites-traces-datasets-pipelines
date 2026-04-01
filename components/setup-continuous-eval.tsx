"use client"

import { useState } from "react"
import { Check, Database, Zap, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SetupContinuousEvalProps {
  onClose: () => void
  onComplete?: () => void
  onGenerateEvaluators?: () => void
  onNavigateToMonitor?: () => void
}

interface Evaluator {
  id: string
  name: string
  category: "quality" | "safety" | "custom"
  type: string
  enabled: boolean
  sourceTestSuite?: string
}

// Pre-populated evaluators from existing test suites
const existingEvaluatorsData: Evaluator[] = [
  { id: "1", name: "Task adherence", category: "quality", type: "built-in", enabled: true, sourceTestSuite: "support-quality-suite" },
  { id: "2", name: "Tool-call accuracy", category: "quality", type: "built-in", enabled: true, sourceTestSuite: "support-quality-suite" },
  { id: "3", name: "Coherence", category: "quality", type: "built-in", enabled: true, sourceTestSuite: "support-quality-suite" },
  { id: "4", name: "Booking accuracy", category: "custom", type: "custom rubric", enabled: false, sourceTestSuite: "support-quality-suite" },
  { id: "5", name: "Violence", category: "safety", type: "built-in", enabled: true, sourceTestSuite: "safety-red-team" },
  { id: "6", name: "Hate/unfairness", category: "safety", type: "built-in", enabled: true, sourceTestSuite: "safety-red-team" },
]

const existingDatasets = [
  { id: "1", name: "twitter-eval-dataset", items: 150, version: "v1" },
  { id: "2", name: "safety-attack-set", items: 40, version: "v2" },
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "quality":
      return { letter: "Q", color: "bg-blue-500/20 text-blue-400" }
    case "safety":
      return { letter: "S", color: "bg-red-500/20 text-red-400" }
    case "custom":
      return { letter: "C", color: "bg-amber-500/20 text-amber-400" }
    default:
      return { letter: "?", color: "bg-gray-500/20 text-gray-400" }
  }
}

export function SetupContinuousEval({ onClose, onComplete, onGenerateEvaluators, onNavigateToMonitor }: SetupContinuousEvalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [mode, setMode] = useState<"dataset-backed" | "sample-policy">("dataset-backed")
  const [evaluators, setEvaluators] = useState(existingEvaluatorsData)
  const [samplingRate, setSamplingRate] = useState(10)
  const [evalSchedule, setEvalSchedule] = useState("daily")
  const [timezone, setTimezone] = useState("UTC")
  const [ruleBasedFilter, setRuleBasedFilter] = useState(true)
  const [semanticDedup, setSemanticDedup] = useState(true)
  const [llmQualityGate, setLlmQualityGate] = useState(true)
  const [targetDataset, setTargetDataset] = useState("twitter-eval-dataset")
  const [datasetRefresh, setDatasetRefresh] = useState("weekly")
  const [alertThreshold, setAlertThreshold] = useState(70)
  const [alertEmail, setAlertEmail] = useState(true)
  const [alertPortal, setAlertPortal] = useState(true)
  const [alertWebhook, setAlertWebhook] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  const toggleEvaluator = (id: string) => {
    setEvaluators(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e))
  }

  const enabledEvaluators = evaluators.filter(e => e.enabled)
  const estimatedTraces = Math.round((samplingRate / 100) * 2400)

  const getEnabledFilters = () => {
    const filters = []
    if (ruleBasedFilter) filters.push("Quality")
    if (semanticDedup) filters.push("Dedup")
    if (llmQualityGate) filters.push("LLM gate")
    return filters.join(" + ") || "None"
  }

  const getAlertChannels = () => {
    const channels = []
    if (alertEmail) channels.push("Email")
    if (alertPortal) channels.push("Portal notification")
    if (alertWebhook) channels.push("Webhook")
    return channels.join(", ") || "None"
  }

  const handleComplete = () => {
    setIsComplete(true)
  }

  // Success state
  if (isComplete) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-6">
          <div className="p-5 bg-card border-l-4 border-l-success border-y border-r border-border rounded-r-lg">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-success mt-1.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">Continuous eval active</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Monitoring {samplingRate}% of production traffic. Evaluations will run {mode === "dataset-backed" ? evalSchedule : "continuously"}. Results will appear in the Monitor tab.
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <button 
                    onClick={() => {
                      onComplete?.()
                      onNavigateToMonitor?.()
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    View Monitor tab
                  </button>
                  <button 
                    onClick={() => setIsComplete(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Edit configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="p-6 space-y-6">
        {/* Back button */}
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to test suites
        </button>

        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Setup continuous eval</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure automated evaluation for your agent</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                step < currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : step === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-muted-foreground'
              }`}>
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${step < currentStep ? 'bg-primary' : 'bg-secondary'}`} />
              )}
            </div>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            Step {currentStep} of 3
          </span>
        </div>

        {/* Step 1: Mode Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-base font-medium text-foreground">Choose evaluation mode</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Dataset-backed option */}
              <button
                onClick={() => setMode("dataset-backed")}
                className={`p-5 rounded-lg border text-left transition-colors ${
                  mode === "dataset-backed" 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card hover:border-muted-foreground'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Dataset-backed</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Filter production traces into a curated dataset, then evaluate.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                    <span className="text-xs text-foreground">Automatic trace filtering (quality + dedup + LLM gate)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                    <span className="text-xs text-foreground">Dataset grows with production traffic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                    <span className="text-xs text-foreground">Supports offline comparison across versions</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">Recommended for agents in production</p>
              </button>

              {/* Sample policy option */}
              <button
                onClick={() => setMode("sample-policy")}
                className={`p-5 rounded-lg border text-left transition-colors ${
                  mode === "sample-policy" 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card hover:border-muted-foreground'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Sample policy</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Evaluate a percentage of live traces directly.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                    <span className="text-xs text-foreground">No dataset management needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                    <span className="text-xs text-foreground">Lower cost, faster setup</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">Best for lightweight monitoring</p>
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setCurrentStep(2)} className="bg-primary hover:bg-primary/90">
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {currentStep === 2 && (
          <div className="space-y-8">
            {/* Evaluators section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-foreground">Evaluators</h3>
              
              {evaluators.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {evaluators.map((evaluator) => {
                    const icon = getCategoryIcon(evaluator.category)
                    return (
                      <div
                        key={evaluator.id}
                        className={`p-4 rounded-lg border transition-colors ${evaluator.enabled ? 'border-border bg-card' : 'border-border/50 bg-secondary/30 opacity-60'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold ${icon.color}`}>
                              {icon.letter}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-foreground">{evaluator.name}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{evaluator.type}</p>
                              {evaluator.sourceTestSuite && (
                                <p className="text-xs text-muted-foreground/70 mt-0.5">from {evaluator.sourceTestSuite}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleEvaluator(evaluator.id)}
                            className={`relative w-9 h-5 rounded-full transition-colors ${evaluator.enabled ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${evaluator.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-4">No evaluators found for this agent</p>
                  <Button variant="outline" onClick={onGenerateEvaluators}>
                    Generate evaluators
                  </Button>
                </div>
              )}
            </div>

            {/* Sampling section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-foreground">Sampling</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Sampling rate</label>
                  <span className="text-sm font-medium text-foreground">{samplingRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={samplingRate}
                  onChange={(e) => setSamplingRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Approximately {estimatedTraces} traces/day will be evaluated based on current traffic.
                </p>
              </div>
            </div>

            {/* Dataset-backed specific sections */}
            {mode === "dataset-backed" && (
              <>
                {/* Eval schedule section */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-foreground">Eval schedule</h3>
                  <div className="flex items-center gap-4">
                    <select
                      value={evalSchedule}
                      onChange={(e) => setEvalSchedule(e.target.value)}
                      className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="hourly">Every hour</option>
                      <option value="6hours">Every 6 hours</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Evaluations will run on the selected schedule against sampled traces.
                  </p>
                </div>

                {/* Trace-to-dataset pipeline section */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-foreground">Trace-to-dataset pipeline</h3>
                  <div className="space-y-3">
                    {/* Rule-based quality filter */}
                    <div className={`p-4 rounded-lg border transition-colors ${ruleBasedFilter ? 'border-border bg-card' : 'border-border/50 bg-secondary/30'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Rule-based quality filter</h4>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">~80% retention</span>
                            <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">seconds</span>
                            <span className="px-2 py-0.5 text-xs bg-success/10 text-success rounded">no cost</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setRuleBasedFilter(!ruleBasedFilter)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${ruleBasedFilter ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${ruleBasedFilter ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Semantic deduplication */}
                    <div className={`p-4 rounded-lg border transition-colors ${semanticDedup ? 'border-border bg-card' : 'border-border/50 bg-secondary/30'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Semantic deduplication</h4>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">10-50% retention</span>
                            <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">minutes</span>
                            <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500 rounded">~$10/1M traces</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSemanticDedup(!semanticDedup)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${semanticDedup ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${semanticDedup ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>

                    {/* LLM quality gate */}
                    <div className={`p-4 rounded-lg border transition-colors ${llmQualityGate ? 'border-border bg-card' : 'border-border/50 bg-secondary/30'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">LLM quality gate</h4>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">30-50% retention</span>
                            <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">minutes</span>
                            <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500 rounded">variable cost</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setLlmQualityGate(!llmQualityGate)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${llmQualityGate ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${llmQualityGate ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Target dataset and refresh */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Target dataset</label>
                      <select
                        value={targetDataset}
                        onChange={(e) => setTargetDataset(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {existingDatasets.map(ds => (
                          <option key={ds.id} value={ds.name}>{ds.name} ({ds.items} items, {ds.version})</option>
                        ))}
                        <option value="new">Create new dataset</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Dataset refresh schedule</label>
                      <select
                        value={datasetRefresh}
                        onChange={(e) => setDatasetRefresh(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Alerting section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-foreground">Alerting</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-foreground">Alert when overall score drops below</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 0)}
                      className="w-16 px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground ml-1">%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Alert channels</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.checked)}
                        className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Email</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertPortal}
                        onChange={(e) => setAlertPortal(e.target.checked)}
                        className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Portal notification</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertWebhook}
                        onChange={(e) => setAlertWebhook(e.target.checked)}
                        className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Webhook</span>
                      <span className="px-1.5 py-0.5 text-xs bg-secondary text-muted-foreground rounded">longer term</span>
                    </label>
                    {alertWebhook && (
                      <input
                        type="url"
                        placeholder="https://your-webhook-url.com/alerts"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ml-7"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="bg-primary hover:bg-primary/90">
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review and confirm */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-base font-medium text-foreground">Review configuration</h3>
            
            <div className="p-5 bg-secondary/50 border border-border rounded-lg space-y-4">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Mode</span>
                <span className="text-sm font-medium text-foreground">
                  {mode === "dataset-backed" ? "Dataset-backed" : "Sample policy"}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Evaluators</span>
                <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                  {enabledEvaluators.map(e => e.name.toLowerCase().replace(/[/\s]/g, "_")).join(", ")}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Sampling rate</span>
                <span className="text-sm font-medium text-foreground">
                  {samplingRate}% (~{estimatedTraces} traces/day)
                </span>
              </div>
              
              {mode === "dataset-backed" && (
                <>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Eval schedule</span>
                    <span className="text-sm font-medium text-foreground">
                      {evalSchedule.charAt(0).toUpperCase() + evalSchedule.slice(1)} at {timezone}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Trace filters</span>
                    <span className="text-sm font-medium text-foreground">{getEnabledFilters()}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Target dataset</span>
                    <span className="text-sm font-medium text-foreground">
                      {targetDataset === "new" ? "Create new dataset" : `${targetDataset} v1`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Dataset refresh</span>
                    <span className="text-sm font-medium text-foreground">
                      {datasetRefresh.charAt(0).toUpperCase() + datasetRefresh.slice(1)}
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Alert threshold</span>
                <span className="text-sm font-medium text-foreground">{alertThreshold}%</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Alert channels</span>
                <span className="text-sm font-medium text-foreground">{getAlertChannels()}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button onClick={handleComplete} className="bg-primary hover:bg-primary/90">
                Enable continuous eval
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
