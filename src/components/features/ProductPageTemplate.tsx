'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Truck, Package, CreditCard, ShieldCheck, Store, ChevronRight } from 'lucide-react'


type MediaItem = { url?: string; secondaryUrl?: string; order?: number }

type ProductFeatureItem = { value: string | number | null; type: string; nullable: boolean }
type ProductFeatureCategory = { category: string; features: Record<string, ProductFeatureItem> }

type Product = {
  id: string
  name: string
  productType?: string
  categoryPath?: string[]
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

interface Props {
  productId: string
}

export default function ProductPageTemplate({ productId }: Props) {
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [crumbs, setCrumbs] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setIsLoading(true)
        const [pRes, mRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/products/media/${productId}`),
        ])
        if (!cancelled) {
          if (pRes.ok) {
            const prod = await pRes.json()
            setProduct(prod)
            const ids: string[] = Array.isArray(prod?.categoryPath) ? [...prod.categoryPath].reverse() : []
            if (ids.length) {
              try {
                const results = await Promise.all(
                  ids.map(async (id: string) => {
                    const r = await fetch(`/api/categories/${id}`)
                    if (!r.ok) return { id, name: 'Категорія' }
                    const c = await r.json()
                    const nameUk: string = c?.name?.uk || 'Категорія'
                    return { id, name: nameUk }
                  })
                )
                if (!cancelled) setCrumbs(results)
              } catch {
                if (!cancelled) setCrumbs(ids.map((id: string) => ({ id, name: 'Категорія' })))
              }
            } else {
              setCrumbs([])
            }
          }
          if (mRes.ok) {
            const media = await mRes.json()
            const items: MediaItem[] = (media || []).sort((a: MediaItem, b: MediaItem) => (a.order || 0) - (b.order || 0))
            setImages(items)
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [productId])

  const primaryPrice = product?.hasDiscount ? (product.finalPrice ?? product.discountPrice ?? product.price) : product?.price
  const showOld = Boolean(product?.hasDiscount && product?.price && primaryPrice && (product!.price > primaryPrice!))

  const normalizedStatus = (product?.quantityStatus || '').toLowerCase()
  const stockState: 'in' | 'low' | 'out' = (() => {
    if (!product?.quantityStatus) {
      if (typeof product?.quantity === 'number') {
        if ((product!.quantity!) <= 0) return 'out'
        if ((product!.quantity!) <= 3) return 'low'
        return 'in'
      }
      return 'in'
    }
    if (normalizedStatus.includes('немає') || normalizedStatus.includes('відсут') || normalizedStatus.includes('out')) return 'out'
    if (normalizedStatus.includes('зік') || normalizedStatus.includes('закінч') || normalizedStatus.includes('low')) return 'low'
    return 'in'
  })()
  const stockBadge = stockState === 'in'
    ? { text: 'В наявності', classes: 'bg-green-100 text-green-800' }
    : stockState === 'low'
    ? { text: 'Закінчується', classes: 'bg-orange-100 text-orange-800' }
    : { text: 'Немає в наявності', classes: 'bg-red-100 text-red-800' }

  return (
    <div className="min-h-screen bg-gray-90">
      <Header />
      <main className="mx-auto max-w-[1450px] px-4 py-6">
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

        {/* Top section: gallery + purchase/delivery/payment */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-lg bg-white p-4 shadow-sm" >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-0">
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#4563d1]"></div>
                  </div>
                ) : images.length > 0 ? (
                  <Image src={images[activeIdx]?.url || images[activeIdx]?.secondaryUrl || ''} alt={product?.name || ''} fill className="object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">Немає фото</div>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {images.slice(0, 6).map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={`relative aspect-[4/3] overflow-hidden rounded border ${activeIdx === i ? 'border-[#4563d1]' : 'border-transparent'} bg-gray-100`}
                    >
                      {img.url || img.secondaryUrl ? (
                        <Image src={img.url || img.secondaryUrl || ''} alt={`thumb-${i}`} fill className="object-cover" />
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Features and description (moved under gallery, same width) */}
            <section className="mt-4 rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Характеристики та опис</h3>
                <button className="text-sm text-[#4563d1] hover:underline" onClick={() => setIsExpanded(v => !v)}>
                  {isExpanded ? 'Приховати опис та характеристики' : 'Показати опис та характеристики'}
                </button>
              </div>

              {/* Collapsible content with fade overlay when collapsed */}
              <div className="relative">
                <div className={`${isExpanded ? '' : 'max-h-[260px] overflow-hidden'} transition-all`}>
                  {product?.features?.map((group, idx) => (
                    <div key={idx} className="mb-6">
                      <h4 className="mb-3 text-base font-semibold text-gray-800">{group.category}</h4>
                      <div className="overflow-hidden rounded-lg border border-gray-100">
                        <div className="divide-y divide-gray-100">
                          {Object.entries(group.features).map(([label, item]) => (
                            <div key={label} className="grid grid-cols-2 gap-3 px-3 py-2 md:gap-6">
                              <div className="text-sm text-gray-500">{label}</div>
                              <div className="text-sm text-gray-800 break-words">{String(item.value ?? '—')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {!isExpanded && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent" />
                )}
              </div>

              {!isExpanded && (
                <div className="mt-4 flex w-full">
                  <button
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setIsExpanded(true)}
                  >
                    Розгорнути
                  </button>
                </div>
              )}

              {isExpanded && (
                <div className="mt-4 flex w-full">
                <button
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setIsExpanded(false)}>
                    Згорнути
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Right info columns */}
          <div className="lg:col-span-5 space-y-4">
            {/* Purchase */}
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h1 className="mb-2 text-xl font-semibold text-gray-900">{product?.name || '...'}</h1>
              {/* Rating and seller */}
              <div className="mb-3 mt-2 flex flex-row items-start gap-3 text-sm">
                {product?.quantityStatus && (
                  <span className={` inline-block rounded-full px-2 py-0.5 text-sm ${stockBadge.classes}`}>{stockBadge.text}</span>
                )}

                <div className="flex items-center gap-1 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400" />
                  ))}
                  <span className="ml-1 text-gray-600">5.0</span>
                  <span className="text-gray-400">(8)</span>
                </div>
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-3xl font-bold text-[#E53935] leading-none">{primaryPrice ? `${Math.round(primaryPrice)} грн` : '—'}</span>
                {showOld && (
                  <span className="pb-1 text-l text-gray-400 line-through">{Math.round(product!.price)} грн</span>
                )}
                {product?.hasDiscount && product.discountPercentage ? (
                  <span className="ml-auto rounded bg-red-50 px-3 py-0.5 text-l font-medium text-red-700">-{product.discountPercentage}%</span>
                ) : null}
              </div>

              <div className="mb-3 flex flex-col items-start gap-3 text-sm">
                <div className="flex items-center gap-1 text-gray-700 mt-2">
                  <Store className="h-4 w-4" />
                  <span>Продавець</span>
                  <Link href="#" className="text-[#4563d1] hover:underline">Cosmetics_shop</Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-15">
                <button className="rounded-full bg-[#4563d1] px-1 py-2 text-sm text-white hover:bg-[#364ea8]">Купити</button>
                <button className="rounded-full border border-[#4563d1] px-1 py-2 text-sm border-2 text-[#4563d1] hover:bg-[#4563d1]/5">Купити зараз</button>
              </div>
            </div>

            {/* Delivery */}
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-900">Доставка</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#4563d1]" /> Нова Пошта (безкоштовно за умов)
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#4563d1]" /> Кур&#39;єр по місту
                </li>
              </ul>
              <button className="mt-3 text-sm text-[#4563d1] hover:underline">Дізнатися дату доставки</button>
            </div>

            {/* Payment */}
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-900">Оплата та гарантії</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#4563d1]" /> Банківською карткою</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#4563d1]" /> Післяплата, повернення та гарантія</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Reviews placeholder */}
        <section className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Відгуки про товар</h3>
          <p className="text-sm text-gray-500">Відгуки поки що відсутні.</p>
        </section>

        {/* Seller block placeholder */}
        <section className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Продавець</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Cosmetics_shop</p>
              <p className="text-sm text-gray-500">94% позитивних відгуків</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="#" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">Каталог продавця</Link>
              <Link href="#" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">Контакти</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}


