'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'loading'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (type === 'loading') return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [type, onClose])

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    loading: 'bg-gray-800 text-white',
  }

  const icons = {
    success: '✅',
    error: '❌',
    loading: '⏳',
  }

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${styles[type]}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
      {type !== 'loading' && (
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
      )}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  return { toast, showToast, hideToast }
}