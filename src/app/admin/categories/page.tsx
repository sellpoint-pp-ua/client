'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

type CategoryRow = {
  id: string
  name: string
  parentId?: string | null
}

type CategoryNode = {
  id: string
  name: string
  children?: CategoryNode[]
}

type Category = {
  id: string
  name: string
  parentId?: string | null
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [searchResults, setSearchResults] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  const getCategoryName = (category: Category): string => {
    return category.name || 'Без назви'
  }

  const searchCategories = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchError(null)
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setShowSearchResults(true)
    
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

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/categories/full-tree', { cache: 'no-store' })
        if (!res.ok) throw new Error('Не вдалося завантажити категорії')
        const tree = await res.json() as CategoryNode[]
        const flat: CategoryRow[] = []
        const walk = (nodes: CategoryNode[], parentId?: string | null) => {
          for (const n of nodes) {
            flat.push({ id: n.id, name: n.name, parentId: parentId || null })
            if (n.children?.length) walk(n.children, n.id)
          }
        }
        walk(tree)
        setCategories(flat)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Помилка')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchCategories(searchQuery)
      } else {
        setSearchResults([])
        setSearchError(null)
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (!value.trim()) {
      setSearchResults([])
      setSearchError(null)
      setShowSearchResults(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearchError(null)
    setShowSearchResults(false)
  }

  if (isLoading) return <div className="p-6">Завантаження...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 rounded-lg bg-white shadow border">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Категорії</h1>
      </div>

      {/* Пошук */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Пошук категорій</h2>
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
        </div>
      </div>

      {/* Результати пошуку */}
      {showSearchResults && (
        <div className="mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">
                Результати пошуку категорій
              </h3>
              <button
                onClick={clearSearch}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-900 transition-colors"
              >
                Очистити
              </button>
            </div>

            {isSearching ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-blue-600">Пошук...</p>
              </div>
            ) : searchError ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg mb-2">⚠️</div>
                <p className="text-red-600">{searchError}</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((category) => (
                  <div key={category.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{getCategoryName(category)}</h3>
                        <p className="text-sm text-gray-600">ID: {category.id}</p>
                        {category.parentId && (
                          <p className="text-xs text-gray-500">Батьківська: {category.parentId}</p>
                        )}
                      </div>
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Редагувати
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🔍</div>
                <p className="text-gray-600">Категорії не знайдено</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Всі категорії */}
      {!showSearchResults && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Всі категорії</h2>
          <div className="overflow-auto rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">ID</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Назва</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Батьківська</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Дії</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs text-gray-700">{c.id}</td>
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2 text-gray-500">{c.parentId || '-'}</td>
                    <td className="px-3 py-2">
                      <Link className="text-blue-600 hover:underline" href={`/admin/categories/${c.id}/edit`}>Редагувати</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


