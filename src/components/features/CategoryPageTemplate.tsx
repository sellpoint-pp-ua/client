'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import CategoryCard from '@/components/features/CategoryCard'
import ApiProductCard from '@/components/features/ApiProductCard'
import FilterSidebar from '@/components/features/FilterSidebar'
import { Search } from 'lucide-react'
import { filterOptions, sortOptions } from '@/constants/sampleData'

interface ProductFeatureItem {
  value: string | number | null
  type: string
  nullable: boolean
}

interface ProductFeatureCategory {
  category: string
  features: Record<string, ProductFeatureItem>
}

interface Product {
  id: string
  name: string
  productType: string
  categoryPath: string[]
  features?: ProductFeatureCategory[]
  price: number
  discountPrice?: number
  hasDiscount?: boolean
  finalPrice?: number
  discountPercentage?: number
  sellerId?: string
  quantityStatus?: number | string
  quantity?: number
}

interface CategoryPageTemplateProps {
  categoryId: string;
  title: string;
  description?: string;
}

export default function CategoryPageTemplate({ 
  categoryId,
  title,
  description
}: CategoryPageTemplateProps) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [crumbs, setCrumbs] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        setIsLoadingCategories(true)
        setError(null)
        
        const response = await fetch(`/api/categories/${categoryId}/children`)
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        setCategories(data)
        try {
          const chain: Array<{ id: string; name: string }> = []
          let currentId: string | null = categoryId
          let guard = 0
          while (currentId && guard < 20) {
            const r: Response = await fetch(`/api/categories/${currentId}`)
            if (!r.ok) break
            const c: { name?: string, parentId?: string | null } = await r.json()
            const nameStr: string = typeof c?.name === 'string' ? c.name : 'Категорія'
            chain.push({ id: currentId, name: nameStr })
            currentId = (typeof c?.parentId === 'string' ? c.parentId : null)
            guard++
          }
          setCrumbs(chain.reverse())
        } catch {
          setCrumbs([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category data')
      } finally {
        setIsLoadingCategories(false)
      }
    }

    async function fetchProducts() {
      try {
        setIsLoadingProducts(true)
        
        const response = await fetch(`/api/products/by-category/${categoryId}?pageSize=50`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsData = await response.json()
        const list = Array.isArray(productsData?.products) ? productsData.products : Array.isArray(productsData) ? productsData : []

        const validProducts = list.filter((product: { id?: string; name?: string }) => 
          product && product.id && product.name && product.name !== 'Без назви'
        )
        
        setProducts(validProducts)
        setFilteredProducts(validProducts)
      } catch (err) {
        console.error('Error fetching products:', err)
        setProducts([])
        setFilteredProducts([])
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchCategoryData()
    fetchProducts()
  }, [categoryId])

  useEffect(() => {
    let result = [...products]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(product => 
        product.name.toLowerCase().includes(query)
      )
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price))
        break
      case 'price-high':
        result.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price))
        break
      case 'newest':
      default:
        break
    }

    setFilteredProducts(result)
  }, [products, searchQuery, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const applyFiltersToServer = useCallback(async (selected: Record<string, string[]>) => {
    try {
      setIsLoadingProducts(true)
      const active = Object.entries(selected).filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
      if (active.length === 0) {
        const res = await fetch(`/api/products/by-category/${categoryId}?pageSize=50`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch products')
        const productsData = await res.json()
        const list = Array.isArray(productsData?.products) ? productsData.products : Array.isArray(productsData) ? productsData : []
        const validProducts = list.filter((product: { id?: string; name?: string }) => 
          product && product.id && product.name && product.name !== 'Без назви'
        )
        setProducts(validProducts)
        setFilteredProducts(validProducts)
        return
      }

      const body = {
        categoryId,
        include: Object.fromEntries(active.map(([k, v]) => [k, v[0]])),
        exclude: {},
        page: 0,
        pageSize: 50,
      }
      const res = await fetch('/api/products/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to fetch filtered products')
      const data = await res.json()
      const list = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : []
      const valid = list.filter((p: { id?: string; name?: string }) => p && p.id && p.name && p.name !== 'Без назви')
      setProducts(valid)
      setFilteredProducts(valid)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingProducts(false)
    }
  }, [categoryId])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="mb-4 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="text-[#4563d1] hover:underline cursor-pointer mr-2">Каталог товарів</Link>
            </li>
            {crumbs.map((c, idx) => (
              <li key={`${c.id}-${idx}`} className="flex items-center gap-1">
                <span className="text-xl"><ChevronRight className="h-5 w-5" /></span>
                <Link href={`/category/${c.id}`} className="text-[#4563d1] hover:underline cursor-pointer mr-2 ml-2">{c.name}</Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>

        {/* Categories Grid */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Категорії
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
              {isLoadingCategories ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-lg bg-gray-200"
                  />
                ))
              ) : error ? (
                <p className="col-span-full text-center text-red-500">{error}</p>
              ) : (
                categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    title={category.name}
                    count={0}
                    href={`/category/${category.id}`}
                    iconType="sparkles"
                  />
                ))
              )}
            </div>
          </section>
        )}

        {/* Products Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredProducts.length > 0 ? `Товари (${filteredProducts.length})` : 'Товари'}
            </h2>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук товарів в категорії..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Sort buttons */}
          <div className="mb-6">
            <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm divide-x divide-gray-200">
              <button
                type="button"
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 text-sm font-medium focus:outline-none ${sortBy === 'newest' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Новинки
              </button>
              <button
                type="button"
                onClick={() => setSortBy('price-low')}
                className={`px-4 py-2 text-sm font-medium focus:outline-none ${sortBy === 'price-low' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Дешевше
              </button>
              <button
                type="button"
                onClick={() => setSortBy('price-high')}
                className={`px-4 py-2 text-sm font-medium focus:outline-none ${sortBy === 'price-high' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Дорожче
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0">
              <FilterSidebar 
                categoryId={categoryId}
                onChange={applyFiltersToServer}
              />
            </div>
            
            <div className="flex-1">
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-80 animate-pulse rounded-lg bg-gray-200"
                    />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  {searchQuery ? (
                    <>
                      <Search className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg text-gray-500 mb-2">
                        Нічого не знайдено для &quot;{searchQuery}&quot;
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        Спробуйте змінити пошуковий запит
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="rounded-lg bg-[#4563d1] px-4 py-2 text-white hover:bg-[#364ea8] transition-colors"
                      >
                        Очистити пошук
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg text-gray-500 mb-2">
                        Товари в цій категорії поки що відсутні
                      </p>
                      <p className="text-sm text-gray-400">
                        Спробуйте переглянути інші категорії
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
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
        </section>
      </main>
    </div>
  )
}