export default async function handler(req, res) {
  return res.status(200).json({ 
    ok: true, 
    time: new Date().toISOString(),
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasManus: !!process.env.MANUS_API_KEY
  })
}
