import { Lightbulb, Target, Rocket, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Discover",
    description: "We dive deep into understanding your business, goals, target audience, and competitive landscape.",
  },
  {
    number: "02",
    icon: Target,
    title: "Strategize",
    description: "We build a custom growth plan tailored to your unique needs and market opportunities.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Execute",
    description: "We launch and optimize campaigns with precision, ensuring every element works towards your goals.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Scale",
    description: "We track, analyze, and continuously improve to maximize your ROI and drive sustainable growth.",
  },
];

const ProcessSection = () => {
  return (
    <section className="section-padding bg-secondary/50">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
            Our Process
          </div>
          <h2 className="heading-section text-foreground mb-4">
            Our Proven Process
          </h2>
          <p className="text-lg text-muted-foreground">
            A systematic approach to digital success that has helped dozens of UAE businesses achieve their goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                </div>
              )}

              <div className="relative bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-4xl font-extrabold text-primary/20">{step.number}</span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>

                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
