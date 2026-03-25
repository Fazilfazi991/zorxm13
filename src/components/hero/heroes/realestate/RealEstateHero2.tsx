import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  logoSrc?: string;
  navLinks?: string[];
}

export default function RealEstateHero2({
  headline = "Elevate Your Lifestyle",
  subheadline = "Curated luxury estates designed for exceptional living. Browse our exclusive collection of architectural masterworks.",
  ctaPrimary = "View Collection",
  logoSrc = "https://placehold.co/120x40/000000/ffffff?text=LOGO",
  navLinks = ["Properties", "Developments", "Journal", "Contact"]
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen bg-[#F9F9F8] flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-8 py-12 lg:p-20 z-10 relative">
        <header className="flex justify-between items-center w-full mb-16 lg:mb-0">
          <img src={logoSrc} alt="Logo" className="h-6 opacity-80" />
          <nav className="hidden sm:flex space-x-8 text-xs font-semibold uppercase tracking-widest text-gray-500">
            {navLinks.map((link) => (
              <a key={link} href="#" className="hover:text-black transition-colors">{link}</a>
            ))}
          </nav>
        </header>

        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto lg:mx-0">
          <h1 className="text-5xl lg:text-7xl font-serif font-medium text-gray-900 mb-8 leading-[1.1] tracking-tight">
            {headline}
          </h1>
          
          <p className="text-lg text-gray-500 mb-12 leading-relaxed">
            {subheadline}
          </p>

          <div className="flex items-center space-x-4">
            <button className="px-8 py-4 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-colors shadow-xl shadow-black/10">
              {ctaPrimary}
            </button>
            <button className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors group">
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        <div className="mt-16 lg:mt-0 text-sm text-gray-400 flex items-center space-x-4">
          <span className="block w-12 h-px bg-gray-300"></span>
          <span>EST. 2024</span>
        </div>
      </div>

      {/* Right Content: Stacked Cards */}
      <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center p-8 lg:p-0 relative h-[60vh] lg:h-auto overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-200 via-gray-100 to-gray-50"></div>
        
        {/* Stacked Cards */}
        <div className="relative w-full max-w-md perspective-1000">
          {/* Back Card */}
          <div className="absolute top-0 left-0 w-full aspect-[4/5] bg-white p-4 rounded-2xl shadow-xl transform translate-x-8 -translate-y-8 rotate-6 opacity-60 transition-transform duration-700 hover:translate-x-12 hover:-translate-y-12">
            <div className="w-full h-3/4 bg-gray-200 rounded-xl mb-4 overflow-hidden">
              <img src="https://placehold.co/600x800/d1d5db/ffffff?text=Villa" alt="Villa" className="w-full h-full object-cover" />
            </div>
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-1/4 bg-gray-100 rounded"></div>
          </div>
          
          {/* Front Card */}
          <div className="relative w-full aspect-[4/5] bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 transform transition-transform duration-500 hover:-translate-y-2 z-10">
            <div className="w-full h-[65%] rounded-xl mb-5 overflow-hidden relative">
              <img src="https://placehold.co/600x800/9ca3af/ffffff?text=Modern+Estate" alt="Estate" className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
              <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">FOR SALE</div>
            </div>
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-2xl font-serif font-medium text-gray-900">The Glass House</h3>
              <p className="text-xl font-medium text-gray-500">$4.2M</p>
            </div>
            <p className="text-sm text-gray-400 mb-4">Beverly Hills, CA</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium">
              <span className="flex flex-col"><span>4</span><span className="text-[10px] text-gray-400 uppercase">Beds</span></span>
              <span className="w-px h-8 bg-gray-200"></span>
              <span className="flex flex-col"><span>5</span><span className="text-[10px] text-gray-400 uppercase">Baths</span></span>
              <span className="w-px h-8 bg-gray-200"></span>
              <span className="flex flex-col"><span>5,200</span><span className="text-[10px] text-gray-400 uppercase">Sq Ft</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
