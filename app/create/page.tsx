'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const categories = [
  { value: 'homestay', label: '🏡 โฮมสเตย์' },
  { value: 'villa', label: '🏖️ พูลวิลล่า' },
  { value: 'hotel', label: '🏨 โรงแรม' },
  { value: 'resort', label: '🌿 รีสอร์ท' },
  { value: 'guesthouse', label: '🎒 เกสต์เฮาส์' },
  { value: 'guide', label: '🗺️ ไกด์ท้องถิ่น' },
]

const ACCOMMODATION_AMENITIES = [
  'WiFi', 'เครื่องปรับอากาศ', 'สระว่ายน้ำ', 'ที่จอดรถ', 'ครัว',
  'อาหารเช้า', 'เครื่องซักผ้า', 'ทีวี', 'ตู้เย็น', 'เครื่องทำน้ำอุ่น',
  'ระเบียง', 'วิวทะเล', 'วิวภูเขา', 'ริมแม่น้ำ', 'สัตว์เลี้ยงได้',
]

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-400 text-gray-800 bg-white"
const selectClass = inputClass

export default function CreateListing() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price_per_day: '',
    location: '',
    min_stay_days: '',
    max_guests: '',
    bedrooms: '',
    bathrooms: '',
  })
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // ✅ เช็ค login ตั้งแต่โหลดหน้า
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth?next=/create'
        return
      }
      setUser(user)
      setAuthLoading(false)
    }
    checkAuth()
  }, [])

  if (authLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-400">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    </div>
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const updated = { ...form, [e.target.name]: e.target.value }
    if (e.target.name === 'category') setSelectedAmenities([])
    setForm(updated)
  }

  const toggleAmenity = (item: string) => {
    setSelectedAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const isGuide = form.category === 'guide'
  const isAccommodation = !!form.category && !isGuide

  const handleSubmit = async () => {
    if (!form.title || !form.category) {
      setMessage('❌ กรุณากรอกชื่อประกาศและเลือกหมวดหมู่')
      return
    }
    if (!form.price_per_day) {
      setMessage(isGuide ? '❌ กรุณากรอกราคา/วัน' : '❌ กรุณากรอกราคา/คืน')
      return
    }

    setLoading(true)
    setMessage('')

    const imageUrls: string[] = []
    for (const image of images) {
      const ext = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, image, { upsert: true })
      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(data.path)
        imageUrls.push(urlData.publicUrl)
      }
    }

    const details: Record<string, any> = {}
    if (selectedAmenities.length > 0) details.amenities = selectedAmenities
    if (isAccommodation) {
      if (form.bedrooms) details.bedrooms = Number(form.bedrooms)
      if (form.bathrooms) details.bathrooms = Number(form.bathrooms)
    }

    const { error } = await supabase.from('listings').insert([{
      title: form.title,
      description: form.description,
      category: form.category,
      price_per_day: form.price_per_day ? Number(form.price_per_day) : null,
      price_per_month: null,
      rental_type: 'daily',
      min_stay_days: form.min_stay_days ? Number(form.min_stay_days) : null,
      max_guests: form.max_guests ? Number(form.max_guests) : null,
      location: form.location,
      is_available: true,
      owner_id: user.id,
      images: imageUrls,
      details: Object.keys(details).length > 0 ? details : null,
    }])

    if (error) setMessage('❌ ' + error.message)
    else {
      setMessage('✅ ลงประกาศสำเร็จแล้ว!')
      setTimeout(() => window.location.href = '/dashboard', 1500)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <a href="/dashboard" className="text-gray-600 hover:text-orange-500 text-sm">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ลงประกาศที่พัก</h2>
        <p className="text-gray-400 mb-8">กรอกข้อมูลที่พักหรือบริการไกด์ของคุณ</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              ชื่อประกาศ <span className="text-red-400">*</span>
            </label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="เช่น พูลวิลล่าเชียงใหม่ วิวดอย, โฮมสเตย์ริมเล"
              className={inputClass}/>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              หมวดหมู่ <span className="text-red-400">*</span>
            </label>
            <select name="category" value={form.category} onChange={handleChange} className={selectClass}>
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {isAccommodation && (
            <div className="bg-orange-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-orange-600">🏡 ข้อมูลที่พัก</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ราคา/คืน (฿) *</label>
                  <input name="price_per_day" type="number" value={form.price_per_day} onChange={handleChange} placeholder="1500" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">พักขั้นต่ำ (คืน)</label>
                  <input name="min_stay_days" type="number" value={form.min_stay_days} onChange={handleChange} placeholder="1" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">รองรับสูงสุด (คน)</label>
                  <input name="max_guests" type="number" value={form.max_guests} onChange={handleChange} placeholder="2" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ห้องนอน</label>
                  <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} placeholder="1" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ห้องน้ำ</label>
                  <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} placeholder="1" className={inputClass}/>
                </div>
              </div>
            </div>
          )}

          {isGuide && (
            <div className="bg-orange-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-orange-600">🗺️ ข้อมูลบริการไกด์</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ราคา/วัน (฿) *</label>
                  <input name="price_per_day" type="number" value={form.price_per_day} onChange={handleChange} placeholder="1200" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">รับสูงสุด (คน)</label>
                  <input name="max_guests" type="number" value={form.max_guests} onChange={handleChange} placeholder="4" className={inputClass}/>
                </div>
              </div>
            </div>
          )}

          {isAccommodation && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">✨ สิ่งอำนวยความสะดวก</label>
              <div className="flex flex-wrap gap-2">
                {ACCOMMODATION_AMENITIES.map((item) => (
                  <button key={item} type="button" onClick={() => toggleAmenity(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedAmenities.includes(item)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                    }`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รายละเอียดเพิ่มเติม</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={4} placeholder="อธิบายที่พัก จุดเด่น สิ่งที่นักท่องเที่ยวจะได้รับ..."
              className={inputClass + " resize-none"}/>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">จังหวัด / สถานที่</label>
            <input name="location" value={form.location} onChange={handleChange}
              placeholder="เชียงใหม่, ภูเก็ต, กรุงเทพฯ..." className={inputClass}/>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              รูปภาพ <span className="text-gray-400 font-normal">(สูงสุด 5 รูป)</span>
            </label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white"/>
            {previews.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {previews.map((url, i) => (
                  <img key={i} src={url} alt={`preview ${i+1}`}
                    className="rounded-lg w-full h-28 object-cover border border-gray-200"/>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center mt-2">
                <p className="text-3xl mb-2">📷</p>
                <p className="text-sm text-gray-400">คลิกเพื่ออัปโหลดรูปภาพ</p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG ขนาดไม่เกิน 50MB</p>
              </div>
            )}
          </div>

          {message && (
            <p className="text-sm text-center py-3 px-4 bg-gray-50 rounded-lg text-gray-700">{message}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-all">
            {loading ? 'กำลังอัปโหลด...' : 'ลงประกาศ'}
          </button>

          <a href="/dashboard" className="block text-center text-sm text-gray-400 hover:text-orange-500">
            ← กลับ Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}
