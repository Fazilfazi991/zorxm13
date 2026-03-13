export interface ComplexWordResult {
  word: string;
  alternatives: string[];
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function countSentences(text: string): number {
  if (!text) return 0;
  return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
}

export function avgWordsPerSentence(text: string): number {
  const words = countWords(text);
  const sentences = countSentences(text);
  if (sentences === 0) return 0;
  return parseFloat((words / sentences).toFixed(1));
}

export function countHeadings(text: string, level: 1 | 2 | 3): number {
  if (!text) return 0;
  const regex = new RegExp(`^#{${level}}\\s`, 'gm');
  const markdownMatches = (text.match(regex) || []).length;
  
  const htmlRegex = new RegExp(`<h${level}[^>]*>`, 'gi');
  const htmlMatches = (text.match(htmlRegex) || []).length;
  
  return markdownMatches + htmlMatches;
}

export function countImages(text: string): number {
  if (!text) return 0;
  const markdownMatches = (text.match(/!\[.*?\]\(.*?\)/g) || []).length;
  const htmlMatches = (text.match(/<img[^>]+>/gi) || []).length;
  return markdownMatches + htmlMatches;
}

export function countLinks(text: string, type: 'internal' | 'external'): number {
  if (!text) return 0;
  // This is a simplified check. A true check would need the domain name to distinguish.
  // For the sake of this tool, we assume markdown links starting with / or # are internal, HTTP are external.
  const markdownLinks = text.match(/\[.*?\]\((.*?)\)/g) || [];
  const htmlLinks = text.match(/<a[^>]+href="(.*?)"[^>]*>/gi) || [];
  
  let internal = 0;
  let external = 0;

  const classifyUrl = (url: string) => {
    if (url.startsWith('http') || url.startsWith('www')) external++;
    else if (url.startsWith('/') || url.startsWith('#')) internal++;
  };

  markdownLinks.forEach(link => {
    const match = link.match(/\((.*?)\)/);
    if (match && match[1]) classifyUrl(match[1]);
  });

  htmlLinks.forEach(link => {
    const match = link.match(/href="(.*?)"/);
    if (match && match[1]) classifyUrl(match[1]);
  });

  return type === 'internal' ? internal : external;
}

export function extractFirstNWords(text: string, n: number): string {
  if (!text) return '';
  return text.trim().split(/\s+/).slice(0, n).join(' ');
}

export function countKeywordOccurrences(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  // Escape regex specials from keyword
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
  return (text.match(regex) || []).length;
}

export function hasPassiveVoice(text: string): { count: number, percentage: number } {
  if (!text) return { count: 0, percentage: 0 };
  
  // A simplified passive voice check (looking for forms of "to be" + "ed")
  // Note: This is a basic approximation, true passive voice detection is complex NLP.
  const tobe = ['is', 'are', 'was', 'were', 'be', 'been', 'being', 'am'];
  const regex = new RegExp(`\\b(${tobe.join('|')})\\s+\\w+ed\\b`, 'gi');
  
  const matches = (text.match(regex) || []).length;
  const sentences = countSentences(text) || 1;
  const percentage = (matches / sentences) * 100;
  
  return { 
    count: matches, 
    percentage: parseFloat(percentage.toFixed(1)) 
  };
}

export function checkComplexWords(text: string, lookup: Record<string, string[]>): ComplexWordResult[] {
  if (!text || !lookup) return [];
  
  const results: ComplexWordResult[] = [];
  const words = text.toLowerCase().split(/[\s.,!?()]+/);
  
  for (const [complexWord, alternatives] of Object.entries(lookup)) {
    if (words.includes(complexWord.toLowerCase())) {
      results.push({ word: complexWord, alternatives });
    }
  }
  
  return results;
}
export function detectPassiveVoice(text: string): number {
  if (!text) return 0;
  const sentences = countSentences(text);
  if (sentences === 0) return 0;
  
  const passivePatterns = [
    /\b(am|is|are|was|were|be|been|being)\b\s+\w+ed\b/gi,
    /\b(am|is|are|was|were|be|been|being)\b\s+given\b/gi,
    /\b(am|is|are|was|were|be|been|being)\b\s+taken\b/gi,
    /\b(am|is|are|was|were|be|been|being)\b\s+shown\b/gi,
  ];
  
  let matches = 0;
  passivePatterns.forEach(pattern => {
    matches += (text.match(pattern) || []).length;
  });
  
  return parseFloat(((matches / sentences) * 100).toFixed(1));
}

export function getReadabilityGrade(score: number): string {
  if (score >= 90) return "5th Grade";
  if (score >= 80) return "6th Grade";
  if (score >= 70) return "7th Grade";
  if (score >= 60) return "8th & 9th Grade";
  if (score >= 50) return "10th to 12th Grade";
  if (score >= 30) return "College";
  return "College Graduate";
}
