"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, PanelRightClose, Plus } from "lucide-react"
import { firedAlerts, readinessItems, suggestedAlerts } from "@/lib/observe-data"

interface RightRailProps {
  highlightReadiness: boolean
  onCollapse: () => void
}

const severityDot = {
  critical: "bg-danger",
  warning: "bg-warning",
  info: "bg-muted-foreground",
}

export function RightRail({ highlightReadiness, onCollapse }: RightRailProps) {
  return (
    <aside className="w-[320px] shrink-0 border-l border-border bg-sidebar overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Readiness &amp; alerts</span>
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
            4 items
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

      {/* Alerts */}
      <section>
        <header className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <h3 className="flex-1 text-xs font-semibold text-foreground">Alerts</h3>
          <span className="px-1.5 py-0.5 text-[10px] bg-danger/20 text-danger border border-danger/30">
            3 active
          </span>
        </header>
        <ul className="border-b border-border">
          {firedAlerts.map((alert) => (
            <li key={alert.id} className="flex gap-2 px-3 py-2 border-b border-border/60 last:border-b-0">
              <span
                className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", severityDot[alert.severity])}
                aria-hidden="true"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-foreground/90 leading-snug text-pretty">{alert.title}</span>
                <span className="text-[11px] text-muted-foreground">{alert.meta}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="px-3 py-2">
          <p className="pb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Suggested alerts</p>
          <div className="flex flex-col gap-1.5">
            {suggestedAlerts.map((alert) => (
              <div
                key={alert}
                className="flex items-center gap-2 px-2 py-1 bg-card border border-border"
              >
                <span className="flex-1 text-xs text-foreground/85">{alert}</span>
                <button
                  type="button"
                  className="flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] text-primary border border-primary/40 hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </aside>
  )
}
