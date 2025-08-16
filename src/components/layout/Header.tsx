'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, User, Bell, Heart, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type CategorySearchResult = {
  id: string;
  name: {
    uk: string;
    en: string;
  };
  parentId: string | null;
}

type ProductSearchResult = {
  productId: {
    timestamp: number;
    creationTime: string;
  };
  highlighted: string;
  rank: number;
}

const processHighlightedText = (highlightedText: string, searchQuery: string): React.JSX.Element => {
  const regex = /\[(.*?)\]/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(highlightedText)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = highlightedText.slice(lastIndex, match.index)
      parts.push(<span key={`before-${lastIndex}`} className="text-gray-500">{beforeText}</span>)
    }
    
    parts.push(<strong key={`bold-${match.index}`} className="font-bold">{match[1]}</strong>)
    
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < highlightedText.length) {
    const remainingText = highlightedText.slice(lastIndex)
    parts.push(<span key={`after-${lastIndex}`} className="text-gray-500">{remainingText}</span>)
  }

  return <span>{parts}</span>
}

const cleanCategoryName = (name: string): string => {
  return name.replace(/\[|\]/g, '')
}

const highlightCategoryText = (text: string, searchQuery: string): React.JSX.Element => {
  const cleanText = cleanCategoryName(text)
  const regex = new RegExp(`(${searchQuery})`, 'gi')
  const parts = cleanText.split(regex)
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <strong key={index} className="font-bold">{part}</strong>
        ) : (
          <span key={index} className="text-gray-500">{part}</span>
        )
      )}
    </span>
  )
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryResults, setCategoryResults] = useState<CategorySearchResult[]>([])
  const [productResults, setProductResults] = useState<ProductSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true)
        setError(null)
        try {
          const [categoryResponse, productResponse] = await Promise.all([
            fetch(`/api/categories/search?name=${encodeURIComponent(searchQuery)}&languageCode=uk`),
            fetch(`/api/products/search?name=${encodeURIComponent(searchQuery)}&languageCode=uk`)
          ])

          const categoryData = categoryResponse.ok ? await categoryResponse.json() : []
          const productData = productResponse.ok ? await productResponse.json() : []

          setCategoryResults(categoryData)
          setProductResults(productData.slice(0, 5)) 
          setShowDropdown(categoryData.length > 0 || productData.length > 0)
        } catch (error) {
          console.error('Error fetching search results:', error)
          setError('Помилка пошуку. Спробуйте ще раз.')
        } finally {
          setIsLoading(false)
        }
      } else {
        setCategoryResults([])
        setProductResults([])
        setShowDropdown(false)
        setError(null)
      }
    }, 300) 

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/category/${categoryId}`)
    setShowDropdown(false)
    setSearchQuery('')
  }

  const handleProductClick = (product: ProductSearchResult) => {
    setShowDropdown(false)
    setSearchQuery('')
    console.log('Product clicked:', product)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (categoryResults.length > 0) {
      handleCategoryClick(categoryResults[0].id) 
    }
  }

  const hasResults = categoryResults.length > 0 || productResults.length > 0

  return (
    <header className="sticky top-0 z-50 h-[80px] bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-4 gap-4 flex-nowrap">
        {/* Logo */}
        <Link href="/" className="flex items-center whitespace-nowrap mt-2 ml-8" aria-label="Sell Point">
          <span className="relative block h-[32px] w-[148px] md:h-[36px] md:w-[168px] lg:h-[40px] lg:w-[186px]">
            <Image src="/logo.svg" alt="Sell Point" fill priority sizes="186px" />
          </span>
        </Link>

        {/* Search Bar */}
        <div className="pl-4 flex min-w-0 flex-1 items-center max-w-[900px] mt-1" ref={searchContainerRef}>
          <div className="relative flex w-full max-h-[35px]">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => hasResults && setShowDropdown(true)}
                placeholder="Я шукаю..."
                className=" w-full rounded-l-lg border border-gray-300 px-3 py-1 text-sm md:px-4 md:text-base focus:border-[#4563d1] focus:outline-none"
              />
              <button 
                type="submit"
                className="flex items-center rounded-r-lg bg-[#4563d1] px-3 py-2 text-white hover:bg-[#6a1b8c] md:px-6"
              >
                <Search className="mr-2 h-5 w-5" />
                <span className="hidden md:inline">Знайти</span>
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
                ) : hasResults ? (
                  <div className="py-2">
                    {/* Products Section */}
                    {productResults.length > 0 && (
                      <div className="mb-4">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Продукти
                        </div>
                        {productResults.map((product, index) => (
                          <button
                            key={`product-${index}`}
                            onClick={() => handleProductClick(product)}
                            className="flex w-full items-center px-4 py-2 text-left hover:bg-gray-100"
                          >
                            <span className="text-sm">
                              {processHighlightedText(product.highlighted, searchQuery)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Categories Section */}
                    {categoryResults.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Категорії
                        </div>
                        {categoryResults.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className="flex w-full items-center px-4 py-2 text-left hover:bg-gray-100"
                          >
                            <span className="text-sm">
                              {highlightCategoryText(category.name.uk, searchQuery)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
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
        <div className="flex shrink-0 items-center gap-4 ">
          <Link href="/cabinet" className="pl-4 flex flex-col items-center text-gray-700 hover:text-[#4563d1]">
            <User className="h-6 w-6" />
            <span className="hidden text-[12px] xl:block">Кабінет</span>
          </Link>
          <Link href="/notifications" className="flex flex-col items-center text-gray-700 hover:text-[#4563d1]">
            <Bell className="h-6 w-6" />
            <span className="hidden text-[12px] xl:block">Сповіщення</span>
          </Link>
          <Link href="/favorites" className="flex flex-col items-center text-gray-700 hover:text-[#4563d1]">
            <Heart className="h-6 w-6" />
            <span className="hidden text-[12px] xl:block">Обране</span>
          </Link>
          <Link href="/cart" className=" pr-4 flex flex-col items-center text-gray-700 hover:text-[#4563d1]">
            <ShoppingCart className="h-6 w-6" />
            <span className="hidden text-[12px] xl:block">Кошик</span>
          </Link>
          {/* Auth Buttons */}
          <Link href="/auth/login" className="max-h-[35px] rounded-lg bg-[#4563d1] px-3 py-2 text-sm text-white hover:bg-[#6a1b8c] transition whitespace-nowrap">
            Увійти
          </Link>
          <Link href="/auth/register" className="max-h-[35px] rounded-lg bg-[#FFD700] px-3 py-2 text-sm text-gray-900 hover:bg-[#ffd900]/90 transition whitespace-nowrap">
            Зареєструватися
          </Link>
        </div>
      </div>
    </header>
  )
}