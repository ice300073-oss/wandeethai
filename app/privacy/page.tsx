export default function PrivacyPage() {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
          <a href="/" className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าหลัก</a>
        </nav>
  
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-gray-400 text-sm mb-8">อัปเดตล่าสุด: มกราคม 2568</p>
  
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 text-gray-600 leading-relaxed">
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. ข้อมูลที่เราเก็บ</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>ชื่อ อีเมล เบอร์โทรศัพท์ที่คุณให้ไว้</li>
                <li>ข้อมูลการจองและการชำระเงิน</li>
                <li>รูปภาพที่อัปโหลด</li>
                <li>ข้อมูลการใช้งานเว็บไซต์</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. วิธีที่เราใช้ข้อมูล</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>เพื่อให้บริการแพลตฟอร์มได้อย่างมีประสิทธิภาพ</li>
                <li>เพื่อติดต่อสื่อสารเกี่ยวกับการจองและบริการ</li>
                <li>เพื่อปรับปรุงและพัฒนาแพลตฟอร์ม</li>
                <li>เพื่อป้องกันการทุจริตและรักษาความปลอดภัย</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. การแชร์ข้อมูล</h2>
              <p>เราไม่ขายข้อมูลส่วนตัวของคุณให้บุคคลภายนอก ข้อมูลจะถูกแชร์เฉพาะในกรณีที่จำเป็นต่อการให้บริการ เช่น การแจ้งข้อมูลการจองให้ผู้ให้เช่า</p>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. ความปลอดภัยของข้อมูล</h2>
              <p>เราใช้ Supabase ซึ่งมีมาตรฐานความปลอดภัยระดับสูง ข้อมูลทั้งหมดถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย</p>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. สิทธิ์ของคุณ</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>ขอดูข้อมูลส่วนตัวของคุณได้ตลอดเวลา</li>
                <li>ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                <li>ขอลบบัญชีและข้อมูลทั้งหมด</li>
                <li>ขอให้หยุดใช้ข้อมูลของคุณ</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Cookies</h2>
              <p>เราใช้ cookies เพื่อเก็บข้อมูล session การล็อกอิน และการตั้งค่าของผู้ใช้ คุณสามารถปิด cookies ในเบราว์เซอร์ได้ แต่อาจทำให้บางฟีเจอร์ไม่ทำงาน</p>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. ติดต่อเรา</h2>
              <p>หากต้องการใช้สิทธิ์หรือมีข้อสงสัย ติดต่อได้ที่ <a href="mailto:ice300074@gmail.com" className="text-orange-500 hover:underline">ice300074@gmail.com</a></p>
            </section>
  
          </div>
        </div>
  
        <footer className="bg-gray-900 text-gray-400 py-8 px-6 mt-12">
          <div className="max-w-3xl mx-auto flex justify-between items-center text-sm">
            <p>© 2025 WanDeeThai</p>
            <div className="flex gap-4">
              <a href="/terms" className="hover:text-white">เงื่อนไขการใช้งาน</a>
              <a href="/privacy" className="hover:text-white">นโยบายความเป็นส่วนตัว</a>
            </div>
          </div>
        </footer>
      </main>
    )
  }