import { Sparkles, ArrowRight, ClipboardPaste, Type, FileText, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useReportGenerator } from "../hooks/useReportGenerator";
import { FullSEOReport, Country } from "../types/report.types";
import { CountrySelector } from "./CountrySelector";

interface HeroSectionProps {
  onAnalyzeComplete?: (report: FullSEOReport | null) => void;
  onTabSelect: (tab: "rules" | "titles" | "briefs") => void;
}

export function HeroSection({ onAnalyzeComplete, onTabSelect }: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState<Country | null>(null);
  const { report, isLoading, stages, error, generateReport } = useReportGenerator();

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim() || !country) return;
    
    // Pass both URL and Target Country to the report generator.
    await generateReport({ url, country });
  };

  useEffect(() => {
    if (!isLoading && report) {
      if (onAnalyzeComplete) onAnalyzeComplete(report);
    } else if (isLoading) {
      if (onAnalyzeComplete) onAnalyzeComplete(null);
    }
  }, [isLoading, report, onAnalyzeComplete]);

  const STAGES = [
    "Fetching page...",
    "Running 48 rules...",
    "Generating report..."
  ];
  
  const isAnalyzing = isLoading;
  
  // Use progress from the hook or fallback to stage-based if stages exist
  const analysisStage = stages.findIndex(s => s.status === 'running');
  const displayStage = analysisStage === -1 ? (stages.every(s => s.status === 'complete') ? stages.length - 1 : 0) : analysisStage;

  return (
    <div className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden isolate" style={{ backgroundColor: '#080B14' }}>
      
      {/* Dark modern radial gradient */}
      <div className="absolute inset-x-0 top-[-20%] h-[800px] bg-[radial-gradient(ellipse_at_top_center,rgba(99,102,241,0.15),transparent_70%)] -z-10 pointer-events-none"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] -z-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-8 relative z-10 animate-fade-in">
        
        {/* Main label */}
        <div className="text-center space-y-2 mb-8 mt-[-30px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 
                          rounded-full bg-indigo-950 border 
                          border-indigo-800 text-indigo-400 
                          text-xs font-medium tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full 
                             bg-indigo-400 animate-pulse"/>
            AI-Powered SEO Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white 
                         font-syne leading-tight">
            Analyze Any Website.<br/>
            <span className="text-indigo-400">
              See How AI Ranks You.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto font-dm">
            Enter your URL and target country. We'll find your 
            keywords, check Google rankings, and see if 
            ChatGPT, Gemini & Perplexity mention you.
          </p>
        </div>

        {/* URL + Country Analyzer Input Card */}
        <div className="w-full max-w-3xl mx-auto space-y-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4 shadow-xl">
            {error && !isLoading && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm rounded-lg text-left shadow-lg animate-in slide-in-from-top-2">
                <span className="font-semibold block mb-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Analysis Failed</span>
                {error || "API returned an error. Please check your config."}
              </div>
            )}
            
            {/* URL Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Website URL
              </label>
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-3 
                                bg-white/[0.04] border border-white/[0.08] 
                                rounded-xl px-4 py-3 
                                focus-within:border-indigo-500
                                focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]
                                transition-all">
                  <span className="text-zinc-500 text-lg">🔗</span>
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isAnalyzing}
                    className="flex-1 bg-transparent text-white 
                               placeholder:text-zinc-600 
                               outline-none font-dm w-full"
                  />
                </div>
              </div>
            </div>

            {/* Country Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Target Country
                <span className="ml-2 text-zinc-600 normal-case">
                  (rankings will be checked for this location)
                </span>
              </label>
              <CountrySelector 
                value={country} 
                onChange={setCountry} 
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing || !url.trim() || !country}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-semibold py-4 rounded-xl 
                         transition-all duration-200 
                         hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)]
                         hover:-translate-y-0.5 font-dm
                         flex items-center justify-center gap-2 text-lg mt-2">
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Initializing Scraper...</span>
                </>
              ) : (
                <>
                  <span>Analyze Website</span>
                  <span className="text-indigo-300"><ArrowRight className="w-5 h-5"/></span>
                </>
              )}
            </button>

            {/* What we'll check */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              {[
                { icon: '🔍', label: 'Keyword Discovery' },
                { icon: '📍', label: 'Google Rankings' },
                { icon: '🤖', label: 'LLM Visibility' },
              ].map(item => (
                <div key={item.label}
                     className="flex items-center gap-2 text-xs 
                                text-zinc-400 bg-white/[0.02] 
                                rounded-lg p-2.5 border border-white/[0.04]">
                  <span>{item.icon}</span>
                  <span className="font-dm whitespace-nowrap">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        {/* OR Divider */}
        <div className="flex items-center justify-center gap-4 w-full max-w-md mx-auto my-4 opacity-50">
          <div className="h-px bg-zinc-700 flex-1"></div>
          <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest">or analyze content directly</span>
          <div className="h-px bg-zinc-700 flex-1"></div>
        </div>

        {/* Quick Access Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => onTabSelect("rules")} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-full text-zinc-300 text-sm transition-colors font-dm">
            <ClipboardPaste className="w-4 h-4 text-indigo-400" /> Paste Content
          </button>
          <button onClick={() => onTabSelect("titles")} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-full text-zinc-300 text-sm transition-colors font-dm">
            <Type className="w-4 h-4 text-emerald-400" /> Title Generator
          </button>
          <button onClick={() => onTabSelect("briefs")} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-full text-zinc-300 text-sm transition-colors font-dm">
            <FileText className="w-4 h-4 text-amber-400" /> Content Brief
          </button>
        </div>
        </div>

        {/* Social Proof Strip */}
        <div className="pt-10 mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-500 font-dm border-t border-white/5 w-full max-w-3xl">
          <div className="flex items-center gap-2">
            <div className="flex text-amber-500 text-lg">★★★★★</div>
            <span>"Best free SEO tool I've used"</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-700"></div>
          <div>48 Rules · 50 Formulas · 50 Templates · 0 Cost</div>
        </div>

      </div>
    </div>
  );
}

