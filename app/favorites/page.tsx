'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const categoryLabel: Record<string, string> = {
  homestay: '🏡 โฮมสเตย์', villa: '🏖️ พูลวิลล่า', hotel: '🏨 โรงแรม',
  resort: '🌿 รีสอร์ท', guesthouse: '🎒 เกสต์เฮาส์', guide: '🗺️ ไกด์ท้องถิ่น',
}

export default function FavoritesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth?next=/favorites'; return }
      setUser(user)
      const { data } = await supabase
        .from('favorites')
        .select('listing_id, listings(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setItems((data || []).map((f: any) => f.listings).filter(Boolean))
      setLoading(false)
    }
    fetchData()
  }, [])

  const removeFav = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault(); e.stopPropagation()
    setItems(items.filter(i => i.id !== listingId))
    await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId)
  }

  const priceLabel = (l: any) => {
    const p = (l.price_per_day ?? l.price_per_month)?.toLocaleString()
    return `฿${p}${l.category === 'guide' ? '/วัน' : '/คืน'}`
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href="/" className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าหลัก</a>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">❤️ รายการโปรด</h1>
        <p className="text-gray-400 text-sm mb-6">ที่พักที่คุณบันทึกไว้</p>

        {loading ? (
          <p className="text-gray-400 text-center py-16">กำลังโหลด...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-5xl mb-4">🤍</p>
            <p className="text-gray-500 mb-4">ยังไม่มีที่พักที่บันทึกไว้</p>
            <a href="/" className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600">
              เริ่มค้นหาที่พัก
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
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
                  <button onClick={(e) => removeFav(e, item.id)} aria-label="เอาออกจากรายการโปรด"
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
                  </button>
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
