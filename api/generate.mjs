
async function tryGemini(prompt, systemPrompt) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY || 
                      process.env.VITE_GEMINI_API_KEY
    if (!geminiKey) throw new Error('No Gemini key')
    
    const { GoogleGenerativeAI } = 
      await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
    const result = await model.generateContent(
      systemPrompt + '\n\n' + prompt
    )
    const text = result.response.text()
    console.log('[generate] Gemini succeeded')
    return text
  } catch (e) {
    console.error('[generate] Gemini failed:', e.message)
    return null
  }
}

async function tryManus(prompt, systemPrompt) {
  try {
    const manusKey = process.env.MANUS_API_KEY
    const manusBase = process.env.MANUS_API_BASE || 
                      'https://api.manus.app/v1'
    if (!manusKey) throw new Error('No Manus key')

    console.log('[generate] Manus URL:', `${manusBase}/chat/completions`)
    console.log('[generate] Manus key exists:', !!manusKey)
    console.log('[generate] Manus key prefix:', manusKey?.substring(0, 8))

    const response = await fetch(
      `${manusBase}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${manusKey}`,
          'HTTP-Referer': 'https://zorxm13.vercel.app',
          'X-Title': 'WPCraft AI Generator'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000
        })
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Manus ${response.status}: ${err}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty Manus response')
    console.log('[generate] Manus succeeded')
    return text
  } catch (e) {
    console.error('[generate] Manus failed:', e.message)
    return null
  }
}

function extractJSON(raw) {
  if (!raw) return null
  let cleaned = raw.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first === -1 || last === -1) return null
  cleaned = cleaned.substring(first, last + 1)
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    const fixed = cleaned.replace(/,(\s*[}\]])/g, '$1')
    try { return JSON.parse(fixed) } 
    catch (e2) { return null }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body) : req.body

    const { pageType, businessName, 
            description, tone, 
            primaryColor, ctaText } = body

    const systemPrompt = `You are an Elementor JSON 
generator. Return ONLY valid JSON. No markdown.
No code fences. Start with { end with }.
Every element needs unique 8-digit numeric id.

Structure:
{
  "version": "0.4",
  "title": "string",
  "content": [{
    "id": "12345678",
    "elType": "section",
    "settings": { "background_color": "" },
    "elements": [{
      "id": "23456789",
      "elType": "column",
      "settings": { "_column_size": 100 },
      "elements": [{
        "id": "34567890",
        "elType": "widget",
        "widgetType": "heading",
        "settings": {
          "title": "",
          "header_size": "h1",
          "align": "center"
        }
      }]
    }]
  }]
}`

    const userPrompt = `Generate a ${pageType} page for:
Business: ${businessName}
Description: ${description}
Tone: ${tone}
Primary color: ${primaryColor}
CTA: ${ctaText}
Write real copy. Return ONLY JSON.`

    // Try Gemini first, then Manus
    let rawResponse = await tryGemini(userPrompt, systemPrompt)
    if (!rawResponse) {
      console.log('[generate] Falling back to Manus...')
      rawResponse = await tryManus(userPrompt, systemPrompt)
    }
    if (!rawResponse) {
      return res.status(500).json({
        error: 'All AI models failed. Please try again.'
      })
    }

    const parsed = extractJSON(rawResponse)
    if (!parsed?.content?.length) {
      return res.status(500).json({
        error: 'Invalid page structure returned. Try again.'
      })
    }

    // IMPORTANT: Maintain 'json' key for frontend compatibility
    return res.status(200).json({ 
      success: true, 
      data: parsed,
      json: JSON.stringify(parsed) 
    })

  } catch (error) {
    console.error('[generate] error:', error.message)
    return res.status(500).json({ 
      error: error.message 
    })
  }
}
