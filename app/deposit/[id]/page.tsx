'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DepositPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [damageReport, setDamageReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, listings(*)')
        .eq('id', params.id)
        .single()

      if (bookingData) {
        setBooking(bookingData)
        setListing(bookingData.listings)

        if (!bookingData.deposit_amount) {
          const deposit = bookingData.total_price * 0.3
          const insurance = bookingData.total_price * 0.05
          await supabase.from('bookings').update({
            deposit_amount: deposit,
            insurance_amount: insurance,
            deposit_status: 'pending',
          }).eq('id', params.id)
          setBooking({ ...bookingData, deposit_amount: deposit, insurance_amount: insurance })
        }
      }
    }
    fetchData()
  }, [params.id])

  const handlePayDeposit = async () => {
    setLoading(true)
    await supabase.from('bookings').update({
      deposit_status: 'paid',
    }).eq('id', params.id)
    setBooking({ ...booking, deposit_status: 'paid' })
    setMessage('✅ ชำระมัดจำสำเร็จแล้ว!')
    setLoading(false)
  }

  const handleReturnDeposit = async () => {
    setLoading(true)
    await supabase.from('bookings').update({
      deposit_returned: true,
      deposit_status: 'returned',
    }).eq('id', params.id)
    setBooking({ ...booking, deposit_returned: true, deposit_status: 'returned' })
    setMessage('✅ คืนมัดจำสำเร็จแล้ว!')
    setLoading(false)
  }

  const handleReportDamage = async () => {
    if (!damageReport) {
      setMessage('❌ กรุณาระบุความเสียหาย')
      return
    }
    setLoading(true)
    await supabase.from('bookings').update({
      damage_report: damageReport,
      deposit_status: 'disputed',
    }).eq('id', params.id)
    setBooking({ ...booking, damage_report: damageReport, deposit_status: 'disputed' })
    setMessage('✅ รายงานความเสียหายส่งแล้ว Admin จะตรวจสอบภายใน 24 ชั่วโมง')
    setLoading(false)
  }

  const depositStatusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-600',
    paid: 'bg-orange-100 text-orange-500',
    returned: 'bg-green-100 text-green-600',
    disputed: 'bg-red-100 text-red-500',
  }

  const depositStatusLabel: Record<string, string> = {
    pending: 'รอชำระมัดจำ',
    paid: 'ชำระมัดจำแล้ว',
    returned: 'คืนมัดจำแล้ว',
    disputed: 'มีข้อพิพาท',
  }

  if (!booking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  const isOwner = user?.id === listing?.owner_id

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href="/dashboard" className="text-gray-600 hover:text-orange-500 text-sm">← Dashboard</a>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">มัดจำและประกัน</h2>
        <p className="text-gray-400 mb-8">รายละเอียดการค้ำประกันการเช่า</p>

        {/* รายละเอียดสินค้า */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">{listing?.title}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">วันที่เช่า</span>
              <span className="text-gray-800">{booking.start_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">วันที่คืน</span>
              <span className="text-gray-800">{booking.end_date}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold text-gray-800">ค่าเช่ารวม</span>
              <span className="font-bold text-orange-500">฿{booking.total_price?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* มัดจำและประกัน */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-800">รายละเอียดมัดจำ</h3>

          <div className="bg-orange-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">เงินมัดจำ (30%)</span>
              <span className="font-semibold text-gray-800">฿{booking.deposit_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ค่าประกัน (5%)</span>
              <span className="font-semibold text-gray-800">฿{booking.insurance_amount?.toLocaleString()}</span>
            </div>
            <div className="border-t border-orange-100 pt-3 flex justify-between">
              <span className="font-semibold text-gray-800">รวมทั้งหมด</span>
              <span className="font-bold text-orange-500 text-lg">
                ฿{((booking.deposit_amount || 0) + (booking.insurance_amount || 0)).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">สถานะมัดจำ</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${depositStatusColor[booking.deposit_status] || 'bg-gray-100 text-gray-400'}`}>
              {depositStatusLabel[booking.deposit_status] || booking.deposit_status}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 space-y-1">
            <p>📌 เงินมัดจำจะถูกคืนภายใน 3-5 วันทำการหลังคืนสินค้า</p>
            <p>📌 หากสินค้าเสียหายจะหักจากเงินมัดจำก่อน</p>
            <p>📌 ค่าประกันไม่คืนในทุกกรณี</p>
          </div>
        </div>

        {/* ปุ่มผู้เช่า */}
        {!isOwner && (
          <div className="space-y-3">
            {booking.deposit_status === 'pending' && (
              <button onClick={handlePayDeposit} disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50">
                {loading ? 'กำลังดำเนินการ...' : `ชำระมัดจำ ฿${((booking.deposit_amount || 0) + (booking.insurance_amount || 0)).toLocaleString()}`}
              </button>
            )}
          </div>
        )}

        {/* ปุ่มเจ้าของ */}
        {isOwner && (
          <div className="space-y-4">
            {booking.deposit_status === 'paid' && !booking.deposit_returned && (
              <>
                <button onClick={handleReturnDeposit} disabled={loading}
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50">
                  {loading ? 'กำลังดำเนินการ...' : 'คืนเงินมัดจำ'}
                </button>

                <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                  <h3 className="font-semibold text-gray-800">รายงานความเสียหาย</h3>
                  <textarea
                    value={damageReport}
                    onChange={(e) => setDamageReport(e.target.value)}
                    rows={3}
                    placeholder="อธิบายความเสียหายที่เกิดขึ้น..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-400 text-gray-800 bg-white resize-none"
                  />
                  <button onClick={handleReportDamage} disabled={loading}
                    className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 disabled:opacity-50">
                    {loading ? 'กำลังส่ง...' : 'รายงานความเสียหาย'}
                  </button>
                </div>
              </>
            )}

            {booking.deposit_returned && (
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-green-600 font-medium">✅ คืนมัดจำเรียบร้อยแล้ว</p>
              </div>
            )}
          </div>
        )}

        {message && (
          <p className="text-sm text-center py-3 bg-gray-50 rounded-lg text-gray-700 mt-4">{message}</p>
        )}
      </div>
    </main>
  )
}