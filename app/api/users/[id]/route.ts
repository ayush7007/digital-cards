import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token as any).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token as any).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const updateData: any = { ...body }

  // Handle password update
  if (body.password && body.password.trim() !== '') {
    updateData.password_hash = await bcrypt.hash(body.password, 10)
  }
  delete updateData.password
  delete updateData.id
  delete updateData.created_at
  delete updateData.updated_at
  delete updateData.password_hash_old

  // Always regenerate QR with latest username and theme
  const username = body.username
  const themeColor = body.theme_color || '#7c3aed'
  const card_url = `${process.env.NEXT_PUBLIC_APP_URL}/card/${username}`

  // Generate QR as base64 — stored directly in DB
  const qr_code_url = await QRCode.toDataURL(card_url, {
    width: 400,
    margin: 2,
    color: {
      dark: themeColor,
      light: '#ffffff',
    },
  })

  updateData.qr_code_url = qr_code_url
  updateData.card_url = card_url

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token as any).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
