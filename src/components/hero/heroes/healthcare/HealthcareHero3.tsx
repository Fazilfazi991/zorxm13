import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  navLinks?: string[];
  stats?: { value: string; label: string }[];
}

export default function HealthcareHero3({
  headline = "Healing begins with peace of mind.",
  subheadline = "A calm approach to modern medicine. Navigate your health journey with our dedicated team of holistic specialists.",
  ctaPrimary = "Find a Provider",
  ctaSecondary = "Our Approach",
  navLinks = ["Care Models", "Programs", "Locations", "About Us"],
  stats = [
    { value: "40K+", label: "Patients Treated" },
    { value: "35+", label: "Specialties" },
    { value: "15", label: "Locations" }
  ]
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen bg-[#FDFDFD] flex flex-col font-sans overflow-hidden py-6">
      {/* Simplistic Header */}
      <header className="w-full max-w-6xl mx-auto px-6 flex justify-between items-center z-20">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-teal-800"></div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">SereneHealth</span>
        </div>
        <nav className="hidden md:flex flex-1 justify-center space-x-10 text-sm font-medium text-gray-500">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-teal-800 transition-colors">{link}</a>
          ))}
        </nav>
        <button className="text-sm font-semibold text-teal-800 border border-teal-200 px-5 py-2 rounded-full hover:bg-teal-50 transition-colors">
          Log In
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-16 md:mt-24 z-10 relative">
        <h1 className="text-5xl md:text-7xl font-serif text-slate-800 mb-8 max-w-4xl tracking-tight leading-tight">
          {headline}
        </h1>
        
        <p className="text-xl text-slate-500 max-w-2xl font-light mb-16 leading-relaxed">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 md:mb-32">
          <button className="px-10 py-4 bg-teal-800 text-white rounded-full font-medium text-lg hover:bg-teal-900 transition-colors shadow-lg shadow-teal-900/10">
            {ctaPrimary}
          </button>
          <button className="px-10 py-4 bg-white border border-slate-200 text-slate-700 rounded-full font-medium text-lg hover:bg-slate-50 transition-colors">
            {ctaSecondary}
          </button>
        </div>

        {/* Minimal Stats Row */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-t border-slate-100">
          {stats?.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-4xl text-teal-800 font-serif mb-2">{stat.value}</span>
              <span className="text-sm text-slate-400 font-medium uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Decorative calm blobs */}
      <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] bg-teal-50 rounded-full filter blur-[100px] -z-10 opacity-60"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-slate-50 rounded-full filter blur-[100px] -z-10 opacity-60"></div>
    </section>
  );
}
