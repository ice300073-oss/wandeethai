import { createClient } from '@supabase/supabase-js'

// key เหล่านี้เป็น public (ขึ้นต้น NEXT_PUBLIC_ / sb_publishable_) ออกแบบมาให้เปิดเผยในเบราว์เซอร์อยู่แล้ว
// ปกป้องด้วย Row Level Security ฝั่ง Supabase — ใส่ค่า default ไว้เพื่อให้รันได้ทุกที่ (StackBlitz/Vercel) โดยไม่ต้องตั้ง env
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iledkzfrududfepistio.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_BvFkwVVKtp7z6KxKQsNIvA_nHBEUo3g'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)