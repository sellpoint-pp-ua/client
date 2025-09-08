'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/services/authService'

export default function TestAuthPage() {
  const [token, setToken] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentToken = authService.getToken()
        setToken(currentToken)
        
        if (currentToken) {
          const adminStatus = await authService.checkAdminStatus()
          setIsAdmin(adminStatus)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Тест авторизації</h1>
        <p>Завантаження...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Тест авторизації</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Токен:</h2>
          <p className="text-sm text-gray-600">
            {token ? `Довжина: ${token.length} символів` : 'Токен не знайдено'}
          </p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Статус адміністратора:</h2>
          <p className="text-sm text-gray-600">
            {isAdmin === null ? 'Не визначено' : isAdmin ? 'Адміністратор' : 'Звичайний користувач'}
          </p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Авторизований:</h2>
          <p className="text-sm text-gray-600">
            {authService.isAuthenticated() ? 'Так' : 'Ні'}
          </p>
        </div>
      </div>
    </div>
  )
}

