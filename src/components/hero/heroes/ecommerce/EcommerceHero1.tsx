import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  badgeText?: string;
  imageSrc?: string;
  navLinks?: string[];
}

export default function EcommerceHero1({
  headline = "Your everyday essentials, elevated.",
  subheadline = "Discover our new collection of sustainably crafted goods designed for modern living.",
  ctaPrimary = "Shop Now",
  ctaSecondary = "View Lookbook",
  badgeText = "Summer Collection",
  imageSrc = "https://placehold.co/1920x1080/f3f4f6/1f2937?text=Lifestyle+Product+Shot",
  navLinks = ["New Arrivals", "Best Sellers", "Collections", "About"]
}: HeroProps) {
  const trustBadges = [
    { text: "Free Shipping Over $50", icon: "🚚" },
    { text: "Sustainably Made", icon: "🌱" },
    { text: "30-Day Returns", icon: "↩️" }
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col font-sans">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={imageSrc} 
          alt="Lifestyle product background" 
          className="w-full h-full object-cover"
        />
        {/* Subtle gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>

      {/* Header Navigation */}
      <header className="relative z-20 w-full px-6 md:px-12 py-6 flex justify-between items-center text-white">
        <div className="text-2xl font-black tracking-tighter uppercase">Lumina.</div>
        <nav className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide uppercase">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-gray-300 transition-colors">{link}</a>
          ))}
        </nav>
        <div className="flex items-center space-x-6">
          <button className="hover:text-gray-300">🔍</button>
          <button className="hover:text-gray-300 relative">
            🛒
            <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">2</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col justify-center px-6 md:px-16 w-full max-w-3xl text-white">
        {badgeText && (
          <div className="inline-block w-max px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase border border-white/30 backdrop-blur-sm rounded-full">
            {badgeText}
          </div>
        )}
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.05] tracking-tight text-shadow-sm">
          {headline}
        </h1>
        
        <p className="text-xl text-gray-200 mb-10 max-w-xl font-medium leading-relaxed">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <button className="px-10 py-4 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-gray-100 transition-colors hover:scale-105 transform duration-200">
            {ctaPrimary}
          </button>
          <button className="px-10 py-4 border-2 border-white text-white font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition-colors">
            {ctaSecondary}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 mt-auto pb-12">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="flex items-center space-x-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 w-max">
              <span className="text-xl">{badge.icon}</span>
              <span className="text-sm font-semibold tracking-wide text-gray-100">{badge.text}</span>
            </div>
          ))}
        </div>
      </main>
    </section>
  );
}
