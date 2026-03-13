import { useState } from "react";
import { useTitleGenerator } from "../../hooks/useTitleGenerator";
import { CopyButton } from "../ui/CopyButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, LayoutTemplate, HelpCircle, Loader2 } from "lucide-react";
import { CTABanner } from "../CTABanner";

const CONTENT_TYPES = [
  "Tutorial", "Guide", "Listicle", "Comparison", 
  "Review", "Case Study", "Checklist", "eCommerce", "Blog"
];

export function TitleFormulaGenerator() {
  const { results, isGenerating, generate } = useTitleGenerator();
  
  // Form State
  const [keyword, setKeyword] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [audience, setAudience] = useState("");
  const [number, setNumber] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  // Modal State
  const [previewTitle, setPreviewTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    
    generate({
      focusKeyword: keyword,
      contentTypes: selectedTypes,
      audience,
      number,
      year
    });
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const openPreview = (title: string) => {
    setPreviewTitle(title);
    setIsPreviewOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* LEFT COLUMN - INPUT PANEL */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] z-0 pointer-events-none"></div>
          
          <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
            <div>
              <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">
                Focus Keyword <span className="text-rose-500">*</span>
              </Label>
              <Input 
                placeholder="e.g. WordPress SEO" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all px-3 py-2"
                required
              />
            </div>

            <div>
              <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2 block">
                <LayoutTemplate className="w-4 h-4 text-indigo-400" />
                Content Types
              </Label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {CONTENT_TYPES.map(type => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeToggle(type)}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors border ${
                        isSelected 
                          ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" 
                          : "bg-white/[0.03] text-zinc-400 border-white/[0.05] hover:bg-white/[0.06] hover:text-zinc-300"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <Label className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold">
                Advanced Modifiers (Optional)
              </Label>
              
              <div>
                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Target Audience</Label>
                <Input 
                  placeholder="e.g. beginners, agency owners" 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all h-9 text-sm px-3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Number</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 7" 
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all h-9 text-sm px-3"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Year</Label>
                  <Input 
                    placeholder="e.g. 2026" 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all h-9 text-sm px-3"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6 flex items-center justify-center rounded-lg transition-all duration-200 mt-6 text-base shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-[1px]"
              disabled={!keyword || isGenerating}
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Ideas...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Generate 15 Titles</>
              )}
            </Button>
            
            <p className="text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5 mt-2 font-mono">
              <HelpCircle className="w-3 h-3" />
              Uses proven frameworks to boost CTR
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN - RESULTS PANEL */}
      <div className="lg:col-span-8">
        {!results.length && !isGenerating ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01] text-center p-8">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-indigo-400 opacity-80" />
            </div>
            <h3 className="text-white font-bold mb-2 font-syne text-xl">Formulas Waiting</h3>
            <p className="text-zinc-500 text-sm max-w-sm">
              Enter a focus keyword on the left to generate scientifically proven title formulas tailored to your audience.
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-white flex items-center font-syne">
                <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-sm mr-3 font-mono">
                  {results.length}
                </span>
                Title Ideas for <span className="text-indigo-400 ml-2">"{keyword}"</span>
              </h3>
              
              <div className="flex gap-2 text-[11px] font-bold uppercase tracking-widest font-mono">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 
                  Perfect Length
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 rounded-full text-rose-400 border border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 
                  Too Long
                </div>
              </div>
            </div>

            <div className="columns-1 md:columns-2 gap-4 space-y-4">
              {results.map((title, idx) => {
                const isOptimal = title.charCount <= 60;
                
                return (
                  <div 
                    key={idx} 
                    className="group bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/50 hover:bg-white/[0.04] rounded-xl p-5 shadow-sm transition-all break-inside-avoid"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 bg-white/5 px-2 py-1 rounded">
                          {title.category}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
                          isOptimal 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {title.charCount} chars {isOptimal ? "✓" : ""}
                        </span>
                      </div>
                      
                      <p className="text-white font-semibold text-[17px] leading-snug mb-5 group-hover:text-indigo-50 transition-colors font-syne tracking-tight">
                        {title.text}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                      <div className="flex items-center gap-3">
                        <CopyButton text={title.text} />
                        <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">
                          {title.powerWords.length > 0 && (
                            <span className="text-indigo-400">⚡ {title.powerWords[0]}</span>
                          )}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-zinc-400 hover:text-white hover:bg-white/10 text-xs px-3 h-8"
                        onClick={() => openPreview(title.text)}
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <CTABanner variant="inline" tab="titles" />
          </div>
        )}
      </div>

      {/* SERP Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-[#0A0D14] border-white/10 sm:max-w-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-white font-syne text-xl">Google SERP Preview</DialogTitle>
            <DialogDescription className="text-zinc-500">
              This is roughly how your title will appear in search results.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-[#1F1F1F] rounded-lg p-5 font-sans mb-4 shadow-sm border border-[#303134]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-[#303134] rounded-full flex items-center justify-center text-xs font-bold text-slate-300">W</div>
              <div className="flex flex-col">
                <span className="text-[13px] text-[#dadce0] leading-tight">Your Website Name</span>
                <span className="text-[12px] text-[#8ab4f8] leading-tight flex items-center gap-1">
                  https://yoursite.com/your-url-slug 
                </span>
              </div>
            </div>
            
            <h3 className="text-[#8ab4f8] text-[20px] leading-[1.3] truncate cursor-pointer hover:underline font-normal mb-1 pb-1 pt-1">
              {previewTitle.length > 60 ? previewTitle.substring(0, 58) + "..." : previewTitle}
            </h3>
            
            <p className="text-[#bdc1c6] text-[14px] leading-[1.58]">
              This is a simulated meta description. You can set a custom description for your page to help convince users to click your result.
            </p>
          </div>
          
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-4">
            <h4 className="text-indigo-400 font-semibold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Meta Generation
            </h4>
            <p className="text-zinc-400 text-sm mb-4">
              Want perfectly optimized meta descriptions generated automatically for every post based on the content?
            </p>
            <Button className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors" size="sm">
              Get SEO Copilot Plugin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
