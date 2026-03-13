import { useState, useEffect } from "react";
import { HeroSection } from "./components/HeroSection";
import { TabNav, TabId } from "./components/TabNav";
import { SEORulesChecker } from "./components/tools/SEORulesChecker";
import { TitleFormulaGenerator } from "./components/tools/TitleFormulaGenerator";
import { ContentBriefBuilder } from "./components/tools/ContentBriefBuilder";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, ClipboardPaste, Type, FileText, CheckCircle2, Lock, Mail } from "lucide-react";
import { CopyButton } from "./components/ui/CopyButton";
import { FullSEOReport } from "./types/report.types";
import { FullReportDisplay } from "./components/FullReportDisplay";

// FEATURE FLAG — set to true to enable access gating
const ENABLE_ACCESS_GATE = false;
const USAGE_LIMIT = 3;

export function SEOCopilotPage() {
  const [activeTab, setActiveTab] = useState<TabId>("rules");
  const [usageCount, setUsageCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);
  const [email, setEmail] = useState("");
  const [urlReport, setUrlReport] = useState<FullSEOReport | null>(null);

  useEffect(() => {
    // Check local storage for unlock status and usage
    const unlocked = localStorage.getItem("seo_copilot_unlocked") === "true";
    const count = parseInt(localStorage.getItem("seo_copilot_usage") || "0", 10);
    
    setIsUnlocked(unlocked);
    setUsageCount(count);
    
    if (ENABLE_ACCESS_GATE && !unlocked && count >= USAGE_LIMIT) {
      setShowGateModal(true);
    }
  }, []);

  // Wrap the entire click handler at root to track usage
  // This is a simplified approach. In reality, you might track actual tool executions.
  const handleUserInteraction = () => {
    if (!ENABLE_ACCESS_GATE || isUnlocked) return;
    
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem("seo_copilot_usage", newCount.toString());
    
    if (newCount >= USAGE_LIMIT) {
      setShowGateModal(true);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Here you would typically send the email to your API
    localStorage.setItem("seo_copilot_unlocked", "true");
    setIsUnlocked(true);
    setShowGateModal(false);
  };

  return (
    <div className="min-h-screen bg-[#080B14] font-dm selection:bg-indigo-500/30 text-slate-300 pb-20 overflow-x-hidden">
      
      {/* Global usage tracker wrapper */}
      <div onClickCapture={handleUserInteraction}>
        
        <HeroSection 
          onAnalyzeComplete={setUrlReport}
          onTabSelect={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: document.getElementById('seo-tools-tabs')?.offsetTop ? document.getElementById('seo-tools-tabs')!.offsetTop - 100 : 500, behavior: 'smooth' });
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20" id="seo-tools-tabs">
          
          {urlReport && (
            <div className="mb-12 animate-slide-up">
              <FullReportDisplay report={urlReport} />
            </div>
          )}

          <TabNav activeTab={activeTab} onChange={setActiveTab} />
          
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === "rules" && <SEORulesChecker />}
            {activeTab === "titles" && <TitleFormulaGenerator />}
            {activeTab === "briefs" && <ContentBriefBuilder />}
          </div>
          
          {/* Global CTA at bottom */}
          <div className="mt-32 pb-24 border-t border-white/5 pt-16 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -mt-40"></div>
            
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-14 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-bl-[200px] blur-3xl z-0 pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold font-syne text-white mb-5 tracking-tight">
                  Powered by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">SEO Copilot WordPress Plugin</span>
                </h2>
                <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto font-dm leading-relaxed">
                  These tools are just a preview. Get the plugin to automatically analyze, optimize, and write content directly inside WordPress.
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-8 py-7 text-lg transition-all shadow-[0_0_40px_rgba(99,102,241,0.2)] hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] hover:-translate-y-1">
                  Get SEO Copilot Plugin <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* Access Gate Modal */}
      <Dialog open={showGateModal} onOpenChange={setShowGateModal}>
        <DialogContent className="bg-[#0A0D14] border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] sm:max-w-md [&>button]:hidden">
          <DialogHeader className="mb-4 text-center">
            <div className="mx-auto w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white mb-3 font-syne tracking-tight">Unlock Unlimited Access</DialogTitle>
            <DialogDescription className="text-zinc-400 text-[15px] font-dm leading-relaxed">
              You've used your {USAGE_LIMIT} free analyses. Enter your email to unlock unlimited free access to all SEO Copilot tools.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUnlock} className="space-y-5 pt-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500" />
              </div>
              <Input
                type="email"
                placeholder="Enter your best email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11 bg-white/[0.04] border-white/[0.08] text-white h-12 placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg font-dm transition-all"
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 text-[15px] font-bold rounded-lg shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-[1px] transition-all">
              Unlock Free Access
            </Button>
            <p className="text-center text-[12px] text-zinc-500 pt-2 font-dm">
              No spam. Unsubscribe anytime.
            </p>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default SEOCopilotPage;
