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

export default function SaasHero1({
  headline = "Built for teams that move fast",
  subheadline = "The all-in-one platform to plan, execute, and track your projects. Experience unparalleled speed and clarity.",
  ctaPrimary = "Start for free",
  ctaSecondary = "Request demo",
  badgeText = "New Features 2.0",
  imageSrc = "https://placehold.co/1200x600/1e293b/334155?text=Dashboard+Mockup",
  navLinks = ["Product", "Solutions", "Pricing", "Resources"]
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen bg-[#0B0F19] flex flex-col items-center justify-start pt-8 overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Navigation */}
      <header className="w-full max-w-7xl px-6 py-4 flex justify-between items-center z-20 mb-16">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600"></div>
          <span className="text-white font-bold text-xl tracking-tight">AcmeCorp</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-400">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
          ))}
        </nav>
        <button className="hidden md:block px-5 py-2 text-sm font-medium text-white border border-gray-700 rounded-full hover:bg-gray-800 transition-colors">
          Log in
        </button>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-5xl px-6 flex flex-col items-center text-center z-10 mb-16">
        {badgeText && (
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{badgeText}</span>
          </div>
        )}

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
          {headline.split(' ').slice(0, -2).join(' ')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            {headline.split(' ').slice(-2).join(' ')}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            {ctaPrimary}
          </button>
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
            {ctaSecondary}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </main>

      {/* Product Mockup */}
      <div className="w-full max-w-6xl px-6 pb-20 z-10 perspective-[2000px]">
        <div className="relative w-full rounded-2xl md:rounded-[2rem] border border-gray-800 bg-gray-900/50 p-2 md:p-4 backdrop-blur-xl shadow-2xl transform rotate-x-[2deg] hover:rotate-x-0 transition-transform duration-700">
          <img 
            src={imageSrc} 
            alt="Product Interface" 
            className="w-full h-auto rounded-xl md:rounded-2xl border border-gray-800"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0B0F19] to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
