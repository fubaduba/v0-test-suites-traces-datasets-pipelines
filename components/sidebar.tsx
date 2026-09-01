"use client"

import { cn } from "@/lib/utils"
import {
  Bot,
  Box,
  Boxes,
  Wrench,
  BookOpen,
  Brain,
  Shield,
  Database,
  LayoutDashboard,
  ListTree,
  Layers,
  Lightbulb,
  LineChart,
  Sliders,
  Settings,
} from "lucide-react"

interface SidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

const sections = [
  {
    label: "Create",
    items: [
      { icon: Bot, label: "Agents", id: "agents" },
      { icon: Box, label: "Models", id: "models" },
      { icon: Boxes, label: "Services", id: "services" },
      { icon: Wrench, label: "Tools", id: "tools" },
      { icon: BookOpen, label: "Knowledge", id: "knowledge" },
      { icon: Brain, label: "Memory", id: "memory" },
      { icon: Shield, label: "Guardrails", id: "guardrails" },
      { icon: Database, label: "Data", id: "data" },
    ],
  },
  {
    label: "Observe",
    items: [
      { icon: LayoutDashboard, label: "Overview", id: "observe" },
      { icon: ListTree, label: "Traces", id: "observe-traces" },
      { icon: Layers, label: "Assets", id: "observe-assets" },
      { icon: Lightbulb, label: "Insights", id: "observe-insights" },
    ],
  },
  {
    label: "Optimize",
    items: [
      { icon: LineChart, label: "Evaluations", id: "evaluations" },
      { icon: Sliders, label: "Fine-tune", id: "finetune" },
    ],
  },
]

export function Sidebar({ activeSection = "observe", onSectionChange }: SidebarProps) {
  return (
    <aside className="w-[200px] min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">M</span>
        </div>
        <span className="text-sm font-medium text-sidebar-foreground">Microsoft Foundry</span>
      </div>

      {/* Project Selector */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>/</span>
          <span className="text-sidebar-foreground truncate">luechen-sc-fdp-1</span>
          <span className="text-xs">▾</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label} className="pb-1">
            <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {section.label}
            </div>
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-1.5 text-[13px] transition-colors relative",
                  activeSection === item.id
                    ? "text-sidebar-foreground bg-sidebar-accent"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                {activeSection === item.id && (
                  <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" aria-hidden="true" />
                )}
                <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-2 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-sidebar-foreground">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}
