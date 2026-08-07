// ระบบ "โหมด" — 2 แอปในเว็บเดียว
export type AppMode = 'stay' | 'rent'

export const MODE_LABEL: Record<AppMode, string> = {
  stay: '🏖️ ที่พักท่องเที่ยว',
  rent: '🏠 เช่ารายเดือน',
}

// เลือกโหมดที่ผู้ใช้กำลังดู (B) — จำใน localStorage
export function getMode(): AppMode {
  if (typeof window === 'undefined') return 'stay'
  const m = localStorage.getItem('app_mode')
  return m === 'rent' ? 'rent' : 'stay'
}

export function setMode(m: AppMode) {
  if (typeof window !== 'undefined') localStorage.setItem('app_mode', m)
}

// หมวดหมู่แยกตามโหมด
export const STAY_CATEGORIES = [
  { value: 'homestay', label: '🏡 โฮมสเตย์' },
  { value: 'villa', label: '🏖️ พูลวิลล่า' },
  { value: 'hotel', label: '🏨 โรงแรม' },
  { value: 'resort', label: '🌿 รีสอร์ท' },
  { value: 'guesthouse', label: '🎒 เกสต์เฮาส์' },
  { value: 'guide', label: '🗺️ ไกด์ท้องถิ่น' },
]

export const RENT_CATEGORIES = [
  { value: 'house', label: '🏠 บ้านเดี่ยว' },
  { value: 'townhouse', label: '🏘️ ทาวน์เฮาส์' },
  { value: 'condo', label: '🏢 คอนโด' },
  { value: 'apartment', label: '🛏️ อพาร์ตเมนต์' },
  { value: 'room', label: '🚪 ห้องเช่า / หอพัก' },
  { value: 'commercial', label: '🏪 ตึกแถว / อาคารพาณิชย์' },
]

export function categoriesForMode(mode: AppMode) {
  return mode === 'rent' ? RENT_CATEGORIES : STAY_CATEGORIES
}

// รวม label ทุกหมวด (ไว้ใช้แสดงป้ายในหน้ารายละเอียด/รายการ)
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  [...STAY_CATEGORIES, ...RENT_CATEGORIES].map((c) => [c.value, c.label])
)

// enabled_modes จากแอดมิน (A): 'stay' | 'rent' | 'both'
// คืนโหมดที่ควรแสดง + ต้องมีปุ่มสลับไหม
export function resolveMode(enabledModes: string | undefined, userMode: AppMode): { mode: AppMode; showSwitch: boolean } {
  const en = enabledModes || 'stay'
  if (en === 'rent') return { mode: 'rent', showSwitch: false }
  if (en === 'both') return { mode: userMode, showSwitch: true }
  return { mode: 'stay', showSwitch: false }   // default 'stay'
}
