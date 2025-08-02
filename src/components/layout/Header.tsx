'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, User, Bell, Heart, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type CategorySearchResult = {
  id: string;
  name: {
    uk: string;
    en: string;
  };
  parentId: string | null;
}

// Helper function to get the URL for a category based on its ID
const getCategoryUrl = (categoryId: string): string => {
  // Mapping of known category IDs to their URLs
  const CATEGORY_URLS: Record<string, string> = {
    '687e7f6d3f410756d06e04ec': '/krasa-ta-zdorovya',
    '687e7fa43f410756d06e04f0': '/krasa-ta-zdorovya/kosmetyka-po-doglyadu',
    '687e7fef3f410756d06e04f6': '/krasa-ta-zdorovya/kosmetyka-po-doglyadu/doglyad-za-oblychchyam',
    '687e80033f410756d06e04f8': '/krasa-ta-zdorovya/kosmetyka-po-doglyadu/doglyad-za-volosyam',
    '687e7fb83f410756d06e04f2': '/krasa-ta-zdorovya/manikur-pedikur',
    '687e7fc93f410756d06e04f4': '/krasa-ta-zdorovya/intimni-tovary',
    '687e7fd83f410756d06e04f5': '/dim-i-sad'
  }

  return CATEGORY_URLS[categoryId] || `/category/${categoryId}`
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CategorySearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search function
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true)
        setError(null)
        try {
          const response = await fetch(
            `/api/categories/search?name=${encodeURIComponent(searchQuery)}&languageCode=uk`
          )
          if (!response.ok) {
            throw new Error('Failed to fetch search results')
          }
          const data = await response.json()
          setSearchResults(data)
          setShowDropdown(true)
        } catch (error) {
          console.error('Error fetching search results:', error)
          setError('Помилка пошуку. Спробуйте ще раз.')
        } finally {
          setIsLoading(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
        setError(null)
      }
    }, 300) // Debounce time: 300ms

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleCategoryClick = (categoryId: string) => {
    const url = getCategoryUrl(categoryId)
    router.push(url)
    setShowDropdown(false)
    setSearchQuery('')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      handleCategoryClick(searchResults[0].id) // Navigate to first result
    }
  }

  return (
    <header className="sticky top-0 z-50 h-[80px] bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-[#7B1FA2]">
          Sell Point
        </Link>

        {/* Search Bar */}
        <div className="flex w-[60%] items-center" ref={searchContainerRef}>
          <div className="relative flex w-full">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Я шукаю..."
                className="w-full rounded-l-lg border border-gray-300 px-4 py-2 focus:border-[#7B1FA2] focus:outline-none"
              />
              <button 
                type="submit"
                className="flex items-center rounded-r-lg bg-[#7B1FA2] px-6 py-2 text-white hover:bg-[#6a1b8c]"
              >
                <Search className="mr-2 h-5 w-5" />
                Знайти
              </button>
            </form>

            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 max-h-[400px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Пошук...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">
                    {error}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleCategoryClick(result.id)}
                        className="flex w-full items-center px-4 py-2 text-left hover:bg-gray-100"
                      >
                        <span className="text-sm text-gray-700">
                          {result.name.uk}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="p-4 text-center text-gray-500">
                    Нічого не знайдено
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Utility Icons */}
        <div className="flex items-center space-x-6">
          <Link href="/cabinet" className="flex flex-col items-center text-gray-700 hover:text-[#7B1FA2]">
            <User className="h-6 w-6" />
            <span className="text-xs">Кабінет</span>
          </Link>
          <Link href="/notifications" className="flex flex-col items-center text-gray-700 hover:text-[#7B1FA2]">
            <Bell className="h-6 w-6" />
            <span className="text-xs">Сповіщення</span>
          </Link>
          <Link href="/favorites" className="flex flex-col items-center text-gray-700 hover:text-[#7B1FA2]">
            <Heart className="h-6 w-6" />
            <span className="text-xs">Обране</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center text-gray-700 hover:text-[#7B1FA2]">
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs">Кошик</span>
          </Link>
        </div>
      </div>
    </header>
  )
} 