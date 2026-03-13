import { useState, useCallback } from 'react';
import { TitleFormula, GeneratedTitle, TitleInputs } from '../types/seo-copilot.types';
import formulasData from '../data/title-formulas.json';

const formulas = formulasData as TitleFormula[];

export function useTitleGenerator() {
  const [results, setResults] = useState<GeneratedTitle[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback((inputs: TitleInputs) => {
    setIsGenerating(true);
    
    // Simulate slight delay for premium feel
    setTimeout(() => {
      const { focusKeyword, contentTypes, audience, number, year } = inputs;
      
      let applicableFormulas = formulas;
      
      // Filter by content types if any are selected
      if (contentTypes.length > 0) {
        applicableFormulas = formulas.filter(f => 
          f.content_types.some(type => contentTypes.includes(type))
        );
      }
      
      const generated: GeneratedTitle[] = [];
      const powerWordsList = ['Ultimate', 'Best', 'Top', 'Proven', 'Actionable', 'Powerful', 'Strategy', 'Secret', 'Fast'];
      
      applicableFormulas.forEach(formula => {
        const fallBackNumber = number || (Math.floor(Math.random() * 8) * 2 + 7).toString(); // odd number 7-21
        
        let text = formula.formula
          .replace(/\{keyword\}/gi, focusKeyword || 'Keyword')
          .replace(/\{year\}/gi, year || new Date().getFullYear().toString())
          .replace(/\{number\}/gi, fallBackNumber)
          .replace(/\{audience\}/gi, audience || 'Beginners')
          .replace(/\{modifier\}/gi, 'Ultimate')
          .replace(/\{benefit\}/gi, 'grow your traffic')
          .replace(/\{timeframe\}/gi, '30 days')
          .replace(/\{site_name\}/gi, 'Your Site');
          
        // Simple power word extraction (could be enhanced)
        const matchedPowerWords = powerWordsList.filter(pw => 
          text.toLowerCase().includes(pw.toLowerCase())
        );
        
        generated.push({
          text,
          charCount: text.length,
          category: formula.category,
          powerWords: matchedPowerWords
        });
      });
      
      // Sort: prioritize formulas that fit within 60 chars
      generated.sort((a, b) => {
        if (a.charCount <= 60 && b.charCount > 60) return -1;
        if (a.charCount > 60 && b.charCount <= 60) return 1;
        return 0; // maintain original relative order otherwise
      });
      
      // Return top 15 results
      setResults(generated.slice(0, 15));
      setIsGenerating(false);
    }, 400);
  }, []);

  return { results, isGenerating, generate };
}
