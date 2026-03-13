import { ComplexWordResult } from './utils/textAnalyzer';

// Tab 1: SEO Rules Checker
export interface SEORule {
  id: string;
  name: string;
  condition: string;
  severity: 'critical' | 'error' | 'warning' | 'info' | 'good';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  message: string;
  explanation: string;
  fix_steps: string[];
  example_bad?: string;
  example_good?: string;
}

export interface RuleResult extends SEORule {
  fired: boolean;
  message_populated: string;
}

export interface AnalysisResults {
  score: number;
  grade: 'Excellent' | 'Good' | 'Needs Work' | 'Poor';
  counts: {
    critical: number;
    error: number;
    warning: number;
    info: number;
  };
  issues: RuleResult[];
  passing: RuleResult[];
}

export interface CheckInputs {
  focusKeyword: string;
  postTitle: string;
  metaDesc: string;
  content: string;
  urlSlug: string;
  contentType: string;
}

// Tab 2: Title Formula Generator
export interface TitleFormula {
  id: string;
  category: string;
  formula: string;
  content_types: string[];
}

export interface GeneratedTitle {
  text: string;
  charCount: number;
  category: string;
  powerWords: string[];
}

export interface TitleInputs {
  focusKeyword: string;
  contentTypes: string[];
  audience: string;
  number: string;
  year: string;
}

// Tab 3: Content Brief Builder
export interface BriefSection {
  type: 'intro' | 'h2' | 'h3' | 'conclusion' | 'disclaimer';
  heading: string;
  guidance: string;
  word_count_min: number;
  word_count_max: number;
}

export interface ContentBriefTemplate {
  id: string;
  slug: string;
  name: string;
  ideal_word_count: string;
  structure: BriefSection[];
  seo_notes: string;
}

export interface BriefInputs {
  topic: string;
  contentType: string;
  audience: string;
  targetWordCount: string;
  primaryGoal: string;
}

// Complex Word Result
export interface ComplexWordResult {
  word: string;
  alternatives: string[];
}
