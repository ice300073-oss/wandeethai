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

// enabled_modes จากแอดมิน (A): 'stay' | 'rent' | 'both'
// คืนโหมดที่ควรแสดง + ต้องมีปุ่มสลับไหม
export function resolveMode(enabledModes: string | undefined, userMode: AppMode): { mode: AppMode; showSwitch: boolean } {
  const en = enabledModes || 'stay'
  if (en === 'rent') return { mode: 'rent', showSwitch: false }
  if (en === 'both') return { mode: userMode, showSwitch: true }
  return { mode: 'stay', showSwitch: false }   // default 'stay'
}
