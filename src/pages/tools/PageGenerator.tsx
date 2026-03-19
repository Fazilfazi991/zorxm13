
import React from 'react';
import Navbar from "@/components/Navbar";
import GeneratorForm from "./components/GeneratorForm";
import PreviewPanel from "./components/PreviewPanel";
import { AuthHeader } from "@/components/AuthHeader";
import { ChevronDown, Pencil, Wand2, Download, Layout, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const GUEST_KEY = 'wpcraft_guest_generations';

const PageGenerator = () => {
  const [generatedData, setGeneratedData] = React.useState<{
    data: any,
    primaryColor: string,
    businessName: string
  } | null>(null);
  const [lastInput, setLastInput] = React.useState<any>(null);
  const [showSignupPrompt, setShowSignupPrompt] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const { user, profile, refreshProfile } = useAuth();

  const loadingMessages = [
    "Analysing your business...",
    "Crafting your sections...",
    "Writing your copy...",
    "Building your layout...",
    "Finalising your page..."
  ];

  React.useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const generatePage = async (data: any) => {
    if (!data) return;
    
    // Auth & Credit Check Before Generation
    if (user && profile) {
      if (profile.credits <= 0) {
        toast.error("You're out of credits! Please upgrade to continue generating.");
        return;
      }
    } else {
      const count = parseInt(localStorage.getItem(GUEST_KEY) || '0');
      if (count >= 1) {
        setShowSignupPrompt(true);
        return;
      }
      localStorage.setItem(GUEST_KEY, String(count + 1));
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedData(null);
    setLastInput(data);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Handle non-JSON responses (e.g. server crashes, 504 Gateway Timeout)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error(`Server returned unexpected response type: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!response.ok || !result || result.success === false) {
        throw new Error(result?.error || result?.message || 'Generation failed. Our AI models are currently busy. Please try again in a moment.');
      }

      setGeneratedData({
        data: result.data,
        primaryColor: data.primaryColor,
        businessName: data.businessName
      });
      
      // Post-Generation Tracking
      if (user) {
        try {
          // Deduct credit
          await supabase.rpc('deduct_credit', { user_id: user.id });
          // Refresh UI
          await refreshProfile();
          // Log generation to history
          await supabase.from('generations').insert({
            user_id: user.id,
            page_type: data.pageType,
            business_name: data.businessName,
            style_id: data.styleId || data.tone,
            primary_color: data.primaryColor
          });
        } catch (dbErr) {
          console.error("Failed to update credit/history:", dbErr);
        }
      }
      
      // Smooth scroll to preview on mobile
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        const previewElement = document.getElementById('generator-section');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err instanceof Error ? err.message : 'Something went wrong during generation. Please check your connection and try again.');
      setGeneratedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader />
      <Navbar />
      
      {/* SECTION 1: DARK HERO */}
      <section className="bg-[var(--color-dark-bg)] pt-[100px] pb-[80px] px-4 min-h-[70vh] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="max-w-[720px] mx-auto space-y-8 animate-fade-up">
          <div className="inline-flex items-center px-4 py-1.5 bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-full text-[11px] font-bold text-[var(--color-green-500)] uppercase tracking-[0.08em] shadow-sm">
            Free AI Tool
          </div>
          
          <h1 className="text-[32px] md:text-[48px] font-semibold text-[var(--color-offwhite)] leading-[1.2] tracking-tight">
            Generate Elementor Pages with AI
          </h1>
          
          <p className="text-[18px] text-[var(--color-text-muted)] leading-relaxed max-w-[640px] mx-auto">
            Describe your business, choose a page type, and get a fully editable Elementor page in seconds. 
            No coding. No templates. Just your content.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {["3 Page Types", "Elementor Ready", "100% Free"].map((stat, i) => (
              <div 
                key={i} 
                className="px-5 py-2 bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-full text-[var(--color-offwhite)] text-[13px] font-medium shadow-sm transition-transform hover:scale-105"
              >
                {stat}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={scrollToHowItWorks}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[var(--color-green-600)] animate-bounce cursor-pointer p-2 hover:text-[var(--color-green-500)] transition-colors z-10"
          aria-label="Scroll to how it works"
        >
          <ChevronDown className="w-10 h-10" />
        </button>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="bg-[var(--color-offwhite)] py-20 px-4 scroll-mt-20">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[12px] font-bold text-[var(--color-green-700)] uppercase tracking-wider block">How it works</span>
            <h2 className="text-[32px] font-semibold text-[var(--color-text-primary)]">From prompt to editable page in 3 steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Pencil,
                title: "Describe your business",
                desc: "Enter your business name, what you do, and the tone you want. Takes 30 seconds."
              },
              {
                step: "02",
                icon: Wand2,
                title: "AI builds your page",
                desc: "Our AI generates a complete Elementor-ready page with real copy, proper sections, and your brand color."
              },
              {
                step: "03",
                icon: Download,
                title: "Import and edit in Elementor",
                desc: "Download the JSON file, import it into Elementor with one click, and start editing live."
              }
            ].map((item, i) => (
              <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-2 right-4 text-[48px] font-bold text-[var(--color-green-700)] opacity-[0.15] select-none group-hover:opacity-20 transition-opacity">
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-green-700)]/5 flex items-center justify-center mb-6 group-hover:bg-[var(--color-green-700)]/10 transition-colors">
                  <item.icon className="w-8 h-8 text-[var(--color-green-700)]" />
                </div>
                <h3 className="text-[18px] font-semibold mb-3 text-[var(--color-text-primary)]">{item.title}</h3>
                <p className="text-[14px] text-[var(--color-text-secondary)] leading-[1.6]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: GENERATOR TOOL */}
      <section id="generator-section" className="bg-[var(--color-offwhite-dark)] py-24 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <span className="text-[12px] font-bold text-[var(--color-green-700)] uppercase tracking-wider block">The Generator</span>
            <h2 className="text-[32px] font-semibold text-[var(--color-text-primary)]">Build your page</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Form Section */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-[var(--color-surface)] p-8 rounded-[20px] shadow-sm border border-[var(--color-border)] sticky top-28">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--color-border)]">
                  <div className="p-2.5 rounded-xl bg-[var(--color-green-700)]/5">
                    <Layout className="w-5 h-5 text-[var(--color-green-700)]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Configure your page</h3>
                    <p className="text-[13px] text-[var(--color-text-muted)]">Fill in the details below</p>
                  </div>
                </div>
                <GeneratorForm onSubmit={generatePage} isLoading={isLoading} />
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-7 xl:col-span-8 h-[740px]">
              <PreviewPanel 
                data={generatedData?.data || null} 
                businessName={generatedData?.businessName || lastInput?.businessName || 'Business'}
                primaryColor={generatedData?.primaryColor || lastInput?.primaryColor || '#ff0000'}
                pageType={lastInput?.pageType || 'page'}
                isLoading={isLoading} 
                loadingMessage={loadingMessages[loadingStep]}
                error={error} 
                onRetry={() => generatePage(lastInput)} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FOOTER STRIP */}
      <footer className="bg-[var(--color-dark-bg)] py-12 text-center border-t border-[var(--color-dark-border)]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-[13px] text-[var(--color-text-muted)] mb-2 font-medium tracking-wide">
            AI WEBSITE GENERATOR · A FREE TOOL BY ZORX
          </p>
          <a href="https://zorx.co" target="_blank" rel="noopener noreferrer" className="text-[var(--color-green-500)] text-[13px] hover:text-[var(--color-green-600)] transition-colors font-semibold uppercase tracking-widest">
            zorx.co
          </a>
        </div>
      </footer>

      {/* GUEST SIGNUP PROMPT MODAL */}
      {showSignupPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-[440px] w-full rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center pointer-events-auto filter-none">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-[#166534]" />
            </div>
            <h2 className="text-[24px] font-semibold text-[var(--color-text-primary)] mb-3 tracking-tight">
              Enjoying WPCraft?
            </h2>
            <p className="text-[15px] text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              Create a free account to get 3 more generations plus save your history to your dashboard.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/signup" className="w-full">
                <Button className="w-full h-12 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl font-semibold text-[15px] shadow-sm">
                  Create free account
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full h-12 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-medium text-[14px]"
                onClick={() => {
                  setShowSignupPrompt(false);
                  toast("1 generation left", { description: "Make sure to download your JSON before leaving." });
                }}
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageGenerator;
