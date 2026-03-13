import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Users, Award, TrendingUp, MapPin, Heart, Lightbulb, Shield, Rocket, CheckCircle2 } from "lucide-react";

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex items-center bg-gradient-hero overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                    </div>

                    <div className="section-container relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm font-medium text-accent-foreground animate-fade-up">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                About ZORX
                            </div>

                            <h1 className="heading-display text-foreground animate-fade-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                Empowering Brands Through{" "}
                                <span className="text-primary">Digital Excellence</span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                We're a passionate team of digital marketing experts based in Dubai, dedicated to helping businesses achieve extraordinary growth through innovative strategies and data-driven solutions.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Our Story Section */}
                <section className="section-padding bg-background">
                    <div className="section-container">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            <div className="space-y-6">
                                <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground">
                                    Our Story
                                </div>

                                <h2 className="heading-section text-foreground">
                                    Building the Future of Digital Marketing in Dubai
                                </h2>

                                <div className="space-y-4 text-muted-foreground leading-relaxed">
                                    <p className="text-lg">
                                        Founded in the heart of Dubai, ZORX emerged from a simple yet powerful vision: to bridge the gap between traditional business practices and the digital-first world we live in today.
                                    </p>

                                    <p>
                                        What started as a small team of passionate marketers has grown into a full-service digital agency trusted by businesses across the UAE and beyond. We've helped startups find their voice, supported SMEs in scaling their operations, and partnered with enterprises to transform their digital presence.
                                    </p>

                                    <p>
                                        Our journey has been defined by one constant: an unwavering commitment to delivering measurable results. We don't just create campaigns—we build growth engines that drive real business outcomes.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4">
                                    <div className="flex items-center gap-2 text-primary font-semibold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>150+ Successful Projects</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary font-semibold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>50+ Happy Clients</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="aspect-square rounded-2xl bg-gradient-primary p-1">
                                            <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-5xl font-extrabold text-primary">5+</div>
                                                    <div className="text-sm text-muted-foreground font-medium">Years</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="aspect-square rounded-2xl bg-card border border-border/50 shadow-card p-6 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl font-extrabold text-primary">200%</div>
                                                <div className="text-sm text-muted-foreground font-medium mt-2">Avg ROI</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-8">
                                        <div className="aspect-square rounded-2xl bg-card border border-border/50 shadow-card p-6 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl font-extrabold text-primary">24/7</div>
                                                <div className="text-sm text-muted-foreground font-medium mt-2">Support</div>
                                            </div>
                                        </div>
                                        <div className="aspect-square rounded-2xl bg-gradient-primary p-1">
                                            <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-5xl font-extrabold text-primary">15+</div>
                                                    <div className="text-sm text-muted-foreground font-medium">Experts</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision Section */}
                <section className="section-padding bg-gray-50">
                    <div className="section-container">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-6">
                                Our Purpose
                            </div>
                            <h2 className="heading-section text-foreground mb-4">
                                Mission & Vision
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Guided by purpose, driven by results
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="group p-8 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <Target className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    To empower businesses of all sizes with cutting-edge digital marketing strategies that drive measurable growth, foster meaningful connections with their audiences, and deliver exceptional ROI. We're committed to being more than just a service provider—we're your growth partner.
                                </p>
                            </div>

                            <div className="group p-8 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <Rocket className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    To be the most trusted and innovative digital marketing agency in the Middle East, recognized for transforming businesses through creative excellence, technological innovation, and unwavering dedication to client success. We envision a future where every business can harness the full potential of digital marketing.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Values Section */}
                <section className="section-padding bg-background">
                    <div className="section-container">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-6">
                                What Drives Us
                            </div>
                            <h2 className="heading-section text-foreground mb-4">
                                Our Core Values
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                The principles that guide everything we do
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: TrendingUp,
                                    title: "Results-Driven",
                                    description: "We measure success by your growth. Every strategy is designed to deliver tangible, measurable outcomes."
                                },
                                {
                                    icon: Lightbulb,
                                    title: "Innovation First",
                                    description: "We stay ahead of digital trends, constantly evolving our methods to give you a competitive edge."
                                },
                                {
                                    icon: Shield,
                                    title: "Transparency",
                                    description: "Clear communication, honest reporting, and full visibility into your campaigns and results."
                                },
                                {
                                    icon: Heart,
                                    title: "Client Success",
                                    description: "Your success is our success. We're invested in your growth and celebrate your wins as our own."
                                }
                            ].map((value, index) => (
                                <div
                                    key={value.title}
                                    className="group p-6 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <value.icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="section-padding bg-gray-50">
                    <div className="section-container">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-6">
                                The ZORX Advantage
                            </div>
                            <h2 className="heading-section text-foreground mb-4">
                                Why Partner With Us?
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                What sets us apart in the digital marketing landscape
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: MapPin,
                                    title: "Dubai Market Expertise",
                                    description: "Deep understanding of the UAE market, local consumer behavior, and regional digital trends that drive success."
                                },
                                {
                                    icon: Users,
                                    title: "Expert Team",
                                    description: "Certified specialists in SEO, PPC, social media, content marketing, and analytics working together for your success."
                                },
                                {
                                    icon: Award,
                                    title: "Proven Track Record",
                                    description: "150+ successful campaigns, 50+ satisfied clients, and an average 200% ROI speak to our commitment to excellence."
                                }
                            ].map((item, index) => (
                                <div
                                    key={item.title}
                                    className="p-8 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6">
                                        <item.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-4">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section-padding bg-gradient-primary">
                    <div className="section-container">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <h2 className="heading-section text-white">
                                Ready to Transform Your Digital Presence?
                            </h2>
                            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                                Let's discuss how we can help your business achieve its digital marketing goals and drive sustainable growth.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button variant="secondary" size="lg" className="group">
                                    Get Started Today
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                    Schedule a Call
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default AboutUs;
