import { countWords, countSentences } from './textAnalyzer';

export function countSyllables(word: string): number {
  word = word.toLowerCase();
  
  if (word.length <= 3) return 1;
  
  // Basic syllable counting approximation
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  
  return syllables ? syllables.length : 1;
}

export function fleschReadingEase(text: string): number {
  if (!text) return 100; // Empty text = perfectly readable
  
  const words = countWords(text);
  const sentences = countSentences(text);
  
  if (words === 0 || sentences === 0) return 100;

  let syllables = 0;
  text.split(/\s+/).forEach(word => {
    // Strip punctuation
    const cleanWord = word.replace(/[.,!?/:;()\[\]{}]+$/g, '');
    if (cleanWord) {
      syllables += countSyllables(cleanWord);
    }
  });

  const wordsPerSentence = words / sentences;
  const syllablesPerWord = syllables / words;

  // Flesch Reading Ease formula
  let score = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
  
  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  return parseFloat(score.toFixed(1));
}

export function getReadabilityGrade(score: number): string {
  if (score >= 90) return 'Very Easy (5th Grade)';
  if (score >= 80) return 'Easy (6th Grade)';
  if (score >= 70) return 'Fairly Easy (7th Grade)';
  if (score >= 60) return 'Standard (8th-9th Grade)';
  if (score >= 50) return 'Fairly Difficult (10th-12th Grade)';
  if (score >= 30) return 'Difficult (College)';
  return 'Very Difficult (College Graduate)';
}
