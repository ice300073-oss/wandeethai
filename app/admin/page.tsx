'use client'
import SiteName from '@/components/SiteName'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/profile'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})
  const [savingSettings, setSavingSettings] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'bookings' | 'hosts' | 'settings' | 'reports'>('overview')
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const { data: listingData } = await supabase
      .from('listings').select('*').order('created_at', { ascending: false })
    setListings(listingData || [])

    const { data: bookingData } = await supabase
      .from('bookings').select('*, listings(title)').order('created_at', { ascending: false })
    setBookings(bookingData || [])

    const { data: profileData } = await supabase
      .from('profiles').select('*').order('created_at', { ascending: false })
    setProfiles(profileData || [])

    const { data: settingsData } = await supabase
      .from('site_settings').select('*').eq('id', 1).single()
    setSettings(settingsData || {})

    const { data: reportData } = await supabase
      .from('reports').select('*, listings(title)').order('created_at', { ascending: false })
    setReports(reportData || [])

    setLoading(false)
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      if (!user || !ADMIN_EMAILS.includes(user.email)) { window.location.href = '/'; return }
      setUser(user)
      loadData()
    }
    init()
  }, [loadData])

  // realtime: การจอง/ประกาศ/รายงาน/ผู้ใช้ เปลี่ยน → แอดมินอัปเดตเอง ไม่ต้องรีเฟรช
  useEffect(() => {
    const ch = supabase
      .channel('admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [loadData])

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

  const saveSettings = async () => {
    setSavingSettings(true)
    const { error } = await supabase.from('site_settings').update({
      site_name: settings.site_name,
      logo_url: settings.logo_url,
      theme_color: settings.theme_color,
      hero_bg_url: settings.hero_bg_url,
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      announcement: settings.announcement,
      contact_line: settings.contact_line,
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
      promptpay: settings.promptpay,
      commission_percent: settings.commission_percent === '' ? null : Number(settings.commission_percent),
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
    setSavingSettings(false)
    alert(error ? 'บันทึกไม่สำเร็จ: ' + error.message : '✅ บันทึกแล้ว! รีเฟรชหน้าแรกเพื่อดูผล')
  }
  const setS = (k: string, v: string) => setSettings((prev: any) => ({ ...prev, [k]: v }))

  const toggleVerified = async (id: string, current: boolean) => {
    const { error } = await supabase.rpc('set_host_verified', { target_id: id, val: !current })
    if (error) { alert('ไม่สำเร็จ: ' + error.message); return }
    setProfiles(profiles.map(p => p.id === id ? { ...p, is_verified: !current } : p))
  }

  const setReportStatus = async (id: string, status: string) => {
    await supabase.from('reports').update({ status }).eq('id', id)
    setReports(reports.map(r => r.id === id ? { ...r, status } : r))
  }

  const openReportsCount = reports.filter(r => r.status === 'open' || !r.status).length

  const totalRevenue = bookings
    .filter(b => b.status === 'paid' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0)

  // ค่าคอมมิชชั่นสะสม — เห็นเฉพาะแอดมิน ไม่แสดงที่หน้าลูกค้า/เจ้าของ
  const totalCommission = bookings
    .filter(b => b.status === 'paid' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.commission_amount || 0), 0)

  // สถิติการเติบโต 30 วันล่าสุด
  const since30 = Date.now() - 30 * 24 * 60 * 60 * 1000
  const newUsers30 = profiles.filter(p => p.created_at && new Date(p.created_at).getTime() > since30).length
  const newBookings30 = bookings.filter(b => b.created_at && new Date(b.created_at).getTime() > since30).length
  const pendingVerify = profiles.filter(p => p.verify_status === 'pending' && !p.is_verified).length
  // เรียงผู้ใช้: คิวรอตรวจขึ้นก่อน
  const sortedProfiles = [...profiles].sort((a, b) => {
    const ap = a.verify_status === 'pending' && !a.is_verified ? 0 : 1
    const bp = b.verify_status === 'pending' && !b.is_verified ? 0 : 1
    return ap - bp
  })

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
      <nav className="bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <a href="/" className="text-lg sm:text-2xl font-bold text-orange-500 shrink-0"><SiteName /></a>
          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium shrink-0">Admin</span>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm truncate max-w-[40%]">{user?.email}</p>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">Admin Dashboard</h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 text-center">
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
          <div className="bg-gray-900 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-emerald-400">฿{totalCommission.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">💵 ค่าคอมสะสม (แอดมินเท่านั้น)</p>
          </div>
        </div>

        {/* การเติบโต 30 วันล่าสุด */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-amber-400 text-white rounded-xl p-5">
            <p className="text-2xl font-bold">+{newUsers30}</p>
            <p className="text-sm text-orange-50 mt-1">ผู้ใช้ใหม่ (30 วัน)</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-amber-400 text-white rounded-xl p-5">
            <p className="text-2xl font-bold">+{newBookings30}</p>
            <p className="text-sm text-orange-50 mt-1">การจองใหม่ (30 วัน)</p>
          </div>
          <div className={`rounded-xl p-5 ${pendingVerify > 0 ? 'bg-blue-500 text-white' : 'bg-white border border-gray-100'}`}>
            <p className={`text-2xl font-bold ${pendingVerify > 0 ? '' : 'text-gray-300'}`}>{pendingVerify}</p>
            <p className={`text-sm mt-1 ${pendingVerify > 0 ? 'text-blue-50' : 'text-gray-400'}`}>🕘 รอตรวจยืนยันตัวตน</p>
          </div>
        </div>

        {/* Tabs — เลื่อนซ้ายขวาได้บนมือถือ */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6 overflow-x-auto max-w-full">
          {[
            { key: 'overview', label: 'ภาพรวม' },
            { key: 'listings', label: 'ประกาศ' },
            { key: 'bookings', label: 'การจอง' },
            { key: 'hosts', label: 'เจ้าของ' },
            { key: 'reports', label: `🚩 แจ้งปัญหา${openReportsCount > 0 ? ` (${openReportsCount})` : ''}` },
            { key: 'settings', label: '⚙️ ตั้งค่าเว็บ' },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 sm:px-5 py-2 rounded-md text-sm font-medium transition-all shrink-0 whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>
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
              <div key={listing.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                      className="text-xs px-3 py-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 border border-orange-200 font-medium">
                      🧾 ดูสลิป — ต้องได้ ฿{booking.total_price?.toLocaleString()}
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
            {sortedProfiles.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 truncate">{p.full_name || '(ยังไม่ตั้งชื่อ)'}</h3>
                    {p.is_verified ? (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">✓ ยืนยันแล้ว</span>
                    ) : p.verify_status === 'pending' ? (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">🕘 รอตรวจ</span>
                    ) : null}
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

        {/* Tab: ตั้งค่าเว็บ */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl space-y-5">
            <p className="text-sm text-gray-400">แก้ข้อความ/ข้อมูลเว็บได้เอง — กด "บันทึก" แล้วรีเฟรชหน้าแรก</p>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">🏷️ ชื่อเว็บ (โชว์ที่เมนูบนสุด)</label>
              <input
                value={settings.site_name || ''}
                onChange={(e) => setS('site_name', e.target.value)}
                placeholder="WanDeeThai"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-400"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">🏢 โลโก้ (ใส่ลิงก์รูป — เว้นว่าง = ใช้ตัวอักษร W)</label>
              <input
                value={settings.logo_url || ''}
                onChange={(e) => setS('logo_url', e.target.value)}
                placeholder="https://.../logo.png"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-400"/>
              {settings.logo_url && (
                <img src={settings.logo_url} alt="ตัวอย่างโลโก้" className="mt-2 h-12 object-contain rounded border border-gray-100 bg-gray-50 p-1"/>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">🎨 สีธีมหลัก</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.theme_color || '#f97316'}
                  onChange={(e) => setS('theme_color', e.target.value)}
                  className="w-14 h-11 rounded-lg border border-gray-200 cursor-pointer bg-white"/>
                <input
                  value={settings.theme_color || ''}
                  onChange={(e) => setS('theme_color', e.target.value)}
                  placeholder="#f97316 (ส้ม = ค่าเริ่มต้น)"
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-400"/>
              </div>
              <p className="text-xs text-gray-400 mt-1">เปลี่ยนสีปุ่ม/ไฮไลต์หลักทั้งเว็บ (เช่น โรงแรมใช้สีน้ำเงิน)</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">🖼️ รูปพื้นหลัง Hero (ใส่ลิงก์รูป)</label>
              <input
                value={settings.hero_bg_url || ''}
                onChange={(e) => setS('hero_bg_url', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-400"/>
              {settings.hero_bg_url && (
                <img src={settings.hero_bg_url} alt="ตัวอย่างพื้นหลัง" className="mt-2 h-24 w-full object-cover rounded-lg border border-gray-100"/>
              )}
              <p className="text-xs text-gray-400 mt-1">
                หารูปฟรีได้ที่ <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">unsplash.com</a> — คลิกขวารูปที่ชอบ → "คัดลอกที่อยู่ลิงก์รูปภาพ"
              </p>
            </div>

            {[
              { k: 'hero_title', label: 'สโลแกนหลัก (บรรทัดบน)', ph: 'เที่ยวคนเดียว' },
              { k: 'hero_subtitle', label: 'สโลแกนรอง (บรรทัดล่าง)', ph: 'ก็เจ๋งได้' },
              { k: 'announcement', label: '📢 แถบประกาศ (เว้นว่าง = ไม่โชว์)', ph: 'เช่น โปรเปิดตัว ลงประกาศฟรี!' },
              { k: 'contact_line', label: 'LINE', ph: '@wandeethai' },
              { k: 'contact_email', label: 'อีเมลติดต่อ', ph: 'you@email.com' },
              { k: 'contact_phone', label: 'เบอร์โทร', ph: '08X-XXX-XXXX' },
              { k: 'promptpay', label: '💰 PromptPay กลาง (สำรอง)', ph: '08XXXXXXXX' },
            ].map((f) => (
              <div key={f.k}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label}</label>
                <input
                  value={settings[f.k] || ''}
                  onChange={(e) => setS(f.k, e.target.value)}
                  placeholder={f.ph}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-400"/>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-5">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                💵 ค่าคอมมิชชั่นต่อการจอง (%) <span className="text-gray-400 font-normal">— ไม่แสดงให้ลูกค้า/เจ้าของเห็น</span>
              </label>
              <input
                type="number" step="0.1" min="0" max="100"
                value={settings.commission_percent ?? ''}
                onChange={(e) => setS('commission_percent', e.target.value)}
                placeholder="10"
                className="w-40 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-400"/>
              <p className="text-xs text-gray-400 mt-1">คำนวณอัตโนมัติทุกการจองใหม่ ดูสรุปได้ที่แท็บภาพรวม</p>
            </div>
            <button onClick={saveSettings} disabled={savingSettings}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
              {savingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        )}

        {/* Tab: แจ้งปัญหา (รายงานประกาศ + แจ้งปัญหาทั่วไป) */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                ยังไม่มีรายงาน/แจ้งปัญหาเข้ามา
              </div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">
                        {r.listing_id ? `🚩 รายงานประกาศ: ${r.listings?.title || r.listing_id}` : '🛠️ แจ้งปัญหาทั่วไป'}
                      </p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{r.reason}</p>
                      {r.page_url && (
                        <a href={r.page_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-orange-500 hover:underline mt-1 inline-block break-all">
                          {r.page_url}
                        </a>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(r.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
                      r.status === 'reviewed' ? 'bg-green-100 text-green-600'
                      : r.status === 'dismissed' ? 'bg-gray-100 text-gray-400'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.status === 'reviewed' ? 'ตรวจแล้ว' : r.status === 'dismissed' ? 'ยกเลิก' : 'รอตรวจ'}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {r.status !== 'reviewed' && (
                      <button onClick={() => setReportStatus(r.id, 'reviewed')}
                        className="text-xs px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                        ✓ ตรวจแล้ว
                      </button>
                    )}
                    {r.status !== 'dismissed' && (
                      <button onClick={() => setReportStatus(r.id, 'dismissed')}
                        className="text-xs px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
                        ปิด (ไม่เกี่ยวข้อง)
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}