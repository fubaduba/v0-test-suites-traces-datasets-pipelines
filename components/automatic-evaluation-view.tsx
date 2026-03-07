"use client"

import { useState } from "react"
import { Search, CheckCircle2, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AutomaticEvaluation {
  id: string
  name: string
  status: "Completed" | "Running" | "Failed"
  runs: number | string
  createdBy: string
  createdOn: string
}

// Mock data matching the screenshot
const mockEvaluations: AutomaticEvaluation[] = [
  {
    id: "1",
    name: "continuous_evaluation_twitter-support-agent_2026-01-07",
    status: "Completed",
    runs: "20+",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "2/24/26, 9:47:58 AM",
  },
  {
    id: "2",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 2,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/9/26, 8:13:53 AM",
  },
  {
    id: "3",
    name: "continuous_evaluation_twitter-support-agent_2026-01-07",
    status: "Completed",
    runs: "20+",
    createdBy: "Sebastian Kohlmeier",
    createdOn: "1/6/26, 5:34:14 PM",
  },
  {
    id: "4",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/5/26, 12:59:14 PM",
  },
  {
    id: "5",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/5/26, 9:51:05 AM",
  },
  {
    id: "6",
    name: "eval-8sv55j06",
    status: "Completed",
    runs: 10,
    createdBy: "Sebastian Kohlmeier",
    createdOn: "1/4/26, 5:13:24 PM",
  },
  {
    id: "7",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/4/26, 3:31:45 PM",
  },
  {
    id: "8",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/4/26, 3:27:01 PM",
  },
  {
    id: "9",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/4/26, 3:24:15 PM",
  },
  {
    id: "10",
    name: "Agent Evaluation",
    status: "Completed",
    runs: 1,
    createdBy: "03f58a63-79e3-4b86-a047-82b252e516ad",
    createdOn: "1/4/26, 3:05:19 PM",
  },
]

export function AutomaticEvaluationView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRow, setSelectedRow] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredEvaluations = mockEvaluations.filter((evaluation) =>
    evaluation.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with search and create */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search evaluations by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-transparent border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary w-[280px]"
          />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-secondary hover:bg-secondary/80 text-foreground"
        >
          Create
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 py-3"></th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Name
              </th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Status of last run
              </th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Runs
              </th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Created by
              </th>
              <th className="text-left py-3 text-xs font-medium text-muted-foreground">
                Created on
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEvaluations.map((evaluation) => (
              <tr
                key={evaluation.id}
                onClick={() => setSelectedRow(evaluation.id)}
                className={`border-b border-border/50 cursor-pointer transition-colors ${
                  selectedRow === evaluation.id
                    ? "bg-secondary/30"
                    : "hover:bg-secondary/20"
                }`}
              >
                <td className="py-3 pl-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedRow === evaluation.id
                        ? "border-primary"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {selectedRow === evaluation.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </td>
                <td className="py-3">
                  <span className="text-sm text-primary hover:underline cursor-pointer">
                    {evaluation.name}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm text-success">{evaluation.status}</span>
                  </div>
                </td>
                <td className="py-3">
                  <span className="text-sm text-foreground">{evaluation.runs}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm text-foreground">{evaluation.createdBy}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm text-foreground">{evaluation.createdOn}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Create Automatic Evaluation
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter evaluation name"
                  className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Evaluation Type
                </label>
                <select className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                  <option value="continuous">Continuous Evaluation</option>
                  <option value="single">Single Run</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Metrics
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Relevance
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Coherence
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" className="rounded" />
                    Fluency
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" className="rounded" />
                    Groundedness
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Description
                </label>
                <textarea
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2.5 bg-secondary border-0 rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowCreateModal(false)
                  alert("Evaluation created!")
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
