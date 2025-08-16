'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import CategoryCard from '@/components/features/CategoryCard'
import ApiProductCard from '@/components/features/ApiProductCard'
import FilterSidebar from '@/components/features/FilterSidebar'
import { ArrowDownAZ } from 'lucide-react'
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
  quantityStatus?: string
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
  const [categories, setCategories] = useState<Array<{ id: string; name: { uk: string } }>>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category data')
      } finally {
        setIsLoadingCategories(false)
      }
    }

    async function fetchProducts() {
      try {
        setIsLoadingProducts(true)
        
       
        const response = await fetch(`/api/products/by-category/${categoryId}?pageSize=20`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsData = await response.json()
        setProducts(productsData)
      } catch (err) {
        console.error('Error fetching products:', err)
        setProducts([]) 
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchCategoryData()
    fetchProducts()
  }, [categoryId])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
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
                    title={category.name.uk}
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
              {products.length > 0 ? `Товари (${products.length})` : 'Товари'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Сортувати:</span>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ArrowDownAZ className="h-4 w-4" />
                За популярністю
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0">
              <FilterSidebar 
                filterOptions={filterOptions}
                sortOptions={sortOptions}
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
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg text-gray-500 mb-2">
                    Товари в цій категорії поки що відсутні
                  </p>
                  <p className="text-sm text-gray-400">
                    Спробуйте переглянути інші категорії
                  </p>
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
        </section>
      </main>
    </div>
  )
}