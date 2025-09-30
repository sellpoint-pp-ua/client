'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface GoogleAuthButtonProps {
  text?: string
  className?: string
}

declare global {
  interface Window {
    google: any
  }
}

export default function GoogleAuthButton({ 
  text = "Увійти через Google", 
  className = "" 
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { setAuthData } = useAuth()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = async () => {
      try {
        // Получаем конфиг во время выполнения (работает и в Docker)
        const res = await fetch('/api/public-config', { cache: 'no-store' })
        if (!res.ok) throw new Error('Не вдалося отримати налаштування')
        const cfg = await res.json()
        const clientId = cfg.googleClientId as string | undefined
        const apiBase = (cfg.apiUrl as string | undefined) || 'https://api.sellpoint.pp.ua/api'
        console.log('Google Client ID:', clientId)

        if (!clientId) {
          setError('Помилка сервера.')
          return
        }

        // Сохраняем базовый URL API для последующих запросов
        ;(window as any).__APP_API_BASE__ = apiBase

        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        })
        // @ts-ignore
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: 'outline', size: 'large' }
        )
      } catch (e: any) {
        setError(e?.message || 'Помилка ініціалізації Google Auth')
      }
    }

    return () => {
      // Cleanup при размонтировании компонента
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const handleCredentialResponse = async (response: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const idToken = response.credential
      
      // Отправляем запрос на наш API (используем базовый URL из публічного конфігу)
      const apiBase = (window as any).__APP_API_BASE__ || 'https://api.sellpoint.pp.ua/api'
      const loginRes = await fetch(`${apiBase}/Auth/google-login?token=${idToken}`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      })

      if (!loginRes.ok) {
        throw new Error('Помилка авторизації через Google')
      }

      const loginData = await loginRes.json()
      const sessionId = loginData.sessionId || loginData.SessionId

      if (!sessionId) {
        throw new Error('Не вдалося отримати токен сесії')
      }

      // Получаем данные пользователя
      const userRes = await fetch(`${apiBase}/User/GetUserByMyId`, {
        headers: { 
          'Authorization': `Bearer ${sessionId}`,
          'accept': '*/*'
        }
      })

      if (!userRes.ok) {
        throw new Error('Не вдалося отримати дані користувача')
      }

      const userData = await userRes.json()

      // Сохраняем данные авторизации
      localStorage.setItem('auth_token', sessionId)
      localStorage.setItem('user_display_name', userData.displayName || userData.firstName || 'Користувач')
      
      setAuthData({
        token: sessionId,
        user: userData,
        isAuthenticated: true
      })

      // Перенаправляем на главную страницу
      router.push('/')
      
    } catch (err: any) {
      console.error('Google Auth error:', err)
      setError(err.message || 'Помилка авторизації через Google')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div 
        ref={googleButtonRef}
        className={`w-full ${className}`}
        style={{ minHeight: '40px' }}
      />
      {isLoading && (
        <div className="mt-2 text-center text-sm text-gray-600">
          Авторизація...
        </div>
      )}
    </div>
  )
}