'use client'

import { useEffect, useRef, useState } from 'react'
import { parseLatLng } from '@/components/LocationPicker'

type Pt = { lat: number; lng: number }
type Attraction = { id: string; name: string; emoji?: string; lat: number; lng: number }

const COLORS = ['#f97316', '#0ea5e9', '#22c55e', '#a855f7', '#ef4444', '#eab308', '#ec4899', '#14b8a6']

// โหลด Leaflet จาก CDN ตอนรัน (ไม่ต้องเพิ่ม dependency / ไม่มีปัญหา SSR)
let leafletPromise: Promise<any> | null = null
function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject()
  if ((window as any).L) return Promise.resolve((window as any).L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'; link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.onload = () => resolve((window as any).L)
    s.onerror = reject
    document.body.appendChild(s)
  })
  return leafletPromise
}

// กัน XSS: escape ข้อความก่อนยัดเข้า HTML ของป๊อปอัพ Leaflet
function esc(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ))
}

function haversine(a: Pt, b: Pt): number {
  const R = 6371, toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export default function TripMap({ center, title, attractions }: { center: Pt; title: string; attractions: Attraction[] }) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const layersRef = useRef<Record<string, any>>({})   // attractionId -> polyline layer
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)          // id ที่กำลังโหลด (หรือ 'all')
  const [routes, setRoutes] = useState<Record<string, { km: number; min: number; color: string }>>({})

  // จุดของผู้ที่มาดู (เช่น ที่ทำงาน) — วางพิกัดหรือชื่อสถานที่เอง
  const customMarkerRef = useRef<any>(null)
  const customRouteRef = useRef<any>(null)
  const [customInput, setCustomInput] = useState('')
  const [customBusy, setCustomBusy] = useState(false)
  const [customErr, setCustomErr] = useState('')
  const [customInfo, setCustomInfo] = useState<{ km: number; min: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    loadLeaflet().then((L) => {
      if (cancelled || !mapEl.current || mapRef.current) return
      const map = L.map(mapEl.current, { scrollWheelZoom: false }).setView([center.lat, center.lng], 14)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map)

      L.marker([center.lat, center.lng], {
        icon: L.divIcon({ html: `<div class="tm-pin tm-home">🏠</div>`, className: '', iconSize: [40, 40], iconAnchor: [20, 20] }),
      }).addTo(map).bindPopup(`<b>${esc(title)}</b><br/>ที่พัก`)

      const pts: [number, number][] = [[center.lat, center.lng]]
      attractions.forEach((a) => {
        L.marker([a.lat, a.lng], {
          icon: L.divIcon({ html: `<div class="tm-pin">${a.emoji || '📍'}</div>`, className: '', iconSize: [34, 34], iconAnchor: [17, 17] }),
        }).addTo(map).bindPopup(`<b>${esc(a.name)}</b>`)
        pts.push([a.lat, a.lng])
      })
      if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40] })
      setReady(true)
    }).catch(() => {})
    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [])

  const drawRoute = async (a: Attraction, color: string) => {
    const L = (window as any).L
    if (!L || !mapRef.current || layersRef.current[a.id]) return
    const url = `https://router.project-osrm.org/route/v1/driving/${center.lng},${center.lat};${a.lng},${a.lat}?overview=full&geometries=geojson`
    const json = await (await fetch(url)).json()
    const route = json.routes?.[0]
    if (!route) return
    const latlngs = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]])
    const line = L.polyline(latlngs, { color, weight: 5, opacity: 0.95, className: 'tm-flow' }).addTo(mapRef.current)
    layersRef.current[a.id] = line
    setRoutes((r) => ({ ...r, [a.id]: { km: route.distance / 1000, min: Math.round(route.duration / 60), color } }))
  }

  const removeRoute = (id: string) => {
    if (layersRef.current[id]) { mapRef.current.removeLayer(layersRef.current[id]); delete layersRef.current[id] }
    setRoutes((r) => { const n = { ...r }; delete n[id]; return n })
  }

  const colorOf = (a: Attraction) => COLORS[attractions.findIndex((x) => x.id === a.id) % COLORS.length]

  const toggle = async (a: Attraction) => {
    if (layersRef.current[a.id]) { removeRoute(a.id); return }
    setBusy(a.id)
    try { await drawRoute(a, colorOf(a)) } catch {}
    setBusy(null)
  }

  const showAll = async () => {
    setBusy('all')
    try { await Promise.all(attractions.filter((a) => !layersRef.current[a.id]).map((a) => drawRoute(a, colorOf(a)))) } catch {}
    // ซูมให้เห็นทุกเส้น
    const L = (window as any).L
    const layers = Object.values(layersRef.current)
    if (L && layers.length && mapRef.current) {
      let b = L.latLngBounds([[center.lat, center.lng]])
      layers.forEach((l: any) => { b = b.extend(l.getBounds()) })
      mapRef.current.fitBounds(b, { padding: [40, 40] })
    }
    setBusy(null)
  }

  const clearAll = () => { Object.keys(layersRef.current).forEach(removeRoute) }

  // หาเส้นทางจากที่พักไป "จุดของผู้ใช้เอง" (พิกัด หรือ ชื่อสถานที่)
  const addCustomPoint = async () => {
    const L = (window as any).L
    if (!L || !mapRef.current || !customInput.trim()) return
    setCustomBusy(true); setCustomErr('')
    try {
      let pt = parseLatLng(customInput)
      if (!pt) {
        // ชื่อสถานที่ → พิกัด ผ่าน Nominatim (ฟรี) เน้นในไทย
        const q = encodeURIComponent(customInput.trim())
        const arr = await (await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=th&q=${q}`)).json()
        if (arr && arr[0]) pt = { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) }
      }
      if (!pt) { setCustomErr('หาสถานที่ไม่เจอ ลองใส่ให้ละเอียดขึ้น หรือวางพิกัด'); setCustomBusy(false); return }

      if (customMarkerRef.current) mapRef.current.removeLayer(customMarkerRef.current)
      customMarkerRef.current = L.marker([pt.lat, pt.lng], {
        icon: L.divIcon({ html: `<div class="tm-pin">📌</div>`, className: '', iconSize: [34, 34], iconAnchor: [17, 17] }),
      }).addTo(mapRef.current).bindPopup('จุดของคุณ')

      const url = `https://router.project-osrm.org/route/v1/driving/${center.lng},${center.lat};${pt.lng},${pt.lat}?overview=full&geometries=geojson`
      const route = (await (await fetch(url)).json()).routes?.[0]
      if (customRouteRef.current) mapRef.current.removeLayer(customRouteRef.current)
      if (route) {
        const latlngs = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]])
        customRouteRef.current = L.polyline(latlngs, { color: '#0d9488', weight: 5, opacity: 0.95, className: 'tm-flow' }).addTo(mapRef.current)
        mapRef.current.fitBounds(L.latLngBounds([[center.lat, center.lng], [pt.lat, pt.lng]]), { padding: [40, 40] })
        setCustomInfo({ km: route.distance / 1000, min: Math.round(route.duration / 60) })
      } else {
        mapRef.current.setView([pt.lat, pt.lng], 14)
        setCustomInfo(null)
      }
    } catch { setCustomErr('เกิดข้อผิดพลาด ลองใหม่') }
    setCustomBusy(false)
  }

  const anyRoute = Object.keys(routes).length > 0

  return (
    <div>
      <style>{`
        .tm-pin{font-size:22px;line-height:1;display:flex;align-items:center;justify-content:center;height:100%;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}
        .tm-home{font-size:26px}
        .tm-flow{stroke-dasharray:10 14;animation:tm-dash .9s linear infinite}
        @keyframes tm-dash{to{stroke-dashoffset:-48}}
        .leaflet-container{font-family:inherit}
      `}</style>

      <div ref={mapEl} style={{ height: 300 }} className="rounded-xl overflow-hidden border border-gray-100 relative z-0 bg-gray-100">
        {!ready && <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">กำลังโหลดแผนที่...</div>}
      </div>

      {/* จุดของผู้ใช้เอง — เช่น ที่ทำงาน */}
      <div className="mt-3 bg-teal-50 border border-teal-100 rounded-xl p-3">
        <p className="text-xs font-medium text-teal-700 mb-2">🧭 เช็คระยะทางไปที่ทำงาน/จุดของคุณ</p>
        <div className="flex gap-2">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomPoint()}
            placeholder="ใส่ชื่อสถานที่ เช่น นิคมอมตะซิตี้ ชลบุรี หรือวางพิกัด"
            className="flex-1 border border-teal-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-teal-400"/>
          <button onClick={addCustomPoint} disabled={customBusy || !customInput.trim()}
            className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 whitespace-nowrap">
            {customBusy ? 'กำลังหา...' : 'หาเส้นทาง'}
          </button>
        </div>
        {customErr && <p className="text-xs text-red-500 mt-1.5">{customErr}</p>}
        {customInfo && (
          <p className="text-sm text-teal-800 mt-2 font-medium">📌 จากที่พักถึงจุดของคุณ ≈ <b>{customInfo.km.toFixed(1)} กม.</b> · {customInfo.min} นาที</p>
        )}
      </div>

      {attractions.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">🚗 เส้นทางจากที่พักไปแต่ละจุด</p>
            <div className="flex gap-2">
              <button onClick={showAll} disabled={busy === 'all'}
                className="text-xs px-3 py-1.5 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50">
                {busy === 'all' ? 'กำลังหา...' : '✨ แสดงทั้งหมด'}
              </button>
              {anyRoute && (
                <button onClick={clearAll} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                  ล้าง
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            {attractions.map((a) => {
              const km = haversine(center, a)
              const r = routes[a.id]
              return (
                <div key={a.id} className="flex items-center gap-2 text-sm bg-white border border-gray-100 rounded-lg px-3 py-2">
                  {r ? <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }}/> : <span className="text-lg">{a.emoji || '📍'}</span>}
                  <span className="flex-1 text-gray-700 truncate">{a.name}</span>
                  <span className="text-gray-400 text-xs whitespace-nowrap">~{km.toFixed(1)} กม.</span>
                  <button onClick={() => toggle(a)} disabled={busy === a.id}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${r ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                    {busy === a.id ? 'กำลังหา...' : r ? `${r.km.toFixed(1)} กม. · ${r.min} นาที` : 'ดูเส้นทาง'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
