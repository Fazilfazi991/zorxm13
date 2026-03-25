import React from 'react';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  badgeText?: string;
  imageSrc?: string;
  navLinks?: string[];
}

export default function HealthcareHero2({
  headline = "Expert Care When You Need It Most",
  subheadline = "Book a consultation with our top specialists in just a few clicks. No waiting, no hassle.",
  ctaPrimary = "Book Appointment",
  badgeText = "Telehealth Available",
  imageSrc = "https://placehold.co/1000x1200/e0f2fe/0369a1?text=Doctor+Image",
  navLinks = ["Specialties", "Physicians", "Reviews", "Contact"]
}: HeroProps) {
  return (
    <section className="relative w-full min-h-screen bg-white flex flex-col lg:flex-row font-sans text-gray-800">
      {/* Left Content */}
      <div className="w-full lg:w-[55%] flex flex-col px-6 py-10 lg:px-20 lg:py-16 justify-between z-10">
        <header className="flex justify-between items-center mb-12">
          <div className="text-2xl font-black tracking-tighter text-blue-900">VitaHealth.</div>
          <nav className="hidden sm:flex space-x-6 text-sm font-semibold text-gray-500">
            {navLinks.map((link) => (
              <a key={link} href="#" className="hover:text-blue-600 transition-colors">{link}</a>
            ))}
          </nav>
        </header>

        <div className="max-w-xl mx-auto lg:mx-0 my-auto">
          {badgeText && (
            <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-md mb-6">
              {badgeText}
            </span>
          )}
          
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            {headline}
          </h1>
          
          <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
            {subheadline}
          </p>

          {/* Booking Form Card */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6 sm:p-8 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Request a Consultation</h3>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <input type="tel" placeholder="(555) 000-0000" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors mt-2 shadow-lg shadow-blue-200">
                {ctaPrimary}
              </button>
              <p className="text-xs text-center text-gray-400 font-medium mt-4">Safe, secure, and HIPAA compliant.</p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Image */}
      <div className="w-full lg:w-[45%] h-[50vh] lg:h-screen relative bg-blue-50">
        <div className="absolute inset-0 bg-blue-900/10 lg:hidden z-10"></div>
        <img 
          src={imageSrc} 
          alt="Medical Professional" 
          className="w-full h-full object-cover object-top"
        />
        {/* Decorative Badge */}
        <div className="absolute bottom-10 left-[-50px] hidden lg:flex bg-white p-4 rounded-xl shadow-xl border border-gray-100 items-center space-x-4 z-20">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
            99%
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Patient Satisfaction</p>
            <p className="text-xs text-gray-500">Based on 10k+ reviews</p>
          </div>
        </div>
      </div>
    </section>
  );
}
