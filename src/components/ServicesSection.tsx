import { Search, MousePointerClick, Share2, Layout, FileText, Mail, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Search,
    title: "Search Engine Optimization (SEO)",
    description: "Improve rankings, visibility, and organic traffic with data-driven SEO strategies tailored for the UAE market.",
  },
  {
    icon: MousePointerClick,
    title: "Google Ads & PPC",
    description: "High-converting paid campaigns with measurable ROI. We optimize every dirham of your ad spend.",
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    description: "Grow your brand on Instagram, Facebook, LinkedIn & TikTok with engaging content and targeted campaigns.",
  },
  {
    icon: Layout,
    title: "Website Design & CRO",
    description: "Conversion-optimized websites that drive leads and sales. Beautiful, fast, and built for results.",
  },
  {
    icon: FileText,
    title: "Content Marketing",
    description: "Strategic content that builds authority and trust. From blogs to videos, we tell your brand story.",
  },
  {
    icon: Mail,
    title: "Email & Automation",
    description: "Nurture leads and increase customer lifetime value with smart email sequences and automation.",
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
          <h2 className="heading-section text-foreground mb-4">
            Our Digital Marketing Services
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive digital solutions designed to grow your business and maximize your online presence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative p-8 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
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

                <div className="flex items-center text-primary font-medium group/link cursor-pointer">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
