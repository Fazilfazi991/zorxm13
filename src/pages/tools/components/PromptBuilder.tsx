import React, { useEffect, useState } from 'react';
import { X, ArrowLeft, Check, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface PromptBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt: (prompt: string, cta?: string) => void;
}

const STEPS = [
  "What does your business do?",
  "Who are your ideal customers?",
  "What's the main goal of this page?",
  "What do you want visitors to do?",
  "What are your top 3 services or highlights?",
  "What feeling should the page give visitors?"
];

export const PromptBuilder: React.FC<PromptBuilderProps> = ({ isOpen, onClose, onUsePrompt }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    whatYouDo: '',
    customers: [] as string[],
    goal: '',
    cta: '',
    highlights: '',
    feeling: ''
  });
  const [customCustomer, setCustomCustomer] = useState('');
  const [showCustomCustomerInput, setShowCustomCustomerInput] = useState(false);
  const [customCta, setCustomCta] = useState('');
  const [showCustomCtaInput, setShowCustomCtaInput] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  
  // Need delayed render for CSS slide up transition
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Reset state on open if it was closed
      if (isGenerated) {
        setIsGenerated(false);
        setCurrentStep(1);
      }
    } else {
      const timer = setTimeout(() => setShouldRender(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      generatePrompt();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePrompt = () => {
    const prompt = `${answers.whatYouDo}. Our ideal customers are ${answers.customers.join(', ')}. The main goal of this page is to ${answers.goal}. We want visitors to ${answers.cta}. Key highlights to feature: ${answers.highlights}. The overall tone and feeling should be ${answers.feeling}.`;
    setGeneratedPrompt(prompt);
    setIsGenerated(true);
  };

  const toggleCustomer = (chip: string) => {
    setAnswers(prev => ({
      ...prev,
      customers: prev.customers.includes(chip) 
        ? prev.customers.filter(c => c !== chip) 
        : [...prev.customers, chip]
    }));
  };

  const addCustomCustomer = () => {
    if (customCustomer.trim()) {
      toggleCustomer(customCustomer.trim());
      setCustomCustomer('');
      setShowCustomCustomerInput(false);
    }
  };

  const addCustomCta = () => {
    if (customCta.trim()) {
      setAnswers(prev => ({ ...prev, cta: customCta.trim() }));
      setCustomCta('');
      setShowCustomCtaInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-200"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose} 
      />
      
      {/* Bottom Sheet Panel */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-background-primary)] rounded-t-[24px] border-t border-[var(--color-border)] w-full flex flex-col md:max-h-[85vh] max-h-[92vh]"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Progress Bar (Sticky Top) */}
        {!isGenerated && (
          <div className="sticky top-0 w-full h-[3px] bg-[var(--color-border-tertiary)] z-20">
            <div 
              className="h-full bg-[#166534] transition-all duration-300 ease-out" 
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        )}

        {/* Panel Header */}
        <div className="pt-4 px-6 pb-4 shrink-0 relative bg-[var(--color-background-primary)] z-10 rounded-t-[24px]">
          <div className="w-10 h-1 bg-[var(--color-border-secondary)] rounded-full mx-auto mb-4" />
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">Build your prompt</h2>
              <p className="text-[13px] text-[var(--color-text-muted)]">Answer a few questions</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-[var(--color-offwhite)] rounded-full text-[var(--color-text-muted)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 overflow-y-auto custom-scrollbar flex-grow pb-[120px]">
          {!isGenerated ? (
            <div className="animate-in slide-in-from-right-8 duration-300 pt-2">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-[16px] font-medium text-[var(--color-text-primary)]">{STEPS[0]}</p>
                  <Textarea 
                    autoFocus
                    placeholder="e.g. We run an SEO agency helping small businesses rank on Google..."
                    className="min-h-[120px] py-4 bg-[var(--color-offwhite)] border-[var(--color-border)] rounded-[16px] text-[15px] focus:ring-4 focus:ring-[var(--color-green-700)]/10 focus:border-[var(--color-green-700)] transition-all leading-relaxed"
                    value={answers.whatYouDo}
                    onChange={(e) => setAnswers({...answers, whatYouDo: e.target.value})}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-[16px] font-medium text-[var(--color-text-primary)]">{STEPS[1]}</p>
                  <div className="flex flex-wrap gap-2">
                    {["Small businesses", "Freelancers", "Startups", "Enterprises", "Local customers", "E-commerce brands"].map(chip => (
                      <button
                        key={chip}
                        onClick={() => toggleCustomer(chip)}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all ${
                          answers.customers.includes(chip)
                            ? 'bg-[var(--color-green-700)] text-white border-[var(--color-green-700)] shadow-md'
                            : 'bg-[var(--color-offwhite)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-green-700)]/50'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                    {!showCustomCustomerInput ? (
                      <button
                        onClick={() => setShowCustomCustomerInput(true)}
                        className="px-4 py-2 rounded-full text-[13px] font-medium border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-green-700)] transition-all"
                      >
                        + Add your own
                      </button>
                    ) : (
                      <div className="flex gap-2 w-[100%] md:w-auto">
                        <Input 
                          autoFocus
                          placeholder="Type customer type..."
                          className="h-10 bg-[var(--color-offwhite)] rounded-full text-[13px] flex-grow"
                          value={customCustomer}
                          onChange={(e) => setCustomCustomer(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addCustomCustomer()}
                        />
                        <Button onClick={addCustomCustomer} size="sm" className="rounded-full bg-[var(--color-green-700)] shrink-0">Add</Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-[16px] font-medium text-[var(--color-text-primary)]">{STEPS[2]}</p>
                  <div className="flex flex-col gap-2">
                    {["Get leads", "Book consultations", "Sell a product or service", "Build brand trust", "Show my work"].map(chip => (
                      <button
                        key={chip}
                        onClick={() => setAnswers({...answers, goal: chip})}
                        className={`px-5 py-3 rounded-xl text-left text-[14px] font-medium border transition-all flex items-center justify-between ${
                          answers.goal === chip
                            ? 'bg-[var(--color-green-700)] text-white border-[var(--color-green-700)] shadow-lg'
                            : 'bg-[var(--color-offwhite)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-green-700)]/50'
                        }`}
                      >
                        {chip}
                        {answers.goal === chip && <Check className="w-4 h-4 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[16px] font-medium text-[var(--color-text-primary)]">{STEPS[3]}</p>
                    <p className="text-[13px] text-[var(--color-text-muted)] mt-1">This becomes your call-to-action button</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Book a Free Call", "Get a Quote", "Start Free Trial", "Contact Us", "View My Work", "Shop Now"].map(chip => (
                      <button
                        key={chip}
                        onClick={() => setAnswers({...answers, cta: chip})}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all ${
                          answers.cta === chip
                            ? 'bg-[var(--color-green-700)] text-white border-[var(--color-green-700)]'
                            : 'bg-[var(--color-offwhite)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                    {!showCustomCtaInput ? (
                      <button
                        onClick={() => setShowCustomCtaInput(true)}
                        className="px-4 py-2 rounded-full text-[13px] font-medium border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-green-700)]"
                      >
                        + Write my own
                      </button>
                    ) : (
                      <div className="flex gap-2 w-[100%] md:w-auto mt-2">
                        <Input 
                          autoFocus
                          placeholder="Type CTA text..."
                          className="h-10 bg-[var(--color-offwhite)] rounded-full text-[13px] flex-grow"
                          value={customCta}
                          onChange={(e) => setCustomCta(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addCustomCta()}
                        />
                        <Button onClick={addCustomCta} size="sm" className="rounded-full bg-[var(--color-green-700)]">Add</Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[16px] font-medium text-[var(--color-text-primary)]">{STEPS[4]}</p>
                    <p className="text-[13px] text-[var(--color-text-muted)] mt-1">Separate with commas</p>
                  </div>
                  <Input 
                    autoFocus
                    placeholder="e.g. SEO audits, Content writing, Link building"
                    className="h-14 px-5 bg-[var(--color-offwhite)] border-[var(--color-border)] rounded-[16px] text-l focus:ring-4 focus:ring-[var(--color-green-700)]/10 focus:border-[var(--color-green-700)] transition-all"
                    value={answers.highlights}
                    onChange={(e) => setAnswers({...answers, highlights: e.target.value})}
                  />
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-4">
                  <p className="text-[16px] font-medium text-[var(--color-text-primary)]">{STEPS[5]}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: "Trustworthy", emoji: "🛡️" },
                      { label: "Exciting & Bold", emoji: "🔥" },
                      { label: "Premium & Luxury", emoji: "💎" },
                      { label: "Friendly & Approachable", emoji: "🤝" },
                      { label: "Clean & Minimal", emoji: "✨" }
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={() => setAnswers({...answers, feeling: item.label})}
                        className={`px-5 py-3 rounded-xl text-left text-[14px] font-medium border transition-all flex items-center gap-3 ${
                          answers.feeling === item.label
                            ? 'bg-[var(--color-green-700)] text-white border-[var(--color-green-700)]'
                            : 'bg-[var(--color-offwhite)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                        }`}
                      >
                        <span className="text-lg">{item.emoji}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 pt-2 pb-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-[20px] font-bold text-[var(--color-text-primary)]">Your prompt is ready</h2>
                <p className="text-[14px] text-[var(--color-text-muted)]">We've written this based on your answers</p>
              </div>

              <div 
                className="relative group"
                style={{
                  background: 'rgba(22,101,52,0.06)',
                  borderLeft: '3px solid #166534',
                  borderRadius: '0 8px 8px 0',
                  padding: '16px 20px',
                  margin: '16px 0'
                }}
              >
                {isEditingPrompt ? (
                  <Textarea 
                    autoFocus
                    className="w-full min-h-[160px] bg-white border-[var(--color-border)] rounded-md text-[14px] leading-relaxed"
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                  />
                ) : (
                  <p className="text-[14px] text-[var(--color-text-primary)] leading-[1.7] font-dm">
                    {generatedPrompt}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                  variant="outline"
                  className="w-full text-[var(--color-text-secondary)] font-medium h-12 rounded-xl text-[14px] active:scale-[0.98] transition-all"
                >
                  {isEditingPrompt ? 'Save edit' : 'Edit prompt manually'}
                </Button>
                <Button 
                  onClick={() => onUsePrompt(generatedPrompt, answers.cta)}
                  className="bg-[#166534] hover:bg-[#14532d] text-white font-bold h-12 rounded-xl text-[15px] shadow-sm active:scale-[0.98] transition-all"
                >
                  Use this prompt →
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Sticky Bottom (Only visible before generated) */}
        {!isGenerated && (
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-background-primary)] px-6 py-4 border-t border-[0.5px] border-[var(--color-border-tertiary)] flex items-center justify-between z-10 shrink-0">
            {currentStep > 1 ? (
              <button 
                onClick={handleBack}
                className="text-[14px] font-medium flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '8px 16px' }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div /> // Spacer
            )}
            
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !answers.whatYouDo) ||
                (currentStep === 2 && answers.customers.length === 0) ||
                (currentStep === 3 && !answers.goal) ||
                (currentStep === 4 && !answers.cta) ||
                (currentStep === 5 && !answers.highlights) ||
                (currentStep === 6 && !answers.feeling)
              }
              className="bg-[#166534] hover:bg-[#14532d] text-white font-bold h-11 px-6 rounded-xl shadow-sm active:scale-[0.98] transition-all"
            >
              {currentStep === 6 ? 'Build My Prompt' : 'Next →'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
