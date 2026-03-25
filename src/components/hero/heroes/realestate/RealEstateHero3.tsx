import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  badgeText?: string;
  navLinks?: string[];
}

export default function RealEstateHero3({
  headline = "Where Life's Best Moments Unfold",
  subheadline = "Expertly navigating the local market to find spaces that speak to your style and future.",
  ctaPrimary = "Start Exploring",
  ctaSecondary = "Meet the Team",
  badgeText = "Los Angeles Area",
  navLinks = ["Featured", "Neighborhoods", "Buyers", "Sellers", "Contact"]
}: HeroProps) {
  // Array of placeholder thumbnails
  const thumbnails = [
    "https://placehold.co/400x400/e2e8f0/94a3b8?text=1",
    "https://placehold.co/400x400/f1f5f9/94a3b8?text=2",
    "https://placehold.co/400x400/e2e8f0/94a3b8?text=3",
    "https://placehold.co/400x400/cbd5e1/94a3b8?text=4",
    "https://placehold.co/400x400/f1f5f9/94a3b8?text=5"
  ];

  return (
    <section className="relative w-full min-h-screen bg-white flex flex-col font-sans pt-6 overflow-hidden">
      {/* Header */}
      <header className="px-8 w-full flex justify-between items-center z-20">
        <div className="text-xl font-serif tracking-widest text-black">HAVEN</div>
        <nav className="hidden md:flex space-x-12 text-sm text-gray-500 font-medium">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-black transition-colors">{link}</a>
          ))}
        </nav>
        <button className="text-sm font-medium border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">
          Menu
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-20 relative z-10">
        {badgeText && (
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8 border border-gray-200 px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{badgeText}</span>
          </div>
        )}

        <h1 className="text-6xl md:text-8xl font-serif text-black leading-[1.05] tracking-tight mb-8">
          {headline}
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl font-light mb-12">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-24">
          <button className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
            {ctaPrimary}
          </button>
          <button className="px-8 py-4 bg-white border border-gray-300 text-black rounded-full font-medium hover:bg-gray-50 transition-colors">
            {ctaSecondary}
          </button>
        </div>
      </main>

      {/* Subtle Bottom Grid of Thumbnails */}
      <div className="w-full h-48 md:h-64 relative mt-auto border-t border-gray-100 flex overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-80 z-10"></div>
        <div className="flex w-full min-w-max gap-2 px-2 py-4 animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused]">
          {/* Double the array for seamless scroll effect */}
          {[...thumbnails, ...thumbnails].map((src, i) => (
            <div key={i} className="h-full aspect-square rounded-xl overflow-hidden shadow-sm relative group">
              <img src={src} alt="Property thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
          ))}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}} />
      </div>
    </section>
  );
}
