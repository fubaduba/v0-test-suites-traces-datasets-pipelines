"use client"

import { cn } from "@/lib/utils"
import { ChevronRight, ShieldCheck } from "lucide-react"
import { insights, type Insight, type InsightImpact } from "@/lib/observe-data"

const MAX_ROWS = 5

const impactLabel: Record<InsightImpact, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

/** Neutral impact bar — three segments, filled by level, no severity color. */
function ImpactBar({ level }: { level: InsightImpact }) {
  const filled = level === "high" ? 3 : level === "medium" ? 2 : 1
  return (
    <span className="flex items-center gap-2 shrink-0" aria-label={`Impact: ${impactLabel[level]}`}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("h-3.5 w-1.5 rounded-[1px]", i < filled ? "bg-foreground/55" : "bg-border")}
          />
        ))}
      </span>
      <span className="w-14 text-[11px] uppercase tracking-wide text-muted-foreground">{impactLabel[level]}</span>
    </span>
  )
}

interface InsightsPanelProps {
  /** Opens the existing full insight detail experience. Entry point only. */
  onOpenInsight: (insight: Insight) => void
  /** Navigates to the full Insights page. */
  onViewAll?: () => void
  /** Opens the policy & compliance surface. */
  onOpenPolicy?: () => void
}

export function InsightsPanel({ onOpenInsight, onViewAll, onOpenPolicy }: InsightsPanelProps) {
  // Rank by importance, not severity. Cap the visible list.
  const ranked = [...insights].sort((a, b) => b.importance - a.importance)
  const visible = ranked.slice(0, MAX_ROWS)
  const total = ranked.length

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Recommended actions</h2>
        <span className="text-xs text-muted-foreground">Ranked by importance</span>
      </div>

      <div className="flex flex-col border border-border bg-card">
        {visible.map((insight) => (
          <button
            key={insight.id}
            type="button"
            onClick={() => onOpenInsight(insight)}
            className="group flex items-center gap-4 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-secondary/40"
          >
            <ImpactBar level={insight.impactLevel} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-foreground">{insight.recommendedAction}</span>
            </span>
            <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline">
              {insight.affectedAsset}
            </span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </button>
        ))}

        {/* Policy & compliance collapses to a single link-out row, not a card. */}
        <button
          type="button"
          onClick={() => onOpenPolicy?.()}
          className="group flex items-center gap-3 border-t border-border px-3 py-2.5 text-left transition-colors hover:bg-secondary/40"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="flex-1 text-[13px] text-foreground">Policy &amp; compliance</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">Review in Governance</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onViewAll?.()}
          className="text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {`View all insights (${total})`}
        </button>
      </div>
    </section>
  )
}
