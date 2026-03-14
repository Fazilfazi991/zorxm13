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
  canonicalUrl: string
}

export interface CrawledSiteData {
  homepage: CrawledPageData | null
  additionalPages: CrawledPageData[]
  allText: string
  allHeadings: string[]
  allTitles: string[]
}

const CORS_PROXY = 'https://api.allorigins.win/get?url='

async function fetchPageHTML(url: string): Promise<string | null> {
  try {
    const proxyUrl = CORS_PROXY + encodeURIComponent(url)
    const response = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(10000) // 10s timeout
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.contents ?? null
  } catch {
    return null
  }
}

function parsePageData(html: string, url: string): CrawledPageData {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Extract all meta tags
  const title = doc.querySelector('title')?.textContent?.trim() ?? ''
  
  const metaDescription = 
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ??
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? 
    ''
  
  const metaKeywords = 
    doc.querySelector('meta[name="keywords"]')?.getAttribute('content') ?? ''
  
  const ogTitle = 
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? ''
  
  const ogDescription = 
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? ''

  const canonicalUrl = 
    doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? url

  // Extract headings
  const h1Tags = Array.from(doc.querySelectorAll('h1'))
    .map(el => el.textContent?.trim() ?? '')
    .filter(Boolean)

  const h2Tags = Array.from(doc.querySelectorAll('h2'))
    .map(el => el.textContent?.trim() ?? '')
    .filter(Boolean)

  const h3Tags = Array.from(doc.querySelectorAll('h3'))
    .map(el => el.textContent?.trim() ?? '')
    .filter(Boolean)

  // Extract body text (remove scripts/styles first)
  doc.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove())
  const bodyText = doc.body?.textContent
    ?.replace(/\s+/g, ' ')
    ?.trim()
    ?.substring(0, 3000) ?? ''

  // Extract internal links for additional pages
  const baseUrl = new URL(url).origin
  const internalLinks = Array.from(doc.querySelectorAll('a[href]'))
    .map(el => {
      const href = el.getAttribute('href') ?? ''
      if (href.startsWith('/')) return baseUrl + href
      if (href.startsWith(baseUrl)) return href
      return null
    })
    .filter((href): href is string => href !== null)
    .filter(href => !href.includes('#'))
    .filter(href => !href.match(/\.(pdf|jpg|png|gif|zip)$/i))
    .slice(0, 20)

  return {
    url,
    title,
    metaDescription,
    metaKeywords,
    h1Tags,
    h2Tags,
    h3Tags,
    bodyText,
    internalLinks,
    ogTitle,
    ogDescription,
    canonicalUrl
  }
}

function findImportantPages(
  links: string[], 
  baseUrl: string
): string[] {
  // Prioritize service/product/about pages
  const priorityPatterns = [
    '/services', '/service', '/about', '/work',
    '/portfolio', '/products', '/solutions',
    '/coaching', '/consulting', '/team',
    '/what-we-do', '/our-work', '/contact'
  ]
  
  const important = links.filter(link => 
    priorityPatterns.some(pattern => 
      link.toLowerCase().includes(pattern)
    )
  )
  
  // Also include up to 3 other internal pages
  const others = links
    .filter(link => !important.includes(link))
    .filter(link => {
      try {
        const path = new URL(link).pathname
        // Skip pagination, query params, very deep paths
        return path.split('/').length <= 3 && 
               !path.includes('?') &&
               path !== '/'
      } catch (e) {
        return false;
      }
    })
    .slice(0, 3)
  
  return [...important, ...others].slice(0, 5)
}

export async function crawlWebsite(url: string): Promise<CrawledSiteData> {
  // Always crawl homepage first
  const homepageHtml = await fetchPageHTML(url)
  
  if (!homepageHtml) {
    return {
      homepage: null,
      additionalPages: [],
      allText: '',
      allHeadings: [],
      allTitles: []
    }
  }

  const homepage = parsePageData(homepageHtml, url)
  
  // Find and crawl important additional pages
  let baseUrl = '';
  try {
    baseUrl = new URL(url).origin;
  } catch (e) {
    baseUrl = url;
  }
  
  const pagesToCrawl = findImportantPages(
    homepage.internalLinks, 
    baseUrl
  )
  
  // Crawl up to 4 additional pages in parallel
  const additionalPageHtmls = await Promise.allSettled(
    pagesToCrawl.slice(0, 4).map(pageUrl => 
      fetchPageHTML(pageUrl).then(html => 
        html ? parsePageData(html, pageUrl) : null
      )
    )
  )
  
  const additionalPages = additionalPageHtmls
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => (r as PromiseFulfilledResult<CrawledPageData>).value)

  // Compile all content
  const allPages = [homepage, ...additionalPages]
  
  const allText = allPages
    .map(p => `${p.title} ${p.metaDescription} ${p.bodyText}`)
    .join(' ')
  
  const allHeadings = allPages.flatMap(p => [
    ...p.h1Tags, ...p.h2Tags, ...p.h3Tags
  ])
  
  const allTitles = allPages
    .map(p => p.title)
    .filter(Boolean)

  return {
    homepage,
    additionalPages,
    allText,
    allHeadings,
    allTitles
  }
}
