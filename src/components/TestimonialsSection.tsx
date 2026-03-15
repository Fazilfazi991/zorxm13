import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    content: "Zorx Media transformed our lead generation. Their custom AI agents handle 70% of our initial inquiries, and the engagement quality has been game-changing. Truly a partner, not just a vendor.",
    author: "Ahmed Al-Rashidi",
    position: "Founder, Desert Oasis Real Estate",
    rating: 5,
  },
  {
    content: "The BrandPilot platform they deployed for our social automation has been incredible. We're now posting daily across all platforms with zero manual work, and our reach is up 200%.",
    author: "Sarah Jenkins",
    position: "Marketing Director, Elite Hospitality",
    rating: 5,
  },
  {
    content: "From identity design to a full-scale SaaS launch in weeks. The speed and technical depth of the Zorx team is unmatched in the UAE market. They understand ambitious growth.",
    author: "Marcus Wong",
    position: "CTO, NexaFlow Systems",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
            Testimonials
          </div>
          <h2 className="heading-section text-foreground mb-4 tracking-tight">
            Client Results & Feedback
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            We let the work speak for itself. Here is what leading UAE brands have to say.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="group p-8 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 relative"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-12 h-12 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
