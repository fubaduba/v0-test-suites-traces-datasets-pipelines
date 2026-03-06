"use client"

import { ArrowLeft, ChevronDown, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

const tabs = [
  { label: "Playground", active: false },
  { label: "Traces", active: true },
  { label: "Monitor", active: false },
  { label: "Evaluation", active: false },
]

export function AgentHeader() {
  return (
    <div className="px-6 py-4 border-b border-border">
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">twitter-support-agent</h1>
          <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded">
            Preview
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            v21 saved 2/24/2026 11:44 AM
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />

          <Button variant="outline" className="text-sm" disabled>
            Save
          </Button>
          <Button variant="outline" className="text-sm">
            Preview
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="default" className="text-sm bg-primary text-primary-foreground">
            Publish
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`text-sm pb-2 border-b-2 transition-colors ${
              tab.active
                ? "text-foreground border-foreground font-medium"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
