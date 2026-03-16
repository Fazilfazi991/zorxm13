
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { pageType, businessName, description, tone, primaryColor, ctaText } = await req.json();

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a world-class WordPress and Elementor expert. 
Your task is to generate ONLY a valid Elementor template JSON string based on the user's requirements.

CONSTRAINTS:
- Return ONLY the raw JSON string. No markdown, no explanation, no code fences.
- Output must follow Elementor's template JSON schema exactly:
  - Root: { "version": "0.4", "title": "${businessName} ${pageType}", "type": "page", "content": [] }
  - content is an array of sections (elType: "section")
  - Each section has "elements" array of columns (elType: "column")
  - Each column has "elements" array of widgets (elType: "widget") and "settings": { "_column_size": 100 }
  - Each widget has "widgetType" and "settings" object

SUPPORTED WIDGET TYPES:
- "heading": settings: { "title": string, "size": "h1"|"h2"|"h3", "align": "center"|"left"|"right" }
- "text-editor": settings: { "editor": string (HTML) }
- "button": settings: { "text": string, "link": { "url": "#" }, "align": "center", "background_color": "${primaryColor}" }
- "image": settings: { "image": { "url": "https://placehold.co/800x400?text=${businessName}" } }
- "icon-box": settings: { "title_text": string, "description_text": string, "icon": { "value": "fas fa-check", "library": "fa-solid" } }
- "spacer": settings: { "space": { "size": 50 } }
- "divider": settings: {}

COLOR APPLICATION:
- Apply ${primaryColor} to all button "background_color" settings.
- Apply ${primaryColor} (at 10% opacity, e.g. ${primaryColor}1A) to the Hero and CTA section "background_color".

PAGE STRUCTURES:
${pageType === 'landing' ? `
- Hero: Full-width section, heading (h1) + subtext (text-editor) + button
- Features: 3-column section, 3x icon-box widgets
- Social proof: heading + 3x text-editor (testimonials)
- CTA: heading + button, accent background color
- Footer: text-editor with copyright` : ''}
${pageType === 'about' ? `
- Hero: heading + subtext
- Story: 2-column, text left + image right
- Team: 3-column, 3x icon-box (name + role + bio)
- Values: heading + 3x icon-box
- CTA: heading + button
- Footer: text-editor` : ''}
${pageType === 'portfolio' ? `
- Hero: heading + subtext
- Work grid: 3-column x2 rows, image + heading + text per card
- About: 2-column text + image
- CTA: heading + button
- Footer: text-editor` : ''}

TONE & CONTENT:
- Use "${tone}" tone.
- Business Name: "${businessName}"
- Description: "${description}"
- Use realistic copy, no lorem ipsum.
- For links, use "#".
- Return ONLY the JSON object. No other text.`;

    const userPrompt = `Generate a ${pageType} Elementor JSON for "${businessName}".`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API Error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const jsonString = data.content[0].text;

    return new Response(JSON.stringify({ json: jsonString }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Server Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
