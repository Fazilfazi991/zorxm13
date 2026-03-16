
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Layout, User, Briefcase, Zap, Heart, Flame, Laptop } from "lucide-react";

export type PageType = 'landing' | 'about' | 'portfolio';
export type Tone = 'professional' | 'friendly' | 'bold' | 'minimal';

interface GeneratorFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onSubmit, isLoading }) => {
  const [pageType, setPageType] = React.useState<PageType>('landing');
  const [businessName, setBusinessName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tone, setTone] = React.useState<Tone>('professional');
  const [primaryColor, setPrimaryColor] = React.useState('#6C63FF');
  const [ctaText, setCtaText] = React.useState('Get Started');

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
          <Label htmlFor="description" className="text-[14px] font-semibold text-[var(--color-text-primary)]">Description</Label>
          <Textarea
            id="description"
            placeholder="What does your business do? Who is your audience?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={`min-h-[100px] py-3 resize-none ${inputStyles}`}
          />
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
    </form>
  );
};

export default GeneratorForm;
