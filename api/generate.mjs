
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Handle GET for direct browser testing as requested in Step 6
  if (req.method === 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      message: 'This endpoint only accepts POST requests for generation.' 
    })
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body

    // return a test response first to confirm routing works
    return res.status(200).json({ 
      success: true, 
      test: true,
      received: body 
    })

  } catch (error) {
    console.error('[generate] error:', error)
    return res.status(500).json({ error: error.message })
  }
}
