import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  badgeText?: string;
  navLinks?: string[];
  stats?: { value: string; label: string }[];
}

export default function SaasHero2({
  headline = "Automate your workflow intuitively",
  subheadline = "Stop wasting time on manual tasks. Our platform connects your favorite tools instantly without writing a single line of code.",
  ctaPrimary = "Get Started",
  badgeText = "Developer API inside",
  navLinks = ["Features", "Integrations", "Pricing", "Docs"],
  stats = [
    { value: "4.9/5", label: "G2 Rating" },
    { value: "10M+", label: "Tasks Automated" }
  ]
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 md:px-16 lg:px-24 py-12 z-10 order-2 lg:order-1 relative">
        <header className="flex items-center justify-between w-full mb-20 lg:mb-auto">
          <div className="flex items-center space-x-2 font-bold text-gray-900 text-xl tracking-tight">
            <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
            <span>AutoFlow</span>
          </div>
          <nav className="hidden sm:flex space-x-6 text-sm font-medium text-gray-600">
            {navLinks.map((link) => (
              <a key={link} href="#" className="hover:text-purple-600 transition-colors">{link}</a>
            ))}
          </nav>
        </header>

        <div className="mt-8 lg:my-auto max-w-xl">
          {badgeText && (
            <div className="inline-block px-3 py-1 mb-6 rounded-md bg-purple-50 text-purple-700 text-sm font-semibold tracking-wide">
              {badgeText}
            </div>
          )}
          
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            {headline}
          </h1>
          
          <p className="text-xl text-gray-500 leading-relaxed mb-10">
            {subheadline}
          </p>

          <form className="flex flex-col sm:flex-row gap-3 mb-12 max-w-md" onSubmit={e => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your work email" 
              className="flex-grow px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 shadow-sm"
              required
            />
            <button type="submit" className="px-8 py-4 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 whitespace-nowrap">
              {ctaPrimary}
            </button>
          </form>

          {/* Social Proof Stats */}
          <div className="flex items-center gap-8 pt-8 border-t border-gray-100">
            {stats?.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Animated UI Mockup */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-12 order-1 lg:order-2 lg:border-l border-gray-100">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-purple-900/5 p-6 border border-gray-100 relative overflow-hidden">
          {/* Header Mock */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-50 mb-6">
            <div className="h-4 w-24 bg-gray-200 rounded-full"></div>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
              <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
            </div>
          </div>

          {/* Animated Items */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`flex items-center p-4 rounded-xl border border-gray-50 ${i === 1 ? 'bg-purple-50 shadow-sm' : 'bg-white'}`}
                style={{ animation: `slideUp 0.5s ease-out ${i * 0.2}s both` }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-600' : i === 2 ? 'bg-pink-500' : 'bg-green-500'
                }`}>
                  A{i}
                </div>
                <div className="ml-4 flex-1">
                  <div className="h-3 w-1/3 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                </div>
                <div className="pl-4">
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${i === 1 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                    Active
                  </div>
                </div>
              </div>
            ))}
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}} />
        </div>
      </div>
    </section>
  );
}
