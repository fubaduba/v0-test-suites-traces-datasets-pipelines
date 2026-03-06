import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AgentHeader } from "@/components/agent-header"
import { TracesTable } from "@/components/traces-table"

export default function AgentMonitoringPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <Header />

        {/* Agent Header with tabs */}
        <AgentHeader />

        {/* Traces Table */}
        <TracesTable />
      </div>
    </div>
  )
}
