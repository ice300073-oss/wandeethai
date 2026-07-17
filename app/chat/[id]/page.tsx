'use client'
import SiteName from '@/components/SiteName'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ChatPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const toParam = searchParams?.get('to') || ''

  const [messages, setMessages] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [otherUser, setOtherUser] = useState<{ id: string; full_name?: string } | null>(null)
  // สำหรับเจ้าของที่พัก: รายชื่อผู้ที่เคยทักมา ให้เลือกคุยทีละคน
  const [inboxThreads, setInboxThreads] = useState<{ id: string; full_name?: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const me = session?.user ?? null
      if (!me) {
        const nextPath = `/chat/${params.id}` + (toParam ? `?to=${toParam}` : '')
        window.location.href = `/auth?next=${encodeURIComponent(nextPath)}`
        return
      }
      setUser(me)

      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()
      setListing(listingData)
      if (!listingData) { setReady(true); return }

      const isOwner = me.id === listingData.owner_id
      let counterpartId = toParam || (isOwner ? '' : listingData.owner_id)

      if (isOwner && !counterpartId) {
        // เจ้าของเปิดหน้านี้โดยไม่ระบุว่าจะคุยกับใคร -> โชว์รายชื่อคนที่เคยทักมา
        const { data: threadRows } = await supabase
          .from('messages')
          .select('sender_id, receiver_id')
          .eq('listing_id', params.id)
        const ids = Array.from(new Set(
          (threadRows || []).flatMap((m: any) => [m.sender_id, m.receiver_id]).filter((id: string) => id && id !== me.id)
        ))
        if (ids.length > 0) {
          const { data: profs } = await supabase.from('public_profiles').select('id, full_name').in('id', ids)
          setInboxThreads(ids.map((id) => ({ id, full_name: profs?.find((p: any) => p.id === id)?.full_name })))
        }
        setReady(true)
        return
      }

      if (!counterpartId) { setReady(true); return }

      if (counterpartId !== listingData.owner_id) {
        const { data: prof } = await supabase.from('public_profiles').select('id, full_name').eq('id', counterpartId).single()
        setOtherUser(prof || { id: counterpartId })
      } else {
        setOtherUser({ id: counterpartId, full_name: 'เจ้าของที่พัก' })
      }

      const { data: messageData } = await supabase
        .from('messages')
        .select('*')
        .eq('listing_id', params.id)
        .or(`and(sender_id.eq.${me.id},receiver_id.eq.${counterpartId}),and(sender_id.eq.${counterpartId},receiver_id.eq.${me.id})`)
        .order('created_at', { ascending: true })
      setMessages(messageData || [])
      setReady(true)
    }
    fetchData()

    const channel = supabase
      .channel(`messages-${params.id}-${toParam}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `listing_id=eq.${params.id}`,
      }, (payload: any) => {
        setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id, toParam])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !otherUser) return
    setLoading(true)
    const content = newMessage.trim()
    const { data, error } = await supabase.from('messages').insert([{
      listing_id: params.id,
      sender_id: user.id,
      receiver_id: otherUser.id,
      content,
    }]).select().single()

    if (!error && data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]))
      setNewMessage('')
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!ready || !listing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  // เจ้าของที่พัก แต่ยังไม่ได้เลือกว่าจะคุยกับใคร -> แสดงกล่องข้อความ (inbox)
  if (!otherUser) {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-orange-500"><SiteName /></a>
          <a href="/dashboard" className="text-gray-600 hover:text-orange-500 text-sm">← Dashboard</a>
        </nav>
        <div className="max-w-lg mx-auto px-6 py-10">
          <h2 className="text-xl font-bold text-gray-800 mb-1">ข้อความ — {listing.title}</h2>
          <p className="text-gray-400 text-sm mb-6">เลือกผู้สนใจที่พักที่ต้องการคุยด้วย</p>
          {inboxThreads.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
              <p className="text-4xl mb-3">💬</p>
              ยังไม่มีใครทักมา
            </div>
          ) : (
            <div className="space-y-2">
              {inboxThreads.map((t) => (
                <a key={t.id} href={`/chat/${params.id}?to=${t.id}`}
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-orange-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                    {t.full_name?.[0] || '?'}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{t.full_name || 'ผู้ใช้งาน'}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center flex-shrink-0">
        <a href="/" className="text-2xl font-bold text-orange-500"><SiteName /></a>
        <a href={`/listings/${params.id}`} className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าประกาศ</a>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
            {user?.id === listing.owner_id ? (otherUser.full_name?.[0] || '?') : '🏠'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {user?.id === listing.owner_id ? (otherUser.full_name || 'ผู้ใช้งาน') : listing.title}
            </h2>
            <p className="text-xs text-gray-400">
              {user?.id === listing.owner_id ? listing.title : 'ติดต่อเจ้าของที่พัก'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">เริ่มบทสนทนาได้เลยครับ</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                msg.sender_id === user?.id
                  ? 'bg-orange-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-orange-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์ข้อความ... (Enter เพื่อส่ง)"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 text-gray-800 bg-white"
          />
          <button
            onClick={handleSend}
            disabled={loading || !newMessage.trim()}
            className="bg-orange-500 text-white px-5 py-3 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all">
            ส่ง
          </button>
        </div>
      </div>
    </main>
  )
}
