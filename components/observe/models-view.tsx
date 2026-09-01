"use client"

import { useState } from "react"
import { FlaskConical, FolderTree, Info } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FleetDashboard } from "./fleet-dashboard"
import {
  ALL_PROJECTS,
  defaultProject,
  fleetProjects,
  modelsFleet,
  modelsKpis,
  modelsStatusSummary,
} from "@/lib/fleet-data"

export function ModelsView() {
  // Current project starts as the default project — the only scope with model data.
  const [project, setProject] = useState<string>(defaultProject.id)
  const isDefaultProject = project === defaultProject.id

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Work-in-progress proposal banner */}
      <div className="flex items-center gap-2 px-5 py-2 bg-warning/10 border-b border-warning/30 text-[11px] text-warning">
        <FlaskConical className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium uppercase tracking-wide">Work-in-progress proposal</span>
        <span className="text-warning/80">
          Model-level fleet monitoring is a design proposal — not yet wired to live telemetry.
        </span>
      </div>

      {/* Project selector */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-border">
        <FolderTree className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Project</span>
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger size="sm" className="w-[240px] text-xs">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PROJECTS} className="text-xs">
              All projects
            </SelectItem>
            {fleetProjects.map((item) => (
              <SelectItem key={item.id} value={item.id} className="text-xs">
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isDefaultProject ? (
        <FleetDashboard
          title="Models"
          subtitle={`Fleet health for ${defaultProject.name.replace(" (default)", "")} · ${modelsFleet.length} model deployments · Last 24 hours`}
          entityPlural="models"
          nameHeader="Model deployment"
          typeHeader="Family"
          kpis={modelsKpis}
          statusSummary={modelsStatusSummary}
          rows={modelsFleet}
        />
      ) : (
        <div className="px-5 py-10">
          <div className="max-w-xl flex items-start gap-3 border border-border bg-card px-4 py-4">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">Model views are project-scoped</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {project === ALL_PROJECTS
                  ? "Model-level fleet health is not aggregated across projects in this proposal."
                  : "This project does not expose a model-level fleet view in this proposal."}{" "}
                Select <span className="font-medium text-foreground">{defaultProject.name}</span> to view
                model-level fleet health.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
