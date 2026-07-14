'use client'
import SiteName from '@/components/SiteName'

import { useEffect } from 'react'

// แก้เนื้อหา/รูปกิจกรรมได้ที่นี่ (รองรับ white-label — เปลี่ยนรูป/ข้อความให้ผู้เช่าได้)
const ACTIVITIES = [
  {
    tag: 'ดำน้ำ',
    title: 'ดำดิ่งสู่โลกใต้ทะเล',
    desc: 'สัมผัสแนวปะการังสีสันสดใส ฝูงปลาหลากชนิด น้ำทะเลใสราวกระจก พร้อมครูฝึกมืออาชีพดูแลทุกขั้นตอน เหมาะทั้งมือใหม่และมือโปร',
    points: ['อุปกรณ์ครบชุด', 'ครูฝึกมีใบอนุญาต', 'จุดดำน้ำน้ำใส'],
    img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=70',
    emoji: '🤿',
  },
  {
    tag: 'ล่องเรือ',
    title: 'ล่องเรือชมพระอาทิตย์ตก',
    desc: 'ผ่อนคลายบนเรือ ชมท้องฟ้าเปลี่ยนสีเหนือทะเลยามเย็น พร้อมเครื่องดื่มและลมทะเลเย็นสบาย ประสบการณ์โรแมนติกที่ต้องลอง',
    points: ['เครื่องดื่มบริการ', 'จุดถ่ายรูปสวย', 'วิวพระอาทิตย์ตก'],
    img: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?auto=format&fit=crop&w=1200&q=70',
    emoji: '⛵',
  },
  {
    tag: 'เที่ยวเกาะ',
    title: 'ทัวร์เที่ยวเกาะรอบอ่าว',
    desc: 'แวะเกาะสวยหลายจุดในวันเดียว เล่นน้ำ ดำผิวน้ำดูปะการัง นอนอาบแดดบนหาดทรายขาว อิ่มอร่อยกับอาหารทะเลสดๆ',
    points: ['หลายเกาะในทริปเดียว', 'อาหารกลางวัน', 'อุปกรณ์ Snorkel'],
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=70',
    emoji: '🏝️',
  },
]

export default function ExperiencesPage() {
  // scroll reveal — ค่อยๆ ปรากฏเมื่อเลื่อนถึง
  useEffect(() => {
    const els = document.querySelectorAll('.exp-reveal')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('exp-in') })
    }, { threshold: 0.15 })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <main className="exp-root">
      <style>{`
        .exp-root{--ink:#0f172a;--muted:#64748b;background:#fff;overflow-x:hidden}
        @keyframes exp-kenburns{from{transform:scale(1)}to{transform:scale(1.15)}}
        @keyframes exp-fadeup{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes exp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes exp-shine{to{background-position:200% center}}
        .exp-reveal{opacity:0;transform:translateY(36px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}
        .exp-reveal.exp-in{opacity:1;transform:none}
        .exp-hero-img{animation:exp-kenburns 18s ease-out infinite alternate}
        .exp-h1{animation:exp-fadeup 1s .1s both}
        .exp-h2{animation:exp-fadeup 1s .35s both}
        .exp-h3{animation:exp-fadeup 1s .6s both}
        .exp-float{animation:exp-float 4s ease-in-out infinite}
        .exp-cta{background:linear-gradient(90deg,#f97316,#fb923c,#f97316);background-size:200% auto;animation:exp-shine 4s linear infinite}
        .exp-card{transition:transform .5s cubic-bezier(.2,.7,.2,1),box-shadow .5s}
        .exp-card:hover{transform:translateY(-8px)}
        .exp-card:hover .exp-card-img{transform:scale(1.08)}
        .exp-card-img{transition:transform .8s cubic-bezier(.2,.7,.2,1)}
      `}</style>

      {/* ===== NAV ===== */}
      <nav className="absolute top-0 inset-x-0 z-30 px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-white drop-shadow"><SiteName /></a>
        <a href="/" className="text-white/90 hover:text-white text-sm bg-white/10 backdrop-blur px-4 py-2 rounded-full">← หน้าหลัก</a>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative h-[92vh] min-h-[520px] flex items-center justify-center text-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1682687982501-1e58ab814714?auto=format&fit=crop&w=1600&q=70"
          alt="" className="exp-hero-img absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}/>
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/50 via-sky-900/40 to-slate-900/80"/>
        <div className="relative z-10 px-6 max-w-3xl">
          <span className="exp-h1 inline-block bg-white/15 backdrop-blur text-white text-sm px-4 py-1.5 rounded-full mb-5">
            ✨ ประสบการณ์ริมทะเลที่คุณต้องลอง
          </span>
          <h1 className="exp-h2 text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
            ปลดปล่อยทุกความสนุก<br/>ริมทะเลสัตหีบ
          </h1>
          <p className="exp-h3 text-lg text-white/85 mb-8">
            ดำน้ำ · ล่องเรือ · เที่ยวเกาะ — จัดเต็มทุกกิจกรรม พร้อมทีมงานมืออาชีพดูแลคุณ
          </p>
          <a href="#activities"
            className="exp-h3 exp-cta inline-block text-white font-semibold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-shadow">
            ดูกิจกรรมทั้งหมด ↓
          </a>
        </div>
        <div className="exp-float absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-2xl z-10">⌄</div>
      </section>

      {/* ===== INTRO ===== */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="exp-reveal text-orange-500 font-semibold mb-3">ทำไมต้องมาที่นี่</p>
        <h2 className="exp-reveal text-3xl md:text-4xl font-bold text-slate-800 mb-5" style={{ transitionDelay: '.1s' }}>
          ครบทุกกิจกรรม จบในที่เดียว
        </h2>
        <p className="exp-reveal text-slate-500 leading-relaxed" style={{ transitionDelay: '.2s' }}>
          ไม่ว่าจะมาเที่ยวคนเดียว มากับเพื่อน หรือครอบครัว เรามีกิจกรรมทางทะเลให้เลือกครบ
          พร้อมอุปกรณ์มาตรฐานและทีมงานที่ใส่ใจความปลอดภัยทุกทริป
        </p>
      </section>

      {/* ===== ACTIVITIES ===== */}
      <section id="activities" className="max-w-6xl mx-auto px-6 pb-10">
        <div className="space-y-16 md:space-y-28">
          {ACTIVITIES.map((a, i) => (
            <div key={a.title}
              className={`exp-card exp-reveal grid md:grid-cols-2 gap-8 md:gap-12 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
              <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3] [direction:ltr]">
                <img src={a.img} alt={a.title} className="exp-card-img w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3' }}/>
              </div>
              <div className="[direction:ltr]">
                <span className="inline-block text-3xl mb-3">{a.emoji}</span>
                <p className="text-orange-500 font-semibold text-sm mb-1">{a.tag}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">{a.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-5">{a.desc}</p>
                <ul className="space-y-2 mb-7">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-slate-600 text-sm">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xs">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <a href="/" className="inline-block bg-slate-900 text-white font-medium px-6 py-3 rounded-full hover:bg-slate-800 transition-colors">
                  สอบถาม / จองกิจกรรม
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative mt-24 py-24 px-6 text-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=1600&q=70"
          alt="" className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}/>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-amber-500/90"/>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="exp-reveal text-3xl md:text-4xl font-bold text-white mb-4">พร้อมออกเดินทางแล้วหรือยัง?</h2>
          <p className="exp-reveal text-white/90 mb-8" style={{ transitionDelay: '.1s' }}>
            จองที่พัก + กิจกรรมทางทะเลได้ในที่เดียว เริ่มต้นทริปในฝันของคุณวันนี้
          </p>
          <a href="/" className="exp-reveal inline-block bg-white text-orange-600 font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-transform"
            style={{ transitionDelay: '.2s' }}>
            🏖️ ค้นหาที่พัก & จองกิจกรรม
          </a>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-900 text-slate-500 py-6 px-6 text-xs text-center">
        <p>© 2025 WanDeeThai · ประสบการณ์ทางทะเลที่คุณจะไม่มีวันลืม</p>
      </footer>
    </main>
  )
}
