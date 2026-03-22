// WPCraft Vercel API — /api/generate.js v5.0
// Drop this file into your Vercel project at /api/generate.js
// Place the /skills/ folder in your project root

import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Skill loader ──────────────────────────────────────────────────────────
function loadSkill(relativePath) {
  try {
    const full = path.join(process.cwd(), 'skills', relativePath);
    return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
  } catch { return ''; }
}

// ── Industry mapper ───────────────────────────────────────────────────────
function getIndustrySkill(industry = '') {
  const lower = industry.toLowerCase();
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('cafe')) return loadSkill('industries/restaurant.md');
  if (lower.includes('seo') || lower.includes('marketing') || lower.includes('agency') || lower.includes('digital')) return loadSkill('industries/agency.md');
  if (lower.includes('real estate') || lower.includes('property') || lower.includes('realty')) return loadSkill('industries/realestate.md');
  if (lower.includes('saas') || lower.includes('software') || lower.includes('tech') || lower.includes('app')) return loadSkill('industries/saas.md');
  if (lower.includes('construct') || lower.includes('engineer') || lower.includes('build') || lower.includes('mep')) return loadSkill('industries/construction.md');
  if (lower.includes('medical') || lower.includes('health') || lower.includes('clinic') || lower.includes('doctor')) return loadSkill('industries/medical.md');
  return loadSkill('industries/default.md');
}

// ── Tone mapper ───────────────────────────────────────────────────────────
function getToneSkill(tone = '') {
  const lower = tone.toLowerCase();
  if (lower.includes('luxury') || lower.includes('elegant') || lower.includes('premium')) return loadSkill('tones/luxury.md');
  if (lower.includes('bold') || lower.includes('energetic') || lower.includes('strong')) return loadSkill('tones/bold.md');
  if (lower.includes('minimal') || lower.includes('clean') || lower.includes('simple')) return loadSkill('tones/minimal.md');
  if (lower.includes('friendly') || lower.includes('approachable') || lower.includes('warm')) return loadSkill('tones/friendly.md');
  return loadSkill('tones/professional.md');
}

// ── Build system prompt ───────────────────────────────────────────────────
function buildSystemPrompt(payload) {
  const base       = loadSkill('base.md');
  const contrast   = loadSkill('contrast.md');
  const blueprints = loadSkill('sections/blueprints.md');
  const industry   = getIndustrySkill(payload.industry || '');
  const tone       = getToneSkill(payload.tone || '');

  return [base, contrast, industry, tone, blueprints]
    .filter(Boolean)
    .join('\n\n---\n\n');
}

// ── Build user prompt ─────────────────────────────────────────────────────
function buildUserPrompt(payload) {
  const {
    businessName, industry, location, pageGoal,
    tone, primaryColor, sectionCount, sections,
    description, enhancedPrompt
  } = payload;

  // If enhanced prompt provided, use it directly
  if (enhancedPrompt) return enhancedPrompt;

  const parts = [];
  if (businessName)  parts.push(`Business: ${businessName}`);
  if (industry)      parts.push(`Industry: ${industry}`);
  if (location)      parts.push(`Location: ${location}`);
  if (pageGoal)      parts.push(`Goal: ${pageGoal}`);
  if (tone)          parts.push(`Tone: ${tone}`);
  if (primaryColor)  parts.push(`Primary color: ${primaryColor}`);
  if (description)   parts.push(`Description: ${description}`);
  if (sections?.length) parts.push(`Sections to include: ${sections.join(', ')}`);
  parts.push(`Total sections (including navbar + footer): ${sectionCount || 8}`);
  parts.push(`Generate a complete, premium page. Navbar first, footer last. Real copy only.`);

  return parts.join('. ');
}

// ── Main handler ──────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body;
  const { generation_type = 'page', license_key, dev_mode, prompt } = body;

  // License check (skip in dev mode)
  if (!dev_mode && license_key !== 'dev_bypass_2024') {
    // TODO: Add your license validation here
    // const valid = await validateLicense(license_key, body.site_url);
    // if (!valid) return res.status(401).json({ error: 'Invalid license' });
  }

  // Credits check
  // TODO: Deduct credits from Supabase here
  // const credits = await getCredits(license_key);
  // if (credits <= 0) return res.status(402).json({ error: 'No credits remaining', upgrade_url: 'https://yoursite.com/pricing' });

  try {
    // ── Enhance prompt ────────────────────────────────────────────────────
    if (generation_type === 'enhance_prompt') {
      // This is handled locally by WordPress api.php — shouldn't reach here
      // But handle it anyway as backup
      return res.status(200).json({
        success: true,
        data: { enhanced_prompt: prompt }
      });
    }

    // ── Refine single element ─────────────────────────────────────────────
    if (generation_type === 'refine') {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const systemPrompt = 'You are a JSON editor. Return ONLY the updated JSON object. No markdown, no explanation. Raw JSON only.';
      const userPrompt   = `${body.systemPrompt || systemPrompt}\n\nContext JSON:\n${body.contextJson}\n\nInstruction: ${prompt}`;
      const result = await model.generateContent(userPrompt);
      const text   = result.response.text().trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      return res.status(200).json({ success: true, data: parsed });
    }

    // ── SEO generation ────────────────────────────────────────────────────
    if (generation_type === 'seo') {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const seoPrompt = `Analyze this page content and generate SEO metadata. Return ONLY JSON: {"title":"...","description":"...","keywords":["...","..."]}. Content: ${prompt.substring(0, 2000)}`;
      const result = await model.generateContent(seoPrompt);
      const text   = result.response.text().trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      return res.status(200).json({ success: true, data: parsed });
    }

    // ── Palette generation ────────────────────────────────────────────────
    if (generation_type === 'palette') {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const palPrompt = `Generate a color palette for: ${prompt}. Return ONLY JSON: {"primary":"#hex","secondary":"#hex","accent":"#hex","background":"#hex","text":"#hex"}`;
      const result = await model.generateContent(palPrompt);
      const text   = result.response.text().trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      return res.status(200).json({ success: true, data: parsed });
    }

    // ── MAIN PAGE / SECTION GENERATION ───────────────────────────────────
    const systemPrompt = buildSystemPrompt(body);
    const userPrompt   = buildUserPrompt(body);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 32768,
        responseMimeType: 'application/json',
      }
    });

    const result = await model.generateContent(userPrompt);
    let   text   = result.response.text().trim();

    // Strip any accidental markdown fences
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Try to extract JSON object if extra text slipped through
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('Invalid JSON from Gemini: ' + text.substring(0, 200));
    }

    // Normalise output: ensure { title, sections }
    const pageData = {
      title:    parsed.title    || parsed.pageTitle || 'Generated Page',
      sections: parsed.sections || parsed.elements  || []
    };

    // ── STREAMING response for page/section ──────────────────────────────
    if (generation_type === 'page' || generation_type === 'section') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');

      const sections = pageData.sections;

      // Skeleton
      res.write(JSON.stringify({ type: 'skeleton', sections: sections.length, message: 'Building your page...' }) + '\n');

      // Stream sections
      for (let i = 0; i < sections.length; i++) {
        await new Promise(r => setTimeout(r, 80)); // 80ms between sections
        res.write(JSON.stringify({ type: 'section', index: i + 1, total: sections.length, data: sections[i] }) + '\n');
      }

      res.write(JSON.stringify({ type: 'complete', timestamp: Date.now() }) + '\n');
      res.end();
      return;
    }

    // Standard JSON response
    return res.status(200).json({
      success: true,
      data:    pageData,
      credits_remaining: 99 // TODO: return actual remaining credits
    });

  } catch (err) {
    console.error('WPCraft generate error:', err);
    return res.status(500).json({
      success: false,
      error:   err.message || 'Generation failed',
      data:    null
    });
  }
}
