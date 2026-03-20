import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load templates safely
let TEMPLATES = { hero: [], features: [], socialProof: [], pricing: [], faq: [], cta: [], footer: [] }
try {
  const templatePath = join(process.cwd(), 'api/design-skills-master.json')
  const ALL_SKILLS = JSON.parse(readFileSync(templatePath, 'utf8'))
  
  Object.values(ALL_SKILLS).forEach(skill => {
    const tags = skill.tags || []
    if (tags.includes('hero') || tags.includes('header')) TEMPLATES.hero.push(skill.example)
    else if (tags.includes('features')) TEMPLATES.features.push(skill.example)
    else if (tags.includes('social') || tags.includes('testimonial')) TEMPLATES.socialProof.push(skill.example)
    else if (tags.includes('pricing')) TEMPLATES.pricing.push(skill.example)
    else if (tags.includes('faq') || tags.includes('accordion')) TEMPLATES.faq.push(skill.example)
    else if (tags.includes('cta')) TEMPLATES.cta.push(skill.example)
    else if (tags.includes('footer')) TEMPLATES.footer.push(skill.example)
    else TEMPLATES.features.push(skill.example) // fallback
  })
} catch (e) {
  console.log('[stream] Failed loading skills:', e.message)
}

const buildSystemPrompt = () => {
  return `You are WPCraft, an expert AI page builder. Your job is to generate high-converting landing pages using ONLY pre-designed templates.

## YOUR CORE CONSTRAINT: TEMPLATE-FIRST APPROACH
You MUST select sections from the provided template library. You NEVER invent new layouts or designs.
This is non-negotiable. Violating this rule will result in poor performance.

## AVAILABLE TEMPLATES (Organized by Section Type)

HERO TEMPLATES:
${JSON.stringify(TEMPLATES.hero.slice(0, 3), null, 2)}

FEATURES TEMPLATES:
${JSON.stringify(TEMPLATES.features.slice(0, 3), null, 2)}

SOCIAL PROOF TEMPLATES:
${JSON.stringify(TEMPLATES.socialProof.slice(0, 2), null, 2)}

PRICING TEMPLATES:
${JSON.stringify(TEMPLATES.pricing.slice(0, 2), null, 2)}

FAQ TEMPLATES:
${JSON.stringify(TEMPLATES.faq.slice(0, 2), null, 2)}

CTA TEMPLATES:
${JSON.stringify(TEMPLATES.cta.slice(0, 2), null, 2)}

FOOTER TEMPLATES:
${JSON.stringify(TEMPLATES.footer.slice(0, 2), null, 2)}

## GENERATION ALGORITHM (CRITICAL)

### Step 1: Analyze User Intent
Extract Industry, Geography, Tone, and Goal.

### Step 2: Select Templates (DO NOT DEVIATE)
Based on industry + tone, select the BEST template for each section.

### Step 3: Customize ONLY Content
For each selected template, fill in ONLY:
- Headline text
- Subheading text
- Button text
- Feature titles/descriptions
- Pricing amounts
- FAQ questions/answers
- Colors (if specified in prompt)

DO NOT:
- Change layout structure
- Modify spacing/padding
- Add new elements
- Remove elements
- Invent new designs

### Step 4: Output Format
Return ONLY valid JSON array of 6 sections matching WPCraft schema exactly. Do not output markdown. Only raw JSON array of sections!`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Mandatory streaming headers
  res.setHeader('Content-Type', 'application/x-ndjson')
  res.setHeader('Transfer-Encoding', 'chunked')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { prompt, userId } = body

    if (!prompt) {
      res.write(JSON.stringify({ type: 'error', message: 'Missing prompt' }) + '\n')
      return res.end()
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2500, // Reduced optimized bound
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: \`Generate a highly optimized template-first landing page for: \${prompt}\` }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const sections = JSON.parse(jsonMatch[0])

    for (let i = 0; i < sections.length; i++) {
       const sectionData = JSON.stringify({
         type: 'section',
         index: i,
         data: sections[i]
       })
       res.write(sectionData + '\n')
       await new Promise(resolve => setTimeout(resolve, 500))
    }

    const completeData = JSON.stringify({ type: 'complete', totalSections: sections.length })
    res.write(completeData + '\n')
    res.end()

  } catch (error) {
    const errorData = JSON.stringify({
      type: 'error',
      message: error.message || 'Generation failed'
    })
    res.write(errorData + '\n')
    res.end()
  }
}
