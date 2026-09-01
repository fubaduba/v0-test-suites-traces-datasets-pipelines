"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { InsightsPanel } from "@/components/observe/insights-panel"
import { initFromInsight, type TraceQueryInit } from "@/lib/trace-explorer-data"

interface InsightsViewProps {
  onInvestigate: (init: TraceQueryInit) => void
}

export function InsightsView({ onInvestigate }: InsightsViewProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 px-5 py-4">
          <header>
            <h1 className="text-xl font-semibold text-foreground leading-tight">Insights</h1>
            <p className="text-xs text-muted-foreground">
              Prioritized findings across every monitored agent in this project
            </p>
          </header>
          <InsightsPanel onViewTraces={onViewTraces} />
        </div>
      </div>
    </TooltipProvider>
  )
}
