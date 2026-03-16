import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SEOCopilotTools from "./pages/SEOCopilot";
import AIAgents from "./pages/services/AI-Agents";
import SocialMedia from "./pages/services/SocialMedia";
import AIVideo from "./pages/services/AIVideo";
import SaaS from "./pages/services/SaaS";
import WebDesign from "./pages/services/WebDesign";
import BrandIdentity from "./pages/services/BrandIdentity";
import FreeTools from "./pages/FreeTools";
import PageGenerator from "./pages/tools/PageGenerator";
import Blogs from "./pages/Blogs";
import WhatsAppButton from "./components/WhatsAppButton";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WhatsAppButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/ai-agents" element={<AIAgents />} />
          <Route path="/services/social-media" element={<SocialMedia />} />
          <Route path="/services/ai-video" element={<AIVideo />} />
          <Route path="/services/saas-software" element={<SaaS />} />
          <Route path="/services/web-design" element={<WebDesign />} />
          <Route path="/services/brand-identity" element={<BrandIdentity />} />
          <Route path="/free-tools" element={<FreeTools />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/seo-tools" element={<SEOCopilotTools />} />
          <Route 
            path="/ai-generator" 
            element={
              <ErrorBoundary>
                <PageGenerator />
              </ErrorBoundary>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
