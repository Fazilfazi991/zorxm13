import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, CheckCircle2 } from "lucide-react";

const SaaS = () => {
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
                <Code className="w-4 h-4 text-primary" />
                SaaS & Software Development
              </div>

              <h1 className="heading-display text-foreground animate-fade-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                Build <span className="text-primary">Scalable SaaS</span> Solutions
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                From MVP to enterprise-level software, we design and build robust, scalable, and secure SaaS products that solve real problems.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
                <Button size="lg" className="group">
                  Discuss Your Project
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
                <h2 className="heading-section mb-6">Software Development Expertise</h2>
                <div className="space-y-4">
                  {[
                    "SaaS Architecture & Development",
                    "Custom Enterprise Software",
                    "Cloud-Native Solutions",
                    "API Integration & Development",
                    "Full-Stack Development (React, Node.js, etc.)",
                    "Software MVP Development"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-8 border border-border/50">
                <h3 className="text-2xl font-bold mb-4">Cloud-Ready Solutions</h3>
                <p className="text-muted-foreground mb-6">
                  We build with the future in mind. Our software is designed to scale seamlessly as your user base and requirements grow.
                </p>
                <Button variant="outline" className="w-full">See Our Tech Stack</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SaaS;
