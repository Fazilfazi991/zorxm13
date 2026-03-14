import { useState } from "react";
import { FullSEOReport, SEOIssue, SEOCategory } from "../types/report.types";
import { ScoreRing } from "./ui/ScoreRing";
import { CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Search, LayoutTemplate, MessageSquare, BookOpen, GraduationCap, Zap, Copy, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./ui/CopyButton";
import { Button } from "@/components/ui/button";
import { LLMVisibilitySection } from "./report/LLMVisibilitySection";
import { GoogleRankingsSection } from "./report/GoogleRankingsSection";

interface FullReportDisplayProps {
  report: FullSEOReport;
}

type TabType = 'llm' | 'rankings' | 'overview' | 'issues' | 'aeo' | 'eeat' | 'topical' | 'readability' | 'schema';

export function FullReportDisplay({ report }: FullReportDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>('llm');

  const TABS: { id: TabType, label: React.ReactNode, icon: React.ReactNode }[] = [
    { id: 'llm', label: <span className="flex items-center gap-2">LLM Visibility <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono tracking-widest leading-none">NEW</span></span>, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'rankings', label: 'Google Rankings', icon: <LineChart className="w-4 h-4" /> },
    { id: 'overview', label: 'Core SEO Overview', icon: <Search className="w-4 h-4" /> },
    { id: 'issues', label: 'All Issues', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'aeo', label: 'AEO', icon: <Zap className="w-4 h-4" /> },
    { id: 'eeat', label: 'E-E-A-T', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'topical', label: 'Topical Auth', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'readability', label: 'Readability', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'schema', label: 'Schema', icon: <Copy className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 animate-fade-in w-full">
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all",
              activeTab === tab.id 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'llm' && report.llmVisibilityReport && <LLMVisibilitySection report={report.llmVisibilityReport} />}
        {activeTab === 'rankings' && report.googleRankings && <GoogleRankingsSection report={report.googleRankings} />}
        {activeTab === 'overview' && <OverviewTab report={report} />}
        {activeTab === 'issues' && <IssuesTab report={report} />}
        {activeTab === 'aeo' && <AEOTab report={report} />}
        {activeTab === 'eeat' && <EEATTab report={report} />}
        {activeTab === 'topical' && <TopicalTab report={report} />}
        {activeTab === 'readability' && <ReadabilityTab report={report} />}
        {activeTab === 'schema' && <SchemaTab report={report} />}
      </div>

      {/* Dynamic CTA Strip based on issues found */}
      <div className="mt-16 bg-gradient-to-br from-indigo-900/40 to-[#080B14] border border-indigo-500/30 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -mt-[250px] -mr-[250px]"></div>
         
         <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-syne">
              SEO Copilot Would Fix {report.allIssues.filter(i => i.severity === 'critical' || i.severity === 'error').length} of These Issues Automatically
            </h2>
            <p className="text-indigo-200/80 mb-8 font-dm text-lg leading-relaxed">
              Every time you publish a post, SEO Copilot checks all {report.allIssues.length} issues found in this report — and fixes most of them automatically using AI.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-10 bg-black/20 p-6 rounded-xl border border-white/5">
              {report.aeoAnalysis.issues.length > 0 && <div className="text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Auto-optimize for AEO and AI Overviews</div>}
              {report.eeatAnalysis.score < 70 && <div className="text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Build E-E-A-T signals automatically</div>}
              {report.llmVisibility.score < 60 && <div className="text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Improve LLM visibility with every post</div>}
              {report.schemaAnalysis.missing.length > 0 && <div className="text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Auto-generate missing schema markup</div>}
              <div className="text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Rank tracking, content decay alerts, and more</div>
            </div>

            <Button className="bg-white text-indigo-900 hover:bg-zinc-100 font-bold px-8 py-6 rounded-xl text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-1">
              Get SEO Copilot Plugin — Free to Install →
            </Button>
         </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------
// Sub-Tab Components
// ---------------------------------------------------------------------------------

function TabHeader({ title, aiProvider }: { title: string, aiProvider: 'gemini' | 'claude' | 'both' }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
      <h2 className="text-xl font-bold text-white font-syne">
        {title}
      </h2>
      <div className="flex gap-2">
        {(aiProvider === 'gemini' || aiProvider === 'both') && (
          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-950 text-blue-400 border-blue-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Analyzed by Gemini AI
          </span>
        )}
        {(aiProvider === 'claude' || aiProvider === 'both') && (
          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-amber-950 text-amber-400 border-amber-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Analyzed by Claude AI
          </span>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ report }: { report: FullSEOReport }) {
  const scores = [
    { label: 'Overall', val: report.overallScore },
    { label: 'On-Page', val: report.onPageScore },
    { label: 'Technical', val: report.technicalScore },
    { label: 'Content', val: report.contentScore },
    { label: 'Links', val: report.linksScore },
    { label: 'AEO', val: report.aeoScore },
    { label: 'E-E-A-T', val: report.eeatScore },
    { label: 'LLM', val: report.llmScore },
  ];

  return (
    <div className="space-y-6">
      <TabHeader title="Executive Overview" aiProvider="claude" />
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {scores.map(s => (
           <div key={s.label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
             <span className="text-xs uppercase font-bold tracking-widest text-zinc-500 mb-2">{s.label}</span>
             <span className={cn(
               "text-3xl font-bold font-mono tracking-tighter",
               s.val >= 80 ? "text-emerald-400" : s.val >= 60 ? "text-amber-400" : "text-rose-400"
             )}>{s.val}</span>
             <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                <div className={cn("h-full", s.val >= 80 ? "bg-emerald-500" : s.val >= 60 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${s.val}%` }}></div>
             </div>
           </div>
         ))}
      </div>

      {/* Executive Summary & Traffic Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Executive Summary */}
         <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-syne">
              <ClipboardIcon className="w-5 h-5 text-indigo-400" /> Executive Summary
            </h3>
            <p className="text-zinc-300 text-[15px] leading-relaxed font-dm whitespace-pre-line">
              {report.executiveSummary}
            </p>
         </div>

         {/* Traffic Impact */}
         <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-syne">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Traffic Impact
            </h3>
            
            <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg border border-white/5 mb-6">
              <div className="text-center flex-1 border-r border-white/10 pr-4">
                 <span className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">CURRENT ({report.trafficEstimate.currentRankingPosition})</span>
                 <span className="block text-2xl font-bold text-white font-mono">{report.trafficEstimate.currentMonthlyVisitors.toLocaleString()}/mo</span>
              </div>
              <div className="px-4 text-indigo-400 font-bold">→</div>
              <div className="text-center flex-1 pl-4">
                 <span className="block text-xs uppercase tracking-widest text-emerald-500/70 font-bold mb-1">POTENTIAL ({report.trafficEstimate.potentialRankingPosition})</span>
                 <span className="block text-2xl font-bold text-emerald-400 font-mono">{report.trafficEstimate.potentialMonthlyVisitors.toLocaleString()}/mo</span>
              </div>
            </div>

            <div className="space-y-3 font-dm">
              <p className="text-amber-200/90 text-[15px] p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                You're leaving <strong className="text-amber-400 font-mono">{report.trafficEstimate.lostVisitorsPerMonth.toLocaleString()} visitors/month</strong> on the table. That's {report.trafficEstimate.lostVisitorsPerYear.toLocaleString()} visitors per year.
              </p>
              <p className="text-emerald-200/90 text-[15px] p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                Estimated revenue impact: <strong className="text-emerald-400">{report.trafficEstimate.revenueImpact}</strong>
              </p>
            </div>
         </div>
      </div>

      {/* Priorities and Competitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Top Priorities & Quick Wins */}
         <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2 font-syne">
                  <TargetIcon className="w-4 h-4" /> Top 5 Priorities
                </h4>
                <ol className="space-y-3 list-decimal list-inside text-zinc-300 text-[14px] leading-relaxed font-dm">
                  {report.topPriorities.map((fp, i) => (
                    <li key={i}>{fp}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2 font-syne">
                  <Zap className="w-4 h-4" /> Quick Wins
                </h4>
                <ul className="space-y-3 text-[14px] leading-relaxed font-dm">
                  {report.quickWins.map(qw => (
                    <li key={qw.id} className="flex items-start gap-2 text-zinc-300">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                       <div>
                         <span className="block">{qw.title}</span>
                         <span className="text-[11px] text-zinc-500 font-mono">Impact: {qw.impact} | Time: {qw.timeToFix}</span>
                       </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
         </div>

         {/* Competitor Insights */}
         <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-syne">
              <TrophyIcon className="w-5 h-5 text-amber-400" /> Competitor Insights
            </h3>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">What Top Rankers Have</h5>
                <ul className="space-y-1.5">
                  {report.competitorInsights.whatTopRankersHave.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-emerald-200/80 font-dm">
                      <span className="text-emerald-500 shrink-0 mt-0.5">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 mt-4">What You're Missing</h5>
                <ul className="space-y-1.5">
                  {report.competitorInsights.whatYoureMissing.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-rose-200/80 font-dm">
                      <span className="text-rose-500 shrink-0 mt-0.5">✗</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function IssuesTab({ report }: { report: FullSEOReport }) {
  // Re-use styled Issue Card logic from SEORulesChecker but adapt to SEOIssue type.
  return (
    <div className="space-y-4">
       <TabHeader title="All SEO Issues" aiProvider="both" />
       <div className="flex flex-wrap gap-2 text-[13px] font-mono mb-4 text-zinc-400">
         <span className="bg-white/5 px-2 py-1 rounded">All ({report.allIssues.length})</span>
         <span className="bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20">Critical ({report.allIssues.filter(i => i.severity === 'critical').length})</span>
         <span className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded border border-orange-500/20">Errors ({report.allIssues.filter(i => i.severity === 'error').length})</span>
         <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">Warnings ({report.allIssues.filter(i => i.severity === 'warning').length})</span>
       </div>

       {report.allIssues.map(issue => <IssueCard key={issue.id} issue={issue} analyzedUrl={report.analyzedUrl} /> )}
    </div>
  );
}

// Additional Placeholder sub-components for the specialized tabs (AEO, EEAT, LLM, etc.)
// They map the structured data to a grid/list UI similar to Overview

function AEOTab({ report }: { report: FullSEOReport }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
      <TabHeader title="Answer Engine Optimization" aiProvider="gemini" />
      <div className="text-2xl font-bold text-emerald-400 font-mono mb-6 mt-[-10px]">Score: {report.aeoAnalysis.score}/100</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
         <div className="bg-black/20 p-5 rounded-lg border border-white/5">
           <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Readiness Checklist</h4>
           <ul className="space-y-2 text-sm text-zinc-300 font-dm">
             <li className="flex gap-2"><Indicator ready={report.aeoAnalysis.isFeaturedSnippetReady} /> Featured Snippet Ready</li>
             <li className="flex gap-2"><Indicator ready={report.aeoAnalysis.isPeopleAlsoAskReady} /> People Also Ask Ready</li>
             <li className="flex gap-2"><Indicator ready={report.aeoAnalysis.isVoiceSearchReady} /> Voice Search Ready</li>
             <li className="flex gap-2"><Indicator ready={report.aeoAnalysis.isAIOverviewReady} /> AI Overview Ready</li>
           </ul>
         </div>

         <div className="bg-black/20 p-5 rounded-lg border border-white/5">
           <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">AEO Tips & Schema</h4>
           <ul className="space-y-2 text-sm text-zinc-300 font-dm list-disc list-inside mb-4">
             {report.aeoAnalysis.tips.map((t, i) => <li key={i}>{t}</li>)}
           </ul>
           <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-3 rounded">
             <div className="flex gap-2 mb-1"><Indicator ready={!report.aeoAnalysis.speakableSchemaNeeded} /> Speakable Schema</div>
             <div className="flex gap-2"><Indicator ready={!report.aeoAnalysis.faqSchemaNeeded} /> FAQ Schema</div>
           </div>
         </div>
      </div>
      
      <h4 className="font-bold text-white mb-3">Found AEO Issues:</h4>
      <div className="space-y-3">
        {report.aeoAnalysis.issues.map(issue => <IssueCard key={issue.id} issue={issue} analyzedUrl={report.analyzedUrl} />)}
      </div>
    </div>
  );
}

function EEATTab({ report }: { report: FullSEOReport }) {
  return (
     <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
       <TabHeader title="E-E-A-T Analysis" aiProvider="claude" />
       <div className="text-2xl font-bold text-emerald-400 font-mono mb-6 mt-[-10px]">Score: {report.eeatAnalysis.score}/100</div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ScoreQuad name="Experience" val={report.eeatAnalysis.experienceScore} />
          <ScoreQuad name="Expertise" val={report.eeatAnalysis.expertiseScore} />
          <ScoreQuad name="Authority" val={report.eeatAnalysis.authorityScore} />
          <ScoreQuad name="Trust" val={report.eeatAnalysis.trustScore} />
       </div>

       <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-5 mb-8">
         <h4 className="font-bold text-indigo-300 mb-2">Google Quality Rater Recommendations:</h4>
         <ul className="list-disc list-inside text-indigo-200/80 text-sm font-dm space-y-1.5">
           {report.eeatAnalysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
         </ul>
       </div>

       <h4 className="font-bold text-white mb-3">E-E-A-T Issues:</h4>
       <div className="space-y-3">
        {report.eeatAnalysis.issues.map(issue => <IssueCard key={issue.id} issue={issue} analyzedUrl={report.analyzedUrl} />)}
       </div>
     </div>
  );
}


function TopicalTab({ report }: { report: FullSEOReport }) {
   return (
     <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5">
       <TabHeader title="Topical Authority" aiProvider="gemini" />
       <div className="text-center text-zinc-500 mt-4">Topical Tab Layout Rendered</div>
     </div>
   );
}
function ReadabilityTab({ report }: { report: FullSEOReport }) {
   return (
     <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5">
       <TabHeader title="Readability" aiProvider="gemini" />
       <div className="text-center text-zinc-500 mt-4">Readability Tab Layout Rendered</div>
     </div>
   );
}
function SchemaTab({ report }: { report: FullSEOReport }) {
   return (
     <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5">
       <TabHeader title="Schema" aiProvider="gemini" />
       <div className="text-center text-zinc-500 mt-4">Schema Tab Layout Rendered</div>
     </div>
   );
}

// ---------------------------------------------------------------------------------
// Shared Sub-components
// ---------------------------------------------------------------------------------

function IssueCard({ issue, analyzedUrl }: { issue: SEOIssue, analyzedUrl?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  let leftBorder = "border-l-indigo-500";
  let dotColor = "bg-indigo-500";
  
  if (issue.severity === "critical") {
    leftBorder = "border-l-rose-500";
    dotColor = "bg-rose-500 animate-[pulse_2s_ease-in-out_infinite]";
  } else if (issue.severity === "error") {
    leftBorder = "border-l-orange-500";
    dotColor = "bg-orange-500";
  } else if (issue.severity === "warning") {
    leftBorder = "border-l-amber-500";
    dotColor = "bg-amber-500";
  } else if (issue.severity === "info") {
    leftBorder = "border-l-blue-500";
    dotColor = "bg-blue-500";
  }

  return (
    <div className={cn(
        "border rounded-lg overflow-hidden transition-all group",
        isExpanded ? "bg-white/[0.04] shadow-md relative z-10" : "bg-white/[0.02] hover:bg-white/[0.04]",
        "border-white/[0.04]", "border-l-[4px]", leftBorder
      )}
    >
      <div className={cn("p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none", isExpanded && "border-b border-white/[0.04]")} onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start gap-3">
          <div className="mt-1.5 flex-shrink-0">
             <span className={cn("w-2 h-2 rounded-full block", dotColor)}></span>
          </div>
          <div>
            <h5 className="text-white font-semibold text-base leading-tight group-hover:text-indigo-300 transition-colors uppercase tracking-tight mb-1 flex items-center gap-2">
               {(issue.severity || '').toUpperCase()} <span className="text-[10px] text-zinc-500 font-mono font-normal tracking-wide bg-black/30 px-2 py-0.5 rounded">Fix: {issue.timeToFix}</span>
            </h5>
            <p className="text-zinc-300 font-dm text-[15px]">{issue.title}</p>
            {!isExpanded && <p className="text-zinc-500 text-[13px] mt-1 font-dm truncate max-w-[400px]">{issue.summary}</p>}
          </div>
        </div>
        <div className="w-6 flex justify-end shrink-0">
          {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 bg-black/20 animate-in slide-in-from-top-2 duration-200">
          {/* Page Context Banner */}
          <div className="bg-indigo-950/40 border border-indigo-800/30 rounded-lg p-3 mb-6 flex items-center gap-3">
            <span className="text-indigo-400 text-lg">🔗</span>
            <div>
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Issue found on</div>
              <div className="text-sm text-white font-medium truncate max-w-md">{analyzedUrl || 'Your Content'}</div>
            </div>
          </div>

          <p className="text-zinc-200 text-[14px] leading-relaxed mb-6 font-dm bg-indigo-500/5 p-4 rounded-lg border border-indigo-500/10">
            <span className="block text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-2">WHY IT MATTERS</span>
            {issue.explanation}
          </p>
          
          <div className="mb-6">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">How to Fix This on Your Site</div>
            <ul className="space-y-3">
              {issue.fixSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-zinc-300 text-[14px] leading-relaxed font-dm pt-0.5">{step}</p>
                </li>
              ))}
            </ul>
          </div>
          
          {(issue.exampleBad || issue.exampleGood) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/5">
              {issue.exampleBad && (
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block mb-2">❌ BAD EXAMPLE</span>
                  <p className="text-[13px] text-rose-200/80 font-mono whitespace-pre-wrap">{issue.exampleBad}</p>
                </div>
              )}
              {issue.exampleGood && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-2">✅ GOOD EXAMPLE</span>
                  <p className="text-[13px] text-emerald-200/80 font-mono whitespace-pre-wrap">{issue.exampleGood}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-white/5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Impact:</span>
              <span className={cn("text-xs font-bold font-mono", issue.impact === 'high' ? 'text-rose-400' : 'text-amber-400')}>{(issue.impact || '').toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Effort:</span>
              <span className="text-xs font-bold font-mono text-zinc-300">{(issue.effort || '').toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">⏱ Estimated time:</span>
              <span className="text-xs font-bold font-mono text-emerald-400">{issue.timeToFix}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Indicator({ ready }: { ready: boolean }) {
  return ready ? <span className="text-emerald-500 shrink-0">✓</span> : <span className="text-rose-500 shrink-0">✗</span>;
}

function ScoreQuad({ name, val }: { name: string, val: number }) {
  return (
    <div className="bg-black/20 p-4 border border-white/5 rounded-lg text-center flex flex-col items-center justify-center">
       <span className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">{name}</span>
       <span className={cn("block text-2xl font-bold font-mono", val >= 80 ? "text-emerald-400" : val >= 60 ? "text-amber-400" : "text-rose-400")}>{val}/100</span>
    </div>
  )
}

// Icon stubs since standard lucide doesn't have these exact names used
const ClipboardIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
const TargetIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
const TrophyIcon = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
const TrendingUp = ({ className }: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
