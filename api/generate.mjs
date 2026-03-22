// WPCraft — /api/generate.mjs v5.1
// Skills-based system prompt injection + Kimi/Claude/Gemini fallback chain
// Reads skill .md files and injects them per industry/tone

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '');

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
  const count = body.sectionCount || 6;
  p.push(`OUTPUT: Complete WPCraft JSON with exactly ${count} sections. Full schema: sections → columns → elements. All elements with correct settings. No empty columns. Real copy throughout.`);
  return p.join('\n');
}

// ── Model Helpers ─────────────────────────────────────────────────────────────
async function tryKimiModel(prompt, systemPrompt) {
  console.log('[kimi] attempting call...');
  console.log('[kimi] API key present:', !!(process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY));
  const model = 'kimi-k2-turbo-preview';
  const response = await fetch(
    'https://api.moonshot.ai/v1/chat/completions',
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
        temperature: 0.6,
        max_tokens: 8000
      })
    }
  );
  console.log('[kimi] response status:', response.status);
  const responseText = await response.text();
  console.log('[kimi] raw response first 200:', responseText.substring(0, 200));
  if (!response.ok) throw new Error(`Kimi ${response.status}`);
  const data = JSON.parse(responseText);
  return data.choices?.[0]?.message?.content;
}

async function tryClaudeModel(prompt, systemPrompt, model = 'claude-haiku-4-5-20251001', maxTokens = 8192) {
  console.log('[claude] attempting call...');
  console.log('[claude] API key present:', !!process.env.ANTHROPIC_API_KEY);
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
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    }
  );
  console.log('[claude] response status:', response.status);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(`Claude ${response.status}: ${errorBody?.error?.message || 'unknown'}`);
  }
  const data = await response.json();
  return data.content?.[0]?.text;
}

async function tryGeminiModel(userPrompt, modelName, thinkingBudget = 0, systemPrompt = '') {
  try {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error('No Gemini key');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget } }
        })
      }
    );
    console.log(`[gemini] ${modelName} status:`, response.status);
    const rawText = await response.text();
    if (!response.ok) throw new Error(`${modelName} ${response.status}: ${rawText.substring(0, 200)}`);
    const data = JSON.parse(rawText);
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS') { console.error(`[gemini] ${modelName} truncated`); return null; }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No text in response');
    console.log(`[gemini] ${modelName} succeeded, length:`, text.length);
    return text;
  } catch (e) {
    console.error(`[gemini] ${modelName} failed:`, e.message);
    return null;
  }
}

// ── Model Router ──────────────────────────────────────────────────────────────
async function routeToModel(generationType, prompt, systemPrompt) {
  console.log('[skills] System prompt length:', systemPrompt.length);
  const chains = {
    'page': [
      () => tryKimiModel(prompt, systemPrompt),
      () => tryClaudeModel(prompt, systemPrompt, 'claude-haiku-4-5-20251001', 8192),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ],
    'template': [
      () => tryKimiModel(prompt, systemPrompt),
      () => tryClaudeModel(prompt, systemPrompt, 'claude-haiku-4-5-20251001', 8192),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ],
    'section': [
      () => tryKimiModel(prompt, systemPrompt),
      () => tryClaudeModel(prompt, systemPrompt),
      () => tryGeminiModel(prompt, 'gemini-2.5-flash', 0, systemPrompt)
    ],
    'refine': [
      () => tryClaudeModel(prompt, systemPrompt),
      () => tryKimiModel(prompt, systemPrompt),
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
  };
  const chain = chains[generationType] || chains['page'];
  let lastError;
  for (let i = 0; i < chain.length; i++) {
    try {
      console.log(`[router] trying model ${i+1}/${chain.length} for task: ${generationType}`);
      const result = await chain[i]();
      if (result) { console.log(`[router] success on attempt ${i+1}`); return result; }
    } catch (err) {
      console.log(`[router] model ${i+1} failed:`, err.message);
      lastError = err;
    }
  }
  throw new Error(`All models failed for ${generationType}: ${lastError?.message}`);
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-License-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const generation_type = body.generation_type || 'page';
  const license_key = req.headers['x-license-key'] || body.license_key;

  // ── License check (skip for test/palette/seo) ──
  if (!['test', 'palette', 'seo'].includes(generation_type)) {
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
      const systemPrompt = buildSystemPrompt(body);
      const prompt = `You are a JSON editor. Return ONLY the updated JSON object. No markdown.\n\nContext:\n${body.contextJson}\n\nInstruction: ${body.prompt}`;
      const rawText = await routeToModel('refine', prompt, systemPrompt);
      const cleaned = rawText.trim().replace(/^```json\s*/i,'').replace(/\s*```$/,'').trim();
      return res.status(200).json({ success: true, data: JSON.parse(cleaned) });
    }

    // ── SECTION ──
    if (generation_type === 'section') {
      const systemPrompt = [loadSkill('base.md'), loadSkill('contrast.md'), loadSkill('sections/blueprints.md')].filter(Boolean).join('\n\n---\n\n');
      const prompt = `Add a single section. Return JSON with ONE section object (not a full page): ${body.prompt}`;
      const rawText = await routeToModel('section', prompt, systemPrompt);
      const cleaned = rawText.trim().replace(/^```json\s*/i,'').replace(/\s*```$/,'').trim();
      const parsed = JSON.parse(cleaned);
      const section = parsed.sections?.[0] ?? parsed;
      return res.status(200).json({ success: true, data: { sections: [section] } });
    }

    // ── PAGE GENERATION (main) — Kimi → Claude → Gemini ──
    const systemPrompt = buildSystemPrompt(body);
    const userPrompt   = buildUserPrompt(body);

    console.log('[generate] type:', generation_type);
    console.log('[generate] skills system prompt length:', systemPrompt.length);

    const rawText = await routeToModel(generation_type, userPrompt, systemPrompt);
    let text = rawText.trim().replace(/^```json\s*/i,'').replace(/\s*```$/,'').trim();

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
