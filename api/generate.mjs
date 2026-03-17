
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

// STEP 2 — Add aggressive JSON cleaning
function extractJSON(raw) {
  if (!raw || typeof raw !== 'string') return null;
  
  let cleaned = raw.trim();
  
  // Strip markdown code fences
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  
  // Find first { and last } 
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) return null;
  
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  
  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e) {
    // Try to fix common JSON issues
    // Remove trailing commas before } or ]
    const fixed = cleaned
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.error('[generate] JSON parse failed:', e2.message);
      console.error('[generate] Cleaned string start:', cleaned.substring(0, 300));
      return null;
    }
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
    const rawResponse = response.content[0].text;
    
    // STEP 1 — Add response logging before parsing
    console.log('[generate] Claude Raw response length:', rawResponse.length);
    console.log('[generate] Claude Raw response preview:', rawResponse.substring(0, 200));

    const parsed = extractJSON(rawResponse);
    if (parsed && Array.isArray(parsed.content) && parsed.content.length > 0) {
      console.log("[WPCraft] Generated with: claude");
      return parsed;
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
      model: "gemini-2.0-flash", // Reverting to stable
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser Input: ${prompt}` }] }],
    });
    const rawResponse = result.response.text();

    console.log('[generate] Gemini Raw response length:', rawResponse.length);
    console.log('[generate] Gemini Raw response preview:', rawResponse.substring(0, 200));

    const parsed = extractJSON(rawResponse);
    if (parsed && Array.isArray(parsed.content) && parsed.content.length > 0) {
      console.log("[WPCraft] Generated with: gemini");
      return parsed;
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
    const rawResponse = data.choices[0].message.content;

    console.log('[generate] Manus Raw response length:', rawResponse.length);
    console.log('[generate] Manus Raw response preview:', rawResponse.substring(0, 200));

    const parsed = extractJSON(rawResponse);
    if (parsed && Array.isArray(parsed.content) && parsed.content.length > 0) {
      console.log("[WPCraft] Generated with: manus");
      return parsed;
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[generate] Env check:', {
    hasAnthropic: !!ANTHROPIC_API_KEY,
    hasGemini: !!GEMINI_API_KEY,
    hasManus: !!MANUS_API_KEY,
  });

  try {
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

    // STEP 4 — Update the Claude system prompt
    const systemPrompt = `You are an Elementor page builder JSON generator.
You MUST return ONLY a valid JSON object.
No markdown. No code fences. No explanation.
No text before or after the JSON.
Start your response with { and end with }.

The JSON must follow this exact structure:
{
  "version": "0.4",
  "title": "Page Title",
  "content": [
    {
      "id": "12345678",
      "elType": "section",
      "settings": {},
      "elements": [
        {
          "id": "23456789", 
          "elType": "column",
          "settings": { "_column_size": 100 },
          "elements": [
            {
              "id": "34567890",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Your Heading Here",
                "header_size": "h1",
                "align": "center"
              }
            }
          ]
        }
      ]
    }
  ]
}

Generate a complete page with all required sections based on:
Business: ${businessName}
Type: ${pageType}
Description: ${description}
Tone: ${tone}
Primary Color: ${primaryColor}
CTA: ${ctaText}
Hero BG: ${heroBg}

Every element MUST have a unique 8-digit numeric id.
Return ONLY the JSON. Nothing else.`;

    const userPrompt = `Generate the ${pageType} Elementor JSON for ${businessName}. Description: ${description}`;

    const parsed = await generateWithFallback(userPrompt, systemPrompt);

    // STEP 3 — Update validation logic
    if (!parsed) {
      console.error('[generate] Could not extract valid JSON from any model');
      return res.status(200).json({
        success: false,
        error: 'AI returned invalid JSON. Please try again.'
      });
    }

    if (!parsed.content || !Array.isArray(parsed.content)) {
      console.error('[generate] Missing content array:', Object.keys(parsed));
      return res.status(200).json({
        success: false,
        error: 'Generated page has no sections. Please try again.'
      });
    }

    if (parsed.content.length === 0) {
      console.error('[generate] Empty content array');
      return res.status(200).json({
        success: false,
        error: 'Generated page is empty. Please try again.'
      });
    }

    // Maintain compatibility with frontend which expects result.json as a string
    return res.status(200).json({ 
      success: true, 
      json: JSON.stringify(parsed) 
    });

  } catch (error) {
    console.error('[generate] Fatal error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' 
        ? error.stack 
        : undefined
    });
  }
}
