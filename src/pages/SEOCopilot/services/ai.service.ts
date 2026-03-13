import { AI_CONFIG } from '../config/ai.config'

// ─── GEMINI ──────────────────────────────────────────

export async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `${AI_CONFIG.GEMINI.API_URL}?key=${AI_CONFIG.GEMINI.API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: AI_CONFIG.GEMINI.TEMPERATURE,
          maxOutputTokens: AI_CONFIG.GEMINI.MAX_TOKENS,
        }
      })
    }
  )
  if (!response.ok) throw new Error(`Gemini error: ${response.status}`)
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function callGeminiJSON<T>(prompt: string): Promise<T> {
  const raw = await callGemini(
    prompt + '\n\nRespond ONLY with valid JSON. No markdown, no backticks, no explanation.'
  )
  const cleaned = raw.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Try to extract JSON from response
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as T
    throw new Error('Gemini returned invalid JSON')
  }
}

// ─── CLAUDE ──────────────────────────────────────────

export async function callClaude(prompt: string): Promise<string> {
  const response = await fetch(AI_CONFIG.CLAUDE.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_CONFIG.CLAUDE.API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: AI_CONFIG.CLAUDE.MODEL,
      max_tokens: AI_CONFIG.CLAUDE.MAX_TOKENS,
      temperature: AI_CONFIG.CLAUDE.TEMPERATURE,
      system: `You are a senior SEO consultant with 15+ years of experience. 
You specialize in E-E-A-T, content strategy, and competitive analysis.
You write specific, actionable advice — never generic.
You always reference the actual URL, domain, keyword, and metrics provided.
You respond ONLY with valid JSON when asked. No markdown, no backticks.`,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(`Claude error: ${err.error?.message || response.status}`)
  }
  const data = await response.json()
  return data.content?.[0]?.text ?? ''
}

export async function callClaudeJSON<T>(prompt: string): Promise<T> {
  const raw = await callClaude(
    prompt + '\n\nRespond ONLY with valid JSON. No markdown, no backticks, no preamble.'
  )
  const cleaned = raw.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as T
    throw new Error('Claude returned invalid JSON')
  }
}

// ─── ERROR HANDLING & RETRIES ──────────────────────────

export async function callClaudeWithRetry<T>(
  prompt: string, 
  retries = 1
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await callClaudeJSON<T>(prompt)
    } catch (err) {
      if (i === retries) {
        // Final failure — try Gemini as fallback
        console.warn('Claude failed, using Gemini fallback')
        return await callGeminiJSON<T>(prompt)
      }
      // Wait 1 second before retry
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  throw new Error('All retries failed')
}

export async function callGeminiWithRetry<T>(
  prompt: string,
  retries = 1
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await callGeminiJSON<T>(prompt)
    } catch (err) {
      if (i === retries) {
        console.warn('Gemini failed, using Claude fallback')
        return await callClaudeJSON<T>(prompt)
      }
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  throw new Error('All retries failed')
}

// ─── SMART FALLBACK ───────────────────────────────────

export async function callAIWithFallback<T>(
  primaryPrompt: string,
  fallbackPrompt: string,
  primary: 'claude' | 'gemini'
): Promise<T> {
  try {
    if (primary === 'claude') {
      return await callClaudeWithRetry<T>(primaryPrompt)
    } else {
      return await callGeminiWithRetry<T>(primaryPrompt)
    }
  } catch (primaryError) {
    console.warn(`Primary AI (${primary}) failed, falling back...`, primaryError)
    try {
      if (primary === 'claude') {
        return await callGeminiWithRetry<T>(fallbackPrompt)
      } else {
        return await callClaudeWithRetry<T>(fallbackPrompt)
      }
    } catch (fallbackError) {
      throw new Error(`Both AI providers failed. Last error: ${fallbackError}`)
    }
  }
}
