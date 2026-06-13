'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)

      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()
      setListing(listingData)

      const { data: messageData } = await supabase
        .from('messages')
        .select('*')
        .eq('listing_id', params.id)
        .order('created_at', { ascending: true })
      setMessages(messageData || [])
    }
    fetchData()

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `listing_id=eq.${params.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return
    setLoading(true)

    await supabase.from('messages').insert([{
      listing_id: params.id,
      sender_id: user.id,
      receiver_id: listing.owner_id,
      content: newMessage.trim(),
    }])

    setNewMessage('')
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!listing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center flex-shrink-0">
        <a href="/" className="text-2xl font-bold text-orange-500">WanDeeThai</a>
        <a href={`/listings/${params.id}`} className="text-gray-600 hover:text-orange-500 text-sm">← กลับหน้าประกาศ</a>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
            🏠
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{listing.title}</h2>
            <p className="text-xs text-gray-400">ติดต่อเจ้าของที่พัก</p>
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