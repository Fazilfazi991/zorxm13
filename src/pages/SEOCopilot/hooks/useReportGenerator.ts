import { useState } from 'react'
import { callGeminiJSON, callClaudeJSON } from '../services/ai.service'
import {
  buildCoreOnPagePrompt,
  buildTechnicalSEOPrompt,
  buildContentQualityPrompt,
  buildAEOPrompt,
  buildEEATPrompt,
  buildLLMVisibilityPrompt,
  buildTopicalAuthorityPrompt,
  buildExecutiveSummaryPrompt,
  buildClaudeEEATPrompt,
  buildClaudeLLMVisibilityPrompt,
  buildClaudeCompetitorPrompt,
  buildClaudeSummaryPrompt,
  buildSiteCrawlPrompt,
  buildGoogleRankingsPrompt,
  buildGeminiVisibilityPrompt,
  buildChatGPTVisibilityPrompt,
  buildPerplexityVisibilityPrompt,
  SEOInput
} from '../services/prompts'
import { FullSEOReport, SEOIssue, Country, SiteCrawlResult } from '../types/report.types'
import { 
  countWords, countHeadings, countImages,
  countLinks, detectPassiveVoice, avgWordsPerSentence,
  getReadabilityGrade
} from '../utils/textAnalyzer'

function makeIssuesSpecific(
  issues: SEOIssue[], 
  input: SEOInput
): SEOIssue[] {
  const domain = input.url 
    ? (() => { try { return new URL(input.url).hostname } 
               catch { return 'your site' } })()
    : 'your site'

  // Generic phrases that must be replaced
  const GENERIC_PATTERNS = [
    { 
      pattern: /develop and publish original/i,
      replacement: `Add ${Math.max(0, 1500 - (input.wordCount ?? 0))} more words to this page on ${domain}. Focus on expanding: introduction (add context), add a FAQ section, add a "Common Mistakes" section, and a conclusion with next steps.`
    },
    {
      pattern: /ensure content meets.*minimum word count/i,
      replacement: `Your page has ${input.wordCount ?? 0} words. Open the editor on ${domain} and add content until you reach at least 1,500 words. The fastest way: add a 5-question FAQ section about "${input.focusKeyword || 'your topic'}" (adds ~400 words) and expand your intro and conclusion.`
    },
    {
      pattern: /add relevant keywords to your content/i,
      replacement: `Add your focus keyword "${input.focusKeyword || 'your keyword'}" in: the first paragraph, at least one H2 heading, and naturally 3-4 more times throughout the ${input.wordCount ?? 0}-word content on ${domain}.`
    },
    {
      pattern: /improve your page structure/i,
      replacement: `On ${domain}, add H2 subheadings every 200-300 words. Current structure has ${input.h2Count ?? 0} H2s. For ${input.wordCount ?? 0} words, you should have at least ${Math.floor((input.wordCount ?? 300) / 250)} H2 sections.`
    },
    {
      pattern: /^Fix: ONGOING$/i,
      replacement: '45 minutes'
    },
    {
      pattern: /timeToFix.*ongoing/i,
      replacement: '45 minutes'
    }
  ]

  return issues.map(issue => ({
    ...issue,
    // Fix generic timeToFix
    timeToFix: (issue.timeToFix?.toString() || '').toLowerCase().includes('ongoing') 
      ? '45 minutes' 
      : issue.timeToFix?.toString(),
    // Fix generic fix steps
    fixSteps: issue.fixSteps.map(step => {
      let fixedStep = step
      GENERIC_PATTERNS.forEach(({ pattern, replacement }) => {
        if (pattern.test(fixedStep)) {
          fixedStep = replacement
        }
      })
      // Inject domain if step doesn't mention specific location
      if (fixedStep && !fixedStep.includes(domain) && 
          !fixedStep.includes('WordPress') &&
          !fixedStep.includes('Google') &&
          !fixedStep.includes('plugin') &&
          fixedStep.length < 60) {
        fixedStep = `On ${domain}: ${fixedStep}`
      }
      return fixedStep
    }),
    // Fix generic explanations
    explanation: (issue.explanation?.toString() || '').includes('your page') || 
                 (issue.explanation?.toString() || '').includes(domain)
      ? issue.explanation?.toString() || ''
      : (issue.explanation?.toString() || '').replace(
          /this page|the page|your content/gi, 
          `the ${issue.category} on ${domain}`
        )
  }))
}
import { getKeywordDensity, fleschReadingEase } from '../utils/textAnalyzerUtils'

export type LoadingStage = {
  id: string
  label: string
  status: 'pending' | 'running' | 'complete' | 'error'
  ai?: 'gemini' | 'claude' | null
  icon?: string
  subStages?: string[]
  phase?: string
}

export function useReportGenerator() {
  const [report, setReport] = useState<FullSEOReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stages, setStages] = useState<LoadingStage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  function updateStage(id: string, status: LoadingStage['status']) {
    setStages(prev => prev.map(s => 
      s.id === id ? { ...s, status } : s
    ))
  }

  async function generateReport(rawInput: {
    url?: string
    title?: string
    metaDescription?: string
    content?: string
    urlSlug?: string
    focusKeyword?: string
    contentType?: string
    country?: Country
  }) {
    setIsLoading(true)
    setError(null)
    setProgress(0)

    // Initialize loading stages
    const initialStages: LoadingStage[] = [
      { id: 'Phase 1', label: 'Phase 1: Site Crawl & Keyword Discovery', status: 'pending', ai: 'gemini', icon: '🕷️', phase: 'Phase 1' },
      { id: 'Phase 2', label: 'Phase 2: Google Ranking Simulation', status: 'pending', ai: 'claude', icon: '📈', phase: 'Phase 2' },
      { id: 'Phase 3', label: 'Phase 3: LLM Visibility Check', status: 'pending', ai: null, icon: '👁️', phase: 'Phase 3', subStages: ['Gemini', 'ChatGPT', 'Perplexity'] },
      { id: 'Phase 4-1', label: 'Phase 4: Core SEO Analysis (Gemini)', status: 'pending', ai: 'gemini', icon: '⚡', phase: 'Phase 4', subStages: ['On-Page SEO', 'Technical', 'Content Quality', 'AEO', 'Topical Authority'] },
      { id: 'Phase 4-2', label: 'Phase 4: Deep Reasoning (Claude)', status: 'pending', ai: 'claude', icon: '🧠', phase: 'Phase 4', subStages: ['E-E-A-T Analysis', 'LLM Visibility'] },
      { id: 'competitor', label: 'Phase 4: Competitive Gaps', status: 'pending', ai: 'claude', icon: '🏆', phase: 'Phase 4' },
      { id: 'summary', label: 'Phase 4: Executive Summary', status: 'pending', ai: 'claude', icon: '📋', phase: 'Phase 4' },
    ]
    setStages(initialStages)

    try {
      const input: SEOInput = {
        ...rawInput,
        wordCount: countWords(rawInput.content ?? ''),
        h1Count: countHeadings(rawInput.content ?? '', 1),
        h2Count: countHeadings(rawInput.content ?? '', 2),
        imageCount: countImages(rawInput.content ?? ''),
        imagesWithoutAlt: 0, 
        internalLinks: countLinks(rawInput.content ?? '', 'internal'),
        externalLinks: countLinks(rawInput.content ?? '', 'external'),
        keywordDensity: getKeywordDensity(
          rawInput.content ?? '', rawInput.focusKeyword ?? ''
        ),
        fleschScore: fleschReadingEase(rawInput.content ?? ''),
        isHttps: rawInput.url?.startsWith('https') ?? true,
        hasSchema: false,
        hasFeaturedImage: false,
        daysSinceUpdated: 0,
      }

      setProgress(5)
      
      const targetCountry = rawInput.country || { code: 'us', name: 'United States', flag: '🇺🇸', gl: 'us', hl: 'en' }
      const targetUrl = rawInput.url || 'https://example.com'

      // PHASE 1: Keyword Discovery
      updateStage('Phase 1', 'running')
      const siteCrawl = await callGeminiJSON<any>(buildSiteCrawlPrompt(targetUrl, targetCountry)).catch(() => ({
          domain: targetUrl, inferredBusinessType: 'Unknown', inferredIndustry: 'Unknown', pagesFound: [], discoveredKeywords: [], topKeywords: [rawInput.focusKeyword || 'SEO'], primaryTopics: []
      }))
      updateStage('Phase 1', 'complete')
      setProgress(20)

      // Get top keywords to check
      const topKeywords = siteCrawl.topKeywords?.slice(0, 5) || [rawInput.focusKeyword || 'SEO']

      // PHASE 2: Google Rankings Simulation
      updateStage('Phase 2', 'running')
      const rawGoogleRankings = await callClaudeJSON<any>(buildGoogleRankingsPrompt(targetUrl, topKeywords, targetCountry, siteCrawl)).catch(() => ({
          country: targetCountry.name, countryFlag: targetCountry.flag, keywords: [], rankingKeywords: 0, notRankingKeywords: 0, averagePosition: 0, topOpportunities: [], simulationDisclaimer: ''
      }))
      
      const normalizeRanking = (raw: any) => ({
        keyword: raw?.keyword ?? '',
        country: raw?.country ?? targetCountry.name,
        countryFlag: raw?.countryFlag ?? targetCountry.flag,
        estimatedPosition: 
          raw?.estimatedPosition === null ||
          raw?.estimatedPosition === 'null' ||
          raw?.estimatedPosition === 'Not Ranking' ||
          raw?.estimatedPosition === undefined ||
          isNaN(Number(raw?.estimatedPosition))
            ? null 
            : Number(raw?.estimatedPosition),
        estimatedPage:
          raw?.estimatedPage === null ||
          raw?.estimatedPage === 'null' ||
          isNaN(Number(raw?.estimatedPage))
            ? null
            : Number(raw?.estimatedPage),
        positionLabel: raw?.positionLabel ?? 'Unknown',
        hasFeaturedSnippet: raw?.hasFeaturedSnippet === true || raw?.hasFeaturedSnippet === 'true',
        hasPeopleAlsoAsk: raw?.hasPeopleAlsoAsk === true || raw?.hasPeopleAlsoAsk === 'true',
        topCompetitors: raw?.topCompetitors ?? [],
        opportunity: raw?.opportunity ?? 'medium',
        simulationNote: raw?.simulationNote ?? 'Estimated based on SEO signals'
      });

      const rankingKeywordsArray = Array.isArray(rawGoogleRankings.keywords) ? rawGoogleRankings.keywords : [];
      const normalizedKeywords = rankingKeywordsArray.map(normalizeRanking);
      
      const googleRankings = {
          ...rawGoogleRankings,
          keywords: normalizedKeywords
      };

      updateStage('Phase 2', 'complete')
      setProgress(35)

      // PHASE 3: LLM Visibility Check (Parallel)
      updateStage('Phase 3', 'running')
      const llmVisibilityResults = await Promise.all([
          callGeminiJSON<any>(buildGeminiVisibilityPrompt(targetUrl, topKeywords, targetCountry, siteCrawl)),
          callClaudeJSON<any>(buildChatGPTVisibilityPrompt(targetUrl, topKeywords, targetCountry, siteCrawl)),
          callClaudeJSON<any>(buildPerplexityVisibilityPrompt(targetUrl, topKeywords, targetCountry, siteCrawl))
      ]).catch(() => ([{llmName:'Gemini', results:[]}, {llmName:'ChatGPT', results:[]}, {llmName:'Perplexity', results:[]}]))
      
      updateStage('Phase 3', 'complete')
      setProgress(50)

      // PHASE 4: Core Analysis
      updateStage('Phase 4-1', 'running')
      updateStage('Phase 4-2', 'running')

      // BATCH 1 — Gemini
      const geminiPromise = Promise.allSettled([
        callGeminiJSON<any>(buildCoreOnPagePrompt(input)),
        callGeminiJSON<any>(buildTechnicalSEOPrompt(input)),
        callGeminiJSON<any>(buildContentQualityPrompt(input)),
        callGeminiJSON<any>(buildAEOPrompt(input)),
        callGeminiJSON<any>(buildTopicalAuthorityPrompt(input)),
      ])

      // BATCH 2 — Claude 
      const claudeEEATPromise = callClaudeJSON<any>(
        buildClaudeEEATPrompt(input)
      ).catch(() => callGeminiJSON<any>(buildEEATPrompt(input))) // fallback

      const claudeLLMPromise = callClaudeJSON<any>(
        buildClaudeLLMVisibilityPrompt(input)
      ).catch(() => callGeminiJSON<any>(buildLLMVisibilityPrompt(input))) // fallback

      const [geminiResults, eeatResult, llmResult] = await Promise.all([
        geminiPromise,
        claudeEEATPromise,
        claudeLLMPromise,
      ])

      setProgress(75)
      updateStage('Phase 4-1', 'complete')
      updateStage('Phase 4-2', 'complete')

      const [onPageResult, technicalResult, contentResult, aeoResult, topicalResult] = geminiResults

      const onPage    = onPageResult.status === 'fulfilled' ? onPageResult.value : null
      const technical = technicalResult.status === 'fulfilled' ? technicalResult.value : null
      const content   = contentResult.status === 'fulfilled' ? contentResult.value : null
      const aeo       = aeoResult.status === 'fulfilled' ? aeoResult.value : null
      const topical   = topicalResult.status === 'fulfilled' ? topicalResult.value : null

      const scores = {
        onPage:    onPage?.onPageScore    ?? 50,
        technical: technical?.technicalScore ?? 50,
        content:   content?.contentScore   ?? 50,
        aeo:       aeo?.aeoScore           ?? 50,
        eeat:      eeatResult?.eeatScore   ?? 50,
        llm:       llmResult?.llmScore     ?? 50,
        topical:   topical?.topicalScore   ?? 50,
      }

      // Collect all issues so far
      const allIssues: SEOIssue[] = [
        ...(onPage?.issues ?? []),
        ...(technical?.issues ?? []),
        ...(content?.issues ?? []),
        ...(aeo?.issues ?? []),
        ...(eeatResult?.issues ?? []),
        ...(llmResult?.issues ?? []),
        ...(topical?.issues ?? []),
      ].sort((a, b) => a.priorityRank - b.priorityRank)

      setProgress(80)

      const specificIssues = makeIssuesSpecific(allIssues, input)

      updateStage('competitor', 'running')
      
      const competitorResult = await callClaudeJSON<any>(
        buildClaudeCompetitorPrompt(input, scores)
      ).catch(() => ({ 
        whatTopRankersHave: [],
        whatYoureMissing: [],
        quickWins: [],
        estimatedGapToClose: 'Unknown',
        biggestOpportunity: 'Improve content depth and keyword optimization'
      }))

      updateStage('competitor', 'complete')
      updateStage('summary', 'running')

      const summaryResult = await callClaudeJSON<any>(
        buildClaudeSummaryPrompt(
          input, scores, specificIssues, competitorResult
        )
      ).catch(() => ({
        executiveSummary: `Analysis complete for ${input.url || 'your content'}. Overall score: ${Math.round(Object.values(scores).reduce((a,b) => a+b, 0) / 7)}/100.`,
        topPriorities: specificIssues.slice(0, 5).map(i => i.title),
        trafficEstimate: {
          currentMonthlyVisitors: 0,
          potentialMonthlyVisitors: 0,
          lostVisitorsPerMonth: 0,
          lostVisitorsPerYear: 0,
          currentRankingPosition: 'Unknown',
          potentialRankingPosition: 'Unknown',
          estimatedKeywordVolume: 0,
          revenueImpact: 'Unknown'
        }
      }))

      updateStage('summary', 'complete')
      setProgress(95)

      // Build final report
      const overallScore = Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / 7
      )

      const readabilityIssues: SEOIssue[] = []
      if (input.fleschScore < 50) {
        readabilityIssues.push({
          id: 'read_1',
          category: 'readability',
          severity: 'warning',
          title: `Low Readability Score (${Math.round(input.fleschScore)}/100)`,
          summary: 'Content may be too complex for general audiences.',
          explanation: `Your Flesch Reading Ease score is ${Math.round(input.fleschScore)}/100.`,
          fixSteps: ['Shorten sentences', 'Use simple words'],
          impact: 'medium',
          effort: 'medium',
          timeToFix: '30 min',
          priorityRank: 50
        })
      }

      const rawLlmVis = llmVisibilityResults;
      
      const normalizeResult = (raw: any) => ({
        mentioned: raw?.mentioned === true || raw?.mentioned === 'true' || raw?.mentioned === 1,
        confidence: raw?.confidence ?? 'low',
        quote: raw?.quote ?? null,
        context: raw?.context ?? null,
        competitorsMentioned: raw?.competitorsMentioned ?? raw?.competitors_mentioned ?? [],
        simulationNote: raw?.simulationNote ?? raw?.simulation_note ?? 'AI simulated estimate'
      });
      
      const geminiResultsNormalized = Array.isArray(rawLlmVis[0]) ? rawLlmVis[0] : rawLlmVis[0]?.results ?? [];
      const chatgptResultsNormalized = Array.isArray(rawLlmVis[1]) ? rawLlmVis[1] : rawLlmVis[1]?.results ?? [];
      const perplexityResultsNormalized = Array.isArray(rawLlmVis[2]) ? rawLlmVis[2] : rawLlmVis[2]?.results ?? [];
      
      console.log('Gemini LLM raw:', rawLlmVis[0]);
      console.log('ChatGPT LLM raw:', rawLlmVis[1]);
      console.log('Perplexity LLM raw:', rawLlmVis[2]);

      const keywordResults = topKeywords.map((kw: string) => {
          const kwLower = kw.toLowerCase().trim();
          return {
              keyword: kw,
              gemini: normalizeResult(geminiResultsNormalized.find((r:any) => r?.keyword?.toLowerCase().trim() === kwLower)),
              chatgpt: normalizeResult(chatgptResultsNormalized.find((r:any) => r?.keyword?.toLowerCase().trim() === kwLower)),
              perplexity: normalizeResult(perplexityResultsNormalized.find((r:any) => r?.keyword?.toLowerCase().trim() === kwLower))
          }
      });
      
      console.log('Keyword results:', keywordResults);
      
      const chatgptScore = keywordResults.length > 0 ? Math.round((keywordResults.filter((r:any) => r.chatgpt.mentioned).length / keywordResults.length) * 100) : 0;
      const geminiScore = keywordResults.length > 0 ? Math.round((keywordResults.filter((r:any) => r.gemini.mentioned).length / keywordResults.length) * 100) : 0;
      const perplexityScore = keywordResults.length > 0 ? Math.round((keywordResults.filter((r:any) => r.perplexity.mentioned).length / keywordResults.length) * 100) : 0;
      const combinedLlmScore = Math.round((chatgptScore + geminiScore + perplexityScore) / 3);

      console.log('Scores:', { chatgptScore, geminiScore, perplexityScore });

      const mentionedKeywords = Array.from(new Set(
        keywordResults.filter((r:any) => r.gemini.mentioned || r.chatgpt.mentioned || r.perplexity.mentioned).map((r:any) => r.keyword)
      ));
      const notMentionedKeywords = topKeywords.filter((k: string) => !mentionedKeywords.includes(k));

      const competitorMentions = [
          ...keywordResults.flatMap((r:any) => r.gemini.competitorsMentioned || []),
          ...keywordResults.flatMap((r:any) => r.chatgpt.competitorsMentioned || []),
          ...keywordResults.flatMap((r:any) => r.perplexity.competitorsMentioned || [])
      ].filter(Boolean);
      
      const competitorCounts = competitorMentions.reduce((acc: Record<string, number>, curr: string) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
      }, {});
      const topCompetitorsInLLMs = Object.entries(competitorCounts).map(([domain, mentionCount]) => ({ domain, mentionCount })).sort((a: any, b: any) => (b.mentionCount as number) - (a.mentionCount as number)).slice(0, 5);

      const llmVisibilityReport = {
          overallScore: combinedLlmScore,
          domain: targetUrl,
          country: targetCountry.name,
          chatgptScore,
          geminiScore,
          perplexityScore,
          keywordResults,
          mentionedKeywords,
          notMentionedKeywords,
          topCompetitorsInLLMs,
          improvementTips: ["Publish original research and statistics", "Get cited in authoritative publications", "Create comprehensive, structured content"],
          estimatedTimeToImprove: "3-6 months"
      };

      const finalReport: FullSEOReport = {
        analyzedUrl: rawInput.url ?? 'Content Analysis',
        analyzedAt: new Date().toISOString(),
        pageType: onPage?.pageType ?? 'Blog Post',
        inputSummary: onPage?.quickSummary ?? 'SEO Analysis',
        
        targetCountry,
        siteCrawl,
        googleRankings,
        llmVisibilityReport,

        overallScore,
        onPageScore:   scores.onPage,
        technicalScore: scores.technical,
        contentScore:  scores.content,
        linksScore:    Math.min(100, (input.internalLinks * 15) + (input.externalLinks * 10)),
        aeoScore:      scores.aeo,
        eeatScore:     scores.eeat,
        llmScore:      scores.llm,

        executiveSummary: summaryResult?.executiveSummary ?? '',
        topPriorities:    summaryResult?.topPriorities ?? [],

        allIssues: [...specificIssues, ...readabilityIssues].sort((a, b) => a.priorityRank - b.priorityRank),
        quickWins: specificIssues.filter(i => i.effort === 'low' && (i.impact === 'high' || i.impact === 'medium')).slice(0, 5),

        trafficEstimate: summaryResult?.trafficEstimate ?? {
          currentMonthlyVisitors: 0,
          potentialMonthlyVisitors: 0,
          lostVisitorsPerMonth: 0,
          lostVisitorsPerYear: 0,
          currentRankingPosition: 'Unknown',
          potentialRankingPosition: 'Unknown',
          estimatedKeywordVolume: 0,
          revenueImpact: 'Unknown'
        },

        competitorInsights: summaryResult?.competitorInsights ?? {
          whatTopRankersHave: [],
          whatYoureMissing: [],
          quickWins: []
        },

        aeoAnalysis: {
          score:                    aeo?.aeoScore ?? 0,
          isFeaturedSnippetReady:   aeo?.isFeaturedSnippetReady ?? false,
          isPeopleAlsoAskReady:     aeo?.isPeopleAlsoAskReady ?? false,
          isVoiceSearchReady:       aeo?.isVoiceSearchReady ?? false,
          isAIOverviewReady:        aeo?.isAIOverviewReady ?? false,
          issues:                   aeo?.issues ?? [],
          tips:                     aeo?.tips ?? [],
          speakableSchemaNeeded:    aeo?.speakableSchemaNeeded ?? true,
          faqSchemaNeeded:          aeo?.faqSchemaNeeded ?? true,
        },

        eeatAnalysis: {
          score:             eeatResult?.eeatScore ?? 0,
          experienceScore:   eeatResult?.experienceScore ?? 0,
          expertiseScore:    eeatResult?.expertiseScore ?? 0,
          authorityScore:    eeatResult?.authorityScore ?? 0,
          trustScore:        eeatResult?.trustScore ?? 0,
          issues:            eeatResult?.issues ?? [],
          recommendations:   eeatResult?.recommendations ?? [],
        },

        llmVisibility: {
          score:                      llmResult?.llmScore ?? 0,
          likelyMentionedInChatGPT:   llmResult?.likelyMentionedInChatGPT ?? false,
          likelyMentionedInGemini:    llmResult?.likelyMentionedInGemini ?? false,
          likelyMentionedInPerplexity: llmResult?.likelyMentionedInPerplexity ?? false,
          issues:                     llmResult?.issues ?? [],
          improvementTips:            llmResult?.improvementTips ?? [],
        },

        topicalAuthority: {
          score:                      topical?.topicalScore ?? 0,
          topicCoverage:              topical?.topicCoverage ?? 'thin',
          missingSubtopics:           topical?.missingSubtopics ?? [],
          recommendedClusterTopics:   topical?.recommendedClusterTopics ?? [],
          pillarPageNeeded:           topical?.pillarPageNeeded ?? false,
        },

        readabilityAnalysis: {
          fleschScore:              input.fleschScore,
          grade:                    getReadabilityGrade(input.fleschScore),
          avgSentenceLength:        avgWordsPerSentence(rawInput.content ?? ''),
          passiveVoicePercentage:   detectPassiveVoice(rawInput.content ?? ''),
          complexWordsFound:        [],
          simplifiedAlternatives:   {},
          issues:                   readabilityIssues,
        },

        schemaAnalysis: {
          detected:           [],
          missing:            ['Article', 'FAQPage'],
          recommended:        ['Article', 'FAQPage', 'BreadcrumbList'],
          issues:             [],
          richResultsEligible: ['FAQ Dropdowns'],
        },
      }

      setReport(finalReport)
      setProgress(100)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setStages(prev => prev.map(s => 
        s.status === 'running' ? { ...s, status: 'error' } : s
      ))
    } finally {
      setIsLoading(false)
    }
  }

  function resetReport() {
    setReport(null)
    setIsLoading(false)
    setStages([])
    setProgress(0)
    setError(null)
  }

  return { 
    report, isLoading, stages, progress, 
    error, generateReport, resetReport 
  }
}
