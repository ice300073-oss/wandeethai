export const metadata = {
  title: 'เกี่ยวกับเรา & ช่วยเหลือ — WanDeeThai',
  description: 'WanDeeThai แพลตฟอร์มท่องเที่ยวคนเดี่ยวของคนไทย — วิธีใช้งาน คำถามที่พบบ่อย และช่องทางติดต่อ',
}

const faqs = [
  { q: 'จองที่พักยังไง?', a: 'เลือกที่พัก → กด"จองเลย" → เลือกวันเข้าพักบนปฏิทิน → ชำระเงินผ่าน PromptPay แล้วอัปโหลดสลิป รอเจ้าของยืนยัน' },
  { q: 'จ่ายเงินยังไง ปลอดภัยไหม?', a: 'จ่ายผ่าน PromptPay QR เข้าบัญชีเจ้าของที่พักโดยตรง พร้อมระบบมัดจำคุ้มครองทั้งสองฝ่าย' },
  { q: 'ยกเลิกการจองได้ไหม?', a: 'ได้ ขึ้นอยู่กับเงื่อนไขของเจ้าของที่พักแต่ละราย แนะนำให้แชทสอบถามเจ้าของก่อนจอง' },
  { q: 'ลงประกาศที่พักมีค่าใช้จ่ายไหม?', a: 'ช่วงเปิดตัว ลงฟรี ไม่เก็บค่าคอมมิชชั่น 3 เดือนแรก — เงินค่าที่พักเข้าเจ้าของโดยตรง' },
  { q: 'ติดต่อเจ้าของที่พักยังไง?', a: 'กดปุ่ม "ติดต่อเจ้าของที่พัก" ในหน้าที่พัก เพื่อแชทสอบถามก่อนจองได้เลย' },
  { q: 'ยืนยันตัวตนเจ้าของคืออะไร?', a: 'เจ้าของที่ผ่านการยืนยันตัวตนจะมีป้าย ✓ สีฟ้า เพื่อความน่าเชื่อถือและปลอดภัยของผู้เข้าพัก' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href="/" className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าหลัก</a>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-amber-400 text-white text-center px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">เกี่ยวกับ WanDeeThai</h1>
        <p className="text-orange-100 max-w-2xl mx-auto">
          แพลตฟอร์มท่องเที่ยวคนเดี่ยวของคนไทย — ค้นหาที่พักและไกด์ท้องถิ่นที่ปลอดภัย คุ้มค่า และเข้าใจนักเดินทางคนเดียว
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-14 space-y-14">

        {/* เรื่องราว */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">เราคือใคร</h2>
          <p className="text-gray-600 leading-relaxed">
            WanDeeThai เกิดจากความเชื่อว่า "เที่ยวคนเดียวก็เจ๋งได้" เรารวบรวมที่พักและไกด์ท้องถิ่นทั่วไทย
            ที่เข้าใจนักท่องเที่ยวคนเดี่ยวโดยเฉพาะ — ปลอดภัย ราคาคุ้มค่า และเชื่อมคุณกับคนในพื้นที่จริง
          </p>
        </section>

        {/* วิธีใช้ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ใช้งานยังไง</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="font-semibold text-orange-600 mb-3">🧳 สำหรับนักท่องเที่ยว</p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>ค้นหาที่พัก/ไกด์ตามจังหวัด ราคา</li>
                <li>ดูรายละเอียด รีวิว แชทกับเจ้าของ</li>
                <li>จอง + ชำระผ่าน PromptPay</li>
                <li>เข้าพัก แล้วรีวิวให้คนอื่น</li>
              </ol>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="font-semibold text-orange-600 mb-3">🏡 สำหรับเจ้าของที่พัก</p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>สมัครฟรีด้วย Google</li>
                <li>ลงประกาศที่พัก (รูป ราคา รายละเอียด)</li>
                <li>รับการจอง เงินเข้า PromptPay คุณตรง</li>
                <li>ยืนยันตัวตนรับป้าย ✓ น่าเชื่อถือ</li>
              </ol>
              <a href="/become-host" className="inline-block mt-4 text-sm text-orange-500 font-medium hover:underline">
                ลงประกาศฟรี →
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">คำถามที่พบบ่อย</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="bg-white rounded-xl border border-gray-100 p-5 group">
                <summary className="font-medium text-gray-800 cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-orange-400 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ติดต่อ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ติดต่อเรา</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3 text-sm text-gray-600">
            <p>📧 อีเมล: <span className="text-gray-800">ice300074@gmail.com</span></p>
            <p>💬 LINE: <span className="text-gray-800">@wandeethai</span> (เพิ่มเพื่อนสอบถามได้)</p>
            <p>🌐 เว็บไซต์: <span className="text-gray-800">wandeethai.vercel.app</span></p>
            <div className="flex gap-3 pt-2">
              <a href="/terms" className="text-orange-500 hover:underline">เงื่อนไขการใช้งาน</a>
              <a href="/privacy" className="text-orange-500 hover:underline">นโยบายความเป็นส่วนตัว</a>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm">
        <p className="text-white font-semibold mb-1">WanDeeThai</p>
        <p>© 2025 แพลตฟอร์มท่องเที่ยวคนเดี่ยวของคนไทย</p>
      </footer>
    </main>
  )
}
