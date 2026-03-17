export default async function handler(req, res) {
  const allKeys = Object.keys(process.env)
  const geminiRelated = allKeys.filter(k => 
    k.toLowerCase().includes('gemini') ||
    k.toLowerCase().includes('google') ||
    k.toLowerCase().includes('manus')
  )
  
  return res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    hasGemini: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
    hasManus: !!process.env.MANUS_API_KEY,
    relatedKeys: geminiRelated,
    totalEnvVars: allKeys.length
  })
}
