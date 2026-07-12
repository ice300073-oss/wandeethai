'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// อ่านสีธีมที่แอดมินตั้งไว้ แล้วตั้งค่าตัวแปร --brand ให้ทั้งเว็บ (globals.css ใช้ตัวแปรนี้)
export default function BrandTheme() {
  useEffect(() => {
    supabase.from('site_settings').select('theme_color').eq('id', 1).single()
      .then(({ data }) => {
        const c = data?.theme_color
        if (c && /^#[0-9a-fA-F]{6}$/.test(c)) {
          const root = document.documentElement
          root.style.setProperty('--brand', c)
          root.style.setProperty('--brand-600', `color-mix(in srgb, ${c}, black 12%)`)
        }
      })
  }, [])
  return null
}
