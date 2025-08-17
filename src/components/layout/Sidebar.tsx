'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type MenuItem = {
  id: string;
  name: string;
  children?: MenuItem[];
}

export default function Sidebar() {
  const [categories, setCategories] = useState<MenuItem[]>([])
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/categories/full-tree')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
  const menuItems = data.map((category: { id: string; name: { uk: string }; children?: unknown[] }) => {
    const catChildren = category.children as Array<{ id: string; name: { uk: string }; children?: unknown[] }> | undefined
    return {
      id: category.id,
      name: category.name.uk,
      children: catChildren?.map((child) => {
        const childChildren = child.children as Array<{ id: string; name: { uk: string } }> | undefined
        return {
          id: child.id,
          name: child.name.uk,
          children: childChildren?.map((subChild) => ({ id: subChild.id, name: subChild.name.uk }))
        }
      })
    }
  })
        setCategories(menuItems)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <aside className="relative w-[250px] bg-white p-4 rounded-lg">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </aside>
    )
  }

  if (error || !categories.length) {
    return (
      <aside className="relative w-[250px] bg-white p-4 rounded-lg">
        <p className="text-gray-500 text-sm">Categories not found</p>
      </aside>
    )
  }

  return (
    <aside className="relative w-[250px] bg-white p-4 rounded-lg">
      <nav className="space-y-1">
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Link
              href={`/category/${category.id}`}
              className="text-sm flex items-center justify-between rounded-lg px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#4563d1]"
            >
              <span>{category.name}</span>
              {category.children && category.children.length > 0 && (
                <ChevronRight className="h-5 w-5" />
              )}
            </Link>

            {hoveredCategory === category.id && category.children && category.children.length > 0 && (
              <div className="absolute left-full top-0 z-50 ml-0 w-[400px] rounded-lg bg-white p-4 shadow-lg">
                <div className="space-y-6">
                  {category.children.map((subcategory) => (
                    <div key={subcategory.id}>
                      <h3 className="mb-2 font-medium text-gray-900">
                        <Link href={`/category/${subcategory.id}`} className="hover:text-[#4563d1]">
                          {subcategory.name}
                        </Link>
                      </h3>
                      {subcategory.children && subcategory.children.length > 0 && (
                        <ul className="space-y-2">
                          {subcategory.children.map((item) => (
                            <li key={item.id}>
                              <Link
                                href={`/category/${item.id}`}
                                className="text-sm text-gray-600 hover:text-[#4563d1]"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}