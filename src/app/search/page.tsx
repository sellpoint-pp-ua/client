'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import ApiProductCard from '@/components/features/ApiProductCard'
import FilterSidebar from '@/components/features/FilterSidebar'
import { Search, Filter } from 'lucide-react'
import { filterOptions, sortOptions } from '@/constants/sampleData'

interface Product {
  id: string
  name: string
  productType: string
  categoryPath: string[]
  features?: { category: string; features: Record<string, { value: string | number | null; type: string; nullable: boolean }> }[]
  price: number
  discountPrice?: number
  hasDiscount?: boolean
  finalPrice?: number
  discountPercentage?: number
  sellerId?: string
  quantityStatus?: string
  quantity?: number
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')

  useEffect(() => {
    if (query) {
      searchProducts(query)
    }
  }, [query])

  const searchProducts = async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Searching products for:', searchQuery)
      const response = await fetch(`/api/products/search?name=${encodeURIComponent(searchQuery)}&languageCode=uk`)
      if (!response.ok) {
        throw new Error('Failed to fetch search results')
      }
      
      const data = await response.json()
      console.log('Search results:', data)
      
      const validProducts = data.filter((product: Product) => 
        product && product.id && product.name && product.name !== 'Без назви'
      )
      
      console.log('Valid products:', validProducts)
      setProducts(validProducts)
      
      if (validProducts.length === 1) {
        const product = validProducts[0]
        console.log('Found single product, redirecting to:', product.id)
        window.location.href = `/product/${product.id}`
        return
      }
    } catch (err) {
      console.error('Error searching products:', err)
      setError('Помилка пошуку. Спробуйте ще раз.')
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (sortType: string) => {
    setSortBy(sortType)
    const sortedProducts = [...products]
    
    switch (sortType) {
      case 'price-low':
        sortedProducts.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price))
        break
      case 'price-high':
        sortedProducts.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price))
        break
      case 'name':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'uk'))
        break
      case 'relevance':
      default:
        break
    }
    
    setProducts(sortedProducts)
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-[1500px] px-4 py-6">
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Введіть пошуковий запит
            </h1>
            <p className="text-gray-600">
              Використовуйте пошук у верхній частині сторінки для пошуку товарів
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Результати пошуку
          </h1>
          <p className="text-gray-600">
            Знайдено {products.length} товарів для запиту &quot;{query}&quot;
          </p>
          
          {/* Якщо знайдено кілька товарів, показуємо кнопку для переходу на перший */}
          {products.length > 1 && (
            <div className="mt-4">
              <button
                onClick={() => {
                  const firstProduct = products[0]
                  if (firstProduct && firstProduct.id) {
                    window.location.href = `/product/${firstProduct.id}`
                  }
                }}
                className="rounded-lg bg-[#4563d1] px-4 py-2 text-white hover:bg-[#364ea8] transition-colors"
              >
                Перейти до першого товару: {products[0]?.name}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Фільтри
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <FilterSidebar 
              filterOptions={filterOptions}
              sortOptions={sortOptions}
            />
          </div>
          
          {/* Products Section */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {isLoading ? 'Пошук...' : `${products.length} товарів`}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Сортувати:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30"
                >
                  <option value="relevance">За релевантністю</option>
                  <option value="price-low">Ціна: від дешевих</option>
                  <option value="price-high">Ціна: від дорогих</option>
                  <option value="name">За назвою</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-80 animate-pulse rounded-lg bg-gray-200"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-lg text-red-500 mb-2">{error}</p>
                <button
                  onClick={() => searchProducts(query)}
                  className="rounded-lg bg-[#4563d1] px-4 py-2 text-white hover:bg-[#364ea8] transition-colors"
                >
                  Спробувати ще раз
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Нічого не знайдено
                </h2>
                <p className="text-gray-600 mb-4">
                  Спробуйте змінити пошуковий запит або переглянути інші категорії
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['пудра', 'телефон', 'книга', 'одяг'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => searchProducts(suggestion)}
                      className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ApiProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    hasDiscount={product.hasDiscount}
                    finalPrice={product.finalPrice}
                    discountPercentage={product.discountPercentage}
                    quantityStatus={product.quantityStatus}
                    quantity={product.quantity}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-[1500px] px-4 py-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Завантаження...</p>
          </div>
        </main>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
