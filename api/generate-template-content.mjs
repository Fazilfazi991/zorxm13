// WPCraft — /api/generate-template-content.mjs
// Generates flat content to fill template {{PLACEHOLDERS}}
// Much cheaper than full page JSON — just text values, no structural JSON needed

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function loadSkill(rel) {
  try {
    const p = join(process.cwd(), 'skills', rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
  } catch { return ''; }
}

function getIndustryId(industry = '') {
  const l = industry.toLowerCase();
  if (l.includes('saas') || l.includes('tech')) return 'saas';
  if (l.includes('real estate')) return 'real_estate';
  if (l.includes('restaurant') || l.includes('food')) return 'restaurant';
  if (l.includes('commerce')) return 'ecommerce';
  if (l.includes('medical') || l.includes('health')) return 'medical';
  if (l.includes('law') || l.includes('legal')) return 'legal';
  if (l.includes('finance') || l.includes('account')) return 'finance';
  if (l.includes('construct') || l.includes('contractor')) return 'construction';
  if (l.includes('home')) return 'home_services';
  if (l.includes('consult')) return 'consulting';
  if (l.includes('profit')) return 'nonprofit';
  if (l.includes('event')) return 'event_planning';
  if (l.includes('photo') || l.includes('creative')) return 'photography';
  if (l.includes('logistic') || l.includes('shipping')) return 'logistics';
  if (l.includes('education') || l.includes('coach')) return 'education';
  if (l.includes('fitness') || l.includes('gym')) return 'fitness';
  if (l.includes('auto') || l.includes('car')) return 'automotive';
  if (l.includes('beauty') || l.includes('salon')) return 'beauty';
  if (l.includes('agency') || l.includes('market')) return 'agency';
  return 'default';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const { businessName, industry, location, pageGoal, pageType, tone, primaryColor, phone, email, template, referenceStyleContext } = body;

  const key = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
  if (!key) return res.status(500).json({ error: 'No API key configured' });

  const pt = pageType || 'homepage';
  let keysJSON;
  try {
    const p = join(process.cwd(), 'skills', 'pageTypes', `${pt}.json`);
    keysJSON = readFileSync(p, 'utf8');
  } catch(e) {
    const fallbackPath = join(process.cwd(), 'skills', 'pageTypes', 'homepage.json');
    keysJSON = readFileSync(fallbackPath, 'utf8');
  }

  const iid = getIndustryId(industry);
  const indSkill = loadSkill(`industries/${iid}.md`) || loadSkill('industries/default.md');
  const gid = pageGoal ? pageGoal.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'generate_leads';
  const goalSkill = loadSkill(`goals/${gid}.md`);

  const systemPrompt = `You are a world-class copywriter generating website content. 
Return ONLY valid JSON with the exact keys listed. No markdown, no explanation.
Write real, specific, compelling copy for the exact business described.
Every field must have real content — no placeholders, no generic filler.
${referenceStyleContext ? `\nSTYLE DIRECTION: ${referenceStyleContext}` : ''}

${indSkill}
${goalSkill}`;

  const userPrompt = `Generate website content for:
Business: ${businessName || 'Our Business'}
Industry: ${industry || 'Professional Services'}
Location: ${location || 'Dubai, UAE'}
Goal: ${pageGoal || 'Get leads'}
Tone: ${tone || 'Professional'}
Primary color: ${primaryColor || '#00a86b'}
Phone: ${phone || '+971 50 000 0000'}
Email: ${email || 'hello@business.com'}
Template style: ${template || 'clean-modern'}

Return JSON with EXACTLY these keys:
${keysJSON}

CRITICAL: Use real Unsplash photo IDs relevant to the industry.
Agency/marketing: photo-1460925895917-afdab827c52f (team working)
Restaurant/food: photo-1414235077428-338989a2e8c0 (food)
Real estate: photo-1560518883-ce09059eeffa (luxury home)
Medical/health: photo-1576091160550-2173dba999ef (medical)
Construction: photo-1504307651254-35680f356dfd (construction)
Tech/SaaS: photo-1551434678-e076c223a692 (office tech)
Retail/fashion: photo-1441984904996-e0b6ba687e04 (retail)
Fitness/sports: photo-1517836357463-d25dfeac3438 (fitness)
Education: photo-1524178232363-1fb2b075b655 (education)
Finance: photo-1611974789855-9c2a0a7236a3 (finance)`;

  try {
    console.log('[template-content] calling Kimi for:', businessName, industry);
    const res2 = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'kimi-k2-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    });

    if (!res2.ok) {
      const err = await res2.text();
      throw new Error(`Kimi ${res2.status}: ${err.substring(0, 100)}`);
    }

    const data = await res2.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Kimi');

    const content = JSON.parse(text);
    console.log('[template-content] success, keys:', Object.keys(content).length);

    return res.status(200).json({ success: true, data: content });

  } catch (err) {
    console.error('[template-content error]', err.message);

    // Fallback to Gemini
    try {
      const genKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      const gr = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${genKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4000, responseMimeType: 'application/json' }
          })
        }
      );
      const gdata = await gr.json();
      const gtext = gdata.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!gtext) throw new Error('Gemini also failed');
      const gcontent = JSON.parse(gtext);
      return res.status(200).json({ success: true, data: gcontent });
    } catch (e2) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
