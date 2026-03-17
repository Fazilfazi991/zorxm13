import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are an Elementor JSON generator.
Return ONLY a valid JSON object. No markdown. No code fences.
No explanation. Start with { and end with }.
Every element needs a unique random 8-digit numeric id.

Required structure:
{
  "version": "0.4",
  "title": "string",
  "content": [{
    "id": "12345678",
    "elType": "section",
    "settings": { "background_color": "#ffffff" },
    "elements": [{
      "id": "23456789",
      "elType": "column",
      "settings": { "_column_size": 100 },
      "elements": [{
        "id": "34567890",
        "elType": "widget",
        "widgetType": "heading",
        "settings": {
          "title": "text here",
          "header_size": "h1",
          "align": "center"
        }
      }]
    }]
  }]
}

Allowed widgetTypes: heading, text-editor, button, 
image, icon-box, spacer
Generate 5-6 sections with real business copy.
Return ONLY the JSON object.`

function buildUserPrompt(data) {
  const { pageType, businessName, 
          description, tone, 
          primaryColor, ctaText } = data
  return `Generate a ${pageType} page for:
Business: ${businessName}
About: ${description}
Tone: ${tone}
Brand color: ${primaryColor}
CTA button text: ${ctaText}
Write real copy specific to this business. JSON only.`
}

function extractJSON(raw) {
  if (!raw || typeof raw !== 'string') return null
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
  } catch {
    try {
      return JSON.parse(
        cleaned.replace(/,(\s*[}\]])/g, '$1')
      )
    } catch { return null }
  }
}

async function tryGeminiFlashLite(userPrompt) {
  try {
    const key = process.env.GEMINI_API_KEY || 
                process.env.VITE_GEMINI_API_KEY
    if (!key) throw new Error('No Gemini key')
    const { GoogleGenerativeAI } = 
      await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 4000
      }
    })
    const result = await model.generateContent(
      SYSTEM_PROMPT + '\n\n' + userPrompt
    )
    const text = result.response.text()
    console.log('[generate] Gemini Flash Lite succeeded')
    return text
  } catch (e) {
    console.error('[generate] Gemini Flash Lite failed:', 
      e.message)
    return null
  }
}

async function tryKimi(userPrompt) {
  try {
    const key = process.env.KIMI_API_KEY || 
                process.env.MOONSHOT_API_KEY
    if (!key) throw new Error('No Kimi key')
    
    const response = await fetch(
      'https://api.moonshot.ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.6,
          max_tokens: 4000
        })
      }
    )
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Kimi ${response.status}: ${err}`)
    }
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty Kimi response')
    console.log('[generate] Kimi succeeded')
    return text
  } catch (e) {
    console.error('[generate] Kimi failed:', e.message)
    return null
  }
}

async function tryGeminiFlash(userPrompt) {
  try {
    const key = process.env.GEMINI_API_KEY || 
                process.env.VITE_GEMINI_API_KEY
    if (!key) throw new Error('No Gemini key')
    const { GoogleGenerativeAI } = 
      await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 4000
      }
    })
    const result = await model.generateContent(
      SYSTEM_PROMPT + '\n\n' + userPrompt
    )
    const text = result.response.text()
    console.log('[generate] Gemini 1.5 Flash succeeded')
    return text
  } catch (e) {
    console.error('[generate] Gemini 1.5 Flash failed:', 
      e.message)
    return null
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 
    'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 
    'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    })
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body) : req.body

    const { pageType, businessName, 
            description, tone,
            primaryColor, ctaText } = body

    if (!businessName || !description) {
      return res.status(400).json({ 
        error: 'Missing businessName or description' 
      })
    }

    const userPrompt = buildUserPrompt(body)

    // Fallback chain: Gemini Flash Lite → Kimi → 
    // Gemini 1.5 Flash
    let rawResponse = await tryGeminiFlashLite(userPrompt)
    
    if (!rawResponse) {
      console.log('[generate] Trying Kimi...')
      rawResponse = await tryKimi(userPrompt)
    }
    
    if (!rawResponse) {
      console.log('[generate] Trying Gemini 1.5 Flash...')
      rawResponse = await tryGeminiFlash(userPrompt)
    }

    if (!rawResponse) {
      return res.status(500).json({
        error: 'All models failed. Please try again.'
      })
    }

    const parsed = extractJSON(rawResponse)

    if (!parsed?.content?.length) {
      return res.status(500).json({
        error: 'Invalid page structure. Please try again.'
      })
    }

    console.log('[generate] Success, sections:', 
      parsed.content.length)

    // IMPORTANT: Maintain 'json' key for frontend compatibility
    return res.status(200).json({ 
      success: true, 
      data: parsed,
      json: JSON.stringify(parsed)
    })

  } catch (error) {
    console.error('[generate] Fatal:', error.message)
    return res.status(500).json({ 
      error: error.message 
    })
  }
}
