"use client"

import { cn } from "@/lib/utils"
import {
  Bot,
  GitBranch,
  Box,
  Sliders,
  Wrench,
  BookOpen,
  Database,
  LineChart,
  Shield,
  Settings,
} from "lucide-react"

const navItems = [
  { icon: Bot, label: "Agents", active: true },
  { icon: GitBranch, label: "Workflows" },
  { icon: Box, label: "Models" },
  { icon: Sliders, label: "Fine-tune" },
  { icon: Wrench, label: "Tools" },
  { icon: BookOpen, label: "Knowledge" },
  { icon: Database, label: "Data" },
  { icon: LineChart, label: "Evaluations" },
  { icon: Shield, label: "Guardrails" },
]

export function Sidebar() {
  return (
    <aside className="w-[180px] min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">M</span>
        </div>
        <span className="text-sm font-medium text-sidebar-foreground">Microsoft Foundry</span>
      </div>

      {/* Project Selector */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>/</span>
          <span className="text-sidebar-foreground">zava-outdoors</span>
          <span className="text-xs">▾</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
              item.active
                ? "text-sidebar-foreground bg-sidebar-accent"
                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
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
