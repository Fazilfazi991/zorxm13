import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  badgeText?: string;
  navLinks?: string[];
}

export default function SaasHero3({
  headline = "Simplify your financial operations",
  subheadline = "Gain total visibility into your spend, automate approvals, and close your books faster than ever.",
  ctaPrimary = "Open an Account",
  ctaSecondary = "Talk to Sales",
  badgeText = "Trusted by 10,000+ Startups",
  navLinks = ["Products", "Company", "Pricing", "Login"]
}: HeroProps) {
  const cards = [
    { title: "Smart Cards", desc: "Issue virtual cards instantly", icon: "💳", color: "bg-emerald-100 text-emerald-700" },
    { title: "Global Payments", desc: "Send wires in 100+ currencies", icon: "🌍", color: "bg-blue-100 text-blue-700" },
    { title: "Automated Reconciling", desc: "Sync direct to NetSuite", icon: "⚡", color: "bg-amber-100 text-amber-700" }
  ];

  return (
    <section className="relative w-full min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Simple Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-20">
        <span className="text-2xl font-black tracking-tighter text-gray-900">FINSYNC.</span>
        <nav className="hidden md:flex space-x-8 text-sm font-semibold text-gray-500">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-gray-900 transition-colors">{link}</a>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-12 md:mt-20 z-10 relative">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-teal-200/40 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-emerald-200/40 rounded-full blur-[80px] -z-10"></div>

        {badgeText && (
          <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium mb-8 shadow-sm">
            {badgeText}
          </span>
        )}

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 mb-8 max-w-4xl leading-[1.05]">
          {headline}
        </h1>

        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mb-12 font-medium">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20 md:mb-32">
          <button className="px-8 py-4 rounded-xl bg-gray-900 text-white font-semibold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 hover:-translate-y-0.5">
            {ctaPrimary}
          </button>
          <button className="px-8 py-4 rounded-xl bg-white border border-gray-200 text-gray-900 font-semibold text-lg hover:bg-gray-50 transition-all hover:-translate-y-0.5">
            {ctaSecondary}
          </button>
        </div>

        {/* Floating Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className={`bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center transform transition-transform duration-500 hover:-translate-y-2`}
              style={{ transform: `translateY(${idx === 1 ? '1rem' : '0'})` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${card.color}`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm font-medium">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </section>
  );
}
