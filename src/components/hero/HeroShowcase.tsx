import React, { useState } from 'react';
import { heroRegistry } from '../../data/heroRegistry';

export default function HeroShowcase() {
  const [filter, setFilter] = useState('All');
  
  const industries = ['All', 'restaurant', 'saas', 'realestate', 'ecommerce', 'healthcare'];

  const filteredHeroes = filter === 'All' 
    ? heroRegistry 
    : heroRegistry.filter(h => h.industry === filter);

  const copyToClipboard = (componentName: string, industry: string) => {
    const importPath = `import ${componentName} from '@/components/hero/heroes/${industry}/${componentName}';`;
    navigator.clipboard.writeText(importPath);
    // User feedback could be enhanced here (e.g. a toast)
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Hero Components</h1>
        <div className="flex space-x-2">
          {industries.map(ind => (
            <button
              key={ind}
              onClick={() => setFilter(ind)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === ind 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {ind.charAt(0).toUpperCase() + ind.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12 pb-24">
        {filteredHeroes.map(hero => {
          const HeroComponent = hero.component;
          return (
            <div key={hero.id} className="group relative bg-white flex flex-col">
              <div className="w-full relative shadow-md">
                <HeroComponent />
              </div>
              <div className="bg-gray-900 text-gray-300 px-6 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-white">{hero.label}</span>
                  <span className="opacity-50">|</span>
                  <span className="uppercase tracking-wider">{hero.industry}</span>
                  <span className="opacity-50">|</span>
                  <span>{hero.layout}</span>
                  <span className="opacity-50">|</span>
                  <div className="flex space-x-2">
                    {hero.tags.map(tag => (
                      <span key={tag} className="bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(hero.component.name, hero.industry)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded transition-colors text-xs font-medium"
                >
                  Copy Component
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
