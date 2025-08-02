'use client'

import { useState } from 'react'
import { ArrowDownAZ } from 'lucide-react'

interface FilterOption {
  title: string
  options: string[]
}

interface SortOption {
  label: string
  value: string
}

interface FilterSidebarProps {
  filterOptions: FilterOption[]
  sortOptions: SortOption[]
}

export default function FilterSidebar({ filterOptions, sortOptions }: FilterSidebarProps) {
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]?.value)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  const handleSortChange = (value: string) => {
    setSelectedSort(value)
  }

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[category] || []
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value]
      
      return {
        ...prev,
        [category]: newFilters
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Sort Section */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <ArrowDownAZ className="h-5 w-5" />
          <h2 className="font-medium">Сортування</h2>
        </div>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={selectedSort === option.value}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-[#7B1FA2] focus:ring-[#7B1FA2]"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      {filterOptions.map((filter) => (
        <div key={filter.title}>
          <h2 className="mb-3 font-medium">{filter.title}</h2>
          <div className="space-y-2">
            {filter.options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters[filter.title]?.includes(option) || false}
                  onChange={() => handleFilterChange(filter.title, option)}
                  className="rounded text-[#7B1FA2] focus:ring-[#7B1FA2]"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 