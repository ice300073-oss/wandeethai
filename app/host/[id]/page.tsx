'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const categoryLabel: Record<string, string> = {
  homestay: '🏡 โฮมสเตย์', villa: '🏖️ พูลวิลล่า', hotel: '🏨 โรงแรม',
  resort: '🌿 รีสอร์ท', guesthouse: '🎒 เกสต์เฮาส์', guide: '🗺️ ไกด์ท้องถิ่น',
}

export default function HostProfile({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [rating, setRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', params.id).single()
      setProfile(prof)

      const { data: list } = await supabase
        .from('listings').select('*')
        .eq('owner_id', params.id).eq('is_available', true)
        .order('created_at', { ascending: false })
      const all = list || []
      setListings(all)

      if (all.length > 0) {
        const ids = all.map((l: any) => l.id)
        const { data: revs } = await supabase
          .from('reviews').select('rating').in('listing_id', ids)
        if (revs && revs.length > 0) {
          const avg = revs.reduce((s: number, r: any) => s + r.rating, 0) / revs.length
          setRating({ avg: Math.round(avg * 10) / 10, count: revs.length })
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  const name = profile?.full_name || 'เจ้าของที่พัก'
  const initial = name.charAt(0).toUpperCase()
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
    : null

  const priceLabel = (l: any) => {
    const p = (l.price_per_day ?? l.price_per_month)?.toLocaleString()
    return `฿${p}${l.category === 'guide' ? '/วัน' : '/คืน'}`
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href="/" className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าหลัก</a>
      </nav>

      {/* ===== Cover + Profile header ===== */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 h-32"/>
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow -mt-16 sm:mt-0"/>
            ) : (
              <div className="w-24 h-24 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-4xl font-bold border-4 border-white shadow -mt-16 sm:mt-0">
                {initial}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
                {profile?.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.4 3.4-.6.6 3.4L21 12l-2.6 2.4.6 3.4-3.4.6L12 22l-2.4-2.6-3.4.6-.6-3.4L3 12l2.6-2.4-.6-3.4 3.4.6z"/><path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ยืนยันตัวตนแล้ว
                  </span>
                )}
              </div>
              {joined && <p className="text-gray-400 text-sm mt-1">เข้าร่วมเมื่อ {joined}</p>}

              <div className="flex gap-5 mt-3 text-sm">
                <div><span className="font-bold text-gray-800">{listings.length}</span> <span className="text-gray-400">ที่พัก</span></div>
                {rating.count > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-bold text-gray-800">{rating.avg}</span>
                    <span className="text-gray-400">({rating.count} รีวิว)</span>
                  </div>
                )}
              </div>

              {(profile?.line_id || profile?.facebook) && (
                <div className="flex gap-2 mt-3">
                  {profile.line_id && (
                    <span className="bg-green-50 text-green-600 text-xs px-3 py-1.5 rounded-full">LINE: {profile.line_id}</span>
                  )}
                  {profile.facebook && (
                    <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full">FB: {profile.facebook}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          {profile?.bio && <p className="text-gray-600 text-sm mt-4 leading-relaxed">{profile.bio}</p>}
        </div>

        {/* ===== Listings ===== */}
        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">ที่พักของ {name}</h2>
        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 mb-10">
            <p className="text-gray-400">ยังไม่มีที่พักที่เปิดให้จอง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {listings.map((item) => (
              <a key={item.id} href={`/listings/${item.id}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden block group">
                <div className="relative overflow-hidden h-44">
                  {item.images?.length > 0 ? (
                    <img src={item.images[0]} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  ) : (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-100 h-full flex items-center justify-center text-orange-300">
                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/></svg>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 text-orange-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {categoryLabel[item.category] || item.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                  {item.location && <p className="text-sm text-gray-400 mt-1">📍 {item.location}</p>}
                  <p className="text-orange-500 font-bold mt-2">{priceLabel(item)}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
