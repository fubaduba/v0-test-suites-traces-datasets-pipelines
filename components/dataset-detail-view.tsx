"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ChevronDown,
  Search,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Check,
  X,
  GitBranch,
  Play,
  Pause,
  Clock,
  Bot,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AugmentDatasetPanel } from "./augment-dataset-panel"

// Types
interface DatasetRow {
  id: string
  rowNumber: number
  query: string
  expectedBehavior: string
  toolsExpected: string
  source: "synthetic" | "trace" | "human-edited" | "eval_failure"
  traceId: string | null
  annotation: "pass" | "fail" | "review" | null
  annotationNotes?: string
  annotationBy?: string
  agentResponse?: string
  dateAdded: string
  filterStage?: string
}

type FailureReason = "Incorrect answer" | "Incomplete answer" | "Tool call failure" | "Safety violation" | "Off-topic" | "Other"

interface AnnotationData {
  verdict: "pass" | "fail" | "review" | null
  correctedExpectedOutput: string
  failureReason: FailureReason | null
  notes: string
}

interface DatasetVersion {
  version: number
  tag: string | null
  timestamp: string
  relativeTime: string
  changeSummary: string
  rowCount: number
  sourceBreakdown: {
    synthetic: number
    trace: number
    humanEdited: number
  }
  evalRunCount: number
  isCurrent: boolean
}

interface EvalRun {
  id: string
  name: string
  agentVersion: string
  datasetVersion: number
  score: number
  passRate: string
  date: string
  status: "Completed" | "Running" | "Failed"
}

interface PipelineStatus {
  isActive: boolean
  status: "active" | "paused"
  schedule: string
  filterStages: string[]
  lastRunStats: {
    tracesProcessed: number
    tracesAdded: number
    date: string
  }
  nextRun: string
}

// Sample data
const sampleRows: DatasetRow[] = [
  {
    id: "1",
    rowNumber: 1,
    query: "Book a round-trip flight from SFO to NRT for 2 adults departing June 15, returning June 29, economy class with extra legroom if available",
    expectedBehavior: "Search flights with all specified criteria, present options sorted by price, confirm booking with passenger details and seat preferences",
    toolsExpected: "search_flights, book_flight",
    source: "synthetic",
    traceId: null,
    annotation: null,
    agentResponse: "I'd be happy to help you book a round-trip flight from San Francisco (SFO) to Tokyo Narita (NRT). Let me search for available options for 2 adults in economy class with extra legroom preferences.\n\n[Calling search_flights...]\n\nI found several options for your trip. Here are the top choices sorted by price:\n\n1. United Airlines - $1,245/person\n   Outbound: UA837, June 15, 11:00 AM - June 16, 3:30 PM\n   Return: UA838, June 29, 5:00 PM - June 29, 10:00 AM+1\n   Economy Plus (extra legroom) available: +$189/seat\n\n2. ANA - $1,320/person\n   Outbound: NH107, June 15, 1:00 PM - June 16, 5:00 PM\n   Return: NH106, June 29, 6:30 PM - June 29, 11:30 AM+1\n   Extra legroom seats available at no charge\n\nWould you like me to proceed with booking one of these options?",
    dateAdded: "2 weeks ago",
  },
  {
    id: "2",
    rowNumber: 2,
    query: "I need to cancel my hotel reservation at the Marriott in Tokyo, confirmation #MRT-8834221",
    expectedBehavior: "Look up reservation by confirmation number, verify cancellation policy, process cancellation if within window, confirm refund timeline",
    toolsExpected: "lookup_reservation, cancel_booking",
    source: "synthetic",
    traceId: null,
    annotation: "pass",
    annotationNotes: "Correctly identified cancellation policy and processed refund",
    annotationBy: "sarah@company.com",
    agentResponse: "I'll help you cancel your Marriott Tokyo reservation. Let me look up the details.\n\n[Calling lookup_reservation with confirmation #MRT-8834221...]\n\nI found your reservation:\n- Marriott Tokyo, Ginza\n- Check-in: April 10, 2026\n- Check-out: April 14, 2026\n- Cancellation Policy: Free cancellation until April 8, 2026\n\nGood news! You're within the free cancellation window. Would you like me to proceed with the cancellation? You'll receive a full refund to your original payment method within 5-7 business days.",
    dateAdded: "2 weeks ago",
  },
  {
    id: "3",
    rowNumber: 3,
    query: "What documents do I need for a US citizen traveling to Japan for 2 weeks?",
    expectedBehavior: "Provide visa requirements for US citizens to Japan, mention passport validity requirements, recommend travel insurance",
    toolsExpected: "get_visa_requirements",
    source: "trace",
    traceId: "t-8f2a...c41d",
    annotation: null,
    agentResponse: "For US citizens traveling to Japan for 2 weeks, here's what you'll need:\n\n**Required Documents:**\n- Valid US passport (must be valid for the duration of your stay)\n- Return or onward ticket\n\n**Visa Requirements:**\nUS citizens do not need a visa for tourism stays up to 90 days. You'll receive a \"temporary visitor\" status upon arrival.\n\n**Recommended:**\n- Travel insurance covering medical emergencies (highly recommended as US health insurance typically doesn't cover overseas)\n- Proof of accommodation\n- Sufficient funds for your stay\n\nWould you like me to help with anything else for your trip?",
    dateAdded: "5 days ago",
    filterStage: "Rule-based quality > Semantic dedup > LLM quality gate",
  },
  {
    id: "4",
    rowNumber: 4,
    query: "Find me hotels near Shibuya station under $200/night with free wifi and breakfast included",
    expectedBehavior: "Search hotels with location, price, and amenity filters, present top 5 options with ratings and availability",
    toolsExpected: "search_hotels",
    source: "trace",
    traceId: "t-3b9c...e28f",
    annotation: "fail",
    annotationNotes: "Only returned 3 hotels instead of top 5, missing availability info",
    annotationBy: "mike@company.com",
    agentResponse: "Here are some hotels near Shibuya station:\n\n1. Shibuya Stream Excel Hotel - $185/night\n   Rating: 4.2/5\n   Free WiFi, Breakfast included\n\n2. Dormy Inn Premium Shibuya - $175/night\n   Rating: 4.4/5\n   Free WiFi, Breakfast included\n\n3. Hotel Mets Shibuya - $165/night\n   Rating: 4.0/5\n   Free WiFi, Breakfast included",
    dateAdded: "3 days ago",
    filterStage: "Rule-based quality > Semantic dedup",
  },
  {
    id: "5",
    rowNumber: 5,
    query: "I want to book a multi-city trip: NYC to London, then London to Paris, then Paris back to NYC, all in business class for next month",
    expectedBehavior: "Handle multi-city booking request, search each leg separately, present combined itinerary options with total pricing",
    toolsExpected: "search_flights, book_multi_city",
    source: "eval_failure",
    traceId: "t-7d4e...a92b",
    annotation: null,
    agentResponse: "I can help you with flights. For multi-city trips, I recommend booking each leg separately for the best prices. Would you like me to search for NYC to London flights first?",
    dateAdded: "2 days ago",
  },
  {
    id: "6",
    rowNumber: 6,
    query: "Change my seat assignment to a window seat on flight UA1234",
    expectedBehavior: "Look up booking, check available window seats, update seat assignment, send confirmation",
    toolsExpected: "lookup_booking, update_seat",
    source: "human-edited",
    traceId: null,
    annotation: "pass",
    annotationNotes: "Perfect handling of seat change request",
    annotationBy: "sarah@company.com",
    agentResponse: "I'll help you change your seat to a window seat on flight UA1234.\n\n[Looking up your booking...]\n\nI found your booking. Currently you're assigned seat 24C (aisle). Here are the available window seats:\n\n- 18A (window, extra legroom) - +$45\n- 22F (window)\n- 24A (window, same row as current)\n- 31F (window)\n\nWhich window seat would you prefer? I can update it immediately.",
    dateAdded: "1 week ago",
  },
  {
    id: "7",
    rowNumber: 7,
    query: "What is the baggage allowance for my international flight on ANA?",
    expectedBehavior: "Identify airline baggage policy, provide carry-on and checked bag limits, mention any additional fees",
    toolsExpected: "get_baggage_policy",
    source: "synthetic",
    traceId: null,
    annotation: null,
    agentResponse: "For ANA (All Nippon Airways) international flights, the baggage allowance depends on your ticket class:\n\n**Economy Class:**\n- Carry-on: 1 bag up to 10kg (22 lbs), max dimensions 55x40x25cm\n- Checked: 2 bags up to 23kg (50 lbs) each\n\n**Business Class:**\n- Carry-on: 2 bags up to 10kg total\n- Checked: 2 bags up to 32kg (70 lbs) each\n\n**Additional Fees:**\n- Extra bag: $200-300 depending on route\n- Overweight (23-32kg): $100\n- Oversized: $150\n\nWould you like me to check your specific booking for exact allowances?",
    dateAdded: "2 weeks ago",
  },
  {
    id: "8",
    rowNumber: 8,
    query: "I missed my connecting flight due to a delay, what are my options?",
    expectedBehavior: "Acknowledge situation, look up rebooking options, explain passenger rights, offer to rebook on next available flight",
    toolsExpected: "lookup_booking, search_flights, rebook_flight",
    source: "trace",
    traceId: "t-1a2b...d34e",
    annotation: "pass",
    annotationNotes: "Excellent handling, covered all passenger rights",
    annotationBy: "mike@company.com",
    agentResponse: "I'm sorry to hear about your missed connection. Let me help you right away.\n\nFirst, if the delay was caused by the airline, you have certain rights:\n- Free rebooking on the next available flight\n- Meal vouchers if waiting more than 2 hours\n- Hotel accommodation if overnight delay required\n- Possible compensation (EU flights: up to 600 EUR)\n\n[Looking up your booking and next available flights...]\n\nI found the next available flights to your destination:\n1. Same airline, departing in 3 hours - I can rebook you now at no charge\n2. Partner airline, departing in 1 hour - may have seat availability\n\nWould you like me to rebook you on one of these flights?",
    dateAdded: "4 days ago",
    filterStage: "Rule-based quality > LLM quality gate",
  },
]

const sampleVersions: DatasetVersion[] = [
  {
    version: 3,
    tag: "prod",
    timestamp: "Mar 31, 2026 2:30 PM",
    relativeTime: "2 hours ago",
    changeSummary: "+12 from trace pipeline, +1 eval failure promoted",
    rowCount: 150,
    sourceBreakdown: { synthetic: 45, trace: 95, humanEdited: 10 },
    evalRunCount: 4,
    isCurrent: true,
  },
  {
    version: 2,
    tag: null,
    timestamp: "Mar 28, 2026 10:15 AM",
    relativeTime: "3 days ago",
    changeSummary: "+75 from trace pipeline (first pipeline run), +3 manual edits",
    rowCount: 137,
    sourceBreakdown: { synthetic: 42, trace: 85, humanEdited: 10 },
    evalRunCount: 2,
    isCurrent: false,
  },
  {
    version: 1,
    tag: "seed",
    timestamp: "Mar 17, 2026 9:00 AM",
    relativeTime: "2 weeks ago",
    changeSummary: "Initial generation: 25 synthetic rows, 37 trace rows from manual add",
    rowCount: 59,
    sourceBreakdown: { synthetic: 25, trace: 34, humanEdited: 0 },
    evalRunCount: 3,
    isCurrent: false,
  },
]

const sampleEvalRuns: EvalRun[] = [
  {
    id: "14",
    name: "Eval run #14",
    agentVersion: "v21",
    datasetVersion: 3,
    score: 78,
    passRate: "22/25",
    date: "2 hours ago",
    status: "Completed",
  },
  {
    id: "13",
    name: "Eval run #13",
    agentVersion: "v21",
    datasetVersion: 2,
    score: 87,
    passRate: "24/25",
    date: "3 days ago",
    status: "Completed",
  },
  {
    id: "10",
    name: "Eval run #10",
    agentVersion: "v20",
    datasetVersion: 1,
    score: 84,
    passRate: "21/25",
    date: "1 week ago",
    status: "Completed",
  },
  {
    id: "8",
    name: "Eval run #8",
    agentVersion: "v19",
    datasetVersion: 1,
    score: 81,
    passRate: "20/25",
    date: "2 weeks ago",
    status: "Completed",
  },
]

const samplePipeline: PipelineStatus = {
  isActive: true,
  status: "active",
  schedule: "Weekly",
  filterStages: ["Rule-based quality", "Semantic dedup", "LLM quality gate"],
  lastRunStats: {
    tracesProcessed: 793,
    tracesAdded: 12,
    date: "3 days ago",
  },
  nextRun: "In 4 days",
}

interface DatasetDetailViewProps {
  datasetName?: string
  onBack: () => void
  onNavigateToPipeline?: () => void
}

export function DatasetDetailView({
  datasetName = "twitter-eval-dataset",
  onBack,
  onNavigateToPipeline,
}: DatasetDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"rows" | "version-history" | "eval-runs" | "pipeline">("rows")
  const [selectedVersion, setSelectedVersion] = useState(3)
  const [searchQuery, setSearchQuery] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [editingRow, setEditingRow] = useState<DatasetRow | null>(null)
  
  // Annotation mode state
  const [isAnnotationMode, setIsAnnotationMode] = useState(false)
  const [annotatingRowIndex, setAnnotatingRowIndex] = useState(0)
  const [annotations, setAnnotations] = useState<Record<string, AnnotationData>>({})
  const [currentAnnotation, setCurrentAnnotation] = useState<AnnotationData>({
    verdict: null,
    correctedExpectedOutput: "",
    failureReason: null,
    notes: "",
  })
  
  // Augment panel state
  const [showAugmentPanel, setShowAugmentPanel] = useState(false)

  const tabs = [
    { label: "Rows", id: "rows" as const },
    { label: "Version history", id: "version-history" as const },
    { label: "Eval runs", id: "eval-runs" as const },
    { label: "Pipeline", id: "pipeline" as const },
  ]

  const currentVersion = sampleVersions.find((v) => v.version === selectedVersion)

  const filteredRows = sampleRows.filter((row) => {
    const matchesSearch =
      row.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.expectedBehavior.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSource = sourceFilter === "all" || row.source === sourceFilter
    return matchesSearch && matchesSource
  })

  // Annotation mode helpers
  const unannotatedRows = filteredRows.filter(row => !row.annotation && !annotations[row.id]?.verdict)
  const rowsNeedingReview = filteredRows.filter(row => row.annotation === "review" || annotations[row.id]?.verdict === "review")
  const rowsToAnnotate = [...unannotatedRows, ...rowsNeedingReview]
  const currentAnnotatingRow = rowsToAnnotate[annotatingRowIndex] || filteredRows[0]
  
  // Annotation stats
  const annotationStats = {
    pass: filteredRows.filter(r => r.annotation === "pass" || annotations[r.id]?.verdict === "pass").length,
    fail: filteredRows.filter(r => r.annotation === "fail" || annotations[r.id]?.verdict === "fail").length,
    review: filteredRows.filter(r => r.annotation === "review" || annotations[r.id]?.verdict === "review").length,
    unannotated: filteredRows.filter(r => !r.annotation && !annotations[r.id]?.verdict).length,
  }

  const enterAnnotationMode = (rowId?: string) => {
    setIsAnnotationMode(true)
    if (rowId) {
      const index = rowsToAnnotate.findIndex(r => r.id === rowId)
      setAnnotatingRowIndex(index >= 0 ? index : 0)
    } else {
      setAnnotatingRowIndex(0)
    }
    const row = rowId ? filteredRows.find(r => r.id === rowId) : rowsToAnnotate[0]
    if (row) {
      setCurrentAnnotation({
        verdict: annotations[row.id]?.verdict || row.annotation || null,
        correctedExpectedOutput: annotations[row.id]?.correctedExpectedOutput || row.expectedBehavior,
        failureReason: annotations[row.id]?.failureReason || null,
        notes: annotations[row.id]?.notes || row.annotationNotes || "",
      })
    }
  }

  const saveAnnotation = () => {
    if (currentAnnotatingRow) {
      setAnnotations(prev => ({
        ...prev,
        [currentAnnotatingRow.id]: { ...currentAnnotation }
      }))
      // Move to next unannotated row
      if (annotatingRowIndex < rowsToAnnotate.length - 1) {
        const nextRow = rowsToAnnotate[annotatingRowIndex + 1]
        setAnnotatingRowIndex(annotatingRowIndex + 1)
        setCurrentAnnotation({
          verdict: annotations[nextRow?.id]?.verdict || nextRow?.annotation || null,
          correctedExpectedOutput: annotations[nextRow?.id]?.correctedExpectedOutput || nextRow?.expectedBehavior || "",
          failureReason: annotations[nextRow?.id]?.failureReason || null,
          notes: annotations[nextRow?.id]?.notes || nextRow?.annotationNotes || "",
        })
      }
    }
  }

  const goToPrevAnnotation = () => {
    if (annotatingRowIndex > 0) {
      const prevRow = rowsToAnnotate[annotatingRowIndex - 1]
      setAnnotatingRowIndex(annotatingRowIndex - 1)
      setCurrentAnnotation({
        verdict: annotations[prevRow?.id]?.verdict || prevRow?.annotation || null,
        correctedExpectedOutput: annotations[prevRow?.id]?.correctedExpectedOutput || prevRow?.expectedBehavior || "",
        failureReason: annotations[prevRow?.id]?.failureReason || null,
        notes: annotations[prevRow?.id]?.notes || prevRow?.annotationNotes || "",
      })
    }
  }

  const goToNextAnnotation = () => {
    if (annotatingRowIndex < rowsToAnnotate.length - 1) {
      const nextRow = rowsToAnnotate[annotatingRowIndex + 1]
      setAnnotatingRowIndex(annotatingRowIndex + 1)
      setCurrentAnnotation({
        verdict: annotations[nextRow?.id]?.verdict || nextRow?.annotation || null,
        correctedExpectedOutput: annotations[nextRow?.id]?.correctedExpectedOutput || nextRow?.expectedBehavior || "",
        failureReason: annotations[nextRow?.id]?.failureReason || null,
        notes: annotations[nextRow?.id]?.notes || nextRow?.annotationNotes || "",
      })
    }
  }

  const failureReasons: FailureReason[] = [
    "Incorrect answer",
    "Incomplete answer", 
    "Tool call failure",
    "Safety violation",
    "Off-topic",
    "Other"
  ]

  const getSourceBadgeStyles = (source: DatasetRow["source"]) => {
    switch (source) {
      case "synthetic":
        return "bg-primary/20 text-primary border-primary/30"
      case "trace":
        return "bg-success/20 text-success border-success/30"
      case "human-edited":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "eval_failure":
        return "bg-destructive/20 text-destructive border-destructive/30"
    }
  }

  const getSourceLabel = (source: DatasetRow["source"]) => {
    switch (source) {
      case "synthetic":
        return "synthetic"
      case "trace":
        return "trace"
      case "human-edited":
        return "human-edited"
      case "eval_failure":
        return "eval_failure"
    }
  }

  const getAnnotationBadge = (annotation: DatasetRow["annotation"], rowId?: string, row?: DatasetRow) => {
    const effectiveAnnotation = rowId && annotations[rowId]?.verdict ? annotations[rowId].verdict : annotation
    const effectiveNotes = rowId && annotations[rowId]?.notes ? annotations[rowId].notes : row?.annotationNotes
    const effectiveBy = row?.annotationBy
    
    if (!effectiveAnnotation) return <span className="text-muted-foreground">--</span>
    
    const badgeContent = (
      <>
        {effectiveAnnotation === "pass" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-success/20 text-success border border-success/30 cursor-pointer">
            <Check className="w-3 h-3" />
            pass
          </span>
        )}
        {effectiveAnnotation === "review" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer">
            <MessageSquare className="w-3 h-3" />
            review
          </span>
        )}
        {effectiveAnnotation === "fail" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-destructive/20 text-destructive border border-destructive/30 cursor-pointer">
            <X className="w-3 h-3" />
            fail
          </span>
        )}
      </>
    )

    if (effectiveNotes || effectiveBy) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {badgeContent}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="text-xs font-medium capitalize">{effectiveAnnotation}</p>
                {effectiveNotes && <p className="text-xs text-muted-foreground">{effectiveNotes}</p>}
                {effectiveBy && <p className="text-xs text-muted-foreground">Annotated by: {effectiveBy}</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return badgeContent
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success"
    if (score >= 70) return "text-amber-400"
    return "text-destructive"
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-0 border-b border-border">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{datasetName}</h1>

            {/* Version dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-sm">
                  <span className="text-foreground font-medium">v{selectedVersion}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {sampleVersions.map((v) => (
                  <DropdownMenuItem
                    key={v.version}
                    onClick={() => setSelectedVersion(v.version)}
                    className="flex items-center justify-between gap-4"
                  >
                    <span>v{v.version}</span>
                    {v.tag && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded ${
                          v.tag === "prod"
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {v.tag}
                      </span>
                    )}
                    {v.isCurrent && <Check className="w-3.5 h-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-sm text-muted-foreground">{currentVersion?.rowCount} items</span>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="text-sm border-primary text-primary hover:bg-primary/10"
              onClick={() => setShowAugmentPanel(true)}
            >
              Augment
            </Button>
            <Button variant="outline" className="text-sm">
              Export
            </Button>
            <Button variant="outline" className="text-sm">
              Edit
            </Button>
            <Button className="text-sm bg-primary hover:bg-primary/90">Run eval</Button>
          </div>
        </div>

        {/* Metadata line */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>Created by: Eval Pipeline</span>
          <span className="text-border">|</span>
          <span>Last modified: {currentVersion?.relativeTime}</span>
          <span className="text-border">|</span>
          <span>Agent: twitter-support-agent</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "rows" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar - changes based on annotation mode */}
          {isAnnotationMode ? (
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Annotating</span>
                  <span className="text-sm text-muted-foreground">
                    {rowsToAnnotate.length > 0 
                      ? `${annotatingRowIndex + 1} of ${rowsToAnnotate.length} rows need review`
                      : "All rows reviewed"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goToPrevAnnotation}
                    disabled={annotatingRowIndex === 0}
                    className="text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goToNextAnnotation}
                    disabled={annotatingRowIndex >= rowsToAnnotate.length - 1}
                    className="text-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAnnotationMode(false)}
                className="text-sm"
              >
                Exit annotation
              </Button>
            </div>
          ) : (
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search rows"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary border border-border text-sm hover:bg-secondary/80">
                      <span className="text-muted-foreground">Source:</span>
                      <span className="text-foreground capitalize">
                        {sourceFilter === "all" ? "All" : sourceFilter.replace("-", " ")}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setSourceFilter("all")}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSourceFilter("synthetic")}>Synthetic</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSourceFilter("trace")}>From traces</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSourceFilter("human-edited")}>Human-edited</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSourceFilter("eval_failure")}>Eval failure</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary border border-border text-sm hover:bg-secondary/80">
                      <span className="text-foreground">Sort</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>Newest first</DropdownMenuItem>
                    <DropdownMenuItem>Oldest first</DropdownMenuItem>
                    <DropdownMenuItem>Row number</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredRows.length} rows
                </span>
                <Button 
                  variant="outline" 
                  className="text-sm"
                  onClick={() => enterAnnotationMode()}
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Annotate
                </Button>
                <Button className="text-sm bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-1" />
                  Add row
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-3 font-medium text-muted-foreground w-12">Row #</th>
                    <th className="text-left px-3 py-3 font-medium text-muted-foreground min-w-[280px]">Query</th>
                    <th className="text-left px-3 py-3 font-medium text-muted-foreground min-w-[280px]">Expected behavior</th>
                    <th className="text-left px-3 py-3 font-medium text-muted-foreground w-40">Tools expected</th>
                    <th className="text-left px-3 py-3 font-medium text-muted-foreground w-28">Source</th>
                    <th className="text-left px-3 py-3 font-medium text-muted-foreground w-28">Trace ID</th>
                    <th className="text-left px-3 py-3 font-medium text-muted-foreground w-24">Annotation</th>
                    <th className="text-left px-3 py-3 font-medium text-muted-foreground w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <>
                      <tr
                        key={row.id}
                        className={`border-b border-border/50 hover:bg-secondary/30 cursor-pointer ${
                          expandedRowId === row.id ? "bg-secondary/30" : ""
                        }`}
                        onClick={() => setExpandedRowId(expandedRowId === row.id ? null : row.id)}
                      >
                        <td className="px-3 py-3 text-muted-foreground">{row.rowNumber}</td>
                        <td className="px-3 py-3 text-foreground whitespace-normal break-words">
                          {row.query}
                        </td>
                        <td className="px-3 py-3 text-foreground whitespace-normal break-words">
                          {row.expectedBehavior}
                        </td>
                        <td className="px-3 py-3">
                          <code className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {row.toolsExpected}
                          </code>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs border ${getSourceBadgeStyles(
                              row.source
                            )}`}
                          >
                            {getSourceLabel(row.source)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {row.traceId ? (
                            <button className="text-primary hover:underline font-mono text-xs">
                              {row.traceId}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </td>
                        <td className="px-3 py-3">{getAnnotationBadge(row.annotation, row.id, row)}</td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-secondary rounded">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingRow(row)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => enterAnnotationMode(row.id)}>
                                Annotate
                              </DropdownMenuItem>
                              {row.traceId && <DropdownMenuItem>View trace</DropdownMenuItem>}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      {/* Expanded inline edit view */}
                      {expandedRowId === row.id && (
                        <tr className="bg-secondary/20">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                    Query
                                  </label>
                                  <textarea
                                    defaultValue={row.query}
                                    className="w-full p-3 bg-input border border-border rounded-md text-sm text-foreground resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                    Expected behavior
                                  </label>
                                  <textarea
                                    defaultValue={row.expectedBehavior}
                                    className="w-full p-3 bg-input border border-border rounded-md text-sm text-foreground resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Button className="text-sm bg-primary hover:bg-primary/90">Save</Button>
                                <button
                                  onClick={() => setExpandedRowId(null)}
                                  className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                  Cancel
                                </button>
                              </div>

                              {/* Metadata */}
                              <div className="pt-3 border-t border-border space-y-2">
                                <div className="flex items-center gap-6 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Source: </span>
                                    <span
                                      className={`inline-flex px-2 py-0.5 rounded text-xs border ${getSourceBadgeStyles(
                                        row.source
                                      )}`}
                                    >
                                      {getSourceLabel(row.source)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Trace ID: </span>
                                    {row.traceId ? (
                                      <button className="text-primary hover:underline font-mono text-xs">
                                        {row.traceId}
                                      </button>
                                    ) : (
                                      <span className="text-foreground">--</span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Date added: </span>
                                    <span className="text-foreground">{row.dateAdded}</span>
                                  </div>
                                </div>
                                {row.filterStage && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Filter stage: </span>
                                    <span className="text-foreground">{row.filterStage}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Annotation Card - shown when in annotation mode */}
          {isAnnotationMode && currentAnnotatingRow && (
            <div className="px-6 py-4 border-t border-border bg-card">
              <div className="flex gap-6">
                {/* Left side - 60% - Query and Response */}
                <div className="flex-[3] space-y-4">
                  {/* Query */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Query (Row #{currentAnnotatingRow.rowNumber})
                    </label>
                    <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {currentAnnotatingRow.query}
                      </p>
                    </div>
                  </div>

                  {/* Agent Response */}
                  {currentAnnotatingRow.agentResponse && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Agent Response
                      </label>
                      <div className="p-4 bg-input border border-border rounded-lg max-h-48 overflow-auto">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {currentAnnotatingRow.agentResponse}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Expected Behavior */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Expected Behavior
                    </label>
                    <div className="p-4 bg-secondary/30 border border-border rounded-lg">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {currentAnnotatingRow.expectedBehavior}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side - 40% - Annotation Controls */}
                <div className="flex-[2] space-y-4">
                  {/* Verdict buttons */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Verdict
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentAnnotation(prev => ({ ...prev, verdict: "pass" }))}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors border ${
                          currentAnnotation.verdict === "pass"
                            ? "bg-success/20 border-success text-success"
                            : "border-success/50 text-success/70 hover:bg-success/10"
                        }`}
                      >
                        <Check className="w-4 h-4 inline mr-1.5" />
                        Pass
                      </button>
                      <button
                        onClick={() => setCurrentAnnotation(prev => ({ ...prev, verdict: "fail" }))}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors border ${
                          currentAnnotation.verdict === "fail"
                            ? "bg-destructive/20 border-destructive text-destructive"
                            : "border-destructive/50 text-destructive/70 hover:bg-destructive/10"
                        }`}
                      >
                        <X className="w-4 h-4 inline mr-1.5" />
                        Fail
                      </button>
                      <button
                        onClick={() => setCurrentAnnotation(prev => ({ ...prev, verdict: "review" }))}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors border ${
                          currentAnnotation.verdict === "review"
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "border-amber-500/50 text-amber-400/70 hover:bg-amber-500/10"
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 inline mr-1.5" />
                        Needs review
                      </button>
                    </div>
                  </div>

                  {/* Failure reason - only shown when verdict is "fail" */}
                  {currentAnnotation.verdict === "fail" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Failure Reason
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-secondary border border-border text-sm hover:bg-secondary/80">
                              <span className={currentAnnotation.failureReason ? "text-foreground" : "text-muted-foreground"}>
                                {currentAnnotation.failureReason || "Select a reason..."}
                              </span>
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            {failureReasons.map((reason) => (
                              <DropdownMenuItem 
                                key={reason}
                                onClick={() => setCurrentAnnotation(prev => ({ ...prev, failureReason: reason }))}
                              >
                                {reason}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Corrected Expected Output
                        </label>
                        <textarea
                          value={currentAnnotation.correctedExpectedOutput}
                          onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, correctedExpectedOutput: e.target.value }))}
                          className="w-full p-3 bg-input border border-border rounded-md text-sm text-foreground resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Enter the corrected expected behavior..."
                        />
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Notes
                    </label>
                    <textarea
                      value={currentAnnotation.notes}
                      onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full p-3 bg-input border border-border rounded-md text-sm text-foreground resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Add any notes..."
                    />
                  </div>

                  {/* Save button */}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={saveAnnotation}
                    disabled={!currentAnnotation.verdict}
                  >
                    Save annotation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar - shown when in annotation mode */}
          {isAnnotationMode && (
            <div className="px-6 py-4 border-t border-border bg-secondary/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-foreground">{annotationStats.pass} pass</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-foreground">{annotationStats.fail} fail</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-foreground">{annotationStats.review} review</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-muted" />
                    <span className="text-muted-foreground">{annotationStats.unannotated} unannotated</span>
                  </span>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  Save all and create new version
                </Button>
              </div>
              {/* Progress bar visualization */}
              <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                {annotationStats.pass > 0 && (
                  <div 
                    className="bg-success" 
                    style={{ width: `${(annotationStats.pass / filteredRows.length) * 100}%` }} 
                  />
                )}
                {annotationStats.fail > 0 && (
                  <div 
                    className="bg-destructive" 
                    style={{ width: `${(annotationStats.fail / filteredRows.length) * 100}%` }} 
                  />
                )}
                {annotationStats.review > 0 && (
                  <div 
                    className="bg-amber-500" 
                    style={{ width: `${(annotationStats.review / filteredRows.length) * 100}%` }} 
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "version-history" && (
        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-foreground">Version history</h2>
            <Button variant="outline" className="text-sm">
              <GitBranch className="w-4 h-4 mr-2" />
              Compare versions
            </Button>
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {sampleVersions.map((version, index) => (
              <div key={version.version} className="relative flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      version.isCurrent
                        ? "bg-primary border-primary"
                        : "bg-secondary border-muted-foreground"
                    }`}
                  />
                  {index < sampleVersions.length - 1 && (
                    <div className="w-px flex-1 bg-border min-h-[120px]" />
                  )}
                </div>

                {/* Version card */}
                <div className="flex-1 pb-6">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-medium">v{version.version}</span>
                        {version.tag && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] rounded ${
                              version.tag === "prod"
                                ? "bg-primary/20 text-primary"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {version.tag}
                          </span>
                        )}
                        {version.isCurrent && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-success/20 text-success rounded">
                            current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{version.relativeTime}</span>
                        <span className="text-border">|</span>
                        <span>{version.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-sm text-foreground mb-3">{version.changeSummary}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {version.rowCount} rows
                        </span>

                        {/* Source breakdown mini bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex h-2 w-24 rounded-full overflow-hidden bg-secondary">
                            <div
                              className="bg-primary"
                              style={{
                                width: `${
                                  (version.sourceBreakdown.synthetic / version.rowCount) * 100
                                }%`,
                              }}
                            />
                            <div
                              className="bg-success"
                              style={{
                                width: `${
                                  (version.sourceBreakdown.trace / version.rowCount) * 100
                                }%`,
                              }}
                            />
                            <div
                              className="bg-amber-500"
                              style={{
                                width: `${
                                  (version.sourceBreakdown.humanEdited / version.rowCount) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              {version.sourceBreakdown.synthetic}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-success" />
                              {version.sourceBreakdown.trace}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              {version.sourceBreakdown.humanEdited}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button className="text-sm text-primary hover:underline">
                          {version.evalRunCount} eval runs used this version
                        </button>
                        <div className="flex items-center gap-2">
                          <button className="text-sm text-muted-foreground hover:text-foreground">
                            View rows
                          </button>
                          <span className="text-border">|</span>
                          <button className="text-sm text-muted-foreground hover:text-foreground">
                            Compare with previous
                          </button>
                          <span className="text-border">|</span>
                          <button className="text-sm text-muted-foreground hover:text-foreground">
                            Tag version
                          </button>
                          {!version.isCurrent && (
                            <>
                              <span className="text-border">|</span>
                              <button className="text-sm text-muted-foreground hover:text-foreground">
                                Restore
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "eval-runs" && (
        <div className="flex-1 overflow-auto px-6 py-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Eval runs using this dataset</h2>

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Run name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Agent version</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dataset version</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pass rate</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleEvalRuns.map((run) => (
                  <tr key={run.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <button className="text-primary hover:underline flex items-center gap-1">
                        {run.name}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-foreground">{run.agentVersion}</td>
                    <td className="px-4 py-3 text-foreground">v{run.datasetVersion}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${getScoreColor(run.score)}`}>{run.score}%</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{run.passRate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{run.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
                          run.status === "Completed"
                            ? "bg-success/20 text-success"
                            : run.status === "Running"
                            ? "bg-primary/20 text-primary"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {run.status === "Completed" && <Check className="w-3 h-3" />}
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="flex-1 overflow-auto px-6 py-6">
          {samplePipeline.isActive ? (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-foreground">Trace-to-dataset pipeline</h2>
                <Button variant="outline" className="text-sm" onClick={onNavigateToPipeline}>
                  Configure
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="p-5 bg-card border border-border rounded-lg space-y-5">
                {/* Status row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        samplePipeline.status === "active" ? "bg-success" : "bg-muted-foreground"
                      }`}
                    />
                    <span className="text-foreground font-medium">
                      {samplePipeline.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {samplePipeline.status === "active" ? (
                      <Button variant="outline" size="sm" className="text-sm">
                        <Pause className="w-3.5 h-3.5 mr-1.5" />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="text-sm">
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        Resume
                      </Button>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Schedule</p>
                    <p className="text-foreground">{samplePipeline.schedule}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Next run</p>
                    <p className="text-foreground">{samplePipeline.nextRun}</p>
                  </div>
                </div>

                {/* Filter stages */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Filter stages enabled</p>
                  <div className="flex items-center gap-2">
                    {samplePipeline.filterStages.map((stage, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-secondary text-foreground rounded flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-success" />
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last run stats */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Last run ({samplePipeline.lastRunStats.date})</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-2xl font-semibold text-foreground">
                        {samplePipeline.lastRunStats.tracesProcessed.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">traces processed</p>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-2xl font-semibold text-success">
                        +{samplePipeline.lastRunStats.tracesAdded}
                      </p>
                      <p className="text-sm text-muted-foreground">rows added to dataset</p>
                    </div>
                  </div>
                </div>

                {/* Agent link */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">twitter-support-agent</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <GitBranch className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No pipeline configured</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Set up a pipeline to automatically enrich this dataset from production traces.
              </p>
              <Button className="bg-primary hover:bg-primary/90">Configure pipeline</Button>
            </div>
          )}
        </div>
      )}

      {/* Augment Dataset Panel */}
      {showAugmentPanel && (
        <AugmentDatasetPanel
          datasetName={datasetName}
          currentVersion={selectedVersion}
          onClose={() => setShowAugmentPanel(false)}
          onAddToDataset={(rows, newVersion) => {
            // In a real app, this would add the rows to the dataset
            console.log(`[v0] Added ${rows.length} rows, new version: v${newVersion}`)
            setSelectedVersion(newVersion)
          }}
        />
      )}
    </div>
  )
}
