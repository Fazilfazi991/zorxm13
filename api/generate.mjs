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

function getSystemPrompt(generationType) {
  
  const schemaRules = `
WPCRAFT JSON SCHEMA RULES:
- Valid element types: heading, text, button, buttonGroup, 
  image, spacer, divider, icon
- For 2+ buttons side by side ALWAYS use buttonGroup with 
  direction:'row' — never stack buttons in a column directly
- Button variant: 'solid' or 'outline'
- All colors: valid hex (#000000) or rgba(r,g,b,a)
- Padding minimum 80px top/bottom for content sections
- Dark bg (#0a0a1a): use white text
- Light bg (#ffffff): use dark text #0a0a1a
- Return ONLY raw JSON, no markdown, no explanation
`

  const prompts = {
    
    'page': `You are an expert UI/UX designer and frontend 
engineer specializing in high-converting landing pages. 
You create complete WordPress page JSON structures that 
render beautifully. Think like a senior designer — consider 
visual hierarchy, whitespace, contrast, and conversion flow.
${schemaRules}
Return a complete JSON object with "type": "elementor" and an "elements" array containing sections.`,

    'refine': `You are an expert UI/UX designer. You receive 
a single WPCraft section or element JSON and a user instruction.
Apply the instruction with design intelligence:
- Buttons should always be in flex-row using buttonGroup
- New elements go where they make visual sense
- Preserve ALL existing content unless told to change it
- Match the section's existing color scheme
${schemaRules}
Return ONLY the updated section or element JSON. Raw JSON only.`,

    'section': `You are an expert web designer. Create a single 
beautiful, conversion-optimized page section in WPCraft JSON.
Think about visual hierarchy, spacing, and impact.
${schemaRules}
Return a single Section JSON object ONLY with columns and elements arrays.`,

    'copywriting': `You are an expert copywriter specializing 
in high-converting landing page copy. Write compelling, 
concise, professional copy that drives action. 
Return the updated element JSON with improved text only.
${schemaRules}`,

    'seo': `You are an SEO expert. Generate optimal meta title, 
description, and keywords for a WordPress page.
Return JSON: { "title": "string", "description": "string", 
"keywords": ["string"], "ogTitle": "string", "ogDescription": "string" }
Raw JSON only, no markdown.`,

    'palette': `You are a professional brand designer. 
Generate a cohesive color palette based on the primary color.
Return JSON: { "primary": "string", "secondary": "string", 
"accent": "string", "background": "string", "text": "string", 
"muted": "string", "dark": "string" }
All values as hex codes. Raw JSON only.`
  }
  
  return prompts[generationType] || prompts['page']
}

function buildUserPrompt(data) {
  if (data.pageType === 'refine') {
    return `Instruction: ${data.prompt || data.description}

Input JSON:
${data.contextJson || '{}'}`
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

const ALLOWED_KEYS = {
  heading: ['text', 'tag', 'fontSize', 'fontWeight', 'fontFamily', 'color', 'align', 'marginBottom'],
  text: ['text', 'fontSize', 'color', 'align', 'marginBottom', 'lineHeight'],
  button: ['text', 'url', 'backgroundColor', 'color', 'borderRadius', 'align', 'marginBottom', 'variant', 'size'],
  buttonGroup: ['align', 'gap', 'marginBottom', 'direction'],
  image: ['url', 'alt', 'width', 'borderRadius', 'marginBottom', 'objectFit'],
  spacer: ['height', 'backgroundColor', 'width'],
  divider: ['style', 'color', 'height', 'marginBottom'],
  icon: ['name', 'size', 'color', 'align', 'marginBottom']
}

const TEMPLATE_PROMPTS = {
  'saas': `Generate a complete SaaS landing page for a 
    modern software product. Include these sections in order:
    1. Hero — bold headline, subtext, two CTA buttons 
       (primary solid + secondary outline), dark background 
       with image overlay
    2. Logo cloud — "Trusted by" strip with 5 company name 
       placeholders, light gray background
    3. Features — 3-column grid, each with an icon, heading, 
       and description. Dark background (#0a0a1a)
    4. Pricing — 3 tiers (Starter/Pro/Enterprise), white background,
       highlight the middle Pro tier with accent color
    5. Testimonials — 3 cards with quote, name, role. 
       Light gray background
    6. CTA footer — centered headline, single CTA button, 
       dark background with overlay image
    Brand: modern, minimal, professional. 
    Primary color: #6366f1 (indigo).`,

  'agency': `Generate a complete agency/business landing page 
    for a professional services company. Include these sections:
    1. Hero — split layout (text left, image right), 
       headline + subtext + CTA button, white background
    2. About — two column, image left, text right with 
       WHO WE ARE label, heading, 2 paragraphs, button
    3. Services — 3-column grid with icon, title, description.
       Dark background
    4. Projects/Portfolio — 2x2 image grid with overlay labels.
       White background  
    5. Team — 3 team member cards with image placeholder, 
       name, role. Light background
    6. Contact footer — centered, email + phone + address, 
       dark background
    Brand: professional, trustworthy, clean.
    Primary color: #e60000 (red).`,

  'portfolio': `Generate a complete creative portfolio page 
    for a photographer or designer. Include these sections:
    1. Hero — minimal, full height, large name as h1, 
       tagline as subtitle, scroll indicator. Dark background
    2. Work/Gallery — 3-column masonry-style image grid. 
       White background
    3. About — minimal single column, centered, short bio, 
       white background
    4. Client logos — simple strip of 6 client name placeholders
    5. Contact — minimal centered section with email CTA button
    Brand: minimal, elegant, creative.
    Primary color: #000000 (black).`
}

const isValidColor = (col) => /^#([0-9A-F]{3}){1,2}$/i.test(col) || /^rgba?\(/i.test(col) || col === 'transparent';

function convertBareButtons(elements) {
  if (!Array.isArray(elements)) return elements;
  const newElements = [];
  let buttonBuffer = [];

  const flushButtons = () => {
    if (buttonBuffer.length === 1) {
      newElements.push(buttonBuffer[0]);
    } else if (buttonBuffer.length > 1) {
      newElements.push({
        id: 'group_' + Math.random().toString(36).substring(2, 9),
        type: 'buttonGroup',
        settings: {
          align: buttonBuffer[0].settings?.align || 'center',
          gap: 16,
          marginBottom: buttonBuffer[buttonBuffer.length - 1].settings?.marginBottom || 0,
          direction: 'row'
        },
        buttons: buttonBuffer
      });
    }
    buttonBuffer = [];
  };

  for (const el of elements) {
    if (!el || !ALLOWED_KEYS[el.type]) continue; // strip unknown types entirely
    if (el.type === 'button') {
      buttonBuffer.push(el);
    } else {
      flushButtons();
      newElements.push(el);
    }
  }
  flushButtons();

  return newElements;
}

function cleanElementSettings(el) {
  if (!el || !el.type || !el.settings) return el;
  const allowed = ALLOWED_KEYS[el.type];
  if (allowed) {
    const cleanedSettings = {};
    for (const key of Object.keys(el.settings)) {
      if (allowed.includes(key)) {
        let val = el.settings[key];
        if (key.toLowerCase().includes('color') && typeof val === 'string') {
          if (!isValidColor(val)) val = '#000000';
        }
        cleanedSettings[key] = val;
      }
    }
    el.settings = cleanedSettings;
  }
  return el;
}

function deepCleanElements(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(item => deepCleanElements(item));
  } else if (obj && typeof obj === 'object') {
    if (obj.columns && Array.isArray(obj.columns)) {
      // It's a section object
      // Validate section settings
      if (!obj.settings) obj.settings = {};
      
      obj.columns.forEach(col => {
        if (col.elements) {
          col.elements = convertBareButtons(col.elements);
          col.elements.forEach(el => {
            if (el.type === 'buttonGroup' && el.buttons) {
              el.buttons.forEach(btn => cleanElementSettings(btn));
            }
            cleanElementSettings(el);
          });
        }
      });
    } else if (obj.type && obj.settings && !obj.columns) {
      cleanElementSettings(obj);
    }
  }
  return obj;
}

async function tryKimiModel(prompt, systemPrompt, useThinking = false) {
  console.log('[kimi] attempting call...')
  console.log('[kimi] API key present:', !!(process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY))
  console.log('[kimi] API key prefix:', (process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY)?.substring(0, 8))

  const model = useThinking 
    ? 'moonshot-v1-8k-thinking' 
    : 'moonshot-v1-8k'
  
  const response = await fetch(
    'https://api.moonshot.cn/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })
    }
  )
  
  console.log('[kimi] response status:', response.status)
  const responseText = await response.text()
  console.log('[kimi] raw response first 200:', responseText.substring(0, 200))

  if (!response.ok) throw new Error(`Kimi ${response.status}`)
  
  const data = JSON.parse(responseText)
  return data.choices?.[0]?.message?.content
}

async function tryClaudeModel(prompt, systemPrompt, model = 'claude-sonnet-4-5-20251022') {
  console.log('[claude] attempting call...')
  console.log('[claude] API key present:', !!process.env.ANTHROPIC_API_KEY)
  console.log('[claude] API key prefix:', process.env.ANTHROPIC_API_KEY?.substring(0, 8))

  const response = await fetch(
    'https://api.anthropic.com/v1/messages',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    }
  )
  
  console.log('[claude] response status:', response.status)
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    console.log('[claude] error body:', JSON.stringify(errorBody))
    throw new Error(`Claude ${response.status}: ${errorBody?.error?.message || 'unknown'}`)
  }
  const data = await response.json()
  return data.content?.[0]?.text
}

async function routeToModel(generationType, prompt, systemPrompt, contextJson) {
  
  // Note: userPrompt already incorporates contextJson dynamically from generic payload builder,
  // but we enforce the user's precise object mapping algorithm for the models.
  
  const chains = {
    'page': [
      () => tryKimiModel(prompt, systemPrompt),
      () => tryClaudeModel(prompt, systemPrompt),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ],
    'template': [
      () => tryKimiModel(prompt, systemPrompt),
      () => tryClaudeModel(prompt, systemPrompt),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ],
    'refine': [
      () => tryClaudeModel(prompt, systemPrompt),
      () => tryKimiModel(prompt, systemPrompt),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ],
    'section': [
      () => tryKimiModel(prompt, systemPrompt),
      () => tryClaudeModel(prompt, systemPrompt),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ],
    'copywriting': [
      () => tryClaudeModel(prompt, systemPrompt),
      () => tryKimiModel(prompt, systemPrompt),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ],
    'seo': [
      () => tryClaudeModel(prompt, systemPrompt, 'claude-haiku-4-5-20251001'),
      () => tryKimiModel(prompt, systemPrompt),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ],
    'palette': [
      () => tryClaudeModel(prompt, systemPrompt, 'claude-haiku-4-5-20251001'),
      () => tryKimiModel(prompt, systemPrompt),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ]
  }
  
  const chain = chains[generationType] || chains['page']
  
  let lastError
  for (let i = 0; i < chain.length; i++) {
    try {
      console.log(`[router] trying model ${i+1}/${chain.length} for task: ${generationType}`)
      const result = await chain[i]()
      if (result) {
        console.log(`[router] success on attempt ${i+1}`)
        return result
      }
    } catch (err) {
      console.log(`[router] model ${i+1} failed:`, err.message)
      console.log(`[router] full error:`, err)
      lastError = err
    }
  }
  
  throw new Error(`All models failed for ${generationType}: ${lastError?.message}`)
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
            temperature: 0.7,
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

async function generatePageInChunks(prompt, systemPrompt, generationType) {
  const part1 = await routeToModel(generationType,
    prompt + '\n\n====\nGenerate ONLY the first 3 sections. Return a JSON array of 3 Section objects only.',
    systemPrompt, '')
  
  const part2 = await routeToModel(generationType,
    prompt + '\n\n====\nGenerate ONLY the last 3 sections (features/pricing/cta/footer type sections). Return a JSON array of 3 Section objects only.',
    systemPrompt, '')

  let sections1 = extractJSON(part1)
  let sections2 = extractJSON(part2)

  // sometimes it returns an object, sometimes array
  const group1 = Array.isArray(sections1) ? sections1 : (sections1?.sections || sections1?.elements || sections1?.content || [])
  const group2 = Array.isArray(sections2) ? sections2 : (sections2?.sections || sections2?.elements || sections2?.content || [])
  
  if (generationType === 'template') {
    return {
      title: 'Generated Page',
      sections: [...group1, ...group2]
    }
  } else {
    return {
      type: 'elementor',
      elements: [...group1, ...group2]
    }
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

    if (body.generation_type) {
      body.pageType = body.generation_type
    }

    if (isPluginRequest) {
      // Accept dev_bypass key during development
      if (body.dev_mode === true && licenseKey === 'dev_bypass_2024') {
        // Skip license validation, proceed with generation
      } else {
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
    }

    if (body?.generation_type === 'test') {
      const results = {}
      
      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'say hi' }]
          })
        })
        results.claude = r.status
      } catch(e) { results.claude = e.message }
      
      try {
        const r = await fetch(
          'https://api.moonshot.cn/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY}`
          },
          body: JSON.stringify({
            model: 'moonshot-v1-8k',
            messages: [{ role: 'user', content: 'say hi' }],
            max_tokens: 10
          })
        })
        results.kimi = r.status
        const b = await r.json()
        results.kimi_body = JSON.stringify(b).substring(0, 100)
      } catch(e) { results.kimi = e.message }
      
      return res.status(200).json(results)
    }

    if (body?.generation_type === 'template') {
      const templateKey = body.template || 'saas'
      const templatePrompt = TEMPLATE_PROMPTS[templateKey]
      
      if (!templatePrompt) {
        return res.status(400).json({ error: 'Invalid template key' })
      }

      const systemPrompt = `You are an expert UI/UX designer and frontend engineer. Generate a complete WPCraft page JSON.
      
STRICT SCHEMA — follow exactly:
Return a PageData object:
{
  "title": "Page Title",
  "sections": [ ...Section objects... ]
}

Each Section:
{
  "id": "unique_id",
  "type": "section",
  "settings": {
    "background": "#hex or image URL",
    "backgroundType": "color" | "image",
    "backgroundOverlay": "rgba(0,0,0,0.7)",
    "padding": { "top": 100, "bottom": 100 },
    "fullHeight": false
  },
  "columns": [ ...Column objects... ]
}

Each Column:
{
  "id": "unique_id",
  "width": 100,
  "elements": [ ...Element objects... ]
}

Valid element types and their settings:

heading: { text, tag(h1/h2/h3/p), fontSize, fontWeight, fontFamily, color, align(left/center/right), marginBottom }
text: { text, fontSize, color, align, marginBottom, lineHeight }
button: { text, url, backgroundColor, color, borderRadius, align, marginBottom }
buttonGroup: { align, gap, marginBottom, direction(row/column), buttons: [ ...button settings objects... ] }
image: { url, alt, width, marginBottom }
spacer: { height, backgroundColor, width }

DESIGN RULES:
- For 2+ buttons always use buttonGroup with direction:row
- Dark sections use white/rgba(255,255,255,x) text
- Light sections use #0a0a1a or #555555 text
- Hero sections: fontSize h1=72-80, fullHeight:true
- Minimum padding 80px top/bottom on all sections
- Use real Unsplash image URLs for backgrounds:
  https://images.unsplash.com/photo-[id]?w=1600&q=80
- Generate unique IDs for every section, column, element

Return ONLY raw JSON. No markdown. No explanation.`

      const parsed = await generatePageInChunks(templatePrompt, systemPrompt, 'template')

      if (!parsed) {
        return res.status(500).json({ error: 'Failed to parse template JSON' })
      }
      
      deepCleanElements(parsed)

      return res.status(200).json({ 
        success: true, 
        data: parsed,
        model_used: 'kimi',
        json: JSON.stringify(parsed)
      })
    }

    if (!body?.businessName && body?.pageType !== 'refine' && !isPluginRequest) {
      return res.status(400).json({
        error: 'Missing businessName or description'
      })
    }

    const userPrompt = buildUserPrompt(body)
    const systemPrompt = getSystemPrompt(body.pageType)

    let rawResponse
    let parsed
    
    if (body.pageType === 'page') {
      parsed = await generatePageInChunks(userPrompt, systemPrompt, 'page')
      if (parsed) {
        rawResponse = JSON.stringify(parsed)
      } else {
        throw new Error('All models failed to chunk compile page layout')
      }
    } else {
      rawResponse = await routeToModel(
        body.pageType, 
        userPrompt,
        systemPrompt,
        body.contextJson || ''
      )
      parsed = extractJSON(rawResponse)
    }
    
    if (parsed) {
      deepCleanElements(parsed)
    }

    if (body?.pageType === 'refine' || 
        body?.pageType === 'section' ||
        body?.pageType === 'seo' ||
        body?.pageType === 'palette') {
      console.log(`[generate] ${body.pageType} Success`)
      return res.status(200).json({
        success: true,
        data: parsed,
        json: JSON.stringify(parsed)
      })
    }

    if (!parsed?.elements?.length) {
      console.error('[generate] No content array found.')
      console.error('[generate] Keys:', 
        Object.keys(parsed || {}))
      return res.status(500).json({
        error: 'Invalid page structure. Please try again.'
      })
    }

    console.log('[generate] Success, sections:',
      parsed.elements.length)

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
