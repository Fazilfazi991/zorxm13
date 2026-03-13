import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-secondary/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-section text-foreground mb-6">
            Ready to Grow Your Business Online?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10">
            Let's build a digital strategy that delivers real results. Schedule a free consultation with our team and discover how we can accelerate your growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="group">
              Book a Free Consultation
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="lg">
              Contact Us
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No commitment required • 30-minute strategy session • 100% free
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
