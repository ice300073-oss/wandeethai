'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// โชว์ชื่อเว็บจากแอดมิน (site_settings.site_name) — ใช้แทนคำว่า WanDeeThai ที่ hardcode
// cache ระดับ module + localStorage เพื่อไม่ให้กระพริบ
let cached: string | null = null

export default function SiteName() {
  const [name, setName] = useState<string>(() => {
    if (cached) return cached
    if (typeof window !== 'undefined') return localStorage.getItem('site_name') || 'WanDeeThai'
    return 'WanDeeThai'
  })

  useEffect(() => {
    if (cached) { setName(cached); return }
    supabase.from('site_settings').select('site_name').eq('id', 1).single()
      .then(({ data }) => {
        const n = data?.site_name?.trim() || 'WanDeeThai'
        cached = n
        setName(n)
        try { localStorage.setItem('site_name', n) } catch {}
      })
  }, [])

  return <>{name}</>
}
