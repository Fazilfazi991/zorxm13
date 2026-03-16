
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Code, Copy, Download, Check, AlertCircle, RotateCcw, Info, Layout, FileJson } from "lucide-react";

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
  businessName = 'Business', 
  pageType = 'page', 
  isLoading, 
  loadingMessage,
  error, 
  onRetry 
}) => {
  const [copied, setCopied] = React.useState(false);

  const parsedJson = React.useMemo(() => {
    if (!json || typeof json !== 'string') return null;
    try {
      const data = JSON.parse(json);
      // Validate basic structure to prevent mapping over undefined
      if (!data || typeof data !== 'object') return null;
      return data;
    } catch (e) {
      console.error("Failed to parse Elementor JSON", e);
      return null;
    }
  }, [json]);

  const handleCopy = () => {
    if (json) {
      try {
        navigator.clipboard.writeText(json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  const handleDownload = () => {
    if (json) {
      try {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeBusinessName = (businessName || 'business').toLowerCase().replace(/\s+/g, '-');
        a.download = `elementor-${pageType || 'template'}-${safeBusinessName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed:", err);
      }
    }
  };

  if (error) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8 bg-[var(--color-surface)] border-2 border-destructive/20 text-center space-y-5 rounded-[20px] shadow-sm animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-[18px] font-bold text-[var(--color-text-primary)]">Generation Failed</h3>
          <p className="text-[14px] text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
            {error || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        <Button 
          onClick={() => onRetry?.()} 
          variant="outline" 
          className="gap-2 h-11 border-[var(--color-green-700)] text-[var(--color-green-700)] hover:bg-[var(--color-green-700)] hover:text-white transition-all rounded-xl"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px] shadow-sm overflow-hidden relative">
        <div className="flex flex-col items-center gap-6 z-10 text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[var(--color-green-700)]/10 border-t-[var(--color-green-700)] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[var(--color-green-700)] animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-[var(--color-text-primary)] animate-pulse tracking-tight">
              {loadingMessage || "Crafting your layout..."}
            </p>
            <p className="text-[13px] text-[var(--color-text-muted)]">This usually takes about 20 seconds</p>
          </div>
        </div>
        
        {/* Skeleton Preview Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none p-8 flex flex-col gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 w-full bg-slate-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (!json || !parsedJson) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px] shadow-sm text-center group">
        <div className="w-24 h-24 rounded-[32px] bg-[var(--color-offwhite)] flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-105 group-hover:bg-[var(--color-green-700)]/5 border border-transparent group-hover:border-[var(--color-green-700)]/10 shadow-sm">
          <FileJson className="w-12 h-12 text-[var(--color-green-700)] opacity-30 group-hover:opacity-60 transition-opacity" />
        </div>
        <div className="space-y-3">
          <h3 className="text-[20px] font-semibold text-[var(--color-text-secondary)]">Your page will appear here</h3>
          <p className="text-[14px] text-[var(--color-text-muted)] max-w-[280px] mx-auto leading-relaxed">
            Fill in the form and click <span className="text-[var(--color-green-700)] font-medium">Generate My Page</span> to get started
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between bg-white p-4 px-6 rounded-[20px] border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
          <h3 className="font-semibold text-[15px] text-[var(--color-text-primary)]">AI Generation Ready</h3>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy} 
            className="gap-2 h-10 border-[var(--color-green-700)] text-[var(--color-green-700)] hover:bg-[var(--color-green-700)] hover:text-white transition-all rounded-[10px] px-4"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </Button>
          <Button 
            size="sm" 
            onClick={handleDownload} 
            className="gap-2 h-10 bg-[var(--color-green-700)] hover:bg-[var(--color-green-600)] text-white shadow-sm rounded-[10px] px-5 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
        </div>
      </div>

      <Card className="flex-grow overflow-hidden border border-[var(--color-border)] shadow-sm flex flex-col bg-[var(--color-surface)] rounded-[20px]">
        <Tabs defaultValue="sections" className="flex flex-col h-full">
          <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between bg-white shrink-0">
            <TabsList className="bg-[var(--color-offwhite)] p-1 rounded-xl h-10">
              <TabsTrigger value="sections" className="gap-2 px-5 h-8 transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--color-green-700)] data-[state=active]:shadow-sm rounded-lg text-sm font-medium">
                <List className="w-4 h-4" />
                Sections
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2 px-5 h-8 transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--color-green-700)] data-[state=active]:shadow-sm rounded-lg text-sm font-medium">
                <Code className="w-4 h-4" />
                JSON
              </TabsTrigger>
            </TabsList>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-green-700)]/[0.04] border border-[var(--color-green-700)]/10 text-[10px] font-bold text-[var(--color-green-800)] uppercase tracking-wider">
              Elementor 0.4
            </div>
          </div>

          <TabsContent value="sections" className="flex-grow m-0 p-5 overflow-auto custom-scrollbar bg-[var(--color-offwhite)]/30">
            <div className="space-y-4">
              {(parsedJson?.content || []).length > 0 ? (
                parsedJson.content.map((section: any, idx: number) => (
                  <div key={idx} className="bg-white p-5 rounded-[16px] border border-[var(--color-border)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:border-[var(--color-green-700)]/20 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-offwhite)] flex items-center justify-center text-[var(--color-green-700)] border border-[var(--color-border)] group-hover:bg-[var(--color-green-700)]/[0.04] transition-colors">
                        <Layout className="w-5 h-5 opacity-70" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[15px] text-[var(--color-text-primary)] flex items-center gap-2 capitalize">
                          {section?.elements?.[0]?.elements?.[0]?.settings?.title || section?.elType || 'Section'} 
                          <span className="text-[10px] bg-[var(--color-offwhite)] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded-md border border-[var(--color-border)]">0{idx + 1}</span>
                        </h4>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-1 font-medium truncate">
                          {(section?.elements?.[0]?.elements || []).length} elite widgets identified
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end max-w-[200px]">
                      {(section?.elements?.[0]?.elements || []).map((widget: any, wIdx: number) => (
                        <span 
                          key={wIdx} 
                          className="px-2 py-0.5 rounded-md bg-[var(--color-offwhite)] text-[9px] font-bold text-[var(--color-green-700)]/60 border border-[var(--color-border)] uppercase tracking-wider"
                        >
                          {widget?.widgetType || 'widget'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-10 grayscale opacity-40">
                  <Layout className="w-10 h-10 mb-4" />
                  <p>No sections found in result</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="json" className="flex-grow m-0 p-0 overflow-hidden bg-[#0d1117] relative">
            <div className="h-full overflow-auto p-6 text-[#abb2bf] font-mono text-[11px] leading-relaxed custom-scrollbar">
              <pre className="whitespace-pre-wrap">
                <code>{JSON.stringify(parsedJson, null, 2)}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Import Instructions Panel */}
      <div className="p-6 bg-[rgba(22,101,52,0.06)] border-l-4 border-[var(--color-green-700)] rounded-[12px] flex gap-5 items-start shadow-sm shrink-0">
        <div className="p-2.5 rounded-xl bg-[var(--color-green-700)]/5 text-[var(--color-green-700)] shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-4">
          <h4 className="text-[15px] font-semibold text-[var(--color-text-primary)]">How to use this in WordPress:</h4>
          <ol className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-2.5 text-[13px] text-[var(--color-text-secondary)] list-decimal list-inside leading-loose">
            <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Open <span className="text-[var(--color-green-700)] font-bold">Elementor</span></li>
            <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Click folder icon</li>
            <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors"><span className="text-[var(--color-green-700)] font-bold">My Templates → Import</span></li>
            <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Upload <span className="text-[var(--color-green-700)] font-bold">JSON</span></li>
            <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Click <span className="text-[var(--color-green-700)] font-bold">Insert</span></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
