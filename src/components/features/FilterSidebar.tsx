'use client'

import { useEffect, useMemo, useState } from 'react'

type ServerFilter = {
  id: string
  categoryId: string
  filters: Array<{ title: string; values: string[] }>
}

type FilterState = 'none' | 'include' | 'exclude'

interface FilterSidebarProps {
  categoryId?: string
  onChange?: (selected: { include: Record<string, string[]>; exclude: Record<string, string[]> }) => void
  filterOptions?: { title: string; options: string[] }[]
  sortOptions?: { label: string; value: string }[]
}

export default function FilterSidebar({ categoryId = '', onChange = () => {}, filterOptions }: FilterSidebarProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverFilters, setServerFilters] = useState<ServerFilter | null>(null)
  const [filterStates, setFilterStates] = useState<Record<string, Record<string, FilterState>>>({})

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

  // Convert filter states to include/exclude format
  const selectedFilters = useMemo(() => {
    const include: Record<string, string[]> = {}
    const exclude: Record<string, string[]> = {}
    
    Object.entries(filterStates).forEach(([filterTitle, values]) => {
      Object.entries(values).forEach(([value, state]) => {
        if (state === 'include') {
          if (!include[filterTitle]) include[filterTitle] = []
          include[filterTitle].push(value)
        } else if (state === 'exclude') {
          if (!exclude[filterTitle]) exclude[filterTitle] = []
          exclude[filterTitle].push(value)
        }
      })
    })
    
    return { include, exclude }
  }, [filterStates])

  useEffect(() => {
    onChange(selectedFilters)
  }, [selectedFilters, onChange])

  const handleFilterToggle = (title: string, value: string) => {
    setFilterStates(prev => {
      const currentState = prev[title]?.[value] || 'none'
      let nextState: FilterState
      
      switch (currentState) {
        case 'none':
          nextState = 'include'
          break
        case 'include':
          nextState = 'exclude'
          break
        case 'exclude':
          nextState = 'none'
          break
        default:
          nextState = 'include'
      }
      
      return {
        ...prev,
        [title]: {
          ...prev[title],
          [value]: nextState
        }
      }
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
          <div className="mb-3" key={f.title}>
            <h2 className="mb-2 font-medium">{f.title}</h2>
            <div className="space-y-2">
              {f.values.map((v) => {
                const currentState = filterStates[f.title]?.[v] || 'none'
                return (
                  <label key={v} className="flex mb-0 items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={currentState !== 'none'}
                        onChange={() => handleFilterToggle(f.title, v)}
                        className="sr-only"
                      />
                      <div className={`
                        w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-200
                        ${currentState === 'none' 
                          ? 'border-gray-300 bg-white hover:border-gray-400' 
                          : currentState === 'include'
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-red-400 bg-red-400 text-white'
                        }
                      `}>
                        {currentState === 'include' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {currentState === 'exclude' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm flex-1">{v}</span>
                  </label>
                )
              })}
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
