"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, Plus, Bot, Database, Sparkles, X, CheckCircle, Calendar, Loader2, Play, FileText, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample datasets matching the screenshot
const datasets = [
  { id: "1", name: "zava-outdoors-synth-quality-v8", description: "", tags: "eval_id:eval_3b88e5dfa5f04e2fae894f016a01acc9, eval_run_id:evalrun_e52947086c0e46519159ddfc82b15 url_file type:SyntheticData", type: "uri_file" },
  { id: "2", name: "zava-outdoors-synth-v8", description: "", tags: "eval_id:eval_b930f20c25734120ae77d59bf76a9571, eval_run_id:evalrun_a3e61948ef7043589f4dede82211f2 url_file type:SyntheticData", type: "uri_file" },
  { id: "3", name: "zava-outdoors-dataset", description: "", tags: "", type: "uri_file" },
  { id: "4", name: "filisha_test_xkj9wp1g0s", description: "", tags: "eval_id:eval_d543d217db8a49b3818543aeaf418431, eval_run_id:evalrun_6b061db4881f40cbb89e1fa094892 url_file type:SyntheticData", type: "uri_file" },
  { id: "5", name: "teststorage", description: "teststorage", tags: "", type: "uri_file" },
  { id: "6", name: "eval-dataset-api-20260117005136", description: "", tags: "", type: "uri_file" },
  { id: "7", name: "eval-dataset-api-20260117005037", description: "", tags: "", type: "uri_file" },
  { id: "8", name: "twitter-eval-dataset-v2", description: "twitter-eval-dataset-v2", tags: "", type: "uri_file" },
  { id: "9", name: "twitter-support-agent", description: "twitter-support-agent", tags: "", type: "uri_file" },
]

// Agents for dropdown
const agents = [
  { id: "twitter-support", name: "twitter-support-agent", traceCount: 12400 },
  { id: "zava-outdoors", name: "zava-outdoors-agent", traceCount: 8500 },
  { id: "customer-service", name: "customer-service-bot", traceCount: 5200 },
  { id: "product-rec", name: "product-recommender", traceCount: 3100 },
]

// Generation jobs
interface GenerationJob {
  id: string
  name: string
  type: "traces" | "synthetic"
  agent?: string
  status: "running" | "completed" | "failed"
  rowsCreated: number
  started: string
  duration?: string
}

const generationJobs: GenerationJob[] = [
  { id: "1", name: "twitter-support-traces-2026-04-14", type: "traces", agent: "twitter-support-agent", status: "running", rowsCreated: 0, started: "2 min ago" },
  { id: "2", name: "zava-synthetic-v9", type: "synthetic", status: "running", rowsCreated: 0, started: "15 min ago" },
  { id: "3", name: "twitter-support-traces-2026-04-10", type: "traces", agent: "twitter-support-agent", status: "completed", rowsCreated: 98, started: "4 days ago", duration: "3m 24s" },
  { id: "4", name: "customer-service-synth-v2", type: "synthetic", status: "completed", rowsCreated: 500, started: "1 week ago", duration: "12m 8s" },
  { id: "5", name: "zava-synthetic-v8", type: "synthetic", status: "completed", rowsCreated: 250, started: "2 weeks ago", duration: "8m 45s" },
  { id: "6", name: "product-rec-traces-2026-03-28", type: "traces", agent: "product-recommender", status: "failed", rowsCreated: 0, started: "2 weeks ago", duration: "1m 12s" },
]

interface DataViewProps {
  defaultSubTab?: string
  onClose?: () => void
}

export function DataView({ defaultSubTab = "datasets", onClose }: DataViewProps) {
  const [activeTab, setActiveTab] = useState("datasets")
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Create from traces dialog
  const [showTracesDialog, setShowTracesDialog] = useState(false)
  const [tracesDialogState, setTracesDialogState] = useState<"form" | "loading" | "success">("form")
  const [selectedAgent, setSelectedAgent] = useState(agents[0].id)
  const [timeRangeStart, setTimeRangeStart] = useState("2026-03-01")
  const [timeRangeEnd, setTimeRangeEnd] = useState("2026-04-14")
  const [datasetName, setDatasetName] = useState("")
  const [maxRows, setMaxRows] = useState(100)
  const [llmGrading, setLlmGrading] = useState(false)
  const [judgeModel, setJudgeModel] = useState("gpt-4.1")

  // Synthetic dialog
  const [showSyntheticDialog, setShowSyntheticDialog] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Update dataset name when agent or time range changes
  useEffect(() => {
    const agent = agents.find(a => a.id === selectedAgent)
    if (agent) {
      const endDate = timeRangeEnd.replace(/-/g, "-")
      setDatasetName(`${agent.name}-traces-${endDate}`)
    }
  }, [selectedAgent, timeRangeEnd])

  const filteredDatasets = datasets.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredJobs = generationJobs.filter(j =>
    j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.agent && j.agent.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const runningJobs = filteredJobs.filter(j => j.status === "running")
  const completedJobs = filteredJobs.filter(j => j.status !== "running")

  const handleCreateFromTraces = () => {
    setTracesDialogState("loading")
    setTimeout(() => {
      setTracesDialogState("success")
    }, 2500)
  }

  const resetTracesDialog = () => {
    setShowTracesDialog(false)
    setTracesDialogState("form")
    setSelectedAgent(agents[0].id)
    setMaxRows(100)
    setLlmGrading(false)
  }

  const selectedAgentData = agents.find(a => a.id === selectedAgent)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-foreground">Data</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          <button
            onClick={() => setActiveTab("datasets")}
            className={`px-3 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "datasets"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Datasets
            {activeTab === "datasets" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === "jobs"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Generation jobs
            {runningJobs.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-primary/15 text-primary rounded-full font-medium">
                {runningJobs.length}
              </span>
            )}
            {activeTab === "jobs" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Datasets Tab */}
      {activeTab === "datasets" && (
        <div className="flex-1 flex flex-col overflow-auto px-6 py-4">
          {/* Search and Create */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Create Dataset Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create dataset
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      setShowTracesDialog(true)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-start gap-3"
                  >
                    <Database className="w-4 h-4 mt-0.5 text-success" />
                    <div>
                      <p className="text-sm font-medium text-foreground">From production traces</p>
                      <p className="text-xs text-muted-foreground">Select traces from an agent</p>
                    </div>
                  </button>
                  <div className="border-t border-border" />
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      setShowSyntheticDialog(true)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-start gap-3"
                  >
                    <Sparkles className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Generate synthetic</p>
                      <p className="text-xs text-muted-foreground">Create data with AI models</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tags</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredDatasets.map((dataset) => (
                  <tr key={dataset.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <span className="text-primary hover:underline cursor-pointer">{dataset.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{dataset.description}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{dataset.tags}</td>
                    <td className="px-4 py-3 text-muted-foreground">{dataset.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generation Jobs Tab */}
      {activeTab === "jobs" && (
        <div className="flex-1 flex flex-col overflow-auto px-6 py-4">
          {/* Search */}
          <div className="mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Running jobs section */}
          {runningJobs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Running ({runningJobs.length})
              </h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Job name</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Agent</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runningJobs.map((job) => (
                      <tr key={job.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium text-foreground">{job.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            job.type === "traces" 
                              ? "bg-success/15 text-success" 
                              : "bg-primary/15 text-primary"
                          }`}>
                            {job.type === "traces" ? "From traces" : "Synthetic"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{job.agent || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                            <span className="text-primary">Running</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{job.started}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Completed jobs section */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Completed ({completedJobs.length})
            </h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Job name</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Agent</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Rows</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Started</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Duration</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completedJobs.map((job) => (
                    <tr key={job.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium text-foreground">{job.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          job.type === "traces" 
                            ? "bg-success/15 text-success" 
                            : "bg-primary/15 text-primary"
                        }`}>
                          {job.type === "traces" ? "From traces" : "Synthetic"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{job.agent || "-"}</td>
                      <td className="px-4 py-3">
                        {job.status === "completed" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-success" />
                            <span className="text-success">Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-destructive" />
                            <span className="text-destructive">Failed</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">{job.rowsCreated > 0 ? job.rowsCreated : "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{job.started}</td>
                      <td className="px-4 py-3 text-muted-foreground">{job.duration || "-"}</td>
                      <td className="px-4 py-3">
                        {job.status === "completed" && (
                          <button className="text-sm text-primary hover:underline">
                            View dataset
                          </button>
                        )}
                        {job.status === "failed" && (
                          <button className="text-sm text-muted-foreground hover:text-foreground">
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty state */}
          {filteredJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No generation jobs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a dataset to see generation jobs here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create from Traces Dialog */}
      {showTracesDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Form State */}
            {tracesDialogState === "form" && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Create dataset from traces
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select an agent and time range to generate a dataset
                    </p>
                  </div>
                  <button
                    onClick={resetTracesDialog}
                    className="p-1 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                  {/* Agent selection */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Agent
                    </label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                    >
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.traceCount.toLocaleString()} traces)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time range */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Time range
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={timeRangeStart}
                          onChange={(e) => setTimeRangeStart(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <span className="text-muted-foreground">to</span>
                      <div className="flex-1 relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={timeRangeEnd}
                          onChange={(e) => setTimeRangeEnd(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                    {selectedAgentData && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        ~{Math.round(selectedAgentData.traceCount * 0.3).toLocaleString()} traces in selected range
                      </p>
                    )}
                  </div>

                  {/* Dataset name */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Dataset name
                    </label>
                    <input
                      type="text"
                      value={datasetName}
                      onChange={(e) => setDatasetName(e.target.value)}
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
                        onClick={() => setMaxRows(Math.max(10, maxRows - 10))}
                        className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded text-foreground hover:bg-secondary/80"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={maxRows}
                        onChange={(e) => setMaxRows(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 px-3 py-2 bg-secondary border border-border rounded-md text-sm text-foreground text-center outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        onClick={() => setMaxRows(maxRows + 10)}
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
                        onClick={() => setLlmGrading(!llmGrading)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${llmGrading ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${llmGrading ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                    {llmGrading ? (
                      <>
                        <p className="text-xs text-muted-foreground mb-3">
                          Uses an LLM to score traces for difficulty and quality. This incurs additional model costs.
                        </p>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">Judge model</label>
                          <select
                            value={judgeModel}
                            onChange={(e) => setJudgeModel(e.target.value)}
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
                  <Button variant="outline" onClick={resetTracesDialog}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    disabled={!datasetName.trim()}
                    onClick={handleCreateFromTraces}
                  >
                    Create dataset
                  </Button>
                </div>
              </>
            )}

            {/* Loading State */}
            {tracesDialogState === "loading" && (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-base font-medium text-foreground mb-1">Creating dataset...</h3>
                <p className="text-sm text-muted-foreground">Analyzing traces from {selectedAgentData?.name}</p>
              </div>
            )}

            {/* Success State */}
            {tracesDialogState === "success" && (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-foreground">Dataset created</h3>
                    <p className="text-sm text-muted-foreground">{datasetName} (98 rows)</p>
                  </div>
                </div>
                
                {/* Action Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Run evaluation - Primary */}
                  <button 
                    onClick={resetTracesDialog}
                    className="p-3 rounded-lg border-2 border-primary bg-primary/5 text-left hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Play className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Run evaluation</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Evaluate your agent against this dataset.</p>
                  </button>

                  {/* Generate test suite - Outline */}
                  <button 
                    onClick={resetTracesDialog}
                    className="p-3 rounded-lg border border-border bg-card text-left hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Generate test suite</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Create evaluators and thresholds for this dataset.</p>
                  </button>

                  {/* View in Data Wrangler - Outline */}
                  <button 
                    onClick={resetTracesDialog}
                    className="p-3 rounded-lg border border-border bg-card text-left hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">View in Data Wrangler</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Inspect and edit the dataset locally.</p>
                  </button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Dataset saved to Foundry and cached at <span className="font-mono">.foundry/datasets/{datasetName}.jsonl</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Synthetic Data Dialog (placeholder) */}
      {showSyntheticDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Generate synthetic data</h2>
              <button
                onClick={() => setShowSyntheticDialog(false)}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Synthetic data generation flow coming soon. This will allow you to generate evaluation data using AI models.
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowSyntheticDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
