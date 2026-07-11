'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-orange-100 text-orange-600',
  confirmed: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-400',
}

const statusLabel: Record<string, string> = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระแล้ว รอเจ้าของยืนยัน',
  confirmed: 'ยืนยันแล้ว ✓',
  cancelled: 'ยกเลิก',
}

const formatThaiDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : ''

const nights = (start: string, end: string) => {
  if (!start || !end) return 0
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
}

export default function TicketsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      if (!user) { window.location.href = '/auth?next=/tickets'; return }

      const { data } = await supabase
        .from('bookings')
        .select('*, listings(*)')
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false })
      setBookings(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href="/" className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าหลัก</a>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">🎫 ตั๋วของฉัน</h1>
        <p className="text-gray-400 text-sm mb-6">รายการจองที่พักทั้งหมดของคุณ</p>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">🎫</p>
            <p className="text-gray-400 mb-4">ยังไม่มีการจอง</p>
            <a href="/" className="inline-block bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600">
              ค้นหาที่พัก
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((b) => {
              const code = b.id.slice(0, 8).toUpperCase()
              const isActive = b.status === 'confirmed' || b.status === 'paid'
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* ส่วนหัวตั๋ว */}
                  <div className={`px-5 py-4 flex justify-between items-start gap-3 ${isActive ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white' : 'bg-gray-50'}`}>
                    <div className="min-w-0">
                      <h3 className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>{b.listings?.title || 'ที่พัก'}</h3>
                      {b.listings?.location && (
                        <p className={`text-xs mt-0.5 ${isActive ? 'text-orange-50' : 'text-gray-400'}`}>📍 {b.listings.location}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-medium ${isActive ? 'bg-white/25 text-white' : statusColor[b.status] || 'bg-gray-100 text-gray-400'}`}>
                      {statusLabel[b.status] || b.status}
                    </span>
                  </div>

                  {/* เส้นปรุ (ขอบหยัก) */}
                  <div className="relative h-4 bg-white">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50"/>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50"/>
                    <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-gray-200"/>
                  </div>

                  {/* รายละเอียด */}
                  <div className="px-5 pb-5">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">เช็คอิน</p>
                        <p className="font-semibold text-gray-800">{formatThaiDate(b.start_date)}</p>
                      </div>
                      <div className="text-gray-300">→</div>
                      <div>
                        <p className="text-xs text-gray-400">เช็คเอาท์</p>
                        <p className="font-semibold text-gray-800">{formatThaiDate(b.end_date)}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs text-gray-400">{nights(b.start_date, b.end_date)} คืน</p>
                        <p className="font-bold text-orange-500">฿{b.total_price?.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* รหัสจอง — โชว์เมื่อยืนยันแล้ว ใช้ตอนเช็คอิน */}
                    {b.status === 'confirmed' && (
                      <div className={`mt-4 rounded-xl px-4 py-3 text-center ${b.checked_in_at ? 'bg-teal-50 border border-teal-200' : 'bg-gray-900'}`}>
                        {b.checked_in_at ? (
                          <p className="text-teal-700 font-medium text-sm">✓ เช็คอินเรียบร้อยแล้ว</p>
                        ) : (
                          <>
                            <p className="text-gray-400 text-xs mb-1">แสดงรหัสนี้ให้เจ้าของตอนเช็คอิน</p>
                            <p className="text-white font-mono font-bold text-2xl tracking-widest">{code}</p>
                          </>
                        )}
                      </div>
                    )}

                    {/* ปุ่ม action */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {b.status === 'pending' && (
                        <a href={`/payment/${b.id}`}
                          className="flex-1 text-center bg-orange-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600">
                          💳 ชำระเงิน
                        </a>
                      )}
                      {(b.status === 'paid' || b.status === 'confirmed') && (
                        <>
                          <a href={`/chat/${b.listing_id}`}
                            className="text-center border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                            💬 แชทเจ้าของ
                          </a>
                          <a href={`/deposit/${b.id}`}
                            className="text-center border border-purple-200 text-purple-500 px-4 py-2.5 rounded-lg text-sm hover:bg-purple-50">
                            🔒 มัดจำ
                          </a>
                          <a href={`/review/${b.id}`}
                            className="text-center border border-yellow-200 text-yellow-600 px-4 py-2.5 rounded-lg text-sm hover:bg-yellow-50">
                            ⭐ รีวิว
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
