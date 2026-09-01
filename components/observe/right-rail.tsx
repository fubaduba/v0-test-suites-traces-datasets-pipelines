"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, Check, PanelRightClose } from "lucide-react"
import {
  evaluationSetups,
  evaluationSummary,
  readinessItems,
} from "@/lib/observe-data"

interface RightRailProps {
  highlightReadiness: boolean
  onCollapse: () => void
}

export function RightRail({ highlightReadiness, onCollapse }: RightRailProps) {
  return (
    <aside className="absolute inset-y-0 right-0 z-30 w-[320px] max-w-[85vw] shadow-2xl xl:static xl:z-auto xl:shadow-none shrink-0 border-l border-border bg-sidebar overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Readiness</span>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Collapse panel"
          className="text-muted-foreground hover:text-foreground"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Monitoring readiness */}
      <section
        id="monitoring-readiness"
        className={cn(
          "border-b border-border transition-colors",
          highlightReadiness && "ring-1 ring-inset ring-warning bg-warning/5",
        )}
      >
        <header className="flex items-center gap-2 px-3 py-2 border-b border-border bg-warning/10">
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          <h3 className="flex-1 text-xs font-semibold text-warning">Monitoring readiness</h3>
          <span className="px-1.5 py-0.5 text-[10px] bg-warning/20 text-warning border border-warning/30">
            {readinessItems.length} items
          </span>
        </header>
        <ul>
          {readinessItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 px-3 py-2 border-b border-border/60 last:border-b-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" aria-hidden="true" />
              <span className="flex-1 text-xs text-foreground/85 leading-snug">{item.label}</span>
              <button
                type="button"
                className="px-2 py-0.5 text-[11px] bg-secondary border border-border text-primary hover:border-primary/50 transition-colors"
              >
                {item.action}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Evaluations */}
      <section className="border-b border-border">
        <header className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <h3 className="flex-1 text-xs font-semibold text-foreground">Evaluations</h3>
          <button type="button" className="text-[11px] text-primary hover:underline">
            Manage
          </button>
        </header>
        <p className="px-3 py-2 text-[11px] text-muted-foreground border-b border-border/60">
          {evaluationSummary}
        </p>
        <ul>
          {evaluationSetups.map((setup) => (
            <li
              key={setup.id}
              className={cn(
                "flex items-start gap-2 px-3 py-2 border-b border-border/60 last:border-b-0",
                setup.failed && "bg-warning/10",
              )}
            >
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="font-mono text-[11px] text-foreground/85 truncate">{setup.agent}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {setup.mode} ·{" "}
                  <span className={setup.failed ? "text-warning" : undefined}>{setup.lastRun}</span>
                </span>
              </div>
              {setup.failed ? (
                <button
                  type="button"
                  className="shrink-0 px-1.5 py-0.5 text-[10px] bg-secondary border border-warning/40 text-warning hover:bg-warning/10 transition-colors"
                >
                  Diagnose
                </button>
              ) : (
                <Check className="w-3 h-3 mt-0.5 text-success shrink-0" aria-label="Passing" />
              )}
            </li>
          ))}
        </ul>
        <div className="px-3 py-2">
          <button
            type="button"
            className="w-full px-2 py-1 text-[11px] bg-secondary border border-border text-foreground hover:border-primary/50 transition-colors"
          >
            Set fleet default
          </button>
        </div>
      </section>
    </aside>
  )
}
