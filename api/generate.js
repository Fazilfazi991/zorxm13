
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MANUS_API_KEY = process.env.MANUS_API_KEY;
const MANUS_API_BASE = process.env.MANUS_API_BASE || 'https://api.manus.im/v1';

function hexToRgba(hex, alpha) {
  let r = 0, g = 0, b = 0;
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function validateElementorJson(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.version && Array.isArray(data.content) && data.content.length > 0) {
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function tryClaude(prompt, systemPrompt) {
  if (!ANTHROPIC_API_KEY) return null;
  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content[0].text;
    const validated = validateElementorJson(content);
    if (validated) {
      console.log("[WPCraft] Generated with: claude");
      return validated;
    }
    return null;
  } catch (e) {
    console.error("Claude failure:", e);
    return null;
  }
}

async function tryGemini(prompt, systemPrompt) {
  if (!GEMINI_API_KEY) return null;
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser Input: ${prompt}` }] }],
    });
    const content = result.response.text();
    const validated = validateElementorJson(content);
    if (validated) {
      console.log("[WPCraft] Generated with: gemini");
      return validated;
    }
    return null;
  } catch (e) {
    console.error("Gemini failure:", e);
    return null;
  }
}

async function tryManus(prompt, systemPrompt) {
  if (!MANUS_API_KEY) return null;
  try {
    const response = await fetch(`${MANUS_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MANUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "manus-default",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const content = data.choices[0].message.content;
    const validated = validateElementorJson(content);
    if (validated) {
      console.log("[WPCraft] Generated with: manus");
      return validated;
    }
    return null;
  } catch (e) {
    console.error("Manus failure:", e);
    return null;
  }
}

async function generateWithFallback(prompt, systemPrompt) {
  let result = await tryClaude(prompt, systemPrompt);
  if (result) return result;

  result = await tryGemini(prompt, systemPrompt);
  if (result) return result;

  result = await tryManus(prompt, systemPrompt);
  if (result) return result;

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // STEP 2 — Check env vars are being read correctly
  console.log('[generate] Env check:', {
    hasAnthropic: !!ANTHROPIC_API_KEY,
    hasGemini: !!GEMINI_API_KEY,
    hasManus: !!MANUS_API_KEY,
  });

  try {
    // STEP 3 — Check the request body is being parsed
    const body = typeof req.body === 'string' 
      ? JSON.parse(req.body) 
      : req.body;

    if (!body || !body.pageType) {
      console.error('[generate] Invalid request body:', body);
      return res.status(400).json({ 
        error: 'Missing required fields in request body' 
      });
    }

    const { pageType, businessName, description, tone, primaryColor, ctaText } = body;
    const heroBg = hexToRgba(primaryColor, 0.08);

    const systemPrompt = `You are a world-class WordPress and Elementor expert.
Generate a valid Elementor template JSON string based on the user's requirements.

STRICT SCHEMA RULES:
- Root: { "version": "0.4", "title": "${businessName} ${pageType}", "content": [] }
- All sections, columns, and widgets MUST have a unique 8-digit numeric "id".
- Every section: elType: "section", settings: { "background_color": string, "padding": { "top": "80", "bottom": "80", "left": "20", "right": "20", "unit": "px" } }
- Every column: elType: "column", settings: { "_column_size": 100 } (or 33/50 etc)
- Every widget: elType: "widget", widgetType: string, settings: { ... }

ALLOWED WIDGETS:
- heading: { title, header_size (h1-h6), align (center|left|right) }
- text-editor: { editor (HTML/text) }
- button: { text, link: { url: "#" }, align, background_color: "${primaryColor}", border_radius: 6 }
- image: { image: { url: "https://placehold.co/800x400/EEE/999?text=Image" } }
- icon-box: { title_text, description_text, _icon_new: { value: "fas fa-star", library: "fa-solid" } }
- spacer: { space: { size: 50, unit: "px" } }
- divider: { color: { color: "#eeeeee" } }

PAGE STRUCTURES:
- LANDING: Hero (100% col, Heading h1 + Subtext + Button, bg: ${heroBg}), Features (3 cols 33%, each Icon-box, bg: #f9f9f9), Social Proof (100% col Heading h3, then 3 cols 33% each Text-editor testimonials), CTA (100% col Heading h2 + Button, bg: ${primaryColor}), Footer (100% col Text-editor, bg: #111111).
- ABOUT: Hero (bg: ${heroBg}), Story (2 cols 60/40, Heading h2 + Text-editor (3 paragraphs) / Image), Team (3 cols 33% bg: #f9f9f9, Icon-box), Values (100% col Heading + 3 cols Icon-box), CTA (bg: ${primaryColor}), Footer.
- PORTFOLIO: Hero (bg: ${heroBg}), Work (2 rows of 3 cols 33%, Image + Heading h4 + Text-editor), About (2 cols 50/50), CTA (bg: ${primaryColor}), Footer.

COPY RULES:
- Use "${tone}" tone.
- NO LOREM IPSUM. Write specific, high-quality copy for "${businessName}" based on: "${description}".
- Professional: Formal, 3rd person. Friendly: Conversational, "we". Bold: Punchy, strong verbs. Minimal: Clean, short.

Return ONLY raw JSON. No markdown. No explanation.`;

    const userPrompt = `Generate the ${pageType} Elementor JSON for ${businessName}. Description: ${description}`;

    const result = await generateWithFallback(userPrompt, systemPrompt);

    if (result) {
      return res.status(200).json({ success: true, json: JSON.stringify(result) });
    } else {
      console.warn('[generate] All models failed to generate valid JSON');
      return res.status(500).json({ success: false, error: "Generation failed. Please try again." });
    }
  } catch (error) {
    // STEP 1 — Add proper error logging
    console.error('[generate] Fatal error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' 
        ? error.stack 
        : undefined
    });
  }
}
