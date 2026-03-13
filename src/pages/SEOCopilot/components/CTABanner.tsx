import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CTABannerProps {
  variant: "inline" | "full" | "nudge";
  tab: "rules" | "titles" | "briefs";
  className?: string;
}

const PLUGIN_URL = "https://seocopilot.io";

export function CTABanner({ variant, tab, className }: CTABannerProps) {
  const getText = () => {
    switch (tab) {
      case "rules":
        return "Fix these issues automatically on every post with AI.";
      case "titles":
        return "Generate perfectly optimized AI titles in 2 seconds.";
      case "briefs":
        return "Get AI-generated content briefs using live competitor data.";
    }
  };

  const text = getText();

  if (variant === "inline") {
    return (
      <div className={cn(
        "bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-sm sm:text-base text-indigo-100 font-medium">
            {text}
          </p>
        </div>
        <a 
          href={PLUGIN_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex-shrink-0"
        >
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-glow">
            Get the Plugin <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </a>
      </div>
    );
  }

  if (variant === "nudge") {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 z-50 animate-bounce shadow-glow sm:hidden",
        className
      )}>
        <a 
          href={PLUGIN_URL} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6">
            <Sparkles className="mr-2 w-5 h-5" /> 
            Get SEO Copilot
          </Button>
        </a>
      </div>
    );
  }

  // variant === "full"
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 border border-indigo-500/30 p-8 sm:p-12 text-center",
      className
    )}>
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto space-y-6 flex flex-col items-center">
        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-2">
          <Sparkles className="w-8 h-8 text-indigo-300" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Liked these free tools?
        </h2>
        
        <p className="text-lg sm:text-xl text-indigo-200 leading-relaxed max-w-xl">
          The SEO Copilot WordPress plugin does all of this automatically inside your editor — plus AI-powered rewrites, rank tracking, and more.
        </p>
        
        <div className="pt-4">
          <a 
            href={PLUGIN_URL} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 text-base font-bold px-8 h-14 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all">
              Get SEO Copilot Plugin <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
        <p className="text-xs text-indigo-300/70 mt-4 uppercase tracking-widest font-semibold flex flex-wrap justify-center gap-4">
          <span>✓ Instant Analysis</span>
          <span>✓ AI Optimization</span>
          <span>✓ 1-Click Publishing</span>
        </p>
      </div>
    </div>
  );
}
