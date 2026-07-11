import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export const runtime = 'nodejs'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wandeethai.vercel.app'

// เริ่มขั้นตอน login ด้วย LINE — พาผู้ใช้ไปหน้าอนุญาตของ LINE
export async function GET(req: NextRequest) {
  const channelId = process.env.LINE_CHANNEL_ID
  if (!channelId) {
    return NextResponse.redirect(`${SITE_URL}/auth?error=line_not_configured`)
  }

  const state = randomBytes(16).toString('hex')
  const next = req.nextUrl.searchParams.get('next') || '/'
  const redirectUri = `${SITE_URL}/api/auth/line/callback`

  const authorizeUrl = new URL('https://access.line.me/oauth2/v2.1/authorize')
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', channelId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('state', state)
  // profile+openid = ชื่อ/รูป, email = อีเมล (ต้องขอ permission email ใน LINE console ด้วย)
  authorizeUrl.searchParams.set('scope', 'profile openid email')

  const res = NextResponse.redirect(authorizeUrl.toString())
  const cookieOpts = { httpOnly: true, secure: true, sameSite: 'lax' as const, maxAge: 600, path: '/' }
  res.cookies.set('line_oauth_state', state, cookieOpts)
  res.cookies.set('line_oauth_next', next, cookieOpts)
  return res
}
