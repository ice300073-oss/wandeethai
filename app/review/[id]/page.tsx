'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReviewPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [reviews, setReviews] = useState<any[]>([])

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
      setBooking(bookingData)

      if (bookingData) {
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('listing_id', bookingData.listing_id)
        setReviews(reviewData || [])
      }
    }
    fetchData()
  }, [params.id])

  const handleSubmit = async () => {
    if (!comment) {
      setMessage('❌ กรุณาเขียนรีวิวก่อน')
      return
    }
    setLoading(true)

    const { error } = await supabase.from('reviews').insert([{
      listing_id: booking.listing_id,
      reviewer_id: user.id,
      booking_id: params.id,
      rating,
      comment,
    }])

    if (error) setMessage('❌ ' + error.message)
    else {
      setMessage('✅ รีวิวสำเร็จ! ขอบคุณที่ช่วยให้ข้อมูล')
      setTimeout(() => window.location.href = '/', 2000)
    }
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
        <a href="/dashboard" className="text-gray-600 hover:text-orange-500 text-sm">← Dashboard</a>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">รีวิวการเข้าพัก</h2>
        <p className="text-gray-400 mb-8">แชร์ประสบการณ์ให้คนอื่นได้รู้</p>

        {/* รายละเอียดสินค้า */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-800">{booking.listings?.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{booking.start_date} → {booking.end_date}</p>
          <p className="text-orange-500 font-bold mt-1">฿{booking.total_price?.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">

          {/* ให้ดาว */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">ให้คะแนน</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}
                  className={`text-3xl transition-all ${star <= rating ? 'opacity-100' : 'opacity-30'}`}>
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {rating === 1 ? 'แย่มาก' : rating === 2 ? 'พอใช้' : rating === 3 ? 'ปานกลาง' : rating === 4 ? 'ดี' : 'ดีมาก'}
            </p>
          </div>

          {/* เขียนรีวิว */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">เขียนรีวิว</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="เล่าประสบการณ์การเข้าพัก ความสะอาด การต้อนรับของเจ้าของที่พัก..."
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-400 text-gray-800 bg-white resize-none"
            />
          </div>

          {message && (
            <p className="text-sm text-center py-3 bg-gray-50 rounded-lg text-gray-700">{message}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
            {loading ? 'กำลังส่งรีวิว...' : 'ส่งรีวิว'}
          </button>
        </div>

        {/* รีวิวก่อนหน้า */}
        {reviews.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-gray-800 mb-4">รีวิวทั้งหมด ({reviews.length})</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                    <span className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString('th-TH')}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}