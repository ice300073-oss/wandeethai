'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function NotificationBell() {
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<any>(null)

  const unread = items.filter((n) => !n.is_read).length

  useEffect(() => {
    let channel: any
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id ?? null
      setUserId(uid)
      if (!uid) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(20)
      setItems(data || [])

      // เด้งสดเมื่อมีแจ้งเตือนใหม่
      channel = supabase
        .channel(`notif-${uid}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${uid}`,
        }, (payload: any) => {
          setItems((prev) => [payload.new, ...prev])
          setToast(payload.new)
          setTimeout(() => setToast(null), 6000)
        })
        .subscribe()
    }
    init()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])

  const markAllRead = async () => {
    if (!userId || unread === 0) return
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
  }

  const openItem = async (n: any) => {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x))
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
    }
    window.location.href = n.link || '/dashboard'
  }

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'เมื่อครู่'
    if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`
    if (s < 86400) return `${Math.floor(s / 3600)} ชม.ที่แล้ว`
    return `${Math.floor(s / 86400)} วันที่แล้ว`
  }

  if (!userId) return null

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        aria-label="แจ้งเตือน"
        className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}/>
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <span className="font-semibold text-gray-800 text-sm">การแจ้งเตือน</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">ยังไม่มีการแจ้งเตือน</p>
              ) : (
                items.map((n) => (
                  <button key={n.id} onClick={() => openItem(n)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.is_read ? 'bg-orange-50/50' : ''}`}>
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* toast เด้งสดเมื่อมีแจ้งเตือนใหม่ */}
      {toast && (
        <button onClick={() => { setToast(null); window.location.href = toast.link || '/dashboard' }}
          className="fixed bottom-20 right-5 z-50 bg-white border border-orange-200 shadow-lg rounded-xl px-4 py-3 max-w-xs text-left animate-pulse">
          <p className="text-sm font-medium text-gray-800">{toast.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{toast.body}</p>
        </button>
      )}
    </div>
  )
}
