'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import ApiProductCard from '@/components/features/ApiProductCard'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Truck, Package, CreditCard, ShieldCheck, Store, ChevronRight, ChevronLeft } from 'lucide-react'
import { useCartDrawer } from '@/components/cart/CartDrawerProvider'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'


type MediaItem = { url?: string; secondaryUrl?: string; order?: number; type?: 'image' | 'video' }

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
  quantityStatus?: number | string
  quantity?: number
  paymentOptions?: number
  deliveryType?: number
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
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [averageRating, setAverageRating] = useState<number>(0)
  const [reviewComments, setReviewComments] = useState<Array<{ rating: number; userId: string; comment: string; createdAt: string }>>([])
  const [usernames, setUsernames] = useState<Record<string, string>>({})
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const { addToCart, isInCart, openCart } = useCartDrawer()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [sellerName, setSellerName] = useState<string>('')

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
            try {
              const sid = typeof prod?.sellerId === 'string' ? prod.sellerId : ''
              if (sid) {
                const r = await fetch(`https://api.sellpoint.pp.ua/api/Store/GetStoreById?storeId=${encodeURIComponent(sid)}`)
                if (r.ok) {
                  const s = await r.json()
                  if (!cancelled) setSellerName(typeof s?.name === 'string' ? s.name : '')
                }
              }
            } catch {}
            const ids: string[] = Array.isArray(prod?.categoryPath) ? [...prod.categoryPath].reverse() : []
            if (ids.length) {
              try {
                const results = await Promise.all(
                  ids.map(async (id: string) => {
                    const r = await fetch(`/api/categories/${id}`)
                    if (!r.ok) return { id, name: 'Категорія' }
                    const c = await r.json()
                    const nameStr: string = typeof c?.name === 'string' ? c.name : 'Категорія'
                    return { id, name: nameStr }
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
            const items: MediaItem[] = (Array.isArray(media) ? media : [])
              .map((m: MediaItem) => ({ ...m }))
              .sort((a: MediaItem, b: MediaItem) => (a.order || 0) - (b.order || 0))
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

  useEffect(() => {
    let cancelled = false
    async function loadReviews() {
      try {
        setReviewsLoading(true)
        const res = await fetch(`/api/products/reviews/${productId}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch reviews')
        const data = await res.json()
        if (cancelled) return
        const comments = Array.isArray(data?.comments) ? data.comments : []
        setAverageRating(typeof data?.averageRating === 'number' ? data.averageRating : 0)
        setReviewComments(comments)
      } catch (e) {
        if (!cancelled) {
          setAverageRating(0)
          setReviewComments([])
        }
      } finally {
        if (!cancelled) setReviewsLoading(false)
      }
    }
    if (productId) loadReviews()
    return () => { cancelled = true }
  }, [productId])

  useEffect(() => {
    let cancelled = false
    async function loadUsers() {
      const uniqueIds = Array.from(new Set(reviewComments.map(c => c.userId).filter(Boolean)))
      if (uniqueIds.length === 0) return
      try {
        const results = await Promise.all(uniqueIds.map(async (id) => {
          const r = await fetch(`/api/users/${id}`, { cache: 'no-store' })
          if (!r.ok) return [id, 'Користувач'] as const
          const u = await r.json()
          const name = typeof u?.username === 'string' ? u.username : 'Користувач'
          return [id, name] as const
        }))
        if (cancelled) return
        const map: Record<string, string> = {}
        for (const [id, name] of results) map[id] = name
        setUsernames(prev => ({ ...prev, ...map }))
      } catch {
      }
    }
    loadUsers()
    return () => { cancelled = true }
  }, [reviewComments])

  const primaryPrice = product?.hasDiscount ? (product.finalPrice ?? product.discountPrice ?? product.price) : product?.price
  const showOld = Boolean(product?.hasDiscount && product?.price && primaryPrice && (product!.price > primaryPrice!))

  const normalizedStatus = typeof product?.quantityStatus === 'string' ? product.quantityStatus.toLowerCase() : ''
  const stockState: 'in' | 'low' | 'out' = (() => {
    if (typeof product?.quantityStatus === 'number') {
      switch (product.quantityStatus) {
        case 3: return 'out'
        case 2: return 'low'
        case 1: return 'in'
        default:
          if (typeof product?.quantity === 'number') {
            if ((product!.quantity!) <= 0) return 'out'
            if ((product!.quantity!) <= 3) return 'low'
            return 'in'
          }
          return 'in'
      }
    }

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

  type LabeledIcon = { key: string; label: string; icon: 'card' | 'shield' | 'truck' | 'package' }
  const paymentChips: LabeledIcon[] = (() => {
    const v = product?.paymentOptions ?? 0
    const chips: LabeledIcon[] = []
    if (v & (1 << 0)) chips.push({ key: 'AfterPayment', label: 'Післяплата', icon: 'shield' })
    if (v & (1 << 1)) chips.push({ key: 'Card', label: 'Карткою', icon: 'card' })
    if (v & (1 << 2)) chips.push({ key: 'InstallmentsMono', label: 'Розстрочка Monobank', icon: 'card' })
    if (v & (1 << 3)) chips.push({ key: 'InstallmentsPrivat', label: 'Розстрочка Privat', icon: 'card' })
    if (v & (1 << 4)) chips.push({ key: 'InstallmentsPUMB', label: 'Розстрочка PUMB', icon: 'card' })
    return chips
  })()

  const deliveryChips: LabeledIcon[] = (() => {
    const v = product?.deliveryType ?? 0
    const chips: LabeledIcon[] = []
    if (v & (1 << 0)) chips.push({ key: 'NovaPost', label: 'Нова Пошта', icon: 'package' })
    if (v & (1 << 1)) chips.push({ key: 'Rozetka', label: 'Rozetka', icon: 'package' })
    if (v & (1 << 2)) chips.push({ key: 'SelfPickup', label: 'Самовивіз', icon: 'truck' })
    return chips
  })()

  const StarBar = ({ value, size = 16 }: { value: number; size?: number }) => {
    const clamped = Math.max(0, Math.min(5, value))
    const full = Math.floor(clamped)
    const frac = clamped - full
    return (
      <div className="inline-flex items-center gap-1 align-middle" aria-label={`Рейтинг ${clamped.toFixed(1)} з 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const fillPct = i < full ? 100 : i === full ? Math.round(frac * 100) : 0
          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              {/* Base outline */}
              <Star className="block text-gray-300" style={{ width: size, height: size }} strokeWidth={2} />
              {/* Colored fill clip */}
              {fillPct > 0 && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
                  <Star className="block text-[#4563d1] fill-current" style={{ width: size, height: size }} strokeWidth={0} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const totalSlides = Math.max(1, Math.ceil(Math.min(reviewComments.length, 6) / 3))

  const ReviewCard = ({ rating, userName, comment, createdAt }: { rating: number; userName: string; comment: string; createdAt: string }) => {
    const textRef = useRef<HTMLDivElement | null>(null)
    const [isOverflowing, setIsOverflowing] = useState(false)
    useEffect(() => {
      const el = textRef.current
      if (!el) return
      const check = () => {
        const overflowing = el.scrollHeight > el.clientHeight + 1
        setIsOverflowing(overflowing)
      }
      check()
      const ro = new ResizeObserver(check)
      ro.observe(el)
      return () => ro.disconnect()
    }, [])
    const dateStr = (() => { try { const d = new Date(createdAt); const dd = String(d.getDate()).padStart(2,'0'); const mm = String(d.getMonth()+1).padStart(2,'0'); const yy = d.getFullYear(); return `${dd}.${mm}.${yy}` } catch { return '' } })()
    return (
      <div className="rounded-lg border border-gray-200 p-4 shadow-sm h-[160px] flex flex-col">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#4563d1]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={i < rating ? 'fill-current text-[#4563d1]' : 'text-gray-300'} style={{ width: 14, height: 14 }} />
            ))}
          </div>
          <span className="text-xs text-gray-500">{dateStr}</span>
        </div>
        <div className="mb-1 text-sm font-semibold text-gray-900">{userName}</div>
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#4563d1]"></span>
          <span>Придбано на SellPoint</span>
        </div>
        <div className="relative text-sm text-gray-700">
          <div ref={textRef} className="max-h-[60px] overflow-hidden">
            {comment}
          </div>
          {isOverflowing && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white/100 to-white/0" />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="mx-auto max-w-[1450px] px-8 py-6">
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
                  images[activeIdx]?.type === 'video' ? (
                    <video
                      src={images[activeIdx]?.url || images[activeIdx]?.secondaryUrl || ''}
                      className="h-full w-full object-contain"
                      controls
                    />
                  ) : (
                    <Image src={images[activeIdx]?.url || images[activeIdx]?.secondaryUrl || ''} alt={product?.name || ''} fill className="object-contain" />
                  )
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
                      className={`relative aspect-[4/3] overflow-hidden hover:cursor-pointer rounded border ${activeIdx === i ? 'border-[#4563d1]' : 'border-transparent'} bg-gray-100`}
                    >
                      {img.type === 'video' ? (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-700 bg-gray-200">Відео</div>
                      ) : (img.url || img.secondaryUrl) ? (
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
                <button className="text-sm hover:cursor-pointer text-[#4563d1] hover:underline" onClick={() => setIsExpanded(v => !v)}>
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
                    className="flex-1 rounded-lg border hover:cursor-pointer border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setIsExpanded(true)}
                  >
                    Розгорнути
                  </button>
                </div>
              )}

              {isExpanded && (
                <div className="mt-4 flex w-full">
                <button
                  className="flex-1 rounded-lg border hover:cursor-pointer border-gray-300 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setIsExpanded(false)}>
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

                <div className="flex items-center gap-2">
                  <StarBar value={averageRating} size={16} />
                  <span className="text-gray-600">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">({reviewComments.length})</span>
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
                  <span className="text-[#4563d1] font-semibold">{sellerName || 'Магазин'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-15">
                <button
                  disabled={stockBadge.text === 'Немає в наявності'}
                  onClick={() => {
                    if (stockBadge.text === 'Немає в наявності') return
                    if (isInCart(productId)) { openCart(); return }
                    if (!isAuthenticated) { router.push('/auth/login'); return }
                    addToCart(productId, 1)
                  }}
                  className={`rounded-full px-1 py-2 text-sm ${isInCart(productId) ? 'bg-white border border-[#4563d1] text-[#4563d1] hover:bg-[#4563d1]/5' : 'text-white bg-[#4563d1] hover:bg-[#364ea8]'} ${stockBadge.text === 'Немає в наявності' ? 'bg-gray-300 cursor-not-allowed text-white' : ''}`}
                >
                  {isInCart(productId) ? 'У кошику' : 'Купити'}
                </button>
                <button
                  onClick={() => {
                    if (stockBadge.text === 'Немає в наявності') return
                    if (!isAuthenticated) { router.push('/auth/login'); return }
                    const sid = typeof product?.sellerId === 'string' ? product.sellerId : ''
                    if (!sid) return
                    router.push(`/checkout/${encodeURIComponent(sid)}?productId=${encodeURIComponent(productId)}&pcs=1`)
                  }}
                  className="rounded-full border hover:cursor-pointer border-[#4563d1] px-1 py-2 text-sm border-2 text-[#4563d1] hover:bg-[#4563d1]/5"
                >
                  Купити зараз
                </button>
              </div>
            </div>

            {/* Delivery */}
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-900">Доставка</h2>
              {deliveryChips.length > 0 ? (
                <ul className="flex flex-wrap gap-2 text-sm text-gray-700">
                  {deliveryChips.map((d) => (
                    <li key={d.key} className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1">
                      {d.icon === 'truck' ? (
                        <Truck className="h-4 w-4 text-[#4563d1]" />
                      ) : (
                        <Package className="h-4 w-4 text-[#4563d1]" />
                      )}
                      <span>{d.label}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Інформація про доставку відсутня</p>
              )}
              <button className="mt-3 text-sm text-[#4563d1] hover:underline">Дізнатися дату доставки</button>
            </div>

            {/* Payment */}
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-900">Оплата та гарантії</h2>
              {paymentChips.length > 0 ? (
                <ul className="flex flex-wrap gap-2 text-sm text-gray-700">
                  {paymentChips.map((p) => (
                    <li key={p.key} className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1">
                      {p.icon === 'card' ? (
                        <CreditCard className="h-4 w-4 text-[#4563d1]" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-[#4563d1]" />
                      )}
                      <span>{p.label}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Інформація про оплату відсутня</p>
              )}
            </div>
          </div>
        </section>

        {/* Reviews + Seller constrained to left column width */}
        {/* Reviews */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <section className="group/reviews rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Відгуки про товар
                  <span className="ml-2 align-middle mb-2 text-lg font-bold text-[#4563d1]">{reviewComments.length}</span>
                </h3>
                {/* Optional full list link */}
                {reviewComments.length > 0 && (
                  <Link href={`/product/${productId}/reviews`} className="text-sm text-[#4563d1] hover:underline">Всі</Link>
                )}
              </div>

              {/* Average rating */}
              <div className="mb-3 flex items-center gap-2">
                <StarBar value={averageRating} size={16} />
                <span className="text-sm font-medium text-gray-900">{averageRating.toFixed(1)}</span>
              </div>

              {/* Reviews horizontal slider (temporary replacement for carousel) */}
              {reviewsLoading ? (
                <div className="h-[180px] animate-pulse rounded bg-gray-100" />
              ) : reviewComments.length === 0 ? (
                <p className="text-sm text-gray-500">Відгуки поки що відсутні.</p>
              ) : (
                <div className="relative">
                  <div
                    ref={sliderRef as any}
                    className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
                  >
                    {reviewComments.slice(0, 6).map((c, idx) => (
                      <div key={idx} className="snap-start shrink-0 w-[244px]">
                        <ReviewCard
                          rating={c.rating}
                          userName={usernames[c.userId] || 'Користувач'}
                          comment={c.comment}
                          createdAt={c.createdAt}
                        />
                      </div>
                    ))}
                    {reviewComments.length > 6 && (
                      <div className="snap-start shrink-0 w-[280px] flex items-center justify-center">
                        <Link href={`/product/${productId}/reviews`} className="rounded-full bg-[#4563d1] px-4 py-2 text-sm text-white hover:bg-[#364ea8]">Переглянути всі</Link>
                      </div>
                    )}
                  </div>

                  {/* Slider arrows */}
                  {reviewComments.length > 3 && (
                    <>
                      <button
                        type="button"
                        aria-label="Попередні"
                        onClick={() => {
                          const el = (sliderRef as any).current as HTMLDivElement | null
                          if (el) el.scrollBy({ left: -340, behavior: 'smooth' })
                          setCurrentSlide(s => Math.max(0, s - 1))
                        }}
                        className="pointer-events-none hover:cursor-pointer opacity-0 group-hover/reviews:pointer-events-auto group-hover/reviews:opacity-100 transition-opacity duration-200 ease-out absolute -left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/100 p-1 shadow-md border border-gray-200 hover:bg-white"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        type="button"
                        aria-label="Наступні"
                        onClick={() => {
                          const el = (sliderRef as any).current as HTMLDivElement | null
                          if (el) el.scrollBy({ left: 340, behavior: 'smooth' })
                          setCurrentSlide(s => s + 1)
                        }}
                        className="pointer-events-none hover:cursor-pointer opacity-0 group-hover/reviews:pointer-events-auto group-hover/reviews:opacity-100 transition-opacity duration-200 ease-out absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/100 p-1 shadow-md border border-gray-200 p-1 shadow hover:bg-white"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </section>

            {/* Seller block placeholder */}
            <section className="rounded-lg bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Продавець</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{sellerName || 'Магазин'}</p>
                  <p className="text-sm text-gray-500">94% позитивних відгуків</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="#" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">Каталог продавця</Link>
                  <Link href="#" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">Контакти</Link>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* Seller related lists */}
        <section className="mt-6">
          {/* Схоже у продавця */}
          <div className="mb-8">
            <h3 className="mb-4 text-base text-lg font-bold text-gray-900">Схоже у продавця</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {[
                { id: 's1', name: 'Диски R19 колісні літні автомобільні', price: '36 940₴/комплект', img: 'https://picsum.photos/seed/201/400/300' },
                { id: 's2', name: 'Диски R19 литі автомобільні для', price: '36 940₴/комплект', img: 'https://picsum.photos/seed/202/400/300' },
                { id: 's3', name: 'Диски на авто 17" TOYOTA HILUX', price: '34 770₴/комплект', img: 'https://picsum.photos/seed/203/400/300' },
                { id: 's4', name: 'Диски на авто 18" BMW 2 G42 3 G20', price: '30 420₴/комплект', img: 'https://picsum.photos/seed/204/400/300' },
                { id: 's5', name: 'Диски R18 для автомобіля BMW', price: '30 420₴/комплект', img: 'https://picsum.photos/seed/205/400/300' },
                { id: 's6', name: 'Литі диски R20 TOYOTA Sequoia', price: '47 800₴/комплект', img: 'https://picsum.photos/seed/206/400/300' },
              ].map((card) => (
                <div key={card.id} className="rounded-xl bg-white p-2.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                    <Image src={card.img} alt={card.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <p className="line-clamp-2 min-h-[2.4rem] text-[14px] leading-snug text-gray-900">{card.name}</p>
                  <div className="mt-2 text-[15px] font-semibold text-gray-900">{card.price}</div>
                  <button className="mt-2 w-full rounded-full bg-[#4563d1] py-1.5 text-[15px] font-medium text-white hover:bg-[#364ea8]">Купити</button>
                </div>
              ))}
            </div>
          </div>

          {/* Найкраще у продавця */}
          <div className="mb-8">
            <h3 className="mb-4 text-base text-lg font-bold  text-gray-900">Найкраще у продавця</h3>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {[
                { id: 'b1', label: 'R18', img: 'https://picsum.photos/seed/211/200/200' },
                { id: 'b2', label: 'R20', img: 'https://picsum.photos/seed/212/200/200' },
                { id: 'b3', label: 'R19', img: 'https://picsum.photos/seed/213/200/200' },
                { id: 'b4', label: 'R17', img: 'https://picsum.photos/seed/214/200/200' },
                { id: 'b5', label: 'R21', img: 'https://picsum.photos/seed/215/200/200' },
                { id: 'b6', label: 'R22', img: 'https://picsum.photos/seed/216/200/200' },
                { id: 'b7', label: 'R16', img: 'https://picsum.photos/seed/217/200/200' },
                { id: 'b8', label: 'R15', img: 'https://picsum.photos/seed/218/200/200' },
              ].map((item) => (
                <div key={item.id} className="rounded-xl bg-white pb-2.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-t-md bg-gray-100">
                    <Image src={item.img} alt={item.label} fill className="object-cover" sizes="(max-width: 768px) 100vw, 20vw" />
                  </div>
                  <div className="text-center text-[16px] font-medium text-gray-900">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Переглянуті */}
          <div className="mb-2">
            <h3 className="mb-4 text-base text-lg font-bold text-gray-900">Переглянуті</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {[
                { id: 'v1', name: 'Диски R19 литі автомобільні для', price: '36 940₴/комплект', img: 'https://picsum.photos/seed/221/400/300' },
                { id: 'v2', name: 'Диски R18 для автомобіля BMW', price: '30 420₴/комплект', img: 'https://picsum.photos/seed/222/400/300' },
                { id: 'v3', name: 'Диск R18 на авто Bmw OBR1567', price: '7 500₴/шт.', img: 'https://picsum.photos/seed/223/400/300' },
                { id: 'v4', name: 'Диск R19 на авто Bmw OBR1698', price: '9 000₴/шт.', img: 'https://picsum.photos/seed/224/400/300' },
                { id: 'v5', name: 'R19 оригінал BMW 4 i4 G26 G22', price: '19 600₴/шт.', img: 'https://picsum.photos/seed/225/400/300' },
                { id: 'v6', name: 'Диски R19 литі автомобільні', price: '36 940₴/комплект', img: 'https://picsum.photos/seed/226/400/300' },
              ].map((card) => (
                <div key={card.id} className="rounded-xl bg-white p-2.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                    <Image src={card.img} alt={card.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <p className="line-clamp-2 min-h-[2.4rem] text-[14px] leading-snug text-gray-900">{card.name}</p>
                  <div className="mt-2 text-[15px] font-semibold text-gray-900">{card.price}</div>
                  <button className="mt-2 w-full rounded-full bg-[#4563d1] py-1.5 text-[15px] font-medium text-white hover:bg-[#364ea8]">Купити</button>
                </div>
              ))}
            </div>
          </div>

          {/* Схоже в інших продавців */}
          <div className="mt-8">
            <h3 className="mb-4 text-base text-lg font-bold text-gray-900">Схоже в інших продавців</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[
                { id: 'o1', name: 'Диски R20 на Bmw X3 X5 F15 3 F30 4 F32 5 F10 7 F01 X6', price: 10779, img: 'https://picsum.photos/seed/231/600/600' },
                { id: 'o2', name: 'Диски 5*120 R20 на Bmw X5 F15 X6 F16 X3 5 F10 7 F01 6 F06', price: 10379, img: 'https://picsum.photos/seed/232/600/600' },
                { id: 'o3', name: 'Нові диски 763 M Style R19 на BMW', price: 8819, img: 'https://picsum.photos/seed/233/600/600' },
                { id: 'o4', name: 'Диски R19 колісні литі автомобільні BMW 1000M X1 X2', price: 36950, img: 'https://picsum.photos/seed/234/600/600' },
                { id: 'o5', name: 'Диски на Авто R19 5×120 BMW X3 X4 X5 X6 E70 F15 F16 F10', price: 8100, img: 'https://picsum.photos/seed/235/600/600' },
              ].map((p) => (
                <ApiProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  imageUrl={p.img}
                />
              ))}
            </div>
          </div>

          {/* Tags blocks */}
          <div className="mt-10">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Популярні виробники в категорії{' '}
              {crumbs.length ? (
                <Link href={`/category/${crumbs[crumbs.length - 1].id}`} className="text-[#4563d1] font-bold hover:underline">
                  {crumbs[crumbs.length - 1].name}
                </Link>
              ) : (
                <span className="text-[#4563d1] font-bold">Категорія</span>
              )}
            </h3>
            <div className="flex flex-wrap gap-4">
              {['Mak','RC Design','BMW','ZW','DEZENT','GMP Italia','Porshe','Replica','VOIN','Autec','Borbet','RIAL','Brock','Mercedes-Benz','Audi'].map((tag) => (
                <Link key={tag} href="#" className="rounded-lg bg-white px-3 py-1 text-[14px] text-[#4563d1] hover:bg-gray-50">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  )
}


