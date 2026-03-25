import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  imageSrc?: string;
  navLinks?: string[];
}

export default function EcommerceHero3({
  headline = "Curated Spaces",
  subheadline = "The Spring collection has arrived. Refresh your home with objects designed to bring joy and tranquility.",
  ctaPrimary = "Shop Collection",
  imageSrc = "https://placehold.co/600x600/f3f4f6/1f2937?text=Featured+Item",
  navLinks = ["Furniture", "Lighting", "Decor", "Textiles"]
}: HeroProps) {
  const categories = ["Living Room", "Bedroom", "Dining", "Workspace", "Outdoor"];

  return (
    <section className="relative w-full min-h-screen bg-[#FAFAFA] flex flex-col items-center font-sans overflow-hidden">
      {/* Minimal Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <nav className="flex-1 hidden md:block">
          <ul className="flex space-x-6 text-sm font-medium text-gray-500">
            {navLinks.map(link => (
              <li key={link}><a href="#" className="hover:text-black transition-colors">{link}</a></li>
            ))}
          </ul>
        </nav>
        <div className="text-2xl font-serif font-bold text-black tracking-tight flex-1 text-center">
          N O V A
        </div>
        <div className="flex-1 flex justify-end items-center space-x-5 text-sm font-medium">
          <button className="hover:text-gray-600 transition-colors">Search</button>
          <button className="hover:text-gray-600 transition-colors">Cart (0)</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center mt-12 md:mt-20 z-10">
        <h1 className="text-6xl md:text-8xl font-serif text-black mb-6 tracking-tight leading-[1.05]">
          {headline}
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl font-light">
          {subheadline}
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat, idx) => (
            <button key={idx} className="px-5 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-black hover:text-white hover:border-black transition-all">
              {cat}
            </button>
          ))}
        </div>

        <button className="px-12 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition-colors mb-20 md:mb-32">
          {ctaPrimary}
        </button>

        {/* Featured Product Card */}
        <div className="relative w-full max-w-xl mx-auto -mb-20 md:-mb-32">
          <div className="bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 transform transition-transform hover:-translate-y-2 duration-500">
            <div className="absolute top-10 left-10 bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full z-10">
              Featured
            </div>
            <div className="w-full aspect-square md:aspect-video rounded-2xl overflow-hidden mb-6 bg-gray-50">
              <img 
                src={imageSrc} 
                alt="Featured Product" 
                className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="flex justify-between items-end text-left px-2">
              <div>
                <h3 className="text-2xl font-serif text-black mb-1">Oak Mono Chair</h3>
                <p className="text-gray-500 text-sm font-medium">Handcrafted solid oak</p>
              </div>
              <p className="text-xl font-medium text-black">$395</p>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-gray-100 to-transparent rounded-full blur-[100px] -z-10"></div>
    </section>
  );
}
