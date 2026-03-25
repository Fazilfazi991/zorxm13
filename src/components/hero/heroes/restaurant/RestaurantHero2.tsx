import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  badgeText?: string;
  imageSrc?: string;
  logoSrc?: string;
  navLinks?: string[];
}

export default function RestaurantHero2({
  headline = "Taste the Warmth of Authentic Flavors",
  subheadline = "Handcrafted with locally sourced ingredients, our seasonal menu brings comforting, rustic dishes straight to your table.",
  ctaPrimary = "Explore Menu",
  badgeText = "Fresh & Seasonal",
  imageSrc = "https://placehold.co/800x1200/4a3b32/ffffff?text=Rustic+Food",
  logoSrc = "https://placehold.co/120x40/000000/ffffff?text=LOGO",
  navLinks = ["Our Story", "Menus", "Gallery", "Visit Us"]
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] text-[#3A302A] font-sans">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-8 py-12 lg:p-20 z-10">
        <header className="flex justify-between items-center w-full mb-16 lg:mb-0">
          <img src={logoSrc} alt="Logo" className="h-8 opacity-80" />
          <nav className="hidden sm:flex space-x-6 text-sm font-medium tracking-wide">
            {navLinks.map((link) => (
              <a key={link} href="#" className="hover:text-[#D4A373] transition-colors">{link}</a>
            ))}
          </nav>
        </header>

        <div className="flex-grow flex flex-col justify-center max-w-xl mx-auto lg:mx-0 py-12">
          {badgeText && (
            <span className="inline-block w-max px-3 py-1 mb-6 text-xs font-bold tracking-widest text-[#D4A373] bg-[#D4A373]/10 rounded-full uppercase">
              {badgeText}
            </span>
          )}
          
          <h1 className="text-5xl lg:text-6xl font-serif font-bold leading-[1.1] mb-6 text-[#2C241F]">
            {headline}
          </h1>
          
          <p className="text-lg mb-10 text-[#5C4F45] leading-relaxed">
            {subheadline}
          </p>

          <div>
            <button className="px-8 py-4 rounded-full bg-[#D4A373] text-white font-medium hover:bg-[#C28C5A] transition-colors shadow-lg shadow-[#D4A373]/30">
              {ctaPrimary}
            </button>
          </div>
        </div>
      </div>

      {/* Right Image */}
      <div className="w-full lg:w-1/2 h-[60vh] lg:h-screen relative">
        <img 
          src={imageSrc} 
          alt="Delicious dish" 
          className="w-full h-full object-cover rounded-tl-[4rem] lg:rounded-tl-[8rem] shadow-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:hidden rounded-tl-[4rem]"></div>
      </div>
    </section>
  );
}
