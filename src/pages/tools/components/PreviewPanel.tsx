
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Code, Copy, Download, Check, AlertCircle, RotateCcw } from "lucide-react";

// Add highlight.js styles via CDN
const HLJS_STYLE = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";

interface PreviewPanelProps {
  html: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ html, isLoading, error, onRetry }) => {
  const [copied, setCopied] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (html && !isLoading) {
      // @ts-ignore
      if (window.hljs) {
        // @ts-ignore
        window.hljs.highlightAll();
      }
    }
  }, [html, isLoading]);

  const handleCopy = () => {
    if (html) {
      navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (html) {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'page.html';
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
        <div className="flex-grow space-y-6">
          <div className="h-12 w-3/4 bg-muted rounded-md mx-auto" />
          <div className="h-[200px] w-full bg-muted rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </div>
        <div className="mt-auto pt-6 text-center">
          <p className="text-lg font-syne font-bold text-primary animate-pulse">Generating your professional page...</p>
        </div>
      </Card>
    );
  }

  if (!html) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-12 bg-background border-2 border-dashed border-border/50 text-center group">
        <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-sm">
          <Laptop className="w-12 h-12 text-primary/40" />
        </div>
        <h3 className="text-2xl font-syne font-bold text-foreground mb-3">Generation Ready</h3>
        <p className="text-muted-foreground max-w-xs leading-relaxed">
          Fill out the form on the left to generate your custom WordPress-ready HTML page.
        </p>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between bg-background p-2 px-4 rounded-xl border border-border/50 shadow-sm">
        <h3 className="font-syne font-bold text-foreground">Output</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 h-9">
            {copied ? <Check className="w-4 h-4 text-[#047857]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 h-9">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      <Card className="flex-grow overflow-hidden border-2 border-border/50 shadow-card flex flex-col bg-white">
        <Tabs defaultValue="preview" className="flex flex-col h-full">
          <div className="px-4 py-2 border-b border-border/50 bg-gray-50/50 flex items-center justify-between">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-white">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2 data-[state=active]:bg-white">
                <Code className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live Preview
            </div>
          </div>

          <TabsContent value="preview" className="flex-grow m-0 p-0 overflow-hidden bg-white">
            <iframe
              ref={iframeRef}
              srcDoc={html}
              className="w-full h-full border-none"
              title="Generated Page Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </TabsContent>


          <TabsContent value="code" className="flex-grow m-0 p-4 overflow-auto bg-[#0f172a] text-slate-300 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
            <link rel="stylesheet" href={HLJS_STYLE} />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
            <pre className="whitespace-pre-wrap rounded-lg">
              <code className="language-html">{html}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

// Placeholder component for Laptop icon used in line 84
const Laptop = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m2 16 1.12-11.2a2 2 0 0 1 2-1.8h13.76a2 2 0 0 1 2 1.8l1.12 11.2" />
    <path d="M2 16h20" />
    <path d="M22 16v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2" />
  </svg>
);

export default PreviewPanel;
