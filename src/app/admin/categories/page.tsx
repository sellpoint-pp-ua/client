'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type CategoryRow = {
  id: string
  name: { [key: string]: string }
  parentId?: string | null
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/categories/full-tree', { cache: 'no-store' })
        if (!res.ok) throw new Error('Не вдалося завантажити категорії')
        const tree = await res.json() as Array<{ id: string; name: { uk: string }; children?: any[] }>
        const flat: CategoryRow[] = []
        const walk = (nodes: any[], parentId?: string | null) => {
          for (const n of nodes) {
            flat.push({ id: n.id, name: { uk: n.name.uk }, parentId: parentId || null })
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

  if (isLoading) return <div className="p-6">Завантаження...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 rounded-lg bg-white shadow border">
      <h1 className="text-2xl font-semibold mb-4">Категорії</h1>
      <div className="overflow-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">ID</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Назва (uk)</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Батьківська</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Дії</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2 font-mono text-xs text-gray-700">{c.id}</td>
                <td className="px-3 py-2">{c.name?.uk}</td>
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
  )
}


