export const AI_CONFIG = {
  GEMINI: {
    API_KEY: import.meta.env.VITE_GEMINI_API_KEY || "",
    MODEL: "gemini-2.0-flash",
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    MAX_TOKENS: 8192,
    TEMPERATURE: 0.2,
  },
  CLAUDE: {
    API_KEY: "YOUR_CLAUDE_API_KEY_HERE",
    MODEL: "claude-3-5-sonnet-20241022",
    API_URL: "https://api.anthropic.com/v1/messages",
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.3,
  }
}

// Which AI handles which feature
export const AI_ROUTING = {
  // Gemini — fast, parallel, rule-based
  ON_PAGE:      'gemini',
  TECHNICAL:    'gemini',
  CONTENT:      'gemini',
  AEO:          'gemini',
  READABILITY:  'gemini',
  SCHEMA:       'gemini',

  // Claude — deep reasoning, narrative
  EEAT:         'claude',
  LLM:          'claude',
  COMPETITOR:   'claude',
  SUMMARY:      'claude',
  TRAFFIC:      'claude',
}
