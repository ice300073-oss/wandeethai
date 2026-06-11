import Link from 'next/link'
import { Search, MapPin, Shield, Star, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { createServerReadClient } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'

// ดึงข้อมูลตอนเปิดเว็บจริง (ไม่ดึงตอน build) — กัน build พังถ้า Supabase ยังไม่พร้อม
export const dynamic = 'force-dynamic'

const PROVINCES = [
  'เชียงใหม่', 'กรุงเทพฯ', 'ภูเก็ต', 'กระบี่', 'เชียงราย',
  'ขอนแก่น', 'นครราชสีมา', 'สุราษฎร์ธานี', 'อยุธยา', 'น่าน',
  'แม่ฮ่องสอน', 'ลำปาง',
]

async function getFeaturedListings() {
  try {
    const supabase = createServerReadClient()
    const { data } = await supabase
      .from('listings')
      .select('*, categories(name, slug)')
      .eq('is_active', true)
      .order('rating_avg', { ascending: false })
      .limit(6)
    return data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const listings = await getFeaturedListings()

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 py-20 px-4 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
            <span>✈️</span>
            <span>แพลตฟอร์มท่องเที่ยวคนเดี่ยวของคนไทย</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            เที่ยวคนเดียว<br />
            <span className="text-amber-100">ก็เจ๋งได้</span>
          </h1>
          <p className="text-lg text-orange-100 mb-10 max-w-xl mx-auto">
            ค้นหาที่พักและไกด์ท้องถิ่นที่เข้าใจนักท่องเที่ยวคนเดี่ยว ปลอดภัย คุ้มค่า สนุก
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-2 px-3">
              <MapPin className="w-5 h-5 text-orange-400 shrink-0" />
              <select className="w-full py-2 text-gray-700 bg-transparent outline-none text-sm">
                <option value="">เลือกจังหวัด</option>
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <Link
              href="/listings"
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              ค้นหาที่พัก
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">เลือกตามประเภท</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { icon: '🏡', label: 'โฮมสเตย์', href: '/listings?type=homestay' },
            { icon: '⛺', label: 'แคมป์ปิ้ง', href: '/listings?type=camping' },
            { icon: '🏨', label: 'โรงแรม', href: '/listings?type=hotel' },
            { icon: '🌿', label: 'รีสอร์ท', href: '/listings?type=resort' },
            { icon: '🎒', label: 'เกสต์เฮาส์', href: '/listings?type=guesthouse' },
            { icon: '🗺️', label: 'ไกด์ท้องถิ่น', href: '/guides' },
          ].map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 hover:shadow-md hover:border-orange-200 border border-gray-100 transition-all"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">ที่พักแนะนำ</h2>
          <Link href="/listings" className="flex items-center gap-1 text-orange-500 text-sm font-medium hover:underline">
            ดูทั้งหมด <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-orange-200">
            <p className="text-4xl mb-3">🏡</p>
            <p className="text-gray-500 mb-4">ยังไม่มีที่พักในระบบ</p>
            <Link
              href="/host"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              ลงประกาศที่พักแรก
            </Link>
          </div>
        )}
      </section>

      {/* Why WanDeeThai */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ทำไมต้อง WanDeeThai?</h2>
          <p className="text-gray-500 mb-10">ออกแบบมาเพื่อนักท่องเที่ยวคนเดี่ยวโดยเฉพาะ</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-8 h-8 text-orange-500" />, title: 'ปลอดภัย', desc: 'ที่พักและไกด์ผ่านการยืนยันตัวตนทุกราย' },
              { icon: <Star className="w-8 h-8 text-orange-500" />, title: 'รีวิวจริง', desc: 'รีวิวจากนักท่องเที่ยวคนเดี่ยวที่เคยใช้บริการจริง' },
              { icon: <MapPin className="w-8 h-8 text-orange-500" />, title: 'ไกด์ท้องถิ่น', desc: 'เชื่อมคุณกับคนในพื้นที่ที่รู้จักที่นั่นดีที่สุด' },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-400 py-16 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">พร้อมเที่ยวคนเดียวแล้วใช่ไหม?</h2>
        <p className="text-orange-100 mb-8">เริ่มต้นค้นหาที่พักและไกด์ที่ใช่ได้เลย</p>
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors"
        >
          เริ่มเดินทาง <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 px-4 text-center text-sm">
        <p className="font-semibold text-white mb-1">WanDeeThai</p>
        <p>แพลตฟอร์มท่องเที่ยวคนเดี่ยวสำหรับคนไทย © 2025</p>
      </footer>
    </div>
  )
}
