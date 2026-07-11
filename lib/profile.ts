// เช็คว่าโปรไฟล์ผู้ใช้กรอกครบพอจะลงประกาศที่พักได้หรือยัง
// ต้องมี: ชื่อ, เบอร์โทร, และช่องทางรับเงินอย่างน้อย 1 อย่าง (PromptPay หรือ อัปโหลดรูป QR)
export function isProfileCompleteForHosting(user: any): boolean {
  const meta = user?.user_metadata || {}
  const hasName = !!meta.full_name?.trim()
  const hasPhone = !!meta.phone?.trim()
  const hasPayout = !!meta.promptpay?.trim() || !!meta.qr_image_url
  return hasName && hasPhone && hasPayout
}

// ชื่อที่ใช้แสดงผล — ใช้ชื่อจริงก่อน, ถ้าไม่มีค่อยใช้ส่วนหน้าของอีเมล
export function displayName(user: any): string {
  return user?.user_metadata?.full_name?.trim() || user?.email?.split('@')[0] || 'ผู้ใช้'
}

// อีเมลที่โชว์ได้ — ซ่อนอีเมลจำลองของ LINE (ที่มีเลข ID) คืนค่าว่างถ้าเป็นอีเมลจำลอง
export function publicEmail(user: any): string {
  const e = user?.email || ''
  return e.endsWith('@users.wandeethai.app') ? '' : e
}

export function missingProfileFields(user: any): string[] {
  const meta = user?.user_metadata || {}
  const missing: string[] = []
  if (!meta.full_name?.trim()) missing.push('ชื่อ-นามสกุล')
  if (!meta.phone?.trim()) missing.push('เบอร์โทรศัพท์')
  if (!meta.promptpay?.trim() && !meta.qr_image_url) missing.push('PromptPay หรือรูป QR รับเงิน')
  return missing
}
