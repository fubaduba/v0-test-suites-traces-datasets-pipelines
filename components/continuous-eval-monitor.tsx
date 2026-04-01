"use client"

import { useState } from "react"
import { Pause, Settings, ArrowDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EvalResultsView } from "./eval-results-view"
import { SetupContinuousEval } from "./setup-continuous-eval"

interface EvalRun {
  id: string
  date: string
  tracesSampled: number
  score: number
  failures: number
  datasetVersion: string
  isAlert: boolean
}

// Mock data
const recentEvalRuns: EvalRun[] = [
  { id: "1", date: "Today, 10:15 AM", tracesSampled: 342, score: 71, failures: 3, datasetVersion: "v1", isAlert: true },
  { id: "2", date: "Yesterday, 10:00 AM", tracesSampled: 456, score: 85, failures: 0, datasetVersion: "v1", isAlert: false },
  { id: "3", date: "Mar 29, 10:00 AM", tracesSampled: 398, score: 87, failures: 0, datasetVersion: "v1", isAlert: false },
  { id: "4", date: "Mar 28, 10:00 AM", tracesSampled: 421, score: 84, failures: 1, datasetVersion: "v1", isAlert: false },
  { id: "5", date: "Mar 27, 10:00 AM", tracesSampled: 389, score: 86, failures: 0, datasetVersion: "v1", isAlert: false },
]

// Score trend data points (last 7 days)
const scoreTrendData = [
  { day: "Mar 25", score: 84 },
  { day: "Mar 26", score: 86 },
  { day: "Mar 27", score: 86 },
  { day: "Mar 28", score: 84 },
  { day: "Mar 29", score: 87 },
  { day: "Mar 30", score: 85 },
  { day: "Mar 31", score: 71 },
]

interface ContinuousEvalMonitorProps {
  isConfigured?: boolean
}

export function ContinuousEvalMonitor({ isConfigured = true }: ContinuousEvalMonitorProps) {
  const [selectedRun, setSelectedRun] = useState<EvalRun | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [showSetup, setShowSetup] = useState(!isConfigured)
  const [configured, setConfigured] = useState(isConfigured)

  // Show setup flow when not configured
  if (showSetup || !configured) {
    return (
      <SetupContinuousEval
        onClose={() => setShowSetup(false)}
        onComplete={() => {
          setShowSetup(false)
          setConfigured(true)
        }}
      />
    )
  }

  // Show eval results when a run is selected
  if (selectedRun) {
    return (
      <EvalResultsView
        onClose={() => setSelectedRun(null)}
        runName={`Eval run — ${selectedRun.date}`}
        evaluationName="twitter-support-agent"
      />
    )
  }

  // Calculate SVG path for the score trend line
  const chartWidth = 600
  const chartHeight = 120
  const padding = { top: 10, right: 10, bottom: 30, left: 40 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const minScore = 0
  const maxScore = 100
  const xStep = innerWidth / (scoreTrendData.length - 1)

  const getY = (score: number) => {
    return padding.top + innerHeight - ((score - minScore) / (maxScore - minScore)) * innerHeight
  }

  const getX = (index: number) => {
    return padding.left + index * xStep
  }

  // Build the path
  const pathPoints = scoreTrendData.map((d, i) => `${getX(i)},${getY(d.score)}`).join(" L ")
  const linePath = `M ${pathPoints}`

  // Alert threshold line at 70%
  const thresholdY = getY(70)

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="p-6 space-y-6">
        {/* Status Banner */}
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-success'}`} />
            <div>
              <span className="text-sm font-medium text-foreground">
                {isPaused ? 'Continuous eval paused' : 'Continuous eval active'}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                Sampling 10% of traffic · Dataset-backed mode · Daily refresh
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className={isPaused ? 'text-success border-success hover:bg-success/10' : ''}
            >
              <Pause className="w-4 h-4 mr-1.5" />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSetup(true)}>
              <Settings className="w-4 h-4 mr-1.5" />
              Configure
            </Button>
          </div>
        </div>

        {/* Score Trend Section */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">Score trend (last 7 days)</h3>
          <div className="p-4 bg-card border border-border rounded-lg">
            {/* SVG Chart */}
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-32"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Y-axis labels */}
              <text x={padding.left - 8} y={getY(100)} className="text-[10px] fill-muted-foreground" textAnchor="end" dominantBaseline="middle">100%</text>
              <text x={padding.left - 8} y={getY(70)} className="text-[10px] fill-muted-foreground" textAnchor="end" dominantBaseline="middle">70%</text>
              <text x={padding.left - 8} y={getY(50)} className="text-[10px] fill-muted-foreground" textAnchor="end" dominantBaseline="middle">50%</text>
              <text x={padding.left - 8} y={getY(0)} className="text-[10px] fill-muted-foreground" textAnchor="end" dominantBaseline="middle">0%</text>

              {/* X-axis labels */}
              {scoreTrendData.map((d, i) => (
                <text
                  key={d.day}
                  x={getX(i)}
                  y={chartHeight - 8}
                  className="text-[10px] fill-muted-foreground"
                  textAnchor="middle"
                >
                  {d.day.replace('Mar ', '')}
                </text>
              ))}

              {/* Alert threshold line (dashed red) */}
              <line
                x1={padding.left}
                y1={thresholdY}
                x2={chartWidth - padding.right}
                y2={thresholdY}
                stroke="oklch(0.577 0.245 27.325)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={chartWidth - padding.right + 4}
                y={thresholdY}
                className="text-[9px] fill-destructive"
                dominantBaseline="middle"
              >
                Alert
              </text>

              {/* Score line */}
              <path
                d={linePath}
                fill="none"
                stroke="oklch(0.65 0.2 280)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Data points */}
              {scoreTrendData.map((d, i) => (
                <circle
                  key={d.day}
                  cx={getX(i)}
                  cy={getY(d.score)}
                  r="4"
                  fill={d.score < 70 ? "oklch(0.577 0.245 27.325)" : "oklch(0.65 0.2 280)"}
                  stroke="oklch(0.12 0 0)"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* Alert message */}
            <div className="mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-md">
              <p className="text-sm text-amber-500">
                Score dropped below threshold 2 hours ago — 3 new failures detected
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          {/* Current Score */}
          <div className="p-4 rounded-lg border bg-destructive/10 border-destructive/20">
            <div className="text-sm text-muted-foreground mb-1">Current score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-destructive">71%</span>
              <span className="text-sm text-destructive flex items-center">
                <ArrowDown className="w-3 h-3 mr-0.5" />
                14% vs 7d avg
              </span>
            </div>
          </div>

          {/* Traces Evaluated Today */}
          <div className="p-4 rounded-lg border bg-card border-border">
            <div className="text-sm text-muted-foreground mb-1">Traces evaluated today</div>
            <div className="text-2xl font-semibold text-foreground">342</div>
          </div>

          {/* Dataset Size */}
          <div className="p-4 rounded-lg border bg-card border-border">
            <div className="text-sm text-muted-foreground mb-1">Dataset size</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">793 items</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground">Last enriched 1 day ago</span>
            </div>
          </div>

          {/* Alert Status */}
          <div className="p-4 rounded-lg border bg-destructive/10 border-destructive/20">
            <div className="text-sm text-muted-foreground mb-1">Alert status</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-destructive">Triggered</span>
            </div>
            <div className="text-xs text-destructive mt-1">Score below 70%</div>
          </div>
        </div>

        {/* Recent Eval Runs Table */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">Recent eval runs</h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Traces sampled</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Failures</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dataset version</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentEvalRuns.map((run) => (
                  <tr
                    key={run.id}
                    className={`border-b border-border/50 ${run.isAlert ? 'bg-destructive/5' : ''}`}
                  >
                    <td className="px-4 py-3 text-foreground">{run.date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{run.tracesSampled}</td>
                    <td className="px-4 py-3">
                      <span className={run.score < 70 ? 'text-destructive font-medium' : 'text-foreground'}>
                        {run.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={run.failures > 0 ? 'text-destructive' : 'text-muted-foreground'}>
                        {run.failures}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{run.datasetVersion}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedRun(run)}
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          View results
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        {run.isAlert && (
                          <button
                            onClick={() => setSelectedRun(run)}
                            className="text-amber-500 hover:underline text-sm"
                          >
                            Investigate failures
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trace-to-dataset Pipeline Section */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">Trace-to-dataset pipeline</h3>
          <div className="p-4 bg-card border border-border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Last run:</span>
              <span className="text-foreground">1 day ago</span>
              <span className="text-muted-foreground mx-1">·</span>
              <span className="text-muted-foreground">12,400 traces</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-muted-foreground">9,920</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-muted-foreground">1,984</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-success font-medium">793 added</span>
              <span className="text-muted-foreground">to twitter-eval-dataset v1</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Next run:</span>
              <span className="text-foreground">tomorrow 2:00 AM UTC</span>
            </div>
            <button className="text-primary hover:underline text-sm mt-1">
              View pipeline history
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
