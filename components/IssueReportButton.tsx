'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function IssueReportButton() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async () => {
    if (!text.trim()) return
    setSending(true)
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('reports').insert([{
      listing_id: null,
      reporter_id: session?.user?.id ?? null,
      reason: text.trim(),
      page_url: typeof window !== 'undefined' ? window.location.href : null,
    }])
    setSending(false)
    setSent(true)
    setText('')
    setTimeout(() => { setSent(false); setOpen(false) }, 1800)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="แจ้งปัญหา"
        className="fixed bottom-5 right-5 z-40 bg-gray-800 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg hover:bg-gray-900 flex items-center gap-1.5">
        🛠️ แจ้งปัญหา
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          onClick={() => !sending && setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            {sent ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-gray-700 font-medium">ขอบคุณครับ ทีมงานจะรีบดูให้</p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-gray-800 mb-1">แจ้งปัญหา / ข้อเสนอแนะ</h3>
                <p className="text-xs text-gray-400 mb-3">เจอบั๊ก ใช้งานไม่ได้ หรืออยากแนะนำอะไร บอกเราได้เลย</p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  placeholder="อธิบายปัญหาที่เจอ..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-400 resize-none"/>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    ยกเลิก
                  </button>
                  <button onClick={submit} disabled={sending || !text.trim()}
                    className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                    {sending ? 'กำลังส่ง...' : 'ส่งเลย'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
