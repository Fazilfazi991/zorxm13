
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body) : req.body;

    const { pageType, businessName, 
            description, tone, 
            primaryColor, ctaText } = body;

    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!geminiKey) {
      console.error('[generate] Gemini API key not configured');
      return res.status(500).json({ 
        error: 'Gemini API key not configured' 
      });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `You are an Elementor JSON generator.
Return ONLY a valid JSON object. No markdown. 
No code fences. Start with { and end with }.
Every element needs a unique 8-digit numeric id.

Generate a ${pageType} page for:
Business: ${businessName}
Description: ${description}
Tone: ${tone}
Primary color: ${primaryColor}
CTA: ${ctaText}

Structure:
{
  "version": "0.4",
  "title": "${businessName} ${pageType}",
  "content": [
    {
      "id": "12345678",
      "elType": "section",
      "settings": { 
        "background_color": "",
        "padding": { "top": "80", "bottom": "80", "left": "20", "right": "20", "unit": "px" }
      },
      "elements": [{
        "id": "23456789",
        "elType": "column",
        "settings": { "_column_size": 100 },
        "elements": [{
          "id": "34567890",
          "elType": "widget",
          "widgetType": "heading",
          "settings": {
            "title": "Main Headline",
            "header_size": "h1",
            "align": "center"
          }
        }]
      }]
    }
  ]
}

Include all sections for a ${pageType} page.
Write real copy for this specific business.
Return ONLY the JSON.`;

    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();
    
    console.log('[generate] Gemini Raw response length:', rawResponse.length);

    let cleaned = rawResponse.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('AI failed to return valid JSON structure');
    }
    
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(cleaned);

    if (!parsed.content || !Array.isArray(parsed.content) || parsed.content.length === 0) {
      console.error('[generate] Generated page has no content:', parsed);
      return res.status(500).json({ 
        error: 'Generated page has no content' 
      });
    }

    // Maintain compatibility with frontend and provide data for newer diagnostic needs
    return res.status(200).json({ 
      success: true, 
      data: parsed,
      json: JSON.stringify(parsed)
    });

  } catch (error) {
    console.error('[generate] error:', error.message);
    return res.status(500).json({ 
      error: error.message 
    });
  }
}
