
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Layout, User, Briefcase, Zap, Heart, Flame, Laptop, ChevronDown, Check, Sparkles } from "lucide-react";
import { PromptBuilder } from './PromptBuilder';

export type PageType = 'landing' | 'about' | 'portfolio';
export type Tone = 'professional' | 'friendly' | 'bold' | 'minimal';

interface GeneratorFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  {
    id: 'seo',
    title: 'SEO Agency Service Page',
    data: {
      pageType: 'landing' as const,
      businessName: 'RankRight SEO Agency',
      description: "We help small and medium businesses rank on Google through technical SEO, content strategy, and link building. We've helped 200+ clients grow organic traffic by 300% in 6 months.",
      tone: 'professional' as const,
      ctaText: 'Book a Free Strategy Call',
      primaryColor: '#166534'
    }
  },
  {
    id: 'photo',
    title: 'Freelance Photographer Portfolio',
    data: {
      pageType: 'portfolio' as const,
      businessName: 'Lena Visuals',
      description: "Dubai-based freelance photographer specialising in brand photography, corporate headshots, and product shoots for e-commerce brands and startups.",
      tone: 'minimal' as const,
      ctaText: 'View My Work',
      primaryColor: '#1A1A2E'
    }
  },
  {
    id: 'agency',
    title: 'Digital Marketing Agency About Page',
    data: {
      pageType: 'about' as const,
      businessName: 'Zorx Digital',
      description: "A Dubai-based digital marketing agency helping brands grow through AI-powered marketing, Meta Ads, SEO, and content creation. We work with startups and established businesses across the UAE.",
      tone: 'bold' as const,
      ctaText: 'Work With Us',
      primaryColor: '#166534'
    }
  }
];

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onSubmit, isLoading }) => {
  const [pageType, setPageType] = React.useState<PageType>('landing');
  const [businessName, setBusinessName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tone, setTone] = React.useState<Tone>('professional');
  const [primaryColor, setPrimaryColor] = React.useState('#6C63FF');
  const [ctaText, setCtaText] = React.useState('Get Started');
  const [showExamples, setShowExamples] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [isPromptBuilderOpen, setIsPromptBuilderOpen] = React.useState(false);

  // Rotating placeholder logic
  const placeholders = [
    "Make me a landing page for our web development agency in Dubai...",
    "Create an about us page with founder story and team section...",
    "Build a portfolio page for a freelance photographer specialising in brands...",
    "Generate a landing page for our SEO service targeting UAE businesses...",
    "Design an about page for a digital marketing agency with values section...",
    "Make a portfolio page for a creative studio with project showcases...",
    "Create a landing page for a restaurant with online booking CTA...",
    "Build a service page for a law firm focusing on corporate clients..."
  ];

  const [placeholderIndex, setPlaceholderIndex] = React.useState(0);
  const [placeholderVisible, setPlaceholderVisible] = React.useState(true);
  const [isFocused, setIsFocused] = React.useState(false);
  const [promptAddedFlash, setPromptAddedFlash] = React.useState(false);

  React.useEffect(() => {
    if (isFocused || description) return;
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex(i => (i + 1) % placeholders.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused, description, placeholders.length]);

  const submitButtonRef = React.useRef<HTMLButtonElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const loadExample = (example: typeof EXAMPLES[0]) => {
    setPageType(example.data.pageType);
    setBusinessName(example.data.businessName);
    setDescription(example.data.description);
    setTone(example.data.tone);
    setPrimaryColor(example.data.primaryColor);
    setCtaText(example.data.ctaText);
    setShowExamples(false);
    showToast("Example loaded — feel free to customise it");
  };

  const handleUsePrompt = (prompt: string, cta?: string) => {
    setDescription(prompt);
    if (cta) setCtaText(cta);
    setIsPromptBuilderOpen(false);
    showToast("Prompt added ✓");
    
    // Pulse animation
    setPromptAddedFlash(true);
    setTimeout(() => setPromptAddedFlash(false), 800);
    
    // Smooth scroll to generate button
    setTimeout(() => {
      submitButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ pageType, businessName, description, tone, primaryColor, ctaText });
  };

  const inputStyles = "bg-[var(--color-offwhite)] border-[var(--color-border)] rounded-[10px] text-[14px] focus:ring-4 focus:ring-[var(--color-green-700)]/10 focus:border-[var(--color-green-700)] transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in group">
      <div className="space-y-4">
        <Label className="text-[12px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.06em]">Page Type</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'landing', label: 'Landing', icon: Layout },
            { id: 'about', label: 'About', icon: User },
            { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
          ].map((item) => (
            <Card
              key={item.id}
              className={`p-4 cursor-pointer border transition-all flex flex-col items-center justify-center gap-2 text-center h-[90px] rounded-[12px] ${
                pageType === item.id 
                  ? 'border-[var(--color-green-700)] bg-[var(--color-green-700)]/[0.06] ring-1 ring-[var(--color-green-700)]' 
                  : 'border-[var(--color-border)] bg-transparent hover:border-[var(--color-green-700)]/30'
              }`}
              onClick={() => setPageType(item.id as PageType)}
            >
              <item.icon className={`w-5 h-5 transition-colors ${pageType === item.id ? 'text-[var(--color-green-700)]' : 'text-[var(--color-text-secondary)]'}`} />
              <span className={`text-[11px] font-semibold transition-colors ${pageType === item.id ? 'text-[var(--color-green-700)]' : 'text-[var(--color-text-secondary)]'}`}>
                {item.label}
              </span>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-[14px] font-semibold text-[var(--color-text-primary)]">Business Name</Label>
          <Input
            id="businessName"
            placeholder="e.g. Brew & Co Coffee"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            className={`h-11 ${inputStyles}`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description" className="text-[14px] font-semibold text-[var(--color-text-primary)]">Description</Label>
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowExamples(!showExamples)}
                className="text-[12px] text-[var(--color-green-700)] font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                Need inspiration? <span className="flex items-center">Try an example <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform ${showExamples ? 'rotate-180' : ''}`} /></span>
              </button>

              {showExamples && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowExamples(false)}
                  />
                  <Card className="absolute right-0 top-full mt-2 w-[280px] z-30 shadow-xl border-[var(--color-border)] p-1 animate-in fade-in zoom-in-95 duration-200">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => loadExample(ex)}
                        className="w-full text-left px-4 py-3 text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-green-700)]/[0.04] hover:text-[var(--color-green-700)] rounded-lg transition-colors flex items-center justify-between"
                      >
                        {ex.title}
                      </button>
                    ))}
                  </Card>
                </>
              )}
            </div>
          </div>
          <div 
            className="flex flex-col"
            style={{
              background: 'var(--color-background-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '16px',
              transition: 'all 0.2s',
              ...(isFocused ? {
                borderColor: '#166534',
                boxShadow: '0 0 0 3px rgba(22,101,52,0.08)'
              } : {}),
              ...(promptAddedFlash ? {
                borderColor: '#166534',
                boxShadow: '0 0 0 4px rgba(22,101,52,0.2)'
              } : {})
            }}
          >
            <textarea
              id="description"
              placeholder={placeholders[placeholderIndex]}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              required
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                minHeight: '80px',
                maxHeight: '200px',
                resize: 'none',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                opacity: placeholderVisible || description ? 1 : 0,
                transform: placeholderVisible || description ? 'translateY(0)' : 'translateY(-4px)',
                transition: 'opacity 0.3s, transform 0.3s'
              }}
              className="custom-scrollbar"
            />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '0.5px solid var(--color-border-tertiary)',
              marginTop: '8px'
            }}>
              <button
                type="button"
                onClick={() => setIsPromptBuilderOpen(true)}
                style={{
                  fontSize: '12px',
                  color: '#166534',
                  background: 'rgba(22,101,52,0.06)',
                  border: '0.5px solid rgba(22,101,52,0.2)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(22,101,52,0.12)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(22,101,52,0.06)'}
              >
                ✦ Build my prompt
              </button>
              
              <span style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)'
              }}>
                {description.length} / 500
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-[12px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.06em]">Tone</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'professional', label: 'Professional', icon: Zap },
            { id: 'friendly', label: 'Friendly', icon: Heart },
            { id: 'bold', label: 'Bold', icon: Flame },
            { id: 'minimal', label: 'Minimal', icon: Laptop },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 border ${
                tone === item.id
                  ? 'bg-[var(--color-green-700)] text-white border-[var(--color-green-700)]'
                  : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-green-700)]/40 hover:bg-[var(--color-green-700)]/[0.02]'
              }`}
              onClick={() => setTone(item.id as Tone)}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primaryColor" className="text-[14px] font-semibold text-[var(--color-text-primary)]">Brand Color</Label>
          <div className="flex gap-2">
            <div 
              className="w-11 h-11 shrink-0 rounded-[8px] border border-[var(--color-border)] shadow-sm"
              style={{ backgroundColor: primaryColor }}
            />
            <Input
              id="primaryColor"
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className={`h-11 font-mono uppercase ${inputStyles}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ctaText" className="text-[14px] font-semibold text-[var(--color-text-primary)]">CTA Text</Label>
          <Input
            id="ctaText"
            placeholder="e.g. Get Started"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className={`h-11 ${inputStyles}`}
          />
        </div>
      </div>

      <Button
        type="submit"
        ref={submitButtonRef}
        disabled={isLoading}
        className="w-full h-[48px] text-[15px] font-bold bg-[var(--color-green-700)] hover:bg-[var(--color-green-600)] active:scale-[0.98] text-white rounded-[12px] transition-all duration-200 mt-2 shadow-sm"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </span>
        ) : (
          'Generate My Page'
        )}
      </Button>

      {/* Local Toast System */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-[14px] font-medium shadow-2xl flex items-center gap-3 border border-white/10">
            <Check className="w-4 h-4 text-[var(--color-green-500)]" />
            {toast}
          </div>
        </div>
      )}
      {/* Prompt Builder Modal */}
      <PromptBuilder 
        isOpen={isPromptBuilderOpen}
        onClose={() => setIsPromptBuilderOpen(false)}
        onUsePrompt={handleUsePrompt}
      />
    </form>
  );
};

export default GeneratorForm;
