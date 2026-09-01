"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Bot,
  Wrench,
  Cpu,
  Bookmark,
  Lightbulb,
  Clock,
  AlertTriangle,
  CircleCheck,
  Loader,
  CornerDownRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  activeFilterCount,
  emptyTraceFilters,
  errorTypes,
  filterTraces,
  filtersToKql,
  initFromInsight,
  isParseableKql,
  kqlToFilters,
  parentTraces,
  parseNaturalLanguage,
  queryRecipes,
  spanCountOf,
  traceAgents,
  traceModels,
  traceStatuses,
  traceTools,
  traceWindows,
  type ParentTrace,
  type SpanNode,
  type TraceFilters,
  type TraceQueryInit,
} from "@/lib/trace-explorer-data"

const ALL = "__all__"

interface TraceExplorerProps {
  init?: TraceQueryInit | null
  onClearInit?: () => void
}

const statusStyle: Record<string, string> = {
  Completed: "bg-success/12 text-success/90 border-success/25",
  Failed: "bg-danger/12 text-danger border-danger/30",
  Running: "bg-primary/12 text-primary border-primary/30",
}

const spanKindMeta: Record<SpanNode["kind"], { icon: typeof Bot; tint: string }> = {
  agent: { icon: Bot, tint: "text-primary" },
  tool: { icon: Wrench, tint: "text-chart-4" },
  model: { icon: Cpu, tint: "text-chart-2" },
}

function fmtDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${ms}ms`
}

function SpanRow({ node, depth, isLast }: { node: SpanNode; depth: number; isLast: boolean }) {
  const meta = spanKindMeta[node.kind]
  const Icon = meta.icon
  const hasChildren = !!node.children?.length
  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 pr-2 border-b border-border/40"
        style={{ paddingLeft: depth * 20 + 8 }}
      >
        {depth > 0 && <CornerDownRight className="w-3 h-3 text-muted-foreground/50 shrink-0" aria-hidden="true" />}
        <Icon className={cn("w-3.5 h-3.5 shrink-0", node.status === "error" ? "text-danger" : meta.tint)} />
        <span className="px-1 py-0.5 text-[9px] uppercase tracking-wide bg-secondary border border-border text-muted-foreground shrink-0">
          {node.kind}
        </span>
        <span
          className={cn(
            "font-mono text-[12px] truncate",
            node.status === "error" ? "text-danger" : "text-foreground/90",
          )}
        >
          {node.name}
        </span>
        {node.detail && (
          <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">— {node.detail}</span>
        )}
        <span className="ml-auto flex items-center gap-2 shrink-0">
          {node.status === "error" && <AlertTriangle className="w-3 h-3 text-danger" aria-label="error span" />}
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{fmtDuration(node.durationMs)}</span>
        </span>
      </div>
      {hasChildren &&
        node.children!.map((child, index) => (
          <SpanRow key={child.id} node={child} depth={depth + 1} isLast={index === node.children!.length - 1} />
        ))}
    </div>
  )
}

function TraceRow({ trace }: { trace: ParentTrace }) {
  const [open, setOpen] = useState(false)
  const StatusIcon = trace.status === "Completed" ? CircleCheck : trace.status === "Failed" ? AlertTriangle : Loader
  return (
    <div className="bg-card border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/40 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 text-[10px] border shrink-0",
            statusStyle[trace.status],
          )}
        >
          <StatusIcon className={cn("w-3 h-3", trace.status === "Running" && "animate-spin")} />
          {trace.status}
        </span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[13px] font-medium text-foreground truncate">{trace.title}</span>
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-mono">{trace.id}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono truncate">{trace.entryAgent}</span>
            {trace.errorType && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-danger">{trace.errorType}</span>
              </>
            )}
          </span>
        </span>
        <span className="hidden md:flex items-center gap-1 shrink-0" aria-label="assets involved">
          <span className="px-1.5 py-0.5 text-[10px] bg-secondary border border-border text-muted-foreground">
            {trace.agents.length} agent{trace.agents.length > 1 ? "s" : ""}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] bg-secondary border border-border text-muted-foreground">
            {trace.tools.length} tool{trace.tools.length === 1 ? "" : "s"}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] bg-secondary border border-border text-muted-foreground">
            {spanCountOf(trace.tree)} spans
          </span>
        </span>
        <span className="hidden lg:flex flex-col items-end shrink-0 w-24">
          <span className="font-mono text-[12px] text-foreground tabular-nums">{fmtDuration(trace.durationMs)}</span>
          <span className="font-mono text-[10px] text-muted-foreground tabular-nums">${trace.cost.toFixed(3)}</span>
        </span>
        <span className="hidden xl:flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 w-28 justify-end">
          <Clock className="w-3 h-3" />
          {trace.startTime}
        </span>
      </button>

      {open && (
        <div className="border-t border-border bg-background/40">
          <div className="px-3 py-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="uppercase tracking-wide">Execution tree</span>
            <span aria-hidden="true">·</span>
            <span>who called whom, and every tool + model span</span>
          </div>
          <SpanRow node={trace.tree} depth={0} isLast />
        </div>
      )}
    </div>
  )
}

export function TraceExplorer({ init, onClearInit }: TraceExplorerProps) {
  const [filters, setFilters] = useState<TraceFilters>(emptyTraceFilters)
  const [kqlDraft, setKqlDraft] = useState<string>(() => filtersToKql(emptyTraceFilters))
  const [nlText, setNlText] = useState("")
  const [kqlError, setKqlError] = useState<string | null>(null)
  const [provenance, setProvenance] = useState<string | null>(null)

  // Tracks which surface last mutated state so the KQL box and the filter
  // builder stay in sync without fighting each other (avoids caret jumps).
  const editSource = useRef<"filters" | "kql">("filters")

  const applyFilters = (next: Partial<TraceFilters>) => {
    editSource.current = "filters"
    setFilters((current) => ({ ...current, ...next }))
  }

  // filters -> KQL (only when the builder/NL/recipe was the origin)
  useEffect(() => {
    if (editSource.current === "filters") {
      setKqlDraft(filtersToKql(filters))
      setKqlError(null)
    }
  }, [filters])

  // Entry-point hand-off: apply pre-filled filters + provenance banner.
  useEffect(() => {
    if (!init) return
    editSource.current = "filters"
    setFilters({ ...emptyTraceFilters, ...init.filters })
    setProvenance(init.source)
  }, [init])

  const onKqlChange = (value: string) => {
    editSource.current = "kql"
    setKqlDraft(value)
    if (value.trim() === "" || !isParseableKql(value)) {
      setKqlError(value.trim() === "" ? null : "No recognized clauses — expected e.g. where Status == \"Failed\".")
      return
    }
    setKqlError(null)
    setFilters(kqlToFilters(value))
  }

  const runNaturalLanguage = () => {
    if (!nlText.trim()) return
    const parsed = parseNaturalLanguage(nlText)
    applyFilters({ ...emptyTraceFilters, ...parsed })
  }

  const results = useMemo(() => filterTraces(parentTraces, filters), [filters])
  const filterCount = activeFilterCount(filters)

  const setSelect = (key: keyof TraceFilters, value: string) =>
    applyFilters({ [key]: value === ALL ? "" : value } as Partial<TraceFilters>)

  const savedRecipes = queryRecipes.filter((r) => r.kind === "saved")
  const suggestedRecipes = queryRecipes.filter((r) => r.kind === "suggested")

  const clearAll = () => {
    applyFilters(emptyTraceFilters)
    setProvenance(null)
    onClearInit?.()
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-4">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground leading-tight">Traces</h1>
            <p className="text-xs text-muted-foreground">
              Project-scoped trace explorer · query across every agent, tool, and model
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {results.length} of {parentTraces.length} parent traces
          </span>
        </header>

        {/* Provenance banner (from an insight card or KPI trend view) */}
        {provenance && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Investigating from</span>
            <span className="font-medium text-foreground text-pretty">{provenance}</span>
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}

        {/* Natural-language query bar (primary interaction) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-card border border-primary/40 focus-within:border-primary transition-colors">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <input
              type="text"
              value={nlText}
              onChange={(event) => setNlText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                  runNaturalLanguage()
                }
              }}
              placeholder="Show me failed traces over 5 seconds yesterday"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              aria-label="Natural language trace query"
            />
            <button
              type="button"
              onClick={runNaturalLanguage}
              disabled={!nlText.trim()}
              className="flex items-center gap-1.5 px-3 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Ask
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Natural language sets the structured filters below — refine them by hand or edit the KQL directly.
          </p>
        </div>

        {/* Recipe chips */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground mr-1">
              <Bookmark className="w-3 h-3" />
              Saved
            </span>
            {savedRecipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => applyFilters({ ...emptyTraceFilters, ...recipe.filters })}
                className="px-2 py-1 text-[11px] bg-secondary border border-border text-foreground/90 hover:border-primary/50 transition-colors"
              >
                {recipe.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground mr-1">
              <Lightbulb className="w-3 h-3" />
              Suggested
            </span>
            {suggestedRecipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => applyFilters({ ...emptyTraceFilters, ...recipe.filters })}
                className="px-2 py-1 text-[11px] bg-secondary/60 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                {recipe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Structured filter builder */}
        <div className="flex flex-col gap-2 border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Filters</span>
            {filterCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
                Clear all ({filterCount})
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <FilterSelect label="Agent" value={filters.agent} options={traceAgents} onChange={(v) => setSelect("agent", v)} mono />
            <FilterSelect label="Tool" value={filters.tool} options={traceTools} onChange={(v) => setSelect("tool", v)} mono />
            <FilterSelect label="Model" value={filters.model} options={traceModels} onChange={(v) => setSelect("model", v)} mono />
            <FilterSelect label="Status" value={filters.status} options={traceStatuses} onChange={(v) => setSelect("status", v)} />
            <FilterSelect
              label="Error type"
              value={filters.errorType}
              options={errorTypes as unknown as string[]}
              onChange={(v) => setSelect("errorType", v)}
            />

            {/* Latency range */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Latency (s)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={filters.latencyMin ?? ""}
                  onChange={(event) =>
                    applyFilters({ latencyMin: event.target.value === "" ? null : Number(event.target.value) })
                  }
                  placeholder="min"
                  className="w-16 bg-secondary border border-border px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 [color-scheme:dark]"
                  aria-label="Minimum latency in seconds"
                />
                <span className="text-muted-foreground text-[11px]">–</span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={filters.latencyMax ?? ""}
                  onChange={(event) =>
                    applyFilters({ latencyMax: event.target.value === "" ? null : Number(event.target.value) })
                  }
                  placeholder="max"
                  className="w-16 bg-secondary border border-border px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 [color-scheme:dark]"
                  aria-label="Maximum latency in seconds"
                />
              </div>
            </div>

            {/* Time window */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Time window</span>
              <div className="flex items-center border border-border bg-secondary">
                {traceWindows.map((win) => (
                  <button
                    key={win.id}
                    type="button"
                    onClick={() => applyFilters({ timeWindow: win.id })}
                    className={cn(
                      "px-2 py-1 text-[11px] transition-colors",
                      filters.timeWindow === win.id
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {win.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KQL editor (two-way sync) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">KQL query</span>
            <span className="text-[10px] text-muted-foreground">
              Generated from filters · edit or paste KQL to update the filters
            </span>
          </div>
          <textarea
            value={kqlDraft}
            onChange={(event) => onKqlChange(event.target.value)}
            spellCheck={false}
            rows={Math.min(9, kqlDraft.split("\n").length)}
            className={cn(
              "w-full resize-y bg-card border px-3 py-2 font-mono text-[12px] leading-relaxed text-foreground outline-none [color-scheme:dark]",
              kqlError ? "border-danger/60 focus:border-danger" : "border-border focus:border-primary/50",
            )}
            aria-label="KQL query"
          />
          {kqlError && <span className="text-[11px] text-danger">{kqlError}</span>}
        </div>

        {/* Results — parent traces */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Parent traces</h2>
            <span className="text-[11px] text-muted-foreground">
              each row is a full conversation or run — expand to see the call tree
            </span>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-1 border border-dashed border-border bg-card px-4 py-10 text-center">
              <span className="text-sm text-foreground">No traces match this query</span>
              <span className="text-[11px] text-muted-foreground">
                Loosen a filter, widen the time window, or clear the query to see all traces.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {results.map((trace) => (
                <TraceRow key={trace.id} trace={trace} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  mono,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <Select value={value || ALL} onValueChange={onChange}>
        <SelectTrigger size="sm" className="h-7 w-[180px] text-[11px]">
          <SelectValue placeholder={`All ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL} className="text-xs">
            {`All ${label.toLowerCase()}`}
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option} className={cn("text-xs", mono && "font-mono")}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
