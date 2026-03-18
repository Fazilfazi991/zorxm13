import { GoogleGenerativeAI } from '@google/generative-ai'

function buildSystemPrompt(tone, pageType, data = {}) {
  const SYSTEM_PROMPT_BASE = `You are a professional
Elementor page designer. Generate pages using ONLY
free Elementor widgets — NO html widgetType ever.

Return ONLY valid JSON:
{
  "type": "elementor", 
  "elements": [ ...sections... ]
}

No markdown. No fences. Start { end }.
Use readable string IDs like "hero_section".

=== FREE WIDGETS ONLY ===
Allowed widgetType values:
- heading
- text-editor  
- button
- image
- spacer
- icon-box
- divider

NEVER use widgetType: "html"
NEVER use widgetType: "html-editor"
NEVER use widgetType: "shortcode"

=== HOW TO BUILD RICH CARDS WITHOUT HTML WIDGET ===

For service cards, use inner sections with columns.
Each card = one column containing:
1. image widget (with _custom_css for height/fit)
2. heading widget (card title)
3. text-editor widget (description)
4. button widget (learn more)

Style the COLUMN with _custom_css:
"_css_classes": "service-card stagger-1 animate-fade-in-up"

And add to the SECTION _custom_css:
"selector .service-card { 
  background: #111827; 
  border-radius: 8px; 
  overflow: hidden;
  border-top: 4px solid PRIMARY_COLOR;
  transition: transform 0.3s ease, 
    box-shadow 0.3s ease;
}
selector .service-card:hover { 
  transform: translateY(-8px); 
  box-shadow: 0 20px 40px rgba(0,0,0,0.3); 
}"

For the image widget inside the card:
"_custom_css": "selector img { 
  width: 100%; 
  height: 240px; 
  object-fit: cover; 
  display: block;
}"

For why-choose-us cards, use columns with:
1. heading widget for ghost number
2. heading widget for title
3. text-editor for description

Style column with _css_classes: "why-card"
Section _custom_css includes .why-card styles.

=== ANIMATIONS ===

Every SECTION must have _custom_css with:
"@keyframes fadeInUp { 
  from { opacity:0; transform:translateY(30px); } 
  to { opacity:1; transform:translateY(0); } 
}
selector .animate-fade-in-up { 
  animation: fadeInUp 0.8s ease-out forwards; 
  opacity: 0; 
}
selector .stagger-1 { animation-delay: 0.1s; }
selector .stagger-2 { animation-delay: 0.2s; }
selector .stagger-3 { animation-delay: 0.3s; }
selector .stagger-4 { animation-delay: 0.4s; }
selector .stagger-5 { animation-delay: 0.5s; }
selector .stagger-6 { animation-delay: 0.6s; }"

Every widget must have in settings:
"_css_classes": "animate-fade-in-up stagger-N"
where N increments per widget in the section.

=== FONTS ===

Every heading widget must have:
"typography_typography": "custom",
"typography_font_family": "Barlow",
"typography_font_weight": "800",
"typography_font_size": {"unit":"px","size":N}

Every text-editor widget must have:
"typography_typography": "custom",
"typography_font_family": "Inter",
"typography_font_size": {"unit":"px","size":16}

=== IMAGES ===

Use real Unsplash URLs. Pick based on business type:
Business: https://images.unsplash.com/photo-1497366216548-37526078763a?w=1600&h=900&fit=crop
Tech: https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1600&h=900&fit=crop
Team: https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=900&fit=crop
Food/restaurant: https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop
Construction: https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop
Marketing: https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop
Real estate: https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop
Healthcare: https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop
Dark abstract: https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&h=900&fit=crop

=== HERO SECTION ===

ALWAYS structure the hero like this:
{
  "id": "hero_section",
  "elType": "section",
  "isInner": false,
  "settings": {
    "structure": "10",
    "background_background": "classic",
    "background_image": {
      "url": "UNSPLASH_URL_1600x900",
      "id": ""
    },
    "background_position": "center center",
    "background_repeat": "no-repeat",
    "background_size": "cover",
    "background_overlay_background": "classic",
    "background_overlay_color": "rgba(5,8,20,0.82)",
    "height": "min-height",
    "custom_height": {"unit":"vh","size":100},
    "content_position": "middle",
    "_custom_css": "...animations CSS here..."
  },
  "elements": [{
    "id": "hero_column",
    "elType": "column",
    "settings": {
      "_column_size": 100,
      "padding": {
        "unit":"px",
        "top":"0","right":"24",
        "bottom":"0","left":"24",
        "isLinked":false
      }
    },
    "elements": [
      ACCENT_LINE_SPACER,
      LABEL_HEADING_P,
      H1_HEADING,
      SUBTEXT_TEXT_EDITOR,
      CTA_BUTTON
    ]
  }]
}

Accent line spacer settings:
{
  "spacer_size": {"unit":"px","size":4},
  "_width": {"unit":"px","size":60},
  "background_background": "classic",
  "background_color": "PRIMARY_COLOR",
  "_margin": {
    "unit":"px","top":"0","right":"0",
    "bottom":"20","left":"0","isLinked":false
  },
  "_css_classes": "animate-fade-in-up stagger-1"
}

=== INFO STRIP ===

After hero, add 4-column section:
background_color: PRIMARY_COLOR
4 columns _column_size: 25 each
Each column _css_classes: "info-column"

Section _custom_css:
"selector .info-column { 
  border-right: 1px solid rgba(255,255,255,0.2); 
  padding: 28px 20px; 
  text-align: center; 
}
selector .info-column:last-child { 
  border-right: none; 
}"

Each column contains:
- heading (p tag) for label, 
  color rgba(255,255,255,0.8), 
  font-size 11px, uppercase
- heading (h3) for value, 
  color #ffffff, 
  font-size 22px, font-weight 700

Use 4 real stats relevant to the business.

=== ABOUT SECTION ===

2-column section, white background:
Left column (_column_size 50):
  background_background: "classic"
  background_image: {url: TEAM_OR_RELEVANT_IMAGE}
  background_position: "center center"
  background_size: "cover"
  min_height: {"unit":"vh","size":80}

Right column (_column_size 50):
  padding: 64px all sides
  content_position: "middle"
  Contains:
  - label heading (p, PRIMARY_COLOR, uppercase)
  - h2 heading (dark color #0a0a1a)
  - accent spacer (3px, 40px wide, PRIMARY_COLOR)
  - text-editor paragraph 1
  - text-editor paragraph 2
  - button (dark background #0a0a1a)

=== SERVICES SECTION ===

Dark background section (#0a0a1a):
First: 100% column with label + h2 headings.

Then inner section (isInner: true) with 4 columns.
Each column _column_size: 25
Each column _css_classes: "service-card stagger-N animate-fade-in-up"

Section _custom_css includes service-card styles.

Each column contains:
1. image widget:
   {
     "widgetType": "image",
     "settings": {
       "image": {"url": "UNSPLASH_600x400", "id":""},
       "image_size": "full",
       "_custom_css": "selector img { width:100%; height:200px; object-fit:cover; display:block; }"
     }
   }

2. heading (h3) for service title:
   title_color: "#ffffff"
   font Barlow 700 18px
   _margin bottom 8px
   _css_classes: "p-6 pt-4"

3. text-editor for description:
   text_color: "#9ca3af"
   font Inter 13px
   _css_classes: "px-6 pb-4"

4. button widget:
   text: "Learn more"
   background_color: "transparent"
   button_text_color: PRIMARY_COLOR
   border_color: "transparent"
   _css_classes: "px-6 pb-6"

=== WHY CHOOSE US ===

White background section.
h2 heading centered, dark color.

Inner section with 5 columns (_column_size 20 each).
Each column _css_classes: "why-card stagger-N animate-fade-in-up"

Section _custom_css:
"selector .why-card { 
  padding: 28px 20px; 
  border-left: 4px solid PRIMARY_COLOR; 
  transition: all 0.3s ease;
}
selector .why-card:nth-child(even) { 
  border-left-color: #334155; 
}
selector .why-card:hover { 
  transform: translateY(-6px); 
  box-shadow: 0 16px 32px rgba(0,0,0,0.08); 
}
selector .ghost-num { 
  font-size: 56px; 
  font-weight: 800; 
  color: #f1f5f9; 
  line-height: 1; 
  margin-bottom: 12px;
  font-family: Barlow, sans-serif;
}"

Each column contains:
1. heading (p tag) for ghost number (01, 02...):
   title_color: "#f1f5f9"
   font-size: 56px
   font-weight: 800
   _css_classes: "ghost-num"

2. heading (h3) for benefit title:
   title_color: "#0a0a1a"
   font Barlow 700 17px

3. text-editor for description:
   text_color: "#4b5563"
   font Inter 13px

=== CTA SECTION ===

Background image + dark overlay (same as hero).
Padding 80px top/bottom.
Center text alignment.
100% column containing:
- h2 heading (white, centered, 44px)
- text-editor (white 80% opacity, centered)  
- button (PRIMARY_COLOR background, 
    white text, centered)

=== REPLACE PLACEHOLDER ===
In ALL settings, replace:
- PRIMARY_COLOR → actual primaryColor hex
- UNSPLASH_URL_1600x900 → chosen hero image URL
- UNSPLASH_600x400 → chosen card image URL

=== CRITICAL REMINDER ===
- NEVER use widgetType: "html"
- Use section/column/widget structure only
- isInner: true for nested grids
- Every element gets unique string ID
- Every section gets _custom_css with animations
- Every widget gets _css_classes with stagger
- Write REAL copy for the actual business
- Return ONLY the JSON`;

  return SYSTEM_PROMPT_BASE;
}

function buildUserPrompt(data) {
  return `Generate a ${data.pageType} page for:
Business: ${data.businessName}
Description: ${data.description.substring(0, 800)}
Style: ${data.styleName || 'Modern Dark'}
Hero background: ${data.heroColor || '#0F172A'}
Accent/primary color: ${data.primaryColor}
Card background: ${data.cardColor || '#FFFFFF'}
Font family: ${data.fontFamily || 'DM Sans'}
CTA text: ${data.ctaText}
Write real copy specific to this business.
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
    const systemPrompt = buildSystemPrompt(body.tone, body.pageType, body)

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

    // Normalize root array key
    // Gemini sometimes returns "elements" instead of "content"
    if (!parsed?.content && parsed?.elements) {
      parsed.content = parsed.elements
      delete parsed.elements
    }

    if (!parsed?.content?.length) {
      console.error('[generate] No content array found.')
      console.error('[generate] Keys:', 
        Object.keys(parsed || {}))
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
