// WPCraft — /api/generate.mjs v5.4
// Kimi-first (cheap + fast with JSON mode), Gemini fallback, Claude emergency only
// JSON mode forces valid JSON — no more corrupt output

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '');

// ── Skill loader ──────────────────────────────────────────────────────────────
function loadSkill(rel) {
  try {
    const p = join(process.cwd(), 'skills', rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
  } catch { return ''; }
}

function industrySkill(industry = '') {
  const l = industry.toLowerCase();
  let id = 'default';
  if (l.includes('saas') || l.includes('tech')) id = 'saas';
  else if (l.includes('real estate')) id = 'real_estate';
  else if (l.includes('restaurant') || l.includes('food')) id = 'restaurant';
  else if (l.includes('commerce')) id = 'ecommerce';
  else if (l.includes('medical') || l.includes('health')) id = 'medical';
  else if (l.includes('law') || l.includes('legal')) id = 'legal';
  else if (l.includes('finance') || l.includes('account')) id = 'finance';
  else if (l.includes('construct') || l.includes('contractor')) id = 'construction';
  else if (l.includes('home')) id = 'home_services';
  else if (l.includes('consult')) id = 'consulting';
  else if (l.includes('profit')) id = 'nonprofit';
  else if (l.includes('event')) id = 'event_planning';
  else if (l.includes('photo') || l.includes('creative')) id = 'photography';
  else if (l.includes('logistic') || l.includes('shipping')) id = 'logistics';
  else if (l.includes('education') || l.includes('coach')) id = 'education';
  else if (l.includes('fitness') || l.includes('gym')) id = 'fitness';
  else if (l.includes('auto') || l.includes('car')) id = 'automotive';
  else if (l.includes('beauty') || l.includes('salon')) id = 'beauty';
  else if (l.includes('agency') || l.includes('market')) id = 'agency';
  return loadSkill(`industries/${id}.md`);
}

function toneSkill(tone = '') {
  const l = tone.toLowerCase();
  if (l.includes('luxury') || l.includes('elegant') || l.includes('premium')) return loadSkill('tones/luxury.md');
  if (l.includes('bold') || l.includes('energetic')) return loadSkill('tones/bold.md');
  if (l.includes('minimal') || l.includes('clean')) return loadSkill('tones/minimal.md');
  if (l.includes('friendly') || l.includes('approachable') || l.includes('warm')) return loadSkill('tones/friendly.md');
  return loadSkill('tones/professional.md');
}

function buildSystemPrompt(body) {
  const parts = [
    loadSkill('base.md'),
    loadSkill('contrast.md'),
    industrySkill(body.industry),
    toneSkill(body.tone),
    loadSkill('sections/blueprints.md'),
  ];
  
  // Inject reference style context if provided
  if (body.referenceStyleContext) {
    parts.push(`## STYLE REFERENCE — HIGH PRIORITY\n\nThe user has provided a design reference. Match this style direction when generating:\n\n${body.referenceStyleContext}\n\nApply these visual characteristics: adapt the color palette, typography weight, layout approach, and overall aesthetic to match the reference while using the business content provided.`);
  }
  
  return parts.filter(Boolean).join('\n\n---\n\n');
}

function buildUserPrompt(body) {
  if (body.enhancedPrompt) return body.enhancedPrompt;
  const p = [];
  if (body.businessName) p.push(`Business: ${body.businessName}`);
  if (body.industry)     p.push(`Industry: ${body.industry}`);
  if (body.location)     p.push(`Location: ${body.location}`);
  if (body.pageGoal)     p.push(`Goal: ${body.pageGoal}`);
  if (body.tone)         p.push(`Tone: ${body.tone}`);
  if (body.primaryColor) p.push(`Primary color: ${body.primaryColor}`);
  if (body.description)  p.push(`Description: ${body.description}`);
  if (body.prompt)       p.push(`Additional: ${body.prompt}`);
  if (body.sections?.length) p.push(`Include sections: ${body.sections.join(', ')}`);
  const count = body.sectionCount || 6;
  p.push(`Generate exactly ${count} sections total (navbar + footer count). Navbar first, footer last. Real copy only.`);
  if (body.referenceStyleContext) {
    p.push(`\nSTYLE BRIEF: ${body.referenceStyleContext.substring(0, 400)}`);
  }
  return p.join('\n');
}

// ── JSON repair ───────────────────────────────────────────────────────────────
function repairJSON(str) {
  // Strip markdown fences
  str = str.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  // Find opening brace
  const start = str.indexOf('{');
  if (start > 0) str = str.substring(start);
  // Remove trailing commas before closing brackets
  str = str.replace(/,(\s*[}\]])/g, '$1');
  // Remove incomplete string at the end
  // Find last complete JSON value
  const trimBack = (s) => {
    // Remove trailing incomplete key or value
    const lastColon = s.lastIndexOf(':');
    const lastComma = s.lastIndexOf(',');
    const lastComplete = Math.max(lastComma, 0);
    if (lastColon > lastComma && lastColon > s.lastIndexOf('}') && lastColon > s.lastIndexOf(']')) {
      // Cut back to last complete property
      return s.substring(0, Math.max(lastComma, s.lastIndexOf('}'), s.lastIndexOf(']')));
    }
    return s;
  };
  // Count unclosed brackets
  let braces = 0, brackets = 0, inStr = false, esc = false;
  let lastSafePos = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (esc) { esc = false; continue; }
    if (c === '\\' && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') braces++; else if (c === '}') { braces--; if (braces >= 0) lastSafePos = i + 1; }
    else if (c === '[') brackets++; else if (c === ']') { brackets--; if (brackets >= 0) lastSafePos = i + 1; }
  }
  // If still inside a string, trim back to last safe position
  if (inStr && lastSafePos > 0) {
    str = str.substring(0, lastSafePos);
    braces = 0; brackets = 0;
    for (const c of str) {
      if (c === '{') braces++; else if (c === '}') braces--;
      else if (c === '[') brackets++; else if (c === ']') brackets--;
    }
  }
  str = str.trimEnd().replace(/,\s*$/, '');
  while (brackets > 0) { str += ']'; brackets--; }
  while (braces > 0)   { str += '}'; braces--; }
  return str;
}

function parseJSON(raw) {
  if (!raw) throw new Error('Empty response from model');
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  // Try 1: direct parse
  try { return JSON.parse(cleaned); } catch {}
  // Try 2: repair and parse
  try { return JSON.parse(repairJSON(cleaned)); } catch {}
  // Try 3: find JSON object and repair
  const m = cleaned.match(/\{[\s\S]*/);
  if (m) { try { return JSON.parse(repairJSON(m[0])); } catch {} }
  throw new Error('Could not parse JSON from model response (all repair attempts failed)');
}

// ── Model calls ───────────────────────────────────────────────────────────────

// KIMI — primary, cheapest, JSON mode forces valid JSON
async function callKimi(userPrompt, systemPrompt, maxTokens = 16000) {
  const key = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
  if (!key) throw new Error('No Kimi key');
  console.log('[kimi] calling with JSON mode, maxTokens:', maxTokens);
  const res = await fetch('https://api.moonshot.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'kimi-k2-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }  // ← Forces valid JSON every time
    })
  });
  console.log('[kimi] status:', res.status);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kimi ${res.status}: ${err.substring(0, 100)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  const finish = data.choices?.[0]?.finish_reason;
  const usage = data.usage;
  console.log('[kimi] finish_reason:', finish, '| length:', text?.length || 0, '| tokens:', usage?.total_tokens || '?');
  if (finish === 'length') {
    console.error('[kimi] hit token limit, will try fallback');
    return null;
  }
  return text;
}

// GEMINI — second choice, free tier available, also enforces JSON via responseMimeType
async function callGemini(userPrompt, systemPrompt, model = 'gemini-2.0-flash') {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('No Gemini key');
  console.log(`[gemini] calling ${model}...`);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384,
          responseMimeType: 'application/json'  // ← Forces valid JSON
        }
      })
    }
  );
  console.log(`[gemini] ${model} status:`, res.status);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.substring(0, 100)}`);
  }
  const data = await res.json();
  const finish = data.candidates?.[0]?.finishReason;
  if (finish === 'MAX_TOKENS') { console.error('[gemini] truncated'); return null; }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('[gemini] finish:', finish, '| length:', text?.length || 0);
  return text;
}

// CLAUDE — emergency fallback only (expensive, use sparingly)
async function callClaude(userPrompt, systemPrompt, maxTokens = 8000) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('No Anthropic key');
  console.log('[claude] calling haiku (emergency fallback)...');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(`Claude ${res.status}: ${e?.error?.message}`); }
  const data = await res.json();
  console.log('[claude] stop_reason:', data.stop_reason, '| length:', data.content?.[0]?.text?.length || 0);
  if (data.stop_reason === 'max_tokens') return null;
  return data.content?.[0]?.text;
}

// ── Model router ──────────────────────────────────────────────────────────────
async function routeToModel(type, userPrompt, systemPrompt) {
  // Kimi first (cheapest), Gemini second (free), Claude only for refine/seo (small tasks)
  const chains = {
    page:      [() => callKimi(userPrompt, systemPrompt, 16000), () => callGemini(userPrompt, systemPrompt, 'gemini-2.5-flash')],
    template:  [() => callKimi(userPrompt, systemPrompt, 16000), () => callGemini(userPrompt, systemPrompt)],
    section:   [() => callKimi(userPrompt, systemPrompt, 8000),  () => callGemini(userPrompt, systemPrompt)],
    refine:    [() => callKimi(userPrompt, systemPrompt, 4000),  () => callGemini(userPrompt, systemPrompt)],
    seo:       [() => callGemini(userPrompt, systemPrompt, 'gemini-2.0-flash')],
    palette:   [() => callGemini(userPrompt, systemPrompt, 'gemini-2.0-flash')],
  };
  const chain = chains[type] || chains.page;
  let lastErr;
  for (let i = 0; i < chain.length; i++) {
    try {
      console.log(`[router] attempt ${i+1}/${chain.length} for "${type}"`);
      const result = await chain[i]();
      if (result) { console.log(`[router] success on attempt ${i+1}`); return result; }
      console.log(`[router] attempt ${i+1} returned null, trying next`);
    } catch (e) {
      console.error(`[router] attempt ${i+1} error:`, e.message);
      lastErr = e;
    }
  }
  throw new Error(`All models failed for ${type}: ${lastErr?.message}`);
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-License-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const generation_type = body.generation_type || 'page';
  const license_key = req.headers['x-license-key'] || body.license_key;

  if (!['test','palette','seo','enhance_prompt'].includes(generation_type)) {
    if (!license_key) return res.status(401).json({ success: false, error: 'License required.' });
  }

  console.log(`[generate] type:${generation_type} | skills:${loadSkill('base.md').length}chars`);

  try {

    if (generation_type === 'enhance_prompt') {
      return res.status(200).json({ success: true, data: { enhanced_prompt: body.prompt || '' } });
    }

    if (generation_type === 'seo') {
      const text = await callGemini(
        `Analyze this content and return ONLY JSON: {"title":"...","description":"...","keywords":["..."]}. Content: ${(body.prompt||'').substring(0,2000)}`,
        'Return only valid JSON. No markdown.',
        'gemini-2.0-flash'
      );
      return res.status(200).json({ success: true, data: parseJSON(text) });
    }

    if (generation_type === 'palette') {
      const text = await callGemini(
        `Generate color palette for: ${body.prompt}. Return ONLY JSON: {"primary":"#hex","secondary":"#hex","accent":"#hex","background":"#hex","text":"#hex"}`,
        'Return only valid JSON.',
        'gemini-2.0-flash'
      );
      return res.status(200).json({ success: true, data: parseJSON(text) });
    }

    if (generation_type === 'refine') {
      const sp = loadSkill('base.md') + '\n\n' + loadSkill('contrast.md');
      const text = await routeToModel('refine',
        `Return ONLY the updated JSON object. No markdown.\n\nContext:\n${body.contextJson}\n\nInstruction: ${body.prompt}`,
        sp
      );
      return res.status(200).json({ success: true, data: parseJSON(text) });
    }

    if (generation_type === 'section') {
      const sp = [loadSkill('base.md'), loadSkill('contrast.md'), loadSkill('sections/blueprints.md')].join('\n\n---\n\n');
      const text = await routeToModel('section',
        `Generate ONE section object (not a full page). Return a single section JSON object: ${body.prompt}`,
        sp
      );
      const parsed = parseJSON(text);
      const section = parsed.sections?.[0] ?? parsed;
      return res.status(200).json({ success: true, data: { sections: [section] } });
    }

    // ── PAGE GENERATION ───────────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(body);
    const userPrompt   = buildUserPrompt(body);
    console.log(`[generate] system:${systemPrompt.length}c user:${userPrompt.length}c`);

    const rawText = await routeToModel(generation_type, userPrompt, systemPrompt);
    const parsed  = parseJSON(rawText);

    const pageData = {
      title:    parsed.title || parsed.pageTitle || 'Generated Page',
      sections: parsed.sections || parsed.elements || []
    };

    console.log(`[generate] success — ${pageData.sections.length} sections`);

    // Stream NDJSON
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-store');

    res.write(JSON.stringify({ type: 'skeleton', sections: pageData.sections.length, message: 'Building your page...' }) + '\n');
    for (let i = 0; i < pageData.sections.length; i++) {
      await new Promise(r => setTimeout(r, 50));
      res.write(JSON.stringify({ type: 'section', index: i + 1, total: pageData.sections.length, data: pageData.sections[i] }) + '\n');
    }
    res.write(JSON.stringify({ type: 'complete', title: pageData.title, timestamp: Date.now() }) + '\n');
    return res.end();

  } catch (err) {
    console.error('[WPCraft error]', err.message);
    try { res.write(JSON.stringify({ type: 'error', message: err.message }) + '\n'); return res.end(); }
    catch { return res.status(500).json({ success: false, error: err.message }); }
  }
}
