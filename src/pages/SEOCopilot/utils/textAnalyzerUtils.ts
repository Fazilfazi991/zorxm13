import { countWords, countSentences, countKeywordOccurrences } from "./textAnalyzer";

export function fleschReadingEase(text: string): number {
  if (!text) return 0;
  const words = countWords(text);
  const sentences = countSentences(text);
  
  // Basic syllable counting approximation
  const countSyllables = (word: string) => {
    word = word.toLowerCase();
    if(word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  };
  
  let totalSyllables = 0;
  text.split(/\s+/).forEach(word => {
    totalSyllables += countSyllables(word);
  });

  if (words === 0 || sentences === 0) return 0;
  
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getKeywordDensity(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  const words = countWords(text);
  if (words === 0) return 0;
  
  const occurrences = countKeywordOccurrences(text, keyword);
  const keywordWords = countWords(keyword);
  // Total words taken up by the keyword phrase
  const totalKeywordWords = occurrences * keywordWords;
  
  return parseFloat(((totalKeywordWords / words) * 100).toFixed(2));
}
