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

export default function EditListing({ params }: { params: { id: string } }) {
  const [authChecked, setAuthChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [form, setForm] = useState<any>({
    title: '', description: '', category: '', price_per_day: '',
    location: '', min_stay_days: '', max_guests: '', bedrooms: '', bathrooms: '',
    is_available: true,
  })
  const [amenities, setAmenities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = `/auth?next=/edit/${params.id}`; return }
      const { data: l } = await supabase.from('listings').select('*').eq('id', params.id).single()
      if (!l || l.owner_id !== user.id) {
        setAuthChecked(true); setAllowed(false); return
      }
      const d = l.details || {}
      setForm({
        title: l.title || '', description: l.description || '', category: l.category || '',
        price_per_day: l.price_per_day ?? '', location: l.location || '',
        min_stay_days: l.min_stay_days ?? '', max_guests: l.max_guests ?? '',
        bedrooms: d.bedrooms ?? '', bathrooms: d.bathrooms ?? '',
        is_available: l.is_available,
      })
      setAmenities(d.amenities || [])
      setAllowed(true); setAuthChecked(true)
    }
    load()
  }, [params.id])

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })
  const toggleAmenity = (item: string) =>
    setAmenities(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item])

  const isGuide = form.category === 'guide'

  const handleSave = async () => {
    if (!form.title || !form.price_per_day) {
      setMessage('❌ กรุณากรอกชื่อและราคา'); return
    }
    setLoading(true)
    const details: Record<string, any> = {}
    if (amenities.length > 0) details.amenities = amenities
    if (!isGuide) {
      if (form.bedrooms) details.bedrooms = Number(form.bedrooms)
      if (form.bathrooms) details.bathrooms = Number(form.bathrooms)
    }
    const { error } = await supabase.from('listings').update({
      title: form.title,
      description: form.description,
      category: form.category,
      price_per_day: form.price_per_day ? Number(form.price_per_day) : null,
      location: form.location,
      min_stay_days: form.min_stay_days ? Number(form.min_stay_days) : null,
      max_guests: form.max_guests ? Number(form.max_guests) : null,
      is_available: form.is_available,
      details: Object.keys(details).length > 0 ? details : null,
    }).eq('id', params.id)
    if (error) setMessage('❌ ' + error.message)
    else {
      setMessage('✅ บันทึกการแก้ไขแล้ว!')
      setTimeout(() => window.location.href = '/dashboard', 1200)
    }
    setLoading(false)
  }

  if (!authChecked) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )
  if (!allowed) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">ไม่มีสิทธิ์แก้ไขประกาศนี้</p>
        <a href="/dashboard" className="text-orange-500 hover:underline">← กลับ Dashboard</a>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href="/dashboard" className="text-gray-600 hover:text-orange-500 text-sm">← Dashboard</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">แก้ไขประกาศ</h2>
        <p className="text-gray-400 mb-8">อัปเดตข้อมูลที่พักของคุณ</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อประกาศ <span className="text-red-400">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} className={inputClass}/>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">หมวดหมู่</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{isGuide ? 'ราคา/วัน (฿) *' : 'ราคา/คืน (฿) *'}</label>
              <input name="price_per_day" type="number" value={form.price_per_day} onChange={handleChange} className={inputClass}/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">รองรับสูงสุด (คน)</label>
              <input name="max_guests" type="number" value={form.max_guests} onChange={handleChange} className={inputClass}/>
            </div>
            {!isGuide && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">พักขั้นต่ำ (คืน)</label>
                  <input name="min_stay_days" type="number" value={form.min_stay_days} onChange={handleChange} className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ห้องนอน</label>
                  <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ห้องน้ำ</label>
                  <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} className={inputClass}/>
                </div>
              </>
            )}
          </div>

          {!isGuide && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">✨ สิ่งอำนวยความสะดวก</label>
              <div className="flex flex-wrap gap-2">
                {ACCOMMODATION_AMENITIES.map(item => (
                  <button key={item} type="button" onClick={() => toggleAmenity(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      amenities.includes(item) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                    }`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รายละเอียด</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={inputClass + ' resize-none'}/>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">จังหวัด / สถานที่</label>
            <input name="location" value={form.location} onChange={handleChange} className={inputClass}/>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
              className="w-4 h-4 accent-orange-500"/>
            เปิดให้จอง (เอาออกหากต้องการปิดชั่วคราว)
          </label>

          <p className="text-xs text-gray-400">หมายเหตุ: การแก้รูปภาพยังต้องลบประกาศแล้วลงใหม่ (จะเพิ่มให้ภายหลัง)</p>

          {message && <p className="text-sm text-center py-3 px-4 bg-gray-50 rounded-lg text-gray-700">{message}</p>}

          <button onClick={handleSave} disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-all">
            {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </button>
          <a href="/dashboard" className="block text-center text-sm text-gray-400 hover:text-orange-500">← กลับ Dashboard</a>
        </div>
      </div>
    </main>
  )
}
