'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye } from 'lucide-react'

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
  activeTab: 'unread' | 'read'
  setActiveTab: (tab: 'unread' | 'read') => void
  markAsRead: (notificationId: string) => Promise<void>
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
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread')
  const [unreadCount, setUnreadCount] = useState(0)

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

  const refresh = useCallback(async (tab?: 'unread' | 'read') => {
    if (!token) { setNotifications([]); return }
    try {
      const currentTab = tab || activeTab
      const endpoint = currentTab === 'unread' 
        ? 'https://api.sellpoint.pp.ua/Notification/GetUnSeenNotifications'
        : 'https://api.sellpoint.pp.ua/Notification/GetSeenNotifications'
      
      const res = await fetch(endpoint, {
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
  }, [token, activeTab])

  useEffect(() => { refresh() }, [refresh])

  const updateUnreadCount = useCallback(async () => {
    if (!token) { setUnreadCount(0); return }
    try {
      const res = await fetch('https://api.sellpoint.pp.ua/Notification/GetUnSeenNotifications', {
        headers: { accept: '*/*', Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) { setUnreadCount(0); return }
      const data: NotificationItem[] = await res.json()
      setUnreadCount(data.length)
    } catch {
      setUnreadCount(0)
    }
  }, [token])

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!token) return
    try {
      await fetch(`https://api.sellpoint.pp.ua/Notification/SeeNotification?notificationId=${notificationId}`, {
        method: 'POST',
        headers: { accept: '*/*', Authorization: `Bearer ${token}` },
      })
      // Обновляем список непрочитанных уведомлений
      if (activeTab === 'unread') {
        await refresh('unread')
      }
      // Обновляем счетчик непрочитанных
      await updateUnreadCount()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [token, activeTab, refresh, updateUnreadCount])

  const markAllAsRead = useCallback(async () => {
    if (!token || activeTab !== 'unread' || notifications.length === 0) return
    try {
      // Помечаем все непрочитанные уведомления как прочитанные
      await Promise.all(
        notifications.map(notification => 
          fetch(`https://api.sellpoint.pp.ua/Notification/SeeNotification?notificationId=${notification.id}`, {
            method: 'POST',
            headers: { accept: '*/*', Authorization: `Bearer ${token}` },
          })
        )
      )
      // Обновляем список непрочитанных уведомлений
      await refresh('unread')
      // Обновляем счетчик непрочитанных
      await updateUnreadCount()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [token, activeTab, notifications, refresh, updateUnreadCount])

  useEffect(() => { updateUnreadCount() }, [updateUnreadCount])

  const ctx = useMemo(() => ({ 
    isOpen, 
    open, 
    close, 
    notifications, 
    unreadCount, 
    refresh, 
    activeTab, 
    setActiveTab, 
    markAsRead 
  }), [isOpen, open, close, notifications, unreadCount, refresh, activeTab, setActiveTab, markAsRead])

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
        <div className="p-3 border-b border-gray-100">
          <div className="relative flex items-center justify-center mb-4">
            <h2 className="text-[18px] font-bold text-gray-900">Сповіщення</h2>
            <button aria-label="Закрити" onClick={close} className="absolute hover:cursor-pointer  right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100">✕</button>
          </div>
          
          {/* Tab switcher */}
          <div className="relative flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab('unread')
                refresh('unread')
              }}
              className={`relative flex-1 py-2 px-3 hover:cursor-pointer text-sm font-medium rounded-md transition-colors ${
                activeTab === 'unread' 
                  ? 'text-[#4563d1] bg-white border-b-2 border-[#4563d1]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Не прочитані
            </button>
            <button
              onClick={() => {
                setActiveTab('read')
                refresh('read')
              }}
              className={`relative flex-1 py-2 px-3 hover:cursor-pointer text-sm font-medium rounded-md transition-colors ${
                activeTab === 'read' 
                  ? 'text-[#4563d1] bg-white border-b-2 border-[#4563d1]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Прочитані
            </button>
          </div>
        </div>

        {/* Content */}
        {notifications.length === 0 ? (
          <div className="flex h-[calc(100%-52px)] flex-col items-center bg-gray-50 justify-center px-6 text-center text-gray-700">
            <div className="mb-2">
              <img src="/notifications.png" alt="Порожньо" className="h-36 w-auto select-none" />
            </div>
            <div className="text-[18px] font-bold text-gray-900">Поки немає сповіщень про замовлення</div>
            <div className="mt-2 text-[14px] text-gray-600 leading-snug">
              <div>Нумо до покупок! Перевірити актуальний статус своїх</div>
              <div>замовлень завжди можна тут</div>
            </div>
            <Link href="/" onClick={close} className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#4563d1] hover:cursor-pointer px-10 py-2 text-white hover:bg-[#3850a8] transition-colors">До покупок</Link>
          </div>
        ) : (
          <div className="flex h-[calc(100%-88px)] flex-col bg-gray-50">
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
                          <span>Від: {n.from || 'SellPoint'}</span>
                          {n.metadataUrl ? (
                            <a href={n.metadataUrl} className="text-[#4563d1] hover:underline" target="_blank" rel="noopener noreferrer">Докладніше</a>
                          ) : null}
                        </div>
                      </div>
                      {activeTab === 'unread' && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="mt-0.5 p-1.5 rounded-lg hover:cursor-pointer hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Позначити як прочитане"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Кнопка "Прочитати всі" - видна только в селекторе "Не прочитані" */}
            {activeTab === 'unread' && (
              <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3">
                <button
                  onClick={markAllAsRead}
                  disabled={notifications.length === 0}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    notifications.length === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#4563d1] text-white hover:bg-[#364ea8] cursor-pointer'
                  }`}
                >
                  {notifications.length === 0 ? 'Немає уведомлень' : `Прочитати всі (${notifications.length})`}
                </button>
                {/* Отладочная информация */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Debug: activeTab={activeTab}, notifications={notifications.length}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </NotificationsContext.Provider>
  )
}


