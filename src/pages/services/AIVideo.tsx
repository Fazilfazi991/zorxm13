import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video, CheckCircle2 } from "lucide-react";

const AIVideo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex items-center bg-gradient-hero overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="section-container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm font-medium text-accent-foreground animate-fade-up">
                <Video className="w-4 h-4 text-primary" />
                AI Video & Media Production
              </div>

              <h1 className="heading-display text-foreground animate-fade-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                Next-Gen <span className="text-primary">AI Video</span> Production
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                Create stunning high-quality video content at scale using the latest AI-driven media production technologies. Faster, smarter, and more impactful.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
                <Button size="lg" className="group">
                  Start Your Project
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-card">
          <div className="section-container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="heading-section mb-6">Our Media Services</h2>
                <div className="space-y-4">
                  {[
                    "AI-Generated Video Commercials",
                    "Voiceover Synthesis & Localization",
                    "Automated Social Media Reels & Shorts",
                    "Virtual Avatars & Presenters",
                    "Advanced Video Editing & Post-Production",
                    "Custom Media Assets for Brands"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-8 border border-border/50">
                <h3 className="text-2xl font-bold mb-4">Revolutionize Your Content</h3>
                <p className="text-muted-foreground mb-6">
                  Leverage the power of AI to create professional videos without the traditional overhead. Our media production pipeline is optimized for quality and speed.
                </p>
                <Button variant="outline" className="w-full">View Our Portfolio</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AIVideo;
