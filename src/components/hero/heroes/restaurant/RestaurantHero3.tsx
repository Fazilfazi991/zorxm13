import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  imageSrc?: string;
  logoSrc?: string;
  navLinks?: string[];
}

export default function RestaurantHero3({
  headline = "Pure. Simple. Delicious.",
  subheadline = "A modern approach to farm-to-table dining. We let the ingredients speak for themselves in a bright, inviting atmosphere.",
  ctaPrimary = "Make a Reservation",
  imageSrc = "https://placehold.co/1920x300/f0eee9/cccccc?text=Food+Texture",
  logoSrc = "https://placehold.co/120x40/000000/ffffff?text=LOGO",
  navLinks = ["Menu", "About", "Reservations"]
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen bg-white text-gray-900 flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <header className="w-full py-8 flex flex-col items-center">
        <img src={logoSrc} alt="Logo" className="h-10 mb-8" />
        <nav className="flex space-x-8 text-sm font-medium text-gray-500 uppercase tracking-widest">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-gray-900 transition-colors">{link}</a>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center z-10 py-12">
        <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tight mb-8 text-black max-w-4xl leading-tight">
          {headline}
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl font-light mb-12 leading-relaxed">
          {subheadline}
        </p>
        <button className="px-10 py-4 rounded-full border border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-all duration-300">
          {ctaPrimary}
        </button>
      </main>

      {/* Subtle Bottom Texture Strip */}
      <div className="w-full h-48 md:h-64 relative mt-auto opacity-70 hover:opacity-100 transition-opacity duration-700">
        <img 
          src={imageSrc} 
          alt="Subtle food texture" 
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent h-24"></div>
      </div>
    </section>
  );
}
