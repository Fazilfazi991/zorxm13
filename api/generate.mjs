import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are an Elementor JSON 
generator for Elementor 3.6+ with Flexbox Container.

Return ONLY a valid JSON object. No markdown.
No code fences. Start with { end with }.
Every element needs a unique random 8-digit numeric id.

IMPORTANT: Use "container" for ALL layout elements.
Do NOT use "section" or "column" — they are deprecated.

Structure uses nested containers:
- Outer container = full width row (like a section)
- Inner container = column (flexbox child)
- Widgets go inside inner containers

Full example:
{
  "version": "0.4",
  "title": "Page Title",
  "content": [
    {
      "id": "10000001",
      "elType": "container",
      "settings": {
        "background_color": "#ffffff",
        "padding": {
          "unit": "px",
          "top": "80",
          "right": "40", 
          "bottom": "80",
          "left": "40",
          "isLinked": false
        },
        "content_width": "boxed",
        "flex_direction": "row",
        "flex_wrap": "nowrap"
      },
      "elements": [
        {
          "id": "10000002",
          "elType": "container",
          "settings": {
            "flex_direction": "column",
            "width": { "unit": "%", "size": 100 }
          },
          "elements": [
            {
              "id": "10000003",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Your Heading",
                "header_size": "h1",
                "align": "center"
              }
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Root has version, title, content
- content is array of outer containers (rows)
- Each outer container has inner containers (columns)
- Widgets go inside inner containers
- For full width: one inner container width 100%
- For 3 columns: three inner containers width 33%
- Every element has unique 8-digit numeric id
- No HTML tags in text values
- Text values max 15 words

Generate exactly 3 containers (rows):

Row 1 — Hero:
  One inner container (100%) with:
  heading (h1) + text-editor + button

Row 2 — Features:
  Three inner containers (33% each) with:
  one icon-box widget each

Row 3 — CTA:
  One inner container (100%) with:
  heading (h2) + button

Return ONLY the JSON.`

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
  } catch (e1) {
    const match = e1.message.match(/position (\d+)/)
    const pos = match ? parseInt(match[1]) : 0
    console.error('[parse] Error:', e1.message)
    console.error('[parse] At position:', pos)
    console.error('[parse] Context:', 
      cleaned.substring(
        Math.max(0, pos - 80), pos + 80
      )
    )
    try {
      return JSON.parse(
        cleaned.replace(/,(\s*[}\]])/g, '$1')
      )
    } catch (e2) {
      console.error('[parse] Fixed also failed:', 
        e2.message)
      return null
    }
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

async function tryGeminiModel(userPrompt, modelName) {
  try {
    const key = process.env.GEMINI_API_KEY ||
                process.env.VITE_GEMINI_API_KEY
    if (!key) throw new Error('No Gemini key')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ 
              text: SYSTEM_PROMPT + '\n\n' + userPrompt 
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      }
    )

    console.log(`[gemini] ${modelName} status:`, 
      response.status)
    const rawText = await response.text()

    if (!response.ok) {
      throw new Error(
        `${modelName} ${response.status}: ` +
        rawText.substring(0, 200)
      )
    }

    const data = JSON.parse(rawText)
    const finishReason = data.candidates?.[0]
      ?.finishReason
    console.log(`[gemini] ${modelName} finish:`, 
      finishReason)

    if (finishReason === 'MAX_TOKENS') {
      console.error(`[gemini] ${modelName} truncated`)
      return null
    }

    const text = data.candidates?.[0]
      ?.content?.parts?.[0]?.text
    if (!text) throw new Error('No text in response')

    console.log(`[gemini] ${modelName} succeeded,`,
      'length:', text.length)
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

    let rawResponse = await tryGeminiModel(
      userPrompt, 'gemini-2.5-flash'
    )

    if (!rawResponse) {
      console.log('[generate] Trying gemini-2.5-pro')
      rawResponse = await tryGeminiModel(
        userPrompt, 'gemini-2.5-pro'
      )
    }

    if (!rawResponse) {
      console.log('[generate] Trying Kimi')
      rawResponse = await tryKimi(userPrompt)
    }

    if (!rawResponse) {
      return res.status(500).json({
        error: 'Generation failed. Please try again.'
      })
    }

    console.log('[parse] Raw first 300:', 
      rawResponse.substring(0, 300))
    console.log('[parse] Raw last 200:', 
      rawResponse.substring(rawResponse.length - 200))

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
