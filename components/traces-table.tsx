"use client"

import { useState } from "react"
import { Search, ChevronDown, Calendar, HelpCircle, CheckCircle, ThumbsUp, ThumbsDown, Database, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TraceAnnotation {
  traceId: string
  annotation: boolean | null
  comments: string
  timestamp: string
  feedbackKind: "thumbs" | "rating" | "text"
  source: "builder" | "end-user"
  userId: number
}

interface TracesTableProps {
  annotations?: Record<string, TraceAnnotation>
}

// Generate mock trace data with Microsoft Foundry support questions
const generateTraceData = () => {
  const traces = [
    {
      id: "1",
      conversationId: "conv_8ac8a6894bf475d300x4Yjk0k9sI49VU6mu9mmiu8ekHsfjgA",
      traceId: "7a6bf85a13a84c58b38d001f6e973870",
      responseId: "resp_8ac8a6894bf475d30069a9e6b1e7488190bce43c03042bdc45",
      status: "Completed",
      startTime: "3/5/26, 12:25:22 PM",
      duration: 3.766,
      tokensIn: 2735,
      tokensOut: 299,
      cost: 0.008,
      evaluations: [
        { label: "task_completion", value: 1 },
        { label: "tool_call_success", value: 1 },
      ],
      moreEvals: 5,
      agentVersion: 21,
      input: "How do I create a new agent in Microsoft Foundry?",
      output: "To create a new agent in Microsoft Foundry, follow these steps:\n\n1. Navigate to the Agents section in the left sidebar\n2. Click the '+ Create' button at the bottom of the page\n3. Enter your agent's name and description\n4. Configure the agent's capabilities and tools\n5. Set up the evaluation criteria\n6. Click 'Create' to deploy your agent\n\nYou can then test your agent in the Playground tab before publishing it to production.",
    },
    {
      id: "2",
      conversationId: "conv_e715a2a704e2bec8008VFBtHuNLRoD4R7XG38plWvAhrtVo0zQ",
      traceId: "04d96fd4fdf19f69d0a55a6a5c22a5f0",
      responseId: "resp_e715a2a704e2bec80069a9bc1d751c8190be09d221a6979018",
      status: "Completed",
      startTime: "3/5/26, 9:23:41 AM",
      duration: 4.687,
      tokensIn: 2740,
      tokensOut: 385,
      cost: 0.009,
      evaluations: [
        { label: "relevance", value: 5 },
        { label: "coherence", value: 4 },
      ],
      moreEvals: 1,
      agentVersion: 21,
      input: "What is the difference between Automatic Evaluation and Human Evaluation in Foundry?",
      output: "Microsoft Foundry offers two types of evaluation:\n\n**Automatic Evaluation**: Uses AI-powered metrics to assess agent responses automatically. This includes relevance scoring, coherence analysis, and task completion rates. It's faster and can process large volumes of interactions.\n\n**Human Evaluation**: Allows human reviewers to manually assess agent responses using customizable scoring templates. This provides nuanced feedback on aspects like groundedness, fluency, and overall quality that automated systems might miss.\n\nBoth approaches can be used together for comprehensive quality assurance.",
    },
    {
      id: "3",
      conversationId: "conv_c2f1e7ee861784f200DMVp87Xc2VZQbunrHDVIIHbFiLgW1YCe",
      traceId: "110169b515f177fead90686d80caef4a",
      responseId: "resp_c2f1e7ee861784f20069a9bc1787f48190bda305611c1d999c",
      status: "Completed",
      startTime: "3/5/26, 9:23:35 AM",
      duration: 5.229,
      tokensIn: 2739,
      tokensOut: 450,
      cost: 0.010,
      evaluations: [
        { label: "relevance", value: 5 },
        { label: "coherence", value: 4 },
      ],
      moreEvals: 1,
      agentVersion: 21,
      input: "How can I monitor my agent's token usage and costs?",
      output: "You can monitor token usage and costs in Microsoft Foundry through the Traces tab:\n\n1. Navigate to your agent and select the 'Traces' tab\n2. The table shows 'Tokens (In)' and 'Tokens (Out)' columns for each conversation\n3. The 'Estimated cost ($)' column shows the per-request cost\n4. Use the date filters to analyze costs over specific time periods\n5. For aggregate metrics, check the 'Monitor' tab for dashboards showing total usage\n\nYou can also set up cost alerts in the project settings to get notified when usage exceeds thresholds.",
    },
    {
      id: "4",
      conversationId: "conv_7f2beeab518ec78700biHyqsd3aC0K4gfR2J6nwGL8gMbCCwQf",
      traceId: "a0566515dd63b9d27e34679210b34b39",
      responseId: "resp_7f2beeab518ec787006ga9bc1268e081908321f19be79783fe",
      status: "Completed",
      startTime: "3/5/26, 9:23:30 AM",
      duration: 4.475,
      tokensIn: 2740,
      tokensOut: 413,
      cost: 0.009,
      evaluations: [
        { label: "relevance", value: 5 },
        { label: "coherence", value: 5 },
      ],
      moreEvals: 1,
      agentVersion: 21,
      input: "What tools can I add to my agent in Microsoft Foundry?",
      output: "Microsoft Foundry supports various tool integrations for your agents:\n\n**Built-in Tools**:\n- Knowledge Base search\n- Document retrieval\n- Calculator\n- Code interpreter\n\n**Custom Tools**:\n- REST API integrations\n- Database connectors\n- Custom functions\n\n**Third-party Integrations**:\n- Microsoft Graph API\n- Azure services\n- External APIs\n\nTo add tools, go to the 'Tools' section in your agent configuration and click 'Add Tool'. You can configure authentication, parameters, and usage guidelines for each tool.",
    },
    {
      id: "5",
      conversationId: "conv_c407274ba6ff029d004BjhU1MrvI8xenwKkvYVf4hjHfygo0NEr",
      traceId: "aa5342ceactf872d48c33594e08d75d69",
      responseId: "resp_c407274ba6ff029d0069a9bc0e3c7c819094105f37218ed2c3",
      status: "Completed",
      startTime: "3/5/26, 9:23:26 AM",
      duration: 3.383,
      tokensIn: 2740,
      tokensOut: 310,
      cost: 0.009,
      evaluations: [
        { label: "escalationsettlement", value: 5 },
        { label: "deflection_score", value: 5 },
      ],
      moreEvals: 3,
      agentVersion: 21,
      input: "How do I set up guardrails for my agent?",
      output: "To configure guardrails in Microsoft Foundry:\n\n1. Go to the 'Guardrails' section in the left sidebar\n2. Click 'Create Guardrail' to add a new rule\n3. Choose the guardrail type:\n   - Content filters (block harmful content)\n   - Topic restrictions (stay on-topic)\n   - PII detection (protect personal data)\n   - Custom rules (define your own criteria)\n4. Set the action: warn, block, or escalate\n5. Apply the guardrail to specific agents\n\nGuardrails are evaluated in real-time and help ensure safe, compliant agent behavior.",
    },
    {
      id: "6",
      conversationId: "conv_9033c0d3de28139800n7h7UCTJef3NTFlixHmXwUY9p9m43e91",
      traceId: "bc8f70064eaec9cd1ddae235e8c6a619",
      responseId: "resp_9033c0d3de2813980069a9bc09187481909083967e2918baa",
      status: "Completed",
      startTime: "3/5/26, 9:23:21 AM",
      duration: 4.410,
      tokensIn: 2740,
      tokensOut: 348,
      cost: 0.009,
      evaluations: [
        { label: "relevance", value: 5 },
        { label: "coherence", value: 4 },
      ],
      moreEvals: 0,
      agentVersion: 21,
      input: "Can I version my agents in Microsoft Foundry?",
      output: "Yes, Microsoft Foundry supports agent versioning:\n\n1. Each time you save changes to your agent, a new version is created automatically\n2. You can view the version history in the agent header (e.g., 'v21 saved 2/24/2026')\n3. Use the 'Preview' dropdown to test different versions\n4. The 'Publish' button deploys a specific version to production\n5. You can rollback to previous versions if needed\n\nIn the Traces tab, each conversation shows which 'Agent version' handled the request, helping you track performance across versions.",
    },
    {
      id: "7",
      conversationId: "conv_1ea79ce43e71a24f00RGUFsSsnUODNqe5VGdZ76L89elHHROEA",
      traceId: "62ee87ceaeab8eaaf1c9f7a3184a770f",
      responseId: "resp_1ea79ce43e71a24f0069a9bc0375508190ad7eb274c3b5ede6",
      status: "Completed",
      startTime: "3/5/26, 9:23:15 AM",
      duration: 4.771,
      tokensIn: 2742,
      tokensOut: 499,
      cost: 0.01,
      evaluations: [
        { label: "deflection_score", value: 5 },
        { label: "relevance", value: 5 },
      ],
      moreEvals: 2,
      agentVersion: 21,
      input: "How do I add a knowledge base to my Foundry agent?",
      output: "To add a knowledge base to your agent:\n\n1. Navigate to the 'Knowledge' section in the left sidebar\n2. Click 'Create Knowledge Base'\n3. Choose your data source:\n   - Upload documents (PDF, Word, text files)\n   - Connect to SharePoint or OneDrive\n   - Link to external URLs\n   - Connect to Azure Blob Storage\n4. Configure chunking and embedding settings\n5. Wait for indexing to complete\n6. In your agent settings, enable the Knowledge Base tool and select your knowledge base\n\nYour agent will now be able to search and retrieve information from your documents.",
    },
    {
      id: "8",
      conversationId: "conv_2b94f2994b5d57b300HhbcKJRE5O1bPw3ivLdAJEG30dkNQY8X",
      traceId: "3e69781ceb90e98f6b94c1a705b42e9c",
      responseId: "resp_2b94f2994b5d57b30069a9bbfd892081908839d97d1286e639",
      status: "Completed",
      startTime: "3/5/26, 9:23:09 AM",
      duration: 5.094,
      tokensIn: 2741,
      tokensOut: 500,
      cost: 0.01,
      evaluations: [
        { label: "relevance", value: 5 },
        { label: "coherence", value: 5 },
      ],
      moreEvals: 1,
      agentVersion: 21,
      input: "What is the Playground in Microsoft Foundry used for?",
      output: "The Playground in Microsoft Foundry is an interactive testing environment for your agents:\n\n**Key Features**:\n- Test agent responses in real-time before publishing\n- Simulate different user inputs and scenarios\n- View detailed logs and tool calls\n- Debug agent behavior step-by-step\n- Compare responses across different agent versions\n\n**Best Practices**:\n- Test edge cases and error handling\n- Verify tool integrations work correctly\n- Check guardrails are functioning as expected\n- Validate response quality before publishing\n\nAccess the Playground by selecting your agent and clicking the 'Playground' tab.",
    },
    {
      id: "9",
      conversationId: "conv_a12c0cb4e10ecd4a00Vd3RvlvxYtotF5HOHYKowJXPGx7OAaIn",
      traceId: "37fe0ce4c1c77f8020d49e5026186f4f",
      responseId: "resp_a12c0cb4e10ecd4a0069a9bbf7e064819083385f322bb77d7f",
      status: "Completed",
      startTime: "3/5/26, 9:23:03 AM",
      duration: 4.376,
      tokensIn: 2740,
      tokensOut: 470,
      cost: 0.010,
      evaluations: [
        { label: "relevance", value: 5 },
        { label: "coherence", value: 5 },
      ],
      moreEvals: 1,
      agentVersion: 21,
      input: "How do I create a workflow that connects multiple agents?",
      output: "To create a multi-agent workflow in Microsoft Foundry:\n\n1. Go to the 'Workflows' section in the left sidebar\n2. Click 'Create Workflow'\n3. Use the visual builder to add agents as nodes\n4. Connect agents with conditional logic:\n   - Sequential execution\n   - Parallel processing\n   - Conditional branching\n5. Define handoff rules between agents\n6. Configure shared context and memory\n7. Set up error handling and fallbacks\n\nWorkflows enable complex scenarios like customer support escalation, multi-step task completion, and specialized agent routing based on user intent.",
    },
    {
      id: "10",
      conversationId: "conv_5fff944bf1e7a21800D1kUjmMtb6q00vr2o1Zdw8UpJ6y3a3jD",
      traceId: "a8b694f0b673b40ba21b3b9cb5b71142",
      responseId: "resp_5fff944bf1e7a2180069a9bbf1077881908dce2bd004f7dbf7",
      status: "Completed",
      startTime: "3/5/26, 9:22:57 AM",
      duration: 5.941,
      tokensIn: 2738,
      tokensOut: 399,
      cost: 0.009,
      evaluations: [
        { label: "relevance", value: 5 },
        { label: "coherence", value: 5 },
      ],
      moreEvals: 0,
      agentVersion: 21,
      input: "What models are available for fine-tuning in Microsoft Foundry?",
      output: "Microsoft Foundry supports fine-tuning of several models:\n\n**Available Models**:\n- GPT-4 series (GPT-4, GPT-4 Turbo)\n- GPT-3.5 Turbo\n- Azure OpenAI custom models\n- Open-source models (Llama, Mistral)\n\n**Fine-tuning Process**:\n1. Go to 'Fine-tune' in the left sidebar\n2. Select your base model\n3. Upload your training data (JSONL format)\n4. Configure hyperparameters\n5. Start the fine-tuning job\n6. Monitor progress and evaluate results\n\nFine-tuned models can then be used in your agents for domain-specific performance improvements.",
    },
  ]
  return traces
}

const traces = generateTraceData()

const timeFilters = ["Last Day", "7D", "1M", "3M"]

// Mock eval suites with evaluators
const evalSuites = [
  {
    id: "suite-1",
    name: "Twitter Support Quality",
    evaluators: ["Groundedness", "Coherence", "Relevance", "Response Quality"],
  },
  {
    id: "suite-2",
    name: "Customer Satisfaction",
    evaluators: ["Deflection Score", "Escalation Sentiment", "Resolution Rate"],
  },
  {
    id: "suite-3",
    name: "Safety & Compliance",
    evaluators: ["Content Safety", "PII Detection", "Brand Guidelines"],
  },
]

// Mock existing datasets with eval suite associations
const existingDatasets = [
  { id: "1", name: "twitter-eval-dataset", version: "Version 1", count: 150, evalSuiteId: "suite-1" },
  { id: "2", name: "support-golden-set", version: "Version 2", count: 75, evalSuiteId: "suite-2" },
  { id: "3", name: "edge-cases-dataset", version: "Version 1", count: 42, evalSuiteId: "suite-3" },
]

export function TracesTable({ annotations = {} }: TracesTableProps) {
  
  
  // Create Dataset dialog state
  const [showCreateDatasetDialog, setShowCreateDatasetDialog] = useState(false)
  const [createDatasetName, setCreateDatasetName] = useState("twitter-support-agent-traces-2026-03-06")
  const [createDatasetMaxRows, setCreateDatasetMaxRows] = useState(100)
  const [createDatasetLlmGrading, setCreateDatasetLlmGrading] = useState(false)
  const [createDatasetJudgeModel, setCreateDatasetJudgeModel] = useState("gpt-4.1")
  const [createDatasetState, setCreateDatasetState] = useState<"form" | "loading" | "success">("form")
  
  // Info line state
  const [infoLineDismissed, setInfoLineDismissed] = useState(false)
  const hasCreatedDataset = true // Mock: agent has created at least one dataset
  
  // Selected time range (mocked for now)
  const selectedTimeRange = { start: "2/27/2026", end: "3/6/2026", traceCount: 847 }

  const handleCreateDataset = () => {
    setCreateDatasetState("loading")
    // Simulate API call
    setTimeout(() => {
      setCreateDatasetState("success")
    }, 2500)
  }

  const resetCreateDatasetDialog = () => {
    setShowCreateDatasetDialog(false)
    setCreateDatasetState("form")
    setCreateDatasetName("twitter-support-agent-traces-2026-03-06")
    setCreateDatasetMaxRows(100)
    setCreateDatasetLlmGrading(false)
    setCreateDatasetJudgeModel("gpt-4.1")
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-md border border-border w-64">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by response ID"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          {/* Status filter */}
          <Button variant="outline" className="text-sm">
            Status
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Create Dataset, Annotate button and Date range */}
        <div className="flex items-center gap-2">
          {/* Create Dataset Button */}
          <Button
            className="text-sm bg-primary hover:bg-primary/90"
            onClick={() => setShowCreateDatasetDialog(true)}
          >
            <Database className="w-4 h-4 mr-2" />
            Create Dataset
          </Button>

          <Button variant="outline" className="text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            2/27/2026 - 3/6/2026
          </Button>

          {timeFilters.map((filter) => (
            <button
              key={filter}
              className={`px-3 py-1.5 text-sm rounded ${
                filter === "7D"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset Info Line */}
      {!infoLineDismissed && (
        <div className="mb-3 flex items-center justify-between py-2 px-3 border-l-2 border-l-primary bg-secondary/30 rounded-r text-sm">
          {hasCreatedDataset ? (
            <p className="text-muted-foreground">
              Last dataset created 3 days ago from 847 traces → 98 rows in <span className="text-foreground">twitter-support-agent-traces</span>.{" "}
              <button 
                onClick={() => setShowCreateDatasetDialog(true)}
                className="text-primary hover:underline"
              >
                Create new dataset
              </button>{" "}
              to capture recent traces.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Tip: Create an evaluation dataset from your production traces to improve agent quality.{" "}
              <button 
                onClick={() => setShowCreateDatasetDialog(true)}
                className="text-primary hover:underline"
              >
                Create dataset
              </button>
            </p>
          )}
          <button 
            onClick={() => setInfoLineDismissed(true)}
            className="ml-3 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Conversation ID
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Trace ID
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Response ID
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Status
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Start time
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Duration (s)
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Tokens (In)
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Tokens (Out)
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Estimated cost ($)
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Annotation
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Evaluation
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Agent version
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {traces.map((trace) => (
              <tr
                key={trace.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-primary font-mono text-xs break-all max-w-[140px] block">
                    {trace.conversationId.substring(0, 45)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-foreground break-all max-w-[120px] block">
                    {trace.traceId}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-foreground break-all max-w-[140px] block">
                    {trace.responseId.substring(0, 45)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-success text-xs">{trace.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">
                  {trace.startTime}
                </td>
                <td className="px-4 py-3 text-xs text-foreground">
                  {trace.duration.toFixed(3)}
                </td>
                <td className="px-4 py-3 text-xs text-foreground">{trace.tokensIn}</td>
                <td className="px-4 py-3 text-xs text-foreground">{trace.tokensOut}</td>
                <td className="px-4 py-3 text-xs text-foreground">
                  {trace.cost.toFixed(3)}
                </td>
                <td className="px-4 py-3">
                  {annotations[trace.traceId] ? (
                    <div className="flex items-center gap-3">
                      {/* Thumbs icon with background */}
                      {annotations[trace.traceId].annotation === true && (
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-success/15">
                          <ThumbsUp className="w-3.5 h-3.5 text-success" />
                        </div>
                      )}
                      {annotations[trace.traceId].annotation === false && (
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-destructive/15">
                          <ThumbsDown className="w-3.5 h-3.5 text-destructive" />
                        </div>
                      )}
                      {/* Info */}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium ${
                            annotations[trace.traceId].source === "end-user" 
                              ? "text-primary" 
                              : "text-muted-foreground"
                          }`}>
                            {annotations[trace.traceId].source === "end-user" ? "End User" : "Builder"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            #{annotations[trace.traceId].userId}
                          </span>
                        </div>
                        {annotations[trace.traceId].comments ? (
                          <p className="text-[11px] text-muted-foreground truncate max-w-[160px]" title={annotations[trace.traceId].comments}>
                            {annotations[trace.traceId].comments}
                          </p>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60 italic">No comment</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {trace.evaluations.map((evaluation, evalIndex) => (
                      <span
                        key={evalIndex}
                        className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded"
                      >
                        {evaluation.label}: {evaluation.value}
                      </span>
                    ))}
                    {trace.moreEvals > 0 && (
                      <span className="text-xs text-muted-foreground">
                        + {trace.moreEvals} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs bg-secondary text-foreground rounded">
                    {trace.agentVersion}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Dataset Dialog */}
      {showCreateDatasetDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Form State */}
            {createDatasetState === "form" && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Create dataset from traces
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate an evaluation dataset from traces in the selected time range: {selectedTimeRange.start} - {selectedTimeRange.end} ({selectedTimeRange.traceCount} traces)
                    </p>
                  </div>
                  <button
                    onClick={resetCreateDatasetDialog}
                    className="p-1 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                  {/* Dataset name */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Dataset name
                    </label>
                    <input
                      type="text"
                      value={createDatasetName}
                      onChange={(e) => setCreateDatasetName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Maximum rows */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Maximum rows
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCreateDatasetMaxRows(Math.max(10, createDatasetMaxRows - 10))}
                        className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded text-foreground hover:bg-secondary/80"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={createDatasetMaxRows}
                        onChange={(e) => setCreateDatasetMaxRows(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 px-3 py-2 bg-secondary border border-border rounded-md text-sm text-foreground text-center outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        onClick={() => setCreateDatasetMaxRows(createDatasetMaxRows + 10)}
                        className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded text-foreground hover:bg-secondary/80"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      The algorithm will select the most valuable traces up to this limit.
                    </p>
                  </div>

                  {/* LLM grading toggle */}
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">
                        LLM grading
                      </label>
                      <button
                        onClick={() => setCreateDatasetLlmGrading(!createDatasetLlmGrading)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${createDatasetLlmGrading ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${createDatasetLlmGrading ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                    {createDatasetLlmGrading ? (
                      <>
                        <p className="text-xs text-muted-foreground mb-3">
                          Uses an LLM to score traces for difficulty and quality. This incurs additional model costs.
                        </p>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">Judge model</label>
                          <select
                            value={createDatasetJudgeModel}
                            onChange={(e) => setCreateDatasetJudgeModel(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="gpt-4.1">gpt-4.1</option>
                            <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Uses rule-based filtering and deduplication only.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                  <Button variant="outline" onClick={resetCreateDatasetDialog}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    disabled={!createDatasetName.trim()}
                    onClick={handleCreateDataset}
                  >
                    Create dataset
                  </Button>
                </div>
              </>
            )}

            {/* Loading State */}
            {createDatasetState === "loading" && (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-base font-medium text-foreground mb-1">Creating dataset...</h3>
                <p className="text-sm text-muted-foreground">Analyzing {selectedTimeRange.traceCount} traces</p>
              </div>
            )}

            {/* Success State */}
            {createDatasetState === "success" && (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-foreground">Dataset created</h3>
                    <p className="text-sm text-muted-foreground">{createDatasetName} (98 rows)</p>
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg mb-6">
                  <p className="text-xs text-muted-foreground font-mono">
                    Saved to Foundry and cached locally at .foundry/datasets/dataset.jsonl
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={resetCreateDatasetDialog}>
                    View dataset
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={resetCreateDatasetDialog}>
                    Run eval
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
