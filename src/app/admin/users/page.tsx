'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  CalendarIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon,
  FunnelIcon
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

type UserBan = {
  id: string
  userId: string
  adminId: string
  reason: string
  banType: string
  createdAt: string
  expiresAt?: string
  isActive: boolean
}

type FilterType = 'all' | 'admin' | 'moderator' | 'user' | 'seller'
type EmailFilterType = 'all' | 'confirmed' | 'unconfirmed'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userBans, setUserBans] = useState<UserBan[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingBans, setIsLoadingBans] = useState(false)
  const [roleFilter, setRoleFilter] = useState<FilterType>('all')
  const [emailFilter, setEmailFilter] = useState<EmailFilterType>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Отримуємо токен з localStorage
      const token = localStorage.getItem('auth_token')
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Додаємо токен авторизації якщо він є
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/users/all', {
        headers
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Admin access required')
        }
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

  const fetchUserBans = async (userId: string) => {
    try {
      setIsLoadingBans(true)
      
      // Отримуємо токен з localStorage
      const token = localStorage.getItem('auth_token')
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Додаємо токен авторизації якщо він є
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/users/bans?userId=${userId}`, {
        headers
      })
      
      if (response.ok) {
        const bans = await response.json()
        setUserBans(bans)
      }
    } catch (err) {
      console.error('Error fetching user bans:', err)
    } finally {
      setIsLoadingBans(false)
    }
  }

  const openUserModal = async (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
    await fetchUserBans(user.id)
  }

  const closeUserModal = () => {
    setSelectedUser(null)
    setIsModalOpen(false)
    setUserBans([])
  }

  const filteredUsers = users.filter(user => {
    // Пошук за текстом
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.additionalInfo?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.additionalInfo?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.additionalInfo?.phoneNumber?.includes(searchQuery)

    // Фільтр за ролями
    const matchesRole = roleFilter === 'all' || 
      (user.roles && user.roles.includes(roleFilter))

    // Фільтр за email
    const matchesEmail = emailFilter === 'all' ||
      (emailFilter === 'confirmed' && user.emailConfirmed) ||
      (emailFilter === 'unconfirmed' && !user.emailConfirmed)

    return matchesSearch && matchesRole && matchesEmail
  })

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
      'user': 'Користувач',
      'seller': 'Продавець'
    }
    
    return roles.map(role => roleMap[role] || role).join(', ')
  }

  const getRoleBadgeColor = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-800'
    
    if (roles.includes('admin')) return 'bg-red-100 text-red-800'
    if (roles.includes('moderator')) return 'bg-yellow-100 text-yellow-800'
    if (roles.includes('seller')) return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50">
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
      <div className="flex-1 bg-gray-50">
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
    <div className="flex-1 bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Користувачі</h1>
          <p className="text-gray-600">Огляд всіх користувачів системи</p>
        </div>

        {/* Пошук та фільтри */}
        <div className="bg-white rounded-lg shadow border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Пошук */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Пошук користувачів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Фільтр за ролями */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as FilterType)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Всі ролі</option>
                <option value="admin">Адміністратори</option>
                <option value="moderator">Модератори</option>
                <option value="user">Користувачі</option>
                <option value="seller">Продавці</option>
              </select>
            </div>

            {/* Фільтр за email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value as EmailFilterType)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Всі email</option>
                <option value="confirmed">Підтверджені</option>
                <option value="unconfirmed">Не підтверджені</option>
              </select>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Всього користувачів</p>
                <p className="text-xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EnvelopeIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Підтверджені email</p>
                <p className="text-xl font-semibold text-gray-900">
                  {users.filter(u => u.emailConfirmed).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Адміністратори</p>
                <p className="text-xl font-semibold text-gray-900">
                  {users.filter(u => u.roles && u.roles.includes('admin')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Непідтверджені</p>
                <p className="text-xl font-semibold text-gray-900">
                  {users.filter(u => !u.emailConfirmed).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список користувачів */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Список користувачів ({filteredUsers.length})
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <FunnelIcon className="h-4 w-4 mr-1" />
                Фільтровано
              </div>
            </div>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Користувачів не знайдено</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || roleFilter !== 'all' || emailFilter !== 'all' 
                  ? 'Спробуйте змінити пошуковий запит або фільтри' 
                  : 'Список користувачів порожній'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Користувач
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ролі
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата реєстрації
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            {user.avatar?.url ? (
                              <Image
                                src={user.avatar.url}
                                alt={user.username}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                              {user.username}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-32">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {user.email ? (
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <EnvelopeIcon className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-900 truncate max-w-40">{user.email}</span>
                              </div>
                              {user.emailConfirmed ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                  Підтверджено
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                  Не підтверджено
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Не вказано</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.roles)}`}>
                            {getRoleDisplay(user.roles)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm font-medium">
                        <button
                          onClick={() => openUserModal(user)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Деталі
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Модальне вікно з детальною інформацією */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Детальна інформація про користувача
                </h3>
                <button
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Основна інформація */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    {selectedUser.avatar?.url ? (
                      <Image
                        src={selectedUser.avatar.url}
                        alt={selectedUser.username}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserIcon className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedUser.username}</h4>
                    <p className="text-sm text-gray-500">ID: {selectedUser.id}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.roles)}`}>
                      {getRoleDisplay(selectedUser.roles)}
                    </span>
                  </div>
                </div>

                {/* Email інформація */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Email</h5>
                  <div className="flex items-center">
                    {selectedUser.email ? (
                      <>
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedUser.email}</span>
                        {selectedUser.emailConfirmed ? (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Підтверджено
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Не підтверджено
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Не вказано</span>
                    )}
                  </div>
                </div>

                {/* Додаткова інформація */}
                {selectedUser.additionalInfo && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Додаткова інформація</h5>
                    <div className="space-y-2">
                      {selectedUser.additionalInfo.firstName && (
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {selectedUser.additionalInfo.firstName}
                            {selectedUser.additionalInfo.lastName && ` ${selectedUser.additionalInfo.lastName}`}
                          </span>
                        </div>
                      )}
                      {selectedUser.additionalInfo.phoneNumber && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{selectedUser.additionalInfo.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Дата реєстрації */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Дата реєстрації</h5>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>

                {/* Історія банів */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Історія банів</h5>
                  {isLoadingBans ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-600">Завантаження...</p>
                    </div>
                  ) : userBans.length > 0 ? (
                    <div className="space-y-2">
                      {userBans.map((ban) => (
                        <div key={ban.id} className="bg-red-50 border border-red-200 rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-red-800">Бан активний</p>
                              <p className="text-sm text-red-600">{ban.reason}</p>
                              <p className="text-xs text-red-500">Тип: {ban.banType}</p>
                              <p className="text-xs text-red-500">Створено: {formatDate(ban.createdAt)}</p>
                              {ban.expiresAt && (
                                <p className="text-xs text-red-500">Закінчується: {formatDate(ban.expiresAt)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Історія банів відсутня</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeUserModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Закрити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


