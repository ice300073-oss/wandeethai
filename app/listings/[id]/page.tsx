import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ListingClient from './ListingClient'

const BASE = 'https://wandeethai.vercel.app'

// SEO + แชร์: ดึงข้อมูลที่พักมาทำ title/description/รูป (server-side)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { data: l } = await supabase
      .from('listings')
      .select('title, description, images, location')
      .eq('id', params.id)
      .single()
    if (!l) return { title: 'ที่พัก — WanDeeThai' }
    const title = `${l.title} — WanDeeThai`
    const description = (l.description?.slice(0, 150)) || `ที่พักที่ ${l.location || 'ประเทศไทย'} บน WanDeeThai`
    const img: string | undefined = l.images?.[0]
    return {
      title,
      description,
      openGraph: {
        title, description, type: 'website',
        url: `${BASE}/listings/${params.id}`,
        images: img ? [{ url: img }] : undefined,
      },
      twitter: {
        card: 'summary_large_image', title, description,
        images: img ? [img] : undefined,
      },
    }
  } catch {
    return { title: 'ที่พัก — WanDeeThai' }
  }
}

export default function Page({ params }: { params: { id: string } }) {
  return <ListingClient params={params} />
}
