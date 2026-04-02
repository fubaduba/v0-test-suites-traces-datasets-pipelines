"use client"

import { useState } from "react"
import { X, Check, Search, ChevronDown, ChevronRight, Info, Upload, Download, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Types
type TargetType = "agent" | "model" | "dataset"
type WizardStep = 1 | 2 | 3 | 4

interface Agent {
  id: string
  name: string
  version: string
  type: string
  createdOn: string
  testSuites: TestSuite[]
}

interface Model {
  id: string
  name: string
  model: string
  version: string
  capabilities: string
  status: string
  createdOn: string
}

interface Dataset {
  id: string
  name: string
  version: number
  createdBy: string
  createdOn: string
  itemCount: number
}

interface TestSuite {
  id: string
  name: string
  kind: "dataset-backed" | "evaluator-only"
  evaluatorCount: number
  datasetName: string | null
  itemCount: number | null
  lastScore: number | null
}

interface Evaluator {
  id: string
  name: string
  category: "Quality" | "Safety"
  selected: boolean
}

interface FieldMapping {
  query: string
  response: string
  context: string
  groundTruth: string
  toolCalls: string
  toolDefinitions: string
}

// Mock data
const mockAgents: Agent[] = [
  { id: "1", name: "zava-outdoors-catalog", version: "v10", type: "prompt", createdOn: "3/1/26", testSuites: [
    { id: "ts1", name: "catalog-accuracy-suite", kind: "dataset-backed", evaluatorCount: 4, datasetName: "catalog-test-data", itemCount: 150, lastScore: 87 },
    { id: "ts2", name: "safety-checks", kind: "evaluator-only", evaluatorCount: 3, datasetName: null, itemCount: null, lastScore: 95 },
    { id: "ts3", name: "customer-satisfaction", kind: "dataset-backed", evaluatorCount: 5, datasetName: "customer-feedback", itemCount: 200, lastScore: 82 },
  ]},
  { id: "2", name: "twitter-support-agent", version: "v21", type: "prompt", createdOn: "2/15/26", testSuites: [] },
  { id: "3", name: "ado-reminder", version: "v2", type: "prompt", createdOn: "2/10/26", testSuites: [] },
  { id: "4", name: "Testagent", version: "v1", type: "prompt", createdOn: "2/5/26", testSuites: [] },
  { id: "5", name: "filisha-test", version: "v5", type: "prompt", createdOn: "1/28/26", testSuites: [] },
  { id: "6", name: "test-agent", version: "v1", type: "prompt", createdOn: "1/20/26", testSuites: [] },
  { id: "7", name: "bareboneagent", version: "v1", type: "prompt", createdOn: "1/15/26", testSuites: [] },
  { id: "8", name: "travel-booking-agent", version: "v8", type: "prompt", createdOn: "1/10/26", testSuites: [] },
]

const mockModels: Model[] = [
  { id: "1", name: "gpt-4.1", model: "gpt-4.1", version: "2025-04-14", capabilities: "Chat Completion, As...", status: "Succeeded", createdOn: "4/14/25" },
  { id: "2", name: "gpt-4.1-mini", model: "gpt-4.1-mini", version: "2025-04-14", capabilities: "Chat Completion, As...", status: "Succeeded", createdOn: "4/14/25" },
  { id: "3", name: "model-router", model: "model-router", version: "2025-03-01", capabilities: "Chat Completion", status: "Succeeded", createdOn: "3/1/25" },
]

const mockDatasets: Dataset[] = [
  { id: "1", name: "twitter-eval-dataset", version: 3, createdBy: "Sebastian K.", createdOn: "3/1/26", itemCount: 250 },
  { id: "2", name: "booking-test-cases", version: 2, createdBy: "Jane Smith", createdOn: "2/28/26", itemCount: 180 },
  { id: "3", name: "faq-golden-set", version: 5, createdBy: "System", createdOn: "2/25/26", itemCount: 320 },
  { id: "4", name: "safety-attack-set", version: 1, createdBy: "Security Team", createdOn: "2/20/26", itemCount: 100 },
  { id: "5", name: "sales-conversations", version: 4, createdBy: "Sales Team", createdOn: "2/15/26", itemCount: 450 },
  { id: "6", name: "customer-feedback", version: 2, createdBy: "Jane Smith", createdOn: "2/10/26", itemCount: 200 },
  { id: "7", name: "catalog-test-data", version: 1, createdBy: "Product Team", createdOn: "2/5/26", itemCount: 150 },
  { id: "8", name: "hr-policies-qa", version: 3, createdBy: "HR Team", createdOn: "2/1/26", itemCount: 85 },
]

const defaultEvaluators: Evaluator[] = [
  { id: "1", name: "task_adherence", category: "Quality", selected: true },
  { id: "2", name: "coherence", category: "Quality", selected: true },
  { id: "3", name: "fluency", category: "Quality", selected: false },
  { id: "4", name: "relevance", category: "Quality", selected: true },
  { id: "5", name: "groundedness", category: "Quality", selected: false },
  { id: "6", name: "violence", category: "Safety", selected: true },
  { id: "7", name: "self_harm", category: "Safety", selected: true },
  { id: "8", name: "hate_unfairness", category: "Safety", selected: true },
  { id: "9", name: "sexual", category: "Safety", selected: false },
]

const availableFields = ["id", "query", "test_case_description", "expected_response", "context"]

interface CreateEvaluationWizardProps {
  onClose: () => void
  preselectedAgentName?: string
}

export function CreateEvaluationWizard({ onClose, preselectedAgentName }: CreateEvaluationWizardProps) {
  // Step state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set())
  const [autoConfiguredFromSuite, setAutoConfiguredFromSuite] = useState<string | null>(null)
  
  // Step 1 state
  const [targetType, setTargetType] = useState<TargetType>("agent")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(
    preselectedAgentName ? mockAgents.find(a => a.name === preselectedAgentName) || null : null
  )
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showTestSuiteSelection, setShowTestSuiteSelection] = useState(false)
  const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | null>(null)
  
  // Step 2 state
  const [dataSource, setDataSource] = useState<"generate" | "existing">("existing")
  const [step2Dataset, setStep2Dataset] = useState<Dataset | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPreview, setGeneratedPreview] = useState<string[] | null>(null)
  
  // Step 3 state
  const [judgeModel, setJudgeModel] = useState("gpt-4.1")
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    query: "{{item.query}}",
    response: "Not available",
    context: "Not available",
    groundTruth: "Not available",
    toolCalls: "Not available",
    toolDefinitions: "Not available",
  })
  const [evaluators, setEvaluators] = useState<Evaluator[]>(defaultEvaluators)
  const [showAutoDetectBanner, setShowAutoDetectBanner] = useState(true)
  
  // Step 4 state
  const [saveAsTestSuite, setSaveAsTestSuite] = useState(false)
  const [enableContinuousEval, setEnableContinuousEval] = useState(false)
  const [samplingRate, setSamplingRate] = useState(10)
  const [schedule, setSchedule] = useState("daily")

  // Helpers
  const getStepStatus = (step: WizardStep): "completed" | "current" | "upcoming" | "auto-configured" => {
    if (autoConfiguredFromSuite && (step === 2 || step === 3)) return "auto-configured"
    if (completedSteps.has(step)) return "completed"
    if (step === currentStep) return "current"
    return "upcoming"
  }

  const canProceedFromStep1 = () => {
    if (targetType === "agent") return selectedAgent !== null
    if (targetType === "model") return selectedModel !== null
    if (targetType === "dataset") return selectedDataset !== null
    return false
  }

  const handleNext = () => {
    if (currentStep === 1) {
      setCompletedSteps(prev => new Set([...prev, 1]))
      if (autoConfiguredFromSuite) {
        setCurrentStep(4)
      } else if (targetType === "dataset") {
        // Skip step 2 if dataset is already selected
        setCompletedSteps(prev => new Set([...prev, 1, 2]))
        setCurrentStep(3)
      } else {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      setCompletedSteps(prev => new Set([...prev, 2]))
      setCurrentStep(3)
    } else if (currentStep === 3) {
      setCompletedSteps(prev => new Set([...prev, 3]))
      setCurrentStep(4)
    }
  }

  const handleBack = () => {
    if (currentStep === 4 && autoConfiguredFromSuite) {
      setAutoConfiguredFromSuite(null)
      setCurrentStep(1)
    } else if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep)
    }
  }

  const handleUseTestSuite = (suite: TestSuite) => {
    setSelectedTestSuite(suite)
    setAutoConfiguredFromSuite(suite.name)
    // Pre-fill evaluators from suite
    if (suite.datasetName) {
      const dataset = mockDatasets.find(d => d.name === suite.datasetName)
      if (dataset) setStep2Dataset(dataset)
    }
    setCompletedSteps(new Set([1, 2, 3]))
    setCurrentStep(4)
  }

  const handleGenerateSynthetic = () => {
    setIsGenerating(true)
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false)
      setGeneratedPreview([
        "What are your return policies for outdoor gear?",
        "Can I track my order shipment?",
        "Do you offer price matching?",
        "What payment methods do you accept?",
        "How do I cancel my subscription?",
      ])
    }, 2000)
  }

  const toggleEvaluator = (id: string) => {
    setEvaluators(prev => prev.map(e => 
      e.id === id ? { ...e, selected: !e.selected } : e
    ))
  }

  const getSelectedTargetName = () => {
    if (targetType === "agent" && selectedAgent) return `${selectedAgent.name} (${selectedAgent.version})`
    if (targetType === "model" && selectedModel) return selectedModel.name
    if (targetType === "dataset" && selectedDataset) return selectedDataset.name
    return ""
  }

  const getSelectedDatasetInfo = () => {
    if (targetType === "dataset" && selectedDataset) {
      return { name: selectedDataset.name, itemCount: selectedDataset.itemCount, version: selectedDataset.version }
    }
    if (step2Dataset) {
      return { name: step2Dataset.name, itemCount: step2Dataset.itemCount, version: step2Dataset.version }
    }
    if (selectedTestSuite?.datasetName) {
      const dataset = mockDatasets.find(d => d.name === selectedTestSuite.datasetName)
      if (dataset) return { name: dataset.name, itemCount: dataset.itemCount, version: dataset.version }
    }
    if (generatedPreview) {
      return { name: "Synthetic dataset", itemCount: generatedPreview.length, version: 1 }
    }
    return null
  }

  const selectedEvaluators = evaluators.filter(e => e.selected)

  // Filter data based on search
  const filteredAgents = mockAgents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredModels = mockModels.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredDatasets = mockDatasets.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create new evaluation</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Step Navigation */}
          <div className="w-72 border-r border-border p-4 overflow-y-auto">
            {/* Step 1 */}
            <StepAccordion
              step={1}
              title="Target"
              subtitle={selectedAgent ? `Agent: ${selectedAgent.name}` : selectedModel ? `Model: ${selectedModel.name}` : selectedDataset ? `Dataset: ${selectedDataset.name}` : "Tell us what you'd like to evaluate."}
              status={getStepStatus(1)}
              isExpanded={currentStep === 1}
              onClick={() => !autoConfiguredFromSuite && setCurrentStep(1)}
            />

            {/* Step 2 */}
            <StepAccordion
              step={2}
              title="Data"
              subtitle={getStepStatus(2) === "auto-configured" ? "Auto-configured from test suite" : step2Dataset ? step2Dataset.name : generatedPreview ? "Synthetic dataset" : "Select or generate data"}
              status={getStepStatus(2)}
              isExpanded={currentStep === 2}
              onClick={() => !autoConfiguredFromSuite && completedSteps.has(1) && targetType !== "dataset" && setCurrentStep(2)}
              disabled={targetType === "dataset"}
            />

            {/* Step 3 */}
            <StepAccordion
              step={3}
              title="Criteria"
              subtitle={getStepStatus(3) === "auto-configured" ? "Auto-configured from test suite" : `${selectedEvaluators.length} evaluators selected`}
              status={getStepStatus(3)}
              isExpanded={currentStep === 3}
              onClick={() => !autoConfiguredFromSuite && (completedSteps.has(2) || targetType === "dataset") && setCurrentStep(3)}
            />

            {/* Step 4 */}
            <StepAccordion
              step={4}
              title="Review"
              subtitle="Review and run"
              status={getStepStatus(4)}
              isExpanded={currentStep === 4}
              onClick={() => completedSteps.has(3) && setCurrentStep(4)}
            />

            {/* Navigation buttons at bottom of left panel */}
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="w-full">
                  Back
                </Button>
              )}
              {currentStep < 4 && (
                <Button 
                  onClick={handleNext} 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={currentStep === 1 && !canProceedFromStep1()}
                >
                  Next
                </Button>
              )}
              {currentStep === 4 && (
                <Button 
                  onClick={onClose} 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Run evaluation
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel - Step Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Target */}
            {currentStep === 1 && !showTestSuiteSelection && (
              <div className="space-y-6">
                {/* Target Type Selection */}
                <div className="space-y-3">
                  <TargetOption
                    label="Agent"
                    description="Evaluate the quality and safety of an agent"
                    selected={targetType === "agent"}
                    onClick={() => {
                      setTargetType("agent")
                      setSelectedModel(null)
                      setSelectedDataset(null)
                    }}
                  />
                  <TargetOption
                    label="Model"
                    description="Evaluate the quality and safety of a model deployment"
                    selected={targetType === "model"}
                    onClick={() => {
                      setTargetType("model")
                      setSelectedAgent(null)
                      setSelectedDataset(null)
                    }}
                  />
                  <TargetOption
                    label="Dataset"
                    description="Evaluate an existing query-response dataset"
                    selected={targetType === "dataset"}
                    onClick={() => {
                      setTargetType("dataset")
                      setSelectedAgent(null)
                      setSelectedModel(null)
                    }}
                  />
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Search ${targetType}s`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Agent Table */}
                {targetType === "agent" && (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-8"></TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Name</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Version</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Type</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Date created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAgents.map((agent) => (
                          <TableRow
                            key={agent.id}
                            className={`cursor-pointer ${selectedAgent?.id === agent.id ? "bg-primary/10" : ""}`}
                            onClick={() => setSelectedAgent(agent)}
                          >
                            <TableCell>
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                selectedAgent?.id === agent.id 
                                  ? "border-primary bg-primary" 
                                  : "border-border"
                              }`}>
                                {selectedAgent?.id === agent.id && (
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{agent.name}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                                {agent.version}
                                <ChevronDown className="w-3 h-3" />
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{agent.type}</TableCell>
                            <TableCell className="text-muted-foreground">{agent.createdOn}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <p className="text-xs text-muted-foreground">1-{filteredAgents.length} of 14</p>

                    {/* Test Suite Banner */}
                    {selectedAgent && selectedAgent.testSuites.length > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">
                              This agent has {selectedAgent.testSuites.length} test suite{selectedAgent.testSuites.length !== 1 ? "s" : ""} configured. You can run an existing test suite or create a custom evaluation.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => setShowTestSuiteSelection(true)}
                              >
                                Use existing test suite
                              </Button>
                              <Button size="sm" variant="outline">
                                Continue with custom
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Test Suite Banner */}
                    {selectedAgent && selectedAgent.testSuites.length === 0 && (
                      <div className="bg-muted/50 border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">
                              This agent has no test suites. Want to auto-generate one?
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Button size="sm" variant="outline">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate test suite
                              </Button>
                              <Button size="sm" variant="outline">
                                Continue manually
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Model Table */}
                {targetType === "model" && (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-8"></TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Name</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Model</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Version</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Capabilities</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Date created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredModels.map((model) => (
                          <TableRow
                            key={model.id}
                            className={`cursor-pointer ${selectedModel?.id === model.id ? "bg-primary/10" : ""}`}
                            onClick={() => setSelectedModel(model)}
                          >
                            <TableCell>
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                selectedModel?.id === model.id 
                                  ? "border-primary bg-primary" 
                                  : "border-border"
                              }`}>
                                {selectedModel?.id === model.id && (
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{model.name}</TableCell>
                            <TableCell className="text-muted-foreground">{model.model}</TableCell>
                            <TableCell className="text-muted-foreground">{model.version}</TableCell>
                            <TableCell className="text-muted-foreground">{model.capabilities}</TableCell>
                            <TableCell>
                              <span className="text-success">{model.status}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{model.createdOn}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}

                {/* Dataset Table */}
                {targetType === "dataset" && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-foreground">Select your file</h3>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download data sample
                        </Button>
                        <Button size="sm" variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload new dataset
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-8"></TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Name</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Version</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Created by</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Created on</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDatasets.map((dataset) => (
                          <TableRow
                            key={dataset.id}
                            className={`cursor-pointer ${selectedDataset?.id === dataset.id ? "bg-primary/10" : ""}`}
                            onClick={() => setSelectedDataset(dataset)}
                          >
                            <TableCell>
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                selectedDataset?.id === dataset.id 
                                  ? "border-primary bg-primary" 
                                  : "border-border"
                              }`}>
                                {selectedDataset?.id === dataset.id && (
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{dataset.name}</TableCell>
                            <TableCell className="text-muted-foreground">{dataset.version}</TableCell>
                            <TableCell className="text-muted-foreground">{dataset.createdBy}</TableCell>
                            <TableCell className="text-muted-foreground">{dataset.createdOn}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </div>
            )}

            {/* Step 1: Test Suite Selection */}
            {currentStep === 1 && showTestSuiteSelection && selectedAgent && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTestSuiteSelection(false)}
                  >
                    <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                    Back
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Select a test suite for {selectedAgent.name}
                  </span>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="text-xs text-muted-foreground font-medium">Name</TableHead>
                      <TableHead className="text-xs text-muted-foreground font-medium">Kind</TableHead>
                      <TableHead className="text-xs text-muted-foreground font-medium">Evaluators</TableHead>
                      <TableHead className="text-xs text-muted-foreground font-medium">Dataset</TableHead>
                      <TableHead className="text-xs text-muted-foreground font-medium">Last score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedAgent.testSuites.map((suite) => (
                      <TableRow
                        key={suite.id}
                        className={`cursor-pointer ${selectedTestSuite?.id === suite.id ? "bg-primary/10" : ""}`}
                        onClick={() => setSelectedTestSuite(suite)}
                      >
                        <TableCell>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedTestSuite?.id === suite.id 
                              ? "border-primary bg-primary" 
                              : "border-border"
                          }`}>
                            {selectedTestSuite?.id === suite.id && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{suite.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                            suite.kind === "dataset-backed" 
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}>
                            {suite.kind}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{suite.evaluatorCount}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {suite.datasetName ? `${suite.datasetName} (${suite.itemCount} items)` : "--"}
                        </TableCell>
                        <TableCell>
                          {suite.lastScore !== null ? (
                            <span className={`font-medium ${
                              suite.lastScore >= 80 ? "text-success" :
                              suite.lastScore >= 60 ? "text-amber-500" :
                              "text-destructive"
                            }`}>
                              {suite.lastScore}%
                            </span>
                          ) : "--"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {selectedTestSuite && (
                  <Button
                    className="mt-4 bg-primary hover:bg-primary/90"
                    onClick={() => handleUseTestSuite(selectedTestSuite)}
                  >
                    Use this test suite
                  </Button>
                )}
              </div>
            )}

            {/* Step 2: Data */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {targetType === "agent" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Select data source</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setDataSource("generate")}
                        className={`p-4 rounded-lg border text-left transition-colors ${
                          dataSource === "generate"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <Sparkles className="w-5 h-5 text-primary mb-2" />
                        <h4 className="text-sm font-medium text-foreground">Generate synthetic dataset</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Generate test cases based on agent context
                        </p>
                      </button>
                      <button
                        onClick={() => setDataSource("existing")}
                        className={`p-4 rounded-lg border text-left transition-colors ${
                          dataSource === "existing"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <Upload className="w-5 h-5 text-muted-foreground mb-2" />
                        <h4 className="text-sm font-medium text-foreground">Use existing dataset</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select from your uploaded datasets
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {dataSource === "generate" && targetType === "agent" && (
                  <div className="space-y-4">
                    {!generatedPreview && !isGenerating && (
                      <Button onClick={handleGenerateSynthetic} className="bg-primary hover:bg-primary/90">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate dataset
                      </Button>
                    )}
                    
                    {isGenerating && (
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="text-sm text-foreground">Generating synthetic test cases...</span>
                      </div>
                    )}

                    {generatedPreview && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Preview ({generatedPreview.length} test cases)</h4>
                        <div className="space-y-2">
                          {generatedPreview.map((query, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-md text-sm text-foreground">
                              {query}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(dataSource === "existing" || targetType === "model") && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search by file name"
                        className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-8"></TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Name</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Version</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Created by</TableHead>
                          <TableHead className="text-xs text-muted-foreground font-medium">Created on</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockDatasets.map((dataset) => (
                          <TableRow
                            key={dataset.id}
                            className={`cursor-pointer ${step2Dataset?.id === dataset.id ? "bg-primary/10" : ""}`}
                            onClick={() => setStep2Dataset(dataset)}
                          >
                            <TableCell>
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                step2Dataset?.id === dataset.id 
                                  ? "border-primary bg-primary" 
                                  : "border-border"
                              }`}>
                                {step2Dataset?.id === dataset.id && (
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{dataset.name}</TableCell>
                            <TableCell className="text-muted-foreground">{dataset.version}</TableCell>
                            <TableCell className="text-muted-foreground">{dataset.createdBy}</TableCell>
                            <TableCell className="text-muted-foreground">{dataset.createdOn}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Criteria */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left: Field Mapping */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Map your file columns to the standard evaluator fields.</h3>
                    
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">
                        Judge model <span className="text-primary">*</span>
                      </label>
                      <Select value={judgeModel} onValueChange={setJudgeModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
                          <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
                          <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {showAutoDetectBanner && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          We&apos;ve auto-detected likely matches.
                        </span>
                        <button
                          onClick={() => setShowAutoDetectBanner(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      {Object.entries(fieldMapping).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-xs text-muted-foreground mb-1.5 block capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <Select 
                            value={value} 
                            onValueChange={(v) => setFieldMapping(prev => ({ ...prev, [key]: v }))}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not available">Not available</SelectItem>
                              <SelectItem value="{{item.query}}">{"{{item.query}}"}</SelectItem>
                              <SelectItem value="{{item.response}}">{"{{item.response}}"}</SelectItem>
                              <SelectItem value="{{item.context}}">{"{{item.context}}"}</SelectItem>
                              <SelectItem value="{{item.expected_response}}">{"{{item.expected_response}}"}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Instructions */}
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Available fields in your file:</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableFields.map((field) => (
                          <span key={field} className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Why field mapping now?</h4>
                      <p className="text-xs text-muted-foreground">
                        Field mapping helps evaluators understand the structure of your data. Query is your input, Response is what the agent generated, and Ground truth is the expected answer.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                      <h4 className="text-sm font-medium text-foreground">What evaluators are not auto-selected here?</h4>
                      <p className="text-xs text-muted-foreground">
                        Azure OpenAI evaluators and custom templates need to be manually configured below.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evaluator Selection */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-4">Select evaluators</h3>
                  
                  {/* Quality Evaluators */}
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Quality</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {evaluators.filter(e => e.category === "Quality").map((evaluator) => (
                        <EvaluatorCard
                          key={evaluator.id}
                          evaluator={evaluator}
                          onToggle={() => toggleEvaluator(evaluator.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Safety Evaluators */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Safety</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {evaluators.filter(e => e.category === "Safety").map((evaluator) => (
                        <EvaluatorCard
                          key={evaluator.id}
                          evaluator={evaluator}
                          onToggle={() => toggleEvaluator(evaluator.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {autoConfiguredFromSuite && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-foreground">
                      Configured from test suite: <span className="font-medium">{autoConfiguredFromSuite}</span>
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Target</h4>
                      <p className="text-sm text-foreground">{getSelectedTargetName()}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Dataset</h4>
                      {getSelectedDatasetInfo() ? (
                        <p className="text-sm text-foreground">
                          {getSelectedDatasetInfo()!.name} ({getSelectedDatasetInfo()!.itemCount} items, v{getSelectedDatasetInfo()!.version})
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No dataset selected</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Evaluators ({selectedEvaluators.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvaluators.map((evaluator) => (
                        <span
                          key={evaluator.id}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                            evaluator.category === "Quality"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {evaluator.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Judge model</h4>
                      <p className="text-sm text-foreground">{judgeModel}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Field mapping</h4>
                      <p className="text-sm text-foreground">Query: {fieldMapping.query}</p>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAsTestSuite}
                      onChange={(e) => setSaveAsTestSuite(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-border bg-input accent-primary"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">Save as test suite</span>
                      <p className="text-xs text-muted-foreground">
                        This evaluation configuration will be saved as a reusable test suite for the agent
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableContinuousEval}
                      onChange={(e) => setEnableContinuousEval(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-border bg-input accent-primary"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">Enable continuous eval</span>
                      <p className="text-xs text-muted-foreground">
                        Set up continuous evaluation after this run
                      </p>
                      
                      {enableContinuousEval && (
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">
                              Sampling rate: {samplingRate}%
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={samplingRate}
                              onChange={(e) => setSamplingRate(parseInt(e.target.value))}
                              className="w-full accent-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Schedule</label>
                            <Select value={schedule} onValueChange={setSchedule}>
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-components
function StepAccordion({
  step,
  title,
  subtitle,
  status,
  isExpanded,
  onClick,
  disabled = false,
}: {
  step: number
  title: string
  subtitle: string
  status: "completed" | "current" | "upcoming" | "auto-configured"
  isExpanded: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || status === "upcoming"}
      className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
        isExpanded ? "bg-muted" : "hover:bg-muted/50"
      } ${disabled || status === "upcoming" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            status === "completed" || status === "auto-configured"
              ? "bg-success text-success-foreground"
              : status === "current"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {status === "completed" || status === "auto-configured" ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            step
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{title}</span>
            {status === "auto-configured" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                auto-configured
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </div>
    </button>
  )
}

function TargetOption({
  label,
  description,
  selected,
  onClick,
}: {
  label: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-primary bg-primary" : "border-border"
        }`}
      >
        {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
      </div>
      <div className="text-left">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

function EvaluatorCard({
  evaluator,
  onToggle,
}: {
  evaluator: Evaluator
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`p-3 rounded-lg border text-left transition-colors ${
        evaluator.selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground">{evaluator.name}</span>
        <div
          className={`w-4 h-4 rounded border flex items-center justify-center ${
            evaluator.selected
              ? "border-primary bg-primary"
              : "border-border"
          }`}
        >
          {evaluator.selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
        </div>
      </div>
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
          evaluator.category === "Quality"
            ? "bg-primary/10 text-primary"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        {evaluator.category}
      </span>
    </button>
  )
}
