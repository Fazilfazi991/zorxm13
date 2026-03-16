
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GeneratorForm from "./components/GeneratorForm";
import PreviewPanel from "./components/PreviewPanel";
import { Sparkles, ArrowRight, Wand2 } from "lucide-react";

const PageGenerator = () => {
  const [json, setJson] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [lastInput, setLastInput] = React.useState<any>(null);

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
    setIsLoading(true);
    setError(null);
    setJson(null);
    setLastInput(data);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Generation failed. Please try again.');
      }

      setJson(result.json);
      
      // Smooth scroll to preview on mobile
      if (window.innerWidth < 1024) {
        const previewElement = document.getElementById('preview-section');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 lg:pt-32 pb-20">
        <div className="section-container">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-xs font-bold text-primary uppercase tracking-widest border border-primary/10 animate-fade-up">
              <Sparkles className="w-3.5 h-3.5" />
              AI Assistant
            </div>
            <h1 className="heading-display text-foreground animate-fade-up delay-100">
              WordPress <span className="text-transparent bg-clip-text bg-gradient-primary">Template Craft</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-up delay-200">
              Generate elite Elementor templates with elite AI logic. Claude + Gemini fallback.
            </p>
          </div>

          {/* Main Interface */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Form Section */}
            <div className="lg:col-span-4 xl:col-span-5">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-card border border-border/50 sticky top-28">
                <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-syne font-bold text-foreground">Configure Page</h2>
                    <p className="text-xs text-muted-foreground">Customize your template details</p>
                  </div>
                </div>
                
                <GeneratorForm onSubmit={generatePage} isLoading={isLoading} />
              </div>
            </div>

            {/* Preview Section */}
            <div id="preview-section" className="lg:col-span-8 xl:col-span-7 h-[calc(100vh-160px)] min-h-[600px]">
              <PreviewPanel 
                json={json} 
                businessName={lastInput?.businessName || 'Business'}
                pageType={lastInput?.pageType || 'page'}
                isLoading={isLoading} 
                loadingMessage={loadingMessages[loadingStep]}
                error={error} 
                onRetry={() => generatePage(lastInput)} 
              />
            </div>
          </div>
          
          {/* Quick Guide */}
          <div className="mt-24 grid md:grid-cols-3 gap-8 p-8 md:p-12 bg-white rounded-[3rem] shadow-card border border-border/50">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary">1</div>
              <h3 className="text-lg font-bold text-foreground">Describe & Tone</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Simply tell us what your business does and choose the vibe you want to convey to your visitors.</p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary">2</div>
              <h3 className="text-lg font-bold text-foreground">JSON Generation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Our AI creates a high-conversion Elementor JSON template with professional widgets and copy.</p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary">3</div>
              <h3 className="text-lg font-bold text-foreground">Import to WordPress</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Download the JSON file and import it directly into your Elementor template library.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PageGenerator;
