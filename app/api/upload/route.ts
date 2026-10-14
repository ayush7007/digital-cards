import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token as any).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const bucket = formData.get('bucket') as string
  const filename = formData.get('filename') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!bucket) return NextResponse.json({ error: 'No bucket specified' }, { status: 400 })
  if (!filename) return NextResponse.json({ error: 'No filename specified' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    // If bucket not found, store as base64 fallback
    if (error.message.includes('Bucket not found')) {
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
      return NextResponse.json({ url: base64 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename)
  return NextResponse.json({ url: data.publicUrl })
}
