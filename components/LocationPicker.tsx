'use client'

import { useState } from 'react'

type Coords = { lat: number; lng: number }

// แปลงข้อความ (พิกัด หรือ ลิงก์ Google Maps) เป็น lat/lng
export function parseLatLng(input: string): Coords | null {
  if (!input) return null
  const tryPair = (a?: string, b?: string): Coords | null => {
    if (!a || !b) return null
    const lat = parseFloat(a), lng = parseFloat(b)
    if (isNaN(lat) || isNaN(lng)) return null
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
    return { lat, lng }
  }
  // ลิงก์ Google Maps: @lat,lng
  let m = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return tryPair(m[1], m[2])
  // ลิงก์: !3dLAT!4dLNG
  m = input.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (m) return tryPair(m[1], m[2])
  // ลิงก์: q=lat,lng หรือ query=lat,lng
  m = input.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return tryPair(m[1], m[2])
  // พิกัดล้วน "lat, lng"
  m = input.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/)
  if (m) return tryPair(m[1], m[2])
  return null
}

export default function LocationPicker({
  value, onChange,
}: {
  value: Coords | null
  onChange: (c: Coords | null) => void
}) {
  const [raw, setRaw] = useState(value ? `${value.lat}, ${value.lng}` : '')
  const [err, setErr] = useState('')

  const handle = (text: string) => {
    setRaw(text)
    if (!text.trim()) { setErr(''); onChange(null); return }
    const c = parseLatLng(text)
    if (c) { setErr(''); onChange(c) }
    else { setErr('อ่านพิกัดไม่ได้ — วางพิกัดแบบ 12.6789, 100.9012 หรือลิงก์ Google Maps'); }
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">📍 ปักหมุดตำแหน่ง (พิกัด)</label>
      <input
        value={raw}
        onChange={(e) => handle(e.target.value)}
        placeholder="วางพิกัด เช่น 12.6789, 100.9012 หรือวางลิงก์ Google Maps"
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-400"/>

      <div className="text-xs text-gray-400 mt-1 leading-relaxed">
        วิธีหาพิกัด: เปิด <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Google Maps</a> →
        กดค้าง (มือถือ) หรือคลิกขวา (คอม) ที่ตำแหน่งที่พักจริง → พิกัดจะขึ้นมา → ก็อปมาวางช่องนี้
      </div>
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}

      {value && (
        <div className="mt-3">
          <p className="text-xs text-green-600 mb-1">✓ ปักหมุดที่: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}</p>
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <iframe
              title="พรีวิวตำแหน่ง"
              width="100%" height="200" loading="lazy" style={{ border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${value.lat},${value.lng}&z=17&output=embed`}/>
          </div>
        </div>
      )}
    </div>
  )
}
