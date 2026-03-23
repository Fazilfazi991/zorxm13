// WPCraft — /api/analyze-reference.mjs
// Analyzes website URLs and images to extract design style context
// Used to inject style direction into the generation prompt

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '');

// ── Extract style from a website URL ─────────────────────────────────────────
async function analyzeWebsite(url) {
  console.log('[analyze] fetching URL:', url);
  
  try {
    // Fetch the page HTML
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WPCraft/1.0; +https://zorxm13.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    
    // Extract useful style signals from HTML
    const signals = extractStyleSignals(html, url);
    
    // Ask Gemini to interpret the signals into a design brief
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `You are a web design analyst. Based on these signals from the website ${url}, describe its design style in 3-4 sentences covering: color palette, typography style, layout approach, and overall aesthetic. Be specific about hex colors if visible. Keep it concise for use as a design brief.

Website signals:
${JSON.stringify(signals, null, 2)}`;

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();
    console.log('[analyze] website description:', description.substring(0, 100));
    return { type: 'website', url, description, signals };
    
  } catch (err) {
    console.error('[analyze] website fetch failed:', err.message);
    // Return basic signal just from URL
    return {
      type: 'website',
      url,
      description: `Website reference from ${url}. Analyze and match its professional style, color scheme, and layout approach.`,
      signals: {}
    };
  }
}

function extractStyleSignals(html, url) {
  const signals = { url };
  
  // Extract CSS color values (hex, rgb, hsl)
  const colorMatches = html.match(/#[0-9A-Fa-f]{3,8}(?=[^0-9A-Fa-f])/g) || [];
  const colorFreq = {};
  colorMatches.forEach(c => {
    const norm = c.toLowerCase();
    if (norm.length >= 4) colorFreq[norm] = (colorFreq[norm] || 0) + 1;
  });
  const topColors = Object.entries(colorFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([c]) => c);
  if (topColors.length) signals.dominantColors = topColors;
  
  // Extract font families
  const fontMatches = html.match(/font-family:\s*([^;'"}{]+)/gi) || [];
  const fonts = [...new Set(fontMatches.map(f => f.replace(/font-family:\s*/i, '').trim().split(',')[0].replace(/['"]/g, '').trim()))].filter(f => f.length > 2 && f.length < 40).slice(0, 5);
  if (fonts.length) signals.fonts = fonts;
  
  // Extract meta description for content signals
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i);
  if (metaDesc) signals.metaDescription = metaDesc[1].substring(0, 200);
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) signals.pageTitle = titleMatch[1].trim().substring(0, 100);
  
  // Detect dark/light theme
  const bgDarkCount = (html.match(/background[^;]*:\s*#[012][0-9A-Fa-f]{5}/g) || []).length;
  const bgLightCount = (html.match(/background[^;]*:\s*#[ef][0-9A-Fa-f]{5}/g) || []).length;
  signals.probablyDarkTheme = bgDarkCount > bgLightCount;
  
  // Detect border-radius style (rounded vs sharp)
  const radiusMatches = html.match(/border-radius:\s*(\d+)px/g) || [];
  const avgRadius = radiusMatches.length
    ? radiusMatches.reduce((sum, r) => sum + parseInt(r.match(/\d+/)[0]), 0) / radiusMatches.length
    : 8;
  signals.borderRadiusStyle = avgRadius > 16 ? 'very rounded' : avgRadius > 8 ? 'moderately rounded' : 'sharp/minimal';
  
  return signals;
}

// ── Analyze an image (base64) using Gemini Vision ─────────────────────────────
async function analyzeImage(base64Data, mimeType = 'image/jpeg') {
  console.log('[analyze] processing image, size:', Math.round(base64Data.length * 0.75 / 1024), 'KB');
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `You are a web design analyst. Analyze this website screenshot or design reference image and describe its design style in 3-4 sentences. Cover:
1. Color palette (mention specific hex colors if visible, or describe: dark/light, warm/cool, etc.)
2. Typography style (serif/sans-serif, weight, size hierarchy)
3. Layout approach (2-col, full-width hero, card-based, etc.)
4. Overall aesthetic (minimalist, bold, luxury, playful, corporate, etc.)

Be specific and actionable — this description will be used to generate a matching website.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Data,
        mimeType,
      }
    }
  ]);
  
  const description = result.response.text().trim();
  console.log('[analyze] image description:', description.substring(0, 100));
  return { type: 'image', description };
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const { type, url, imageData, mimeType } = req.body || {};
  
  try {
    let result;
    
    if (type === 'website' && url) {
      result = await analyzeWebsite(url);
    } else if (type === 'image' && imageData) {
      result = await analyzeImage(imageData, mimeType || 'image/jpeg');
    } else {
      return res.status(400).json({ error: 'Provide type:website with url, or type:image with imageData' });
    }
    
    return res.status(200).json({ success: true, data: result });
    
  } catch (err) {
    console.error('[analyze-reference error]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
