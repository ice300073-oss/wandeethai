'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [method, setMethod] = useState<'promptpay' | 'bank'>('promptpay')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [slip, setSlip] = useState<string | null>(null)
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [qrCode, setQrCode] = useState<string>('')

  // เบอร์ PromptPay สำรอง (ถ้าเจ้าของยังไม่ได้ตั้ง) — เงินจะพยายามเข้าเจ้าของที่พักก่อนเสมอ
  const FALLBACK_PROMPTPAY = process.env.NEXT_PUBLIC_PROMPTPAY_NUMBER || '0991966336'
  const [payTo, setPayTo] = useState<string>(FALLBACK_PROMPTPAY)

  useEffect(() => {
    const fetchData = async () => {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, listings(*)')
        .eq('id', params.id)
        .single()
      if (bookingData) {
        setBooking(bookingData)
        setListing(bookingData.listings)

        // ดึง PromptPay ของเจ้าของที่พักรายนี้ (เงินเข้าเจ้าของตรงๆ)
        let number = FALLBACK_PROMPTPAY
        const ownerId = bookingData.listings?.owner_id
        if (ownerId) {
          const { data: owner } = await supabase
            .from('profiles').select('promptpay').eq('id', ownerId).single()
          if (owner?.promptpay) number = owner.promptpay
        }
        setPayTo(number)

        // สร้าง QR จริง
        const amount = bookingData.total_price
        const payload = generatePayload(number, { amount })
        const qr = await QRCode.toDataURL(payload, {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        })
        setQrCode(qr)
      }
    }
    fetchData()
  }, [params.id])

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSlipFile(file)
      const reader = new FileReader()
      reader.onload = () => setSlip(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePayment = async () => {
    if (!slipFile) { setMessage('❌ กรุณาอัปโหลดสลิปโอนเงินก่อน'); return }
    setLoading(true)
    setMessage('⏳ กำลังอัปโหลดสลิป...')

    const ext = slipFile.name.split('.').pop()
    const fileName = `${params.id}_${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('slips')
      .upload(fileName, slipFile, { upsert: true })

    let slipUrl = ''
    if (!uploadError) {
      const { data } = supabase.storage.from('slips').getPublicUrl(fileName)
      slipUrl = data.publicUrl
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'paid', ...(slipUrl && { slip_url: slipUrl }) })
      .eq('id', params.id)

    if (error) {
      setMessage('❌ เกิดข้อผิดพลาด: ' + error.message)
      setLoading(false)
      return
    }

    setMessage('✅ ชำระเงินสำเร็จ! รอการยืนยันจากเจ้าของ')
    setTimeout(() => window.location.href = '/profile', 2000)
    setLoading(false)
  }

  if (!booking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href="/profile" className="text-gray-600 hover:text-orange-500 text-sm">← กลับ</a>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ชำระเงิน</h2>
        <p className="text-gray-400 mb-8">เลือกวิธีชำระเงิน</p>

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">สรุปการจอง</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">สินค้า</span>
              <span className="text-gray-800">{listing?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">วันที่เข้าพัก</span>
              <span className="text-gray-800">{booking.start_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">วันที่คืน</span>
              <span className="text-gray-800">{booking.end_date}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold text-gray-800">ยอดชำระ</span>
              <span className="font-bold text-orange-500 text-lg">฿{booking.total_price?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMethod('promptpay')}
            className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${method === 'promptpay' ? 'border-orange-500 bg-orange-50 text-orange-500' : 'border-gray-200 text-gray-500'}`}>
            📱 PromptPay
          </button>
          <button
            onClick={() => setMethod('bank')}
            className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${method === 'bank' ? 'border-orange-500 bg-orange-50 text-orange-500' : 'border-gray-200 text-gray-500'}`}>
            🏦 โอนธนาคาร
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {method === 'promptpay' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">สแกน QR หรือโอนไปที่</p>
                <div className="bg-gray-50 rounded-xl p-6 inline-block mb-3">
                  {qrCode ? (
                    <img src={qrCode} alt="PromptPay QR" className="w-48 h-48 mx-auto mb-3"/>
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <p className="text-xs text-gray-400">กำลังสร้าง QR...</p>
                    </div>
                  )}
                  <p className="font-bold text-gray-800 text-lg">{payTo}</p>
                  <p className="text-orange-500 font-bold text-xl">฿{booking.total_price?.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">อัปโหลดสลิปโอนเงิน</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSlipUpload}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white"/>
                {slip && (
                  <img src={slip} alt="slip" className="mt-3 rounded-lg w-full max-h-48 object-cover"/>
                )}
              </div>

              {message && (
                <p className="text-sm text-center py-3 bg-gray-50 rounded-lg text-gray-700">{message}</p>
              )}

              <button
                onClick={handlePayment}
                disabled={loading || !slip}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
                {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
              </button>
            </div>
          )}

          {method === 'bank' && (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3">ข้อมูลบัญชีโอนเงิน</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ธนาคาร</span>
                    <span className="font-medium text-gray-800">กสิกรไทย (KBANK)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">เลขที่บัญชี</span>
                    <span className="font-medium text-gray-800 select-all">XXX-X-XXXXX-X</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ชื่อบัญชี</span>
                    <span className="font-medium text-gray-800">ชื่อเจ้าของบัญชี</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-500 font-medium">ยอดที่ต้องโอน</span>
                    <span className="font-bold text-orange-500 text-lg">฿{booking.total_price?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">อัปโหลดสลิปโอนเงิน</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSlipUpload}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white"/>
                {slip && (
                  <img src={slip} alt="slip" className="mt-3 rounded-lg w-full max-h-48 object-cover"/>
                )}
              </div>

              {message && (
                <p className="text-sm text-center py-3 bg-gray-50 rounded-lg text-gray-700">{message}</p>
              )}

              <button
                onClick={handlePayment}
                disabled={loading || !slipFile}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
                {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
