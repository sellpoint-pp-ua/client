'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Star, Heart, ShoppingCart, Bookmark } from 'lucide-react'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import ApiProductCard from '@/components/features/ApiProductCard'
import { Search } from 'lucide-react'

interface Product {
  id: string
  name: string
  productType: string
  categoryPath: string[]
  price: number
  discountPrice?: number
  hasDiscount?: boolean
  finalPrice?: number
  discountPercentage?: number
  sellerId?: string
  quantityStatus?: number | string
  quantity?: number
}

interface SellerInfo {
  id: string
  name: string
  displayName: string
  avatar?: string
  avatarUrl?: string
  rating: number
  positiveReviews: number
  totalReviews: number
  description?: string
  isVerified: boolean
}

interface SellerPageTemplateProps {
  sellerId: string;
  sellerInfo: SellerInfo;
}

export default function SellerPageTemplate({ 
  sellerId,
  sellerInfo
}: SellerPageTemplateProps) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; count: number }>>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
  const [activeTab, setActiveTab] = useState<'catalog' | 'reviews'>('catalog')
  
  // Seller data states
  const [sellerData, setSellerData] = useState<SellerInfo>(sellerInfo)
  const [isLoadingSeller, setIsLoadingSeller] = useState(false)
  const [sellerRating, setSellerRating] = useState<{ averageRating: number; totalReviews: number }>({
    averageRating: sellerInfo.rating,
    totalReviews: sellerInfo.totalReviews
  })
  
  // Categories and products states
  const [sellerCategories, setSellerCategories] = useState<Array<{ id: string; name: string; count: number }>>([])
  const [isLoadingSellerCategories, setIsLoadingSellerCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Copy link states
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  // Runtime API base (from /api/public-config); fallback to prod URL
  const [apiBase, setApiBase] = useState<string>('https://api.sellpoint.pp.ua/api')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/public-config', { cache: 'no-store' })
        if (!res.ok) return
        const cfg = await res.json()
        if (!cancelled && typeof cfg?.apiUrl === 'string' && cfg.apiUrl) {
          setApiBase(cfg.apiUrl)
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  // helper to fetch JSON with optional Authorization header, and retry anonymously on 401/403
  const fetchJSON = useCallback(async (
    path: string,
    init: RequestInit = {}
  ): Promise<{ ok: boolean; status: number; data: any }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const baseHeaders: Record<string, string> = { accept: '*/*' }
    // Add JSON header only if body present and not already set
    const hasBody = typeof (init as any)?.body !== 'undefined'
    if (hasBody) baseHeaders['Content-Type'] = 'application/json'

    let res: Response
    if (token) {
      res = await fetch(`${apiBase}${path}`, {
        ...init,
        headers: { ...baseHeaders, ...(init.headers || {}), Authorization: `Bearer ${token}` },
      })
      if (res.status === 401 || res.status === 403) {
        // retry anonymously
        res = await fetch(`${apiBase}${path}`, {
          ...init,
          headers: { ...baseHeaders, ...(init.headers || {}) },
        })
      }
    } else {
      res = await fetch(`${apiBase}${path}`, {
        ...init,
        headers: { ...baseHeaders, ...(init.headers || {}) },
      })
    }
    let data: any = null
    try { data = await res.json() } catch {}
    return { ok: res.ok, status: res.status, data }
  }, [apiBase])

  // Load seller data from API
  useEffect(() => {
    let cancelled = false
    async function loadSellerData() {
      try {
        setIsLoadingSeller(true)
        
        // Load seller info
        const sellerRes = await fetchJSON(`/Store/GetStoreById?storeId=${sellerId}`)
        if (!sellerRes.ok || cancelled) return
        const sellerInfo = sellerRes.data
        if (!cancelled) {
          setSellerData({
            id: sellerInfo.id,
            name: sellerInfo.name,
            displayName: sellerInfo.name,
            avatarUrl: sellerInfo.avatar?.sourceUrl,
            rating: 0, // Will be updated from reviews API
            positiveReviews: 0,
            totalReviews: 0,
            isVerified: true
          })
        }

        // Load seller rating
        const ratingRes = await fetchJSON(`/ProductReview/GetAllReviewsByStoreId?storeId=${sellerId}`)
        if (!ratingRes.ok || cancelled) return
        const ratingData = ratingRes.data
        if (!cancelled) {
          setSellerRating({
            averageRating: ratingData.averageRating || 0,
            totalReviews: ratingData.totalReviews || 0
          })
        }
      } catch (error) {
        console.error('Failed to load seller data:', error)
      } finally {
        if (!cancelled) setIsLoadingSeller(false)
      }
    }
    
    loadSellerData()
    return () => { cancelled = true }
  }, [sellerId, fetchJSON])

  // Load seller categories and products
  useEffect(() => {
    let cancelled = false
    async function loadSellerCategories() {
      try {
        setIsLoadingSellerCategories(true)
        setIsLoadingProducts(true)
        
        // Load all seller products to extract categories (try auth, fallback anonymous)
        const body = {
          categoryId: null,
          include: {},
          exclude: {},
          page: 0,
          pageSize: 100,
          priceMin: 0,
          priceMax: 0,
          sort: 0
        }
        const productsRes = await fetchJSON(`/Product/get-by-seller-id/${sellerId}`, {
          method: 'POST',
          body: JSON.stringify(body)
        })
        if (!productsRes.ok || cancelled) {
          return
        }
        const productsData = productsRes.data
        const products = Array.isArray(productsData?.products) ? productsData.products : []
        
        if (!cancelled && products.length > 0) {
          // Extract unique category IDs from products
          const categoryIds = new Set<string>()
          products.forEach((product: any) => {
            if (Array.isArray(product.categoryPath) && product.categoryPath.length > 0) {
              categoryIds.add(product.categoryPath[0]) // First category in path
            }
          })
          
          // Load category names and counts
          const categoryPromises = Array.from(categoryIds).map(async (categoryId) => {
            try {
              // Load category name
              const categoryRes = await fetchJSON(`/Category/${categoryId}`)
              if (!categoryRes.ok) return null
              const categoryData = categoryRes.data
              
              // Load products count for this category
              const countBody = {
                categoryId: categoryId,
                include: {},
                exclude: {},
                page: 0,
                pageSize: 100,
                priceMin: 0,
                priceMax: 0,
                sort: 0
              }
              const countRes = await fetchJSON(`/Product/get-by-seller-id/${sellerId}`, {
                method: 'POST',
                body: JSON.stringify(countBody)
              })
              let count = 0
              if (countRes.ok) {
                const countData = countRes.data
                count = countData.count || 0
              }
              
              return {
                id: categoryId,
                name: categoryData.name || 'Категорія',
                count: count
              }
            } catch (error) {
              console.error(`Failed to load category ${categoryId}:`, error)
              return null
            }
          })
          
          const categories = (await Promise.all(categoryPromises)).filter((cat): cat is { id: string; name: string; count: number } => cat !== null)
          
          if (!cancelled) {
            setSellerCategories(categories)
            
            // Load all products for "all" category
            setProducts(products)
            setFilteredProducts(products)
          }
        }
      } catch (error) {
        console.error('Failed to load seller categories:', error)
      } finally {
        if (!cancelled) {
          setIsLoadingSellerCategories(false)
          setIsLoadingProducts(false)
        }
      }
    }
    
    loadSellerCategories()
    return () => { cancelled = true }
  }, [sellerId, fetchJSON])


  useEffect(() => {
    let result = [...products]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(product => 
        product.name.toLowerCase().includes(query)
      )
    }

    // Filter by selected category
    if (selectedCategory !== 'all') {
      result = result.filter(product => 
        Array.isArray(product.categoryPath) && product.categoryPath[0] === selectedCategory
      )
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price))
        break
      case 'price-high':
        result.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price))
        break
      case 'rating':
        // Mock rating sort
        break
      case 'popularity':
        // Mock popularity sort
        break
      case 'newest':
      default:
        break
    }

    setFilteredProducts(result)
  }, [products, searchQuery, sortBy, selectedCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleCopyLink = async () => {
    try {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
      await navigator.clipboard.writeText(currentUrl)
      setShowCopyNotification(true)
      setTimeout(() => setShowCopyNotification(false), 3000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    
    if (categoryId === 'all') {
      // Show all products
      setFilteredProducts(products)
      return
    }
    
    // Load products for specific category
    try {
      setIsLoadingProducts(true)
      const body = {
        categoryId: categoryId,
        include: {},
        exclude: {},
        page: 0,
        pageSize: 100,
        priceMin: 0,
        priceMax: 0,
        sort: 0
      }
      const res = await fetchJSON(`/Product/get-by-seller-id/${sellerId}`, {
        method: 'POST',
        body: JSON.stringify(body)
      })
      if (!res.ok) return
      const data = res.data
      const categoryProducts = Array.isArray(data?.products) ? data.products : []
      setFilteredProducts(categoryProducts)
    } catch (error) {
      console.error('Failed to load category products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        {/* Seller Info Banner */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm  ">
          <div className="flex items-start gap-5">
            {/* Seller Avatar */}
            <div className="flex-shrink-0">
              {sellerData.avatarUrl ? (
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img 
                    src={sellerData.avatarUrl} 
                    alt={sellerData.displayName}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#4563d1] to-[#364ea8] flex items-center justify-center text-white text-2xl font-bold">
                  {sellerData.displayName.charAt(0)}
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-0">
                    {sellerData.displayName}
                  </h1>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4.5 w-4.5 ${
                              i < Math.floor(sellerRating.averageRating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {sellerRating.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>{sellerRating.totalReviews} відгуків</span>
                    </div>
                  </div>
                  
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    title="Скопіювати посилання на продавця"
                  >
                    <Bookmark className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-2 border-t border-gray-200 pt-4">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'catalog'
                    ? 'border-[#4563d1] text-[#4563d1]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Каталог продавця
              </button>
              
            </div>
          </div>
        </div>

        {activeTab === 'catalog' && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="max-w-md">
                <div className="relative ">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Я шукаю..."
                    className="w-full rounded-lg shadow-sm  border border-gray-300 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1] bg-white"
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
                  onClick={() => setSortBy('rating')}
                  className={`px-4 py-2 text-sm font-medium focus:outline-none ${sortBy === 'rating' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  За рейтингом
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('popularity')}
                  className={`px-4 py-2 text-sm font-medium focus:outline-none ${sortBy === 'popularity' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  За популярністю
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
              {/* Categories Sidebar */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Категорії продавця
                  </h3>
                  
                  <div className="space-y-2">
                    {/* All categories option */}
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value="all"
                          checked={selectedCategory === 'all'}
                          onChange={() => handleCategoryChange('all')}
                          className="h-4 w-4 text-[#4563d1] focus:ring-[#4563d1] border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          Всі категорії
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {products.length}
                      </span>
                    </label>
                    
                    {/* Seller categories */}
                    {isLoadingSellerCategories ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-8 animate-pulse rounded bg-gray-200" />
                        ))}
                      </div>
                    ) : (
                      sellerCategories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="category"
                              value={category.id}
                              checked={selectedCategory === category.id}
                              onChange={() => handleCategoryChange(category.id)}
                              className="h-4 w-4 text-[#4563d1] focus:ring-[#4563d1] border-gray-300"
                            />
                            <span className="ml-3 text-sm text-gray-700">
                              {category.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {category.count}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {/* Products Grid */}
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
                          Товари від цього продавця поки що відсутні
                        </p>
                        <p className="text-sm text-gray-400">
                          Спробуйте переглянути інших продавців
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product: any) => (
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
          </>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Відгуки про продавця
            </h2>
            <p className="text-gray-500">
              Тут будуть відгуки про продавця...
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
      
      {/* Copy notification */}
      {showCopyNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Посилання на продавця збережено в буфер обміну
        </div>
      )}
    </div>
  )
}
