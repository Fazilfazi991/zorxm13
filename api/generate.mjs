import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function checkAndDeductCredit(licenseKey) {
  try {
    // Find license
    const { data: license, error } = await supabase
      .from('plugin_licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single()
    
    if (error || !license) {
      return { 
        success: false, 
        error: 'Invalid license key.' 
      }
    }
    
    if (license.credits <= 0) {
      return {
        success: false,
        error: 'No credits remaining. ' +
          'Upgrade at zorxm13.vercel.app/pricing'
      }
    }
    
    // Deduct 1 credit
    await supabase
      .from('plugin_licenses')
      .update({ 
        credits: license.credits - 1,
        last_used: new Date().toISOString()
      })
      .eq('license_key', licenseKey)
    
    return { 
      success: true,
      credits_remaining: license.credits - 1
    }
  } catch (e) {
    console.error('[license]', e.message)
    // Allow on error to not block users
    return { success: true, credits_remaining: -1 }
  }
}

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

For service cards or grid items, use inner sections with columns.
Each card = one column containing:
1. image widget (with _custom_css for height/fit)
2. heading widget (card title)
3. text-editor widget (description)
...

Style the COLUMN with _custom_css:
"_css_classes": "content-card stagger-1 animate-fade-in-up"

And add to the SECTION _custom_css:
"selector .content-card { 
  background: #111827; 
  border-radius: 8px; 
  overflow: hidden;
  border-top: 4px solid PRIMARY_COLOR;
  transition: transform 0.3s ease;
}"

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
selector .stagger-2 { animation-delay: 0.2s; }"

Every widget must have in settings:
"_css_classes": "animate-fade-in-up stagger-N"

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
Use real Unsplash URLs.
Tech: https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1600&h=900&fit=crop
Team: https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=900&fit=crop

=== REPLACE PLACEHOLDER ===
In ALL settings, replace:
- PRIMARY_COLOR → actual primaryColor hex`

  if (pageType === 'refine') {
    return `You are an expert Elementor designer refining a specific existing section or element.
You will be provided with the CURRENT JSON structure of the user's selection and their revision request.
CRITICAL RULES:
1. ONLY return the updated JSON structure.
2. DO NOT change element IDs, as they map to existing React state.
3. Modify settings, typography, content, or CSS classes exactly as requested.
4. Return ONLY valid JSON starting with { and ending with }, without markdown formatting.
5. If the context represents a single widget (like an image or heading), return just the updated widget object.
6. If the context represents a full section, return the updated section object.`
  }

  if (pageType === 'section') {
    return SYSTEM_PROMPT_BASE + `
    
=== CRITICAL REMINDER FOR SECTION GENERATION ===
- You are adding a SINGLE section to an existing page.
- Produce EXACTLY ONE section object inside the "elements" array.
- DO NOT generate a hero or footer unless specifically requested.
- Focus exclusively on fulfilling the user's specific section description (e.g. pricing, testimonials, features).
- Ensure this section has dark/light contrast that matches a modern aesthetic and utilizes the PRIMARY_COLOR.`
  }

  // Full page layout templates
  return SYSTEM_PROMPT_BASE + `
  
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
    ...
  }
}

=== ABOUT SECTION ===
2-column section, white background...

=== SERVICES SECTION ===
Dark background section (#0a0a1a) with 4 inner columns...

=== REVIEWS / WHY CHOOSE US ===
White background section with columns for reviews or features...

=== CTA SECTION ===
Dark overlay section at bottom...

=== CRITICAL REMINDER ===
- Provide a FULL LANDING PAGE with Hero, About, Services, Why Us, and CTA section.
- Write REAL copy for the actual business
- Return ONLY the JSON`
}

function buildUserPrompt(data) {
  if (data.pageType === 'refine') {
    return `Refine this Elementor component based on the request: "${data.description}"
Primary Action Color Context: ${data.primaryColor || '#166534'}

CURRENT COMPONENT JSON:
${data.contextJson || '{}'}

Return EXACTLY the modified JSON object. No explanations. Return ONLY valid JSON.`
  }

  if (data.pageType === 'section') {
    return `Generate ONLY A SINGLE custom section for our page.
Business Context: ${data.businessName}
Section Requirement: ${data.description.substring(0, 800)}
Style Focus: ${data.styleName || 'Modern'}
Primary Action Color: ${data.primaryColor}
Use real, contextually relevant copy. Return ONLY JSON.`
  }

  return `Generate a full landing page for:
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

    const isPluginRequest = body?.source === 'wpcraft-plugin'
    const licenseKey = body?.license_key || null

    if (isPluginRequest) {
      if (!licenseKey) {
        return res.status(401).json({
          error: 'License key required. ' +
            'Get yours at zorxm13.vercel.app'
        })
      }
      
      // Check + deduct credits via Supabase
      const creditResult = await checkAndDeductCredit(
        licenseKey
      )
      
      if (!creditResult.success) {
        return res.status(402).json({
          error: creditResult.error,
          credits_remaining: 0,
          upgrade_url: 'https://zorxm13.vercel.app/pricing'
        })
      }
    }

    if (!body?.businessName && body?.pageType !== 'refine' && !isPluginRequest) {
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
      if (parsed.type === 'elementor') {
        parsed.content = parsed.elements
        delete parsed.elements
      }
    }

    // If pageType is refine, we might return a raw object directly rather than `{ content: [...] }`.
    if (body?.pageType === 'refine') {
      // Return the specific object immediately without worrying about 'content' arrays
      console.log('[generate] Refine Success')
      return res.status(200).json({
        success: true,
        data: parsed,
        json: JSON.stringify(parsed)
      })
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
