import { GoogleRankingsReport } from "../../types/report.types"
import { Trophy, Globe2, AlertCircle, ArrowUpRight, Minus, Search } from "lucide-react"

interface GoogleRankingsSectionProps {
  report: GoogleRankingsReport
}

export function GoogleRankingsSection({ report }: GoogleRankingsSectionProps) {
  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-grow space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-dm font-semibold uppercase tracking-widest mb-3">
              <Globe2 className="w-3.5 h-3.5" />
              Phase 2 Analysis
            </div>
            <h2 className="text-3xl font-syne font-bold text-white mb-2 flex items-center gap-3">
              Google Rankings Estimate 
              <span className="text-3xl" title={report.country}>{report.countryFlag}</span>
            </h2>
            <p className="text-zinc-400 font-dm max-w-2xl leading-relaxed">
              Based on deep algorithmic analysis of your domain authority, content structure, and industry, we've simulated your likely ranking positions across Google {report.country}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {/* Page 1 Rankings */}
            <div className="bg-white/[0.02] border border-emerald-900/30 rounded-xl p-4 flex flex-col items-center text-center">
              <Trophy className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold text-white font-mono">{report.rankingKeywords}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Page 1 Rankings</div>
            </div>

            {/* Average Position */}
            <div className="bg-white/[0.02] border border-blue-900/30 rounded-xl p-4 flex flex-col items-center text-center">
              <Search className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white font-mono">{report.averagePosition ? `#${report.averagePosition}` : 'N/A'}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Average Position</div>
            </div>

            {/* Opportunities */}
            <div className="bg-white/[0.02] border border-amber-900/30 rounded-xl p-4 flex flex-col items-center text-center">
              <ArrowUpRight className="w-6 h-6 text-amber-400 mb-2" />
              <div className="text-2xl font-bold text-white font-mono">{report.topOpportunities?.length || 0}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Quick Win Keywords</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start gap-3 text-sm">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-amber-200/80">
          <strong>{report.simulationDisclaimer || "Simulated Data:"}</strong> These rankings are algorithmically estimated using AI. For live, real-time tracking data straight from Google Search Console, install the SEO Copilot WordPress plugin.
        </div>
      </div>

      {/* Keyword Matrix */}
      <div className="bg-[#0D1117] border border-white/[0.06] rounded-2xl overflow-hidden mt-8">
        <div className="p-5 border-b border-white/[0.06] bg-white/[0.01]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Target Keywords Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Keyword</th>
                <th className="px-6 py-4 text-xs font-semibold text-emerald-400 uppercase tracking-wider text-center">Estimated Position</th>
                <th className="px-6 py-4 text-xs font-semibold text-blue-400 uppercase tracking-wider text-center">SERP Features</th>
                <th className="px-6 py-4 text-xs font-semibold text-amber-400 uppercase tracking-wider text-right">Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {report.keywords.map((kw, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{kw.keyword}</div>
                    <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                      {report.countryFlag} Google {report.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {kw.estimatedPosition ? (
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded bg-white/5 border border-white/10 font-mono text-emerald-400">
                        #{kw.estimatedPosition}
                      </div>
                    ) : (
                      <div className="text-zinc-500 font-mono text-sm">
                        {kw.positionLabel || '>100'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-xs">
                    <div className="flex items-center justify-center gap-2">
                      {kw.hasFeaturedSnippet && (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">Snippet</span>
                      )}
                      {kw.hasPeopleAlsoAsk && (
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">PAA</span>
                      )}
                      {!kw.hasFeaturedSnippet && !kw.hasPeopleAlsoAsk && (
                        <Minus className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      kw.opportunity === 'high' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      kw.opportunity === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                    }`}>
                      {kw.opportunity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {report.keywords.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 text-sm">
                    No keywords analyzed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
