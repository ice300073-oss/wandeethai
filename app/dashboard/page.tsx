'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { displayName } from '@/lib/profile'
import { Toast, useToast } from '@/components/toast'
import NotificationBell from '@/components/NotificationBell'

function SkeletonRow() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex justify-between items-center animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-gray-200 h-4 rounded w-48"/>
          <div className="bg-gray-200 h-5 rounded-full w-16"/>
        </div>
        <div className="bg-gray-200 h-3 rounded w-64"/>
      </div>
      <div className="flex gap-2 ml-4">
        <div className="bg-gray-200 h-8 rounded-lg w-12"/>
        <div className="bg-gray-200 h-8 rounded-lg w-12"/>
      </div>
    </div>
  )
}

function SkeletonStat() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 text-center animate-pulse">
      <div className="bg-gray-200 h-8 rounded w-12 mx-auto mb-2"/>
      <div className="bg-gray-200 h-3 rounded w-20 mx-auto"/>
    </div>
  )
}

export default function Dashboard() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [viewStats, setViewStats] = useState<Record<string, number>>({})
  const [bookings, setBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'analytics'>('listings')
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [walkIn, setWalkIn] = useState({ listing_id: '', guest_name: '', start_date: '', end_date: '' })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
        const listingData = data || []
        setListings(listingData)

        if (listingData.length > 0) {
          const stats: Record<string, number> = {}
          for (const listing of listingData) {
            const { count } = await supabase
              .from('listing_views')
              .select('*', { count: 'exact', head: true })
              .eq('listing_id', listing.id)
            stats[listing.id] = count || 0
          }
          setViewStats(stats)

          // ดึงการจองที่เข้ามาในที่พักของเรา
          const listingIds = listingData.map((l: any) => l.id)
          const { data: bookingData } = await supabase
            .from('bookings')
            .select('*, listings(title)')
            .in('listing_id', listingIds)
            .order('created_at', { ascending: false })
          const allBookings = bookingData || []

          // ดึงข้อมูลติดต่อของลูกค้า (เบอร์/LINE) มาแนบกับแต่ละการจอง
          const renterIds = Array.from(new Set(allBookings.map((b: any) => b.renter_id).filter(Boolean)))
          let renterMap: Record<string, any> = {}
          if (renterIds.length > 0) {
            const { data: renterProfiles } = await supabase
              .from('profiles').select('id, full_name, phone, line_id').in('id', renterIds)
            renterMap = Object.fromEntries((renterProfiles || []).map((p: any) => [p.id, p]))
          }
          // เรียงให้รายการที่ลูกค้าชำระแล้วรอยืนยัน ขึ้นก่อน
          const sorted = allBookings
            .map((b: any) => ({ ...b, renterProfile: b.renter_id ? renterMap[b.renter_id] : null }))
            .sort((a: any, b: any) => (a.status === 'paid' ? -1 : 0) - (b.status === 'paid' ? -1 : 0))
          setBookings(sorted)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const toggleAvailable = async (id: string, current: boolean) => {
    showToast('กำลังอัปเดต...', 'loading')
    await supabase.from('listings').update({ is_available: !current }).eq('id', id)
    setListings(listings.map(l => l.id === id ? { ...l, is_available: !current } : l))
    showToast(current ? 'ปิดประกาศแล้ว' : 'เปิดประกาศแล้ว', 'success')
  }

  const deleteListing = async (id: string) => {
    showToast('กำลังลบ...', 'loading')
    setConfirmDelete(null)
    await supabase.from('listings').delete().eq('id', id)
    setListings(listings.filter(l => l.id !== id))
    showToast('ลบประกาศแล้ว', 'success')
  }

  const formatThaiDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : ''

  const nightsBetween = (start: string, end: string) => {
    if (!start || !end) return 0
    const ms = new Date(end).getTime() - new Date(start).getTime()
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
  }

  const getPriceLabel = (listing: any) => {
    const price = listing.price_per_day ?? listing.price_per_month
    const unit = listing.category === 'guide' ? '/วัน' : '/คืน'
    return `฿${price?.toLocaleString()}${unit}`
  }

  const setBookingStatus = async (id: string, status: string) => {
    showToast('กำลังอัปเดต...', 'loading')
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
    showToast('อัปเดตการจองแล้ว', 'success')
  }

  const checkInBooking = async (id: string, code: string) => {
    const input = window.prompt('พิมพ์รหัสจอง 8 หลักที่ลูกค้าแสดง เพื่อยืนยันเช็คอิน:')
    if (!input) return
    if (input.trim().toUpperCase() !== code) {
      showToast('รหัสไม่ตรง กรุณาลองใหม่', 'error'); return
    }
    showToast('กำลังบันทึก...', 'loading')
    const now = new Date().toISOString()
    await supabase.from('bookings').update({ checked_in_at: now }).eq('id', id)
    setBookings(bookings.map(b => b.id === id ? { ...b, checked_in_at: now } : b))
    showToast('✓ เช็คอินลูกค้าแล้ว', 'success')
  }

  // เจ้าของกดยืนยันว่ารับเงินส่วนที่เหลือ (เงินสด/โอนหน้างาน) จากลูกค้าที่จ่ายมัดจำมาแล้ว
  const markBalancePaid = async (id: string, total: number) => {
    if (!window.confirm('ยืนยันว่าได้รับเงินส่วนที่เหลือจากลูกค้าครบแล้ว?')) return
    showToast('กำลังบันทึก...', 'loading')
    await supabase.from('bookings').update({ amount_paid: total }).eq('id', id)
    setBookings(bookings.map(b => b.id === id ? { ...b, amount_paid: total } : b))
    showToast('✓ บันทึกรับเงินครบแล้ว', 'success')
  }

  const addWalkIn = async () => {
    if (!walkIn.listing_id || !walkIn.start_date || !walkIn.end_date) {
      showToast('กรุณาเลือกห้อง + วันเข้า/ออก', 'error'); return
    }
    if (walkIn.end_date <= walkIn.start_date) {
      showToast('วันออกต้องหลังวันเข้า', 'error'); return
    }
    showToast('กำลังบันทึก...', 'loading')
    const { error } = await supabase.from('bookings').insert([{
      listing_id: walkIn.listing_id,
      renter_id: null,
      guest_name: walkIn.guest_name || 'จองหน้าร้าน',
      start_date: walkIn.start_date,
      end_date: walkIn.end_date,
      total_price: 0,
      status: 'confirmed',
    }])
    if (error) {
      const isDoubleBooked = error.code === '23P01' || error.message?.toLowerCase().includes('exclu')
      showToast(isDoubleBooked ? 'ช่วงวันที่นี้มีการจองอยู่แล้ว' : 'ไม่สำเร็จ: ' + error.message, 'error')
      return
    }
    showToast('เพิ่มการจองแล้ว ✓ วันนั้นถูกบล็อกอัตโนมัติ', 'success')
    setWalkIn({ listing_id: '', guest_name: '', start_date: '', end_date: '' })
    setShowWalkIn(false)
    setTimeout(() => window.location.reload(), 900)
  }

  const bookingStatusLabel: Record<string, string> = {
    pending: 'รอลูกค้าชำระเงิน', paid: '💳 ลูกค้าชำระแล้ว รอคุณยืนยัน', confirmed: '✓ ยืนยันแล้ว',
    cancelled: 'ยกเลิก', completed: 'เสร็จสิ้น',
  }
  const bookingStatusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700', paid: 'bg-blue-100 text-blue-600 font-semibold',
    confirmed: 'bg-green-100 text-green-600', cancelled: 'bg-red-100 text-red-400',
    completed: 'bg-gray-100 text-gray-500',
  }

  const totalViews = Object.values(viewStats).reduce((a, b) => a + b, 0)
  const needsConfirmCount = bookings.filter(b => b.status === 'paid').length

  if (!loading && !user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">กรุณาเข้าสู่ระบบก่อน</p>
        <a href="/auth" className="bg-orange-500 text-white px-6 py-2 rounded-lg">เข้าสู่ระบบ</a>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast}/>}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <p className="text-xl mb-2">🗑️</p>
            <h3 className="font-bold text-gray-800 mb-2">ลบประกาศนี้?</h3>
            <p className="text-gray-400 text-sm mb-6">ไม่สามารถเรียกคืนได้หลังจากลบแล้ว</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
                ยกเลิก
              </button>
              <button
                onClick={() => deleteListing(confirmDelete)}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
                ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <div className="flex gap-3 items-center">
          <NotificationBell />
          <span className="text-sm text-gray-500">{displayName(user)}</span>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
            className="text-sm text-red-400 hover:text-red-600">ออกจากระบบ</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard ของฉัน</h2>
            <p className="text-gray-400 mt-1">จัดการประกาศทั้งหมดของคุณ</p>
          </div>
          <a href="/create" className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 text-sm">
            + ลงประกาศใหม่
          </a>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <SkeletonStat key={i}/>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
              <p className="text-3xl font-bold text-orange-500">{listings.length}</p>
              <p className="text-sm text-gray-400 mt-1">ประกาศทั้งหมด</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
              <p className="text-3xl font-bold text-green-500">{listings.filter(l => l.is_available).length}</p>
              <p className="text-sm text-gray-400 mt-1">เปิดให้จอง</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
              <p className="text-3xl font-bold text-gray-400">{listings.filter(l => !l.is_available).length}</p>
              <p className="text-sm text-gray-400 mt-1">ปิดชั่วคราว</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
              <p className="text-3xl font-bold text-purple-500">{totalViews}</p>
              <p className="text-sm text-gray-400 mt-1">ยอดดูรวม</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button onClick={() => setActiveTab('listings')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'listings' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>
            ประกาศของฉัน
          </button>
          <button onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>
            การจอง
            {needsConfirmCount > 0 ? (
              <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-1.5 animate-pulse">{needsConfirmCount} รอยืนยัน</span>
            ) : bookings.length > 0 ? (
              <span className="ml-1 text-xs bg-orange-500 text-white rounded-full px-1.5">{bookings.length}</span>
            ) : null}
          </button>
          <button onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>
            📊 Analytics
          </button>
        </div>

        {/* Tab: ประกาศ */}
        {activeTab === 'listings' && (
          loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <SkeletonRow key={i}/>)}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
              <p className="text-5xl mb-4">📋</p>
              <p className="text-gray-500 mb-4">ยังไม่มีประกาศ</p>
              <a href="/create" className="bg-orange-500 text-white px-6 py-2 rounded-lg text-sm">ลงประกาศแรก</a>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{listing.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${listing.is_available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {listing.is_available ? 'เปิดให้จอง' : 'ปิดชั่วคราว'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {listing.category} • {getPriceLabel(listing)}
                      {listing.location && ` • ${listing.location}`}
                      {viewStats[listing.id] !== undefined && ` • 👁 ${viewStats[listing.id]} ครั้ง`}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap sm:ml-4">
                    <a
                      href={`/edit/${listing.id}`}
                      className="text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      แก้ไข
                    </a>
                    <a
                      href={`/chat/${listing.id}`}
                      className="text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      💬 ข้อความ
                    </a>
                    <button
                      onClick={() => toggleAvailable(listing.id, listing.is_available)}
                      className="text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      {listing.is_available ? 'ปิด' : 'เปิด'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(listing.id)}
                      className="text-xs px-3 py-2 border border-red-200 text-red-400 rounded-lg hover:bg-red-50">
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Tab: การจอง */}
        {activeTab === 'bookings' && (
          <div className="space-y-3">
            <button onClick={() => setShowWalkIn(!showWalkIn)}
              className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
              ➕ เพิ่มการจองเอง (walk-in / จองทางโทร)
            </button>
            {showWalkIn && (
              <div className="bg-white rounded-xl border border-orange-200 p-5 space-y-3">
                <p className="text-sm text-gray-500">บันทึกคนที่จองทางโทร/หน้าร้าน — วันนั้นจะถูกบล็อกกันจองชนกันอัตโนมัติ</p>
                <select value={walkIn.listing_id} onChange={(e) => setWalkIn({ ...walkIn, listing_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-800">
                  <option value="">เลือกห้อง / ที่พัก</option>
                  {listings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
                <input value={walkIn.guest_name} onChange={(e) => setWalkIn({ ...walkIn, guest_name: e.target.value })}
                  placeholder="ชื่อผู้เข้าพัก" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"/>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">วันเข้าพัก</label>
                    <input type="date" value={walkIn.start_date} onChange={(e) => setWalkIn({ ...walkIn, start_date: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"/>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">วันออก</label>
                    <input type="date" value={walkIn.end_date} onChange={(e) => setWalkIn({ ...walkIn, end_date: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"/>
                  </div>
                </div>
                <button onClick={addWalkIn}
                  className="w-full bg-orange-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600">
                  บันทึกการจอง
                </button>
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500">ยังไม่มีการจอง</p>
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id}
                  className={`bg-white rounded-xl border p-5 ${b.status === 'paid' ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{b.listings?.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">
                        👤 {b.guest_name || b.renterProfile?.full_name || 'ลูกค้าผ่านเว็บ'}
                      </p>
                      {(b.renterProfile?.phone || b.renterProfile?.line_id) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {b.renterProfile?.phone && `📞 ${b.renterProfile.phone}`}
                          {b.renterProfile?.phone && b.renterProfile?.line_id && '  ·  '}
                          {b.renterProfile?.line_id && `LINE: ${b.renterProfile.line_id}`}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1.5">
                        🗓 เข้าพัก <span className="text-gray-800 font-medium">{formatThaiDate(b.start_date)}</span>
                        {' '}→ ออก <span className="text-gray-800 font-medium">{formatThaiDate(b.end_date)}</span>
                        <span className="text-gray-400"> ({nightsBetween(b.start_date, b.end_date)} คืน)</span>
                      </p>
                      <p className="text-orange-500 font-bold mt-1.5">฿{b.total_price?.toLocaleString()}</p>
                      {b.payment_type === 'deposit' && (b.amount_paid || 0) < b.total_price && (
                        <p className="text-xs text-amber-700 mt-0.5">
                          💰 จ่ายมัดจำแล้ว ฿{(b.amount_paid || 0).toLocaleString()} · เหลือเก็บ <span className="font-semibold">฿{(b.total_price - (b.amount_paid || 0)).toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${bookingStatusColor[b.status] || 'bg-gray-100 text-gray-400'}`}>
                        {bookingStatusLabel[b.status] || b.status}
                      </span>
                      {b.checked_in_at && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">✓ เช็คอินแล้ว</span>
                      )}
                    </div>
                  </div>

                  {b.special_request && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                      <p className="text-xs font-medium text-amber-700 mb-0.5">💬 คำขอพิเศษจากลูกค้า</p>
                      <p className="text-sm text-amber-900">{b.special_request}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {b.slip_url && (
                      <a href={b.slip_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-3 py-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 border border-orange-200 font-medium">
                        🧾 ดูสลิป — ต้องได้ ฿{b.total_price?.toLocaleString()}
                      </a>
                    )}
                    {b.status !== 'confirmed' && (
                      <button onClick={() => setBookingStatus(b.id, 'confirmed')}
                        className="text-xs px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-medium">
                        ✓ ยืนยันการจอง
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button onClick={() => setBookingStatus(b.id, 'cancelled')}
                        className="text-xs px-3 py-2 bg-red-100 text-red-400 rounded-lg hover:bg-red-200">
                        ปฏิเสธ
                      </button>
                    )}
                    {b.status === 'confirmed' && !b.checked_in_at && (
                      <button onClick={() => checkInBooking(b.id, b.id.slice(0, 8).toUpperCase())}
                        className="text-xs px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 font-medium">
                        🎫 เช็คอินลูกค้า
                      </button>
                    )}
                    {b.payment_type === 'deposit' && (b.amount_paid || 0) < b.total_price && b.status !== 'cancelled' && (
                      <button onClick={() => markBalancePaid(b.id, b.total_price)}
                        className="text-xs px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 font-medium">
                        💵 รับเงินที่เหลือแล้ว
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">📊 ยอดดูแต่ละประกาศ</h3>
              {listings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">ยังไม่มีประกาศ</p>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => {
                    const views = viewStats[listing.id] || 0
                    const maxViews = Math.max(...Object.values(viewStats), 1)
                    const percent = Math.round((views / maxViews) * 100)
                    return (
                      <div key={listing.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700 truncate max-w-xs">{listing.title}</span>
                          <span className="text-sm font-semibold text-gray-800 ml-2">{views} ครั้ง</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${percent}%` }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-600">
              💡 ยอดดูถูกนับทุกครั้งที่มีคนเปิดหน้าประกาศ
            </div>
          </div>
        )}
      </div>
    </main>
  )
}