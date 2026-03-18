import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods',
    'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers',
    'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const body = typeof req.body === 'string'
    ? JSON.parse(req.body) : req.body

  // Activate new license (called on plugin install)
  if (req.method === 'POST' && 
      body?.action === 'activate') {
    
    const email = body.email || ''
    const site_url = body.site_url || ''
    
    if (!email) {
      return res.status(400).json({
        error: 'Email required'
      })
    }
    
    // Check if license exists for this email
    const { data: existing } = await supabase
      .from('plugin_licenses')
      .select('*')
      .eq('email', email)
      .single()
    
    if (existing) {
      // Return existing license
      return res.status(200).json({
        success: true,
        license_key: existing.license_key,
        credits: existing.credits,
        plan: existing.plan
      })
    }
    
    // Create new license with 3 free credits
    const license_key = 'WPC-' + 
      randomBytes(8)
        .toString('hex')
        .toUpperCase()
    
    await supabase
      .from('plugin_licenses')
      .insert({
        license_key,
        email,
        site_url,
        credits: 3,
        plan: 'free',
        created_at: new Date().toISOString()
      })
    
    return res.status(200).json({
      success: true,
      license_key,
      credits: 3,
      plan: 'free',
      message: 'Welcome! You have 3 free generations.'
    })
  }

  // Check license status
  if (req.method === 'GET') {
    const key = req.query?.key
    if (!key) {
      return res.status(400).json({
        error: 'License key required'
      })
    }
    
    const { data: license } = await supabase
      .from('plugin_licenses')
      .select('credits, plan, email')
      .eq('license_key', key)
      .single()
    
    if (!license) {
      return res.status(404).json({
        error: 'License not found'
      })
    }
    
    return res.status(200).json({
      success: true,
      credits: license.credits,
      plan: license.plan
    })
  }

  return res.status(405).json({ 
    error: 'Method not allowed' 
  })
}
