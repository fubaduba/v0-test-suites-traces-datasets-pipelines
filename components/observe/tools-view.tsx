"use client"

import { FleetDashboard } from "./fleet-dashboard"
import { toolsFleet, toolsKpis, toolsStatusSummary } from "@/lib/fleet-data"

export function ToolsView() {
  return (
    <FleetDashboard
      title="Tools"
      subtitle={`Fleet health for this project · ${toolsFleet.length} tools · Last 24 hours`}
      entityPlural="tools"
      nameHeader="Tool"
      typeHeader="Type"
      kpis={toolsKpis}
      statusSummary={toolsStatusSummary}
      rows={toolsFleet}
    />
  )
}
