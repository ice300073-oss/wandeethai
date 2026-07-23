'use client'

import { useEffect, useRef, useState } from 'react'

type Pt = { lat: number; lng: number }
type Attraction = { id: string; name: string; emoji?: string; lat: number; lng: number }

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

// ระยะทางเส้นตรง (กม.) — ใช้โชว์คร่าวๆ ในรายการ
function haversine(a: Pt, b: Pt): number {
  const R = 6371, toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export default function TripMap({ center, title, attractions }: { center: Pt; title: string; attractions: Attraction[] }) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const routeRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null)
  const [activeRoute, setActiveRoute] = useState<{ id: string; km: number; min: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    loadLeaflet().then((L) => {
      if (cancelled || !mapEl.current || mapRef.current) return
      const map = L.map(mapEl.current, { scrollWheelZoom: false }).setView([center.lat, center.lng], 14)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© OpenStreetMap',
      }).addTo(map)

      L.marker([center.lat, center.lng], {
        icon: L.divIcon({ html: `<div class="tm-pin tm-home">🏠</div>`, className: '', iconSize: [40, 40], iconAnchor: [20, 20] }),
      }).addTo(map).bindPopup(`<b>${title}</b><br/>ที่พัก`)

      const pts: [number, number][] = [[center.lat, center.lng]]
      attractions.forEach((a) => {
        L.marker([a.lat, a.lng], {
          icon: L.divIcon({ html: `<div class="tm-pin">${a.emoji || '📍'}</div>`, className: '', iconSize: [34, 34], iconAnchor: [17, 17] }),
        }).addTo(map).bindPopup(`<b>${a.name}</b>`)
        pts.push([a.lat, a.lng])
      })
      if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40] })
      setReady(true)
    }).catch(() => {})
    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [])

  const showRoute = async (a: Attraction) => {
    const L = (window as any).L
    if (!L || !mapRef.current) return
    setLoadingRoute(a.id)
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${center.lng},${center.lat};${a.lng},${a.lat}?overview=full&geometries=geojson`
      const json = await (await fetch(url)).json()
      const route = json.routes?.[0]
      if (routeRef.current) { mapRef.current.removeLayer(routeRef.current); routeRef.current = null }
      if (route) {
        const latlngs = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]])
        const line = L.polyline(latlngs, { color: '#f97316', weight: 5, opacity: 0.95, className: 'tm-flow' }).addTo(mapRef.current)
        routeRef.current = line
        mapRef.current.fitBounds(line.getBounds(), { padding: [40, 40] })
        setActiveRoute({ id: a.id, km: route.distance / 1000, min: Math.round(route.duration / 60) })
      }
    } catch { /* ignore */ }
    setLoadingRoute(null)
  }

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

      {attractions.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs text-gray-400">🚗 กดดูเส้นทางจากที่พักไปแต่ละจุด</p>
          {attractions.map((a) => {
            const km = haversine(center, a)
            const active = activeRoute?.id === a.id
            return (
              <div key={a.id} className="flex items-center gap-2 text-sm bg-white border border-gray-100 rounded-lg px-3 py-2">
                <span className="text-lg">{a.emoji || '📍'}</span>
                <span className="flex-1 text-gray-700 truncate">{a.name}</span>
                <span className="text-gray-400 text-xs whitespace-nowrap">~{km.toFixed(1)} กม.</span>
                <button onClick={() => showRoute(a)} disabled={loadingRoute === a.id}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${active ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                  {loadingRoute === a.id ? 'กำลังหา...' : active ? `${activeRoute!.km.toFixed(1)} กม. · ${activeRoute!.min} นาที` : 'ดูเส้นทาง'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
