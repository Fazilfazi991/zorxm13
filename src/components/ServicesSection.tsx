import { Search, MousePointerClick, Share2, Layout, FileText, Mail, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Search,
    title: "AI Agents & Automation",
    description: "Deploy custom-built AI agents that handle lead gen, customer support, and internal workflows while you sleep.",
    href: "/services/ai-agents",
  },
  {
    icon: MousePointerClick,
    title: "Social Media Management",
    description: "Results-first social strategy. We stop the scroll and turn followers into loyal, paying customers.",
    href: "/services/social-media",
  },
  {
    icon: Share2,
    title: "AI Video & Media Production",
    description: "Cinematic, AI-powered video content designed to dominate attention and drive high-intent traffic.",
    href: "/services/ai-video",
  },
  {
    icon: Layout,
    title: "SaaS & Software Development",
    description: "We build scalable software products and internal tools designed for speed, security, and exponential growth.",
    href: "/services/saas-software",
  },
  {
    icon: FileText,
    title: "Web Design & Development",
    description: "Stunning, high-conversion websites that blend premium aesthetics with ruthless technical performance.",
    href: "/services/web-design",
  },
  {
    icon: Mail,
    title: "Brand Identity & Strategy",
    description: "Making your brand unmistakable. We build deep strategy and visual identities for market leaders.",
    href: "/services/brand-identity",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding bg-secondary/50">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
            Our Services
          </div>
          <h2 className="heading-section text-foreground mb-4 tracking-tight">
            Our Core Specializations
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            We don't do everything. We only do what drives unfair growth for your brand.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className={`group relative p-8 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-up delay-${(index + 1) * 100} opacity-0`}
              style={{ animationFillMode: 'forwards' }}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {service.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="flex items-center text-primary font-medium group/link">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
