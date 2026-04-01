"use client"

import { useState } from "react"
import { Search, MoreHorizontal } from "lucide-react"
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

interface DataViewProps {
  defaultSubTab?: string
  onClose?: () => void
}

export function DataView({ defaultSubTab = "datasets", onClose }: DataViewProps) {
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab)
  const [searchQuery, setSearchQuery] = useState("")

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
        <PipelineConfig onClose={() => setActiveSubTab("datasets")} isEmbedded />
      )}
    </div>
  )
}
