// WPCraft — /api/generate.mjs v5.3
// Claude-first for page generation (reliable JSON), Kimi/Gemini fallback
// Fast: reduced system prompt, Claude Haiku is ~3-5s for full pages

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
  if (l.includes('restaurant') || l.includes('food') || l.includes('cafe')) return loadSkill('industries/restaurant.md');
  if (l.includes('seo') || l.includes('marketing') || l.includes('agency') || l.includes('digital')) return loadSkill('industries/agency.md');
  if (l.includes('real estate') || l.includes('property')) return loadSkill('industries/realestate.md');
  if (l.includes('saas') || l.includes('software') || l.includes('tech') || l.includes('app')) return loadSkill('industries/saas.md');
  if (l.includes('construct') || l.includes('engineer') || l.includes('mep') || l.includes('contracting')) return loadSkill('industries/construction.md');
  if (l.includes('medical') || l.includes('health') || l.includes('clinic')) return loadSkill('industries/medical.md');
  return loadSkill('industries/default.md');
}

function toneSkill(tone = '') {
  const l = tone.toLowerCase();
  if (l.includes('luxury') || l.includes('elegant') || l.includes('premium')) return loadSkill('tones/luxury.md');
  if (l.includes('bold') || l.includes('energetic')) return loadSkill('tones/bold.md');
  if (l.includes('minimal') || l.includes('clean')) return loadSkill('tones/minimal.md');
  if (l.includes('friendly') || l.includes('approachable') || l.includes('warm')) return loadSkill('tones/friendly.md');
  return loadSkill('tones/professional.md');
}

// ── System prompt builder (trimmed for speed) ─────────────────────────────────
function buildSystemPrompt(body) {
  return [
    loadSkill('base.md'),
    loadSkill('contrast.md'),
    industrySkill(body.industry),
    toneSkill(body.tone),
    loadSkill('sections/blueprints.md'),
  ].filter(Boolean).join('\n\n---\n\n');
}

// ── User prompt ───────────────────────────────────────────────────────────────
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
  p.push(`Generate exactly ${count} sections total (navbar + footer count). Navbar first, footer last. Real copy only. Return raw JSON only.`);
  return p.join('\n');
}

// ── JSON repair ───────────────────────────────────────────────────────────────
function repairJSON(str) {
  str = str.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  // Extract JSON object
  const start = str.indexOf('{');
  if (start > 0) str = str.substring(start);
  // Remove trailing comma before closing
  str = str.replace(/,(\s*[}\]])/g, '$1');
  // Count and close unclosed brackets
  let braces = 0, brackets = 0, inStr = false, esc = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (esc) { esc = false; continue; }
    if (c === '\\' && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') braces++; else if (c === '}') braces--;
    else if (c === '[') brackets++; else if (c === ']') brackets--;
  }
  // If inside unclosed string, trim back to last complete value
  if (inStr) {
    const lastComma = str.lastIndexOf(',');
    const lastBrace = str.lastIndexOf('{');
    const trim = Math.max(lastComma, lastBrace);
    if (trim > 0) str = str.substring(0, trim);
    // Recount
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
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  try { return JSON.parse(repairJSON(cleaned)); } catch {}
  const m = cleaned.match(/\{[\s\S]*/);
  if (m) { try { return JSON.parse(repairJSON(m[0])); } catch {} }
  throw new Error('Could not parse JSON from model response');
}

// ── Model calls ───────────────────────────────────────────────────────────────
async function callClaude(userPrompt, systemPrompt, maxTokens = 16000) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('No Anthropic key');
  console.log('[claude] calling haiku...');
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
  console.log('[claude] status:', res.status);
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(`Claude ${res.status}: ${e?.error?.message || 'unknown'}`); }
  const data = await res.json();
  const text = data.content?.[0]?.text;
  const stop = data.stop_reason;
  console.log('[claude] stop_reason:', stop, '| length:', text?.length || 0);
  if (stop === 'max_tokens') { console.error('[claude] truncated'); return null; }
  return text;
}

async function callKimi(userPrompt, systemPrompt, maxTokens = 16000) {
  const key = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
  if (!key) throw new Error('No Kimi key');
  console.log('[kimi] calling...');
  const res = await fetch('https://api.moonshot.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'kimi-k2-turbo-preview',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.6,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }  // Force JSON mode
    })
  });
  console.log('[kimi] status:', res.status);
  const raw = await res.text();
  if (!res.ok) throw new Error(`Kimi ${res.status}`);
  const data = JSON.parse(raw);
  const text = data.choices?.[0]?.message?.content;
  const finish = data.choices?.[0]?.finish_reason;
  console.log('[kimi] finish_reason:', finish, '| length:', text?.length || 0);
  if (finish === 'length') { console.error('[kimi] truncated'); return null; }
  return text;
}

async function callGemini(userPrompt, systemPrompt, model = 'gemini-2.5-flash') {
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
        generationConfig: { temperature: 0.7, maxOutputTokens: 16384, responseMimeType: 'application/json' }
      })
    }
  );
  console.log(`[gemini] ${model} status:`, res.status);
  const raw = await res.text();
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = JSON.parse(raw);
  const finish = data.candidates?.[0]?.finishReason;
  if (finish === 'MAX_TOKENS') { console.error('[gemini] truncated'); return null; }
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

// ── Model router — Claude FIRST for page (most reliable JSON) ─────────────────
async function routeToModel(type, userPrompt, systemPrompt) {
  const chains = {
    // Page: Claude first (best JSON), Gemini second, Kimi third  
    page:      [() => callClaude(userPrompt, systemPrompt), () => callGemini(userPrompt, systemPrompt), () => callKimi(userPrompt, systemPrompt)],
    template:  [() => callClaude(userPrompt, systemPrompt), () => callGemini(userPrompt, systemPrompt), () => callKimi(userPrompt, systemPrompt)],
    section:   [() => callClaude(userPrompt, systemPrompt, 8000), () => callGemini(userPrompt, systemPrompt), () => callKimi(userPrompt, systemPrompt, 8000)],
    refine:    [() => callClaude(userPrompt, systemPrompt, 4000), () => callKimi(userPrompt, systemPrompt, 4000)],
    copywriting:[() => callClaude(userPrompt, systemPrompt, 4000)],
    seo:       [() => callClaude(userPrompt, systemPrompt, 2000)],
    palette:   [() => callClaude(userPrompt, systemPrompt, 1000)],
  };
  const chain = chains[type] || chains.page;
  let lastErr;
  for (let i = 0; i < chain.length; i++) {
    try {
      console.log(`[router] attempt ${i+1}/${chain.length} for ${type}`);
      const result = await chain[i]();
      if (result) { console.log(`[router] success on attempt ${i+1}`); return result; }
      console.log(`[router] attempt ${i+1} returned null (truncated), trying next`);
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

  // License check (skip for utility types)
  if (!['test','palette','seo','enhance_prompt'].includes(generation_type)) {
    if (!license_key) return res.status(401).json({ success: false, error: 'License required. Go to WPCraft → Settings.' });
  }

  console.log(`[generate] type: ${generation_type} | license: ${license_key ? 'present' : 'missing'}`);

  try {
    // ── ENHANCE PROMPT (local, instant) ──────────────────────────────────
    if (generation_type === 'enhance_prompt') {
      return res.status(200).json({ success: true, data: { enhanced_prompt: body.prompt || '' } });
    }

    // ── SEO ──────────────────────────────────────────────────────────────
    if (generation_type === 'seo') {
      const text = await callClaude(
        `Analyze this page content and return ONLY JSON: {"title":"...","description":"...","keywords":["..."]}. Content: ${(body.prompt||'').substring(0,2000)}`,
        'Return only valid JSON. No markdown. No explanation.'
      );
      return res.status(200).json({ success: true, data: parseJSON(text) });
    }

    // ── PALETTE ───────────────────────────────────────────────────────────
    if (generation_type === 'palette') {
      const text = await callClaude(
        `Generate color palette for: ${body.prompt}. Return ONLY JSON: {"primary":"#hex","secondary":"#hex","accent":"#hex","background":"#hex","text":"#hex"}`,
        'Return only valid JSON. No markdown.'
      );
      return res.status(200).json({ success: true, data: parseJSON(text) });
    }

    // ── REFINE ────────────────────────────────────────────────────────────
    if (generation_type === 'refine') {
      const systemPrompt = loadSkill('base.md') + '\n\n' + loadSkill('contrast.md');
      const text = await routeToModel('refine',
        `Return ONLY the updated JSON object. No markdown.\n\nContext:\n${body.contextJson}\n\nInstruction: ${body.prompt}`,
        systemPrompt
      );
      return res.status(200).json({ success: true, data: parseJSON(text) });
    }

    // ── SECTION ───────────────────────────────────────────────────────────
    if (generation_type === 'section') {
      const systemPrompt = [loadSkill('base.md'), loadSkill('contrast.md'), loadSkill('sections/blueprints.md')].join('\n\n---\n\n');
      const text = await routeToModel('section',
        `Generate ONE section object (not a full page). Return a single section JSON: ${body.prompt}`,
        systemPrompt
      );
      const parsed = parseJSON(text);
      const section = parsed.sections?.[0] ?? parsed;
      return res.status(200).json({ success: true, data: { sections: [section] } });
    }

    // ── PAGE GENERATION ───────────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(body);
    const userPrompt   = buildUserPrompt(body);
    console.log(`[generate] system prompt: ${systemPrompt.length} chars | user prompt: ${userPrompt.length} chars`);

    const rawText = await routeToModel(generation_type, userPrompt, systemPrompt);
    const parsed  = parseJSON(rawText);

    const pageData = {
      title:    parsed.title || parsed.pageTitle || 'Generated Page',
      sections: parsed.sections || parsed.elements || []
    };

    console.log(`[generate] success — ${pageData.sections.length} sections`);

    // ── Stream NDJSON ─────────────────────────────────────────────────────
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
