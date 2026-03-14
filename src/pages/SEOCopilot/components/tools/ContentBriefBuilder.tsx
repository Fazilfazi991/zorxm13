import { useState } from "react";
import { useBriefBuilder } from "../../hooks/useBriefBuilder";
import { CopyButton } from "../ui/CopyButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ChevronDown, ChevronUp, Copy, Download, Zap, BookOpen, Clock, Activity, Target, BrainCircuit, LayoutTemplate } from "lucide-react";
import { checkComplexWords } from "../../utils/textAnalyzer";
import wordComplexityData from "../../data/word-complexity-lookup.json";
import { CTABanner } from "../CTABanner";
import { cn } from "@/lib/utils";

const CONTENT_TYPES = [
  "How-To Tutorial", "Ultimate Guide", "Listicle", 
  "Product Review", "Comparison", "Case Study", 
  "Beginner's Guide", "SEO Blog Post", "Checklist", 
  "FAQ Page"
];

const WORD_COUNTS = [
  "500-800", "800-1200", "1200-2000", "2000-3500", "3500+"
];

const GOALS = [
  "Rank on Google", "Drive Conversions", "Build Authority", 
  "Generate Backlinks", "Educate Audience"
];

export function ContentBriefBuilder() {
  const { brief, isBuilding, buildBrief } = useBriefBuilder();
  
  // Form State
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState(CONTENT_TYPES[1]);
  const [audience, setAudience] = useState("");
  const [targetWordCount, setTargetWordCount] = useState(WORD_COUNTS[2]);
  const [primaryGoal, setPrimaryGoal] = useState(GOALS[0]);
  
  // Section Expansion State
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  
  // Word Checker State
  const [textToCheck, setTextToCheck] = useState("");

  const handleBuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    // Reset expansions
    setExpandedSections({});
    
    buildBrief({
      topic,
      contentType,
      audience,
      targetWordCount,
      primaryGoal
    });
  };

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const generateFullBriefText = () => {
    if (!brief) return "";
    
    let text = `CONTENT BRIEF: ${brief.topic}\n`;
    text += `Type: ${brief.contentTypeName} | Target Words: ${brief.targetWordCount} | Est. Time: ${brief.estReadingTime} min\n`;
    text += `========================================================\n\n`;
    
    brief.structure.forEach((section, i) => {
      text += `${i + 1}. [${(section.type || '').toUpperCase()}] ${section.heading}\n`;
      text += `   Guidance: ${section.guidance}\n`;
      text += `   Target Length: ${section.word_count_min}-${section.word_count_max} words\n\n`;
    });
    
    if (brief.seoNotes) {
      text += `SEO NOTES:\n${brief.seoNotes}\n`;
    }
    
    return text;
  };

  const downloadBrief = () => {
    const text = generateFullBriefText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brief.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Complex Word Checker Logic
  const lookup = wordComplexityData as Record<string, string[]>;
  const complexMatches = checkComplexWords(textToCheck, lookup);

  const getSectionColorClass = (type: string) => {
    switch (type) {
      case 'intro': return 'border-l-blue-500';
      case 'h2': return 'border-l-indigo-500';
      case 'h3': return 'border-l-purple-500';
      case 'conclusion': return 'border-l-emerald-500';
      case 'disclaimer': return 'border-l-red-500';
      default: return 'border-l-slate-500';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
      {/* LEFT COLUMN - INPUT PANEL */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-6 shadow-sm">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-syne">
            <FileText className="w-5 h-5 text-indigo-400" />
            Brief Configuration
          </h3>
          
          <form onSubmit={handleBuild} className="space-y-5">
            <div>
              <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">
                Topic / Focus Keyword <span className="text-rose-500">*</span>
              </Label>
              <Input 
                placeholder="e.g. WordPress SEO Guide" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all h-10 px-3"
                required
              />
            </div>

            <div>
              <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm h-10 px-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#13102E] border-white/[0.08] max-h-[300px]">
                  {CONTENT_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-300 cursor-pointer font-dm">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Target Audience</Label>
              <Input 
                placeholder="e.g. WordPress beginners" 
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm transition-all h-10 px-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Word Count</Label>
                <Select value={targetWordCount} onValueChange={setTargetWordCount}>
                  <SelectTrigger className="bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm h-10 px-3">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#13102E] border-white/[0.08]">
                    {WORD_COUNTS.map(count => (
                      <SelectItem key={count} value={count} className="text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-300 cursor-pointer font-dm">
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Primary Goal</Label>
                <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
                  <SelectTrigger className="bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-dm h-10 px-3">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#13102E] border-white/[0.08]">
                    {GOALS.map(goal => (
                      <SelectItem key={goal} value={goal} className="text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-300 cursor-pointer font-dm">
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center rounded-lg transition-all duration-200 mt-6 text-base shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-[1px] h-12"
              disabled={!topic || isBuilding}
            >
              {isBuilding ? (
                <><Activity className="mr-2 h-5 w-5 animate-pulse" /> Structuring Outline...</>
              ) : (
                <><Zap className="mr-2 h-5 w-5" /> Build My Brief</>
              )}
            </Button>
          </form>
        </div>

        {/* Word Complexity Checker Tool */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mt-6 shadow-sm">
          <h4 className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-3 uppercase tracking-widest font-mono">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            Clear Writing Checker
          </h4>
          <p className="text-[13px] text-zinc-500 mb-4 leading-relaxed font-dm">
            Google prefers simple language. Paste a drafted paragraph below to check for overly complex words and get simpler alternatives.
          </p>
          <Textarea 
            placeholder="Paste text here to check readability..."
            value={textToCheck}
            onChange={(e) => setTextToCheck(e.target.value)}
            className="min-h-[120px] bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg resize-y mb-4 text-sm leading-relaxed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 font-dm transition-all"
          />
          
          {textToCheck.length > 0 && (
            <div className="bg-black/20 rounded-lg p-3 text-sm border border-white/5">
              {complexMatches.length === 0 ? (
                <div className="text-emerald-400 flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Great! No complex words detected.
                </div>
              ) : (
                <div>
                  <div className="text-orange-400 flex items-center gap-2 font-medium mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    Found {complexMatches.length} complex word(s):
                  </div>
                  <div className="space-y-2">
                    {complexMatches.map((match, i) => (
                      <div key={i} className="flex justify-between items-center text-[13px]">
                        <span className="bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
                          {match.word}
                        </span>
                        <span className="text-zinc-600 mx-1">→</span>
                        <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                          {match.alternatives.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-3 pt-2 border-t border-white/5">
                    Fixing these can improve Flesch Reading Ease by roughly {complexMatches.length * 2} points.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN - RESULTS PANEL */}
      <div className="xl:col-span-8 flex flex-col h-full animate-slide-up">
        {!brief && !isBuilding ? (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01] text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
              <FileText className="w-10 h-10 text-indigo-400 opacity-80" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 font-syne">Build a Winning Outline</h3>
            <p className="text-zinc-500 max-w-md text-[15px] leading-relaxed">
              Generate a structured content brief instantly based on proven templates optimized for search intent.
            </p>
          </div>
        ) : !brief && isBuilding ? (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-white/[0.02]">
             <Activity className="w-12 h-12 text-indigo-500 animate-pulse mb-6" />
             <p className="text-white font-semibold text-lg font-syne tracking-tight">Assembling content structure...</p>
          </div>
        ) : brief ? (
          <div className="space-y-6 pb-24 lg:pb-0 relative">
            
            {/* Brief Header Stats */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 sm:p-6 flex flex-wrap gap-6 justify-between items-center shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 font-syne tracking-tight">
                  {brief.topic}
                </h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-zinc-400 font-dm">
                  <span className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4 text-indigo-400" /> {brief.contentTypeName}</span>
                  <span className="flex items-center gap-2"><Target className="w-4 h-4 text-indigo-400" /> {brief.targetWordCount} words</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> {brief.estReadingTime} min read</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end border-l border-white/10 pl-6 shrink-0">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 font-mono">SEO Difficulty</span>
                <span className={cn(
                  "px-3 py-1 rounded text-[13px] font-bold tracking-wide",
                  brief.difficulty === 'Low' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
                  brief.difficulty === 'Medium' ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" :
                  "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                )}>
                  {brief.difficulty}
                </span>
              </div>
            </div>

            {/* Structure List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-xl font-bold text-white font-syne">Content Structure ({brief.structure.length})</h3>
              </div>
              
              {brief.structure.map((section, index) => {
                const isExpanded = expandedSections[index] ?? true;
                
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "group bg-white/[0.02] border border-white/[0.06] rounded-xl transition-all shadow-sm break-inside-avoid",
                      "border-l-[3px]", getSectionColorClass(section.type),
                      isExpanded ? "shadow-md bg-white/[0.04]" : "hover:bg-white/[0.04] cursor-pointer"
                    )}
                  >
                    {/* Collapsed Header (Clickable) */}
                    <div 
                      className={cn(
                        "p-5 flex items-start justify-between gap-4 cursor-pointer select-none",
                        isExpanded && "border-b border-white/5"
                      )}
                      onClick={() => toggleSection(index)}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 mt-0.5">
                          <span className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase tracking-widest font-mono border",
                            section.type === 'intro' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            section.type.startsWith('h') ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          )}>
                            {section.type === 'conclusion' ? 'End' : section.type}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-[17px] leading-snug mb-1.5 group-hover:text-indigo-400 transition-colors font-syne tracking-tight">
                            {section.heading}
                          </h4>
                          {!isExpanded && (
                            <p className="text-zinc-500 text-[13px] truncate max-w-[400px] font-dm">
                              {section.guidance}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-shrink-0 pt-2">
                        <div className="text-right hidden sm:block">
                          <span className="text-[11px] font-mono text-zinc-500 bg-black/20 px-2.5 py-1.5 rounded-md whitespace-nowrap border border-white/5">
                            {section.word_count_min}-{section.word_count_max} words
                          </span>
                        </div>
                        <div className="w-6 flex justify-end">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-zinc-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-5 pl-[72px] bg-black/20 animate-in slide-in-from-top-2 duration-200 rounded-b-xl max-sm:pl-5">
                        <div className="relative">
                          <BookOpen className="w-4 h-4 text-zinc-600 absolute left-0 top-1 max-sm:hidden" />
                          <p className="text-zinc-300 text-sm leading-relaxed pl-7 max-sm:pl-0 font-dm">
                            {section.guidance}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex sm:hidden">
                          <span className="text-[11px] font-mono text-zinc-500 bg-white/5 px-2.5 py-1.5 rounded-md whitespace-nowrap border border-white/5">
                            Target: {section.word_count_min}-{section.word_count_max} words
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SEO Notes */}
            {brief.seoNotes && (
              <div className="bg-amber-500/5 border border-amber-500/20 text-amber-200/80 rounded-xl p-5 sm:p-6 mt-8">
                <h4 className="flex items-center gap-2 font-bold text-amber-400 mb-3 font-syne text-lg">
                  <Zap className="w-5 h-5" />
                  SEO Notes for {brief.contentTypeName}
                </h4>
                <p className="text-[14px] leading-relaxed font-dm whitespace-pre-line text-amber-100/70">
                  {brief.seoNotes}
                </p>
              </div>
            )}

            <CTABanner variant="inline" tab="briefs" />
            
            {/* Action Bar Floating Dock */}
            <div className="fixed sm:sticky bottom-6 left-6 right-6 sm:bottom-0 sm:left-0 sm:right-0 z-40 lg:mt-6 animate-slide-up flex justify-center pointer-events-none pb-4">
              <div className="bg-[#080B14]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-wrap gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto w-full sm:w-auto mx-auto max-w-[calc(100vw-3rem)]">
                <Button 
                  variant="ghost" 
                  className="hover:bg-white/10 text-zinc-300 flex-1 sm:flex-none h-10 px-4 transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText(generateFullBriefText());
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy Brief
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="hover:bg-white/10 text-zinc-300 flex-1 sm:flex-none h-10 px-4 transition-all"
                  onClick={downloadBrief}
                >
                  <Download className="mr-2 h-4 w-4" /> Save .txt
                </Button>
                
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold w-full sm:w-auto h-10 px-6 rounded-xl transition-colors duration-200 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  Get AI Brief Plugin <Zap className="ml-2 w-4 h-4 text-indigo-200" />
                </Button>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}
