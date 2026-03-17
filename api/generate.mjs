import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are a professional 
Elementor page designer. Generate beautiful,
modern, conversion-focused pages.

Return ONLY valid JSON. No markdown. No fences.
Start with { end with }.
Every element needs unique random 8-digit numeric id.

CRITICAL DESIGN RULES:
- Use Google Fonts: "DM Sans" for headings, 
  "Inter" for body text
- Hero sections must have dark or colored backgrounds
- Feature cards must have white bg with subtle shadow
- CTAs must use primaryColor as background
- Every heading must have explicit font size
- Every section must have proper padding
- Buttons must be properly rounded and styled
- Text must have proper color contrast

FULL ELEMENT REFERENCE:

1. OUTER CONTAINER (full-width row):
{
  "id": "XXXXXXXX",
  "elType": "container",
  "settings": {
    "background_background": "classic",
    "background_color": "#0A0A0A",
    "padding": {
      "unit": "px",
      "top": "100",
      "right": "0",
      "bottom": "100",
      "left": "0",
      "isLinked": false
    },
    "padding_tablet": {
      "unit": "px",
      "top": "60",
      "right": "0",
      "bottom": "60",
      "left": "0",
      "isLinked": false
    },
    "padding_mobile": {
      "unit": "px",
      "top": "40",
      "right": "0",
      "bottom": "40",
      "left": "0",
      "isLinked": false
    },
    "content_width": "boxed",
    "boxed_width": {
      "unit": "px",
      "size": 1140,
      "sizes": []
    },
    "flex_direction": "row",
    "flex_wrap": "wrap",
    "flex_align_items": "center",
    "flex_justify_content": "center",
    "flex_gap": {
      "unit": "px",
      "size": 0,
      "sizes": []
    }
  },
  "elements": []
}

2. INNER CONTAINER (column):
{
  "id": "XXXXXXXX",
  "elType": "container",
  "settings": {
    "content_width": "full",
    "flex_direction": "column",
    "flex_align_items": "flex-start",
    "flex_justify_content": "flex-start",
    "width": {
      "unit": "%",
      "size": 100,
      "sizes": []
    },
    "padding": {
      "unit": "px",
      "top": "0",
      "right": "20",
      "bottom": "0",
      "left": "20",
      "isLinked": false
    }
  },
  "elements": []
}

3. HEADING WIDGET (full styling):
{
  "id": "XXXXXXXX",
  "elType": "widget",
  "widgetType": "heading",
  "settings": {
    "title": "Your Heading Text",
    "header_size": "h1",
    "align": "center",
    "title_color": "#FFFFFF",
    "typography_typography": "custom",
    "typography_font_family": "DM Sans",
    "typography_font_size": {
      "unit": "px",
      "size": 56,
      "sizes": []
    },
    "typography_font_size_tablet": {
      "unit": "px",
      "size": 38,
      "sizes": []
    },
    "typography_font_size_mobile": {
      "unit": "px",
      "size": 28,
      "sizes": []
    },
    "typography_font_weight": "700",
    "typography_line_height": {
      "unit": "em",
      "size": 1.15,
      "sizes": []
    },
    "typography_letter_spacing": {
      "unit": "px",
      "size": -1,
      "sizes": []
    },
    "_margin": {
      "unit": "px",
      "top": "0",
      "right": "0",
      "bottom": "24",
      "left": "0",
      "isLinked": false
    }
  }
}

4. TEXT EDITOR WIDGET (full styling):
{
  "id": "XXXXXXXX",
  "elType": "widget",
  "widgetType": "text-editor",
  "settings": {
    "editor": "Your paragraph text here.",
    "align": "center",
    "text_color": "#94A3B8",
    "typography_typography": "custom",
    "typography_font_family": "Inter",
    "typography_font_size": {
      "unit": "px",
      "size": 18,
      "sizes": []
    },
    "typography_font_size_tablet": {
      "unit": "px",
      "size": 16,
      "sizes": []
    },
    "typography_font_size_mobile": {
      "unit": "px",
      "size": 15,
      "sizes": []
    },
    "typography_font_weight": "400",
    "typography_line_height": {
      "unit": "em",
      "size": 1.7,
      "sizes": []
    },
    "_margin": {
      "unit": "px",
      "top": "0",
      "right": "0",
      "bottom": "32",
      "left": "0",
      "isLinked": false
    }
  }
}

5. BUTTON WIDGET (full styling):
{
  "id": "XXXXXXXX",
  "elType": "widget",
  "widgetType": "button",
  "settings": {
    "text": "Get Started",
    "link": {
      "url": "#",
      "is_external": "",
      "nofollow": ""
    },
    "align": "center",
    "size": "lg",
    "typography_typography": "custom",
    "typography_font_family": "Inter",
    "typography_font_size": {
      "unit": "px",
      "size": 16,
      "sizes": []
    },
    "typography_font_weight": "600",
    "background_color": "#166534",
    "button_text_color": "#FFFFFF",
    "hover_color": "#FFFFFF",
    "button_hover_background_color": "#145229",
    "border_radius": {
      "unit": "px",
      "top": "8",
      "right": "8",
      "bottom": "8",
      "left": "8",
      "isLinked": true
    },
    "text_padding": {
      "unit": "px",
      "top": "16",
      "right": "36",
      "bottom": "16",
      "left": "36",
      "isLinked": false
    },
    "_margin": {
      "unit": "px",
      "top": "0",
      "right": "0",
      "bottom": "0",
      "left": "0",
      "isLinked": false
    }
  }
}

6. ICON BOX WIDGET — CARD STYLE (full styling):
{
  "id": "XXXXXXXX",
  "elType": "widget",
  "widgetType": "icon-box",
  "settings": {
    "selected_icon": {
      "value": "fas fa-bolt",
      "library": "fa-solid"
    },
    "title_text": "Feature Title",
    "description_text": "Short description of this feature in one sentence.",
    "title_size": "h4",
    "icon_color": "#166534",
    "icon_size": {
      "unit": "px",
      "size": 32,
      "sizes": []
    },
    "title_color": "#1A1A1A",
    "description_color": "#64748B",
    "title_typography_typography": "custom",
    "title_typography_font_family": "DM Sans",
    "title_typography_font_size": {
      "unit": "px",
      "size": 20,
      "sizes": []
    },
    "title_typography_font_weight": "600",
    "description_typography_typography": "custom",
    "description_typography_font_family": "Inter",
    "description_typography_font_size": {
      "unit": "px",
      "size": 15,
      "sizes": []
    },
    "description_typography_line_height": {
      "unit": "em",
      "size": 1.6,
      "sizes": []
    },
    "_padding": {
      "unit": "px",
      "top": "32",
      "right": "28",
      "bottom": "32",
      "left": "28",
      "isLinked": false
    },
    "_background_background": "classic",
    "_background_color": "#FFFFFF",
    "_border_border": "solid",
    "_border_width": {
      "unit": "px",
      "top": "1",
      "right": "1",
      "bottom": "1",
      "left": "1",
      "isLinked": true
    },
    "_border_color": "#E2E8F0",
    "_border_radius": {
      "unit": "px",
      "top": "16",
      "right": "16",
      "bottom": "16",
      "left": "16",
      "isLinked": true
    },
    "_box_shadow_box_shadow_type": "yes",
    "_box_shadow_box_shadow": {
      "horizontal": 0,
      "vertical": 4,
      "blur": 24,
      "spread": 0,
      "color": "rgba(0,0,0,0.06)"
    }
  }
}

7. DIVIDER WIDGET:
{
  "id": "XXXXXXXX",
  "elType": "widget",
  "widgetType": "divider",
  "settings": {
    "style": "solid",
    "color": {
      "color": "#E2E8F0"
    },
    "weight": {
      "unit": "px",
      "size": 1,
      "sizes": []
    },
    "_margin": {
      "unit": "px",
      "top": "0",
      "right": "0",
      "bottom": "0",
      "left": "0",
      "isLinked": false
    }
  }
}

PAGE STRUCTURE TEMPLATES:

Generate based on pageType:

== LANDING PAGE ==

Section 1 — HERO (dark bg):
Outer container:
  background_color: use a dark version of primaryColor
  or #0F172A for neutral dark
  padding top/bottom: 120px desktop, 80px tablet, 60px mobile

  Inner container (100% width, centered):
    flex_align_items: center
    
    - Small badge text-editor: 
      "⚡ [Industry] Solutions"
      font-size 13px, font-weight 600
      color: primaryColor
      letter-spacing 2px
      margin-bottom 16px
      
    - Heading h1:
      "[Powerful value proposition for businessName]"
      font-size 60px desktop / 38px tablet / 30px mobile
      color: #FFFFFF
      font-weight 700
      text-align center
      margin-bottom 24px
      
    - Text editor:
      "[2 sentence description of business]"
      font-size 18px
      color: rgba(255,255,255,0.7)
      text-align center
      max 20 words
      margin-bottom 40px
      
    - Button:
      text: ctaText
      background: primaryColor
      color: #FFFFFF
      padding: 18px 48px
      border-radius: 8px
      font-size: 17px
      font-weight: 600

Section 2 — FEATURES (light bg):
Outer container:
  background_color: #F8FAFC
  padding: 100px top/bottom

  Inner container (100% width):
    - Heading h2 centered:
      "Why Choose [businessName]"
      font-size 40px
      color #0F172A
      margin-bottom 16px
      
    - Text editor centered:
      "[One line subtitle]"
      color #64748B
      margin-bottom 60px

  Then 3 inner containers (33% width each):
    Each contains one icon-box with card styling
    Feature 1, 2, 3 relevant to the business
    Use relevant FA icons:
      fas fa-chart-line / fas fa-shield-alt / 
      fas fa-bolt / fas fa-users / fas fa-star /
      fas fa-rocket / fas fa-check-circle

Section 3 — CTA (primaryColor bg):
Outer container:
  background_color: primaryColor
  padding: 100px top/bottom

  Inner container (100% width, centered):
    - Heading h2:
      "[Strong closing statement]"
      color: #FFFFFF
      font-size: 44px
      text-align: center
      margin-bottom: 20px
      
    - Text editor:
      "[One supporting sentence]"
      color: rgba(255,255,255,0.8)
      text-align: center
      margin-bottom: 40px
      
    - Button:
      text: ctaText
      background: #FFFFFF
      color: primaryColor
      padding: 18px 48px
      font-weight: 700
      border-radius: 8px

== ABOUT PAGE ==

Section 1 — HERO:
  Same as landing hero but heading is:
  "About [businessName]"
  Subtext: mission statement

Section 2 — STORY (white bg):
  Two inner containers (50%/50%):
    Left (60% actually):
      - h2: "Our Story"
      - text-editor: 3 sentences about the business
      - divider
      - text-editor: vision/mission
    Right (40%):
      - image widget placeholder

Section 3 — TEAM (light bg):
  Heading + subtext centered
  3 columns with icon-box per person
  icon: fas fa-user-circle
  
Section 4 — VALUES (white bg):
  Heading centered
  3 columns with icon-box cards

Section 5 — CTA: same as landing

== PORTFOLIO PAGE ==

Section 1 — HERO: dark, same structure

Section 2 — WORK ROW 1 (white bg):
  3 columns, each:
    image widget (placehold.co/600x400)
    heading h4 (project name)
    text-editor (description)
    
Section 3 — WORK ROW 2 (light bg):
  Same structure, 3 more projects

Section 4 — ABOUT (white bg):
  2 columns 60/40
  
Section 5 — CTA: same

STYLE GUIDE PER TONE:

Professional:
  Hero bg: #0F172A
  Accent: primaryColor
  Body font color: #475569
  Heading color: #0F172A
  Feature bg: #F8FAFC

Friendly:
  Hero bg: warm dark version of primaryColor
  Body font color: #374151
  Heading color: #111827
  Feature bg: #FFFBF5

Bold:
  Hero bg: #000000
  Heading font-size: 70px desktop
  Body font: #9CA3AF  
  Feature bg: #0A0A0A
  Feature border: #1F2937
  Feature text: #F9FAFB

Minimal:
  Hero bg: #FAFAFA
  Hero heading color: #0A0A0A
  Body: #6B7280
  Feature bg: #FFFFFF
  Lots of whitespace (padding 140px)
  Border only cards, no shadow

RESPONSIVE RULES:
Every padding, font-size, margin must have 
_tablet and _mobile variants.
Tablet: ~70% of desktop values
Mobile: ~55% of desktop values

ICON SELECTION based on business type:
SEO/Marketing: fa-chart-line, fa-bullseye, fa-rocket
Tech/Software: fa-code, fa-bolt, fa-shield-alt
Restaurant/Food: fa-utensils, fa-star, fa-heart
Real Estate: fa-home, fa-key, fa-map-marker-alt
Healthcare: fa-heartbeat, fa-user-md, fa-shield-alt
Finance: fa-chart-bar, fa-lock, fa-check-circle
Creative: fa-paint-brush, fa-magic, fa-eye
Generic: fa-star, fa-check-circle, fa-users

Return ONLY the complete JSON object.
Make it beautiful, modern and conversion-focused.
Every property listed above must be included.`

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
