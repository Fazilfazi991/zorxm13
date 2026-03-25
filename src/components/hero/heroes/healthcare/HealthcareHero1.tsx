import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  badgeText?: string;
  navLinks?: string[];
}

export default function HealthcareHero1({
  headline = "Compassionate care, close to home.",
  subheadline = "Experience world-class medical expertise delivered with a personal touch. Your health is our priority.",
  ctaPrimary = "Schedule Appointment",
  badgeText = "Accepting New Patients",
  navLinks = ["Services", "Our Doctors", "Patient Portal", "Locations"]
}: HeroProps) {
  const trustIcons = [
    { icon: "✓", label: "Board Certified" },
    { icon: "🛡️", label: "Fully Insured" },
    { icon: "⚕️", label: "24/7 Emergency Care" }
  ];

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-[#F0F7FA] to-white flex flex-col font-sans overflow-hidden">
      {/* Background Soft Shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"></div>

      {/* Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-blue-900">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
          <span className="text-xl font-bold tracking-tight">MediCarePlus</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-semibold text-gray-600">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-blue-600 transition-colors">{link}</a>
          ))}
        </nav>
        <button className="hidden md:block text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
          Patient Login →
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto w-full">
        {badgeText && (
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-8 border border-blue-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            {badgeText}
          </div>
        )}

        <h1 className="text-5xl md:text-7xl font-extrabold text-[#1E3A5F] mb-6 tracking-tight leading-[1.1]">
          {headline}
        </h1>

        <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl leading-relaxed">
          {subheadline}
        </p>

        <button className="px-10 py-4 md:py-5 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5 duration-200 mb-16">
          {ctaPrimary}
        </button>

        {/* Trust Icons Row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-10 border-t border-gray-200/60 w-full max-w-3xl">
          {trustIcons.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-3 text-[#1E3A5F]">
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-xl text-blue-500">
                {item.icon}
              </div>
              <span className="font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      </main>
    </section>
  );
}
