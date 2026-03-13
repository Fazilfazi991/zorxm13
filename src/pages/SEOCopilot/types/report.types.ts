export interface SEOIssue {
  id: string
  category: SEOCategory
  severity: 'critical' | 'error' | 'warning' | 'info' | 'passing'
  title: string              // Human readable: "Title tag is too long"
  summary: string            // One sentence explanation
  explanation: string        // Full paragraph why this matters
  fixSteps: string[]         // Numbered steps to fix it
  exampleBad?: string
  exampleGood?: string
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  timeToFix: string          // "5 minutes", "30 minutes"
  priorityRank: number       // 1 = fix first
}

export type SEOCategory = 
  | 'title'
  | 'meta'
  | 'content'
  | 'keyword'
  | 'headings'
  | 'images'
  | 'links'
  | 'technical'
  | 'schema'
  | 'readability'
  | 'ecommerce'
  | 'aeo'           // Answer Engine Optimization
  | 'eeat'          // Experience, Expertise, Authority, Trust
  | 'llm'           // LLM/AI visibility
  | 'topical'       // Topical authority
  | 'performance'
  | 'mobile'

export interface TrafficEstimate {
  currentMonthlyVisitors: number
  potentialMonthlyVisitors: number
  lostVisitorsPerMonth: number
  lostVisitorsPerYear: number
  currentRankingPosition: string   // "Page 2-3"
  potentialRankingPosition: string // "Page 1, position 3-5"
  estimatedKeywordVolume: number
  revenueImpact: string           // "$X/month if monetized"
}

export interface CompetitorInsight {
  whatTopRankersHave: string[]
  whatYoureMissing: string[]
  quickWins: string[]
}

export interface AEOAnalysis {
  score: number
  isFeaturedSnippetReady: boolean
  isPeopleAlsoAskReady: boolean
  isVoiceSearchReady: boolean
  isAIOverviewReady: boolean
  issues: SEOIssue[]
  tips: string[]
  speakableSchemaNeeded: boolean
  faqSchemaNeeded: boolean
}

export interface EEATAnalysis {
  score: number
  experienceScore: number
  expertiseScore: number
  authorityScore: number
  trustScore: number
  issues: SEOIssue[]
  recommendations: string[]
}

export interface LLMVisibilityAnalysis {
  score: number
  likelyMentionedInChatGPT: boolean
  likelyMentionedInGemini: boolean
  likelyMentionedInPerplexity: boolean
  issues: SEOIssue[]
  improvementTips: string[]
}

export interface TopicalAuthorityAnalysis {
  score: number
  topicCoverage: 'thin' | 'moderate' | 'comprehensive'
  missingSubtopics: string[]
  recommendedClusterTopics: string[]
  pillarPageNeeded: boolean
}

export interface ReadabilityAnalysis {
  fleschScore: number
  grade: string
  avgSentenceLength: number
  passiveVoicePercentage: number
  complexWordsFound: string[]
  simplifiedAlternatives: Record<string, string>
  issues: SEOIssue[]
}

export interface SchemaAnalysis {
  detected: string[]
  missing: string[]
  recommended: string[]
  issues: SEOIssue[]
  richResultsEligible: string[]
}

export interface FullSEOReport {
  // Meta
  analyzedUrl: string
  analyzedAt: string
  pageType: string
  inputSummary: string

  // Scores
  overallScore: number
  onPageScore: number
  technicalScore: number
  contentScore: number
  linksScore: number
  aeoScore: number
  eeatScore: number
  llmScore: number

  // AI Generated Content
  executiveSummary: string        // 2-3 paragraph overview
  topPriorities: string[]         // Top 5 things to fix NOW
  
  // All Issues
  allIssues: SEOIssue[]           // Every issue found, sorted by priority

  // Deep Analysis by Feature
  trafficEstimate: TrafficEstimate
  competitorInsights: CompetitorInsight
  aeoAnalysis: AEOAnalysis
  eeatAnalysis: EEATAnalysis
  llmVisibility: LLMVisibilityAnalysis
  topicalAuthority: TopicalAuthorityAnalysis
  readabilityAnalysis: ReadabilityAnalysis
  schemaAnalysis: SchemaAnalysis

  // Quick Wins (top 5 low effort / high impact)
  quickWins: SEOIssue[]

  // NEW Country-Targeted 4-Phase Fields
  targetCountry: Country
  siteCrawl: SiteCrawlResult
  googleRankings: GoogleRankingsReport
  llmVisibilityReport: LLMVisibilityReport
}

export interface DiscoveredKeyword {
  keyword: string
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  sourcePageType: 'homepage' | 'service' | 'product' | 'blog' | 'about'
  sourcePage: string     // actual URL/path
  estimatedVolume: number
  difficulty: 'low' | 'medium' | 'high'
  priority: number       // 1 = most important
}

export interface GoogleRankingResult {
  keyword: string
  country: string
  countryFlag: string
  estimatedPosition: number | null   // null = not ranking
  estimatedPage: number | null       // page 1, 2, 3...
  positionLabel: string              // "Position 4", "Page 2", "Not Ranking"
  hasFeaturedSnippet: boolean
  hasPeopleAlsoAsk: boolean
  topCompetitors: string[]           // domains ranking above
  opportunity: 'high' | 'medium' | 'low'
  simulationNote: string             // "Simulated estimate based on SEO signals"
}

export interface LLMKeywordResult {
  keyword: string
  chatgpt: LLMCheckResult
  gemini: LLMCheckResult
  perplexity: LLMCheckResult
}

export interface LLMCheckResult {
  mentioned: boolean
  confidence: 'high' | 'medium' | 'low'
  quote: string | null        // exact quote if mentioned
  context: string | null      // surrounding context
  competitorsMentioned: string[]  // other domains mentioned
  simulationNote: string      // transparency label
}

export interface LLMVisibilityReport {
  overallScore: number        // 0-100
  domain: string
  country: string
  
  // Per-LLM summary
  chatgptScore: number        // % of keywords where domain mentioned
  geminiScore: number
  perplexityScore: number
  
  // Per-keyword breakdown
  keywordResults: LLMKeywordResult[]
  
  // Aggregated insights
  mentionedKeywords: string[]      // keywords where domain IS mentioned
  notMentionedKeywords: string[]   // keywords where domain is NOT mentioned
  topCompetitorsInLLMs: {
    domain: string
    mentionCount: number
  }[]
  
  // Improvement
  improvementTips: string[]
  estimatedTimeToImprove: string
}

export interface GoogleRankingsReport {
  country: string
  countryFlag: string
  analyzedAt: string
  
  keywords: GoogleRankingResult[]
  
  // Summary
  rankingKeywords: number     // keywords on page 1
  notRankingKeywords: number
  averagePosition: number
  topOpportunities: GoogleRankingResult[]  // easiest wins
  
  simulationDisclaimer: string
}

export interface SiteCrawlResult {
  domain: string
  pagesFound: {
    url: string
    pageType: 'homepage' | 'service' | 'product' | 'blog' | 'about' | 'other'
    title: string
    description: string
  }[]
  discoveredKeywords: DiscoveredKeyword[]
  topKeywords: string[]   // top 10 most important
  primaryTopics: string[] // main topic clusters
}

export interface Country {
  code: string
  name: string
  flag: string
  gl: string   // Google location parameter
  hl: string   // Google language parameter
}
