
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-up">
      <div className="space-y-4">
        <Label className="text-base font-bold text-foreground">Page Type</Label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'landing', label: 'Landing Page', icon: Layout },
            { id: 'about', label: 'About Page', icon: User },
            { id: 'portfolio', label: 'Portfolio Page', icon: Briefcase },
          ].map((item) => (
            <Card
              key={item.id}
              className={`p-4 cursor-pointer border-2 transition-all flex flex-col items-center justify-center gap-2 text-center h-28 ${
                pageType === item.id 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border/50 hover:border-primary/30'
              }`}
              onClick={() => setPageType(item.id as PageType)}
            >
              <item.icon className={`w-6 h-6 ${pageType === item.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-bold ${pageType === item.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="font-bold">Business Name</Label>
          <Input
            id="businessName"
            placeholder="e.g. Brew & Co Coffee"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            className="h-12 border-border/50 focus:border-primary/50 bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="font-bold">Business Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your business, what you do, who you serve..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="min-h-[120px] border-border/50 focus:border-primary/50 bg-background resize-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="font-bold">Tone</Label>
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${
                tone === item.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-accent/50 text-muted-foreground border-border/50 hover:bg-accent'
              }`}
              onClick={() => setTone(item.id as Tone)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="primaryColor" className="font-bold">Primary Color</Label>
          <div className="flex gap-2">
            <div 
              className="w-12 h-12 rounded-md border border-border/50 shadow-sm"
              style={{ backgroundColor: primaryColor }}
            />
            <Input
              id="primaryColor"
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-12 border-border/50 font-mono uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ctaText" className="font-bold">CTA Text</Label>
          <Input
            id="ctaText"
            placeholder="e.g. Book a Free Call"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="h-12 border-border/50"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-all duration-300 shadow-glow"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating Page...
          </span>
        ) : (
          'Generate My Page'
        )}
      </Button>
    </form>
  );
};

export default GeneratorForm;
