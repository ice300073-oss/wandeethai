'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ListingDetail({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [currentImage, setCurrentImage] = useState(0)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [viewCount, setViewCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()
      setListing(data)

      // นับ views
      const { count } = await supabase
        .from('listing_views')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', params.id)
      setViewCount(count || 0)

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', params.id)
        .order('created_at', { ascending: false })
      setReviews(reviewData || [])

      if (reviewData && reviewData.length > 0) {
        const avg = reviewData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewData.length
        setAvgRating(Math.round(avg * 10) / 10)
      }

      // ดึง comments
      const { data: commentData } = await supabase
        .from('comments')
        .select('*, profiles(full_name)')
        .eq('listing_id', params.id)
        .order('created_at', { ascending: true })
      setComments(commentData || [])

      setLoading(false)
    }
    fetchData()

    // Realtime comments
    const channel = supabase
      .channel('comments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `listing_id=eq.${params.id}`,
      }, (payload) => {
        setComments((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id])

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return
    setCommentLoading(true)
    await supabase.from('comments').insert([{
      listing_id: params.id,
      user_id: user.id,
      content: newComment.trim(),
    }])
    setNewComment('')
    setCommentLoading(false)
  }

  const categoryLabel: Record<string, string> = {
    house: '🏠 บ้าน / คอนโด / ห้อง',
    villa: '🏖️ พูลวิลล่า / รีสอร์ท',
    office: '🏢 ออฟฟิศ / พื้นที่ทำงาน',
    car: '🚗 รถยนต์ / มอเตอร์ไซค์',
    equipment: '🔧 อุปกรณ์ / เครื่องมือ',
    fashion: '👗 เสื้อผ้า / แฟชั่น',
  }

  const rentalTypeLabel: Record<string, string> = {
    daily: 'รายวัน / รายคืน',
    monthly: 'รายเดือน',
    yearly: 'รายปี',
  }

  const getPriceDisplay = () => {
    if (!listing) return null
    if (listing.category === 'villa') {
      return (
        <div className="bg-orange-50 rounded-xl p-4 mb-4">
          <p className="text-3xl font-bold text-orange-500">
            ฿{listing.price_per_day?.toLocaleString()}
            <span className="text-lg font-normal text-gray-400"> / คืน</span>
          </p>
          {listing.min_stay_days && (
            <p className="text-sm text-gray-500 mt-1">พักขั้นต่ำ {listing.min_stay_days} คืน</p>
          )}
        </div>
      )
    }
    if (listing.category === 'house' || listing.category === 'office') {
      return (
        <div className="bg-orange-50 rounded-xl p-4 mb-4">
          <p className="text-3xl font-bold text-orange-500">
            ฿{listing.price_per_month?.toLocaleString()}
            <span className="text-lg font-normal text-gray-400"> / เดือน</span>
          </p>
          {listing.rental_type && (
            <p className="text-sm text-gray-500 mt-1">สัญญา{rentalTypeLabel[listing.rental_type]}</p>
          )}
        </div>
      )
    }
    return (
      <div className="bg-orange-50 rounded-xl p-4 mb-4">
        <p className="text-3xl font-bold text-orange-500">
          ฿{listing.price_per_day?.toLocaleString()}
          <span className="text-lg font-normal text-gray-400"> / วัน</span>
        </p>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">ไม่พบประกาศนี้</p>
    </div>
  )

  const images = listing.images || []

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href="/" className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าหลัก</a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* รูปภาพ */}
          <div>
            {images.length > 0 ? (
              <div>
                <img src={images[currentImage]} alt={listing.title}
                  className="w-full h-80 object-cover rounded-2xl mb-3"/>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((img: string, i: number) => (
                      <img key={i} src={img} alt={`${i+1}`}
                        onClick={() => setCurrentImage(i)}
                        className={`w-16 h-16 object-cover rounded-lg cursor-pointer flex-shrink-0 border-2 transition-all ${
                          currentImage === i ? 'border-orange-500' : 'border-transparent'
                        }`}/>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-200 rounded-2xl h-80 flex items-center justify-center text-gray-400 text-5xl">
                📷
              </div>
            )}
          </div>

          {/* รายละเอียด */}
          <div>
            <p className="text-sm text-orange-500 mb-2">{categoryLabel[listing.category] || listing.category}</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h1>

            {listing.location && (
              <p className="text-gray-400 text-sm mb-3">📍 {listing.location}</p>
            )}

            <div className="flex items-center gap-3 mb-3">
              {reviews.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold text-gray-800">{avgRating}</span>
                  <span className="text-gray-400 text-sm">({reviews.length} รีวิว)</span>
                </div>
              )}
              <span className="text-gray-400 text-sm">👁 {viewCount} ครั้ง</span>
            </div>

            {getPriceDisplay()}

            {listing.category === 'villa' && (listing.max_guests || listing.min_stay_days) && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {listing.max_guests && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl">👥</p>
                    <p className="text-sm font-medium text-gray-800">{listing.max_guests} คน</p>
                    <p className="text-xs text-gray-400">รองรับสูงสุด</p>
                  </div>
                )}
                {listing.min_stay_days && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl">🌙</p>
                    <p className="text-sm font-medium text-gray-800">{listing.min_stay_days} คืน</p>
                    <p className="text-xs text-gray-400">พักขั้นต่ำ</p>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">รายละเอียด</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {listing.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </p>
            </div>

            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${listing.is_available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'}`}>
                {listing.is_available ? '✓ ว่างให้เช่า' : '✗ ไม่ว่าง'}
              </span>
            </div>

            {listing.is_available && (
              <div className="space-y-3">
                {user ? (
                  <>
                    <a href={`/booking/${listing.id}`}
                      className="block w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-all text-center">
                      จองเลย
                    </a>
                    <a href={`/chat/${listing.id}`}
                      className="block w-full border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-all text-center">
                      💬 ติดต่อผู้ให้เช่า
                    </a>
                  </>
                ) : (
                  <a href="/auth"
                    className="block w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-all text-center">
                    เข้าสู่ระบบเพื่อจอง
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            💬 ความคิดเห็น ({comments.length})
          </h3>

          {user ? (
            <div className="flex gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold flex-shrink-0">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="แสดงความคิดเห็น..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 text-gray-800 bg-white"
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading || !newComment.trim()}
                  className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-orange-600 disabled:opacity-50">
                  ส่ง
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-gray-500 text-sm">
                <a href="/auth" className="text-orange-500 hover:underline">เข้าสู่ระบบ</a> เพื่อแสดงความคิดเห็น
              </p>
            </div>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น!</p>
            ) : (
              comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium flex-shrink-0">
                    {comment.profiles?.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        {comment.profiles?.full_name || 'ผู้ใช้งาน'}
                      </p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-2">
                      {new Date(comment.created_at).toLocaleDateString('th-TH', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* รีวิว */}
        {reviews.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-6">รีวิวจากผู้เช่า ({reviews.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}