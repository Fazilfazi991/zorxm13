import { Check } from "lucide-react";

const reasons = [
  "Local Dubai market knowledge",
  "Data-driven decision making",
  "Transparent pricing & reporting",
  "Customized strategies (not templates)",
  "Dedicated account managers",
  "Proven track record of success",
];

const WhyChooseSection = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Visual */}
          <div className="relative">
            <div className="aspect-square max-w-lg mx-auto">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl rotate-3 opacity-10" />
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl -rotate-3 opacity-5" />

              {/* Main card */}
              <div className="relative bg-card rounded-3xl p-8 shadow-card h-full flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">100%</div>
                      <div className="text-muted-foreground">Client Satisfaction</div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-primary">50+</div>
                      <div className="text-sm text-muted-foreground">UAE Clients</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">5+</div>
                      <div className="text-sm text-muted-foreground">Years Experience</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">100+</div>
                      <div className="text-sm text-muted-foreground">Campaigns</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">200%</div>
                      <div className="text-sm text-muted-foreground">Avg. ROI</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground">
              Why ZORX
            </div>

            <h2 className="heading-section text-foreground">
              Why Brands Choose ZORX
            </h2>

            <p className="text-lg text-muted-foreground">
              We're not just another digital marketing agency. We're your growth partners, committed to delivering measurable results that impact your bottom line.
            </p>

            <div className="space-y-4">
              {reasons.map((reason) => (
                <div key={reason} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
