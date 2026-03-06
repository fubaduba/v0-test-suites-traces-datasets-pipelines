"use client"

import { useState } from "react"
import { Search, ChevronDown, Calendar, HelpCircle, CheckCircle, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AnnotateDialog, FullTemplate } from "./annotate-dialog"
import { AnnotationWizard } from "./annotation-wizard"

interface AnnotationResult {
  id: string
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

interface TracesTableProps {
  onAnnotationComplete: (results: AnnotationResult[], templateName: string) => void
}

// Generate mock trace data
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
    },
  ]
  return traces
}

const traces = generateTraceData()

const timeFilters = ["Last Day", "7D", "1M", "3M"]

export function TracesTable({ onAnnotationComplete }: TracesTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [showAnnotateDialog, setShowAnnotateDialog] = useState(false)
  const [showAnnotationWizard, setShowAnnotationWizard] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<FullTemplate | null>(null)

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const toggleAllRows = () => {
    if (selectedRows.size === traces.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(traces.map((t) => t.id)))
    }
  }

  const isAllSelected = selectedRows.size === traces.length
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < traces.length

  const handleStartAnnotation = (template: FullTemplate) => {
    setSelectedTemplate(template)
    setShowAnnotateDialog(false)
    setShowAnnotationWizard(true)
  }

  const handleAnnotationComplete = (results: AnnotationResult[]) => {
    if (selectedTemplate) {
      // Add unique IDs to results
      const resultsWithIds = results.map((r) => ({
        ...r,
        id: `${r.traceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }))
      onAnnotationComplete(resultsWithIds, selectedTemplate.name)
    }
    setShowAnnotationWizard(false)
    setSelectedTemplate(null)
    setSelectedRows(new Set())
  }

  const selectedTraces = traces.filter((t) => selectedRows.has(t.id))

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

        {/* Annotate button and Date range */}
        <div className="flex items-center gap-2">
          {/* Annotate Button */}
          <Button
            variant="outline"
            className="text-sm"
            disabled={selectedRows.size === 0}
            onClick={() => setShowAnnotateDialog(true)}
          >
            <Tag className="w-4 h-4 mr-2" />
            Annotate
            {selectedRows.size > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                {selectedRows.size}
              </span>
            )}
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

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr className="border-b border-border">
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleAllRows}
                  aria-label="Select all rows"
                  className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
              </th>
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
                className={`border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer ${
                  selectedRows.has(trace.id) ? "bg-secondary/40" : ""
                }`}
                onClick={() => toggleRow(trace.id)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedRows.has(trace.id)}
                    onCheckedChange={() => toggleRow(trace.id)}
                    aria-label={`Select row ${trace.id}`}
                  />
                </td>
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

      {/* Annotate Dialog */}
      {showAnnotateDialog && (
        <AnnotateDialog
          selectedCount={selectedRows.size}
          onClose={() => setShowAnnotateDialog(false)}
          onStartAnnotation={handleStartAnnotation}
        />
      )}

      {/* Annotation Wizard */}
      {showAnnotationWizard && selectedTemplate && (
        <AnnotationWizard
          traces={selectedTraces.map((t) => ({
            id: t.id,
            conversationId: t.conversationId,
            traceId: t.traceId,
            responseId: t.responseId,
            startTime: t.startTime,
          }))}
          template={selectedTemplate}
          onClose={() => {
            setShowAnnotationWizard(false)
            setSelectedTemplate(null)
          }}
          onComplete={handleAnnotationComplete}
        />
      )}
    </div>
  )
}
