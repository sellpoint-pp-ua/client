'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { authService } from '@/services/authService'

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

  const [createName, setCreateName] = useState('')
  const [createParentId, setCreateParentId] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)

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

  const loadCategories = async () => {
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

  useEffect(() => {
    loadCategories()
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

  const createCategory = async () => {
    setCreateMsg(null)
    if (!createName.trim()) {
      setCreateMsg('Вкажіть назву категорії')
      return
    }
    const token = authService.getToken()
    if (!token) {
      setCreateMsg('Не авторизовано')
      return
    }
    try {
      setCreating(true)
      const body = {
        name: createName.trim(),
        parentId: createParentId ? createParentId : null,
      }
      const res = await fetch('/api/categories/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Не вдалося створити')
      }
      setCreateMsg('Створено успішно')
      setCreateName('')
      setCreateParentId('')
      await loadCategories()
    } catch (e) {
      setCreateMsg(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setCreating(false)
    }
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

      {/* Створення категорії */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Створити категорію</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Назва</label>
              <input className="w-full rounded border px-3 py-2" value={createName} onChange={e => setCreateName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Батьківська (optional)</label>
              <select className="w-full rounded border px-3 py-2" value={createParentId} onChange={e => setCreateParentId(e.target.value)}>
                <option value="">— Коренева —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button disabled={creating} onClick={createCategory} className="rounded bg-green-600 text-white px-4 py-2 disabled:opacity-50">Створити</button>
              {creating && <span className="text-gray-500 text-sm self-center">Створення...</span>}
              {createMsg && <span className="text-sm self-center {createMsg.startsWith('Створено') ? 'text-green-600' : 'text-red-600'}">{createMsg}</span>}
            </div>
          </div>
        </div>
      </div>

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
                      <div className="flex items-center gap-3">
                        <Link className="text-blue-600 hover:underline" href={`/admin/categories/${c.id}/edit`}>Редагувати</Link>
                        <DeleteCategoryButton id={c.id} name={c.name} hasParent={!!c.parentId} onDeleted={loadCategories} />
                      </div>
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

function DeleteCategoryButton({ id, name, hasParent, onDeleted }: { id: string; name: string; hasParent: boolean; onDeleted: () => Promise<void> | void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    setError(null)
    const token = authService.getToken()
    if (!token) {
      setError('Не авторизовано')
      return
    }
    try {
      setLoading(true)
      // Block deleting parent categories that have children
      if (!hasParent) {
        const childrenRes = await fetch(`/api/categories/${id}/children`, { cache: 'no-store' })
        const children = childrenRes.ok ? await childrenRes.json() : []
        if (Array.isArray(children) && children.length > 0) {
          setError('Неможливо видалити: категорія має дочірні категорії')
          return
        }
      }

      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Не вдалося видалити')
      }
      await onDeleted()
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setOpen(true)} disabled={loading} className="text-red-600 hover:underline disabled:opacity-50">Видалити</button>
      {loading && <span className="text-xs text-gray-500">...</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => !loading && setOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl border w-full max-w-md mx-4 p-5">
            <h3 className="text-lg font-semibold mb-2">Підтвердження видалення</h3>
            <p className="text-sm text-gray-700 mb-4">Точно видалити категорію "{name}"?</p>
            <div className="bg-gray-50 rounded border p-3 mb-4">
              <div className="text-xs text-gray-500">ID категорії</div>
              <div className="font-mono text-sm break-all">{id}</div>
            </div>
            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setOpen(false)} disabled={loading} className="px-3 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-50">Скасувати</button>
              <button onClick={handleDelete} disabled={loading} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">Так, видалити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

