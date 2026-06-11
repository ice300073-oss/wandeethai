import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// ฝั่ง browser — ใช้กับ auth (login Google) และ component ที่เป็น 'use client'
export function createClient() {
  return createBrowserClient(url, anonKey)
}

// ฝั่ง server — ใช้ดึงข้อมูลสาธารณะใน server component (ไม่ยุ่งกับ cookie)
export function createServerReadClient() {
  return createSupabaseClient(url, anonKey)
}
