"use client"

import { useState } from "react"
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronRight, 
  Pause, 
  Play, 
  Settings,
  Trash2,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface PipelineConfigProps {
  onClose?: () => void
  isEmbedded?: boolean
}

// Sample run history data
const runHistoryData = [
  { id: "1", date: "Apr 1, 2026 2:00 AM", input: 2412, quality: 1930, dedup: 386, llm: 193, final: 193, version: "v23", duration: "4m 32s", status: "Completed", recent: true },
  { id: "2", date: "Mar 25, 2026 2:00 AM", input: 2398, quality: 1918, dedup: 384, llm: 192, final: 192, version: "v22", duration: "4m 18s", status: "Completed", recent: false },
  { id: "3", date: "Mar 18, 2026 2:00 AM", input: 2445, quality: 1956, dedup: 391, llm: 196, final: 196, version: "v21", duration: "4m 45s", status: "Completed", recent: false },
  { id: "4", date: "Mar 11, 2026 2:00 AM", input: 2367, quality: 1894, dedup: 379, llm: 189, final: 189, version: "v20", duration: "4m 12s", status: "Completed", recent: false },
  { id: "5", date: "Mar 4, 2026 2:00 AM", input: 2401, quality: 1921, dedup: 384, llm: 192, final: 192, version: "v19", duration: "4m 28s", status: "Completed", recent: false },
]

const existingDatasets = [
  { id: "1", name: "twitter-eval-dataset", version: "v1", items: 150 },
  { id: "2", name: "support-golden-set", version: "v2", items: 75 },
]

const testSuites = [
  { id: "1", name: "twitter-support-quality" },
  { id: "2", name: "safety-red-team" },
]

export function PipelineConfig({ onClose, isEmbedded = false }: PipelineConfigProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Filter stages
  const [ruleBasedEnabled, setRuleBasedEnabled] = useState(true)
  const [ruleBasedExpanded, setRuleBasedExpanded] = useState(true)
  const [minInputLength, setMinInputLength] = useState(20)
  const [minOutputLength, setMinOutputLength] = useState(50)
  const [maxSpecialCharRatio, setMaxSpecialCharRatio] = useState(30)
  
  const [semanticDedupEnabled, setSemanticDedupEnabled] = useState(true)
  const [semanticDedupExpanded, setSemanticDedupExpanded] = useState(false)
  const [dedupMethod, setDedupMethod] = useState("both")
  const [similarityThreshold, setSimilarityThreshold] = useState(0.85)
  const [clusterSampleSize, setClusterSampleSize] = useState(5)
  
  const [llmGateEnabled, setLlmGateEnabled] = useState(true)
  const [llmGateExpanded, setLlmGateExpanded] = useState(false)
  const [judgeModel, setJudgeModel] = useState("gpt-4o-mini")
  const [minDifficultyScore, setMinDifficultyScore] = useState(3)
  const [minRealismScore, setMinRealismScore] = useState(3)
  
  // Target and schedule
  const [targetDataset, setTargetDataset] = useState("twitter-eval-dataset")
  const [versionPolicy, setVersionPolicy] = useState("new-version")
  const [refreshSchedule, setRefreshSchedule] = useState("weekly")
  const [timeZone, setTimeZone] = useState("UTC")
  const [autoTriggerEval, setAutoTriggerEval] = useState(true)
  const [selectedTestSuite, setSelectedTestSuite] = useState("twitter-support-quality")
  
  // Compliance
  const [piiRedaction, setPiiRedaction] = useState(false)
  const [restrictedContent, setRestrictedContent] = useState(false)
  
  // Danger zone
  const [showDangerZone, setShowDangerZone] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Calculate funnel numbers
  const rawTraces = 12400
  const afterQuality = ruleBasedEnabled ? Math.round(rawTraces * 0.8) : rawTraces
  const afterDedup = semanticDedupEnabled ? Math.round(afterQuality * 0.2) : afterQuality
  const afterLlm = llmGateEnabled ? Math.round(afterDedup * 0.4) : afterDedup
  
  const handleChange = () => {
    setHasChanges(true)
  }

  const handleSave = () => {
    setHasChanges(false)
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-auto">
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            {!isEmbedded && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span>Data</span>
                <ChevronRight className="w-4 h-4" />
                <span>Pipelines</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">twitter-support-agent</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <h1 className={`font-semibold text-foreground ${isEmbedded ? 'text-lg' : 'text-2xl'}`}>
                {isEmbedded ? 'twitter-support-agent pipeline' : 'Trace-to-dataset pipeline'}
              </h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-muted-foreground' : 'bg-success'}`} />
                <span className={`text-sm ${isPaused ? 'text-muted-foreground' : 'text-success'}`}>
                  {isPaused ? 'Paused' : 'Active'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size={isEmbedded ? "sm" : "default"}
              onClick={() => {
                setIsPaused(!isPaused)
                handleChange()
              }}
            >
              {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPaused ? 'Resume pipeline' : 'Pause pipeline'}
            </Button>
            <Button variant="outline" size={isEmbedded ? "sm" : "default"} className="border-primary text-primary hover:bg-primary/10">
              <Play className="w-4 h-4 mr-2" />
              Run now
            </Button>
            <Button 
              size={isEmbedded ? "sm" : "default"}
              className="bg-primary hover:bg-primary/90" 
              disabled={!hasChanges}
              onClick={handleSave}
            >
              Save changes
            </Button>
          </div>
        </div>

        {/* Section 1 - Source Agent */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Source agent</h2>
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <a href="#" className="text-primary hover:underline font-medium">twitter-support-agent</a>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>Running - v21</span>
                    <span>~2,400 traces/day</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm text-success">Tracing active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 - Filter Stages */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Filter stages</h2>
          
          {/* Card 1: Rule-based quality filter */}
          <div className={`border rounded-lg overflow-hidden transition-colors ${ruleBasedEnabled ? 'border-l-4 border-l-primary border-y border-r border-border' : 'border-border opacity-60'}`}>
            <div className="p-4 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      setRuleBasedEnabled(!ruleBasedEnabled)
                      handleChange()
                    }}
                    className={`relative w-9 h-5 rounded-full transition-colors mt-0.5 ${ruleBasedEnabled ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${ruleBasedEnabled ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                  <div className="flex-1">
                    <button 
                      onClick={() => setRuleBasedExpanded(!ruleBasedExpanded)}
                      className="flex items-center gap-2 text-left"
                    >
                      {ruleBasedExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Rule-based quality filter</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Remove spam, bots, and low-intent traffic.</p>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">~80% retention</span>
                  <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">seconds</span>
                  <span className="px-2 py-0.5 text-xs bg-success/10 text-success rounded">no cost</span>
                </div>
              </div>
              
              {/* Expanded controls */}
              {ruleBasedExpanded && ruleBasedEnabled && (
                <div className="mt-4 pt-4 border-t border-border space-y-4 ml-12">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Min input length</span>
                      <span className="text-muted-foreground">{minInputLength} chars</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={minInputLength}
                      onChange={(e) => {
                        setMinInputLength(Number(e.target.value))
                        handleChange()
                      }}
                      className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Min output length</span>
                      <span className="text-muted-foreground">{minOutputLength} chars</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={minOutputLength}
                      onChange={(e) => {
                        setMinOutputLength(Number(e.target.value))
                        handleChange()
                      }}
                      className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Max special char ratio</span>
                      <span className="text-muted-foreground">{maxSpecialCharRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={maxSpecialCharRatio}
                      onChange={(e) => {
                        setMaxSpecialCharRatio(Number(e.target.value))
                        handleChange()
                      }}
                      className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Semantic deduplication */}
          <div className={`border rounded-lg overflow-hidden transition-colors ${semanticDedupEnabled ? 'border-l-4 border-l-blue-500 border-y border-r border-border' : 'border-border opacity-60'}`}>
            <div className="p-4 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      setSemanticDedupEnabled(!semanticDedupEnabled)
                      handleChange()
                    }}
                    className={`relative w-9 h-5 rounded-full transition-colors mt-0.5 ${semanticDedupEnabled ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${semanticDedupEnabled ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                  <div className="flex-1">
                    <button 
                      onClick={() => setSemanticDedupExpanded(!semanticDedupExpanded)}
                      className="flex items-center gap-2 text-left"
                    >
                      {semanticDedupExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Semantic deduplication</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Remove near-duplicate traces using embedding similarity and clustering.</p>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">10-50% retention</span>
                  <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">minutes</span>
                  <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500 rounded">~$10/1M traces</span>
                </div>
              </div>
              
              {/* Expanded controls */}
              {semanticDedupExpanded && semanticDedupEnabled && (
                <div className="mt-4 pt-4 border-t border-border space-y-4 ml-12">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Method</label>
                    <select
                      value={dedupMethod}
                      onChange={(e) => {
                        setDedupMethod(e.target.value)
                        handleChange()
                      }}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="minhash">MinHash (lexical)</option>
                      <option value="hdbscan">HDBSCAN (semantic)</option>
                      <option value="both">Both (recommended)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Similarity threshold</span>
                      <span className="text-muted-foreground">{similarityThreshold.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={similarityThreshold * 100}
                      onChange={(e) => {
                        setSimilarityThreshold(Number(e.target.value) / 100)
                        handleChange()
                      }}
                      className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Cluster sample size</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={clusterSampleSize}
                      onChange={(e) => {
                        setClusterSampleSize(Number(e.target.value))
                        handleChange()
                      }}
                      className="w-32 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-xs text-muted-foreground ml-2">per cluster</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: LLM quality gate */}
          <div className={`border rounded-lg overflow-hidden transition-colors ${llmGateEnabled ? 'border-l-4 border-l-amber-500 border-y border-r border-border' : 'border-border opacity-60'}`}>
            <div className="p-4 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      setLlmGateEnabled(!llmGateEnabled)
                      handleChange()
                    }}
                    className={`relative w-9 h-5 rounded-full transition-colors mt-0.5 ${llmGateEnabled ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${llmGateEnabled ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                  <div className="flex-1">
                    <button 
                      onClick={() => setLlmGateExpanded(!llmGateExpanded)}
                      className="flex items-center gap-2 text-left"
                    >
                      {llmGateExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <h3 className="text-sm font-medium text-foreground">LLM quality gate</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Score traces for difficulty, specificity, and realism using an LLM judge.</p>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">30-50% retention</span>
                  <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded">minutes</span>
                  <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500 rounded">variable cost</span>
                </div>
              </div>
              
              {/* Expanded controls */}
              {llmGateExpanded && llmGateEnabled && (
                <div className="mt-4 pt-4 border-t border-border space-y-4 ml-12">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Judge model</label>
                    <select
                      value={judgeModel}
                      onChange={(e) => {
                        setJudgeModel(e.target.value)
                        handleChange()
                      }}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini (recommended)</option>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="custom">Custom model</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Min difficulty score</span>
                      <span className="text-muted-foreground">{minDifficultyScore}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={minDifficultyScore}
                      onChange={(e) => {
                        setMinDifficultyScore(Number(e.target.value))
                        handleChange()
                      }}
                      className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Min realism score</span>
                      <span className="text-muted-foreground">{minRealismScore}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={minRealismScore}
                      onChange={(e) => {
                        setMinRealismScore(Number(e.target.value))
                        handleChange()
                      }}
                      className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3 - Funnel Preview */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Funnel preview</h2>
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xl font-semibold text-foreground">{rawTraces.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">raw traces</div>
                  <div className="text-xs text-muted-foreground mt-0.5">100%</div>
                </div>
              </div>
              
              {ruleBasedEnabled && (
                <>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="text-center">
                    <div className="text-xl font-semibold text-foreground">{afterQuality.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">after quality filter</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{Math.round((afterQuality / rawTraces) * 100)}%</div>
                  </div>
                </>
              )}
              
              {semanticDedupEnabled && (
                <>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="text-center">
                    <div className="text-xl font-semibold text-foreground">{afterDedup.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">after dedup</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{Math.round((afterDedup / rawTraces) * 100)}%</div>
                  </div>
                </>
              )}
              
              {llmGateEnabled && (
                <>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="text-center">
                    <div className="text-xl font-semibold text-success">{afterLlm.toLocaleString()}</div>
                    <div className="text-xs text-success">final</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{((afterLlm / rawTraces) * 100).toFixed(1)}%</div>
                  </div>
                </>
              )}
              
              {!llmGateEnabled && !semanticDedupEnabled && !ruleBasedEnabled && (
                <>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="text-center">
                    <div className="text-xl font-semibold text-success">{rawTraces.toLocaleString()}</div>
                    <div className="text-xs text-success">final</div>
                    <div className="text-xs text-muted-foreground mt-0.5">100%</div>
                  </div>
                </>
              )}
              
              {!llmGateEnabled && (semanticDedupEnabled || ruleBasedEnabled) && (
                <>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="text-center">
                    <div className="text-xl font-semibold text-success">
                      {semanticDedupEnabled ? afterDedup.toLocaleString() : afterQuality.toLocaleString()}
                    </div>
                    <div className="text-xs text-success">final</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {Math.round(((semanticDedupEnabled ? afterDedup : afterQuality) / rawTraces) * 100)}%
                    </div>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Based on the last 7 days of trace volume. Actual results may vary.</p>
          </div>
        </div>

        {/* Section 4 - Target and Schedule */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Target and schedule</h2>
          <div className="p-4 bg-card border border-border rounded-lg space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground">Target dataset</label>
                <select
                  value={targetDataset}
                  onChange={(e) => {
                    setTargetDataset(e.target.value)
                    handleChange()
                  }}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {existingDatasets.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} - {d.version} - {d.items} items
                    </option>
                  ))}
                  <option value="new">+ Create new dataset</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground">Version policy</label>
                <select
                  value={versionPolicy}
                  onChange={(e) => {
                    setVersionPolicy(e.target.value)
                    handleChange()
                  }}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="new-version">Create new version each run</option>
                  <option value="append">Append to latest version</option>
                </select>
              </div>
            </div>
            
            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground">Refresh schedule</label>
                <select
                  value={refreshSchedule}
                  onChange={(e) => {
                    setRefreshSchedule(e.target.value)
                    handleChange()
                  }}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="hourly">Every hour</option>
                  <option value="6hours">Every 6 hours</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground">Time zone</label>
                <select
                  value={timeZone}
                  onChange={(e) => {
                    setTimeZone(e.target.value)
                    handleChange()
                  }}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground">Next run</label>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Sunday, April 6, 2:00 AM {timeZone}
                </div>
              </div>
            </div>
            
            {/* Row 3 */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setAutoTriggerEval(!autoTriggerEval)
                      handleChange()
                    }}
                    className={`relative w-9 h-5 rounded-full transition-colors ${autoTriggerEval ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoTriggerEval ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                  <div>
                    <span className="text-sm text-foreground">Auto-trigger eval</span>
                    <p className="text-xs text-muted-foreground">Automatically run associated test suite when new dataset version is created</p>
                  </div>
                </div>
                {autoTriggerEval && (
                  <select
                    value={selectedTestSuite}
                    onChange={(e) => {
                      setSelectedTestSuite(e.target.value)
                      handleChange()
                    }}
                    className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {testSuites.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 - Compliance */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Compliance</h2>
          <div className="p-4 bg-card border border-border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPiiRedaction(!piiRedaction)
                    handleChange()
                  }}
                  className={`relative w-9 h-5 rounded-full transition-colors ${piiRedaction ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${piiRedaction ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">PII redaction</span>
                    <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500 rounded">longer term</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Redact personal information before adding traces to dataset.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setRestrictedContent(!restrictedContent)
                    handleChange()
                  }}
                  className={`relative w-9 h-5 rounded-full transition-colors ${restrictedContent ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${restrictedContent ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">Restricted content gating</span>
                    <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500 rounded">longer term</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Exclude traces containing restricted content categories.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6 - Run History */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Run history</h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Input</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">After quality</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">After dedup</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">After LLM</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Final</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Version</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {runHistoryData.map((run) => (
                  <tr 
                    key={run.id} 
                    className={`border-b border-border/50 ${run.recent ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-4 py-3 text-foreground">{run.date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{run.input.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{run.quality.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{run.dedup.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{run.llm.toLocaleString()}</td>
                    <td className="px-4 py-3 text-success font-medium">{run.final.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{run.version}</td>
                    <td className="px-4 py-3 text-muted-foreground">{run.duration}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-success">{run.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-secondary/30 border-t border-border">
              <button className="text-sm text-primary hover:underline">
                Showing last 5 runs. View all runs
              </button>
            </div>
          </div>
        </div>

        {/* Section 7 - Danger Zone */}
        <div className="space-y-3">
          <button 
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="flex items-center gap-2 text-lg font-medium text-foreground"
          >
            {showDangerZone ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            Danger zone
          </button>
          
          {showDangerZone && (
            <div className="p-4 bg-card border border-destructive/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Delete pipeline</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will stop the pipeline and remove its configuration. Existing dataset versions will not be deleted.
                  </p>
                </div>
                {!showDeleteConfirm ? (
                  <Button 
                    variant="outline" 
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete pipeline
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      onClick={() => {
                        onClose?.()
                      }}
                    >
                      Confirm delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
