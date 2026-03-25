import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  badgeText?: string;
  imageSrc?: string;
  logoSrc?: string;
  navLinks?: string[];
  stats?: { value: string; label: string }[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
}

export default function RestaurantHero1({
  headline = "Savor the Extraordinary",
  subheadline = "Experience culinary mastery where every dish tells a story of passion and flavor. Reserve your table for an unforgettable evening.",
  ctaPrimary = "Book a Table",
  ctaSecondary = "View Menu",
  badgeText = "Michelin Guide 2024",
  imageSrc = "https://placehold.co/1200x800/1a1a1a/ffffff?text=Fine+Dining",
  logoSrc = "https://placehold.co/120x40/000000/ffffff?text=LOGO",
  navLinks = ["Menu", "Reservations", "Private Dining", "Location"],
  stats = [
    { value: "15+", label: "Years of Excellence" },
    { value: "4.9★", label: "Guest Reviews" },
    { value: "500+", label: "Curated Wines" }
  ],
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-black font-sans">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={imageSrc} 
          alt="Restaurant background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Navigation Layer */}
      <div className="absolute top-0 w-full px-6 py-6 z-20 flex justify-between items-center">
        <img src={logoSrc.replace('000000', 'transparent')} alt="Logo" className="h-8 md:h-10 opacity-90 brightness-0 invert" />
        <nav className="hidden md:flex space-x-8 text-white/90 text-sm font-medium">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white max-w-4xl flex flex-col items-center">
        {badgeText && (
          <div className="mb-6 inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm font-medium tracking-wide uppercase">
            {badgeText}
          </div>
        )}
        
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 leading-tight">
          {headline}
        </h1>
        
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-16">
          <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-medium text-lg hover:bg-gray-100 transition-colors">
            {ctaPrimary}
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-full border border-white text-white font-medium text-lg hover:bg-white/10 transition-colors">
            {ctaSecondary}
          </button>
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-3 gap-8 md:gap-16 pt-12 border-t border-white/20 w-full max-w-3xl">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</span>
                <span className="text-xs md:text-sm text-white/60 tracking-wider uppercase mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
