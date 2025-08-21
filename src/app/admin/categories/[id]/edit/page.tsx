'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { authService } from '@/services/authService'

type CategoryDto = {
  id: string
  name: Record<string, string>
  parentId?: string | null
}

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const categoryId = params?.id

  const [model, setModel] = useState<CategoryDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!categoryId) return
      try {
        setIsLoading(true)
        const res = await fetch(`/api/categories/${categoryId}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Не вдалося завантажити категорію')
        const data = await res.json() as CategoryDto
        setModel({ id: data.id, name: { ...data.name }, parentId: data.parentId ?? null })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Помилка')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [categoryId])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!model) return
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const token = authService.getToken()
      if (!token) {
        setError('Не авторизовано')
        return
      }
      const res = await fetch('/api/categories/update', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(model),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Не вдалося зберегти')
      }
      setSuccess('Збережено')
      setTimeout(() => router.push('/admin/categories'), 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <div className="p-6">Завантаження...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!model) return <div className="p-6">Категорію не знайдено</div>

  return (
    <div className="p-6 max-w-2xl rounded-lg bg-white shadow border">
      <h1 className="text-2xl font-semibold mb-4">Редагувати категорію</h1>
      <form onSubmit={onSubmit} className="space-y-4 bg-white p-4 rounded border">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Назва (uk)</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={model.name.uk || ''}
            onChange={e => setModel(m => m ? { ...m, name: { ...m.name, uk: e.target.value } } : m)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">ParentId</label>
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="24-hex або пусто"
            value={model.parentId || ''}
            onChange={e => setModel(m => m ? { ...m, parentId: e.target.value || null } : m)}
          />
          <p className="text-xs text-gray-500 mt-1">Залиште порожнім для кореневої категорії</p>
        </div>
        <div className="flex items-center gap-3">
          <button disabled={saving} className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50" type="submit">Зберегти</button>
          {success && <span className="text-green-600 text-sm">{success}</span>}
          {saving && <span className="text-gray-500 text-sm">Збереження...</span>}
        </div>
      </form>
    </div>
  )
}


