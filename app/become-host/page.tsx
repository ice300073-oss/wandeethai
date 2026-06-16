export const metadata = {
  title: 'ลงประกาศที่พักฟรี — WanDeeThai',
  description: 'ลงที่พักของคุณบน WanDeeThai ฟรี ไม่เก็บค่าคอมมิชชั่น 3 เดือนแรก เข้าถึงนักท่องเที่ยวคนเดี่ยวทั่วไทย',
}

export default function BecomeHost() {
  const benefits = [
    { icon: '🆓', title: 'ลงฟรี ไม่เก็บค่าคอม 3 เดือนแรก', desc: 'เริ่มต้นไม่มีค่าใช้จ่าย ได้ยอดจองเต็มๆ' },
    { icon: '🧳', title: 'เข้าถึงนักท่องเที่ยวคนเดี่ยว', desc: 'กลุ่มที่กำลังโตเร็วและมองหาที่พักแบบคุณ' },
    { icon: '🛡️', title: 'ปลอดภัย มีระบบมัดจำ', desc: 'รับเงินผ่าน PromptPay + ระบบมัดจำคุ้มครองทั้งสองฝั่ง' },
    { icon: '⭐', title: 'สร้างรีวิว & ความน่าเชื่อถือ', desc: 'มีโปรไฟล์เจ้าของ + ป้ายยืนยันตัวตน' },
    { icon: '📱', title: 'จัดการง่ายผ่านมือถือ', desc: 'ลงประกาศ ดูยอดจอง ตอบแชท ได้ในที่เดียว' },
    { icon: '💬', title: 'คุยกับลูกค้าโดยตรง', desc: 'แชทกับผู้เข้าพักก่อนจองได้เลย' },
  ]

  const steps = [
    { n: '1', title: 'สมัครฟรี', desc: 'ล็อกอินด้วย Google ภายใน 1 นาที' },
    { n: '2', title: 'ลงที่พัก', desc: 'ใส่รูป ราคา รายละเอียด — เสร็จใน 5 นาที' },
    { n: '3', title: 'รับการจอง', desc: 'ลูกค้าจอง+จ่าย เงินเข้าคุณ' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href="/" className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าหลัก</a>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
          🎉 โปรเปิดตัว — ลงฟรี ไม่เก็บค่าคอม 3 เดือนแรก
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          เปลี่ยนที่พักของคุณ<br/><span className="text-orange-100">ให้เป็นรายได้</span>
        </h1>
        <p className="text-lg text-orange-100 mb-8 max-w-xl mx-auto">
          ลงโฮมสเตย์ วิลล่า โรงแรม รีสอร์ท หรือบริการไกด์ บน WanDeeThai เข้าถึงนักท่องเที่ยวคนเดี่ยวทั่วไทย
        </p>
        <a href="/create"
          className="inline-block bg-white text-orange-600 font-semibold px-8 py-3.5 rounded-full hover:bg-orange-50 transition-colors shadow-lg">
          ลงประกาศที่พักฟรี →
        </a>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">ทำไมต้องลงกับ WanDeeThai?</h2>
        <p className="text-gray-400 text-center mb-10">แพลตฟอร์มท่องเที่ยวคนเดี่ยวของคนไทย</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="text-3xl mb-3">{b.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">เริ่มต้นง่ายๆ 3 ขั้น</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-orange-500 text-white text-xl font-bold flex items-center justify-center">
                  {s.n}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-400 text-white text-center px-6 py-16">
        <h2 className="text-3xl font-bold mb-3">พร้อมเริ่มหารายได้แล้วใช่ไหม?</h2>
        <p className="text-orange-100 mb-8">ลงประกาศฟรีวันนี้ ไม่มีค่าใช้จ่ายแอบแฝง</p>
        <a href="/create"
          className="inline-block bg-white text-orange-600 font-semibold px-8 py-3.5 rounded-full hover:bg-orange-50 transition-colors shadow-lg">
          ลงประกาศที่พักของคุณ →
        </a>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm">
        <p className="text-white font-semibold mb-1">WanDeeThai</p>
        <p>© 2025 แพลตฟอร์มท่องเที่ยวคนเดี่ยวของคนไทย</p>
      </footer>
    </main>
  )
}
