"use client"

import { useState } from "react"
import { Search, Play, Pause, MoreHorizontal, Plus, Bot, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PipelineConfig } from "./pipeline-config"

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

// Pipeline data associated with agents
interface Pipeline {
  id: string
  agentName: string
  agentId: string
  status: "active" | "paused" | "error"
  targetDataset: string
  schedule: string
  lastRun: string
  lastRunTraces: number
  totalTraces: number
  filterStages: string[]
}

const pipelines: Pipeline[] = [
  {
    id: "1",
    agentName: "twitter-support-agent",
    agentId: "twitter-support",
    status: "active",
    targetDataset: "twitter-eval-dataset v1",
    schedule: "Weekly",
    lastRun: "3 days ago",
    lastRunTraces: 793,
    totalTraces: 12400,
    filterStages: ["Rule-based", "Semantic dedup", "LLM quality"]
  },
  {
    id: "2",
    agentName: "zava-outdoors-agent",
    agentId: "zava-outdoors",
    status: "active",
    targetDataset: "zava-outdoors-dataset v2",
    schedule: "Daily",
    lastRun: "12 hours ago",
    lastRunTraces: 156,
    totalTraces: 8500,
    filterStages: ["Rule-based", "Semantic dedup"]
  },
  {
    id: "3",
    agentName: "customer-service-bot",
    agentId: "cs-bot",
    status: "paused",
    targetDataset: "cs-eval-dataset v1",
    schedule: "Weekly",
    lastRun: "2 weeks ago",
    lastRunTraces: 0,
    totalTraces: 5200,
    filterStages: ["Rule-based"]
  },
  {
    id: "4",
    agentName: "product-recommender",
    agentId: "product-rec",
    status: "error",
    targetDataset: "product-rec-dataset v1",
    schedule: "Daily",
    lastRun: "Failed 1 day ago",
    lastRunTraces: 0,
    totalTraces: 3100,
    filterStages: ["Rule-based", "LLM quality"]
  },
]

interface DataViewProps {
  defaultSubTab?: string
  onClose?: () => void
}

export function DataView({ defaultSubTab = "datasets", onClose }: DataViewProps) {
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)

  const subTabs = [
    { label: "Datasets", id: "datasets" },
    { label: "Files", id: "files" },
    { label: "Synthetic data generation", id: "synthetic", preview: true },
    { label: "Stored completions", id: "completions", preview: true },
    { label: "Pipelines", id: "pipelines" },
  ]

  const filteredDatasets = datasets.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPipelines = pipelines.filter(p =>
    p.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.targetDataset.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: Pipeline["status"]) => {
    switch (status) {
      case "active": return "bg-success"
      case "paused": return "bg-muted-foreground"
      case "error": return "bg-destructive"
    }
  }

  const getStatusText = (status: Pipeline["status"]) => {
    switch (status) {
      case "active": return "Active"
      case "paused": return "Paused"
      case "error": return "Error"
    }
  }

  // Show pipeline config when a pipeline is selected
  if (selectedPipeline) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with back navigation */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <button 
            onClick={() => setSelectedPipeline(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to pipelines
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Data</span>
            <ChevronRight className="w-4 h-4" />
            <span>Pipelines</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{selectedPipeline.agentName}</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <PipelineConfig onClose={() => setSelectedPipeline(null)} isEmbedded />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-0">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Data</h1>
        
        {/* Sub-tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeSubTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.preview && (
                <span className="px-1.5 py-0.5 text-[10px] bg-secondary text-muted-foreground rounded">
                  Preview
                </span>
              )}
              {activeSubTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeSubTab === "datasets" && (
        <div className="flex-1 flex flex-col overflow-auto px-6 py-4">
          {/* Search */}
          <div className="mb-4">
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

      {activeSubTab === "files" && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Files content coming soon
        </div>
      )}

      {activeSubTab === "synthetic" && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Synthetic data generation content coming soon
        </div>
      )}

      {activeSubTab === "completions" && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Stored completions content coming soon
        </div>
      )}

      {activeSubTab === "pipelines" && (
        <div className="flex-1 flex flex-col overflow-auto px-6 py-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search pipelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create pipeline
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total pipelines</p>
              <p className="text-2xl font-semibold text-foreground">{pipelines.length}</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Active</p>
              <p className="text-2xl font-semibold text-success">{pipelines.filter(p => p.status === "active").length}</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Paused</p>
              <p className="text-2xl font-semibold text-muted-foreground">{pipelines.filter(p => p.status === "paused").length}</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Errors</p>
              <p className="text-2xl font-semibold text-destructive">{pipelines.filter(p => p.status === "error").length}</p>
            </div>
          </div>

          {/* Pipelines table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Agent</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Target dataset</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Schedule</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Filter stages</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last run</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPipelines.map((pipeline) => (
                  <tr 
                    key={pipeline.id} 
                    className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer"
                    onClick={() => setSelectedPipeline(pipeline)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-primary hover:underline font-medium">{pipeline.agentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(pipeline.status)}`} />
                        <span className={`text-sm ${pipeline.status === "error" ? "text-destructive" : pipeline.status === "paused" ? "text-muted-foreground" : "text-success"}`}>
                          {getStatusText(pipeline.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{pipeline.targetDataset}</td>
                    <td className="px-4 py-3 text-muted-foreground">{pipeline.schedule}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {pipeline.filterStages.map((stage, i) => (
                          <span key={i} className="px-1.5 py-0.5 text-[10px] bg-secondary text-muted-foreground rounded">
                            {stage}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">{pipeline.lastRun}</span>
                        {pipeline.lastRunTraces > 0 && (
                          <span className="text-xs text-muted-foreground">{pipeline.lastRunTraces} traces added</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {pipeline.status === "active" ? (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Pause className="w-3.5 h-3.5" />
                          </Button>
                        ) : pipeline.status === "paused" ? (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive">
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state if no pipelines */}
          {filteredPipelines.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No pipelines found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a trace-to-dataset pipeline to automatically curate high-value traces.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create pipeline
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
