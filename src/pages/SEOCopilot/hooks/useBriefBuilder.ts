import { useState, useCallback } from 'react';
import { ContentBriefTemplate, BriefSection, BriefInputs } from '../types/seo-copilot.types';
import templatesData from '../data/content-brief-templates.json';

const templates = templatesData as ContentBriefTemplate[];

export interface PopulatedBrief {
  topic: string;
  contentTypeName: string;
  targetWordCount: string;
  estReadingTime: number;
  difficulty: 'Low' | 'Medium' | 'High';
  structure: BriefSection[];
  seoNotes: string;
}

export function useBriefBuilder() {
  const [brief, setBrief] = useState<PopulatedBrief | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const buildBrief = useCallback((inputs: BriefInputs) => {
    setIsBuilding(true);
    
    setTimeout(() => {
      const { topic, contentType, audience } = inputs;
      
      // Find template or fallback to first
      const template = templates.find(t => t.slug === contentType) || templates[0];
      
      if (!template) {
        setIsBuilding(false);
        return;
      }
      
      const populatedStructure: BriefSection[] = template.structure.map(section => {
        const replaceTokens = (text: string) => 
          text.replace(/\{keyword\}/gi, topic || 'Topic')
              .replace(/\{audience\}/gi, audience || 'your audience')
              .replace(/\{year\}/gi, new Date().getFullYear().toString());
              
        return {
          ...section,
          heading: replaceTokens(section.heading),
          guidance: replaceTokens(section.guidance),
        };
      });
      
      // Calculate reading time based on max range roughly
      const parts = template.ideal_word_count.split('-');
      const maxWords = parts.length === 2 ? parseInt(parts[1]) : 1500;
      const readingTime = Math.ceil(maxWords / 200);
      
      let difficulty: 'Low' | 'Medium' | 'High' = 'Medium';
      if (maxWords > 2500) difficulty = 'High';
      else if (maxWords < 1000) difficulty = 'Low';
      
      setBrief({
        topic: topic || 'Topic',
        contentTypeName: template.name,
        targetWordCount: template.ideal_word_count,
        estReadingTime: readingTime,
        difficulty,
        structure: populatedStructure,
        seoNotes: template.seo_notes
      });
      
      setIsBuilding(false);
    }, 600);
  }, []);

  return { brief, isBuilding, buildBrief };
}
