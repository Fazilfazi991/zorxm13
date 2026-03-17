import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are an Elementor JSON 
generator. Return ONLY a valid JSON object.
No markdown. No code fences. Start with { end with }.
Every element needs a unique random 8-digit numeric id.

CRITICAL: Keep total JSON under 4000 characters.
Max 3 sections only. Keep ALL text values under 
15 words. No HTML tags in text values.

Structure:
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
          "title": "short heading here",
          "header_size": "h1",
          "align": "center"
        }
      }]
    }]
  }]
}

Generate exactly 3 sections:
1. Hero: heading + text-editor + button
2. Features: 3 columns with icon-box each
3. CTA: heading + button

Keep every text value SHORT. Return ONLY JSON.`

function buildUserPrompt(data) {
  const { pageType, businessName, 
          description, tone, 
          primaryColor, ctaText } = data
  return `${pageType} page for "${businessName}".
Business: ${description.substring(0, 200)}
Tone: ${tone}. Color: ${primaryColor}. CTA: ${ctaText}
Generate 3 sections. Keep all text under 15 words.
Return ONLY the JSON.`
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
  if (first === -1) return null
  
  // Use last } if exists, otherwise try to repair
  const jsonStr = last !== -1 
    ? cleaned.substring(first, last + 1)
    : cleaned.substring(first)

  // Attempt 1: direct parse
  try { return JSON.parse(jsonStr) } catch {}
  
  // Attempt 2: fix trailing commas
  try {
    return JSON.parse(
      jsonStr.replace(/,(\s*[}\]])/g, '$1')
    )
  } catch {}

  // Attempt 3: repair truncated JSON
  // Count open brackets and close them
  try {
    let repaired = jsonStr
    // Remove trailing incomplete property
    repaired = repaired.replace(
      /,?\s*"[^"]*"\s*:\s*"[^"]*$/,  ''
    )
    repaired = repaired.replace(
      /,?\s*"[^"]*"\s*:\s*\{[^}]*$/,  ''
    )
    repaired = repaired.replace(/,\s*$/, '')
    
    // Count and close open brackets
    const opens = (repaired.match(/\[/g) || []).length
    const closes = (repaired.match(/\]/g) || []).length
    const openBraces = (repaired.match(/\{/g) || []).length
    const closeBraces = (repaired.match(/\}/g) || []).length
    
    repaired += ']'.repeat(
      Math.max(0, opens - closes)
    )
    repaired += '}'.repeat(
      Math.max(0, openBraces - closeBraces)
    )
    
    const fixed = JSON.parse(repaired)
    console.log('[generate] Repaired truncated JSON')
    return fixed
  } catch (e) {
    console.error('[generate] Repair failed:', e.message)
    return null
  }
}

async function tryGemini(userPrompt, modelName) {
  try {
    const key = process.env.GEMINI_API_KEY || 
                process.env.VITE_GEMINI_API_KEY
    if (!key) throw new Error('No Gemini key')
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    })
    const result = await model.generateContent(
      SYSTEM_PROMPT + '\n\n' + userPrompt
    )
    const finishReason = result.response.candidates?.[0]?.finishReason
    console.log(`[generate] ${modelName} Finish reason:`, finishReason)

    const text = result.response.text()
    console.log(`[generate] ${modelName} succeeded`)
    return text
  } catch (e) {
    console.error(`[generate] ${modelName} failed:`, 
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

    if (!body?.businessName || !body?.description) {
      return res.status(400).json({ 
        error: 'Missing businessName or description' 
      })
    }

    const userPrompt = buildUserPrompt(body)

    // Chain: gemini-2.5-flash → gemini-2.5-flash-lite 
    //        → Kimi moonshot-v1-8k
    let rawResponse = await tryGemini(
      userPrompt, 'gemini-2.5-flash'
    )

    if (!rawResponse) {
      console.log('[generate] Trying gemini-2.5-flash-lite')
      rawResponse = await tryGemini(
        userPrompt, 'gemini-2.5-flash-lite'
      )
    }

    if (!rawResponse) {
      console.log('[generate] Trying Kimi...')
      rawResponse = await tryKimi(userPrompt)
    }

    if (!rawResponse) {
      return res.status(500).json({
        error: 'All models failed. Please try again.'
      })
    }

    console.log('[generate] Raw length:', rawResponse.length)
    console.log('[generate] Raw first 500 chars:', rawResponse.substring(0, 500))

    const parsed = extractJSON(rawResponse)

    console.log('[generate] Parsed keys:', parsed ? Object.keys(parsed) : 'null')
    console.log('[generate] Content type:', parsed ? typeof parsed.content : 'no parsed')
    console.log('[generate] Content length:', parsed?.content?.length ?? 'undefined')
    console.log('[generate] Content is array:', Array.isArray(parsed?.content))

    // Try to find content array wherever it is
    let contentArray = parsed?.content

    if (!contentArray && parsed?.data?.content) {
      contentArray = parsed.data.content
    }

    if (!contentArray && parsed?.page?.content) {
      contentArray = parsed.page.content
    }

    if (!Array.isArray(contentArray) || contentArray.length === 0) {
      console.error('[generate] Content array issue:', JSON.stringify(parsed).substring(0, 300))
      return res.status(500).json({
        error: 'Invalid page structure. Please try again.'
      })
    }

    // Use contentArray going forward
    parsed.content = contentArray

    console.log('[generate] Success, sections:', parsed.content.length)

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
