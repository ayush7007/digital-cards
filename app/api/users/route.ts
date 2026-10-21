import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .select(
      'id,name,username,email,role,business_name,designation,phone,is_active,view_count,created_at,profile_image_url,card_url,qr_code_url,theme_color'
    )
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    name, username, email, password, role,
    business_name, designation, phone, whatsapp,
    instagram_url, linkedin_url, website_url,
    address, bio, profile_image_url, cover_image_url,
    logo_url, theme_color,
  } = body

  // Check if username already exists
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Username already taken' },
      { status: 400 }
    )
  }

  const password_hash = await bcrypt.hash(password, 10)
  const card_url = `${process.env.NEXT_PUBLIC_APP_URL}/card/${username}`

  // Generate QR as base64 data URL — stored directly in DB
  const qr_code_url = await QRCode.toDataURL(card_url, {
    width: 400,
    margin: 2,
    color: {
      dark: theme_color || '#7c3aed',
      light: '#ffffff',
    },
  })

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      name,
      username,
      email,
      password_hash,
      role: role || 'user',
      business_name,
      designation,
      phone,
      whatsapp,
      instagram_url,
      linkedin_url,
      website_url,
      address,
      bio,
      profile_image_url,
      cover_image_url,
      logo_url,
      theme_color: theme_color || '#7c3aed',
      qr_code_url,
      card_url,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
