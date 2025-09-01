'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  CubeIcon, 
  CurrencyDollarIcon, 
  CalendarIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'

type Seller = {
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
  productCount?: number
  totalRevenue?: number
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/users/sellers')
      if (!response.ok) {
        throw new Error('Failed to fetch sellers')
      }
      
      const data = await response.json()
      
      const sellersWithStats = await Promise.all(
        data.map(async (seller: Seller) => {
          try {
            const productsResponse = await fetch(`/api/products/all?pageSize=1000`)
            if (productsResponse.ok) {
              const products = await productsResponse.json()
              const sellerProducts = products.filter((product: { sellerId: string }) => product.sellerId === seller.id)
              
              return {
                ...seller,
                productCount: sellerProducts.length,
                totalRevenue: sellerProducts.reduce((sum: number, product: { discountPrice?: number; price: number; quantity: number }) => {
                  const price = product.discountPrice || product.price
                  return sum + (price * product.quantity)
                }, 0)
              }
            }
          } catch (err) {
            console.warn('Error fetching seller stats:', err)
          }
          
          return {
            ...seller,
            productCount: 0,
            totalRevenue: 0
          }
        })
      )
      
      setSellers(sellersWithStats)
    } catch (err) {
      console.error('Error fetching sellers:', err)
      setError('Помилка завантаження продавців')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSellers = sellers.filter(seller =>
    seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.additionalInfo?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.additionalInfo?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH'
    }).format(amount)
  }

  const getRoleDisplay = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'Продавець'
    
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
            <p className="mt-4 text-gray-600">Завантаження продавців...</p>
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
              onClick={fetchSellers}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Продавці</h1>
          <p className="text-gray-600">Перегляд продавців та їх статистики</p>
        </div>

        {/* Пошук */}
        <div className="bg-white rounded-lg shadow border p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Пошук продавців за ім&apos;ям, email або іменем..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всього продавців</p>
                <p className="text-2xl font-semibold text-gray-900">{sellers.length}</p>
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
                  {sellers.filter(s => s.emailConfirmed).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CubeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всього продуктів</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sellers.reduce((sum, seller) => sum + (seller.productCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Загальний дохід</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(sellers.reduce((sum, seller) => sum + (seller.totalRevenue || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список продавців */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Список продавців ({filteredSellers.length})
            </h2>
          </div>
          
          {filteredSellers.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Продавців не знайдено</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Спробуйте змінити пошуковий запит' : 'Список продавців порожній'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Продавець
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ролі
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Продукти
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дохід
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
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {seller.avatar?.url ? (
                              <Image
                                src={seller.avatar.url}
                                alt={seller.username}
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
                              {seller.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {seller.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {seller.email ? (
                            <>
                              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{seller.email}</span>
                              {seller.emailConfirmed && (
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
                            {getRoleDisplay(seller.roles)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CubeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {seller.productCount || 0} продуктів
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatCurrency(seller.totalRevenue || 0)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(seller.createdAt)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {seller.additionalInfo ? (
                          <div className="space-y-1">
                            {seller.additionalInfo.firstName && (
                              <div>Ім&apos;я: {seller.additionalInfo.firstName}</div>
                            )}
                            {seller.additionalInfo.lastName && (
                              <div>Прізвище: {seller.additionalInfo.lastName}</div>
                            )}
                            {seller.additionalInfo.phoneNumber && (
                              <div>Телефон: {seller.additionalInfo.phoneNumber}</div>
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


