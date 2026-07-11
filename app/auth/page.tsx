'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// ข้อความ error จาก LINE login (query ?error=)
const LINE_ERROR_LABELS: Record<string, string> = {
  line_not_configured: 'ระบบ LINE ยังไม่ถูกตั้งค่า (ผู้ดูแลต้องใส่ค่า channel)',
  line_state_mismatch: 'เซสชันหมดอายุ กรุณาลองใหม่',
  line_token_failed: 'เชื่อมต่อ LINE ไม่สำเร็จ กรุณาลองใหม่',
  line_verify_failed: 'ยืนยันข้อมูล LINE ไม่สำเร็จ',
  line_link_failed: 'สร้างเซสชันไม่สำเร็จ กรุณาลองใหม่',
  line_exception: 'เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบด้วย LINE',
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    // login เสร็จ พากลับไปหน้าที่ผู้ใช้ตั้งใจจะไป (เช่น หน้าจอง) ถ้ามี ?next=
    const nextUrl = new URLSearchParams(window.location.search).get('next') || '/'

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('❌ ' + error.message)
      else {
        setMessage('✅ เข้าสู่ระบบสำเร็จ!')
        window.location.href = nextUrl
      }
    } else {
      // สมัครแบบเร็ว: ขอแค่ email + password (ชื่อ/บทบาท ค่อยกรอกทีหลังในโปรไฟล์)
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage('❌ ' + error.message)
      } else {
        setMessage('✅ สมัครสำเร็จ! กรุณาตรวจสอบ Email เพื่อยืนยัน')
        setTimeout(() => {
          setIsLogin(true)
          setMessage('✅ สมัครสำเร็จแล้ว! เข้าสู่ระบบได้เลยครับ')
        }, 2000)
      }
    }
    setLoading(false)
  }

  // กด Enter submit ได้
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleSubmit()
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) { setForgotMessage('❌ กรุณากรอก Email'); return }
    setForgotLoading(true)
    setForgotMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined,
    })
    if (error) setForgotMessage('❌ ' + error.message)
    else setForgotMessage('✅ ส่ง Email รีเซ็ตรหัสผ่านแล้ว! กรุณาตรวจสอบ Email')
    setForgotLoading(false)
  }

  // แสดง error ที่ส่งกลับมาจาก LINE callback (?error=)
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error')
    if (err) setMessage('❌ ' + (LINE_ERROR_LABELS[err] || 'เข้าสู่ระบบไม่สำเร็จ'))
  }, [])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const handleFacebookLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'facebook' })
  }

  // LINE ไม่ใช่ provider ในตัวของ Supabase → ส่งไปที่ API route ที่เราเขียนเอง
  const handleLineLogin = () => {
    const next = new URLSearchParams(window.location.search).get('next') || '/'
    window.location.href = `/api/auth/line?next=${encodeURIComponent(next)}`
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-400 text-gray-800 bg-white"

  // หน้า Forgot Password
  if (showForgot) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-orange-500 text-center mb-2">WanDeeThai</h1>
          <p className="text-gray-400 text-center mb-8">รีเซ็ตรหัสผ่าน</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">อีเมลที่ใช้สมัคร</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                placeholder="example@email.com"
                className={inputClass}
                autoFocus
              />
            </div>

            {forgotMessage && (
              <p className="text-sm text-center py-2 px-4 bg-gray-50 rounded-lg text-gray-700">{forgotMessage}</p>
            )}

            <button
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-all">
              {forgotLoading ? 'กำลังส่ง...' : 'ส่ง Email รีเซ็ตรหัสผ่าน'}
            </button>

            <button
              onClick={() => { setShowForgot(false); setForgotMessage('') }}
              className="w-full text-center text-sm text-gray-400 hover:text-orange-500 py-2">
              ← กลับหน้า Login
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        <h1 className="text-2xl font-bold text-orange-500 text-center mb-2">WanDeeThai</h1>
        <p className="text-gray-400 text-center mb-8">
          {isLogin ? 'เข้าสู่ระบบเพื่อใช้งาน' : 'สมัครสมาชิกฟรี'}
        </p>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>
            สมัครสมาชิก
          </button>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <p className="text-xs text-gray-400 bg-orange-50 rounded-lg px-3 py-2 text-center">
              สมัครเร็วๆ แค่อีเมล + รหัสผ่าน — ชื่อและบทบาทค่อยกรอกทีหลังในโปรไฟล์ได้
            </p>
          )}

          <div>
            <label className="text-sm text-gray-600 mb-1 block">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="example@email.com"
              className={inputClass}
            />
          </div>

          {/* รหัสผ่าน + ปุ่มแสดง/ซ่อน */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className={inputClass + ' pr-12'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* ลืมรหัสผ่าน */}
          {isLogin && (
            <div className="text-right">
              <button
                onClick={() => { setShowForgot(true); setForgotEmail(email) }}
                className="text-sm text-orange-500 hover:text-orange-600 hover:underline">
                ลืมรหัสผ่าน?
              </button>
            </div>
          )}

          {message && (
            <p className="text-sm text-center py-2 px-4 bg-gray-50 rounded-lg text-gray-700">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-all">
            {loading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"/>
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-2">หรือเข้าสู่ระบบด้วย</span>
            </div>
          </div>

          <button
            onClick={handleLineLogin}
            className="w-full text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: '#06C755' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738C5.383.566 0 4.935 0 10.304c0 4.813 4.269 8.844 10.036 9.608.391.084.923.258 1.058.592.121.303.079.778.039 1.083l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.176 14.398 24 12.459 24 10.304zM7.729 13.09H5.343a.63.63 0 01-.63-.63V7.687a.63.63 0 111.26 0v4.143h1.756a.63.63 0 010 1.26zm2.467-.63a.63.63 0 01-1.26 0V7.687a.63.63 0 011.26 0v4.773zm5.752 0a.63.63 0 01-.63.63.626.626 0 01-.504-.252l-2.446-3.328v2.95a.63.63 0 01-1.26 0V7.687a.628.628 0 01.63-.63.625.625 0 01.503.252l2.447 3.328V7.687a.63.63 0 011.26 0v4.773zm3.849-2.917a.63.63 0 010 1.26h-1.756v1.027h1.756a.63.63 0 010 1.26h-2.386a.63.63 0 01-.63-.63V7.687a.63.63 0 01.63-.63h2.386a.63.63 0 010 1.26h-1.756v1.026h1.756z"/>
            </svg>
            เข้าสู่ระบบด้วย LINE
          </button>

          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 bg-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            ดำเนินการด้วย Google
          </button>

          <button
            onClick={handleFacebookLogin}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 bg-white">
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            ดำเนินการด้วย Facebook
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <a href="/" className="text-orange-500 hover:underline">← กลับหน้าหลัก</a>
        </p>
      </div>
    </main>
  )
}