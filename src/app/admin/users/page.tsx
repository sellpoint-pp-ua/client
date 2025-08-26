'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  CalendarIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'

type User = {
  id: string
  username: string
  email?: string
  emailConfirmed: boolean
  roles: string[]
  createdAt: string
  avatar?: {
    url?: string
    fileName?: string
  }
  additionalInfo?: {
    firstName?: string
    lastName?: string
    phoneNumber?: string
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Отримуємо всіх користувачів з серверного API
      const response = await fetch('/api/users/regular')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Помилка завантаження користувачів')
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      console.log('Testing connection to server API...')
      // Тестуємо з'єднання з серверним API для отримання користувачів
      const response = await fetch('/api/test-connection')
      const result = await response.json()
      console.log('Connection test result:', result)
      
      if (result.success) {
        alert(`✅ З'єднання з сервером успішне!\nСтатус: ${result.status}\nПовідомлення: ${result.message}`)
      } else {
        alert(`❌ Помилка з'єднання з сервером!\nСтатус: ${result.status}\nПовідомлення: ${result.message}`)
      }
    } catch (err) {
      console.error('Error testing connection:', err)
      alert('❌ Помилка при тестуванні з\'єднання')
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.additionalInfo?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.additionalInfo?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleDisplay = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'Користувач'
    
    const roleMap: { [key: string]: string } = {
      'admin': 'Адміністратор',
      'moderator': 'Модератор',
      'user': 'Користувач'
    }
    
    return roles.map(role => roleMap[role] || role).join(', ')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Завантаження користувачів...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-2xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Користувачі</h1>
          <p className="text-gray-600">Перегляд всіх користувачів системи</p>
          
          {/* Кнопка тестування з'єднання */}
          <div className="mt-4">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm mr-2"
            >
              🧪 Тестувати з&apos;єднання з сервером
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/test-server')
                  const result = await response.json()
                  console.log('Server test result:', result)
                  alert(`Результат тесту серверного API:\n${JSON.stringify(result, null, 2)}`)
                } catch (err) {
                  console.error('Error testing server:', err)
                  alert('❌ Помилка при тестуванні серверного API')
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              🔧 Тестувати серверне API
            </button>
          </div>
        </div>

        {/* Пошук */}
        <div className="bg-white rounded-lg shadow border p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Пошук користувачів за ім&apos;ям, email або іменем..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всього користувачів</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Підтверджені email</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.emailConfirmed).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активні користувачі</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.roles && u.roles.length > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список користувачів */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Список користувачів ({filteredUsers.length})
            </h2>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Користувачів не знайдено</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Спробуйте змінити пошуковий запит' : 'Список користувачів порожній'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Користувач
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ролі
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата реєстрації
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Додаткова інформація
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar?.url ? (
                              <Image
                                src={user.avatar.url}
                                alt={user.username}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.email ? (
                            <>
                              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{user.email}</span>
                              {user.emailConfirmed && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Підтверджено
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Не вказано</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {getRoleDisplay(user.roles)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.additionalInfo ? (
                          <div className="space-y-1">
                            {user.additionalInfo.firstName && (
                              <div>Ім&apos;я: {user.additionalInfo.firstName}</div>
                            )}
                            {user.additionalInfo.lastName && (
                              <div>Прізвище: {user.additionalInfo.lastName}</div>
                            )}
                            {user.additionalInfo.phoneNumber && (
                              <div>Телефон: {user.additionalInfo.phoneNumber}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">Не вказано</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


