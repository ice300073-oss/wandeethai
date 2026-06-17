import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE = 'https://wandeethai.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    '', '/listings', '/about', '/become-host', '/terms', '/privacy',
  ].map((p) => ({ url: `${BASE}${p}`, lastModified: new Date() }))

  let listingPages: MetadataRoute.Sitemap = []
  try {
    const { data } = await supabase
      .from('listings')
      .select('id, created_at')
      .eq('is_available', true)
    listingPages = (data || []).map((l: any) => ({
      url: `${BASE}/listings/${l.id}`,
      lastModified: l.created_at ? new Date(l.created_at) : new Date(),
    }))
  } catch {
    // ถ้าดึงไม่ได้ ก็ส่งเฉพาะหน้า static
  }

  return [...staticPages, ...listingPages]
}
