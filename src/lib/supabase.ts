import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
)

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  credits: number
  plan: 'free' | 'pro'
  created_at: string
  credits_reset_at: string | null
}

export type Generation = {
  id: string
  user_id: string
  page_type: string
  business_name: string
  style_id: string | null
  primary_color: string
  created_at: string
}
