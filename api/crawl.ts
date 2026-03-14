export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return new Response(
      JSON.stringify({ error: 'URL required' }),
      { status: 400 }
    )
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOCopilot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Site returned ${response.status}` }),
        { status: 200 }
      )
    }

    const html = await response.text()

    const extract = (pattern: RegExp): string => {
      const match = html.match(pattern)
      return match ? (match[1]?.trim() ?? '') : ''
    }

    const extractAll = (pattern: RegExp): string[] => {
      const matches: string[] = []
      let match
      const re = new RegExp(pattern.source, 'gi')
      while ((match = re.exec(html)) !== null) {
        if (match[1]?.trim()) matches.push(match[1].trim())
      }
      return matches.slice(0, 20)
    }

    const title = extract(/<title[^>]*>([^<]+)<\/title>/i)

    const metaDescription =
      extract(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      extract(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)

    const metaKeywords = extract(
      /<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i
    )

    const ogTitle = extract(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
    )

    const ogDescription = extract(
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
    )

    const h1Tags = extractAll(/<h1[^>]*>([^<]+)<\/h1>/i)
    const h2Tags = extractAll(/<h2[^>]*>([^<]+)<\/h2>/i)
    const h3Tags = extractAll(/<h3[^>]*>([^<]+)<\/h3>/i)

    // Extract internal links
    const baseUrl = new URL(url).origin
    const linkPattern = /href=["']([^"'#?]+)["']/gi
    const links: string[] = []
    let linkMatch
    while ((linkMatch = linkPattern.exec(html)) !== null) {
      const href = linkMatch[1]
      if (href.startsWith('/') && !href.includes('.')) {
        links.push(baseUrl + href)
      } else if (href.startsWith(baseUrl)) {
        links.push(href)
      }
    }

    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000)

    const result = {
      url,
      title,
      metaDescription,
      metaKeywords,
      ogTitle,
      ogDescription,
      h1Tags,
      h2Tags,
      h3Tags,
      bodyText: cleanHtml,
      internalLinks: [...new Set(links)]
        .filter(l => !l.match(/\.(jpg|png|gif|pdf|zip|svg|webp)$/i))
        .slice(0, 20),
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch',
        message: error instanceof Error ? error.message : 'Unknown',
      }),
      { status: 200 }
    )
  }
}
