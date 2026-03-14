export interface CrawledPageData {
  url: string
  title: string
  metaDescription: string
  metaKeywords: string
  h1Tags: string[]
  h2Tags: string[]
  h3Tags: string[]
  bodyText: string
  internalLinks: string[]
  ogTitle: string
  ogDescription: string
  canonicalUrl?: string
}

export interface CrawledSiteData {
  homepage: CrawledPageData | null
  additionalPages: CrawledPageData[]
  allText: string
  allHeadings: string[]
  allTitles: string[]
}

async function fetchPageViaEdge(url: string): Promise<CrawledPageData | null> {
  try {
    const apiUrl = `/api/crawl?url=${encodeURIComponent(url)}`
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(15000)
    })
    if (!response.ok) return null
    const data = await response.json()
    if (data.error) return null
    return data as CrawledPageData
  } catch {
    return null
  }
}

const PRIORITY_PATHS = [
  '/services', '/service', '/about', '/work',
  '/portfolio', '/products', '/solutions',
  '/coaching', '/consulting', '/team',
  '/what-we-do', '/our-work', '/contact'
]

export async function crawlWebsite(url: string): Promise<CrawledSiteData> {
  const homepage = await fetchPageViaEdge(url)

  if (!homepage) {
    return {
      homepage: null,
      additionalPages: [],
      allText: '',
      allHeadings: [],
      allTitles: []
    }
  }

  let baseUrl = ''
  try {
    baseUrl = new URL(url).origin
  } catch {
    baseUrl = url
  }

  const pagesToCrawl = [
    // Check known priority paths directly
    ...PRIORITY_PATHS.map(p => baseUrl + p),
    // Plus any found in homepage links
    ...(homepage.internalLinks ?? [])
  ]
    .filter((v, i, a) => a.indexOf(v) === i)  // dedupe
    .filter(u => u !== url && u !== baseUrl && u !== baseUrl + '/')
    .slice(0, 6)

  const additionalResults = await Promise.allSettled(
    pagesToCrawl.slice(0, 4).map(pageUrl => fetchPageViaEdge(pageUrl))
  )

  const additionalPages = additionalResults
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => (r as PromiseFulfilledResult<CrawledPageData>).value)
    .filter(p => p.title || (p.h1Tags?.length ?? 0) > 0)

  const allPages = [homepage, ...additionalPages]

  return {
    homepage,
    additionalPages,
    allText: allPages
      .map(p => [p.title, p.metaDescription, p.bodyText].filter(Boolean).join(' '))
      .join(' '),
    allHeadings: allPages.flatMap(p => [
      ...(p.h1Tags ?? []),
      ...(p.h2Tags ?? []),
      ...(p.h3Tags ?? [])
    ]),
    allTitles: allPages.map(p => p.title).filter(Boolean)
  }
}
