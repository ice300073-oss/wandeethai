'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const categories = [
  { value: 'house', label: '🏠 บ้าน / คอนโด / ห้อง' },
  { value: 'villa', label: '🏖️ พูลวิลล่า / รีสอร์ท' },
  { value: 'office', label: '🏢 ออฟฟิศ / พื้นที่ทำงาน' },
  { value: 'car', label: '🚗 รถยนต์ / มอเตอร์ไซค์' },
  { value: 'equipment', label: '🔧 อุปกรณ์ / เครื่องมือ' },
  { value: 'fashion', label: '👗 เสื้อผ้า / แฟชั่น' },
]

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-400 text-gray-800 bg-white"
const selectClass = inputClass

const VILLA_AMENITIES = [
  'สระว่ายน้ำ', 'WiFi', 'ที่จอดรถ', 'เครื่องปรับอากาศ', 'ทีวี',
  'ครัว', 'เครื่องซักผ้า', 'บาร์บีคิว', 'สวน', 'วิวทะเล',
  'วิวภูเขา', 'ริมแม่น้ำ', 'ห้องนอนรวม', 'ห้องอาหาร', 'ระเบียง',
]

const HOUSE_AMENITIES = [
  'เครื่องปรับอากาศ', 'WiFi', 'ที่จอดรถ', 'เครื่องซักผ้า',
  'ทีวี', 'ตู้เย็น', 'เฟอร์นิเจอร์', 'ห้องน้ำในตัว',
  'ระเบียง', 'สวน', 'รปภ.', 'ลิฟต์', 'ใกล้ BTS/MRT',
]

const OFFICE_AMENITIES = [
  'WiFi ความเร็วสูง', 'ห้องประชุม', 'ที่จอดรถ', 'รปภ.',
  'เครื่องปรับอากาศ', 'ห้องน้ำ', 'ครัว/พื้นที่พัก', 'ลิฟต์',
  'CCTV', 'ระบบ Access Card', 'Co-working Space', 'ใกล้ BTS/MRT',
]

export default function CreateListing() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price_per_day: '',
    price_per_month: '',
    location: '',
    rental_type: '',
    min_stay_days: '',
    max_guests: '',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    floor: '',
    car_brand: '',
    car_model: '',
    car_year: '',
    car_gear: '',
    car_seats: '',
    car_fuel: '',
    eq_brand: '',
    eq_condition: '',
    fashion_size: '',
    fashion_brand: '',
    fashion_condition: '',
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
        window.location.href = '/auth'
        return
      }
      setUser(user)
      setAuthLoading(false)
    }
    checkAuth()
  }, [])

  // Loading ระหว่างเช็ค auth
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
    if (e.target.name === 'category') {
      if (e.target.value === 'villa') updated.rental_type = 'daily'
      else if (e.target.value === 'house' || e.target.value === 'office') updated.rental_type = 'monthly'
      else updated.rental_type = 'daily'
      setSelectedAmenities([])
    }
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

  const handleSubmit = async () => {
    if (!form.title || !form.category) {
      setMessage('❌ กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }
    if (form.category === 'villa' && !form.price_per_day) {
      setMessage('❌ กรุณากรอกราคา/คืน')
      return
    }
    if ((form.category === 'house' || form.category === 'office') && !form.price_per_month) {
      setMessage('❌ กรุณากรอกราคา/เดือน')
      return
    }
    if (!['villa', 'house', 'office'].includes(form.category) && !form.price_per_day) {
      setMessage('❌ กรุณากรอกราคา/วัน')
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
    if (['villa', 'house', 'office'].includes(form.category)) {
      if (form.bedrooms) details.bedrooms = Number(form.bedrooms)
      if (form.bathrooms) details.bathrooms = Number(form.bathrooms)
      if (form.area_sqm) details.area_sqm = Number(form.area_sqm)
      if (form.floor) details.floor = form.floor
    }
    if (form.category === 'car') {
      if (form.car_brand) details.brand = form.car_brand
      if (form.car_model) details.model = form.car_model
      if (form.car_year) details.year = form.car_year
      if (form.car_gear) details.gear = form.car_gear
      if (form.car_seats) details.seats = Number(form.car_seats)
      if (form.car_fuel) details.fuel = form.car_fuel
    }
    if (form.category === 'equipment') {
      if (form.eq_brand) details.brand = form.eq_brand
      if (form.eq_condition) details.condition = form.eq_condition
    }
    if (form.category === 'fashion') {
      if (form.fashion_size) details.size = form.fashion_size
      if (form.fashion_brand) details.brand = form.fashion_brand
      if (form.fashion_condition) details.condition = form.fashion_condition
    }

    const { error } = await supabase.from('listings').insert([{
      title: form.title,
      description: form.description,
      category: form.category,
      price_per_day: form.price_per_day ? Number(form.price_per_day) : null,
      price_per_month: form.price_per_month ? Number(form.price_per_month) : null,
      rental_type: form.rental_type || 'daily',
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

  const isVilla = form.category === 'villa'
  const isHouse = form.category === 'house'
  const isOffice = form.category === 'office'
  const isCar = form.category === 'car'
  const isEquipment = form.category === 'equipment'
  const isFashion = form.category === 'fashion'
  const amenityList = isVilla ? VILLA_AMENITIES : isHouse ? HOUSE_AMENITIES : isOffice ? OFFICE_AMENITIES : []

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ลงประกาศเช่า</h2>
        <p className="text-gray-400 mb-8">กรอกข้อมูลที่ต้องการให้เช่า</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              ชื่อประกาศ <span className="text-red-400">*</span>
            </label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="เช่น พูลวิลล่าเชียงใหม่, คอนโดใจกลางเมือง"
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

          {isVilla && (
            <div className="bg-orange-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-orange-600">🏖️ ข้อมูลพูลวิลล่า</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ราคา/คืน (฿) *</label>
                  <input name="price_per_day" type="number" value={form.price_per_day} onChange={handleChange} placeholder="3500" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">พักขั้นต่ำ (คืน)</label>
                  <input name="min_stay_days" type="number" value={form.min_stay_days} onChange={handleChange} placeholder="2" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">รองรับสูงสุด (คน)</label>
                  <input name="max_guests" type="number" value={form.max_guests} onChange={handleChange} placeholder="8" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ห้องนอน</label>
                  <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} placeholder="3" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ห้องน้ำ</label>
                  <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} placeholder="3" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">พื้นที่ (ตร.ม.)</label>
                  <input name="area_sqm" type="number" value={form.area_sqm} onChange={handleChange} placeholder="300" className={inputClass}/>
                </div>
              </div>
            </div>
          )}

          {isHouse && (
            <div className="bg-green-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-green-700">🏠 ข้อมูลบ้าน/คอนโด</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ราคา/เดือน (฿) *</label>
                  <input name="price_per_month" type="number" value={form.price_per_month} onChange={handleChange} placeholder="15000" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ประเภทสัญญา</label>
                  <select name="rental_type" value={form.rental_type} onChange={handleChange} className={selectClass}>
                    <option value="monthly">รายเดือน</option>
                    <option value="yearly">รายปี</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ห้องนอน</label>
                  <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} placeholder="2" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ห้องน้ำ</label>
                  <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} placeholder="1" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">พื้นที่ (ตร.ม.)</label>
                  <input name="area_sqm" type="number" value={form.area_sqm} onChange={handleChange} placeholder="45" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ชั้น</label>
                  <input name="floor" value={form.floor} onChange={handleChange} placeholder="5" className={inputClass}/>
                </div>
              </div>
            </div>
          )}

          {isOffice && (
            <div className="bg-purple-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-purple-700">🏢 ข้อมูลออฟฟิศ</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ราคา/เดือน (฿) *</label>
                  <input name="price_per_month" type="number" value={form.price_per_month} onChange={handleChange} placeholder="25000" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ประเภทสัญญา</label>
                  <select name="rental_type" value={form.rental_type} onChange={handleChange} className={selectClass}>
                    <option value="monthly">รายเดือน</option>
                    <option value="yearly">รายปี</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">พื้นที่ (ตร.ม.)</label>
                  <input name="area_sqm" type="number" value={form.area_sqm} onChange={handleChange} placeholder="100" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ชั้น</label>
                  <input name="floor" value={form.floor} onChange={handleChange} placeholder="10" className={inputClass}/>
                </div>
              </div>
            </div>
          )}

          {isCar && (
            <div className="bg-yellow-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-yellow-700">🚗 ข้อมูลรถยนต์</p>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">ราคา/วัน (฿) *</label>
                <input name="price_per_day" type="number" value={form.price_per_day} onChange={handleChange} placeholder="1500" className={inputClass}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ยี่ห้อ</label>
                  <input name="car_brand" value={form.car_brand} onChange={handleChange} placeholder="Toyota, Honda..." className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">รุ่น</label>
                  <input name="car_model" value={form.car_model} onChange={handleChange} placeholder="Camry, Civic..." className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ปี</label>
                  <input name="car_year" value={form.car_year} onChange={handleChange} placeholder="2022" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">เกียร์</label>
                  <select name="car_gear" value={form.car_gear} onChange={handleChange} className={selectClass}>
                    <option value="">เลือกเกียร์</option>
                    <option value="auto">อัตโนมัติ</option>
                    <option value="manual">ธรรมดา</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">จำนวนที่นั่ง</label>
                  <input name="car_seats" type="number" value={form.car_seats} onChange={handleChange} placeholder="5" className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">เชื้อเพลิง</label>
                  <select name="car_fuel" value={form.car_fuel} onChange={handleChange} className={selectClass}>
                    <option value="">เลือกเชื้อเพลิง</option>
                    <option value="benzine">เบนซิน</option>
                    <option value="diesel">ดีเซล</option>
                    <option value="hybrid">ไฮบริด</option>
                    <option value="ev">ไฟฟ้า (EV)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {isEquipment && (
            <div className="bg-orange-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-orange-700">🔧 ข้อมูลอุปกรณ์</p>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">ราคา/วัน (฿) *</label>
                <input name="price_per_day" type="number" value={form.price_per_day} onChange={handleChange} placeholder="500" className={inputClass}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ยี่ห้อ</label>
                  <input name="eq_brand" value={form.eq_brand} onChange={handleChange} placeholder="Makita, Bosch..." className={inputClass}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">สภาพ</label>
                  <select name="eq_condition" value={form.eq_condition} onChange={handleChange} className={selectClass}>
                    <option value="">เลือกสภาพ</option>
                    <option value="new">ใหม่มาก</option>
                    <option value="good">ดี</option>
                    <option value="fair">พอใช้</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {isFashion && (
            <div className="bg-pink-50 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-pink-700">👗 ข้อมูลเสื้อผ้า</p>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">ราคา/วัน (฿) *</label>
                <input name="price_per_day" type="number" value={form.price_per_day} onChange={handleChange} placeholder="300" className={inputClass}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ไซส์</label>
                  <select name="fashion_size" value={form.fashion_size} onChange={handleChange} className={selectClass}>
                    <option value="">เลือกไซส์</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="freesize">Freesize</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">แบรนด์</label>
                  <input name="fashion_brand" value={form.fashion_brand} onChange={handleChange} placeholder="Zara, H&M..." className={inputClass}/>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">สภาพ</label>
                  <select name="fashion_condition" value={form.fashion_condition} onChange={handleChange} className={selectClass}>
                    <option value="">เลือกสภาพ</option>
                    <option value="new">ใหม่มาก</option>
                    <option value="good">ดี</option>
                    <option value="fair">พอใช้</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {amenityList.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">✨ สิ่งอำนวยความสะดวก</label>
              <div className="flex flex-wrap gap-2">
                {amenityList.map((item) => (
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
              rows={4} placeholder="อธิบายรายละเอียดเพิ่มเติม เงื่อนไขการเช่า..."
              className={inputClass + " resize-none"}/>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">สถานที่</label>
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