import { useState } from "react";
import { useReportGenerator } from "../../hooks/useReportGenerator";
import { AnalysisLoader } from "../AnalysisLoader";
import { FullReportDisplay } from "../FullReportDisplay";
import { ScoreRing } from "../ui/ScoreRing";
import { SeverityBadge } from "../ui/SeverityBadge";
import { ImpactBadge } from "../ui/ImpactBadge";
import { CopyButton } from "../ui/CopyButton";
import { CTABanner } from "../CTABanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Search, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SEORulesChecker() {
  const { report, isLoading, stages, progress, error, generateReport, resetReport } = useReportGenerator();
  
  // UI State
  const [mode, setMode] = useState<"paste" | "quick">("paste");
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});
  const [showPassing, setShowPassing] = useState(false);

  // Form State
  const [focusKeyword, setFocusKeyword] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [content, setContent] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const [contentType, setContentType] = useState("Blog Post");
  const [quickWordCount, setQuickWordCount] = useState("800");

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setExpandedRules({});
    
    // If quick mode, simulate content length by filling with dummy words
    const finalContent = mode === "quick" 
      ? Array(parseInt(quickWordCount) || 0).fill("dummy").join(" ")
      : content;

    generateReport({
      focusKeyword,
      title: postTitle,
      metaDescription: mode === "quick" ? "" : metaDesc,
      content: finalContent,
      urlSlug: mode === "quick" ? "" : urlSlug,
      contentType
    });
  };

  const toggleRule = (ruleId: string) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  const isAnalyzing = isLoading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* LEFT COLUMN - INPUT PANEL */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" />
              Content Analysis
            </h2>
            
            <RadioGroup 
              defaultValue="paste" 
              value={mode}
              onValueChange={(v) => setMode(v as "paste" | "quick")}
              className="flex bg-white/5 rounded-lg p-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paste" id="mode-paste" className="sr-only" />
                <Label 
                  htmlFor="mode-paste"
                  className={cn(
                    "px-4 py-1.5 text-xs font-semibold cursor-pointer transition-all rounded-md tracking-wide",
                    mode === "paste" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  Full Paste
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quick" id="mode-quick" className="sr-only" />
                <Label 
                  htmlFor="mode-quick"
                  className={cn(
                    "px-4 py-1.5 text-xs font-semibold cursor-pointer transition-all rounded-md tracking-wide",
                    mode === "quick" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  Quick Check
                </Label>
              </div>
            </RadioGroup>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-5">
            <div>
              <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">
                Focus Keyword <span className="text-rose-500">*</span>
              </Label>
              <Input 
                placeholder="e.g. SEO tips" 
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all px-3 py-2"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">Post Title</Label>
                <span className={cn(
                  "text-[11px] font-mono",
                  postTitle.length > 0 && postTitle.length <= 60 ? "text-emerald-500" :
                  postTitle.length > 60 ? "text-rose-500" : "text-zinc-600"
                )}>
                  chars: {postTitle.length}/60 {postTitle.length > 0 && postTitle.length <= 60 ? "🟢" : postTitle.length > 60 ? "🔴" : ""}
                </span>
              </div>
              <Input 
                placeholder="Enter your title (H1)" 
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all px-3 py-2"
              />
            </div>

            {mode === "paste" ? (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">Meta Description</Label>
                    <span className={cn(
                      "text-[11px] font-mono",
                      metaDesc.length > 0 && metaDesc.length <= 160 ? "text-emerald-500" :
                      metaDesc.length > 160 ? "text-rose-500" : "text-zinc-600"
                    )}>
                      chars: {metaDesc.length}/160 {metaDesc.length > 0 && metaDesc.length <= 160 ? "🟢" : metaDesc.length > 160 ? "🔴" : ""}
                    </span>
                  </div>
                  <Textarea 
                    placeholder="Brief summary for search results..." 
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm min-h-[80px] transition-all px-3 py-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">Main Content</Label>
                    <span className="text-[11px] font-mono text-zinc-600">
                      words: {content.trim() ? content.trim().split(/\s+/).length : 0}
                    </span>
                  </div>
                  <Textarea 
                    placeholder="Paste your full article text or HTML here..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm min-h-[250px] resize-y scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 transition-all px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">URL Slug</Label>
                    <Input 
                      placeholder="e.g. seo-tips" 
                      value={urlSlug}
                      onChange={(e) => setUrlSlug(e.target.value)}
                      className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all px-3 py-2"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm px-3 py-2 h-[42px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#13102E] border-white/[0.08] text-slate-200">
                        <SelectItem value="Blog Post">Blog Post</SelectItem>
                        <SelectItem value="Product Page">Product Page</SelectItem>
                        <SelectItem value="Landing Page">Landing Page</SelectItem>
                        <SelectItem value="WooCommerce Product">WooCommerce Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Word Count</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 1500" 
                  value={quickWordCount}
                  onChange={(e) => setQuickWordCount(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all px-3 py-2"
                />
              </div>
            )}

            <div className="space-y-4 mt-6">
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6 flex items-center justify-center rounded-lg transition-all duration-200 text-base shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-[1px]"
                disabled={!focusKeyword || isAnalyzing}
              >
                {isAnalyzing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Content...</>
                ) : (
                  <>Analyze Content <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
              {report && !isLoading && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={resetReport}
                  className="w-full border-white/10 text-zinc-300 hover:bg-white/5 py-4 flex items-center justify-center rounded-lg transition-all duration-200"
                >
                  Clear Results & Start Over
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN - RESULTS PANEL */}
      <div className="lg:col-span-7 flex flex-col h-full items-stretch relative">
        {(report || isLoading || error) ? null : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01] text-center p-8 mt-6">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-white font-bold mb-2 font-syne text-lg">Awaiting Content</h3>
            <p className="text-zinc-500 text-sm max-w-sm font-dm leading-relaxed">
              Enter a focus keyword and some content on the left to run 8 specialized SEO audits instantly using Gemini Flash.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="h-full min-h-[400px] flex items-center justify-center border border-white/5 rounded-2xl bg-white/[0.01] mt-6">
             <AnalysisLoader stages={stages} progress={progress} />
          </div>
        )}

        {error && !isLoading && (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-rose-500/20 rounded-2xl bg-rose-500/5 text-center p-8 mt-6">
             <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
             <h3 className="text-white font-bold mb-2 font-syne text-lg">Analysis Failed</h3>
             <p className="text-rose-200/80 text-sm max-w-sm font-dm bg-rose-500/10 p-4 rounded-lg border border-rose-500/20 break-words w-full">
               {error || "Please check your Gemini API key in config/gemini.config.ts. The API returned an error."}
             </p>
             <Button 
               onClick={() => generateReport({
                 focusKeyword,
                 title: postTitle,
                 metaDescription: mode === "quick" ? "" : metaDesc,
                 content: mode === "quick" ? Array(parseInt(quickWordCount) || 0).fill("dummy").join(" ") : content,
                 urlSlug: mode === "quick" ? "" : urlSlug,
                 contentType
               })} 
               className="mt-6 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
             >
               Try Again
             </Button>
          </div>
        )}

        {report && !isLoading && (
          <div className="mt-6">
            <FullReportDisplay report={report} />
          </div>
        )}
      </div>
    </div>
  );
}
