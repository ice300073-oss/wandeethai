'use client'
import SiteName from '@/components/SiteName'

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
  const [payChoice, setPayChoice] = useState<'deposit' | 'full'>('full')

  // เบอร์ PromptPay สำรอง (ถ้าเจ้าของยังไม่ได้ตั้ง) — เงินจะพยายามเข้าเจ้าของที่พักก่อนเสมอ
  const FALLBACK_PROMPTPAY = process.env.NEXT_PUBLIC_PROMPTPAY_NUMBER || '0991966336'
  const [payTo, setPayTo] = useState<string>(FALLBACK_PROMPTPAY)
  const [ownerQrImage, setOwnerQrImage] = useState<string>('')

  const total = booking?.total_price || 0
  const alreadyPaid = booking?.amount_paid || 0
  const deposit = Math.round(total * 0.5)
  // ถ้าจ่ายมัดจำมาแล้ว (จ่ายบางส่วน) → เข้าโหมด "จ่ายส่วนที่เหลือ"
  const isBalanceMode = alreadyPaid > 0 && alreadyPaid < total
  const payNow = isBalanceMode
    ? total - alreadyPaid
    : (payChoice === 'deposit' ? deposit : total)

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

        // ดึง PromptPay / รูป QR ของเจ้าของที่พักรายนี้ (เงินเข้าเจ้าของตรงๆ)
        let number = FALLBACK_PROMPTPAY
        const ownerId = bookingData.listings?.owner_id
        if (ownerId) {
          const { data: owner } = await supabase
            .from('profiles').select('promptpay, qr_image_url').eq('id', ownerId).single()
          if (owner?.promptpay) number = owner.promptpay
          if (owner?.qr_image_url) setOwnerQrImage(owner.qr_image_url)
        }
        setPayTo(number)
      }
    }
    fetchData()
  }, [params.id])

  // สร้าง QR PromptPay ใหม่ทุกครั้งที่ยอด (มัดจำ/เต็ม/ส่วนที่เหลือ) เปลี่ยน — ยกเว้นเจ้าของอัปโหลดรูป QR เอง
  useEffect(() => {
    if (ownerQrImage || !payNow || !payTo) return
    let cancelled = false
    ;(async () => {
      const payload = generatePayload(payTo, { amount: payNow })
      const qr = await QRCode.toDataURL(payload, {
        width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' },
      })
      if (!cancelled) setQrCode(qr)
    })()
    return () => { cancelled = true }
  }, [payNow, payTo, ownerQrImage])

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

    // จ่ายครั้งแรก → บันทึกประเภท + ยอด + เปลี่ยนสถานะเป็น paid
    // จ่ายส่วนที่เหลือ → อัปยอดเป็นเต็มจำนวน (ไม่แตะสถานะเดิม)
    const update: any = isBalanceMode
      ? { amount_paid: total, ...(slipUrl && { slip_url: slipUrl }) }
      : { amount_paid: payNow, payment_type: payChoice, status: 'paid', ...(slipUrl && { slip_url: slipUrl }) }

    const { error } = await supabase.from('bookings').update(update).eq('id', params.id)

    if (error) {
      setMessage('❌ เกิดข้อผิดพลาด: ' + error.message)
      setLoading(false)
      return
    }

    setMessage(isBalanceMode
      ? '✅ จ่ายส่วนที่เหลือสำเร็จ!'
      : payChoice === 'deposit'
        ? '✅ จ่ายมัดจำสำเร็จ! รอการยืนยันจากเจ้าของ'
        : '✅ ชำระเงินสำเร็จ! รอการยืนยันจากเจ้าของ')
    setTimeout(() => window.location.href = '/tickets', 2000)
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
        <a href="/" className="text-2xl font-bold text-orange-500"><SiteName /></a>
        <a href="/tickets" className="text-gray-600 hover:text-orange-500 text-sm">← กลับ</a>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isBalanceMode ? 'จ่ายส่วนที่เหลือ' : 'ชำระเงิน'}
        </h2>
        <p className="text-gray-400 mb-6">
          {isBalanceMode ? 'ชำระยอดคงเหลือของการจอง' : 'เลือกยอดและวิธีชำระเงิน'}
        </p>

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">สรุปการจอง</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ที่พัก</span>
              <span className="text-gray-800">{listing?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">เข้าพัก</span>
              <span className="text-gray-800">{booking.start_date} → {booking.end_date}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-500">ราคารวมทั้งหมด</span>
              <span className="text-gray-800">฿{total.toLocaleString()}</span>
            </div>
            {isBalanceMode && (
              <div className="flex justify-between text-green-600">
                <span>จ่ายมัดจำแล้ว</span>
                <span>− ฿{alreadyPaid.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold text-gray-800">ยอดที่ต้องจ่ายตอนนี้</span>
              <span className="font-bold text-orange-500 text-lg">฿{payNow.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* เลือกจ่ายมัดจำ / เต็มจำนวน (เฉพาะการจ่ายครั้งแรก) */}
        {!isBalanceMode && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setPayChoice('deposit')}
              className={`rounded-xl border-2 p-4 text-left transition-all ${payChoice === 'deposit' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
              <p className={`font-semibold text-sm ${payChoice === 'deposit' ? 'text-orange-600' : 'text-gray-700'}`}>จ่ายมัดจำ 50%</p>
              <p className="text-lg font-bold text-gray-800 mt-1">฿{deposit.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">เหลือ ฿{(total - deposit).toLocaleString()} จ่ายทีหลัง</p>
            </button>
            <button
              onClick={() => setPayChoice('full')}
              className={`rounded-xl border-2 p-4 text-left transition-all ${payChoice === 'full' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
              <p className={`font-semibold text-sm ${payChoice === 'full' ? 'text-orange-600' : 'text-gray-700'}`}>จ่ายเต็มจำนวน</p>
              <p className="text-lg font-bold text-gray-800 mt-1">฿{total.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">จ่ายครบจบในครั้งเดียว</p>
            </button>
          </div>
        )}

        {payChoice === 'deposit' && !isBalanceMode && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
            💡 ส่วนที่เหลือ ฿{(total - deposit).toLocaleString()} จ่ายเพิ่มออนไลน์ทีหลัง หรือจ่ายกับเจ้าของตอนเช็คอินก็ได้
          </p>
        )}

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
                <p className="text-sm text-gray-500 mb-3">สแกน QR เพื่อชำระเงิน</p>
                <div className="bg-gray-50 rounded-xl p-6 inline-block mb-3">
                  {ownerQrImage ? (
                    <img src={ownerQrImage} alt="QR รับเงิน" className="w-48 h-48 object-contain mx-auto mb-3 bg-white rounded-lg"/>
                  ) : qrCode ? (
                    <img src={qrCode} alt="PromptPay QR" className="w-48 h-48 mx-auto mb-3"/>
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <p className="text-xs text-gray-400">กำลังสร้าง QR...</p>
                    </div>
                  )}
                  {!ownerQrImage && <p className="font-bold text-gray-800 text-lg">{payTo}</p>}
                  {ownerQrImage && <p className="text-xs text-gray-400">โอนตามยอดด้านล่าง</p>}
                  <p className="text-orange-500 font-bold text-xl">฿{payNow.toLocaleString()}</p>
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
                {loading ? 'กำลังดำเนินการ...' : `ยืนยันการชำระเงิน ฿${payNow.toLocaleString()}`}
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
                    <span className="font-bold text-orange-500 text-lg">฿{payNow.toLocaleString()}</span>
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
                {loading ? 'กำลังดำเนินการ...' : `ยืนยันการชำระเงิน ฿${payNow.toLocaleString()}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
