"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { ExternalLink, X } from "lucide-react"
import type { FleetAgent } from "@/lib/observe-data"

const tabs = ["Traces", "Evaluations", "Deployments"] as const

interface AgentDrawerProps {
  agent: FleetAgent | null
  onClose: () => void
}

export function AgentDrawer({ agent, onClose }: AgentDrawerProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Traces")

  useEffect(() => {
    if (!agent) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [agent, onClose])

  if (!agent) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="flex-1 bg-background/70"
      />
      <div
        role="dialog"
        aria-label={`${agent.name} details`}
        className="w-[460px] max-w-full h-full bg-card border-l border-border flex flex-col"
      >
        <header className="flex items-start gap-2 px-4 py-3 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 className="font-mono text-sm text-foreground truncate">{agent.name}</h2>
            <p className="text-[11px] text-muted-foreground">
              {agent.version} · deployed {agent.lastDeployment}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="px-4 py-3 border-b border-border bg-primary/5">
          <div className="flex items-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
            <p className="text-xs text-foreground/85 leading-relaxed text-pretty">{agent.drawerContext}</p>
          </div>
        </div>

        <nav className="flex items-center gap-4 px-4 border-b border-border">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "py-2 text-xs border-b-2 -mb-px transition-colors",
                tab === item
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "Traces" && (
            <ul className="flex flex-col gap-1.5">
              {[
                { id: "7a6bf85a13a84c58", status: "error", label: "groundedness 0.41 · 5.2s" },
                { id: "04d96fd4fdf19f69", status: "error", label: "groundedness 0.44 · 4.9s" },
                { id: "110169b515f177fe", status: "ok", label: "groundedness 0.78 · 2.1s" },
                { id: "a0566515dd63b9d2", status: "error", label: "groundedness 0.39 · 6.0s" },
                { id: "62ee87ceaeab8eaa", status: "ok", label: "groundedness 0.81 · 1.8s" },
              ].map((trace) => (
                <li
                  key={trace.id}
                  className="flex items-center gap-2 px-2 py-1.5 bg-secondary/40 border border-border"
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      trace.status === "error" ? "bg-danger" : "bg-success",
                    )}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[11px] text-foreground/80">{trace.id}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{trace.label}</span>
                </li>
              ))}
            </ul>
          )}

          {tab === "Evaluations" && (
            <div className="flex flex-col gap-2">
              {[
                { metric: "Groundedness", score: "0.61", delta: "−9.1", bad: true },
                { metric: "Relevance", score: "0.84", delta: "−1.2", bad: false },
                { metric: "Coherence", score: "0.91", delta: "+0.3", bad: false },
                { metric: "Fluency", score: "0.94", delta: "0.0", bad: false },
              ].map((row) => (
                <div
                  key={row.metric}
                  className="flex items-center gap-2 px-2 py-2 bg-secondary/40 border border-border"
                >
                  <span className="flex-1 text-xs text-foreground/85">{row.metric}</span>
                  <span className="text-xs tabular-nums text-foreground">{row.score}</span>
                  <span className={cn("w-12 text-right text-[11px] tabular-nums", row.bad ? "text-danger" : "text-muted-foreground")}>
                    {row.delta}
                  </span>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground">Last run 2h ago · 34 failing cases · sampled at 10%</p>
            </div>
          )}

          {tab === "Deployments" && (
            <ul className="flex flex-col gap-1.5">
              {[
                { v: agent.version, when: agent.lastDeployment, note: "current · gpt4o-prod-eastus2" },
                { v: "v16", when: "Aug 19, 11:20", note: "prompt update" },
                { v: "v15", when: "Aug 14, 08:05", note: "tool schema change" },
              ].map((deployment) => (
                <li
                  key={deployment.v}
                  className="flex items-center gap-2 px-2 py-1.5 bg-secondary/40 border border-border"
                >
                  <span className="text-xs text-foreground">{deployment.v}</span>
                  <span className="text-[11px] text-muted-foreground">{deployment.when}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{deployment.note}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
