'use client'

import { useEffect } from 'react'
import SiteName from '@/components/SiteName'

// แก้ชื่อ/รูป/ส่วนลดร้านได้ที่นี่ (white-label — เปลี่ยนให้ผู้เช่าได้)
// discount: เว้นว่าง = ไม่โชว์ป้ายส่วนลด
const RESTAURANTS = [
  {
    name: 'ครัวทะเลสด',
    type: 'อาหารทะเล',
    desc: 'กุ้ง หอย ปู ปลา สดจากเรือทุกเช้า ปรุงร้อนๆ รสจัดจ้านแบบต้นตำรับ นั่งกินริมทะเลรับลมเย็นๆ',
    tags: ['ริมทะเล', 'วิวพระอาทิตย์ตก', 'ที่จอดรถกว้าง'],
    hours: '11:00 – 22:00',
    price: '฿฿',
    discount: 'ลด 10% เมื่อแสดงตั๋วที่พัก',
    img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=70',
    emoji: '🦐',
  },
  {
    name: 'Sunset Cafe',
    type: 'คาเฟ่ & เบเกอรี่',
    desc: 'กาแฟคั่วสด เค้กโฮมเมด บรรยากาศชิลล์ มุมถ่ายรูปเยอะ เหมาะนั่งทำงานหรือพักผ่อนยามบ่าย',
    tags: ['WiFi ฟรี', 'มุมถ่ายรูป', 'เปิดเช้า'],
    hours: '07:00 – 18:00',
    price: '฿',
    discount: 'ฟรีเครื่องดื่ม 1 แก้ว เมื่อสั่งเค้ก',
    img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=70',
    emoji: '☕',
  },
  {
    name: 'ส้มตำแซ่บนัว',
    type: 'อาหารอีสาน',
    desc: 'ส้มตำ ไก่ย่าง คอหมูย่าง แซ่บถึงเครื่อง ราคาเป็นกันเอง อร่อยแบบคนท้องถิ่นแนะนำ',
    tags: ['ราคาเป็นมิตร', 'เผ็ดจัดได้', 'สั่งกลับได้'],
    hours: '10:00 – 21:00',
    price: '฿',
    discount: '',
    img: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1200&q=70',
    emoji: '🥗',
  },
  {
    name: 'The Grill House',
    type: 'สเต๊ก & บาร์บีคิว',
    desc: 'สเต๊กเนื้อนุ่มย่างถ่าน ซี่โครงหมูบาร์บีคิว พร้อมไวน์และเบียร์เย็นๆ บรรยากาศอบอุ่นเหมาะมื้อค่ำพิเศษ',
    tags: ['มื้อค่ำพิเศษ', 'มีเครื่องดื่ม', 'จองโต๊ะได้'],
    hours: '17:00 – 23:00',
    price: '฿฿฿',
    discount: 'ลด 15% ทุกวันจันทร์–พฤหัส',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=70',
    emoji: '🥩',
  },
]

export default function RestaurantsPage() {
  useEffect(() => {
    const els = document.querySelectorAll('.rst-reveal')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('rst-in') })
    }, { threshold: 0.12 })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <main className="rst-root">
      <style>{`
        .rst-root{background:#fff;overflow-x:hidden}
        @keyframes rst-kenburns{from{transform:scale(1)}to{transform:scale(1.12)}}
        @keyframes rst-fadeup{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
        @keyframes rst-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .rst-reveal{opacity:0;transform:translateY(32px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
        .rst-reveal.rst-in{opacity:1;transform:none}
        .rst-hero-img{animation:rst-kenburns 20s ease-out infinite alternate}
        .rst-h1{animation:rst-fadeup 1s .1s both}
        .rst-h2{animation:rst-fadeup 1s .3s both}
        .rst-h3{animation:rst-fadeup 1s .5s both}
        .rst-float{animation:rst-float 4s ease-in-out infinite}
        .rst-card{transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s}
        .rst-card:hover{transform:translateY(-6px);box-shadow:0 18px 40px -12px rgba(0,0,0,.22)}
        .rst-card:hover .rst-img{transform:scale(1.07)}
        .rst-img{transition:transform .7s cubic-bezier(.2,.7,.2,1)}
      `}</style>

      {/* ===== NAV ===== */}
      <nav className="absolute top-0 inset-x-0 z-30 px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-white drop-shadow"><SiteName /></a>
        <a href="/" className="text-white/90 hover:text-white text-sm bg-white/10 backdrop-blur px-4 py-2 rounded-full">← หน้าหลัก</a>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative h-[70vh] min-h-[440px] flex items-center justify-center text-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=70"
          alt="" className="rst-hero-img absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}/>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/50 to-stone-900/85"/>
        <div className="relative z-10 px-6 max-w-3xl">
          <span className="rst-h1 inline-block bg-white/15 backdrop-blur text-white text-sm px-4 py-1.5 rounded-full mb-5">
            🍽️ ร้านเด็ดใกล้ที่พัก
          </span>
          <h1 className="rst-h2 text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
            อิ่มอร่อย<br/>ทุกมื้อริมทะเล
          </h1>
          <p className="rst-h3 text-lg text-white/85 mb-8">
            อาหารทะเลสด · คาเฟ่ · อาหารอีสาน · สเต๊ก — คัดร้านอร่อยไว้ให้แล้ว
          </p>
          <a href="#list"
            className="rst-h3 inline-block bg-white text-stone-900 font-semibold px-8 py-3.5 rounded-full shadow-lg hover:scale-105 transition-transform">
            ดูร้านทั้งหมด ↓
          </a>
        </div>
        <div className="rst-float absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-2xl z-10">⌄</div>
      </section>

      {/* ===== INTRO ===== */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="rst-reveal text-orange-500 font-semibold mb-3">คัดมาให้แล้ว</p>
        <h2 className="rst-reveal text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ transitionDelay: '.1s' }}>
          ไม่ต้องหาไกล อร่อยใกล้ที่พัก
        </h2>
        <p className="rst-reveal text-slate-500 leading-relaxed" style={{ transitionDelay: '.2s' }}>
          รวมร้านอาหารที่แขกของเราชอบที่สุด ทั้งของทะเลสดๆ คาเฟ่ชิลล์ และร้านเด็ดท้องถิ่น
          บางร้านมีส่วนลดพิเศษสำหรับแขกที่พักกับเราด้วย
        </p>
      </section>

      {/* ===== LIST ===== */}
      <section id="list" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid gap-7 sm:grid-cols-2">
          {RESTAURANTS.map((r, i) => (
            <div key={r.name}
              className="rst-card rst-reveal bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              style={{ transitionDelay: `${(i % 2) * 0.12}s` }}>
              <div className="relative h-52 overflow-hidden">
                <img src={r.img} alt={r.name} className="rst-img w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.25' }}/>
                {r.discount && (
                  <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    🎁 {r.discount}
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {r.price}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-orange-500 text-sm font-semibold">{r.type}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{r.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{r.desc}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {r.tags.map((t) => (
                    <span key={t} className="text-xs bg-gray-50 text-slate-600 border border-gray-100 px-2.5 py-1 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-slate-400">🕐 {r.hours}</span>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(r.name)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-900 hover:text-orange-500 transition-colors">
                    ดูแผนที่ →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500"/>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="rst-reveal text-3xl font-bold text-white mb-3">พักกับเรา รับส่วนลดร้านอาหาร</h2>
          <p className="rst-reveal text-white/90 mb-7" style={{ transitionDelay: '.1s' }}>
            จองที่พักวันนี้ แล้วใช้ตั๋วของคุณรับสิทธิพิเศษจากร้านพาร์ทเนอร์
          </p>
          <a href="/" className="rst-reveal inline-block bg-white text-orange-600 font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-transform"
            style={{ transitionDelay: '.2s' }}>
            🏖️ ค้นหาที่พัก
          </a>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-500 py-6 px-6 text-xs text-center">
        <p>© 2025 <SiteName /> · อิ่มอร่อยทุกมื้อ</p>
      </footer>
    </main>
  )
}
