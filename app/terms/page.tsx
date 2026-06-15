export default function TermsPage() {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
          <a href="/" className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าหลัก</a>
        </nav>
  
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">เงื่อนไขการใช้งาน</h1>
          <p className="text-gray-400 text-sm mb-8">อัปเดตล่าสุด: มกราคม 2568</p>
  
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 text-gray-600 leading-relaxed">
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. การยอมรับเงื่อนไข</h2>
              <p>การใช้งานเว็บไซต์ WanDeeThai ถือว่าคุณยอมรับเงื่อนไขการใช้งานทั้งหมดนี้ หากคุณไม่ยอมรับ กรุณาหยุดใช้งานทันที</p>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. บริการของเรา</h2>
              <p>WanDeeThai เป็นแพลตฟอร์มกลางที่เชื่อมต่อเจ้าของที่พักและผู้เข้าพัก เราไม่ใช่เจ้าของที่พักหรือบริการใดๆ ที่ลงประกาศบนแพลตฟอร์ม</p>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. ความรับผิดชอบของผู้ใช้</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>ผู้ลงประกาศต้องรับผิดชอบต่อความถูกต้องของข้อมูล</li>
                <li>ห้ามลงประกาศสินค้าผิดกฎหมาย</li>
                <li>ผู้เข้าพักต้องดูแลที่พักด้วยความระมัดระวัง</li>
                <li>หากเกิดความเสียหาย ผู้เข้าพักต้องรับผิดชอบค่าเสียหาย</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. การชำระเงินและคืนเงิน</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>การชำระเงินผ่าน PromptPay ถือเป็นที่สิ้นสุด</li>
                <li>การคืนเงินขึ้นอยู่กับเงื่อนไขของเจ้าของที่พักแต่ละราย</li>
                <li>เงินมัดจำจะถูกคืนภายใน 3-5 วันทำการหลังคืนสินค้า</li>
                <li>WanDeeThai เก็บค่าธรรมเนียม 5% จากยอดการจองทุกครั้ง</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. การยกเลิกการจอง</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>ยกเลิกก่อน 48 ชั่วโมง — คืนเงินเต็มจำนวน</li>
                <li>ยกเลิกก่อน 24 ชั่วโมง — คืนเงิน 50%</li>
                <li>ยกเลิกน้อยกว่า 24 ชั่วโมง — ไม่คืนเงิน</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. ข้อจำกัดความรับผิด</h2>
              <p>WanDeeThai ไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้งานแพลตฟอร์ม การทำธุรกรรมระหว่างผู้ใช้ หรือเหตุการณ์ที่อยู่นอกเหนือการควบคุม</p>
            </section>
  
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. การติดต่อ</h2>
              <p>หากมีข้อสงสัย ติดต่อเราได้ที่ <a href="mailto:ice300074@gmail.com" className="text-orange-500 hover:underline">ice300074@gmail.com</a></p>
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