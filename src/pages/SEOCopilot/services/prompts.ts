import { Country, SiteCrawlResult } from '../types/report.types';

const FIX_STEP_TEMPLATES = {
  title_too_long: (title: string, domain: string) => [
    `In your WordPress editor for ${domain}, find the SEO title field (in the SEO Copilot or Yoast metabox)`,
    `Your current title is: "${title}" (${title.length} chars). Remove words until under 60 characters`,
    `Prioritize keeping your focus keyword at the start — cut from the end first`,
    `Save and verify the character counter shows green`
  ],

  missing_meta: (keyword: string, domain: string) => [
    `Open the page editor on ${domain}`,
    `Find the Meta Description field in the SEO metabox`,
    `Write 150-160 characters that include "${keyword}" naturally`,
    `Use this formula: [What the page covers] + [Key benefit] + [Call to action]`,
    `Example: "Learn how to ${keyword} with our step-by-step guide. Includes real examples and expert tips. Start in 5 minutes."`
  ],

  thin_content: (wordCount: number, target: number, keyword: string, domain: string) => [
    `Your page on ${domain} has ${wordCount} words — you need ${target - wordCount} more words to reach ${target}`,
    `Open the page editor and expand these sections: add a FAQ section (5 questions about "${keyword}"), add a "Common Mistakes" section, expand your introduction`,
    `Use the SEO Copilot Content Brief to get a full outline for "${keyword}"`,
    `Aim to match or exceed competitor content depth — top rankers for "${keyword}" average ${target}-${target + 500} words`
  ],

  missing_keyword_title: (keyword: string, title: string, domain: string) => [
    `Go to the page editor on ${domain}`,
    `Your current title is: "${title}"`,
    `Rewrite it to start with "${keyword}" — Example: "${keyword}: ${title}"`,
    `Or restructure: "${keyword} — ${title.split(' ').slice(0, 4).join(' ')}..."`,
    `Keep it under 60 characters total`
  ],

  no_author_bio: (domain: string, contentType: string) => [
    `On ${domain}, install the "Simple Author Box" plugin (free, WordPress.org)`,
    `Go to Users → Your Profile → fill in Biography with your credentials`,
    `Add your professional photo to your user profile`,
    `The author box will now auto-appear below each ${contentType}`,
    `Also add: your LinkedIn URL, relevant certifications, and years of experience`
  ],

  no_faq_schema: (keyword: string, domain: string) => [
    `Add a FAQ section to this page on ${domain} with 5-6 questions people ask about "${keyword}"`,
    `Find these questions by Googling "${keyword}" and looking at the "People Also Ask" box`,
    `Write 40-60 word answers to each question`,
    `In SEO Copilot: go to the Schema tab in the metabox → select FAQPage → it will auto-detect your FAQ section`,
    `Verify at: search.google.com/test/rich-results`
  ]
}

const SPECIFICITY_RULES = `
CRITICAL SPECIFICITY RULES — MUST FOLLOW:

1. NEVER write generic fix steps like:
   ✗ "Develop and publish original content"
   ✗ "Ensure content meets minimum word count"
   ✗ "Add relevant keywords to your content"
   ✗ "Improve your page structure"
   
2. ALWAYS write specific fix steps like:
   ✓ "Go to [URL] → Edit this page in WordPress"
   ✓ "Your current word count is [X]. Add [Y] more words to reach the recommended 1,500"
   ✓ "Your title '[Title]' is [Length] characters. Shorten it to under 60 by removing '[words]'"
   ✓ "Add your focus keyword '[Keyword]' in the first paragraph of this page"

3. Fix steps must tell the user:
   - WHERE to go (WordPress editor, Google Search Console, your hosting panel, etc.)
   - WHAT exactly to change (the specific text, the specific field, the specific setting)
   - WHAT the result should look like after fixing

4. Explanations must mention actual data:
   ✗ "Your content is too short"
   ✓ "This page has [X] words. Top-ranking pages for '[Keyword]' typically have 1,500-2,500 words. You need to add approximately [Gap] more words to compete effectively."

5. timeToFix must be realistic:
   ✗ "ONGOING" 
   ✗ "Varies"
   ✓ "45 minutes" / "2 hours" / "15 minutes"
   Never use "ongoing" — everything has a one-time fix time

6. For URL-based analysis, always mention the domain:
   ✓ "On [domain], the page at [path] is missing..."
   ✓ "To fix this on [domain]:"
`;

export function buildCoreOnPagePrompt(input: SEOInput): string {
  const domain = input.url ? new URL(input.url).hostname : 'your site';
  const path = input.url ? new URL(input.url).pathname : '/';
  
  return `
You are a senior on-page SEO specialist auditing ${domain}${path}.
Analyze ONLY on-page SEO elements. Be hyper-specific.

DATA:
Domain: ${domain}
Path: ${path}
Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
Title: "${input.title || 'NOT SET'}" 
Title Length: ${input.title?.length ?? 0} characters
Meta Description: "${input.metaDescription || 'NOT SET'}"
Meta Length: ${input.metaDescription?.length ?? 0} characters
H1 Count: ${input.h1Count}
H2 Count: ${input.h2Count}
Word Count: ${input.wordCount}
Keyword Density: ${input.keywordDensity}%
Content Preview: "${input.content?.substring(0, 500) || 'NOT PROVIDED'}"

${SPECIFICITY_RULES}

Example of CORRECT fix step for ${domain}:
"Go to the WordPress editor for ${domain} → Edit this page. Your title '${input.title}' does not contain '${input.focusKeyword}'. Rewrite it to: '${input.focusKeyword}: ${input.title?.substring(0, 40)}' to improve ranking relevance."

Respond with ONLY this JSON:
{
  "onPageScore": <number>,
  "issues": [
    {
      "id": "op_<number>",
      "category": "title|meta|keyword|headings|content",
      "severity": "critical|error|warning|info|passing",
      "title": "<specific title naming the issue and page>",
      "summary": "<one sentence referencing ${domain}>",
      "explanation": "<paragraph with actual numbers from data>",
      "fixSteps": ["<specific step 1 on ${domain}>", "<step 2>", "<step 3>"],
      "exampleBad": "<current state on ${domain}>",
      "exampleGood": "<fixed state using ${input.focusKeyword}>",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "timeToFix": "<time in minutes>",
      "priorityRank": <number>
    }
  ],
  "quickSummary": "<one sentence overview for ${domain}>"
}
`;
}

export function buildTechnicalSEOPrompt(input: SEOInput): string {
  const domain = input.url ? new URL(input.url).hostname : 'your site';
  
  return `
You are a technical SEO specialist auditing ${domain}.
Analyze technical factors. Every fix must be actionable on ${domain}.

DATA:
Domain: ${domain}
URL: "${input.url || 'NOT PROVIDED'}"
Has HTTPS: ${input.isHttps}
Images Without Alt: ${input.imagesWithoutAlt}
Total Images: ${input.imageCount}
Internal Links: ${input.internalLinks}
External Links: ${input.externalLinks}

${SPECIFICITY_RULES}

Example:
✗ "Add alt text to images"
✓ "On ${domain}, you have ${input.imagesWithoutAlt} images missing alt tags. Go to your Media Library in WordPress, click each image, and add a descriptive 'Alt Text' that includes '${input.focusKeyword}' where relevant."

Respond with ONLY this JSON:
{
  "technicalScore": <number>,
  "issues": [
    {
      "id": "tech_<number>",
      "category": "technical|images|links|schema",
      "severity": "critical|error|warning|info",
      "title": "<title mentioning ${domain}>",
      "summary": "<one sentence>",
      "explanation": "<technical explanation with counts>",
      "fixSteps": ["<step 1 on ${domain}>", "<step 2>"],
      "exampleBad": "<bad technical state>",
      "exampleGood": "<fixed technical state>",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "timeToFix": "<minutes>",
      "priorityRank": <number>
    }
  ],
  "quickSummary": "<summary for ${domain}>"
}
`;
}

export function buildContentQualityPrompt(input: SEOInput): string {
  const domain = input.url ? new URL(input.url).hostname : 'your site';
  const wordGap = Math.max(0, 1500 - input.wordCount);
  
  return `
You are a content quality strategist auditing ${domain}.
Analyze content depth and quality. No generic advice.

DATA:
Domain: ${domain}
Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
Word Count: ${input.wordCount}
Recommended: 1500+
Word Gap: ${wordGap}
H2 Count: ${input.h2Count}
Content Preview: "${input.content?.substring(0, 1000) || 'NOT PROVIDED'}"

${SPECIFICITY_RULES}

Example:
✓ "Your current word count on ${domain} is ${input.wordCount}. Add ${wordGap} more words to reach the 1,500 target. Add a 'Frequenty Asked Questions' section about '${input.focusKeyword}' to quickly add ~300 high-value words."

Respond with ONLY this JSON:
{
  "contentScore": <number>,
  "issues": [
    {
      "id": "content_<number>",
      "category": "content|freshness",
      "severity": "critical|error|warning|info",
      "title": "<title referencing ${input.wordCount} words>",
      "summary": "<sentence about ${domain}>",
      "explanation": "<data-driven explanation mentioning ${wordGap} gap>",
      "fixSteps": ["<specific step for ${domain}>", "<step 2>"],
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "timeToFix": "<minutes>",
      "priorityRank": <number>
    }
  ],
  "recommendedWordCount": 1500,
  "wordCountGap": ${wordGap},
  "quickSummary": "<summary for ${domain}>"
}
`;
}

export function buildAEOPrompt(input: SEOInput): string {
  const domain = input.url ? new URL(input.url).hostname : 'your site';
  
  return `
You are an AEO (Answer Engine Optimization) specialist auditing ${domain}.
Help this page get cited by ChatGPT, Gemini, and Featured Snippets.

DATA:
Domain: ${domain}
Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
Word Count: ${input.wordCount}
Has FAQ: ${input.content?.toLowerCase().includes('faq') || false}
Has Direct Answers: ${/^(yes|no|the answer is)/im.test(input.content || '')}

${SPECIFICITY_RULES}

Example:
✓ "On ${domain}, your opening paragraph is missing a direct answer. Add a 40-word 'Summary Box' at the top that directly answers 'What is ${input.focusKeyword}?' to trigger a Featured Snippet."

Respond with ONLY this JSON:
{
  "aeoScore": <number>,
  "isFeaturedSnippetReady": <boolean>,
  "isPeopleAlsoAskReady": <boolean>,
  "isVoiceSearchReady": <boolean>,
  "isAIOverviewReady": <boolean>,
  "issues": [
    {
      "id": "aeo_<number>",
      "title": "<AEO title for ${domain}>",
      "summary": "<one sentence>",
      "explanation": "<why AI won't cite this specific content>",
      "fixSteps": ["<step 1 on ${domain}>", "<step 2>"],
      "impact": "high|medium|low",
      "effort": "medium|high",
      "timeToFix": "<minutes>",
      "priorityRank": <number>
    }
  ],
  "tips": ["<specific tip for ${domain}>", "<tip 2>", "<tip 3>"],
  "quickSummary": "<AEO summary for ${domain}>"
}
`;
}

export function buildEEATPrompt(input: SEOInput): string {
  const domain = input.url 
    ? (() => { try { return new URL(input.url).hostname } 
               catch { return input.url } })() 
    : 'your site'
  const path = input.url 
    ? (() => { try { return new URL(input.url).pathname } 
               catch { return '/' } })()
    : '/'
  const wordGap = Math.max(0, 1500 - (input.wordCount ?? 0))

  return `
You are a Google E-E-A-T specialist writing a specific audit for the page: ${input.url || 'the analyzed content'}

SPECIFIC PAGE CONTEXT:
Domain: ${domain}
Page Path: ${path}
Page Title: "${input.title || 'NOT SET'}"
Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
Word Count: ${input.wordCount ?? 0} words
${wordGap > 0 ? `Words Needed to Reach 1,500: ${wordGap}` : 'Word count is sufficient'}
Content Type: ${input.contentType || 'Blog Post'}
HTTPS Active: ${input.isHttps}
Has Author Info: ${input.content?.toLowerCase().includes('author') || false}
Has External Citations: ${(input.externalLinks ?? 0) > 0}
External Links: ${input.externalLinks ?? 0}
Has Statistics/Data: ${/\d+%|\$\d+|\d+ (million|billion)/.test(input.content || '')}
Content Preview: "${input.content?.substring(0, 600) || 'No content provided'}"

${SPECIFICITY_RULES}

IMPORTANT: Every fix step must mention "${domain}" or the specific page. Never write generic advice.

Example of WRONG fix step:
"Add author information to demonstrate expertise"

Example of CORRECT fix step:
"On ${domain}, add an author bio box below this ${input.contentType || 'post'}. Include: your name, your credentials related to '${input.focusKeyword}', a professional photo, and links to your social profiles or other published work. In WordPress: Appearance → Theme Options → Author Box, or install the 'Simple Author Box' plugin."

Respond with ONLY this JSON:
{
  "eeatScore": <realistic score, NEVER 0 unless empty page>,
  "experienceScore": <0-100>,
  "expertiseScore": <0-100>,
  "authorityScore": <0-100>,
  "trustScore": <minimum 25 if HTTPS is true>,
  "issues": [
    {
      "id": "eeat_1",
      "category": "eeat",
      "severity": "critical|error|warning|info",
      "title": "<specific title mentioning the page or issue>",
      "summary": "<one sentence referencing ${domain} or the specific content>",
      "explanation": "<paragraph that mentions the actual word count, actual domain, actual content type, and WHY this specific E-E-A-T signal is missing from THIS page>",
      "fixSteps": [
        "<Step 1: Go to [specific place] on ${domain} and do [specific thing]>",
        "<Step 2: [Specific action with expected result]>",
        "<Step 3: [Verification step - how to confirm it's fixed]>"
      ],
      "exampleBad": "<what the current state looks like>",
      "exampleGood": "<exactly what it should look like after fixing>",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "timeToFix": "<realistic time e.g. '30 minutes', never 'ongoing'>",
      "priorityRank": <number>
    }
  ],
  "recommendations": [
    "<Specific recommendation for ${domain} based on their content type>",
    "<Recommendation 2>",
    "<Recommendation 3>",
    "<Recommendation 4>"
  ],
  "quickSummary": "<one sentence mentioning ${domain} and their specific E-E-A-T status>"
}

SCORING RULES:
- trustScore minimum = 25 if HTTPS, 10 if not
- experienceScore: +30 if content preview shows examples/screenshots/personal experience, +20 if case studies
- expertiseScore: +20 per 500 words (capped at 80), +20 if external citations exist
- authorityScore: +15 per external link (capped at 60), +20 if author info present
- NEVER return 0 for any score
`;
}

export function buildLLMVisibilityPrompt(input: SEOInput): string {
  const domain = input.url ? new URL(input.url).hostname : 'your site';
  
  return `
You are an AI/LLM visibility specialist auditing ${domain}.
Analyze probability of being cited by LLMs. Focus on hard data on ${domain}.

DATA:
Domain: ${domain}
Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
Word Count: ${input.wordCount}
Has Statistics: ${/\d+%|\$\d+/.test(input.content || '')}
External Links: ${input.externalLinks}

${SPECIFICITY_RULES}

Example:
✓ "Your post on ${domain} is missing hard data citations. Add at least 3 factual statistics about '${input.focusKeyword}' from authoritative sources like .gov or .edu sites to increase citation probability in Perplexity and Gemini."

Respond with ONLY this JSON:
{
  "llmScore": <number>,
  "likelyMentionedInChatGPT": <boolean>,
  "likelyMentionedInGemini": <boolean>,
  "likelyMentionedInPerplexity": <boolean>,
  "issues": [
    {
      "id": "llm_<number>",
      "title": "<LLM issue for ${domain}>",
      "summary": "<sentence>",
      "explanation": "<why LLMs skip this ${input.wordCount} word content>",
      "fixSteps": ["<step 1 for ${domain}>", "<step 2>"],
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "timeToFix": "<minutes>",
      "priorityRank": <number>
    }
  ],
  "improvementTips": ["<tip 1 for ${domain}>", "<tip 2>"],
  "quickSummary": "<summary for ${domain}>"
}
`;
}

export function buildTopicalAuthorityPrompt(input: SEOInput): string {
  const domain = input.url ? new URL(input.url).hostname : 'your site';
  
  return `
You are a topical authority expert auditing ${domain}.
Assess coverage of "${input.focusKeyword}". Be specific about missing subtopics on ${domain}.

DATA:
Domain: ${domain}
Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
H2 Count: ${input.h2Count}
Internal Links: ${input.internalLinks}

${SPECIFICITY_RULES}

Example:
✓ "On ${domain}, you are missing a section on 'Advanced [Keyword] Techniques'. Add an H2 section covering this subtopic to provide the 'Comprehensive' coverage Google expects for topical authority."

Respond with ONLY this JSON:
{
  "topicalScore": <number>,
  "topicCoverage": "thin|moderate|comprehensive",
  "missingSubtopics": ["<specific missing part of ${input.focusKeyword}>", "<subtopic 2>"],
  "recommendedClusterTopics": ["<supporting post for ${domain}>", "<post 2>"],
  "issues": [
    {
      "id": "topical_<number>",
      "title": "<topical issue on ${domain}>",
      "summary": "<sentence>",
      "explanation": "<why coverage is ${input.wordCount} instead of comprehensive>",
      "fixSteps": ["<step 1 on ${domain}>", "<step 2>"],
      "impact": "high|medium|low",
      "effort": "medium|high",
      "timeToFix": "<minutes>",
      "priorityRank": <number>
    }
  ],
  "quickSummary": "<summary for ${domain}>"
}
`;
}

export function buildExecutiveSummaryPrompt(
  input: SEOInput,
  scores: {
    onPage: number, technical: number, content: number,
    aeo: number, eeat: number, llm: number, topical: number
  },
  totalIssues: number,
  criticalCount: number,
  topIssues: string[]
): string {
  const domain = input.url ? new URL(input.url).hostname : 'your site';
  const overall = Math.round((scores.onPage + scores.technical + scores.content + scores.aeo + scores.eeat + scores.llm + scores.topical) / 7);
  
  return `
You are a senior SEO consultant writing an executive summary for ${domain}.
Total Issues: ${totalIssues} (${criticalCount} Critical).

${SPECIFICITY_RULES}

Respond with ONLY this JSON:
{
  "executiveSummary": "<3 paragraphs mentioning ${domain} and specific gaps found>",
  "topPriorities": [
    "<specific action on ${domain} related to ${topIssues[0]}>",
    "<action 2>", "<action 3>", "<action 4>", "<action 5>"
  ],
  "trafficEstimate": {
    "currentMonthlyVisitors": <number>,
    "potentialMonthlyVisitors": <number>,
    "lostVisitorsPerMonth": <number>,
    "lostVisitorsPerYear": <number>,
    "currentRankingPosition": "<string>",
    "potentialRankingPosition": "<string>",
    "estimatedKeywordVolume": <number>,
    "revenueImpact": "<string>"
  },
  "competitorInsights": {
    "whatTopRankersHave": ["<specific metric for ${input.focusKeyword}>", "<insight 2>"],
    "whatYoureMissing": ["<specific gap on ${domain}>", "<gap 2>"],
    "quickWins": ["<win 1 on ${domain}>", "<win 2>"]
  }
}
`;
}


export interface CompetitorInsight {
  whatTopRankersHave: string[];
  whatYoureMissing: string[];
  quickWins: string[];
  estimatedGapToClose?: string;
  biggestOpportunity?: string;
}

export function extractDomain(url?: string): string {
  if (!url) return 'your site'
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0]
  }
}

export function buildClaudeEEATPrompt(input: SEOInput): string {
  const domain = extractDomain(input.url)
  const wordGap = Math.max(0, 1500 - (input.wordCount ?? 0))

  return `
Analyze the E-E-A-T (Experience, Expertise, Authority, 
Trust) signals for this specific page and provide 
a detailed audit with actionable fix steps.

PAGE DETAILS:
- URL: ${input.url || 'Content analysis (no URL provided)'}
- Domain: ${domain}
- Page Title: "${input.title || 'NOT SET'}"
- Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
- Content Type: ${input.contentType || 'Blog Post'}
- Word Count: ${input.wordCount ?? 0} words
  ${wordGap > 0 ? `(needs ${wordGap} more words to reach 1,500)` : '(sufficient length)'}
- HTTPS: ${input.isHttps ? 'Yes ✓' : 'No ✗ — critical trust issue'}
- External Citations: ${input.externalLinks ?? 0} links
- Author Mentioned: ${input.content?.toLowerCase().includes('author') || false}
- Has Statistics: ${/\d+%|\$\d+|\d+ (million|billion|thousand)/.test(input.content || '')}
- Content Preview: "${input.content?.substring(0, 800) || 'No content provided'}"

SCORING RULES — apply these exactly:
- trustScore: start at 40. +30 if HTTPS. +15 if contact 
  info visible. +15 if external citations. Min score: 25
- experienceScore: start at 30. +25 if content shows 
  first-hand examples or screenshots. +20 if case 
  studies. +15 if personal anecdotes. +10 per 500 words
- expertiseScore: start at 30. +15 per 500 words (max 
  +45). +20 if external citations exist. +15 if 
  structured with clear H2s. +20 if statistics present
- authorityScore: start at 20. +15 per external link 
  (max +45). +20 if author bio present. +15 if 
  credentials mentioned
- NEVER return any score as 0

Return this exact JSON structure. 
Be specific — reference "${domain}" and 
"${input.focusKeyword}" in every fix step:

{
  "eeatScore": <average of 4 scores>,
  "experienceScore": <calculated score>,
  "expertiseScore": <calculated score>,
  "authorityScore": <calculated score>,
  "trustScore": <calculated score, min 25 if HTTPS>,
  "issues": [
    {
      "id": "eeat_1",
      "category": "eeat",
      "severity": "critical|error|warning|info",
      "title": "<specific title, e.g. 'No Author Bio on ${domain}'>",
      "summary": "<one sentence mentioning ${domain} or the specific issue>",
      "explanation": "<2-3 sentences: what's missing on ${domain}, why it matters for '${input.focusKeyword}' rankings, what Google's QRG says about it>",
      "fixSteps": [
        "<Step 1: Exact location on ${domain} where to make the change>",
        "<Step 2: Exact text or content to add, specific to '${input.focusKeyword}'>",
        "<Step 3: How to verify the fix worked>"
      ],
      "exampleBad": "<current state on ${domain}>",
      "exampleGood": "<exactly what it should look like after fixing>",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "timeToFix": "<specific time e.g. '30 minutes', never 'ongoing'>",
      "priorityRank": <1-10>
    }
  ],
  "recommendations": [
    "<Specific recommendation for ${domain}: what to do, where, and expected SEO impact>",
    "<Recommendation 2 specific to '${input.focusKeyword}'>",
    "<Recommendation 3>",
    "<Recommendation 4>"
  ],
  "quickSummary": "<one sentence: current E-E-A-T status of ${domain} for '${input.focusKeyword}'>"
}
`
}

export function buildClaudeLLMVisibilityPrompt(
  input: SEOInput
): string {
  const domain = extractDomain(input.url)

  return `
Analyze whether this page will be cited or referenced 
by AI systems (ChatGPT, Claude, Gemini, Perplexity).

This is called LLM Visibility — it's the new frontier 
of SEO as more users get answers from AI instead of 
clicking Google results.

PAGE DETAILS:
- URL: ${input.url || 'Content analysis'}
- Domain: ${domain}
- Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
- Word Count: ${input.wordCount ?? 0}
- Content Depth: ${input.h2Count ?? 0} sections (H2s)
- External Citations: ${input.externalLinks ?? 0}
- Has Original Data/Stats: ${/\d+%|\$\d+|\d+ (million|billion|thousand|study|survey|research)/.test(input.content || '')}
- Has Direct Answers: ${/^(yes|no|the answer|in short|briefly|to summarize)/im.test(input.content || '')}
- Has Schema: ${input.hasSchema}
- Content Preview: "${input.content?.substring(0, 700) || 'No content provided'}"

LLM CITATION SCORING (be specific):
LLMs cite content that is:
1. Authoritative — domain authority signals (+20 if 
   well-known domain, +10 if has external citations)
2. Comprehensive — covers topic fully (+20 if 1500+ 
   words, +10 if 800-1500, +0 if under 800)
3. Structured — easy for LLMs to parse (+15 if clear 
   H2 structure, +10 if has lists/tables)
4. Factual — has verifiable data (+15 if statistics, 
   +10 if cites sources)
5. Trustworthy — HTTPS + transparency (+10 if HTTPS)

Assess likelihood per LLM:
- ChatGPT: favors authoritative domains, comprehensive 
  content, cited sources
- Gemini: favors Google-indexed, schema-marked, 
  structured content
- Perplexity: favors recent content, direct answers, 
  cited sources

Return ONLY this JSON:
{
  "llmScore": <0-100 based on scoring above>,
  "likelyMentionedInChatGPT": <boolean with reasoning>,
  "likelyMentionedInGemini": <boolean>,
  "likelyMentionedInPerplexity": <boolean>,
  "issues": [
    {
      "id": "llm_1",
      "category": "llm",
      "severity": "critical|error|warning|info",
      "title": "<specific issue e.g. 'No Citable Statistics on ${domain}'>",
      "summary": "<why ${domain} won't be cited for '${input.focusKeyword}'>",
      "explanation": "<specific: what's missing, which LLMs this affects, and quantified impact>",
      "fixSteps": [
        "<Step 1: specific action on ${domain}>",
        "<Step 2: specific content to add for '${input.focusKeyword}'>",
        "<Step 3: how to verify>"
      ],
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "timeToFix": "<specific time>",
      "priorityRank": <number>
    }
  ],
  "improvementTips": [
    "<Specific tip for getting ${domain} cited for '${input.focusKeyword}' by ChatGPT>",
    "<Tip for Gemini visibility>",
    "<Tip for Perplexity visibility>",
    "<General LLM optimization tip>"
  ],
  "quickSummary": "<one sentence: ${domain}'s LLM visibility status for '${input.focusKeyword}'>"
}
`
}

export function buildClaudeCompetitorPrompt(
  input: SEOInput,
  scores: Record<string, number>
): string {
  const domain = extractDomain(input.url)

  return `
You are a competitive SEO analyst. Analyze what 
top-ranking competitors likely have that this page 
is missing, for the keyword "${input.focusKeyword}".

PAGE DETAILS:
- Domain: ${domain}
- Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
- Content Type: ${input.contentType || 'Blog Post'}
- Word Count: ${input.wordCount ?? 0}
- Current Scores: On-Page ${scores.onPage}/100, 
  Content ${scores.content}/100, 
  Technical ${scores.technical}/100
- H2 Sections: ${input.h2Count ?? 0}
- Has FAQ: ${input.content?.toLowerCase().includes('faq') || false}
- Has Schema: ${input.hasSchema}
- External Links: ${input.externalLinks ?? 0}
- Content Preview: "${input.content?.substring(0, 500) || 'No content provided'}"

Based on typical top-ranking pages for 
"${input.focusKeyword}", provide a specific 
competitive gap analysis.

Return ONLY this JSON:
{
  "whatTopRankersHave": [
    "<Specific thing #1 top rankers for '${input.focusKeyword}' have that ${domain} doesn't>",
    "<Specific thing #2 — include typical word counts, section types, features>",
    "<Specific thing #3>",
    "<Specific thing #4>",
    "<Specific thing #5>"
  ],
  "whatYoureMissing": [
    "<Most critical gap for ${domain} — be specific about what to add>",
    "<Second gap with specific recommendation>",
    "<Third gap>"
  ],
  "quickWins": [
    "<Win 1: specific action for ${domain} that takes under 30 min>",
    "<Win 2: specific action under 30 min>",
    "<Win 3: specific action under 30 min>"
  ],
  "estimatedGapToClose": "<How long to reach competitive parity e.g. '2-4 weeks of content work'>",
  "biggestOpportunity": "<The single highest-ROI improvement ${domain} can make for '${input.focusKeyword}'>"
}
`
}

export function buildClaudeSummaryPrompt(
  input: SEOInput,
  scores: Record<string, number>,
  allIssues: any[],
  competitorInsights: CompetitorInsight
): string {
  const domain = extractDomain(input.url)
  const overallScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / 
    Object.values(scores).length
  )
  const criticalIssues = allIssues
    .filter(i => i.severity === 'critical')
    .map(i => i.title)
    const topIssues = allIssues
      .slice(0, 5)
      .map(i => `${(i.severity || '').toUpperCase()}: ${i.title}`)

  return `
Write a comprehensive executive summary for an SEO 
audit of ${domain}.

COMPLETE AUDIT RESULTS:
Overall Score: ${overallScore}/100
- On-Page SEO: ${scores.onPage}/100
- Technical SEO: ${scores.technical}/100
- Content Quality: ${scores.content}/100
- AEO Score: ${scores.aeo}/100
- E-E-A-T Score: ${scores.eeat}/100
- LLM Visibility: ${scores.llm}/100
- Topical Authority: ${scores.topical}/100

Focus Keyword: "${input.focusKeyword || 'NOT SET'}"
Content Type: ${input.contentType || 'Blog Post'}
Word Count: ${input.wordCount ?? 0} words
Domain: ${domain}
URL: ${input.url || 'Content analysis'}

Critical Issues Found:
${criticalIssues.length > 0 ? criticalIssues.map((t, i) => `${i+1}. ${t}`).join('\n') : 'None'}

Top 5 Priority Issues:
${topIssues.length > 0 ? topIssues.map((t, i) => `${i+1}. ${t}`).join('\n') : 'None'}

Biggest Competitive Gap:
${competitorInsights.biggestOpportunity || 'Not analyzed'}

Write a professional, specific 3-paragraph executive 
summary. Paragraph 1: overall health with specific 
score context. Paragraph 2: the 2-3 most impactful 
problems WITH specific business impact for "${input.focusKeyword}". 
Paragraph 3: strategic roadmap with realistic timeline.

Also calculate realistic traffic estimates based on 
the scores and keyword.

Return ONLY this JSON:
{
  "executiveSummary": "<3 paragraphs, professional, specific to ${domain} and '${input.focusKeyword}', mentions actual scores>",
  "topPriorities": [
    "<Priority 1: specific action for ${domain} with expected impact>",
    "<Priority 2>",
    "<Priority 3>",
    "<Priority 4>",
    "<Priority 5>"
  ],
  "trafficEstimate": {
    "currentMonthlyVisitors": <realistic estimate: score/100 * keyword_volume * 0.1>,
    "potentialMonthlyVisitors": <if all critical issues fixed: score+20/100 * keyword_volume * 0.2>,
    "lostVisitorsPerMonth": <potential minus current>,
    "lostVisitorsPerYear": <monthly * 12>,
    "currentRankingPosition": "<e.g. 'Page 2-3' based on score ${overallScore}/100>",
    "potentialRankingPosition": "<e.g. 'Page 1, position 3-7' if critical issues fixed>",
    "estimatedKeywordVolume": <monthly searches for '${input.focusKeyword}', realistic estimate>,
    "revenueImpact": "<monthly revenue potential if site converts at 2% and $50 avg value>"
  }
}
`
}

export function buildSiteCrawlPrompt(
  url: string, 
  country: Country
): string {
  const domain = extractDomain(url)
  
  return `
You are an SEO specialist analyzing a website to 
discover its most important keywords.

WEBSITE TO ANALYZE: ${url}
TARGET MARKET: ${country.name} (${country.code.toUpperCase()})
DOMAIN: ${domain}

Based on the domain name and URL structure, intelligently
infer what this website is about and what services/products
it likely offers. Then generate realistic keyword data.

For example:
- "ayishamuneer.com" → likely a personal brand, 
  freelancer, or consultant
- "techagency.com" → digital agency, web development
- "restaurant-dubai.com" → food, dining, restaurant

Analyze and respond with ONLY this JSON:
{
  "domain": "${domain}",
  "inferredBusinessType": "<what this business likely does>",
  "inferredIndustry": "<industry category>",
  "pagesFound": [
    {
      "url": "${url}",
      "pageType": "homepage",
      "title": "<inferred page title>",
      "description": "<what this page likely covers>"
    },
    {
      "url": "${url}/services",
      "pageType": "service",
      "title": "<inferred services page title>",
      "description": "<inferred services>"
    }
    // add 3-6 total pages based on domain inference
  ],
  "discoveredKeywords": [
    {
      "keyword": "<most important keyword for this business>",
      "intent": "commercial|transactional|informational|navigational",
      "sourcePageType": "homepage|service|product|blog",
      "sourcePage": "${url}",
      "estimatedVolume": <monthly searches in ${country.name}>,
      "difficulty": "low|medium|high",
      "priority": 1
    }
    // Generate 10 keywords total, prioritized 1-10
    // Make them SPECIFIC to the inferred business
    // Include the country/city if relevant
    // e.g. for Dubai business: "web design dubai", 
    //      "digital agency uae", etc.
  ],
  "topKeywords": [
    "<keyword 1>",
    "<keyword 2>",
    "<keyword 3>",
    "<keyword 4>",
    "<keyword 5>",
    "<keyword 6>",
    "<keyword 7>",
    "<keyword 8>",
    "<keyword 9>",
    "<keyword 10>"
  ],
  "primaryTopics": [
    "<main topic cluster 1>",
    "<main topic cluster 2>",
    "<main topic cluster 3>"
  ]
}

IMPORTANT:
- Keywords must be specific to ${country.name}
- Include location-based keywords if business is local
- Volume estimates should reflect ${country.name} market
- Be realistic — not every business has high-volume keywords
`
}

export function buildGoogleRankingsPrompt(
  domain: string,
  keywords: string[],
  country: Country,
  crawlData: SiteCrawlResult
): string {
  return `
You are simulating Google search results for a specific
domain and keyword set. This is an ESTIMATED simulation
based on typical SEO signals — not real-time data.

DOMAIN BEING ANALYZED: ${domain}
BUSINESS TYPE: ${crawlData.inferredBusinessType}
TARGET COUNTRY: ${country.name} (Google ${country.gl})
KEYWORDS TO CHECK: 
${keywords.map((k, i) => `${i+1}. "${k}"`).join('\n')}

For each keyword, estimate where ${domain} likely ranks
in Google ${country.name} results based on:
- Domain age signals (inferred from domain)
- Content relevance to the keyword
- Typical competition for this keyword type
- Whether the keyword includes the location

RANKING LOGIC:
- Very competitive keywords (high volume): most sites 
  rank page 2-5 unless they're well-established
- Local/niche keywords: smaller sites can rank page 1
- Brand keywords (domain name): usually page 1
- Long-tail specific keywords: higher chance page 1

Respond with ONLY this JSON:
{
  "country": "${country.name}",
  "countryFlag": "${country.flag}",
  "keywords": [
    {
      "keyword": "<keyword exactly as provided>",
      "country": "${country.name}",
      "countryFlag": "${country.flag}",
      "estimatedPosition": <number 1-100, or null if not ranking>,
      "estimatedPage": <1, 2, 3, etc. or null>,
      "positionLabel": "<e.g. 'Position 7' or 'Page 2' or 'Not Ranking'>",
      "hasFeaturedSnippet": <boolean - does a featured snippet exist for this keyword>,
      "hasPeopleAlsoAsk": <boolean>,
      "topCompetitors": [
        "<domain likely ranking above ${domain} for this keyword>",
        "<competitor 2>",
        "<competitor 3>"
      ],
      "opportunity": "high|medium|low",
      "simulationNote": "Estimated based on SEO signals — install the plugin for live tracking"
    }
  ],
  "rankingKeywords": <count of keywords estimated on page 1>,
  "notRankingKeywords": <count estimated not ranking>,
  "averagePosition": <average of all estimated positions>,
  "topOpportunities": [
    "<keyword with best chance to improve ranking quickly>",
    "<opportunity 2>",
    "<opportunity 3>"
  ],
  "simulationDisclaimer": "These rankings are AI-estimated based on domain and keyword signals. For real-time ranking data across all keywords, install the SEO Copilot WordPress plugin."
}
`
}

export function buildGeminiVisibilityPrompt(
  domain: string,
  keywords: string[],
  country: Country,
  crawlData: SiteCrawlResult
): string {
  return `
You are simulating how Gemini AI would respond when 
users search for these keywords. Based on your knowledge
of ${domain} and ${crawlData.inferredBusinessType}, 
assess whether Gemini would mention this domain.

DOMAIN: ${domain}
BUSINESS: ${crawlData.inferredBusinessType}
COUNTRY CONTEXT: ${country.name}
KEYWORDS:
${keywords.map((k, i) => `${i+1}. "${k}"`).join('\n')}

For EACH keyword, simulate what Gemini would say and
whether ${domain} would be mentioned.

A domain gets mentioned if:
- It's well-known in its niche
- It has authoritative content on the topic
- It's been referenced across multiple sources
- It has strong brand signals

Respond with ONLY this JSON:
{
  "llmName": "Gemini",
  "results": [
    {
      "keyword": "<exact keyword>",
      "mentioned": <true|false>,
      "confidence": "high|medium|low",
      "quote": "<if mentioned: the exact simulated quote where ${domain} appears, null if not mentioned>",
      "context": "<simulated response context — what Gemini would say about this keyword>",
      "competitorsMentioned": [
        "<domain that Gemini would more likely mention instead>",
        "<competitor 2>"
      ],
      "simulationNote": "AI-simulated estimate — actual Gemini responses vary"
    }
  ]
}

IMPORTANT RULES:
- Be REALISTIC — most small/medium businesses are NOT 
  mentioned in LLM responses unless they're notable
- Only mark mentioned=true if the domain is genuinely
  well-known enough for an LLM to reference it
- The quote must be a realistic LLM-style response 
  that naturally includes the domain
- competitorsMentioned should be realistic big players
  in that space (e.g. for web design: Toptal, Upwork,
  Clutch, etc.)

CRITICAL FORMATTING RULES:
- "mentioned" MUST be a strict JSON boolean (true or false), NEVER a string ("true" or "false").
- The "keyword" field MUST match EXACTLY the keyword given to you.
- Do NOT wrap your response in any extra objects. Pay attention to the required JSON structure.
- For most generic keywords, "mentioned" should be false. Be realistic about what AI models cite.
`
}

export function buildChatGPTVisibilityPrompt(
  domain: string,
  keywords: string[],
  country: Country,
  crawlData: SiteCrawlResult
): string {
  return `
Simulate how ChatGPT (GPT-4) would respond when users 
ask about these keywords, and assess whether ${domain} 
would be mentioned.

DOMAIN: ${domain}
BUSINESS TYPE: ${crawlData.inferredBusinessType}
INFERRED INDUSTRY: ${crawlData.inferredIndustry}
COUNTRY: ${country.name}
KEYWORDS:
${keywords.map((k, i) => `${i+1}. "${k}"`).join('\n')}

ChatGPT mentions a domain/brand when:
- It's a well-known brand in that industry
- It has been cited in training data from authoritative sources
- It's referenced in Wikipedia, major publications, 
  industry directories, or review sites
- For local businesses: it's listed in major directories
  like Google Business, Yelp, TripAdvisor

For most small-medium businesses, ChatGPT will NOT
mention them specifically — it will give general advice
and mention category leaders instead.

Respond with ONLY this JSON:
{
  "llmName": "ChatGPT",
  "results": [
    {
      "keyword": "<exact keyword>",
      "mentioned": <boolean - be conservative, most SMBs not mentioned>,
      "confidence": "high|medium|low",
      "quote": "<if mentioned=true: realistic ChatGPT response quote that includes ${domain}. If false: null>",
      "context": "<what ChatGPT would actually say about this keyword — 1-2 sentences>",
      "competitorsMentioned": [
        "<who ChatGPT would mention instead — be specific and realistic>"
      ],
      "simulationNote": "Simulated estimate — ChatGPT responses are based on training data and vary"
    }
  ]
}

CRITICAL FORMATTING RULES:
- "mentioned" MUST be a strict JSON boolean (true or false), NEVER a string ("true" or "false").
- The "keyword" field MUST match EXACTLY the keyword given to you.
- Do NOT wrap your response in any extra objects. Pay attention to the required JSON structure.
- For most generic keywords, "mentioned" should be false. Be realistic about what AI models cite.
`
}

export function buildPerplexityVisibilityPrompt(
  domain: string,
  keywords: string[],
  country: Country,
  crawlData: SiteCrawlResult
): string {
  return `
Simulate how Perplexity AI would respond to these 
keywords and whether ${domain} would appear in results.

Perplexity is different from ChatGPT/Gemini — it does
LIVE web search and cites sources. So a domain gets 
mentioned if:
- It ranks in Google for that keyword (real-time search)
- It has recent, indexed, authoritative content
- Its pages appear in Perplexity's search results

DOMAIN: ${domain}
BUSINESS: ${crawlData.inferredBusinessType}
ESTIMATED GOOGLE PRESENCE: ${crawlData.pagesFound.length} pages found
COUNTRY: ${country.name}
KEYWORDS:
${keywords.map((k, i) => `${i+1}. "${k}"`).join('\n')}

Respond with ONLY this JSON:
{
  "llmName": "Perplexity",
  "results": [
    {
      "keyword": "<exact keyword>",
      "mentioned": <boolean - based on likely Google ranking>,
      "confidence": "high|medium|low",
      "quote": "<if mentioned: realistic Perplexity citation snippet. null if not>",
      "context": "<what Perplexity would show — source-cited response style>",
      "competitorsMentioned": [
        "<sites Perplexity would cite instead>"
      ],
      "simulationNote": "Simulated — Perplexity uses live search; actual results depend on current rankings"
    }
  ]
}

CRITICAL FORMATTING RULES:
- "mentioned" MUST be a strict JSON boolean (true or false), NEVER a string ("true" or "false").
- The "keyword" field MUST match EXACTLY the keyword given to you.
- Do NOT wrap your response in any extra objects. Pay attention to the required JSON structure.
- For most generic keywords, "mentioned" should be false. Be realistic about what AI models cite.
`
}
