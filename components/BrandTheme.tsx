'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// อ่านสีธีม + ชื่อเว็บที่แอดมินตั้งไว้ → ตั้ง --brand (globals.css ใช้) และแก้ชื่อบนแท็บเบราว์เซอร์
export default function BrandTheme() {
  useEffect(() => {
    supabase.from('site_settings').select('theme_color, site_name').eq('id', 1).single()
      .then(({ data }) => {
        const c = data?.theme_color
        if (c && /^#[0-9a-fA-F]{6}$/.test(c)) {
          const root = document.documentElement
          root.style.setProperty('--brand', c)
          root.style.setProperty('--brand-600', `color-mix(in srgb, ${c}, black 12%)`)
        }
        // แทนคำ WanDeeThai บนชื่อแท็บด้วยชื่อที่ตั้งใหม่ (คงบริบทหน้า เช่น "เกี่ยวกับเรา — <ชื่อใหม่>")
        const name = data?.site_name?.trim()
        if (name && name !== 'WanDeeThai') {
          document.title = document.title.replace(/WanDeeThai/g, name)
        }
      })
  }, [])
  return null
}
