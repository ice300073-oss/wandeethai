'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Role = 'renter' | 'owner' | 'both'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('both')
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

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('❌ ' + error.message)
      else {
        setMessage('✅ เข้าสู่ระบบสำเร็จ!')
        window.location.href = '/'
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) {
        setMessage('❌ ' + error.message)
      } else {
        if (data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, role })
        }
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

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const handleFacebookLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'facebook' })
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-400 text-gray-800 bg-white"

  const roles: { value: Role; label: string; desc: string }[] = [
    { value: 'renter', label: '🧳 นักท่องเที่ยว', desc: 'หาที่พัก / ไกด์' },
    { value: 'owner', label: '🏡 เจ้าของที่พัก', desc: 'ลงประกาศที่พัก' },
    { value: 'both', label: '✨ ทั้งสองอย่าง', desc: 'หาและลงประกาศ' },
  ]

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
            <>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="กรอกชื่อ-นามสกุล"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">สมัครเป็น?</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        role === r.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-200'
                      }`}>
                      <div className="text-lg mb-1">{r.label.split(' ')[0]}</div>
                      <div className="text-xs font-medium text-gray-700">{r.label.split(' ').slice(1).join(' ')}</div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-tight">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
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