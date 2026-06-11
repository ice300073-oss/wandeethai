'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// สร้าง set ของวันที่ถูกจองทั้งหมด
function getBlockedDates(bookedRanges: {start: string, end: string}[]): Set<string> {
  const blocked = new Set<string>()
  for (const range of bookedRanges) {
    const start = new Date(range.start)
    const end = new Date(range.end)
    const cur = new Date(start)
    while (cur <= end) {
      blocked.add(cur.toISOString().split('T')[0])
      cur.setDate(cur.getDate() + 1)
    }
  }
  return blocked
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function Calendar({
  year, month, blockedDates, startDate, endDate, onSelect, today
}: {
  year: number
  month: number
  blockedDates: Set<string>
  startDate: string
  endDate: string
  onSelect: (date: string) => void
  today: string
}) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS_TH.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i}/>
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isBlocked = blockedDates.has(dateStr)
          const isPast = dateStr < today
          const isDisabled = isBlocked || isPast
          const isStart = dateStr === startDate
          const isEnd = dateStr === endDate
          const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate
          const isToday = dateStr === today

          let cellClass = 'w-full aspect-square flex items-center justify-center text-sm rounded-full transition-all '

          if (isDisabled) {
            cellClass += isBlocked
              ? 'bg-red-100 text-red-300 cursor-not-allowed line-through'
              : 'text-gray-300 cursor-not-allowed'
          } else if (isStart || isEnd) {
            cellClass += 'bg-orange-500 text-white font-bold cursor-pointer'
          } else if (isInRange) {
            cellClass += 'bg-orange-100 text-orange-600 cursor-pointer rounded-none'
          } else {
            cellClass += 'hover:bg-orange-50 text-gray-700 cursor-pointer'
            if (isToday) cellClass += ' font-bold border border-orange-400'
          }

          return (
            <button
              key={i}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelect(dateStr)}
              className={cellClass}
              title={isBlocked ? 'วันนี้ถูกจองแล้ว' : undefined}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function BookingPage({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [totalDays, setTotalDays] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [bookedDates, setBookedDates] = useState<{start: string, end: string}[]>([])
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())

  const today = formatDate(new Date())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) { window.location.href = `/auth?next=/booking/${params.id}`; return }

      const { data } = await supabase.from('listings').select('*').eq('id', params.id).single()
      setListing(data)

      const { data: bookings } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .eq('listing_id', params.id)
        .in('status', ['pending', 'confirmed'])

      const ranges = (bookings || []).map(b => ({ start: b.start_date, end: b.end_date }))
      setBookedDates(ranges)
      setBlockedDates(getBlockedDates(ranges))
    }
    fetchData()
  }, [params.id])

  useEffect(() => {
    if (startDate && endDate && listing) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      if (days > 0) {
        setTotalDays(days)
        setTotalPrice(days * listing.price_per_day)
      } else {
        setTotalDays(0)
        setTotalPrice(0)
      }
    }
  }, [startDate, endDate, listing])

  // ตรวจสอบว่าในช่วงที่เลือกมีวันที่ blocked ไหม
  const hasBlockedInRange = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    const cur = new Date(s)
    while (cur <= e) {
      if (blockedDates.has(formatDate(cur))) return true
      cur.setDate(cur.getDate() + 1)
    }
    return false
  }

  const handleSelectDate = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      // เริ่มเลือกใหม่
      setStartDate(dateStr)
      setEndDate('')
      setTotalDays(0)
      setTotalPrice(0)
    } else {
      // เลือก end date
      if (dateStr <= startDate) {
        setStartDate(dateStr)
        setEndDate('')
        return
      }
      if (hasBlockedInRange(startDate, dateStr)) {
        setMessage('❌ มีวันที่ถูกจองอยู่ในช่วงที่เลือก กรุณาเลือกใหม่')
        setStartDate(dateStr)
        setEndDate('')
        return
      }
      setMessage('')
      setEndDate(dateStr)
    }
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const handleBooking = async () => {
    if (!startDate || !endDate) { setMessage('❌ กรุณาเลือกวันเช็คอินและเช็คเอาท์'); return }
    if (totalDays <= 0) { setMessage('❌ วันเช็คเอาท์ต้องมากกว่าวันเช็คอิน'); return }

    setLoading(true)
    setMessage('⏳ กำลังตรวจสอบและจอง...')

    // Double-check
    const { data: recheck } = await supabase
      .from('bookings')
      .select('id')
      .eq('listing_id', params.id)
      .in('status', ['pending', 'confirmed'])
      .gte('end_date', startDate)
      .lte('start_date', endDate)

    if (recheck && recheck.length > 0) {
      setMessage('❌ ช่วงวันที่นี้เพิ่งถูกจองไป กรุณาเลือกวันอื่น')
      setLoading(false)
      return
    }

    const { data: bookingData, error } = await supabase.from('bookings').insert([{
      listing_id: params.id,
      renter_id: user.id,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      status: 'pending',
    }]).select()

    if (error) {
      setMessage('❌ ' + error.message)
    } else {
      setMessage('✅ จองสำเร็จ! กำลังไปหน้าชำระเงิน...')
      setTimeout(() => window.location.href = `/payment/${bookingData[0].id}`, 1500)
    }
    setLoading(false)
  }

  if (!listing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href={`/listings/${params.id}`} className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าประกาศ</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">จองสินค้า</h2>
        <p className="text-gray-400 mb-6">เลือกวันที่ต้องการเช่าบนปฏิทิน</p>

        {/* Listing card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 flex gap-4">
          <div className="bg-gray-200 rounded-lg w-20 h-20 flex items-center justify-center text-gray-400 flex-shrink-0 text-2xl">
            📷
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{listing.title}</h3>
            {listing.location && <p className="text-sm text-gray-400 mt-1">📍 {listing.location}</p>}
            <p className="text-orange-500 font-bold mt-1">฿{listing.price_per_day?.toLocaleString()} / วัน</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">
              ‹
            </button>
            <h3 className="font-semibold text-gray-800">
              {MONTHS_TH[calMonth]} {calYear + 543}
            </h3>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">
              ›
            </button>
          </div>

          <Calendar
            year={calYear}
            month={calMonth}
            blockedDates={blockedDates}
            startDate={startDate}
            endDate={endDate}
            onSelect={handleSelectDate}
            today={today}
          />

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-orange-500"/>
              <span>วันที่เลือก</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-orange-100"/>
              <span>ช่วงที่เลือก</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-100"/>
              <span>ถูกจองแล้ว</span>
            </div>
          </div>
        </div>

        {/* Selected dates summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">เช็คอิน</p>
              <p className="font-semibold text-gray-800">
                {startDate ? new Date(startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">เช็คเอาท์</p>
              <p className="font-semibold text-gray-800">
                {endDate ? new Date(endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          {!startDate && (
            <p className="text-sm text-center text-gray-400">👆 กดวันเช็คอินบนปฏิทิน</p>
          )}
          {startDate && !endDate && (
            <p className="text-sm text-center text-orange-500">👆 กดวันเช็คเอาท์บนปฏิทิน</p>
          )}

          {totalDays > 0 && (
            <div className="bg-orange-50 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-gray-800">สรุปการจอง</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ราคาต่อวัน</span>
                <span className="text-gray-800">฿{listing.price_per_day?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">จำนวนวัน</span>
                <span className="text-gray-800">{totalDays} วัน</span>
              </div>
              <div className="border-t border-orange-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-800">ราคารวม</span>
                <span className="font-bold text-orange-500 text-lg">฿{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {message && (
            <p className="text-sm text-center py-3 px-4 bg-gray-50 rounded-lg text-gray-700">{message}</p>
          )}

          <button
            onClick={handleBooking}
            disabled={loading || totalDays <= 0}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-all">
            {loading ? 'กำลังจอง...' : totalDays > 0 ? `ยืนยันการจอง ฿${totalPrice.toLocaleString()}` : 'เลือกวันที่ก่อนจอง'}
          </button>

          <a href={`/listings/${params.id}`} className="block text-center text-sm text-gray-400 hover:text-orange-500">
            ← ยกเลิก
          </a>
        </div>
      </div>
    </main>
  )
}