import { cn } from "@/lib/utils"
import { LoadingStage } from "../hooks/useReportGenerator"
import { Country } from "../types/report.types"

interface AnalysisLoaderProps {
  stages: LoadingStage[]
  progress: number
  url?: string
  country?: Country
}

export function AnalysisLoader({ stages, progress, url, country }: AnalysisLoaderProps) {
  // Find which phase we are currently in
  const runningStages = stages.filter(s => s.status === 'running')
  const activeStage = runningStages.length > 0 ? runningStages[0] : stages[stages.length - 1]

  const currentPhaseId = activeStage?.phase || 'Phase 1'
  const phaseNumber = parseInt(currentPhaseId.replace('Phase ', '')) || 1

  const phaseDetails: Record<string, string> = {
    'Phase 1': 'Site Crawl',
    'Phase 2': 'Real Google Search',
    'Phase 3': 'AI Engine Visibility',
    'Phase 4': 'Deep Analysis'
  }

  const groupedPhases = [
    { id: 'Phase 1', name: 'Site Crawl' },
    { id: 'Phase 2', name: 'Real Google Search' },
    { id: 'Phase 3', name: 'AI Engine Visibility' },
    { id: 'Phase 4', name: 'Deep Analysis' }
  ]

  return (
    <div className="w-full max-w-3xl mx-auto p-8 rounded-2xl bg-[#0D1117] border border-white/[0.06] shadow-2xl animate-fade-in my-12 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[200px] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none -mt-20"></div>

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* URL and Country Context */}
        {url && country && (
          <div className="flex items-center gap-2 mb-8 bg-white/[0.03] px-4 py-2 rounded-full border border-white/[0.05]">
            <span className="text-zinc-400 text-sm">Analyzing</span>
            <span className="text-white font-medium text-sm font-dm">{new URL(url).hostname || url}</span>
            <span className="text-zinc-600 text-sm mx-1">in</span>
            <span className="text-xl leading-none">{country.flag}</span>
            <span className="text-white text-sm font-medium">{country.name}</span>
          </div>
        )}

        {/* Big Progress Bar */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Overall Progress</span>
            <span className="text-indigo-400 font-mono text-sm">{progress}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 relative overflow-hidden">
             <div 
               className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden" 
               style={{ width: `${progress}%` }}
             >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
             </div>
          </div>
        </div>

        {/* Current Active Group Header */}
        <div className="w-full self-start mb-4 border-l-2 border-indigo-500 pl-4 py-1">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
            {currentPhaseId} of 4 — {phaseDetails[currentPhaseId]}
          </h3>
          {/* Active Stages running right now */}
          <div className="space-y-3 mt-3">
            {runningStages.length === 0 && progress === 100 && (
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✨</span>
                <div>
                  <div className="text-white font-medium text-sm">Analysis Complete</div>
                  <div className="text-zinc-500 text-xs">Report is ready.</div>
                </div>
              </div>
            )}
            {runningStages.map((s, i) => (
              <div key={i} className="flex items-start gap-3 animate-fade-in">
                <span className="text-xl mt-0.5">{s.icon || '🔄'}</span>
                <div>
                  <div className="text-indigo-100 font-medium text-sm font-dm">{s.label}</div>
                  <div className={cn(
                    "text-xs mt-0.5",
                    s.id === 'llm_gemini' ? "text-zinc-400 font-mono" : "text-zinc-500"
                  )}>
                    {s.sublabel || s.subStages?.[0] || 'Processing data...'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Phases List Card */}
        <div className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 mt-4 space-y-3">
          {groupedPhases.map((phase) => {
            const phaseNum = parseInt(phase.id.replace('Phase ', ''))
            let statusIcon = '⏳'
            let statusText = 'Pending'
            let textColor = 'text-zinc-600'
            let bgColor = 'bg-white/[0.02]'

            if (phaseNum < phaseNumber || (progress === 100)) {
              statusIcon = '✅'
              statusText = 'Complete'
              textColor = 'text-emerald-500'
              bgColor = 'bg-emerald-500/10'
            } else if (phaseNum === phaseNumber) {
              statusIcon = '🔄'
              statusText = 'Running...'
              textColor = 'text-indigo-400'
              bgColor = 'bg-indigo-500/10'
            }

            return (
              <div key={phase.id} className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center gap-3">
                  <span className={cn("inline-flex w-6 h-6 items-center justify-center rounded-full text-xs animate-in zoom-in", bgColor)}>{statusIcon}</span>
                  <span className={cn("font-medium", phaseNum < phaseNumber || progress === 100 ? "text-zinc-400" : phaseNum === phaseNumber ? "text-white" : "text-zinc-600")}>
                    {phase.id} — {phase.name}
                  </span>
                </div>
                <span className={cn("text-xs font-mono", textColor)}>{statusText}</span>
              </div>
            )
          })}
        </div>

        {/* AI Branding Footnote */}
        <div className="w-full mt-6 pt-6 border-t border-white/[0.04] flex items-center justify-center gap-4">
          <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Powered by</span>
          <div className="flex gap-2">
            <span className="px-2.5 py-1 rounded text-[10px] bg-blue-950/40 text-blue-400 border border-blue-900/50 font-mono tracking-widest leading-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              GEMINI
            </span>
            <span className="px-2.5 py-1 rounded text-[10px] bg-amber-950/40 text-amber-400 border border-amber-900/50 font-mono tracking-widest leading-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              CLAUDE
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
