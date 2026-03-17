import { GoogleGenerativeAI } from '@google/generative-ai'

function buildSystemPrompt(tone, pageType) {
  
  const base = `You are an Elementor page designer.
Return ONLY valid JSON. No markdown. No fences.
Start with { end with }.
Every element needs unique random 8-digit numeric id.
Use DM Sans for headings, Inter for body text.
Include responsive tablet and mobile font sizes.
Every widget must have full typography settings.`

  const toneStyles = {
    professional: `
Hero bg: #0F172A. 
Heading color: #FFFFFF.
Body color: rgba(255,255,255,0.7).
Feature bg: #F8FAFC. Feature text: #0F172A.
Card border: #E2E8F0. Card shadow: rgba(0,0,0,0.06).
CTA bg: primaryColor.`,

    friendly: `
Hero bg: warm dark primaryColor shade.
Heading color: #FFFFFF.
Body color: rgba(255,255,255,0.75).
Feature bg: #FFFBF5. Feature text: #374151.
Card border: #FDE68A. Card shadow: rgba(0,0,0,0.05).
CTA bg: primaryColor.`,

    bold: `
Hero bg: #000000. 
Heading font-size: 68px desktop.
Heading color: #FFFFFF.
Body color: #9CA3AF.
Feature bg: #111111. Feature text: #F9FAFB.
Card border: #1F2937. No card shadow.
CTA bg: #000000. CTA heading color: primaryColor.`,

    minimal: `
Hero bg: #FAFAFA.
Heading color: #0A0A0A.
Body color: #6B7280.
Feature bg: #FFFFFF. Feature text: #374151.
Card border: #E5E7EB. No shadow.
Lots of whitespace — padding 140px top/bottom.
CTA bg: #FAFAFA. CTA heading color: #0A0A0A.`
  }

  const pageStructures = {
    landing: `
3 sections:
1. HERO: outer container with dark bg, inner container 
   (100%) with: badge text-editor + h1 heading + 
   text-editor + button
2. FEATURES: outer container light bg, first inner (100%) 
   with h2 + subtitle, then 3 inner containers (33% each) 
   with icon-box widgets (card styled with shadow+border)
3. CTA: outer container primaryColor bg, inner (100%) 
   with h2 + text-editor + white button`,

    about: `
4 sections:
1. HERO: dark bg, h1 + text-editor + button
2. STORY: white bg, 2 columns 60/40 — 
   left: h2 + text-editor paragraphs, right: image
3. TEAM: light bg, h2 centered + 3 icon-box cards (33%)
4. CTA: primaryColor bg, h2 + button`,

    portfolio: `
4 sections:
1. HERO: dark bg, h1 + text-editor
2. WORK ROW 1: white bg, 3 columns (33%) each with 
   image + h4 + text-editor
3. WORK ROW 2: light bg, same structure
4. CTA: primaryColor bg, h2 + button`
  }

  const widgets = `
WIDGET SPECS (use exact property names):

heading: title, header_size, align, title_color,
  typography_typography:"custom", typography_font_family,
  typography_font_size:{unit:"px",size:N},
  typography_font_size_tablet:{unit:"px",size:N},
  typography_font_size_mobile:{unit:"px",size:N},
  typography_font_weight, _margin

text-editor: editor, align, text_color,
  typography_typography:"custom", typography_font_family,
  typography_font_size:{unit:"px",size:N},
  typography_font_weight, typography_line_height,
  _margin

button: text, link:{url:"#"}, align, size:"lg",
  background_color, button_text_color,
  typography_font_size:{unit:"px",size:N},
  typography_font_weight:"600",
  border_radius:{unit:"px",top:"8",right:"8",
    bottom:"8",left:"8",isLinked:true},
  text_padding:{unit:"px",top:"16",right:"36",
    bottom:"16",left:"36",isLinked:false}

icon-box: selected_icon:{value:"fas fa-X",
  library:"fa-solid"}, title_text, description_text,
  title_size:"h4", icon_color, icon_size:{unit:"px",size:32},
  title_color, description_color,
  title_typography_font_family:"DM Sans",
  title_typography_font_size:{unit:"px",size:20},
  title_typography_font_weight:"600",
  _padding:{unit:"px",top:"32",right:"28",
    bottom:"32",left:"28",isLinked:false},
  _background_background:"classic",
  _background_color:"#FFFFFF",
  _border_border:"solid",
  _border_width:{unit:"px",top:"1",right:"1",
    bottom:"1",left:"1",isLinked:true},
  _border_color:"#E2E8F0",
  _border_radius:{unit:"px",top:"16",right:"16",
    bottom:"16",left:"16",isLinked:true},
  _box_shadow_box_shadow_type:"yes",
  _box_shadow_box_shadow:{horizontal:0,vertical:4,
    blur:24,spread:0,color:"rgba(0,0,0,0.06)"}

container settings:
  content_width:"boxed" for outer rows,
  content_width:"full" for inner columns,
  flex_direction:"row" for outer,
  flex_direction:"column" for inner,
  flex_wrap:"wrap" for outer,
  flex_align_items:"center",
  padding with top/right/bottom/left/unit/isLinked,
  background_background:"classic",
  background_color for colored sections`

  return base + 
    '\n\nTONE STYLE:\n' + 
    (toneStyles[tone] || toneStyles.professional) +
    '\n\nPAGE STRUCTURE:\n' + 
    (pageStructures[pageType] || pageStructures.landing) +
    '\n\nWIDGET SPECS:\n' + widgets
}

function buildUserPrompt(data) {
  return \`Generate for:
Business: \${data.businessName}
Description: \${data.description.substring(0,150)}
Primary color: \${data.primaryColor}
CTA text: \${data.ctaText}
Write real copy. Return ONLY JSON.\`
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

async function tryKimi(userPrompt, systemPrompt) {
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
            { role: 'system', content: systemPrompt },
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

async function tryGeminiModel(
  userPrompt,
  modelName, 
  thinkingBudget = 0,
  systemPrompt = ''
) {
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
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{
            role: 'user',
            parts: [{ 
              text: userPrompt 
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            thinkingConfig: {
              thinkingBudget: thinkingBudget
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
    const systemPrompt = buildSystemPrompt(body.tone, body.pageType)

    let rawResponse = await tryGeminiModel(
      userPrompt, 'gemini-2.5-flash', 0, systemPrompt
    )

    if (!rawResponse) {
      console.log('[generate] Trying gemini-2.5-pro')
      rawResponse = await tryGeminiModel(
        userPrompt, 'gemini-2.5-pro', 1024, systemPrompt
      )
    }

    if (!rawResponse) {
      console.log('[generate] Trying Kimi')
      rawResponse = await tryKimi(userPrompt, systemPrompt)
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
