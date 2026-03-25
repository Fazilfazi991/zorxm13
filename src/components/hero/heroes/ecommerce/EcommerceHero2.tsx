import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  badgeText?: string;
  imageSrc?: string;
  navLinks?: string[];
}

export default function EcommerceHero2({
  headline = "The Minimalist Chronograph",
  subheadline = "Precision engineering meets timeless design. Water-resistant up to 50m with a scratch-resistant sapphire crystal face.",
  ctaPrimary = "Add to Cart — $249",
  badgeText = "Best Seller",
  imageSrc = "https://placehold.co/800x1000/f8f9fa/1f2937?text=Product+Shot",
  navLinks = ["Men", "Women", "Accessories", "Gifts"]
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen bg-white flex flex-col lg:flex-row font-sans text-gray-900">
      {/* Mobile Header (Hidden on LG) */}
      <header className="lg:hidden w-full px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <span className="text-xl font-bold tracking-tighter">O R A .</span>
        <button>☰</button>
      </header>

      {/* Left: Product Image */}
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen relative bg-gray-50 flex items-center justify-center p-8 lg:p-16">
        <div className="absolute top-8 left-8 hidden lg:block text-2xl font-bold tracking-tighter z-20">
          O R A .
        </div>
        <img 
          src={imageSrc} 
          alt="Product showcase" 
          className="w-full h-full object-contain max-w-lg lg:max-w-xl transition-transform duration-700 hover:scale-105 drop-shadow-2xl"
        />
        {/* Navigation - Vertical on Desktop */}
        <nav className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col space-y-8 text-sm font-bold tracking-widest uppercase text-gray-400">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-black transition-colors transform -rotate-90 origin-left">{link}</a>
          ))}
        </nav>
      </div>

      {/* Right: Product Details */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-24">
        <div className="max-w-md mx-auto lg:mx-0">
          {/* Reviews Row */}
          <div className="flex items-center space-x-2 mb-6 text-sm">
            <div className="flex text-yellow-400 text-lg">
              ★★★★★
            </div>
            <span className="font-semibold text-gray-900">4.9</span>
            <span className="text-gray-500 underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-gray-900">(128 Reviews)</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-[1.1]">
            {headline}
          </h1>

          {badgeText && (
            <span className="inline-block px-3 py-1 bg-red-50 text-red-600 border border-red-100 text-xs font-bold uppercase tracking-wider rounded mb-6">
              {badgeText}
            </span>
          )}
          
          <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
            {subheadline}
          </p>

          <div className="space-y-6">
            <button className="w-full py-5 bg-black text-white text-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-xl shadow-black/10 hover:shadow-black/20 transform hover:-translate-y-0.5 duration-200">
              {ctaPrimary}
            </button>
            <button className="w-full py-4 bg-white border border-gray-200 text-black text-sm font-bold uppercase tracking-widest hover:border-black transition-colors flex justify-center items-center gap-2">
              <span>Pay in 4 interest-free payments</span>
              <span className="text-gray-400">ℹ️</span>
            </button>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 pt-12 border-t border-gray-100 text-sm font-medium">
            <div className="flex flex-col space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-xs">Material</span>
              <span className="text-gray-900">316L Stainless Steel</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-xs">Movement</span>
              <span className="text-gray-900">Swiss Quartz</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-xs">Crystal</span>
              <span className="text-gray-900">Sapphire</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-xs">Warranty</span>
              <span className="text-gray-900">2 Years Included</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
