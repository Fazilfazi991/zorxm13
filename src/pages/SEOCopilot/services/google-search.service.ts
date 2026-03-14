import { AI_CONFIG } from '../config/ai.config'

export interface GoogleSearchResult {
  position: number
  title: string
  url: string
  snippet: string
  domain: string
}

export interface KeywordSearchData {
  keyword: string
  country: string
  totalResults: string
  results: GoogleSearchResult[]
  domainPosition: number | null  // null = not in top 10
  domainFound: boolean
  domainSnippet: string | null
  domainTitle: string | null
  competitorDomains: string[]
  hasFeaturedSnippet: boolean
  searchUrl: string
}

export async function searchGoogleForKeyword(
  keyword: string,
  domain: string,
  countryCode: string  // e.g. 'ae', 'us', 'gb'
): Promise<KeywordSearchData> {

  const cleanDomain = domain
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')
    .split('/')[0]

  const params = new URLSearchParams({
    key: AI_CONFIG.GOOGLE_SEARCH.API_KEY,
    cx: AI_CONFIG.GOOGLE_SEARCH.SEARCH_ENGINE_ID,
    q: keyword,
    gl: countryCode,        // country for results
    hl: 'en',               // language
    num: '10',              // get top 10 results
    safe: 'active',
  })

  const url = `${AI_CONFIG.GOOGLE_SEARCH.API_URL}?${params}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const err = await response.json()
      throw new Error(
        `Google Search error: ${err.error?.message}`
      )
    }

    const data = await response.json()
    const items = data.items ?? []

    // Parse results
    const results: GoogleSearchResult[] = items.map(
      (item: any, index: number) => ({
        position: index + 1,
        title: item.title ?? '',
        url: item.link ?? '',
        snippet: item.snippet ?? '',
        domain: extractDomain(item.link ?? ''),
      })
    )

    // Check if our domain is in results
    const domainResult = results.find(r =>
      r.domain.includes(cleanDomain) ||
      cleanDomain.includes(r.domain)
    )

    // Get competitor domains (excluding our domain)
    const competitorDomains = results
      .filter(r => !r.domain.includes(cleanDomain))
      .map(r => r.domain)
      .filter((d, i, arr) => arr.indexOf(d) === i)
      .slice(0, 5)

    // Check for featured snippet (position 0)
    const hasFeaturedSnippet = 
      data.items?.[0]?.pagemap?.speakable !== undefined ||
      data.items?.[0]?.snippet?.includes('Featured') ||
      false

    return {
      keyword,
      country: countryCode,
      totalResults: data.searchInformation?.totalResults ?? '0',
      results,
      domainPosition: domainResult?.position ?? null,
      domainFound: !!domainResult,
      domainSnippet: domainResult?.snippet ?? null,
      domainTitle: domainResult?.title ?? null,
      competitorDomains,
      hasFeaturedSnippet,
      searchUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}&gl=${countryCode}`,
    }

  } catch (error) {
    console.error(
      `Google Search failed for "${keyword}":`, error
    )
    // Return empty result on failure
    return {
      keyword,
      country: countryCode,
      totalResults: '0',
      results: [],
      domainPosition: null,
      domainFound: false,
      domainSnippet: null,
      domainTitle: null,
      competitorDomains: [],
      hasFeaturedSnippet: false,
      searchUrl: '',
    }
  }
}

// Search all keywords for a domain
export async function searchAllKeywords(
  keywords: string[],
  domain: string,
  countryCode: string,
  onProgress?: (current: number, total: number, keyword: string) => void
): Promise<KeywordSearchData[]> {

  const results: KeywordSearchData[] = []

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i]

    onProgress?.(i + 1, keywords.length, keyword)

    const result = await searchGoogleForKeyword(
      keyword, domain, countryCode
    )
    results.push(result)

    // 200ms delay between requests to be safe
    if (i < keywords.length - 1) {
      await new Promise(r => setTimeout(r, 200))
    }
  }

  return results
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}
