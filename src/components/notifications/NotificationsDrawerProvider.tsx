'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type NotificationItem = {
  id: string
  type: number
  message: string
  from?: string | null
  to?: string | null
  createdAt: string
  metadataUrl?: string | null
  isHighPriority?: boolean
}

type NotificationsContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  notifications: NotificationItem[]
  unreadCount: number
  refresh: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsDrawerProvider')
  return ctx
}

type Props = { children: React.ReactNode }

export default function NotificationsDrawerProvider({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [mounted, setMounted] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const body = document.body
    const scrollY = window.scrollY
    if (isOpen) {
      body.classList.add('lock-scroll')
      body.style.top = `-${scrollY}px`
    } else {
      body.classList.remove('lock-scroll')
      body.style.top = ''
      window.scrollTo(0, scrollY)
    }
    return () => {
      body.classList.remove('lock-scroll')
      body.style.top = ''
    }
  }, [isOpen, mounted])

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const refresh = useCallback(async () => {
    if (!token) { setNotifications([]); return }
    try {
      const res = await fetch('https://api.sellpoint.pp.ua/Notification/GetAllNotificationsByMyId', {
        headers: { accept: '*/*', Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) { setNotifications([]); return }
      const data: NotificationItem[] = await res.json()
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setNotifications(data)
    } catch {
      setNotifications([])
    }
  }, [token])

  useEffect(() => { refresh() }, [refresh])

  const unreadCount = useMemo(() => notifications.length, [notifications])

  const ctx = useMemo(() => ({ isOpen, open, close, notifications, unreadCount, refresh }), [isOpen, open, close, notifications, unreadCount, refresh])

  return (
    <NotificationsContext.Provider value={ctx}>
      {children}

      {/* Overlay */}
      <div
        aria-hidden
        onClick={close}
        className={`fixed inset-0 z-[90] bg-gray-700/30 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-[95] h-full w-[400px] max-w-[92vw] bg-white shadow-2xl rounded-l-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center p-3 border-b border-gray-100">
          <h2 className="text-[18px] font-bold text-gray-900">Сповіщення</h2>
          <button aria-label="Закрити" onClick={close} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100">✕</button>
        </div>

        {/* Content */}
        {notifications.length === 0 ? (
          <div className="flex h-[calc(100%-52px)] flex-col items-center bg-gray-50 justify-center px-6 text-center text-gray-700">
            <div className="mb-2">
              <img src="/window.svg" alt="Порожньо" className="h-28 w-auto select-none" />
            </div>
            <div className="text-[18px] font-bold text-gray-900">Поки немає сповіщень про замовлення</div>
            <div className="mt-2 text-[14px] text-gray-600 leading-snug">
              <div>Нумо до покупок! Перевірити актуальний статус своїх</div>
              <div>замовлень завжди можна тут</div>
            </div>
            <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#6f2cff] hover:cursor-pointer px-10 py-2 text-white hover:bg-[#5a23cc] transition-colors">До покупок</Link>
          </div>
        ) : (
          <div className="flex h:[calc(100%-52px)] h-[calc(100%-52px)] flex-col bg-gray-50">
            <div className="mt-2 flex-1 overflow-y-auto px-3 pb-3">
              {notifications.map((n) => (
                <div key={n.id} className="mb-2">
                  <div className={`rounded-xl p-3 shadow-sm border ${n.isHighPriority ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-8 w-8 flex items-center justify-center rounded-lg ${n.isHighPriority ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>🔔</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{n.message}</p>
                        <div className="mt-1 flex items-center gap-2 text-[12px] text-gray-500">
                          <span>{new Date(n.createdAt).toLocaleString('uk-UA')}</span>
                          {n.metadataUrl ? (
                            <a href={n.metadataUrl} className="text-[#4563d1] hover:underline" target="_blank" rel="noopener noreferrer">Докладніше</a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </NotificationsContext.Provider>
  )
}


