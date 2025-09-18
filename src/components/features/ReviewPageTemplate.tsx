'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Star, ThumbsUp, ThumbsDown, Store } from 'lucide-react'
import { useCartDrawer } from '@/components/cart/CartDrawerProvider'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

type Product = {
  id: string
  name: string
  price: number
  discountPrice?: number
  hasDiscount?: boolean
  finalPrice?: number
  discountPercentage?: number
  categoryPath?: string[]
  quantityStatus?: number | string
  quantity?: number
}

type Review = {
  rating: number
  userId: string
  comment: string
  createdAt: string
  reactions?: Record<string, boolean>
  positiveCount?: number
  negativeCount?: number
}

interface Props {
  productId: string
}

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
            <Star className="block text-gray-300" style={{ width: size, height: size }} strokeWidth={2} />
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

export default function ReviewPageTemplate({ productId }: Props) {
  const [product, setProduct] = useState<Product | null>(null)
  const [crumbs, setCrumbs] = useState<Array<{ id: string; name: string }>>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [sellerName, setSellerName] = useState<string>('')
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { addToCart, isInCart, openCart } = useCartDrawer()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
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

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!productId) return
      try {
        setLoading(true)
        const [pRes, rRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/products/reviews/${productId}`, { cache: 'no-store' }),
        ])
        if (cancelled) return

        if (pRes.ok) {
          const prod = await pRes.json()
          setProduct(prod)
          const ids: string[] = Array.isArray(prod?.categoryPath) ? [...prod.categoryPath].reverse() : []
          if (ids.length) {
            try {
              const results = await Promise.all(
                ids.map(async (cid: string) => {
                  const r = await fetch(`/api/categories/${cid}`)
                  if (!r.ok) return { id: cid, name: 'Категорія' }
                  const c = await r.json()
                  const nameStr: string = typeof c?.name === 'string' ? c.name : 'Категорія'
                  return { id: cid, name: nameStr }
                })
              )
              if (!cancelled) setCrumbs(results)
            } catch {
              if (!cancelled) setCrumbs(ids.map((cid: string) => ({ id: cid, name: 'Категорія' })))
            }
          } else {
            setCrumbs([])
          }

          try {
            const sellerId: string | undefined = typeof prod?.sellerId === 'string' ? prod.sellerId : undefined
            if (sellerId) {
              const r = await fetch(`/api/users/${sellerId}`, { cache: 'no-store' })
              if (r.ok) {
                const u = await r.json()
                setSellerName(typeof u?.username === 'string' ? u.username : '')
              }
            } else {
              setSellerName('')
            }
          } catch { setSellerName('') }

          try {
            const m = await fetch(`/api/products/media/${productId}`, { cache: 'no-store' })
            if (m.ok) {
              const media = await m.json()
              const items: Array<{ url?: string; secondaryUrl?: string; type?: string; order?: number }> = Array.isArray(media) ? media : []
              items.sort((a, b) => (a.order || 0) - (b.order || 0))
              const first = items.find(i => (i.type || 'image') === 'image' && ((i as any).secondaryUrl || i.url))
              setThumbUrl((first as any)?.secondaryUrl || first?.url || null)
            }
          } catch {}
        }

        if (rRes.ok) {
          const data = await rRes.json()
          const list: Review[] = Array.isArray(data?.comments) ? data.comments : []
          setReviews(list)
          setAverageRating(typeof data?.averageRating === 'number' ? data.averageRating : 0)
        } else {
          setReviews([])
          setAverageRating(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [productId])

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) { setCurrentUserId(null); return }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/users/current', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store',
        })
        if (!res.ok) return
        const u = await res.json()
        const uid = (u && (u.id || u.userId || u.Id || u.ID || u._id)) ? String(u.id || u.userId || u.Id || u.ID || u._id) : null
        if (!cancelled) {
          setCurrentUserId(uid)
          if (uid && typeof window !== 'undefined') {
            localStorage.setItem('current_user_id', uid)
          }
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  const total = reviews.length
  const visibleReviews = showAll ? reviews : reviews.slice(0, 10)

  const distribution = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]
    for (const r of reviews) {
      const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1
      buckets[idx] += 1
    }
    return buckets
  }, [reviews])

  const primaryPrice = product?.hasDiscount
    ? (product?.finalPrice ?? product?.discountPrice ?? product?.price)
    : product?.price
  const showOld = Boolean(product?.hasDiscount && product?.price && primaryPrice && (product!.price > (primaryPrice as number)))

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

        {/* Title and meta */}
        <section className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Відгуки покупців про {product?.name || '...'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Всього {total} відгуків</p>
        </section>

        {/* Two columns */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column: reviews */}
          <div className="lg:col-span-8 space-y-4 ">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[160px] animate-pulse rounded-lg bg-white" />
              ))
            ) : visibleReviews.length === 0 ? (
              <div className="rounded-lg bg-white p-4 text-sm text-gray-500">Відгуки поки що відсутні.</div>
            ) : (
              visibleReviews.map((rev, idx) => {
                const likesCount = typeof rev.positiveCount === 'number'
                  ? rev.positiveCount
                  : (rev.reactions ? Object.values(rev.reactions).filter(v => v === true).length : 0)
                const dislikesCount = typeof rev.negativeCount === 'number'
                  ? rev.negativeCount
                  : (rev.reactions ? Object.values(rev.reactions).filter(v => v === false).length : 0)
                const uid = currentUserId || (typeof window !== 'undefined' ? localStorage.getItem('current_user_id') : null)
                let myReaction: null | 'like' | 'dislike' = null
                if (uid && rev.reactions) {
                  const match = Object.keys(rev.reactions).find(k => String(k) === String(uid))
                  if (match) myReaction = rev.reactions[match] ? 'like' : 'dislike'
                }
                const reactionKey = `${productId}:${rev.userId}:${rev.createdAt}`
                if (!myReaction && typeof window !== 'undefined') {
                  const local = localStorage.getItem(`review_reaction_${reactionKey}`)
                  if (local === 'like' || local === 'dislike') myReaction = local as 'like' | 'dislike'
                }
                return (
                  <ReviewCard
                    key={idx}
                    review={rev}
                    productId={productId}
                    initialLikeCount={likesCount}
                    initialDislikeCount={dislikesCount}
                    initialMyReaction={myReaction}
                    reactionKey={reactionKey}
                  />
                )
              })
            )}

            {total > 10 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="rounded-xl hover:cursor-pointer border-2 border-[#6282f5] px-6 py-1.5 text-[#4563d1] font-semibold hover:bg-[#4563d1]/10 transition-colors w-full mx-auto"
                >
                  {showAll ? 'Показати менше' : 'Показати ще'}
                </button>
              </div>
            )}
          </div>

          {/* Right column: product summary + rating stats */}
          <div className="lg:col-span-4 space-y-4">
            {/* Product compact card */}
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                  {thumbUrl ? (
                    <Image src={`${thumbUrl}?v=${Date.now()}`} alt={product?.name || ''} fill className="object-contain border border-gray-300 rounded-lg" />
                  ) : (
                    <Image src="/window.svg" alt={product?.name || ''} fill className="object-contain" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="line-clamp-2 text-md font-medium text-gray-900">{product?.name || '...'}</div>

                  {product?.quantityStatus && (
                    <div className="mt-1">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[12px] ${stockBadge.classes}`}>{stockBadge.text}</span>
                    </div>
                  )}
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
              <div className="mt-3">
                <button
                  disabled={stockBadge.text === 'Немає в наявності'}
                  onClick={() => {
                    if (stockBadge.text === 'Немає в наявності') return
                    if (isInCart(productId)) { openCart(); return }
                    if (!isAuthenticated) { router.push('/auth/login'); return }
                    addToCart(productId, 1)
                  }}
                  className={`w-full hover:cursor-pointer rounded-full py-2 text-sm ${isInCart(productId) ? 'bg-white border border-[#4563d1] text-[#4563d1] hover:bg-[#4563d1]/5' : 'bg-[#4563d1] text-white hover:bg-[#364ea8]'} ${stockBadge.text === 'Немає в наявності' ? 'bg-gray-300 cursor-not-allowed text-white' : ''}`}
                >
                  {isInCart(productId) ? 'У кошику' : 'Купити'}
                </button>
              </div>
            </div>

            {/* Rating stats */}
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
              </div>
              <div className="mb-3 text-[14px] ">
                Оцінка товару на основі відгуків у продавця <Link href="#" className="text-[#4563d1] hover:underline">Cosmetics_shop</Link>
              </div>
              <div className="space-y-2">
                {[5,4,3,2,1].map((star) => {
                  const buckets = distribution
                  const count = buckets[star - 1]
                  const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-[14px]">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="w-3  text-gray-700">{star}</span>
                      <div className="h-2 flex-1 rounded bg-gray-200 overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-gray-600">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function ReviewCard({ review, productId, initialLikeCount, initialDislikeCount, initialMyReaction, reactionKey }: { review: Review; productId: string; initialLikeCount?: number; initialDislikeCount?: number; initialMyReaction?: null | 'like' | 'dislike'; reactionKey: string }) {
  const [expanded, setExpanded] = useState(false)
  const textRef = useRef<HTMLDivElement | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [userName, setUserName] = useState<string>('Користувач')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount ?? 0)
  const [dislikeCount, setDislikeCount] = useState<number>(initialDislikeCount ?? 0)
  const [myReaction, setMyReaction] = useState<null | 'like' | 'dislike'>(initialMyReaction ?? null)

  useEffect(() => {
    if (typeof window !== 'undefined' && myReaction) {
      localStorage.setItem(`review_reaction_${reactionKey}`, myReaction)
    }
  }, [myReaction, reactionKey])

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    const check = () => {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadUser() {
      try {
        let r = await fetch(`https://api.sellpoint.pp.ua/api/User/GetUserById?userId=${encodeURIComponent(review.userId)}`, { cache: 'no-store' }).catch(() => null as any)
        if (!r || !r.ok) {
          r = await fetch(`/api/users/${review.userId}`, { cache: 'no-store' })
        }
        if (!r || !r.ok) return
        const u = await r.json()
        if (cancelled) return
        const name = (typeof u?.fullName === 'string' && u.fullName.trim()) ? u.fullName : (typeof u?.username === 'string' ? u.username : 'Користувач')
        const avatarObj = u?.avatar
        const avatar = (avatarObj && typeof avatarObj?.sourceUrl === 'string') ? avatarObj.sourceUrl : (typeof u?.avatarUrl === 'string' ? u.avatarUrl : null)
        setUserName(name)
        setAvatarUrl(avatar)
      } catch {}
    }
    loadUser()
    return () => { cancelled = true }
  }, [review.userId])

  const dateStr = (() => { try { const d = new Date(review.createdAt); const dd = String(d.getDate()).padStart(2,'0'); const mm = String(d.getMonth()+1).padStart(2,'0'); const yy = d.getFullYear(); return `${dd}.${mm}.${yy}` } catch { return '' } })()

  async function sendReaction(reaction: boolean) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) {
      if (typeof window !== 'undefined') window.location.href = '/auth/login'
      return
    }
    try {
      if ((reaction && myReaction === 'like') || (!reaction && myReaction === 'dislike')) {
        const del = await fetch(`/api/products/reviews/delete-reaction?productId=${encodeURIComponent(productId)}&commentUserId=${encodeURIComponent(review.userId)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (del.ok) {
          if (reaction) setLikeCount(v => Math.max(0, v - 1))
          else setDislikeCount(v => Math.max(0, v - 1))
          setMyReaction(null)
          if (typeof window !== 'undefined') localStorage.removeItem(`review_reaction_${reactionKey}`)
        }
        return
      }

      if ((reaction && myReaction === 'dislike') || (!reaction && myReaction === 'like')) {
        const del = await fetch(`/api/products/reviews/delete-reaction?productId=${encodeURIComponent(productId)}&commentUserId=${encodeURIComponent(review.userId)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (del.ok) {
          if (myReaction === 'like') setLikeCount(v => Math.max(0, v - 1))
          if (myReaction === 'dislike') setDislikeCount(v => Math.max(0, v - 1))
          setMyReaction(null)
          if (typeof window !== 'undefined') localStorage.removeItem(`review_reaction_${reactionKey}`)
        }
      }

      const res = await fetch(`/api/products/reviews/set-reaction?productId=${encodeURIComponent(productId)}&commentUserId=${encodeURIComponent(review.userId)}&reaction=${reaction}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        if (reaction) {
          setLikeCount(v => v + 1)
          setMyReaction('like')
        } else {
          setDislikeCount(v => v + 1)
          setMyReaction('dislike')
        }
      }
    } catch {}
  }

  return (
    <div className="rounded-lg  p-4  bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200 flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={userName} fill className="object-cover" />
            ) : null}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{userName}</div>
            <div className="text-xs text-gray-500">{dateStr}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#4563d1]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={i < review.rating ? 'fill-current text-[#4563d1]' : 'text-gray-300'} style={{ width: 20, height: 20 }} />
          ))}
        </div>
      </div>

      <div className="mt-2 mb-1 flex items-center gap-2 text-xs text-gray-500">
        <span className="inline-flex h-2 w-2 rounded-full bg-[#4563d1]"></span>
        <span>Придбано на SellPoint</span>
      </div>

      <div className="mt-3 relative text-sm text-gray-700">
        <div ref={textRef} className={`${expanded ? '' : 'max-h-[40px] overflow-hidden'}`}>
          {review.comment}
        </div>
        {!expanded && isOverflowing && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-white/0" />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          {!expanded && isOverflowing ? (
            <button className="text-sm hover:cursor-pointer text-[#4563d1] hover:underline" onClick={() => setExpanded(true)}>
              Детальніше
            </button>
          ) : expanded ? (
            <button className="text-sm hover:cursor-pointer text-[#4563d1] hover:underline" onClick={() => setExpanded(false)}>
              Згорнути
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-6 text-gray-600">
          <button onClick={() => sendReaction(true)} className={`flex items-center hover:cursor-pointer gap-2 hover:text-[#4563d1] ${myReaction === 'like' ? 'text-[#4563d1]' : ''}`}>
            <ThumbsUp className="h-5 w-5" />
            <span className="text-sm">{likeCount}</span>
          </button>
          <button onClick={() => sendReaction(false)} className={`flex items-center hover:cursor-pointer gap-2 hover:text-[#4563d1] ${myReaction === 'dislike' ? 'text-[#4563d1]' : ''}`}>
            <ThumbsDown className="h-5 w-5" />
            <span className="text-sm">{dislikeCount}</span>
          </button>
        </div>
      </div>
    </div>
  )
}


