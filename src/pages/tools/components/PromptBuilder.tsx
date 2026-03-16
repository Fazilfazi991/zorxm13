
import React from 'react';
import { X, ArrowLeft, ArrowRight, Sparkles, Check, Edit2 } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = React.useState(1);
  const [answers, setAnswers] = React.useState({
    whatYouDo: '',
    customers: [] as string[],
    goal: '',
    cta: '',
    highlights: '',
    feeling: ''
  });
  const [customCustomer, setCustomCustomer] = React.useState('');
  const [showCustomCustomerInput, setShowCustomCustomerInput] = React.useState(false);
  const [customCta, setCustomCta] = React.useState('');
  const [showCustomCtaInput, setShowCustomCtaInput] = React.useState(false);
  const [isGenerated, setIsGenerated] = React.useState(false);
  const [generatedPrompt, setGeneratedPrompt] = React.useState('');
  const [isEditingPrompt, setIsEditingPrompt] = React.useState(false);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-[90%] max-w-[520px] rounded-[24px] shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        onKeyDown={handleKeyDown}
      >
        {/* Progress Bar */}
        {!isGenerated && (
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--color-offwhite)]">
            <div 
              className="h-full bg-[var(--color-green-700)] transition-all duration-500 ease-out" 
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        )}

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--color-offwhite)] text-[var(--color-text-muted)] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 overflow-y-auto custom-scrollbar flex-grow">
          {!isGenerated ? (
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-1">
                <h2 className="text-[22px] font-semibold text-[var(--color-text-primary)] tracking-tight">Let's build your prompt</h2>
                <p className="text-[14px] text-[var(--color-text-muted)]">Answer a few quick questions (Step {currentStep}/6)</p>
              </div>

              {/* Step Content */}
              <div className="animate-in slide-in-from-right-8 duration-300">
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
                        <div className="flex gap-2 w-full">
                          <Input 
                            autoFocus
                            placeholder="Type customer type..."
                            className="h-10 bg-[var(--color-offwhite)] rounded-full text-[13px]"
                            value={customCustomer}
                            onChange={(e) => setCustomCustomer(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomCustomer()}
                          />
                          <Button onClick={addCustomCustomer} size="sm" className="rounded-full bg-[var(--color-green-700)]">Add</Button>
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
                        <div className="flex gap-2 w-full mt-2">
                          <Input 
                            autoFocus
                            placeholder="Type CTA text..."
                            className="h-10 bg-[var(--color-offwhite)] rounded-full text-[13px]"
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

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button 
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`text-[14px] font-medium flex items-center gap-2 transition-opacity ${currentStep === 1 ? 'opacity-0' : 'opacity-60 hover:opacity-100'}`}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
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
                  className="bg-[var(--color-green-700)] hover:bg-[var(--color-green-600)] text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-[var(--color-green-700)]/20 active:scale-[0.98] transition-all"
                >
                  {currentStep === 6 ? 'Build My Prompt ✦' : 'Next →'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-[20px] font-bold text-[var(--color-text-primary)]">Your prompt is ready</h2>
                <p className="text-[14px] text-[var(--color-text-muted)]">We've written this based on your answers</p>
              </div>

              <div className="bg-[var(--color-green-700)]/[0.06] border-l-[4px] border-[var(--color-green-700)] p-5 rounded-r-[12px] relative group">
                {isEditingPrompt ? (
                  <Textarea 
                    autoFocus
                    className="w-full min-h-[160px] bg-white border-[var(--color-border)] rounded-md text-[14px] leading-relaxed"
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                  />
                ) : (
                  <p className="text-[14px] text-[var(--color-text-primary)] leading-relaxed font-dm">
                    {generatedPrompt}
                  </p>
                )}
                {!isEditingPrompt && (
                  <button 
                    onClick={() => setIsEditingPrompt(true)}
                    className="absolute top-2 right-2 p-1.5 bg-white/50 backdrop-blur-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={() => onUsePrompt(generatedPrompt, answers.cta)}
                  className="bg-[var(--color-green-700)] hover:bg-[var(--color-green-600)] text-white font-bold h-12 rounded-xl text-[15px] shadow-xl shadow-[var(--color-green-700)]/20 active:scale-[0.98] transition-all"
                >
                  Use this prompt →
                </Button>
                <button 
                  onClick={() => setIsGenerated(false)} 
                  className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-medium transition-colors"
                >
                  Edit answers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
