import SiteName from '@/components/SiteName'
export const metadata = {
  title: 'ที่เที่ยวสัตหีบ & กิจกรรมแนะนำ — WanDeeThai',
  description: 'รวมสถานที่ท่องเที่ยวและกิจกรรมน่าสนใจในสัตหีบ สำหรับนักท่องเที่ยวคนเดี่ยว',
}

// TODO: ใส่ข้อมูลจริง (ชื่อ, คำอธิบาย, รูป, เวลาเปิด-ปิด) ทีหลัง — ตอนนี้เป็นโครงหน้าไว้ก่อน
const PLACES = [
  { icon: '⚓', name: 'หาดนางรอง', desc: 'หาดทรายขาวในพื้นที่ทหารเรือ บรรยากาศเงียบสงบ เหมาะกับพักผ่อนคนเดียว' },
  { icon: '🏝️', name: 'เกาะแสมสาร', desc: 'น้ำทะเลใส เหมาะดำน้ำดูปะการัง นั่งเรือจากท่าเรือแสมสารไม่ไกล' },
  { icon: '⛰️', name: 'เขาชีจรรย์ (พระพุทธรูปแกะสลัก)', desc: 'พระพุทธรูปแกะสลักบนหน้าผาที่ใหญ่ที่สุดในโลก จุดถ่ายรูปยอดฮิต' },
  { icon: '🍤', name: 'ตลาดสัตหีบ / ร้านอาหารทะเล', desc: 'ของกินทะเลสดๆ ราคาคนท้องถิ่น' },
]

export default function ActivitiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500"><SiteName /></a>
        <a href="/" className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าหลัก</a>
      </nav>

      <section className="bg-gradient-to-br from-orange-500 to-amber-400 text-white text-center px-6 py-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">ที่เที่ยวสัตหีบ & กิจกรรมแนะนำ</h1>
        <p className="text-orange-100 max-w-xl mx-auto">รวมจุดเที่ยวใกล้ที่พัก เหมาะกับวันพักผ่อนของคุณ</p>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PLACES.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{p.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center">
          <p className="text-orange-700 font-medium mb-1">🚧 หน้านี้กำลังเติมข้อมูลเพิ่ม</p>
          <p className="text-sm text-orange-600">เร็วๆ นี้จะมีรูปจริง เวลาเปิด-ปิด และเส้นทางเดินทางของแต่ละที่</p>
        </div>
      </div>
    </main>
  )
}
