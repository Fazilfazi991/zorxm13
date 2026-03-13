import { useState, useCallback } from 'react';
import { SEORule, RuleResult, AnalysisResults, CheckInputs } from '../types/seo-copilot.types';
import rulesData from '../data/rules.json';
import { countWords, countHeadings, countImages, countLinks, hasPassiveVoice } from '../utils/textAnalyzer';
import { fleschReadingEase } from '../utils/readabilityScorer';

// Create a typed array of rules
const rules: SEORule[] = rulesData as SEORule[];

export function useRulesChecker() {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback((inputs: CheckInputs) => {
    setIsAnalyzing(true);
    
    // Simulate slight delay for premium feel
    setTimeout(() => {
      const { focusKeyword, postTitle, metaDesc, content, urlSlug, contentType } = inputs;
      
      const contentWords = countWords(content);
      const titleLower = postTitle.toLowerCase();
      const metaLower = metaDesc.toLowerCase();
      const keywordLower = focusKeyword.toLowerCase();
      
      // Calculate all necessary metrics once
      const metrics: Record<string, any> = {
        title_length: postTitle.length,
        meta_description_length: metaDesc.length,
        word_count: contentWords,
        keyword_in_title: keywordLower ? titleLower.includes(keywordLower) : false,
        keyword_in_meta: keywordLower ? metaLower.includes(keywordLower) : false,
        h1_count: countHeadings(content, 1),
        h2_count: countHeadings(content, 2),
        image_count: countImages(content),
        images_without_alt: (content.match(/!\[\]\(.*?\)|<img[^>]*alt=""[^>]*>/g) || []).length,
        internal_link_count: countLinks(content, 'internal'),
        url_length: urlSlug.length,
        keyword_in_url: keywordLower ? urlSlug.toLowerCase().includes(keywordLower) : false,
        url_has_underscores: urlSlug.includes('_'),
        has_schema: false, // Per PRD
        flesch_score: fleschReadingEase(content),
        passive_voice_percentage: hasPassiveVoice(content).percentage,
        focus_keyword: focusKeyword
      };

      const firedIssues: RuleResult[] = [];
      const passingRules: RuleResult[] = [];
      let score = 100;
      
      const counts = { critical: 0, error: 0, warning: 0, info: 0 };

      // Process each rule manually per PRD instructions (using a safe evaluator instead of eval)
      rules.forEach(rule => {
        let isFired = false;
        
        // A minimal safe evaluator just for the conditions described in PRD
        try {
          if (rule.condition === "word_count < 300") {
             isFired = metrics.word_count < 300;
          } else if (rule.condition === "focus_keyword !== '' && !keyword_in_title") {
             isFired = metrics.focus_keyword !== '' && !metrics.keyword_in_title;
          } else {
             // Fallback for demo rules if they contain simple JS strings
             // WARNING: Only using Function constructor for this specific controlled JSON data pattern.
             // eslint-disable-next-line no-new-func
             const evaluator = new Function(...Object.keys(metrics), `return ${rule.condition.replace(/focus_keyword/g, 'focus_keyword')};`);
             isFired = evaluator(...Object.values(metrics));
          }
        } catch (e) {
          console.error(`Failed to evaluate condition for rule ${rule.id}: ${rule.condition}`, e);
        }

        const populatedMessage = rule.message.replace(/\{(\w+)\}/g, (match, key) => {
          return metrics[key] !== undefined ? metrics[key] : match;
        });

        const resultObj: RuleResult = {
          ...rule,
          fired: isFired,
          message_populated: populatedMessage
        };

        if (isFired) {
          firedIssues.push(resultObj);
          
          if (rule.severity === 'critical') { score -= 15; counts.critical++; }
          else if (rule.severity === 'error') { score -= 10; counts.error++; }
          else if (rule.severity === 'warning') { score -= 5; counts.warning++; }
          else if (rule.severity === 'info') { score -= 2; counts.info++; }
        } else {
          passingRules.push(resultObj);
        }
      });

      // Clamp score
      score = Math.max(0, Math.min(100, score));
      
      let grade: AnalysisResults['grade'] = 'Excellent';
      if (score < 50) grade = 'Poor';
      else if (score < 70) grade = 'Needs Work';
      else if (score < 90) grade = 'Good';

      // Sort issues by severity
      const severityOrder = { critical: 1, error: 2, warning: 3, info: 4, good: 5 };
      firedIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setResults({
        score,
        grade,
        counts,
        issues: firedIssues,
        passing: passingRules
      });
      setIsAnalyzing(false);
    }, 600);
  }, []);

  return { results, isAnalyzing, analyze };
}
