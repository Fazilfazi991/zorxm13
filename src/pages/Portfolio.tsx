import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioGrid from "@/components/PortfolioGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Portfolio = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main>
                {/* Page Hero */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-gradient-hero overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                    </div>

                    <div className="section-container relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm font-medium text-accent-foreground animate-fade-up">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Showcasing Our Success
                            </div>

                            <h1 className="heading-display text-foreground animate-fade-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                Our <span className="text-secondary-foreground">Creative</span> Works & <span className="text-primary">Impactful</span> Results
                            </h1>

                            <p className="text-xl text-muted-foreground animate-fade-up delay-200 opacity-0 max-w-2xl mx-auto" style={{ animationFillMode: 'forwards' }}>
                                We help ambitious brands in the UAE and beyond achieve extraordinary growth through data-driven digital marketing and premium design.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Portfolio Grid Section */}
                <section className="py-24 md:py-32">
                    <div className="section-container">
                        <PortfolioGrid />
                    </div>
                </section>

                {/* Dynamic CTA */}
                <section className="section-padding bg-primary text-white">
                    <div className="section-container">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="max-w-2xl text-center md:text-left">
                                <h2 className="text-3xl md:text-5xl font-bold mb-6">Want to see your brand here?</h2>
                                <p className="text-xl text-white/80">Let's build a digital strategy that drives real growth for your business.</p>
                            </div>
                            <Button size="lg" variant="secondary" className="group text-lg px-8 h-14">
                                Start Your Project
                                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Portfolio;
