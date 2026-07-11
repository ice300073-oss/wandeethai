// เช็คว่าโปรไฟล์ผู้ใช้กรอกครบพอจะลงประกาศที่พักได้หรือยัง
// ต้องมี: ชื่อ, เบอร์โทร, และช่องทางรับเงินอย่างน้อย 1 อย่าง (PromptPay หรือ อัปโหลดรูป QR)
export function isProfileCompleteForHosting(user: any): boolean {
  const meta = user?.user_metadata || {}
  const hasName = !!meta.full_name?.trim()
  const hasPhone = !!meta.phone?.trim()
  const hasPayout = !!meta.promptpay?.trim() || !!meta.qr_image_url
  return hasName && hasPhone && hasPayout
}

export function missingProfileFields(user: any): string[] {
  const meta = user?.user_metadata || {}
  const missing: string[] = []
  if (!meta.full_name?.trim()) missing.push('ชื่อ-นามสกุล')
  if (!meta.phone?.trim()) missing.push('เบอร์โทรศัพท์')
  if (!meta.promptpay?.trim() && !meta.qr_image_url) missing.push('PromptPay หรือรูป QR รับเงิน')
  return missing
}
