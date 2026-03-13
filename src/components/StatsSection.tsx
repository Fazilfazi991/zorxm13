const stats = [
  { value: "200%+", label: "Average ROI" },
  { value: "100+", label: "Successful Campaigns" },
  { value: "50+", label: "UAE Clients" },
  { value: "5+", label: "Years Experience" },
];

const StatsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-stats relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-foreground/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-primary-foreground/80 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
