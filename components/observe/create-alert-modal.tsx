"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import type { Insight } from "@/lib/observe-data"

interface CreateAlertModalProps {
  insight: Insight | null
  onClose: () => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="px-2 py-1.5 text-xs text-foreground bg-input border border-border">{value}</span>
    </label>
  )
}

export function CreateAlertModal({ insight, onClose }: CreateAlertModalProps) {
  useEffect(() => {
    if (!insight) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [insight, onClose])

  if (!insight) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close modal" onClick={onClose} className="absolute inset-0 bg-background/75" />
      <div
        role="dialog"
        aria-label="Create alert rule"
        className="relative w-full max-w-md bg-card border border-border"
      >
        <header className="flex items-start gap-2 px-4 py-3 border-b border-border">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Create alert from insight</h2>
            <p className="text-[11px] text-muted-foreground text-pretty">{insight.title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex flex-col gap-3 px-4 py-4">
          <Field label="Metric" value={insight.alertPrefill.metric} />
          <Field label="Scope" value={insight.alertPrefill.scope} />
          <Field label="Threshold" value={insight.alertPrefill.threshold} />
          <Field label="Channel" value={insight.alertPrefill.channel} />
        </div>

        <footer className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs bg-secondary border border-border text-foreground hover:border-primary/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled
            className="px-2.5 py-1 text-xs bg-primary/40 text-primary-foreground/70 cursor-not-allowed"
          >
            Create rule (Azure Monitor)
          </button>
        </footer>
      </div>
    </div>
  )
}
