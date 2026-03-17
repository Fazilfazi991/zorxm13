import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are an Elementor JSON 
generator. Return ONLY a valid JSON object.
No markdown. No code fences. No explanation.
Start with { and end with }.
Every element needs a unique random 8-digit numeric id.

Generate 5 sections for the page type requested.
Keep text values concise — max 2 sentences each.
No HTML tags inside text values.
Return ONLY the JSON object, nothing else.`

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
        maxOutputTokens: 8192
      }
    })
    const result = await model.generateContent(
      SYSTEM_PROMPT + '\n\n' + userPrompt
    )
    
    const finishReason = result.response
      .candidates?.[0]?.finishReason
    console.log(`[generate] ${modelName} finish:`, 
      finishReason)

    // Treat MAX_TOKENS as failure — JSON is truncated
    if (finishReason === 'MAX_TOKENS') {
      console.error(`[generate] ${modelName} truncated,`
        + ' falling back')
      return null
    }

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
    
    console.log('[kimi] Key exists:', !!key)
    console.log('[kimi] Key prefix:', 
      key?.substring(0, 12))
    
    if (!key) throw new Error('No Kimi key')
    
    const reqBody = {
      model: 'moonshot-v1-8k',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: 4000
    }
    
    console.log('[kimi] Sending request...')
    
    const response = await fetch(
      'https://api.moonshot.ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(reqBody)
      }
    )
    
    console.log('[kimi] Response status:', 
      response.status)
    
    const rawText = await response.text()
    console.log('[kimi] Response body:', 
      rawText.substring(0, 300))
    
    if (!response.ok) {
      throw new Error(
        `Kimi ${response.status}: ${rawText}`
      )
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

    // Fallback chain: Kimi → Gemini 2.5 Flash → Gemini 1.5 Flash
    let rawResponse = await tryKimi(userPrompt)
    
    if (!rawResponse) {
      console.log('[generate] Kimi failed, trying Gemini 2.5 Flash...')
      rawResponse = await tryGemini(
        userPrompt, 'gemini-2.5-flash'
      )
    }
    
    if (!rawResponse) {
      console.log('[generate] Gemini 2.5 failed, trying Gemini 1.5 Flash...')
      rawResponse = await tryGemini(
        userPrompt, 'gemini-1.5-flash-latest'
      )
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
