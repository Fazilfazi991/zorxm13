import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layout, CheckCircle2 } from "lucide-react";

const WebDesign = () => {
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
                <Layout className="w-4 h-4 text-primary" />
                Web Design & Development
              </div>

              <h1 className="heading-display text-foreground animate-fade-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                Stunning <span className="text-primary">Web Experiences</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                We create conversion-optimized websites that look beautiful and perform even better. Fast, responsive, and built for results.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
                <Button size="lg" className="group">
                  Start Your Web Project
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
                <h2 className="heading-section mb-6">Our Web Services</h2>
                <div className="space-y-4">
                  {[
                    "Custom Website Design",
                    "Responsive Web Development",
                    "E-commerce (Shopify, WooCommerce, Custom)",
                    "Performance Optimization (Speed)",
                    "CMS Implementation (WordPress, Headless)",
                    "UI/UX Design & Prototyping"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-8 border border-border/50">
                <h3 className="text-2xl font-bold mb-4">Built for Conversion</h3>
                <p className="text-muted-foreground mb-6">
                  A website should be more than just a digital brochure. We build tools that drive business growth and user engagement.
                </p>
                <Button variant="outline" className="w-full">Request a Proposal</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WebDesign;
