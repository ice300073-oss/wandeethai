export default function NotFound() {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-8xl font-bold text-blue-600 mb-4">404</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบหน้านี้</h1>
          <p className="text-gray-400 mb-8">หน้าที่คุณค้นหาอาจถูกลบหรือย้ายไปแล้ว</p>
          <a href="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block">
            กลับหน้าแรก
          </a>
        </div>
      </main>
    )
  }