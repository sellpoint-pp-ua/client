'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, User, Bell, Heart, ShoppingCart, LogOut } from 'lucide-react'
import Link from 'next/link'
import AnimatedLogo from '@/components/shared/AnimatedLogo'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

type CategorySearchResult = {
  id: string;
  name: {
    uk: string;
    en: string;
  };
  parentId: string | null;
}

type ProductSearchResult = {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  hasDiscount?: boolean;
  finalPrice?: number;
  discountPercentage?: number;
  quantityStatus?: string;
  quantity?: number;
  productType?: string;
  categoryPath?: string[];
}

const cleanCategoryName = (name: string): string => {
  return name.replace(/\[|\]/g, '')
}

const highlightCategoryText = (text: string, searchQuery: string): React.JSX.Element => {
  const cleanText = cleanCategoryName(text)
  if (!searchQuery) return <span className="text-gray-500">{cleanText}</span>
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

const highlightProductText = (text: string, searchQuery: string): React.JSX.Element => {
  if (!searchQuery) return <span className="text-gray-700">{text}</span>
  const regex = new RegExp(`(${searchQuery})`, 'gi')
  const parts = text.split(regex)
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <strong key={index} className="font-bold">{part}</strong>
        ) : (
          <span key={index} className="text-gray-700">{part}</span>
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
  const [displayName, setDisplayName] = useState<string | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()

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
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      const name = localStorage.getItem('user_display_name')
      setDisplayName(token ? (name || 'Кабінет') : null)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true)
        setError(null)
        try {
          console.log('Searching for:', searchQuery)
          
          const [categoryResponse, productResponse] = await Promise.all([
            fetch(`/api/categories/search?name=${encodeURIComponent(searchQuery)}&languageCode=uk`),
            fetch(`/api/products/search?name=${encodeURIComponent(searchQuery)}&languageCode=uk`)
          ])

          const categoryData = categoryResponse.ok ? await categoryResponse.json() : []
          const productData = productResponse.ok ? await productResponse.json() : []

          console.log('Category response:', categoryData)
          console.log('Product response:', productData)

          const validProducts = productData.filter((product: ProductSearchResult) => 
            product && product.id && product.name && product.name !== 'Без назви'
          )

          console.log('Valid products:', validProducts)

          setCategoryResults(categoryData)
          setProductResults(validProducts.slice(0, 5))
          setShowDropdown(categoryData.length > 0 || validProducts.length > 0)
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
    console.log('Product clicked:', product)
    if (product.id) {
      const productUrl = `/product/${product.id}`
      console.log('Redirecting to:', productUrl)
      router.push(productUrl)
      setShowDropdown(false)
      setSearchQuery('')
    } else {
      console.warn('Cannot navigate: missing product id in search result', product)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Search submitted:', searchQuery)
      console.log('Product results:', productResults)
      console.log('Category results:', categoryResults)
      
      const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}`
      console.log('Redirecting to search page:', searchUrl)
      router.push(searchUrl)
      setShowDropdown(false)
      setSearchQuery('')
    }
  }

  const hasResults = categoryResults.length > 0 || productResults.length > 0

  return (
    <header
      className="sticky top-0 z-50 h-[80px] shadow-md"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center top',
        backgroundSize: 'auto',
      }}
    >
      <div className="flex h-full w-screen  items-center justify-around px-20 gap-4 flex-nowrap">
        {/* Logo */}
        <Link href="/" className="flex items-center whitespace-nowrap mt-2 mr-8 group" aria-label="Sell Point">
          <span className="relative block h-[32px] w-[148px] md:h-[36px] md:w-[168px] lg:h-[40px] lg:w-[186px]">
            <AnimatedLogo className="absolute inset-0 w-full h-full" />
          </span>
        </Link>

        {/* Search Bar */}
        <div className="pl-0 mr-4 flex min-w-0 flex-1 items-center max-w-[900px] mt-1 z-50" ref={searchContainerRef}>
          <div className="relative flex w-full max-h-[35px]">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full z-50 border border-gray-200 border-1.5 rounded-lg transition-[border-color,box-shadow] duration-200 ease-out focus-within:outline-none focus-within:ring-2 focus-within:ring-[#4563d1]/30 focus-within:border-[#4563d1] shadow-md"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => hasResults && setShowDropdown(true)}
                placeholder="Я шукаю..."
                className="w-full bg-white appearance-none rounded-l-lg border border-transparent placeholder-gray-500 text-gray-900 px-3 py-1 text-sm md:px-4 md:text-base focus:outline-none"
              />
              <button 
                type="submit"
                className="flex  items-center rounded-r-lg bg-[#4563d1] px-3 py-2 h-8.5 text-white md:px-6 focus:outline-none hover:bg-[#364ea8] transition-colors duration-200 ease-out"
              >
                <Search className="mr-0 h-5 w-5" />
                <span className="hidden md:inline">Знайти</span>
              </button>
            </form>

            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute z-1 left-0 right-0 top-10.5 pt-0 max-h-[400px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
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
                      <div className="mb-0">
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
                              {highlightProductText(product.name, searchQuery)}
                            </span>
                            {product.price && (
                              <span className="ml-auto text-sm text-gray-500">
                                {Math.round(product.price)} грн
                              </span>
                            )}
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
<div className="flex shrink-0 items-center gap-6 ">
          <Link href="/admin" className="max-h-[35px] shadow-md rounded-xl bg-[#4563d1] px-3 py-2 text-sm text-white hover:bg-[#364ea8] transition-colors duration-200 ease-out">
            Адмін панель
          </Link>
          <Link href="/notifications" className="flex flex-col items-center text-gray-700 hover:text-[#4563d1]">
            <Bell className="h-6 w-6" />
            <span className="hidden text-[12px] xl:block">Сповіщення</span>
          </Link>
          <Link href="/favorites" className="flex flex-col items-center text-gray-700 hover:text-[#4563d1]">
            <Heart className="h-6 w-6" />
            <span className="text-[12px] xl:block">Обране</span>
          </Link>
          <Link href="/cart" className=" pr-4 flex flex-col items-center text-gray-700 hover:text-[#4563d1]">
            <ShoppingCart className="h-6 w-6" />
            <span className="hidden text-[12px] xl:block">Кошик</span>
          </Link>
          {isAuthenticated && displayName ? (
            <div className="flex items-center gap-5 -ml-3">
              <Link href="/cabinet" className="flex flex-col items-center text-center text-gray-700 hover:text-[#4563d1]">
                <User className="h-6 w-6" />
                <span className="hidden text-[12px] xl:block">{displayName}</span>
              </Link>
              <div className=" flex flex-col items-center text-center text-gray-700 hover:text-[#4563d1]">
                <button
                  onClick={() => { logout() }}
                  className="h-6 w-6"
                >
                  <LogOut className="h-5 w-5" />
                </button>
                <span className="hidden text-[12px] xl:block">Вийти</span>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="max-h-[35px] shadow-md rounded-xl bg-[#4563d1] px-3 py-2 text-sm text-white hover:bg-[#364ea8] transition-colors duration-200 ease-out">
                Увійти
              </Link>
              <Link href="/auth/register" className="max-h-[35px] shadow-md rounded-xl bg-[white] px-3 py-2 text-sm text-gray-900">
                Зареєструватися
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}