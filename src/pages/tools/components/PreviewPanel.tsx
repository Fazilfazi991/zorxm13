
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Code, Copy, Download, Check, AlertCircle, RotateCcw, Info, HelpCircle } from "lucide-react";

interface PreviewPanelProps {
  json: string | null;
  businessName: string;
  pageType: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ json, businessName, pageType, isLoading, error, onRetry }) => {
  const [copied, setCopied] = React.useState(false);

  const parsedJson = React.useMemo(() => {
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error("Failed to parse Elementor JSON", e);
      return null;
    }
  }, [json]);

  const handleCopy = () => {
    if (json) {
      navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elementor-${pageType}-${businessName.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (error) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8 bg-background border-2 border-destructive/20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Generation Failed</h3>
        <p className="text-muted-foreground max-w-sm">{error}</p>
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Retry Generating
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col p-6 bg-background/50 border-2 border-dashed border-border/50 animate-pulse overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 bg-muted rounded-md" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted rounded-md" />
            <div className="h-9 w-24 bg-muted rounded-md" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 w-full bg-muted rounded-xl" />
          ))}
        </div>
        <div className="mt-auto pt-6 text-center">
          <p className="text-lg font-syne font-bold text-primary animate-pulse">Building your Elementor template...</p>
        </div>
      </Card>
    );
  }

  if (!json) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-12 bg-background border-2 border-dashed border-border/50 text-center group">
        <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-sm">
          <HelpCircle className="w-12 h-12 text-primary/40" />
        </div>
        <h3 className="text-2xl font-syne font-bold text-foreground mb-3">Generation Ready</h3>
        <p className="text-muted-foreground max-w-xs leading-relaxed">
          Fill out the form to generate a professional Elementor JSON template for your WordPress site.
        </p>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between bg-background p-2 px-4 rounded-xl border border-border/50 shadow-sm">
        <h3 className="font-syne font-bold text-foreground">AI Generation Results</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 h-9 border-primary/20 hover:border-primary/40">
            {copied ? <Check className="w-4 h-4 text-[#047857]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Elementor JSON'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownload} className="gap-2 h-9 shadow-glow">
            <Download className="w-4 h-4" />
            Download .json
          </Button>
        </div>
      </div>

      <Card className="flex-grow overflow-hidden border-2 border-border/50 shadow-card flex flex-col bg-slate-50">
        <Tabs defaultValue="breakdown" className="flex flex-col h-full">
          <div className="px-4 py-2 border-b border-border/50 bg-white flex items-center justify-between">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="breakdown" className="gap-2 data-[state=active]:bg-white">
                <List className="w-4 h-4" />
                Section Breakdown
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2 data-[state=active]:bg-white">
                <Code className="w-4 h-4" />
                Raw JSON
              </TabsTrigger>
            </TabsList>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Elementor v0.4
            </div>
          </div>

          <TabsContent value="breakdown" className="flex-grow m-0 p-4 overflow-auto scrollbar-thin">
            <div className="space-y-4">
              {parsedJson?.content?.map((section: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-border/50 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground capitalize">
                        {section.settings?.title || `Section ${idx + 1}`}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {section.elements?.[0]?.elements?.length || 0} widget(s) in this section
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {section.elements?.[0]?.elements?.map((widget: any, wIdx: number) => (
                      <div 
                        key={wIdx} 
                        className="px-2 py-1 rounded-md bg-secondary text-[10px] font-medium text-primary/70 uppercase"
                        title={widget.widgetType}
                      >
                        {widget.widgetType}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {!parsedJson && (
                <div className="text-center py-12 text-muted-foreground italic">
                  Visual breakdown unavailable for this format.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex-grow m-0 p-4 overflow-auto bg-[#0f172a] text-slate-300 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
            <pre className="whitespace-pre-wrap">
              <code className="language-json">{JSON.stringify(parsedJson, null, 2)}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Import Instructions Panel */}
      <Card className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-4 items-start shadow-sm">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-primary">How to import into WordPress:</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In WordPress → <span className="text-foreground font-medium">Edit with Elementor</span> → 
            Click the <span className="text-foreground font-medium">Add Template</span> icon (folder) → 
            Go to <span className="text-foreground font-medium">My Templates</span> → 
            Click <span className="text-foreground font-medium">Import</span> (top right arrow) → 
            Upload this <span className="text-foreground font-medium">.json</span> file.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PreviewPanel;
