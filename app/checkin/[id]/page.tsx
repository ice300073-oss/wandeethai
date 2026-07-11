'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type State = 'loading' | 'notfound' | 'notowner' | 'already' | 'done'

export default function CheckinPage({ params }: { params: { id: string } }) {
  const [state, setState] = useState<State>('loading')
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      if (!user) { window.location.href = `/auth?next=/checkin/${params.id}`; return }

      const { data: b } = await supabase
        .from('bookings')
        .select('*, listings(title, owner_id)')
        .eq('id', params.id)
        .single()

      if (!b) { setState('notfound'); return }
      setBooking(b)

      // เช็คอินได้เฉพาะ "เจ้าของที่พัก" ของการจองนี้เท่านั้น
      if (b.listings?.owner_id !== user.id) { setState('notowner'); return }
      if (b.checked_in_at) { setState('already'); return }

      await supabase.from('bookings')
        .update({ checked_in_at: new Date().toISOString() })
        .eq('id', params.id)
      setState('done')
    }
    run()
  }, [params.id])

  const guest = booking?.guest_name || 'ลูกค้า'
  const dates = booking ? `${booking.start_date} → ${booking.end_date}` : ''

  const Box = ({ icon, title, sub, color }: any) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center">
        <p className="text-5xl mb-3">{icon}</p>
        <h1 className={`text-xl font-bold mb-1 ${color}`}>{title}</h1>
        {sub && <p className="text-gray-500 text-sm">{sub}</p>}
        <a href="/dashboard" className="mt-6 inline-block bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600">
          ไป Dashboard
        </a>
      </div>
    </div>
  )

  if (state === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังตรวจสอบ...</p>
    </div>
  )
  if (state === 'notfound') return <Box icon="❓" title="ไม่พบการจองนี้" color="text-gray-800"/>
  if (state === 'notowner') return <Box icon="🚫" title="คุณไม่ใช่เจ้าของที่พักนี้" sub="เฉพาะเจ้าของที่พักเท่านั้นที่เช็คอินลูกค้าได้" color="text-red-500"/>
  if (state === 'already') return <Box icon="✓" title="เช็คอินไปแล้ว" sub={`${guest} · ${dates}`} color="text-teal-600"/>
  return <Box icon="🎉" title="เช็คอินสำเร็จ!" sub={`${guest} · ${dates} · ${booking?.listings?.title || ''}`} color="text-green-600"/>
}
