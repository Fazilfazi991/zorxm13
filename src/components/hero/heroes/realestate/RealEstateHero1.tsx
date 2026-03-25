import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  imageSrc?: string;
  navLinks?: string[];
  stats?: { value: string; label: string }[];
}

export default function RealEstateHero1({
  headline = "Find your perfect place to call home",
  subheadline = "Discover premium properties in the most sought-after neighborhoods. Your next chapter begins here.",
  ctaPrimary = "Search",
  imageSrc = "https://placehold.co/1920x1080/1a1a2e/ffffff?text=Luxury+Home+Exterior",
  navLinks = ["Buy", "Rent", "Sell", "Agents", "About"],
  stats = [
    { value: "12,000+", label: "Active Listings" },
    { value: "45", label: "Cities" },
    { value: "850+", label: "Expert Agents" }
  ]
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between font-sans text-white">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          src={imageSrc} 
          alt="Luxury home exterior" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 w-full px-6 md:px-12 py-6 flex justify-between items-center">
        <div className="text-2xl font-serif font-bold tracking-tight">OAK & PINE</div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-gray-300 transition-colors drop-shadow-md">{link}</a>
          ))}
        </nav>
        <button className="hidden md:block px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-sm font-medium transition-colors border border-white/20">
          Sign In
        </button>
      </header>

      {/* Center Content: Search */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 w-full max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-serif font-medium mb-6 leading-tight drop-shadow-lg">
          {headline}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-2xl text-shadow-sm">
          {subheadline}
        </p>

        {/* Search Bar container */}
        <div className="w-full max-w-3xl bg-white rounded-full p-2 flex items-center shadow-2xl">
          <div className="flex-grow flex items-center px-6">
            <span className="text-gray-400 mr-3 hidden sm:block">🔍</span>
            <input 
              type="text" 
              placeholder="City, neighborhood, or ZIP"
              className="w-full bg-transparent border-none text-gray-900 focus:outline-none focus:ring-0 text-lg placeholder-gray-400"
            />
          </div>
          <button className="bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg">
            {ctaPrimary}
          </button>
        </div>
      </main>

      {/* Footer Stats Row */}
      <footer className="relative z-10 w-full bg-gradient-to-t from-black/80 to-transparent pt-20 pb-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 text-center divide-x divide-white/20">
          {stats?.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center px-4">
              <span className="text-3xl md:text-5xl font-light mb-2">{stat.value}</span>
              <span className="text-xs md:text-sm text-gray-300 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </footer>
    </section>
  );
}
