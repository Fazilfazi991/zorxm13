// WPCraft — /api/generate.mjs v5.0
// Skills-based system prompt injection
// Reads skill .md files and injects them per industry/tone

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || '');

// ── Helpers ──────────────────────────────────────────────────────────────────
function loadSkill(rel) {
  try {
    const p = join(process.cwd(), 'skills', rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
  } catch { return ''; }
}

function industrySkill(industry = '') {
  const l = industry.toLowerCase();
  if (l.includes('restaurant') || l.includes('food') || l.includes('cafe') || l.includes('beverage')) return loadSkill('industries/restaurant.md');
  if (l.includes('seo') || l.includes('marketing') || l.includes('agency') || l.includes('digital')) return loadSkill('industries/agency.md');
  if (l.includes('real estate') || l.includes('property') || l.includes('realty')) return loadSkill('industries/realestate.md');
  if (l.includes('saas') || l.includes('software') || l.includes('tech') || l.includes('app')) return loadSkill('industries/saas.md');
  if (l.includes('construct') || l.includes('engineer') || l.includes('build') || l.includes('mep') || l.includes('contracting')) return loadSkill('industries/construction.md');
  if (l.includes('medical') || l.includes('health') || l.includes('clinic') || l.includes('doctor') || l.includes('hospital')) return loadSkill('industries/medical.md');
  return loadSkill('industries/default.md');
}

function toneSkill(tone = '') {
  const l = tone.toLowerCase();
  if (l.includes('luxury') || l.includes('elegant') || l.includes('premium')) return loadSkill('tones/luxury.md');
  if (l.includes('bold') || l.includes('energetic') || l.includes('strong')) return loadSkill('tones/bold.md');
  if (l.includes('minimal') || l.includes('clean') || l.includes('simple')) return loadSkill('tones/minimal.md');
  if (l.includes('friendly') || l.includes('approachable') || l.includes('warm')) return loadSkill('tones/friendly.md');
  return loadSkill('tones/professional.md');
}

function buildSystemPrompt(body) {
  return [
    loadSkill('base.md'),
    loadSkill('contrast.md'),
    industrySkill(body.industry),
    toneSkill(body.tone),
    loadSkill('sections/blueprints.md'),
  ].filter(Boolean).join('\n\n---\n\n');
}

function buildUserPrompt(body) {
  if (body.enhancedPrompt) return body.enhancedPrompt;
  const p = [];
  if (body.businessName)  p.push(`Business: ${body.businessName}`);
  if (body.industry)      p.push(`Industry: ${body.industry}`);
  if (body.location)      p.push(`Location: ${body.location}`);
  if (body.pageGoal)      p.push(`Goal: ${body.pageGoal}`);
  if (body.tone)          p.push(`Tone: ${body.tone}`);
  if (body.primaryColor)  p.push(`Primary color: ${body.primaryColor}`);
  if (body.description)   p.push(`Description: ${body.description}`);
  if (body.prompt)        p.push(`Instructions: ${body.prompt}`);
  if (body.sections?.length) p.push(`Sections to include: ${body.sections.join(', ')}`);
  const count = body.sectionCount || 8;
  p.push(`Total sections including navbar + footer: ${count}`);
  p.push(`Generate complete premium page. Navbar first, footer last. Real copy only. Raw JSON only.`);
  return p.join('. ');
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const { generation_type = 'page', license_key, dev_mode } = body;

  // ── License check ──
  const isDevMode = dev_mode === true || license_key === 'dev_bypass_2024';
  if (!isDevMode) {
    // Add your license/credits check here
    // For now just check key exists
    if (!license_key) {
      return res.status(401).json({ success: false, error: 'License required. Go to WPCraft → Settings.' });
    }
  }

  try {

    // ── ENHANCE PROMPT — handled by WordPress api.php, but catch here as backup ──
    if (generation_type === 'enhance_prompt') {
      return res.status(200).json({ success: true, data: { enhanced_prompt: body.prompt || '' } });
    }

    // ── SEO ──
    if (generation_type === 'seo') {
      const model  = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(
        `Analyze this page content and generate SEO metadata. Return ONLY JSON with keys: title, description, keywords (array). No markdown. Content: ${(body.prompt || '').substring(0, 2000)}`
      );
      let text = result.response.text().trim().replace(/```json|```/g, '').trim();
      return res.status(200).json({ success: true, data: JSON.parse(text) });
    }

    // ── PALETTE ──
    if (generation_type === 'palette') {
      const model  = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(
        `Generate a harmonious color palette. Return ONLY JSON: {"primary":"#hex","secondary":"#hex","accent":"#hex","background":"#hex","text":"#hex"}. Input: ${body.prompt}`
      );
      let text = result.response.text().trim().replace(/```json|```/g, '').trim();
      return res.status(200).json({ success: true, data: JSON.parse(text) });
    }

    // ── REFINE ──
    if (generation_type === 'refine') {
      const model  = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `You are a JSON editor. Return ONLY the updated JSON object. No markdown.\n\nContext:\n${body.contextJson}\n\nInstruction: ${body.prompt}`;
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim().replace(/```json|```/g, '').trim();
      return res.status(200).json({ success: true, data: JSON.parse(text) });
    }

    // ── SECTION ──
    if (generation_type === 'section') {
      const model  = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: loadSkill('base.md') + '\n\n' + loadSkill('contrast.md') + '\n\n' + loadSkill('sections/blueprints.md'),
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(`Add a single section. Return JSON with ONE section object (not a full page): ${body.prompt}`);
      let text = result.response.text().trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      const section = parsed.sections?.[0] ?? parsed;
      return res.status(200).json({ success: true, data: { sections: [section] } });
    }

    // ── PAGE GENERATION (main) ──
    const systemPrompt = buildSystemPrompt(body);
    const userPrompt   = buildUserPrompt(body);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-05-20',
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 65536,
        responseMimeType: 'application/json',
      }
    });

    const result = await model.generateContent(userPrompt);
    let   text   = result.response.text().trim().replace(/^```json\s*/i,'').replace(/\s*```$/,'').trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('No valid JSON in response');
      parsed = JSON.parse(m[0]);
    }

    const pageData = {
      title:    parsed.title || parsed.pageTitle || 'Generated Page',
      sections: parsed.sections || parsed.elements || []
    };

    // ── Streaming NDJSON ──
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-store');

    const sections = pageData.sections;

    // Skeleton signal
    res.write(JSON.stringify({ type: 'skeleton', sections: sections.length, message: 'Building your page...' }) + '\n');

    // Stream sections with small delay for UX
    for (let i = 0; i < sections.length; i++) {
      await new Promise(r => setTimeout(r, 60));
      res.write(JSON.stringify({ type: 'section', index: i + 1, total: sections.length, data: sections[i] }) + '\n');
    }

    res.write(JSON.stringify({ type: 'complete', title: pageData.title, timestamp: Date.now() }) + '\n');
    return res.end();

  } catch (err) {
    console.error('[WPCraft generate error]', err.message);
    // If we already started streaming, send error line
    try {
      res.write(JSON.stringify({ type: 'error', message: err.message }) + '\n');
      return res.end();
    } catch {
      return res.status(500).json({ success: false, error: err.message || 'Generation failed' });
    }
  }
}
