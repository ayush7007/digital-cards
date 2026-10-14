import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import DigitalCard from '@/components/DigitalCard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('name, business_name, bio, profile_image_url')
    .eq('username', username)
    .eq('is_active', true)
    .single()

  if (!user) return { title: 'Card Not Found' }

  return {
    title: `${user.name} — ${user.business_name || 'Digital Card'}`,
    description: user.bio || `Connect with ${user.name}`,
    openGraph: {
      images: user.profile_image_url ? [user.profile_image_url] : [],
    },
  }
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single()

  if (error || !user) notFound()

  // Increment view count
  await supabaseAdmin
    .from('users')
    .update({ view_count: (user.view_count || 0) + 1 })
    .eq('id', user.id)

  return <DigitalCard user={user} />
}
