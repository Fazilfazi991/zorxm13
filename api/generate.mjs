import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are an Elementor JSON generator.
Return ONLY a valid JSON object. No markdown. No code fences.
No explanation. Start with { and end with }.
Every element needs a unique random 8-digit numeric id.
Generate 5 sections with real business copy.
Keep text values concise — max 2 sentences.
No HTML tags inside text values.`

const GEMINI_SYSTEM_PROMPT = `You are an Elementor JSON 
generator. Return ONLY a JSON object.
No markdown. No code fences. Start with { end with }.
Unique 8-digit numeric id on every element.
Maximum 3 sections. Each text value max 10 words.
No HTML in any value.

Generate exactly 3 sections:
1. Hero: one heading + one button widget
2. Features: 3 columns, one icon-box each  
3. CTA: one heading + one button

Return JSON only.`

function buildUserPrompt(data) {
  const { pageType, businessName, description,
          tone, primaryColor, ctaText } = data
  return `${pageType} page for "${businessName}".
About: ${description.substring(0, 200)}
Tone: ${tone}. Color: ${primaryColor}. CTA: ${ctaText}
Return ONLY JSON.`
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
    console.log('[kimi] Status:', response.status)
    const rawText = await response.text()
    if (!response.ok) {
      throw new Error(`Kimi ${response.status}: ${rawText}`)
    }
    const data = JSON.parse(rawText)
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty Kimi response')
    console.log('[kimi] Succeeded, length:', text.length)
    return text
  } catch (e) {
    console.error('[kimi] Failed:', e.message)
    return null
  }
}

async function tryGemini(userPrompt, modelName, sysPrompt) {
  try {
    const key = process.env.GEMINI_API_KEY ||
                process.env.VITE_GEMINI_API_KEY
    if (!key) throw new Error('No Gemini key')
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 1024
      }
    })
    const result = await model.generateContent(
      sysPrompt + '\n\n' + userPrompt
    )
    const finishReason = result.response
      .candidates?.[0]?.finishReason
    console.log(`[gemini] ${modelName} finish:`, 
      finishReason)
    if (finishReason === 'MAX_TOKENS') {
      console.error(`[gemini] ${modelName} truncated`)
      return null
    }
    const text = result.response.text()
    console.log(`[gemini] ${modelName} succeeded`)
    return text
  } catch (e) {
    console.error(`[gemini] ${modelName} failed:`, 
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

    if (!body?.businessName || !body?.description) {
      return res.status(400).json({
        error: 'Missing businessName or description'
      })
    }

    const userPrompt = buildUserPrompt(body)

    let rawResponse = await tryKimi(userPrompt)

    if (!rawResponse) {
      console.log('[generate] Trying gemini-2.0-flash-exp')
      rawResponse = await tryGemini(
        userPrompt,
        'gemini-2.0-flash-exp',
        GEMINI_SYSTEM_PROMPT
      )
    }

    if (!rawResponse) {
      console.log('[generate] Trying gemini-1.5-flash')
      rawResponse = await tryGemini(
        userPrompt,
        'gemini-1.5-flash',
        GEMINI_SYSTEM_PROMPT
      )
    }

    if (!rawResponse) {
      console.log('[generate] Trying gemini-1.5-pro')
      rawResponse = await tryGemini(
        userPrompt,
        'gemini-1.5-pro',
        GEMINI_SYSTEM_PROMPT
      )
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

    return res.status(200).json({
      success: true,
      data: parsed
    })

  } catch (error) {
    console.error('[generate] Fatal:', error.message)
    return res.status(500).json({
      error: error.message
    })
  }
}
