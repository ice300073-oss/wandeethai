import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wandeethai.vercel.app'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iledkzfrududfepistio.supabase.co'

// LINE พากลับมาที่นี่พร้อม code — เราแลก code เป็นข้อมูลผู้ใช้ แล้ว "สะพาน" เข้า Supabase
export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const lineError = url.searchParams.get('error')

  const cookieState = req.cookies.get('line_oauth_state')?.value
  const nextPath = req.cookies.get('line_oauth_next')?.value || '/'

  const fail = (reason: string) =>
    NextResponse.redirect(`${SITE_URL}/auth?error=${encodeURIComponent(reason)}`)

  // ผู้ใช้กดยกเลิก หรือ state ไม่ตรง (กัน CSRF)
  if (lineError) return fail('line_' + lineError)
  if (!code || !state || !cookieState || state !== cookieState) return fail('line_state_mismatch')

  const channelId = process.env.LINE_CHANNEL_ID
  const channelSecret = process.env.LINE_CHANNEL_SECRET
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!channelId || !channelSecret || !serviceRole) return fail('line_not_configured')

  const redirectUri = `${SITE_URL}/api/auth/line/callback`

  try {
    // 1) แลก code เป็น token
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    })
    if (!tokenRes.ok) return fail('line_token_failed')
    const tokenJson: any = await tokenRes.json()
    const idToken = tokenJson.id_token
    if (!idToken) return fail('line_no_id_token')

    // 2) verify id_token -> ได้ profile (sub = LINE user id, name, picture, email?)
    const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
    })
    if (!verifyRes.ok) return fail('line_verify_failed')
    const profile: any = await verifyRes.json()

    const lineUserId = profile.sub as string
    if (!lineUserId) return fail('line_no_user_id')
    const displayName = profile.name || 'ผู้ใช้ LINE'
    const picture = profile.picture || null
    // ถ้า LINE ไม่ให้อีเมล (ยังไม่ผ่าน review email) ใช้อีเมลจำลองผูกกับ LINE id
    const email = profile.email || `line_${lineUserId}@users.wandeethai.app`

    // 3) สะพานเข้า Supabase ด้วย service_role (ฝั่ง server เท่านั้น)
    const admin = createClient(SUPABASE_URL, serviceRole, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // สร้าง user ถ้ายังไม่มี (ถ้ามีแล้วจะ error — ปล่อยผ่าน ถือว่าเป็น user เดิม)
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        avatar_url: picture,
        provider: 'line',
        line_user_id: lineUserId,
      },
    })

    // ออก magic link เพื่อสร้าง session แล้วพา browser ไปที่ลิงก์นั้น (Supabase จะ set session ให้เอง)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${SITE_URL}${nextPath.startsWith('/') ? nextPath : '/'}` },
    })
    if (linkErr || !linkData?.properties?.action_link) return fail('line_link_failed')

    const res = NextResponse.redirect(linkData.properties.action_link)
    res.cookies.delete('line_oauth_state')
    res.cookies.delete('line_oauth_next')
    return res
  } catch {
    return fail('line_exception')
  }
}
