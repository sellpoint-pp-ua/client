'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Image from 'next/image'
import { X, Trash2, Minus, Plus, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type RawCartItem = { id: string; userId: string; pcs: number; productId: string; createdAt: string }

type ProductInfo = {
  id: string
  name: string
  finalPrice?: number
  price?: number
  hasDiscount?: boolean
  discountPrice?: number
  quantityStatus?: number | string
  quantity?: number
  sellerId?: string
}

type MediaItem = {
  files?: {
    sourceUrl?: string
    compressedUrl?: string
    sourceFileName?: string
    compressedFileName?: string
  }
  type?: number | string
  order?: number
}

type StoreInfo = {
  id?: string
  name?: string
  avatar?: { sourceUrl?: string; compressedUrl?: string; sourceFileName?: string; compressedFileName?: string }
}

export type EnrichedCartItem = RawCartItem & {
  product?: ProductInfo
  imageUrl?: string | null
}

type CartDrawerContextValue = {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  items: EnrichedCartItem[]
  cartCount: number
  addToCart: (productId: string, pcs?: number) => Promise<void>
  changePcs: (cartItemId: string, pcs: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  isInCart: (productId: string) => boolean
  clearCart: () => Promise<void>
}

const CartDrawerContext = createContext<CartDrawerContextValue | undefined>(undefined)

export function useCartDrawer(): CartDrawerContextValue {
  const ctx = useContext(CartDrawerContext)
  if (!ctx) throw new Error('useCartDrawer must be used within CartDrawerProvider')
  return ctx
}

type Props = {
  children: React.ReactNode
}

export default function CartDrawerProvider({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<EnrichedCartItem[]>([])
  const [showToast, setShowToast] = useState<null | { name: string; imageUrl?: string | null }>(null)
  const [limitReached, setLimitReached] = useState<Record<string, boolean>>({})
  const [sellerInfos, setSellerInfos] = useState<Record<string, StoreInfo>>({})
  const router = useRouter()

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const body = document.body
    const prevPosition = body.style.position
    const prevTop = body.style.top
    const prevLeft = body.style.left
    const prevRight = body.style.right
    const prevWidth = body.style.width
    const scrollY = window.scrollY

    if (isOpen) {
      body.classList.add('lock-scroll')
      body.style.top = `-${scrollY}px`
    } else {
      body.classList.remove('lock-scroll')
      body.style.position = prevPosition
      body.style.top = ''
      body.style.left = prevLeft
      body.style.right = prevRight
      body.style.width = prevWidth
      window.scrollTo(0, scrollY)
    }

    return () => {
      body.classList.remove('lock-scroll')
      body.style.position = prevPosition
      body.style.top = ''
      body.style.left = prevLeft
      body.style.right = prevRight
      body.style.width = prevWidth
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeCart])

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const fetchCart = useCallback(async () => {
    if (!token) {
      setItems([])
      return
    }
    try {
      const res = await fetch('https://api.sellpoint.pp.ua/Cart/GetByMyId', {
        headers: { Authorization: `Bearer ${token}`, accept: 'text/plain' },
        cache: 'no-store',
      })
      if (!res.ok) {
        setItems([])
        return
      }
      const data: RawCartItem[] = await res.json()

      const enriched: EnrichedCartItem[] = await Promise.all(
        (data || []).map(async (it) => {
          try {
            const [pRes, mRes] = await Promise.all([
              fetch(`https://api.sellpoint.pp.ua/api/Product/get-by-id/${it.productId}`),
              fetch(`https://api.sellpoint.pp.ua/api/ProductMedia/by-product-id/${it.productId}`),
            ])
            const product: ProductInfo | null = pRes.ok ? await pRes.json() : null
            let imageUrl: string | null = null
            if (mRes.ok) {
              const media: MediaItem[] = await mRes.json()
              const first = (Array.isArray(media) ? media : []).sort(
                (a, b) => (a.order || 0) - (b.order || 0)
              )[0]
              const webp = first?.files?.compressedUrl || first?.files?.sourceUrl || null
              imageUrl = webp || null
            }
            return { ...it, product: product || undefined, imageUrl }
          } catch {
            return { ...it }
          }
        })
      )
      setItems(enriched)
    } catch {
      setItems([])
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      setItems([])
      return
    }
    fetchCart()
  }, [token, fetchCart])

  useEffect(() => {
    const uniqueSellerIds = Array.from(
      new Set(items.map((it) => it.product?.sellerId).filter((s): s is string => Boolean(s)))
    )
    const toFetch = uniqueSellerIds.filter((sid) => !sellerInfos[sid])
    if (toFetch.length === 0) return
    let cancelled = false
    ;(async () => {
      try {
        const results = await Promise.all(
          toFetch.map(async (sid) => {
            try {
              const r = await fetch(`https://api.sellpoint.pp.ua/api/Store/GetStoreById?storeId=${encodeURIComponent(sid)}`)
              if (!r.ok) return [sid, undefined] as const
              const data: StoreInfo = await r.json()
              return [sid, data] as const
            } catch {
              return [sid, undefined] as const
            }
          })
        )
        if (cancelled) return
        setSellerInfos((prev) => {
          const next = { ...prev }
          for (const [sid, info] of results) {
            if (info) next[sid] = info
          }
          return next
        })
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [items, sellerInfos])

  const addToCart = useCallback(
    async (productId: string, pcs: number = 1) => {
      if (!token) {
        router.push('/auth/login')
        return
      }
      try {
        const form = new FormData()
        form.append('ProductId', productId)
        form.append('Pcs', String(pcs))
        await fetch('https://api.sellpoint.pp.ua/Cart/AddToCart', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        })
        await fetchCart()
        const added = items.find((i) => i.productId === productId)
        setShowToast({ name: added?.product?.name || 'Товар', imageUrl: added?.imageUrl })
        setTimeout(() => setShowToast(null), 2500)
      } catch {
        /* noop */
      }
    },
    [token, router, fetchCart, items]
  )

  const changePcs = useCallback(
    async (cartItemId: string, pcs: number) => {
      if (!token) {
        router.push('/auth/login')
        return
      }
      const item = items.find((i) => i.id === cartItemId)
      const maxQty =
        typeof item?.product?.quantity === 'number' ? (item!.product!.quantity as number) : undefined
      if (typeof maxQty === 'number' && pcs > maxQty) {
        setLimitReached((prev) => ({ ...prev, [cartItemId]: true }))
        setTimeout(() => setLimitReached((prev) => ({ ...prev, [cartItemId]: false })), 2000)
        return
      }
      try {
        await fetch(
          `https://api.sellpoint.pp.ua/Cart/ChangeCartPcs?id=${encodeURIComponent(
            cartItemId
          )}&pcs=${encodeURIComponent(String(pcs))}`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        await fetchCart()
      } catch {
        /* noop */
      }
    },
    [token, router, fetchCart, items]
  )

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      if (!token) {
        router.push('/auth/login')
        return
      }
      try {
        await fetch(
          `https://api.sellpoint.pp.ua/Cart/DeleteFromCart?id=${encodeURIComponent(cartItemId)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        await fetchCart()
      } catch {
        /* noop */
      }
    },
    [token, router, fetchCart]
  )

  const cartCount = items.length

  const clearCart = useCallback(async () => {
    if (!token) return
    try {
      await fetch('https://api.sellpoint.pp.ua/Cart/ClearCartList', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
      })
    } catch {
      /* noop */
    } finally {
      setItems([])
    }
  }, [token])

  const groupedBySeller = useMemo(() => {
    const map: Record<string, EnrichedCartItem[]> = {}
    for (const it of items) {
      const sid = it.product?.sellerId || 'seller'
      if (!map[sid]) map[sid] = []
      map[sid].push(it)
    }
    return Object.entries(map).map(([sellerId, group]) => {
      const groupTotal = Math.round(
        group.reduce((sum, ci) => {
          const pp = ci.product
          const price =
            (pp?.hasDiscount
              ? pp?.finalPrice ?? pp?.discountPrice ?? pp?.price
              : pp?.finalPrice ?? pp?.price) || 0
          return sum + price * (ci.pcs || 0)
        }, 0)
      )
      return { sellerId, group, groupTotal }
    })
  }, [items])

  const isInCart = useCallback((productId: string) => items.some(i => i.productId === productId), [items])

  const ctx = useMemo(
    () => ({
      isOpen,
      openCart,
      closeCart,
      items,
      cartCount,
      addToCart,
      changePcs,
      removeFromCart,
      isInCart,
      clearCart,
    }),
    [isOpen, openCart, closeCart, items, cartCount, addToCart, changePcs, removeFromCart, isInCart, clearCart]
  )

  return (
    <CartDrawerContext.Provider value={ctx}>
      {children}

      {/* Overlay */}
      <div
        aria-hidden
        onClick={closeCart}
        className={`fixed inset-0 z-[90] bg-gray-700/30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Toast - added to cart */}
      <div
        className={`fixed right-4 top-[84px] z-[98] transition-all duration-300 ${
          showToast ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-2'
        }`}
      >
        {showToast && (
          <div className="flex items-center gap-3 rounded-xl bg-[#0b0b1a] text-white px-3 py-2 shadow-lg">
            {showToast.imageUrl ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-md bg-white">
                <Image src={showToast.imageUrl} alt={showToast.name} fill className="object-cover" />
              </div>
            ) : null}
            <div className="text-sm">Товар додано у кошик</div>
            <button
              onClick={() => openCart()}
              className="ml-2 text-sm font-semibold hover:cursor-pointer text-yellow-300 hover:underline"
            >
              До кошика
            </button>
          </div>
        )}
      </div>

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-[95] h-full w-[400px] max-w-[92vw] bg-white shadow-2xl rounded-l-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center  p-3">
          <h2 className="text-[18px] font-bold text-gray-900">Кошик</h2>
          <button
            aria-label="Закрити"
            onClick={closeCart}
            className="absolute right-2 top-1/2 hover:cursor-pointer -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 font-bold" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex h-[calc(100%-52px)] flex-col items-center bg-gray-100 justify-center px-6 text-center text-gray-700">
            <div className="mb-0">
              <img src="/cart-empty.svg" alt="Порожній кошик" className="h-48 w-auto select-none" />
            </div>
            <div className="text-[18px] font-bold text-gray-900">Кошик порожній</div>
            <div className="mt-2 text-[14px] text-gray-600 leading-snug">
              <div>Подивись наш каталог,</div>
              <div>обов'язково щось знайдеш!</div>
            </div>
            <button
              onClick={() => {
                closeCart()
                router.push('/')
              }}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#4563d1] hover:cursor-pointer px-10 py-2 text-white hover:bg-[#364ea8] transition-colors"
            >
              За покупками
            </button>
          </div>
        ) : (
          <div className="flex h:[calc(100%-52px)] h-[calc(100%-52px)] flex-col bg-gray-100">
            {/* Items list grouped by seller */}
            <div className="mt-2 flex-1 overflow-y-auto px-3 pb-3">
              {groupedBySeller.map(({ sellerId, group, groupTotal }) => (
                <div key={sellerId} className="mb-6">
                  {/* Seller header */}
                  <div className="mx-0 mb-2 rounded-xl bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                        {sellerInfos[sellerId]?.avatar?.sourceUrl ? (
                          <Image src={sellerInfos[sellerId]!.avatar!.sourceUrl!} alt={sellerInfos[sellerId]?.name || 'store'} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{sellerInfos[sellerId]?.name || sellerId}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-[#4563d1]" />
                          <span>100% позитивних відгуків</span>
                        </div>
                      </div>
                      <button className="ml-auto text-xs text-[#4563d1] hover:underline">&nbsp;</button>
                    </div>
                  </div>

                  {group.map((it) => {
                    const p = it.product
                    const final =
                      (p?.hasDiscount
                        ? p?.finalPrice ?? p?.discountPrice ?? p?.price
                        : p?.finalPrice ?? p?.price) || 0

                    let badge = { text: 'В наявності', classes: 'bg-green-100 text-green-800' }
                    const normalized =
                      typeof p?.quantityStatus === 'string'
                        ? String(p?.quantityStatus).toLowerCase()
                        : ''

                    if (typeof p?.quantityStatus === 'number') {
                      if (p?.quantityStatus === 3)
                        badge = { text: 'Немає в наявності', classes: 'bg-red-100 text-red-800' }
                      else if (p?.quantityStatus === 2)
                        badge = { text: 'Закінчується', classes: 'bg-orange-100 text-orange-800' }
                    } else if (
                      normalized.includes('немає') ||
                      normalized.includes('відсут') ||
                      normalized.includes('out')
                    ) {
                      badge = { text: 'Немає в наявності', classes: 'bg-red-100 text-red-800' }
                    } else if (
                      normalized.includes('зік') ||
                      normalized.includes('закінч') ||
                      normalized.includes('low')
                    ) {
                      badge = { text: 'Закінчується', classes: 'bg-orange-100 text-orange-800' }
                    }

                    const maxQty =
                      typeof p?.quantity === 'number' ? (p!.quantity as number) : undefined
                    const cannotIncrease =
                      badge.text === 'Немає в наявності' ||
                      (typeof maxQty === 'number' && it.pcs >= maxQty)
                    const canDecrease = it.pcs > 1

                    return (
                      <div key={it.id} className="mb-2">
                        <div className="rounded-xl bg-white p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                              {it.imageUrl ? (
                                <Image
                                  src={it.imageUrl}
                                  alt={p?.name || ''}
                                  fill
                                  className="object-contain"
                                />
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2">
                                <Link href={`/product/${it.productId}`} onClick={() => closeCart()} className="line-clamp-2 text-sm font-medium text-gray-900 hover:underline">
                                  {p?.name || 'Товар'}
                                </Link>
                                <button
                                  onClick={() => removeFromCart(it.id)}
                                  className="hover:cursor-pointer ml-auto rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>



                              <div className="mt-3 flex items-center justify-between">
                              <div className="mt-0">
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-[12px] ${badge.classes}`}
                                >
                                  {badge.text}
                                </span>
                              </div>

                              {limitReached[it.id] ? (
                                <div className="mt-0 text-[12px] text-red-600">
                                  Немає в наявності
                                </div>
                              ) : null}
                                <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-2 py-1">
                                  <button
                                    disabled={!canDecrease}
                                    onClick={() => changePcs(it.id, Math.max(1, it.pcs - 1))}
                                    className={`rounded-full hover:cursor-pointer p-1 ${
                                      canDecrease ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
                                    }`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="min-w-[24px] text-center text-sm">{it.pcs}</span>
                                  <button
                                    disabled={cannotIncrease}
                                    onClick={() => changePcs(it.id, it.pcs + 1)}
                                    className={`rounded-full hover:cursor-pointer p-1 ${
                                      cannotIncrease
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="text-right text-[15px] font-semibold text-gray-900">
                                  {final ? `${Math.round(final * it.pcs)} ₴` : '—'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Group-level checkout button summing all items for this seller */}
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        closeCart()
                        router.push(`/checkout/${encodeURIComponent(sellerId)}`)
                      }}
                      className="w-full rounded-xl bg-[#4563d1] text-sm hover:cursor-pointer py-2 text-white hover:bg-[#364ea8]"
                    >
                      {`Замовити у продавця • ${groupTotal} ₴`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </CartDrawerContext.Provider>
  )
}
