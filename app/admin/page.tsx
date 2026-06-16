'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'ice300074@gmail.com'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'bookings' | 'hosts'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = '/'
        return
      }
      setUser(user)

      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
      setListings(listingData || [])

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, listings(title)')
        .order('created_at', { ascending: false })
      setBookings(bookingData || [])

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setProfiles(profileData || [])

      setLoading(false)
    }
    fetchData()
  }, [])

  const toggleListing = async (id: string, current: boolean) => {
    await supabase.from('listings').update({ is_available: !current }).eq('id', id)
    setListings(listings.map(l => l.id === id ? { ...l, is_available: !current } : l))
  }

  const deleteListing = async (id: string) => {
    await supabase.from('listings').delete().eq('id', id)
    setListings(listings.filter(l => l.id !== id))
  }

  const updateBookingStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
  }

  const toggleVerified = async (id: string, current: boolean) => {
    const { error } = await supabase.rpc('set_host_verified', { target_id: id, val: !current })
    if (error) { alert('ไม่สำเร็จ: ' + error.message); return }
    setProfiles(profiles.map(p => p.id === id ? { ...p, is_verified: !current } : p))
  }

  const totalRevenue = bookings
    .filter(b => b.status === 'paid' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0)

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-600',
    paid: 'bg-orange-100 text-orange-500',
    confirmed: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-400',
  }

  const statusLabel: Record<string, string> = {
    pending: 'รอยืนยัน',
    paid: 'ชำระแล้ว',
    confirmed: 'ยืนยันแล้ว',
    cancelled: 'ยกเลิก',
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">Admin</span>
        </div>
        <p className="text-gray-400 text-sm">{user?.email}</p>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Admin Dashboard</h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-orange-500">{listings.length}</p>
            <p className="text-sm text-gray-400 mt-1">ประกาศทั้งหมด</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-green-500">{listings.filter(l => l.is_available).length}</p>
            <p className="text-sm text-gray-400 mt-1">เปิดให้จอง</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-purple-500">{bookings.length}</p>
            <p className="text-sm text-gray-400 mt-1">การจองทั้งหมด</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-2xl font-bold text-amber-500">฿{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">ยอดจองผ่านเว็บ (GMV)</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-blue-500">{profiles.length}</p>
            <p className="text-sm text-gray-400 mt-1">ผู้ใช้ทั้งหมด</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-green-600">{profiles.filter(p => p.is_verified).length}</p>
            <p className="text-sm text-gray-400 mt-1">เจ้าของยืนยันแล้ว</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          {[
            { key: 'overview', label: 'ภาพรวม' },
            { key: 'listings', label: 'ประกาศ' },
            { key: 'bookings', label: 'การจอง' },
            { key: 'hosts', label: 'เจ้าของ' },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: ภาพรวม */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">สถานะการจอง</h3>
              <div className="space-y-3">
                {['pending', 'paid', 'confirmed', 'cancelled'].map((status) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[status]}`}>{statusLabel[status]}</span>
                    <span className="font-semibold text-gray-800">{bookings.filter(b => b.status === status).length} รายการ</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">หมวดหมู่ประกาศ</h3>
              <div className="space-y-3">
                {['homestay', 'villa', 'hotel', 'resort', 'guesthouse', 'guide'].map((cat) => {
                  const labels: Record<string, string> = { homestay: '🏡 โฮมสเตย์', villa: '🏖️ พูลวิลล่า', hotel: '🏨 โรงแรม', resort: '🌿 รีสอร์ท', guesthouse: '🎒 เกสต์เฮาส์', guide: '🗺️ ไกด์ท้องถิ่น' }
                  return (
                    <div key={cat} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{labels[cat]}</span>
                      <span className="font-semibold text-gray-800">{listings.filter(l => l.category === cat).length} รายการ</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab: ประกาศ */}
        {activeTab === 'listings' && (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl border border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{listing.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${listing.is_available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {listing.is_available ? 'เปิด' : 'ปิด'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{listing.category} • ฿{listing.price_per_day?.toLocaleString()}{listing.category === 'guide' ? '/วัน' : '/คืน'} {listing.location && `• ${listing.location}`}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleListing(listing.id, listing.is_available)}
                    className="text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    {listing.is_available ? 'ปิด' : 'เปิด'}
                  </button>
                  <button onClick={() => deleteListing(listing.id)}
                    className="text-xs px-3 py-2 border border-red-200 text-red-400 rounded-lg hover:bg-red-50">
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: การจอง */}
        {activeTab === 'bookings' && (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{booking.listings?.title}</h3>
                    <p className="text-sm text-gray-400">{booking.start_date} → {booking.end_date}</p>
                    <p className="text-orange-500 font-bold mt-1">฿{booking.total_price?.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[booking.status] || 'bg-gray-100 text-gray-400'}`}>
                    {statusLabel[booking.status] || booking.status}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {booking.slip_url && (
                    <a href={booking.slip_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-3 py-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 border border-orange-200">
                      🧾 ดูสลิป
                    </a>
                  )}
                  <button onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                    className="text-xs px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                    ยืนยัน
                  </button>
                  <button onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    className="text-xs px-3 py-2 bg-red-100 text-red-400 rounded-lg hover:bg-red-200">
                    ยกเลิก
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: เจ้าของ (อนุมัติยืนยันตัวตน) */}
        {activeTab === 'hosts' && (
          <div className="space-y-3">
            {profiles.length === 0 && (
              <p className="text-center text-gray-400 py-10">ยังไม่มีผู้ใช้</p>
            )}
            {profiles.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">{p.full_name || '(ยังไม่ตั้งชื่อ)'}</h3>
                    {p.is_verified && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">✓ ยืนยันแล้ว</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {p.phone && `📞 ${p.phone} `}{p.line_id && `• LINE ${p.line_id}`}
                  </p>
                  <a href={`/host/${p.id}`} className="text-xs text-orange-500 hover:underline">ดูโปรไฟล์ →</a>
                </div>
                <button onClick={() => toggleVerified(p.id, p.is_verified)}
                  className={`text-xs px-4 py-2 rounded-lg font-medium shrink-0 ${
                    p.is_verified
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}>
                  {p.is_verified ? 'ยกเลิกยืนยัน' : '✓ อนุมัติยืนยันตัวตน'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}