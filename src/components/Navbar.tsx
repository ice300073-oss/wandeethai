'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, MapPin, User, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-orange-600">WanDeeThai</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/listings" className="hover:text-orange-500 transition-colors">ค้นหาที่พัก</Link>
            <Link href="/guides" className="hover:text-orange-500 transition-colors">ไกด์ท้องถิ่น</Link>
            <Link href="/provinces" className="hover:text-orange-500 transition-colors">จังหวัดทั้งหมด</Link>
            <Link href="/host" className="hover:text-orange-500 transition-colors">ลงประกาศ</Link>
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500 text-orange-500 text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              เข้าสู่ระบบ
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-orange-100 px-4 py-4 space-y-3">
          <Link href="/listings" className="block py-2 text-gray-600 hover:text-orange-500">ค้นหาที่พัก</Link>
          <Link href="/guides" className="block py-2 text-gray-600 hover:text-orange-500">ไกด์ท้องถิ่น</Link>
          <Link href="/provinces" className="block py-2 text-gray-600 hover:text-orange-500">จังหวัดทั้งหมด</Link>
          <Link href="/host" className="block py-2 text-gray-600 hover:text-orange-500">ลงประกาศ</Link>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-orange-500 text-white text-sm font-medium"
          >
            <LogIn className="w-4 h-4" />
            เข้าสู่ระบบด้วย Google
          </button>
        </div>
      )}
    </nav>
  )
}
