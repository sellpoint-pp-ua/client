'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, FolderIcon, CubeIcon } from '@heroicons/react/24/outline'

type Category = {
  id: string
  name: string
  parentId?: string | null
}

type Product = {
  id: string
  name: string
  categoryId?: string
  categoryName?: string
}

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryIdInput, setCategoryIdInput] = useState('')
  const [searchResults, setSearchResults] = useState<Category[] | Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const getCategoryName = (category: Category): string => {
    return category.name || 'Без назви'
  }

  const searchCategories = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    setIsSearching(true)
    setSearchError(null)
    
    try {
      let results: Category[] = []
      
      try {
        const nameResponse = await fetch(`/api/categories/search?name=${encodeURIComponent(query)}&languageCode=uk`)
        if (nameResponse.ok) {
          const nameResults = await nameResponse.json()
          if (Array.isArray(nameResults)) {
            results = [...results, ...nameResults]
          } else if (nameResults.error) {
            console.warn('API returned error for name search:', nameResults.error)
          }
        }
      } catch (error) {
        console.warn('Error in name search:', error)
      }

      if (/^[a-zA-Z0-9-_]+$/.test(query) && query.length > 2) {
        try {
          const idResponse = await fetch(`/api/categories/${query}`)
          if (idResponse.ok) {
            const category = await idResponse.json()
            if (category && category.id) {
              if (!results.find(r => r.id === category.id)) {
                results.unshift(category)
              }
            }
          }
        } catch (error) {
          console.warn('Error in ID search:', error)
        }
      }

      setSearchResults(results)
      
      if (results.length === 0 && query.trim().length > 2) {
        setSearchError('Категорії не знайдено')
      }
    } catch (error) {
      console.error('Помилка пошуку категорій:', error)
      setSearchError('Помилка пошуку')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const searchProducts = async (query: string, categoryId?: string) => {
    if (!query.trim() && !categoryId) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    setIsSearching(true)
    setSearchError(null)
    
    try {
      let results: Product[] = []
      
      if (query.trim()) {
        try {
          const nameResponse = await fetch(`/api/products/search?name=${encodeURIComponent(query)}&languageCode=uk`)
          if (nameResponse.ok) {
            const nameResults = await nameResponse.json()
            if (Array.isArray(nameResults)) {
              results = [...results, ...nameResults]
            }
          }
        } catch (error) {
          console.warn('Error in product name search:', error)
        }
      }

      if (categoryId && categoryId.trim()) {
        try {
          const categoryResponse = await fetch(`/api/products/all?categoryId=${encodeURIComponent(categoryId)}&pageSize=50`)
          if (categoryResponse.ok) {
            const categoryResults = await categoryResponse.json()
            if (Array.isArray(categoryResults)) {
              categoryResults.forEach((product: Product) => {
                if (!results.find(r => r.id === product.id)) {
                  results.push(product)
                }
              })
            }
          }
        } catch (error) {
          console.warn('Error in category ID search:', error)
        }
      }

      setSearchResults(results)
      
      if (results.length === 0 && (query.trim() || categoryId?.trim())) {
        setSearchError('Продукти не знайдено')
      }
    } catch (error) {
      console.error('Помилка пошуку продуктів:', error)
      setSearchError('Помилка пошуку')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'categories') {
        if (searchQuery.trim().length >= 2) {
          searchCategories(searchQuery)
        } else {
          setSearchResults([])
          setSearchError(null)
        }
      } else if (activeTab === 'products') {
        if (searchQuery.trim().length >= 2 || categoryIdInput.trim()) {
          searchProducts(searchQuery, categoryIdInput)
        } else {
          setSearchResults([])
          setSearchError(null)
        }
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, categoryIdInput, activeTab])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (!value.trim()) {
      setSearchResults([])
      setSearchError(null)
    }
  }

  const handleCategoryIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCategoryIdInput(value)
    if (!value.trim()) {
      setSearchResults([])
      setSearchError(null)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setCategoryIdInput('')
    setSearchResults([])
    setSearchError(null)
  }

  const renderSearchResults = () => {
    if (activeTab === 'categories') {
      return (searchResults as Category[]).map((category) => (
        <div key={category.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{getCategoryName(category)}</h3>
              <p className="text-sm text-gray-600">ID: {category.id}</p>
            </div>
            <a
              href={`/admin/categories/${category.id}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Переглянути
            </a>
          </div>
        </div>
      ))
    } else {
      return (searchResults as Product[]).map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">ID: {product.id}</p>
              {product.categoryId && (
                <p className="text-xs text-gray-500">Категорія ID: {product.categoryId}</p>
              )}
              {product.categoryName && (
                <p className="text-xs text-gray-500">Категорія: {product.categoryName}</p>
              )}
            </div>
            <a
              href={`/admin/products/${product.id}`}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Переглянути
            </a>
          </div>
        </div>
      ))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Пошук</h1>
          <p className="text-gray-600">Швидкий пошук категорій та продуктів</p>
        </div>

        {/* Таби пошуку */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'categories'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderIcon className="inline w-4 h-4 mr-2" />
              Категорії
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CubeIcon className="inline w-4 h-4 mr-2" />
              Продукти
            </button>
          </div>
        </div>

        {/* Форма пошуку */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {activeTab === 'categories' ? 'Пошук категорій' : 'Пошук продуктів'}
          </h2>
          
          {activeTab === 'categories' ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Введіть назву або ID категорії..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
              <div className="text-sm text-gray-500">
                💡 Введіть назву категорії для пошуку за назвою або ID категорії для пошуку за ID
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Назва продукту..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FolderIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="ID категорії (або залиште порожнім для всіх)"
                    value={categoryIdInput}
                    onChange={handleCategoryIdChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                💡 Введіть назву продукту та/або ID категорії. Залиште ID категорії порожнім для пошуку по всіх категоріях.
              </div>
            </div>
          )}
        </div>

        {/* Результати пошуку */}
        {(searchQuery || categoryIdInput) && (
          <div className="bg-white rounded-lg shadow border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Результати пошуку {activeTab === 'categories' ? 'категорій' : 'продуктів'}
              </h3>
              <button
                onClick={clearSearch}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Очистити
              </button>
            </div>

            {isSearching ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Пошук...</p>
              </div>
            ) : searchError ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg mb-2">⚠️</div>
                <p className="text-red-600">{searchError}</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {renderSearchResults()}
              </div>
            ) : (searchQuery.trim().length >= 2 || categoryIdInput.trim().length >= 2) ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🔍</div>
                <p className="text-gray-600">
                  {activeTab === 'categories' ? 'Категорії не знайдено' : 'Продукти не знайдено'}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Інструкція */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Інструкція по пошуку</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <FolderIcon className="w-5 h-5 mr-2 text-blue-600" />
                Пошук категорій
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Введіть назву категорії для пошуку за назвою</li>
                <li>Введіть ID категорії для пошуку за ID</li>
                <li>Пошук запускається автоматично через 300мс</li>
                <li>Мінімальна довжина пошуку: 2 символи</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <CubeIcon className="w-5 h-5 mr-2 text-green-600" />
                Пошук продуктів
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Введіть назву продукту для пошуку за назвою</li>
                <li>Введіть ID категорії для фільтрації за категорією</li>
                <li>Залиште ID категорії порожнім для пошуку по всіх категоріях</li>
                <li>Можна комбінувати назву та категорію</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
