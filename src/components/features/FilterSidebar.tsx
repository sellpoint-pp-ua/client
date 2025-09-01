'use client'

import { useEffect, useMemo, useState } from 'react'

type ServerFilter = {
  id: string
  categoryId: string
  filters: Array<{ title: string; values: string[] }>
}

interface FilterSidebarProps {
  categoryId?: string
  onChange?: (selected: Record<string, string[]>) => void
  filterOptions?: { title: string; options: string[] }[]
  sortOptions?: { label: string; value: string }[]
}

export default function FilterSidebar({ categoryId = '', onChange = () => {}, filterOptions }: FilterSidebarProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverFilters, setServerFilters] = useState<ServerFilter | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/categories/${categoryId}/available-filters`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch filters')
        const data: ServerFilter[] = await res.json()
        if (!cancelled) {
          const entry = Array.isArray(data) ? (data[0] ?? null) : null
          setServerFilters(entry ?? { id: '', categoryId, filters: [] })
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load filters')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (categoryId) load()
    return () => { cancelled = true }
  }, [categoryId])

  useEffect(() => {
    onChange(selectedFilters)
  }, [selectedFilters, onChange])

  const handleFilterToggle = (title: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[title] || []
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [title]: next }
    })
  }



  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      )
    }
    if (error) {
      return <p className="text-sm text-red-500">{error}</p>
    }
  const filters = serverFilters?.filters || (filterOptions ? filterOptions.map(f => ({ title: f.title, values: f.options })) : [])
    if (!filters.length) {
      return <p className="text-sm text-gray-500">Фільтри відсутні</p>
    }
    return (
      <div className="space-y-6">
        {filters.map((f) => (
          <div key={f.title}>
            <h2 className="mb-3 font-medium">{f.title}</h2>
            <div className="space-y-2">
              {f.values.map((v) => (
                <label key={v} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFilters[f.title]?.includes(v))}
                    onChange={() => handleFilterToggle(f.title, v)}
                    className="rounded text-[#4563d1] focus:ring-[#4563d1]"
                  />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }, [loading, error, serverFilters, selectedFilters])

  return (
    <div className="space-y-6">
      {content}
    </div>
  )
}
