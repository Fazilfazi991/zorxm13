
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  List, Code, Copy, Download, Check, AlertCircle, RotateCcw, 
  Info, Layout, FileJson, Sparkles, Smartphone, Monitor, 
  ExternalLink, Globe, ChevronRight, Loader2, Link2 
} from "lucide-react";
import { elementorToHtml } from '@/utils/elementorToHtml';
import { toElementorClipboard, downloadElementorJSON } from '@/utils/elementorExport';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

interface PreviewPanelProps {
  data: any;
  businessName: string;
  primaryColor: string;
  pageType: string;
  isLoading: boolean;
  loadingMessage?: string;
  error: string | null;
  onRetry: () => void;
}

interface WordPressPage {
  id: number;
  title: {
    rendered: string;
  };
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  data, 
  businessName = 'Business', 
  primaryColor = '#ff0000',
  pageType = 'page', 
  isLoading, 
  loadingMessage,
  error, 
  onRetry 
}) => {
  const [copied, setCopied] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  
  // WordPress Connection State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [siteUrl, setSiteUrl] = React.useState(() => localStorage.getItem('wpcraft_site_url') || '');
  const [nonce, setNonce] = React.useState('');
  const [pages, setPages] = React.useState<WordPressPage[]>([]);
  const [selectedPageId, setSelectedPageId] = React.useState<string>('');
  const [isFetchingPages, setIsFetchingPages] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [connError, setConnError] = React.useState<string | null>(null);

  const htmlPreview = React.useMemo(() => {
    if (!data) return '';
    return elementorToHtml(data, primaryColor, businessName);
  }, [data, primaryColor, businessName]);

  const handleCopyToElementor = () => {
    if (data) {
      try {
        const clipboardString = toElementorClipboard(data);
        navigator.clipboard.writeText(clipboardString);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  const handleDownload = () => {
    if (data) {
      downloadElementorJSON(data, businessName, pageType);
    }
  };

  const fetchPages = async (url: string) => {
    if (!url) return;
    setIsFetchingPages(true);
    setConnError(null);
    try {
      // Clean URL
      const cleanUrl = url.replace(/\/$/, '');
      const response = await fetch(`${cleanUrl}/wp-json/wp/v2/pages?per_page=20`);
      if (!response.ok) throw new Error('Could not connect to WordPress');
      const data = await response.json();
      setPages(data);
      localStorage.setItem('wpcraft_site_url', cleanUrl);
    } catch (err: any) {
      console.error("Fetch pages failed:", err);
      setConnError("Could not connect. Make sure WPCraft plugin is installed on your site.");
    } finally {
      setIsFetchingPages(false);
    }
  };

  const handleSendToWordPress = async () => {
    if (!siteUrl || !selectedPageId || !nonce) {
      setConnError("Please fill in all fields");
      return;
    }

    setIsSending(true);
    setConnError(null);

    try {
      const cleanUrl = siteUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanUrl}/wp-json/wpcraft/v1/inject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
          post_id: parseInt(selectedPageId),
          elements: data.content
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Invalid Nonce. Please check your WordPress admin page.");
        }
        throw new Error(result.message || "Failed to connect. Check your site URL and make sure WPCraft plugin is active.");
      }

      toast.success("Sent! Open the page in Elementor and right-click → Paste", {
        style: { background: '#16a34a', color: '#fff' }
      });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Send failed:", err);
      if (err.message.includes('Failed to fetch')) {
        setConnError("CORS error: WP REST API may be blocking requests. Add 'Header always set Access-Control-Allow-Origin \"*\"' to your .htaccess.");
      } else {
        setConnError(err.message);
      }
    } finally {
      setIsSending(false);
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

  if (!data) {
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
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-white p-4 px-6 rounded-[20px] border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
          <h3 className="font-semibold text-[15px] text-[var(--color-text-primary)]">AI Generation Ready</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="gap-2 h-10 shadow-sm rounded-[10px] px-6 bg-[#166534] hover:bg-[#14532d] text-white w-full sm:w-auto font-semibold"
          >
            <Globe className="w-4 h-4" />
            Send to WordPress
          </Button>
          <Button 
            onClick={handleCopyToElementor} 
            className={`gap-2 h-10 shadow-sm rounded-[10px] px-6 transition-all active:scale-[0.98] ${copied ? 'bg-green-600 hover:bg-green-600' : 'bg-[var(--color-green-700)] hover:bg-[var(--color-green-600)]'} text-white w-full sm:w-auto`}
          >
            {copied ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
            {copied ? 'Copied! Right-click → Paste from other site' : 'Copy for Elementor'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload} 
            className="gap-2 h-10 border-[var(--color-green-700)] text-[var(--color-green-700)] hover:bg-[var(--color-green-700)] hover:text-white transition-all rounded-[10px] px-4 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            JSON
          </Button>
        </div>
      </div>

      <Card className="flex-grow overflow-hidden border border-[var(--color-border)] shadow-sm flex flex-col bg-[var(--color-surface)] rounded-[20px]">
        <Tabs defaultValue="preview" className="flex flex-col h-full">
          <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between bg-white shrink-0 gap-4">
            <TabsList className="bg-[var(--color-offwhite)] p-1 rounded-xl h-10">
              <TabsTrigger value="preview" className="gap-2 px-5 h-8 transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--color-green-700)] data-[state=active]:shadow-sm rounded-lg text-sm font-medium">
                <Layout className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="sections" className="gap-2 px-5 h-8 transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--color-green-700)] data-[state=active]:shadow-sm rounded-lg text-sm font-medium">
                <List className="w-4 h-4" />
                Sections
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2 px-5 h-8 transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--color-green-700)] data-[state=active]:shadow-sm rounded-lg text-sm font-medium">
                <Code className="w-4 h-4" />
                JSON
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-1 bg-[var(--color-offwhite)] p-1 rounded-lg">
              <Button 
                variant={viewMode === 'desktop' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="w-8 h-8 rounded-md"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'mobile' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="w-8 h-8 rounded-md"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="preview" className="flex-grow m-0 p-0 overflow-hidden bg-[var(--color-offwhite)]/50 relative">
            <div className="h-full flex flex-col items-center">
              <div className="w-full flex-grow overflow-auto p-4 flex justify-center">
                <div 
                  className={`bg-white shadow-2xl transition-all duration-300 overflow-auto ${viewMode === 'mobile' ? 'w-[390px] border-[8px] border-slate-800 rounded-[40px] h-[700px]' : 'w-full h-[700px] rounded-lg'}`}
                >
                  <iframe 
                    srcDoc={htmlPreview}
                    className="w-full h-full border-none"
                    title="Elementor Page Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
              <div className="px-4 py-2 bg-white border-t border-[var(--color-border)] w-full text-center">
                <p className="text-[11px] text-[var(--color-text-muted)] font-medium italic">
                  Preview is approximate — final output may vary in Elementor
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sections" className="flex-grow m-0 p-5 overflow-auto custom-scrollbar bg-[var(--color-offwhite)]/30">
            <div className="space-y-4">
              {(data?.content || []).length > 0 ? (
                data.content.map((section: any, idx: number) => (
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
                <code>{JSON.stringify(data, null, 2)}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Import Instructions Panel */}
      <div className="space-y-4">
        <div className="p-6 bg-[rgba(22,101,52,0.06)] border-l-4 border-[var(--color-green-700)] rounded-[12px] flex gap-5 items-start shadow-sm shrink-0">
          <div className="p-2.5 rounded-xl bg-[var(--color-green-700)]/5 text-[var(--color-green-700)] shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-4">
            <h4 className="text-[15px] font-semibold text-[var(--color-text-primary)]">How to paste in Elementor:</h4>
            <ol className="grid gap-y-2.5 text-[13px] text-[var(--color-text-secondary)] list-decimal list-inside leading-loose">
              <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Click <span className="text-[var(--color-green-700)] font-bold">'Copy for Elementor'</span> above</li>
              <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Open your page in <span className="text-[var(--color-green-700)] font-bold">Elementor editor</span></li>
              <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Right-click <span className="text-[var(--color-green-700)] font-bold">anywhere on the canvas</span></li>
              <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Click <span className="text-[var(--color-green-700)] font-bold">'Paste from other site'</span></li>
              <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Press <span className="text-[var(--color-green-700)] font-bold">Ctrl+V (or Cmd+V on Mac)</span> in the popup</li>
              <li className="font-medium hover:text-[var(--color-text-primary)] transition-colors">Your full page appears instantly</li>
            </ol>
            
            <div style={{
              color: '#854F0B',
              background: '#FAEEDA',
              borderLeft: '3px solid #EF9F27',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              marginTop: '10px'
            }}>
              Make sure Elementor is updated to the latest version before pasting.
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <a 
            href="https://github.com/Fazilfazi991/zorxm13/raw/main/wordpress/wpcraft/wpcraft.zip" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-green-700)] transition-colors flex items-center gap-1.5 hover:underline"
          >
            <Globe className="w-3.5 h-3.5" />
            Don't have the plugin? Download WPCraft Plugin (free)
          </a>
        </div>
      </div>

      {/* WordPress Connect Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#166534]" />
              Send to WordPress
            </DialogTitle>
            <DialogDescription>
              Enter your site details to inject this layout directly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="siteUrl">WordPress Site URL</Label>
              <div className="relative">
                <Input
                  id="siteUrl"
                  placeholder="https://yoursite.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  onBlur={() => fetchPages(siteUrl)}
                  className="pl-9"
                />
                <Link2 className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageSelect">Which page to edit?</Label>
              <Select 
                value={selectedPageId} 
                onValueChange={setSelectedPageId}
                disabled={isFetchingPages || pages.length === 0}
              >
                <SelectTrigger id="pageSelect">
                  <SelectValue placeholder={isFetchingPages ? "Fetching pages..." : "Select a page"} />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id.toString()}>
                      {page.title.rendered}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="nonce">WordPress REST Nonce</Label>
                <span className="text-[10px] text-muted-foreground italic">Required for secure connection</span>
              </div>
              <Input
                id="nonce"
                placeholder="Get this from WPCraft plugin page"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 leading-relaxed">
                <Info className="w-3 h-3 shrink-0" />
                Find this in WordPress → WPCraft → Copy your site nonce
              </p>
            </div>

            {connError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-[12px] flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{connError}</p>
                  {connError.includes('installed') && (
                    <a 
                      href="https://github.com/Fazilfazi991/zorxm13/tree/main/wordpress/wpcraft" 
                      target="_blank" 
                      className="underline flex items-center gap-1 hover:text-destructive/80"
                    >
                      Download WPCraft Plugin <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleSendToWordPress} 
              disabled={isSending || !selectedPageId || !nonce || !siteUrl}
              className="bg-[#166534] hover:bg-[#14532d] text-white rounded-xl gap-2 min-w-[140px]"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send to Elementor
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreviewPanel;
