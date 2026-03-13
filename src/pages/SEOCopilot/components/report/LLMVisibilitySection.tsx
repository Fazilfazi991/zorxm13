import { LLMVisibilityReport } from "../../types/report.types"
import { ScoreRing } from "../ui/ScoreRing"
import { Sparkles, Bot, MessageSquare, Search, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

interface LLMVisibilitySectionProps {
  report: LLMVisibilityReport
}

export function LLMVisibilitySection({ report }: LLMVisibilitySectionProps) {
  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0">
          <ScoreRing score={report.overallScore} size={160} />
        </div>
        
        <div className="flex-grow space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-dm font-semibold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 3 Analysis
            </div>
            <h2 className="text-3xl font-syne font-bold text-white mb-2">LLM Visibility & Citation Check</h2>
            <p className="text-zinc-400 font-dm max-w-2xl leading-relaxed">
              We simulated queries across the top 3 AI engines to see if <span className="text-white font-medium">{report.domain}</span> is cited as a source or mentioned in AI responses for your target keywords in {report.country}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {/* Gemini */}
            <div className="bg-white/[0.02] border border-blue-900/30 rounded-xl p-4 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full blur-xl"></div>
              <Bot className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white font-mono">{report.geminiScore}%</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Gemini Visibility</div>
            </div>

            {/* ChatGPT */}
            <div className="bg-white/[0.02] border border-emerald-900/30 rounded-xl p-4 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full blur-xl"></div>
              <MessageSquare className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold text-white font-mono">{report.chatgptScore}%</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">ChatGPT Visibility</div>
            </div>

            {/* Perplexity */}
            <div className="bg-white/[0.02] border border-cyan-900/30 rounded-xl p-4 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-bl-full blur-xl"></div>
              <Search className="w-6 h-6 text-cyan-400 mb-2" />
              <div className="text-2xl font-bold text-white font-mono">{report.perplexityScore}%</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Perplexity Visibility</div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Simulation Table */}
      <div className="bg-[#0D1117] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] bg-white/[0.01]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            Keyword Citation Matrix
          </h3>
          <p className="text-sm text-zinc-500 mt-1">Simulated likelihood of your domain being cited in conversational AI responses.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Keyword</th>
                <th className="px-6 py-4 text-xs font-semibold text-blue-400 uppercase tracking-wider text-center">Gemini</th>
                <th className="px-6 py-4 text-xs font-semibold text-emerald-400 uppercase tracking-wider text-center">ChatGPT</th>
                <th className="px-6 py-4 text-xs font-semibold text-cyan-400 uppercase tracking-wider text-center">Perplexity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {report.keywordResults.map((kw, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{kw.keyword}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {kw.gemini.mentioned ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-zinc-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {kw.chatgpt.mentioned ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-zinc-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {kw.perplexity.mentioned ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-zinc-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
              {report.keywordResults.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 text-sm">
                    No keyword simulations completed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitors replacing you */}
      {report.topCompetitorsInLLMs && report.topCompetitorsInLLMs.length > 0 && (
         <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" />
              Who are AI Engines citing instead of you?
            </h3>
            <p className="text-sm text-zinc-400 mb-4">Instead of {report.domain}, the LLMs frequently mentioned these competitors for your target keywords:</p>
            <div className="flex flex-wrap gap-3">
              {report.topCompetitorsInLLMs.map((comp, idx) => (
                <div key={idx} className="bg-black/40 border border-white/5 px-4 py-2 rounded-lg flex items-center gap-3">
                  <span className="text-white font-medium text-sm">{comp.domain}</span>
                  <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">{comp.mentionCount} mentions</span>
                </div>
              ))}
            </div>
         </div>
      )}

      {/* Improvement Strategy */}
      {report.improvementTips && report.improvementTips.length > 0 && (
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-indigo-400 mb-4">How to Improve AI Visibility</h3>
          <ul className="space-y-3">
            {report.improvementTips.map((tip, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                  {i + 1}
                </div>
                <span className="text-zinc-300 text-sm leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}
