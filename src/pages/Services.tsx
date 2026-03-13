import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, MousePointerClick, Share2, Layout, FileText, Mail, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
    {
        icon: Search,
        title: "Search Engine Optimization (SEO)",
        description: "Improve rankings, visibility, and organic traffic with data-driven SEO strategies tailored for the UAE market.",
        features: ["Keyword Research", "On-Page Optimization", "Technical SEO", "Monthly Reporting"],
        image: "https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?q=80&w=800&auto=format&fit=crop"
    },
    {
        icon: MousePointerClick,
        title: "Google Ads & PPC",
        description: "High-converting paid campaigns with measurable ROI. We optimize every dirham of your ad spend.",
        features: ["Search Ads", "Display Ads", "Remarketing", "Conversion Tracking"],
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
    },
    {
        icon: Share2,
        title: "Social Media Marketing",
        description: "Grow your brand on Instagram, Facebook, LinkedIn & TikTok with engaging content and targeted campaigns.",
        features: ["Content Calendar", "Community Management", "Paid Social Ads", "Influencer Outreach"],
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop"
    },
    {
        icon: Layout,
        title: "Website Design & CRO",
        description: "Conversion-optimized websites that drive leads and sales. Beautiful, fast, and built for results.",
        features: ["Responsive Design", "UX/UI Audit", "A/B Testing", "Speed Optimization"],
        image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=800&auto=format&fit=crop"
    },
    {
        icon: FileText,
        title: "Content Marketing",
        description: "Strategic content that builds authority and trust. From blogs to videos, we tell your brand story.",
        features: ["Blog Writing", "Video Production", "Case Studies", "Copywriting"],
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
    },
    {
        icon: Mail,
        title: "Email & Automation",
        description: "Nurture leads and increase customer lifetime value with smart email sequences and automation.",
        features: ["Drip Campaigns", "Newsletter Setup", "Split Testing", "Segmentation"],
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop"
    },
];

const Services = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1451187534959-52561c7d3b6e?q=80&w=1200&auto=format&fit=crop"
                            alt="Digital Growth Background"
                            className="w-full h-full object-cover opacity-10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
                    </div>

                    <div className="section-container relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm font-medium text-accent-foreground animate-fade-up">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Growth-Focused Solutions
                            </div>

                            <h1 className="heading-display text-foreground animate-fade-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                                Powerful <span className="text-primary">Digital Services</span> to Scale Your Brand
                            </h1>

                            <p className="text-xl text-muted-foreground animate-fade-up delay-200 opacity-0 max-w-2xl mx-auto" style={{ animationFillMode: 'forwards' }}>
                                We provide comprehensive digital marketing solutions tailored to the unique dynamics of the UAE market.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-24 md:py-32">
                    <div className="section-container">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <div
                                    key={service.title}
                                    className="group relative bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
                                >
                                    {/* Service Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                                        <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                            <service.icon className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6 flex-grow flex flex-col">
                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                {service.title}
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed line-clamp-2">
                                                {service.description}
                                            </p>
                                        </div>

                                        <ul className="space-y-3 flex-grow">
                                            {service.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="pt-4">
                                            <Button variant="outline" className="w-full group/btn border-primary/20 hover:border-primary hover:bg-primary/5">
                                                Learn More
                                                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section-padding bg-primary text-white">
                    <div className="section-container">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="max-w-2xl text-center md:text-left">
                                <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to accelerate your growth?</h2>
                                <p className="text-xl text-white/80">Get a custom strategy built for your business goals and market competition.</p>
                            </div>
                            <Button size="lg" variant="secondary" className="group text-lg px-8 h-14">
                                Book a Free Audit
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

export default Services;
