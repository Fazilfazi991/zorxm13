// WPCraft — /api/generate-template-content.mjs
// Generates flat content to fill template {{PLACEHOLDERS}}
// Much cheaper than full page JSON — just text values, no structural JSON needed

import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const { businessName, industry, location, pageGoal, tone, primaryColor, phone, email, template, referenceStyleContext } = body;

  const key = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
  if (!key) return res.status(500).json({ error: 'No API key configured' });

  const systemPrompt = `You are a world-class copywriter generating website content. 
Return ONLY valid JSON with the exact keys listed. No markdown, no explanation.
Write real, specific, compelling copy for the exact business described.
Every field must have real content — no placeholders, no generic filler.
${referenceStyleContext ? `\nSTYLE DIRECTION: ${referenceStyleContext}` : ''}`;

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
{
  "BUSINESS_NAME": "business name",
  "TAGLINE": "short punchy tagline under 8 words",
  "EYEBROW": "3-5 word uppercase label e.g. DUBAI'S #1 SEO AGENCY",
  "NAV_CTA": "short nav button text e.g. Get Started",
  "HERO_H1_LINE1": "first line of hero headline (3-5 words)",
  "HERO_H1_LINE2": "second line, the most powerful words (2-4 words)",
  "HERO_BODY": "1-2 sentence hero description, specific and compelling",
  "HERO_CTA_1": "primary button text",
  "HERO_CTA_2": "secondary button text",
  "HERO_IMAGE_URL": "https://images.unsplash.com/photo-[RELEVANT_ID]?w=1200&q=85",
  "LOGOSTRIP_LABEL": "Trusted by line e.g. Trusted by 200+ businesses across the UAE",
  "LOGO_1": "Client or partner name 1",
  "LOGO_2": "Client or partner name 2",
  "LOGO_3": "Client or partner name 3",
  "LOGO_4": "Client or partner name 4",
  "LOGO_5": "Client or partner name 5",
  "SERVICES_EYEBROW": "WHAT WE DO or similar",
  "SERVICES_H2": "Services section heading",
  "SERVICES_BODY": "1 sentence about services",
  "SERVICES_CTA": "View All Services",
  "SERVICE_1_TITLE": "Service 1 name",
  "SERVICE_1_DESC": "2-3 sentence service description",
  "SERVICE_1_ICON": "single relevant emoji",
  "SERVICE_2_TITLE": "Service 2 name",
  "SERVICE_2_DESC": "2-3 sentence service description",
  "SERVICE_2_ICON": "single relevant emoji",
  "SERVICE_3_TITLE": "Service 3 name",
  "SERVICE_3_DESC": "2-3 sentence service description",
  "SERVICE_3_ICON": "single relevant emoji",
  "ABOUT_EYEBROW": "OUR STORY or similar",
  "ABOUT_H2": "About section heading",
  "ABOUT_H2_LINE1": "first part of about heading",
  "ABOUT_H2_LINE2": "italic second part",
  "ABOUT_BODY": "2-3 sentence about paragraph, specific",
  "ABOUT_IMAGE_URL": "https://images.unsplash.com/photo-[RELEVANT_ID]?w=1200&q=85",
  "ABOUT_CHECK_1": "Key differentiator 1",
  "ABOUT_CHECK_2": "Key differentiator 2",
  "ABOUT_CHECK_3": "Key differentiator 3",
  "ABOUT_CTA": "Learn More About Us",
  "ABOUT_H2": "About heading",
  "FEATURE_1_ICON": "emoji",
  "FEATURE_1_TITLE": "Feature 1 title",
  "FEATURE_1_DESC": "One sentence feature description",
  "FEATURE_2_ICON": "emoji",
  "FEATURE_2_TITLE": "Feature 2 title",
  "FEATURE_2_DESC": "One sentence feature description",
  "FEATURE_3_ICON": "emoji",
  "FEATURE_3_TITLE": "Feature 3 title",
  "FEATURE_3_DESC": "One sentence feature description",
  "STAT_1_NUM": "impressive number with suffix e.g. 200+ or 98%",
  "STAT_1_LABEL": "what that number means",
  "STAT_2_NUM": "impressive number",
  "STAT_2_LABEL": "what it means",
  "STAT_3_NUM": "impressive number",
  "STAT_3_LABEL": "what it means",
  "STAT_4_NUM": "impressive number",
  "STAT_4_LABEL": "what it means",
  "TESTI_EYEBROW": "WHAT OUR CLIENTS SAY or similar",
  "TESTI_H2": "Testimonials section heading",
  "TESTI_1_QUOTE": "Compelling client quote 2-3 sentences",
  "TESTI_1_NAME": "Client Full Name",
  "TESTI_1_ROLE": "Title, Company Name",
  "TESTI_2_QUOTE": "Different compelling client quote",
  "TESTI_2_NAME": "Client Full Name",
  "TESTI_2_ROLE": "Title, Company Name",
  "TESTI_3_QUOTE": "Third compelling quote",
  "TESTI_3_NAME": "Client Full Name",
  "TESTI_3_ROLE": "Title, Company Name",
  "CTA_EYEBROW": "READY TO GET STARTED? or similar",
  "CTA_H2_LINE1": "CTA heading first part",
  "CTA_H2_LINE2": "CTA heading second part (italic/accent)",
  "CTA_BODY": "1-2 sentence CTA description with urgency",
  "CTA_BTN_1": "Primary CTA button",
  "CTA_BTN_2": "Secondary CTA button",
  "CTA_LINK_1": "#contact",
  "CTA_LINK_2": "https://wa.me/${phone?.replace(/[^0-9]/g,'')}",
  "FOOTER_TAGLINE": "Short brand promise under 10 words",
  "SOCIAL_INSTAGRAM": "#",
  "SOCIAL_LINKEDIN": "#",
  "SOCIAL_WHATSAPP": "https://wa.me/${phone?.replace(/[^0-9]/g,'')}",
  "PHONE": "${phone || '+971 50 000 0000'}",
  "EMAIL": "${email || 'hello@business.com'}",
  "LOCATION": "${location || 'Dubai, UAE'}",
  "COPYRIGHT": "© 2025 ${businessName}. All rights reserved.",
  "PRIMARY_COLOR": "${primaryColor || '#00a86b'}"
}

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
