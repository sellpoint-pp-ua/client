'use client'

import { useEffect, useMemo, useState } from 'react'
import { authService } from '@/services/authService'

type CategoryNode = { id: string; name: string; children?: CategoryNode[] }
type AvailableFilter = { id?: string; categoryId?: string; filters: Array<{ title: string; values: string[] }> }
type FilterItem = { title: string; values: string[] }

export default function AdminFiltersPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [existing, setExisting] = useState<AvailableFilter | null>(null)

  // Create tab state
  const [createFilters, setCreateFilters] = useState<Array<{ title: string; values: string[] }>>([
    { title: '', values: [''] },
  ])

  // Manage tab state (editable copy of existing)
  const [manageFilters, setManageFilters] = useState<Array<{ title: string; values: string[] }>>([])

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'filter' | 'value'; filterIndex: number; valueIndex?: number } | null>(null)

  const token = useMemo(() => authService.getToken(), [])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories/full-tree', { cache: 'no-store' })
        if (!res.ok) throw new Error('Не вдалося завантажити категорії')
        const tree = await res.json() as CategoryNode[]
        const flat: Array<{ id: string; name: string }> = []
        const walk = (nodes: CategoryNode[]) => {
          for (const n of nodes) {
            flat.push({ id: n.id, name: n.name })
            if (n.children?.length) walk(n.children)
          }
        }
        walk(tree)
        setCategories(flat)
        if (flat.length && !selectedCategoryId) setSelectedCategoryId(flat[0].id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Помилка завантаження категорій')
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    const loadExisting = async () => {
      setExisting(null)
      if (!selectedCategoryId) return
      try {
        setLoading(true)
        const res = await fetch(`/api/categories/${selectedCategoryId}/available-filters`, { cache: 'no-store' })
        if (!res.ok) {
          setExisting(null)
          return
        }
        const data = await res.json()
        // Handle both array and object API shapes
        if (Array.isArray(data)) {
          const entry = data[0]
          if (entry && typeof entry === 'object') {
            setExisting({ id: entry.id, categoryId: entry.categoryId, filters: entry.filters || [] })
            setManageFilters(Array.isArray(entry.filters) ? entry.filters : [])
          } else {
            setExisting(null)
            setManageFilters([])
          }
        } else if (data && typeof data === 'object') {
          setExisting({ id: data.id, categoryId: data.categoryId, filters: data.filters || [] })
          setManageFilters(Array.isArray(data.filters) ? data.filters : [])
        } else {
          setExisting(null)
          setManageFilters([])
        }
      } catch {
        setExisting(null)
      } finally {
        setLoading(false)
      }
    }
    loadExisting()
  }, [selectedCategoryId])

  const handleAddFilter = () => setManageFilters(prev => [...prev, { title: '', values: [''] }])
  const handleRemoveFilter = (idx: number) => {
    setDeleteTarget({ type: 'filter', filterIndex: idx })
    setShowDeleteModal(true)
  }
  const handleTitleChange = (idx: number, value: string) => setManageFilters(prev => prev.map((f, i) => i === idx ? { ...f, title: value } : f))
  const handleValueChange = (fIdx: number, vIdx: number, value: string) => setManageFilters(prev => prev.map((f, i) => i === fIdx ? { ...f, values: f.values.map((v, j) => j === vIdx ? value : v) } : f))
  const handleAddValue = (fIdx: number) => setManageFilters(prev => prev.map((f, i) => i === fIdx ? { ...f, values: [...f.values, ''] } : f))
  const handleRemoveValue = (fIdx: number, vIdx: number) => {
    setDeleteTarget({ type: 'value', filterIndex: fIdx, valueIndex: vIdx })
    setShowDeleteModal(true)
  }

  const normalizedCreate = createFilters
    .map(f => ({ title: f.title.trim(), values: f.values.map(v => v.trim()).filter(Boolean) }))
    .filter(f => f.title && f.values.length)

  const normalizedManage = manageFilters
    .map(f => ({ title: f.title.trim(), values: f.values.map(v => v.trim()).filter(Boolean) }))
    .filter(f => f.title && f.values.length)

  const createNew = async () => {
    setError(null)
    if (!token) { setError('Не авторизовано'); return }
    if (!selectedCategoryId) { setError('Оберіть категорію'); return }
    if (!normalizedCreate.length) { setError('Додайте принаймні один фільтр з значеннями'); return }
    try {
      setLoading(true)
      const res = await fetch('/api/available-filters', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: selectedCategoryId, filters: normalizedCreate }),
      })
      if (!res.ok) throw new Error(await res.text())
      // reload existing
      const r = await fetch(`/api/categories/${selectedCategoryId}/available-filters`, { cache: 'no-store' })
      if (r.ok) {
        const d = await r.json()
        if (d && d.id) setExisting({ id: d.id, categoryId: d.categoryId, filters: d.filters || [] })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка збереження')
    } finally {
      setLoading(false)
    }
  }

  const saveManageChanges = async () => {
    setError(null)
    if (!token) { setError('Не авторизовано'); return }
    if (!selectedCategoryId || !existing?.id) { setError('Немає запису для оновлення'); return }
    if (!normalizedManage.length) { setError('Додайте принаймні один фільтр з значеннями'); return }
    try {
      setLoading(true)
      const res = await fetch(`/api/available-filters/${existing.id}/update-filters`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedManage),
      })
      if (!res.ok) throw new Error(await res.text())
      // reload existing
      const r = await fetch(`/api/categories/${selectedCategoryId}/available-filters`, { cache: 'no-store' })
      if (r.ok) {
        const d = await r.json()
        if (d && d.id) setExisting({ id: d.id, categoryId: d.categoryId, filters: d.filters || [] })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка збереження')
    } finally {
      setLoading(false)
    }
  }

  const deleteById = async () => {
    setError(null)
    if (!token) { setError('Не авторизовано'); return }
    if (!existing?.id) { setError('Немає запису для видалення'); return }
    try {
      setLoading(true)
      const res = await fetch(`/api/available-filters/${existing.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) throw new Error(await res.text())
      setExisting(null)
      setManageFilters([])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка видалення')
    } finally { setLoading(false) }
  }

  const removeFiltersByCategory = async () => {
    // with unified param naming, just call deleteById if present, else noop
    if (existing?.id) return deleteById()
    setError('Немає запису для видалення')
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    
    if (deleteTarget.type === 'filter') {
      setManageFilters(prev => prev.filter((_, i) => i !== deleteTarget.filterIndex))
    } else if (deleteTarget.type === 'value' && deleteTarget.valueIndex !== undefined) {
      setManageFilters(prev => prev.map((f, i) => i === deleteTarget.filterIndex ? { ...f, values: f.values.filter((_, j) => j !== deleteTarget.valueIndex) } : f))
    }
    
    setShowDeleteModal(false)
    setDeleteTarget(null)
  }

  return (
    <div className="p-6 rounded-lg bg-white shadow border">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Фільтри категорій</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Створення
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'manage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Керування
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-3 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Категорія</label>
          <select className="rounded border px-3 py-2 min-w-[280px]" value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
            ))}
          </select>
        </div>
        {activeTab === 'create' ? (
          <div className="flex gap-2">
            <button onClick={createNew} disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50">Створити</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={saveManageChanges} disabled={loading || !existing?.id} className="rounded bg-green-600 text-white px-4 py-2 disabled:opacity-50">Зберегти зміни</button>
            <button onClick={removeFiltersByCategory} disabled={loading || !selectedCategoryId} className="rounded bg-orange-600 text-white px-4 py-2 disabled:opacity-50">Видалити всі фільтри категорії</button>
          </div>
        )}
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Create tab content */}
      {activeTab === 'create' && (
        <div className="space-y-4">
          {createFilters.map((filter, fIdx) => (
            <div key={fIdx} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-end gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Заголовок фільтру</label>
                  <input className="w-full rounded border px-3 py-2" value={filter.title} onChange={e => setCreateFilters(prev => prev.map((f, i) => i === fIdx ? { ...f, title: e.target.value } : f))} />
                </div>
                <button onClick={() => setCreateFilters(prev => prev.filter((_, i) => i !== fIdx))} className="px-3 py-2 rounded border bg-white hover:bg-gray-50">Видалити</button>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Значення</div>
                {filter.values.map((val, vIdx) => (
                  <div key={vIdx} className="flex items-center gap-2">
                    <input className="flex-1 rounded border px-3 py-2" value={val} onChange={e => setCreateFilters(prev => prev.map((f, i) => i === fIdx ? { ...f, values: f.values.map((v, j) => j === vIdx ? e.target.value : v) } : f))} />
                    <button onClick={() => setCreateFilters(prev => prev.map((f, i) => i === fIdx ? { ...f, values: f.values.filter((_, j) => j !== vIdx) } : f))} className="px-2 py-2 rounded border bg-white hover:bg-gray-50">–</button>
                  </div>
                ))}
                <button onClick={() => setCreateFilters(prev => prev.map((f, i) => i === fIdx ? { ...f, values: [...f.values, ''] } : f))} className="mt-2 px-3 py-2 rounded border bg-white hover:bg-gray-50">Додати значення</button>
              </div>
            </div>
          ))}
          <button onClick={() => setCreateFilters(prev => [...prev, { title: '', values: [''] }])} className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Додати фільтр</button>
        </div>
      )}

      {/* Manage tab content */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {manageFilters.map((filter, fIdx) => (
          <div key={fIdx} className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-end gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Заголовок фільтру</label>
                <input className="w-full rounded border px-3 py-2" value={filter.title} onChange={e => handleTitleChange(fIdx, e.target.value)} />
              </div>
              <button onClick={() => handleRemoveFilter(fIdx)} className="px-3 py-2 rounded border bg-white hover:bg-gray-50">Видалити</button>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Значення</div>
              {filter.values.map((val, vIdx) => (
                <div key={vIdx} className="flex items-center gap-2">
                  <input className="flex-1 rounded border px-3 py-2" value={val} onChange={e => handleValueChange(fIdx, vIdx, e.target.value)} />
                  <button onClick={() => handleRemoveValue(fIdx, vIdx)} className="px-2 py-2 rounded border bg-white hover:bg-gray-50">–</button>
                </div>
              ))}
              <button onClick={() => handleAddValue(fIdx)} className="mt-2 px-3 py-2 rounded border bg-white hover:bg-gray-50">Додати значення</button>
            </div>
          </div>
          ))}
          <button onClick={handleAddFilter} className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Додати фільтр</button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl border w-full max-w-md mx-4 p-5">
            <h3 className="text-lg font-semibold mb-2">Підтвердження видалення</h3>
            {deleteTarget.type === 'filter' ? (
              <>
                <p className="text-sm text-gray-700 mb-4">Точно видалити весь фільтр?</p>
                <div className="bg-red-50 rounded border p-3 mb-4">
                  <div className="text-xs text-red-600 font-medium mb-1">УВАГА:</div>
                  <div className="text-sm text-red-700 font-bold">Всі значення цього фільтру також будуть видалені!</div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700 mb-4">Точно видалити це значення фільтру?</p>
              </>
            )}
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
              >
                Скасувати
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Так, видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


