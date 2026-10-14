import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type UserType = {
  id: string
  name: string
  username: string
  email: string
  role: 'admin' | 'user'
  business_name?: string
  designation?: string
  phone?: string
  whatsapp?: string
  instagram_url?: string
  linkedin_url?: string
  website_url?: string
  address?: string
  bio?: string
  profile_image_url?: string
  cover_image_url?: string
  logo_url?: string
  theme_color?: string
  qr_code_url?: string
  card_url?: string
  is_active?: boolean
  view_count?: number
  created_at?: string
}
