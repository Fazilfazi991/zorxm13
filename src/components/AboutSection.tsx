import { MapPin, Target, Users, FileText } from "lucide-react";

const highlights = [
  { icon: MapPin, label: "Dubai Market Experts" },
  { icon: Target, label: "ROI-Focused Strategies" },
  { icon: Users, label: "Certified Digital Specialists" },
  { icon: FileText, label: "Transparent Reporting" },
];

const AboutSection = () => {
  return (
    <section id="about" className="section-padding bg-gray-50">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Content */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground">
              About Us
            </div>

            <h2 className="heading-section text-foreground">
              Who We Are
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              ZORX is a Dubai-based digital marketing agency specializing in performance-focused marketing solutions. We combine creativity, analytics, and technology to deliver measurable results for brands across the UAE.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              With deep expertise in the Gulf market and a passion for digital innovation, we craft strategies that don't just look good—they drive real business growth. From startups to enterprises, we've helped businesses across every industry achieve their digital ambitions.
            </p>
          </div>

          {/* Right - Image Visual */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
                alt="Zorx Modern Office"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/10" />
            </div>

            {/* Experience Card Overlay */}
            <div className="absolute -bottom-6 -right-6 bg-primary p-8 rounded-2xl shadow-xl text-white z-20 animate-float">
              <div className="text-4xl font-bold mb-1">10+</div>
              <div className="text-sm font-medium opacity-80 uppercase tracking-wider">Years Experience</div>
            </div>

            {/* Decorative blob */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
