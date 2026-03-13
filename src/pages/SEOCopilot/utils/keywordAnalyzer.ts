import { countWords, countKeywordOccurrences, extractFirstNWords } from './textAnalyzer';

export function getKeywordDensity(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  
  const totalWords = countWords(text);
  if (totalWords === 0) return 0;

  // Assuming keyword could be multiple words, count instances of the phrase
  const occurrences = countKeywordOccurrences(text, keyword);
  // Density = (Phrase Occurrences * Words in Phrase) / Total Words
  const wordsInKeyword = countWords(keyword);
  
  const density = ((occurrences * wordsInKeyword) / totalWords) * 100;
  
  return parseFloat(density.toFixed(2));
}

export function isKeywordInFirstNWords(text: string, keyword: string, n: number): boolean {
  if (!text || !keyword) return false;
  
  const firstNWords = extractFirstNWords(text, n);
  const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  
  return regex.test(firstNWords);
}

export function getKeywordPositionInTitle(title: string, keyword: string): number {
  if (!title || !keyword) return -1;
  return title.toLowerCase().indexOf(keyword.toLowerCase());
}

export function getLSIKeywords(keyword: string): string[] {
  // Hardcoded fallback related terms based on common SEO patterns.
  // In a real app, this would call an API.
  const keywordClean = keyword.toLowerCase().trim();
  
  if (keywordClean.includes('seo')) {
    return ['search engine optimization', 'rankings', 'google', 'traffic', 'keywords', 'backlinks', 'on-page'];
  }
  
  if (keywordClean.includes('wordpress')) {
    return ['plugins', 'themes', 'hosting', 'gutenberg', 'website', 'cms'];
  }
  
  if (keywordClean.includes('marketing')) {
    return ['strategy', 'campaign', 'roi', 'conversion', 'social media', 'advertising'];
  }

  // Generic fallback: generated semantic relationships
  const genericWords = keywordClean.split(' ');
  const generics = [];
  if (genericWords.length > 0) generics.push(`${genericWords[0]} guide`);
  if (genericWords.length > 0) generics.push(`best ${genericWords[0]}`);
  generics.push(`${keywordClean} tips`);
  generics.push(`${keywordClean} examples`);
  generics.push(`${keywordClean} 2024`);
  
  return generics;
}
