
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

    const systemPrompt = `You are a world-class web designer and developer. 
Your task is to generate ONLY a complete, self-contained HTML page based on the user's requirements.

CONSTRAINTS:
- Return ONLY the HTML string. No markdown, no explanation, no code fences.
- Use Tailwind CSS via CDN (include <script src="https://cdn.tailwindcss.com"></script> in <head>).
- No external dependencies except Google Fonts via CDN.
- Use the provided primaryColor (${primaryColor}) as the accent color throughout (buttons, links, borders, etc.).
- The design must be clean, modern, and high-end — NOT generic, NOT template-looking.
- All copy must be written in the business's tone (${tone}) and be relevant to the business description.
- Use real placeholder copy (no "Lorem ipsum").
- Mobile responsive.
- Include a CTA button with text: "${ctaText}".

PAGE TYPE SPECIFIC SECTIONS:
${pageType === 'landing' ? `* Landing page: Hero, Features (at least 3), Social proof/Testimonials, CTA section, Footer.` : ''}
${pageType === 'about' ? `* About page: Hero, Our story, Team section (3 placeholders), Values, CTA, Footer.` : ''}
${pageType === 'portfolio' ? `* Portfolio page: Hero, Work/projects grid (6 cards), About/Bio, CTA, Footer.` : ''}

Ensure the HTML is valid and looks professional.`;

    const userPrompt = `Generate a ${pageType} for a business named "${businessName}".
Business Description: ${description}
Tone: ${tone}
Primary Color: ${primaryColor}
CTA Text: ${ctaText}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Using the latest available Sonnet model
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
      return new Response(JSON.stringify({ error: 'Failed to generate page' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const html = data.content[0].text;

    return new Response(JSON.stringify({ html }), {
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
