'use client'

import { useEffect } from 'react'

// ลงทะเบียน Service Worker เพื่อให้ติดตั้งเป็นแอป (PWA) ได้
export default function SwRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}
