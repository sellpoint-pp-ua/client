'use client'

import { useState } from 'react'
import Link from 'next/link'

const categories = [
  { id: 'all', name: 'Всі товари', count: 3456 },
  { id: 'jewelry', name: 'Ювелірні вироби', count: 1234 },
  { id: 'watches', name: 'Годинники', count: 567 },
  { id: 'bags', name: 'Сумки та гаманці', count: 789 },
  { id: 'belts', name: 'Ремені', count: 234 },
  { id: 'sunglasses', name: 'Окуляри', count: 345 },
  { id: 'scarves', name: 'Шарфи та хустки', count: 287 },
]

export default function CategoryNavigation() {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <nav className="mb-6 overflow-x-auto">
      <div className="flex space-x-4 border-b border-gray-200">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/aksesuary-ta-prykrasy/${category.id}`}
            className={`flex min-w-fit items-center whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'border-[#7B1FA2] text-[#7B1FA2]'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {category.count}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
} 