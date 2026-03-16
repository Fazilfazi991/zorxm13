
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Code, Copy, Download, Check, AlertCircle, RotateCcw, Info, Layout } from "lucide-react";

interface PreviewPanelProps {
  json: string | null;
  businessName: string;
  pageType: string;
  isLoading: boolean;
  loadingMessage?: string;
  error: string | null;
  onRetry: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  json, 
  businessName, 
  pageType, 
  isLoading, 
  loadingMessage,
  error, 
  onRetry 
}) => {
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
      const safeBusinessName = businessName.toLowerCase().replace(/\s+/g, '-');
      a.download = `elementor-${pageType}-${safeBusinessName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (error) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8 bg-background border-2 border-destructive/20 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Generation Failed</h3>
        <p className="text-muted-foreground max-w-sm">{error}</p>
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col p-6 bg-background/50 border-2 border-dashed border-border/50 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8 opacity-50">
          <div className="h-8 w-32 bg-muted rounded-md animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
            <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
        <div className="space-y-4 flex-grow">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-full bg-muted/60 rounded-xl animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px]">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-xl font-syne font-bold text-primary animate-bounce tracking-tight">
            {loadingMessage || "Crafting your layout..."}
          </p>
        </div>
      </Card>
    );
  }

  if (!json) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-12 bg-background border-2 border-dashed border-border/50 text-center group">
        <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-sm">
          <Layout className="w-12 h-12 text-primary/40" />
        </div>
        <h3 className="text-2xl font-syne font-bold text-foreground mb-3">Generation Ready</h3>
        <p className="text-muted-foreground max-w-xs leading-relaxed">
          Configure your page and elite AI will craft your Elementor template instantly.
        </p>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between bg-white p-3 px-5 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-syne font-bold text-foreground">Generation Complete</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 h-10 border-primary/10 hover:bg-primary/5 transition-all">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-primary" />}
            {copied ? 'Copied!' : 'Copy Elementor JSON'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownload} className="gap-2 h-10 shadow-glow">
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
        </div>
      </div>

      <Card className="flex-grow overflow-hidden border border-border/60 shadow-card flex flex-col bg-slate-50/50">
        <Tabs defaultValue="sections" className="flex flex-col h-full">
          <div className="px-4 py-3 border-b border-border/50 bg-white/80 backdrop-blur-md flex items-center justify-between">
            <TabsList className="bg-muted/60 p-1 rounded-lg">
              <TabsTrigger value="sections" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
                <List className="w-4 h-4" />
                Sections
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
                <Code className="w-4 h-4" />
                JSON
              </TabsTrigger>
            </TabsList>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest">
              Elementor v0.4
            </div>
          </div>

          <TabsContent value="sections" className="flex-grow m-0 p-5 overflow-auto scrollbar-thin">
            <div className="space-y-3">
              {parsedJson?.content?.map((section: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-border/40 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/5 group-hover:bg-primary/10">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2 capitalize">
                        {section.elements?.[0]?.elements?.[0]?.settings?.title || section.elType} Section
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">#{section.id || idx + 1}</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {section.elements?.[0]?.elements?.length || 0} elite widgets identified
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end max-w-[200px]">
                    {section.elements?.[0]?.elements?.map((widget: any, wIdx: number) => (
                      <span 
                        key={wIdx} 
                        className="px-2 py-0.5 rounded-md bg-secondary/50 text-[9px] font-bold text-primary/60 border border-primary/5 uppercase"
                      >
                        {widget.widgetType}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="json" className="flex-grow m-0 p-0 overflow-hidden bg-[#0d1117]">
            <div className="h-full overflow-auto p-6 text-slate-300 font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
              <pre className="whitespace-pre-wrap">
                <code className="language-json">{JSON.stringify(parsedJson, null, 2)}</code>
              </pre>
            </div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Import Instructions Panel */}
      <Card className="p-5 bg-primary/[0.03] border border-primary/10 rounded-[1.5rem] flex gap-5 items-start shadow-sm">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-glow">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-syne font-bold text-primary">How to use this in WordPress:</h4>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-[11px] text-muted-foreground list-decimal list-inside leading-relaxed decoration-primary/20">
            <li className="font-medium hover:text-foreground transition-colors">Open your page in <span className="text-primary/80">Elementor</span></li>
            <li className="font-medium hover:text-foreground transition-colors">Click the folder icon <span className="text-primary/80">(Add Template)</span></li>
            <li className="font-medium hover:text-foreground transition-colors">Go to <span className="text-primary/80">My Templates → Import</span></li>
            <li className="font-medium hover:text-foreground transition-colors">Upload the downloaded <span className="text-primary/80">JSON</span> file</li>
            <li className="font-medium hover:text-foreground transition-colors">Click <span className="text-primary/80">Insert</span> — ready to edit!</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default PreviewPanel;
