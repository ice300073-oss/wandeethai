'use client'

import { useEffect, useRef, useState } from 'react'

// สแกน QR ด้วยกล้องในเว็บ (รองรับ iOS/Android ผ่าน html5-qrcode)
export default function QrScanner({ onClose, onScan }: { onClose: () => void; onScan: (text: string) => void }) {
  const instRef = useRef<any>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import('html5-qrcode')
        const Html5Qrcode = (mod as any).Html5Qrcode
        const inst = new Html5Qrcode('qr-reader')
        instRef.current = inst
        await inst.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded: string) => {
            if (cancelled) return
            cancelled = true
            onScan(decoded)
          },
          () => {}
        )
      } catch (e: any) {
        setErr('เปิดกล้องไม่ได้ — กรุณาอนุญาตการใช้กล้อง หรือใช้การกรอกรหัสแทน')
      }
    })()

    return () => {
      cancelled = true
      const inst = instRef.current
      if (inst) {
        inst.stop().then(() => inst.clear()).catch(() => {})
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div id="qr-reader" className="w-full rounded-2xl overflow-hidden bg-black"/>
        {err ? (
          <p className="text-red-300 text-sm text-center mt-4">{err}</p>
        ) : (
          <p className="text-white/90 text-sm text-center mt-4">📷 ส่องกล้องไปที่ QR บนตั๋วของลูกค้า</p>
        )}
        <button onClick={onClose}
          className="mt-5 w-full bg-white text-gray-800 py-3 rounded-full text-sm font-medium hover:bg-gray-100">
          ปิดกล้อง
        </button>
      </div>
    </div>
  )
}
