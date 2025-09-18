'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ApiProductCard from '@/components/features/ApiProductCard'

type ApiProduct = {
  id: string
  name: string
  price: number
  discountPrice?: number
  hasDiscount?: boolean
  discountPercentage?: number
  quantityStatus?: number
  quantity?: number
}

const PAGE_SIZE = 10

export default function RandomProductsGrid() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const loadedIdsRef = useRef<Set<string>>(new Set())

  const fetchPage = useCallback(async (pageToLoad: number, replace: boolean = false) => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`https://api.sellpoint.pp.ua/api/Product/random?page=${pageToLoad}&pageSize=${PAGE_SIZE}`, { cache: 'no-store' })
      if (!res.ok) { setError('Не вдалося завантажити товари'); setLoading(false); return }
      const data: ApiProduct[] = await res.json()
      setHasMore(Array.isArray(data) && data.length === PAGE_SIZE)
      if (replace) {
        loadedIdsRef.current = new Set(data.map(d => d.id))
        setProducts(data)
        setPage(1)
      } else {
        const unique = data.filter(d => !loadedIdsRef.current.has(d.id))
        unique.forEach(d => loadedIdsRef.current.add(d.id))
        setProducts(prev => [...prev, ...unique])
        setPage(pageToLoad)
      }
    } catch {
      setError('Сталася помилка під час завантаження')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPage(1, true)
  }, [fetchPage])

  const canShowMore = useMemo(() => hasMore && !loading, [hasMore, loading])

  return (
    <section className="mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((p) => (
          <ApiProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
            hasDiscount={p.hasDiscount}
            finalPrice={(p as any).finalPrice || p.discountPrice}
            discountPercentage={p.discountPercentage}
            quantityStatus={p.quantityStatus}
            quantity={p.quantity}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          className="rounded-xl hover:cursor-pointer border-2 border-[#6282f5] px-6 py-1.5 text-[#4563d1] font-semibold hover:bg-[#4563d1]/10 transition-colors w-full mx-auto disabled:opacity-60"
          onClick={() => fetchPage(page + 1)}
          disabled={!canShowMore}
        >
          {loading && products.length === 0 ? 'Завантаження…' : 'Показати ще'}
        </button>
        {products.length > PAGE_SIZE && (
          <button
            className="text-sm text-gray-600 hover:text-[#4563d1]"
            onClick={() => fetchPage(1, true)}
          >
            Сховати зайві товари
          </button>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </section>
  )
}


