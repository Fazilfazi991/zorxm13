import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    content: "ZORX helped us triple our leads within 3 months. Their data-driven approach and deep understanding of the Dubai market made all the difference. Highly recommended for any business looking to scale digitally.",
    author: "Ahmed Al-Rashid",
    position: "CEO, TechStart Dubai",
    rating: 5,
  },
  {
    content: "Working with ZORX transformed our online presence completely. Their SEO strategies got us ranking on the first page for all our key terms. The ROI has been incredible.",
    author: "Sarah Mitchell",
    position: "Marketing Director, Luxe Properties",
    rating: 5,
  },
  {
    content: "The team at ZORX doesn't just run campaigns—they become true partners in your growth. Their transparent reporting and strategic insights have been invaluable to our e-commerce business.",
    author: "Mohammed Hassan",
    position: "Founder, Emirates Fashion Co.",
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
          <h2 className="heading-section text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it—hear from the brands we've helped grow.
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
