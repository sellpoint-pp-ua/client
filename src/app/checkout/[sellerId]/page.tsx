'use client'

import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import Image from 'next/image'
import { Check, CreditCard, ShieldCheck, Truck, Edit3, Package } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useCartDrawer } from '@/components/cart/CartDrawerProvider'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

export default function CheckoutPage() {
  const routeParams = useParams<{ sellerId: string }>()
  const sellerId = routeParams?.sellerId
  const searchParams = useSearchParams()
  const { items } = useCartDrawer()
  const [sellerName, setSellerName] = useState<string>('')
  const [singleItem, setSingleItem] = useState<{
    id: string
    productId: string
    pcs: number
    product?: { name?: string; hasDiscount?: boolean; finalPrice?: number; discountPrice?: number; price?: number }
    imageUrl?: string | null
  } | null>(null)

  // Derive seller-specific items and totals from cart context
  const { sellerItems, orderSubtotal } = useMemo(() => {
    const group = items.filter((it) => (it.product?.sellerId || 'seller') === sellerId)
    const subtotal = Math.round(
      group.reduce((sum, ci) => {
        const p = ci.product
        const price = (p?.hasDiscount ? p?.finalPrice ?? p?.discountPrice ?? p?.price : p?.finalPrice ?? p?.price) || 0
        return sum + price * (ci.pcs || 0)
      }, 0)
    )
    return { sellerItems: group, orderSubtotal: subtotal }
  }, [items, sellerId])

  // Detect "Buy Now" mode via query params and fetch that product (without relying on cart)
  useEffect(() => {
    const pid = searchParams?.get('productId') || ''
    const pcs = Math.max(1, parseInt(searchParams?.get('pcs') || '1', 10) || 1)
    if (!pid) {
      setSingleItem(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch(`/api/products/${pid}`),
          fetch(`/api/products/media/${pid}`),
        ])
        let product: any = undefined
        let imageUrl: string | null = null
        if (pRes.ok) product = await pRes.json()
        if (mRes.ok) {
          const media = await mRes.json()
          const first = (Array.isArray(media) ? media : []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0]
          imageUrl = first?.url || first?.secondaryUrl || null
        }
        if (!cancelled) setSingleItem({ id: `single-${pid}`, productId: pid, pcs, product, imageUrl })
      } catch {
        if (!cancelled) setSingleItem(null)
      }
    })()
    return () => { cancelled = true }
  }, [searchParams])

  // Fetch seller display name
  useEffect(() => {
    let cancelled = false
    const sid = typeof sellerId === 'string' ? sellerId : ''
    if (!sid) return
    ;(async () => {
      try {
        const r = await fetch(`https://api.sellpoint.pp.ua/api/Store/GetStoreById?storeId=${encodeURIComponent(sid)}`)
        if (!r.ok) return
        const data = await r.json()
        if (!cancelled) setSellerName(typeof data?.name === 'string' ? data.name : sid)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [sellerId])

  // Fallback user display name from localStorage if available
  const [displayName, setDisplayName] = useState<string>('Користувач')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  useEffect(() => {
    try {
      const name = typeof window !== 'undefined' ? localStorage.getItem('user_display_name') : null
      if (name && name.trim()) setDisplayName(name)
    } catch {}
  }, [])

  // UI state copied/adapted from provided template
  const [delivery, setDelivery] = useState<'market' | 'nova' | null>(null)
  const [expandedMarket, setExpandedMarket] = useState<boolean>(false)
  const [expandedNova, setExpandedNova] = useState<boolean>(false)
  const [marketConfirmed, setMarketConfirmed] = useState<boolean>(false)
  const [novaConfirmed, setNovaConfirmed] = useState<boolean>(false)
  const [marketCity, setMarketCity] = useState<string>('Київ (Київська обл.)')
  const [marketBranch, setMarketBranch] = useState<string>('Івасюка просп., 49')
  const [novaCity, setNovaCity] = useState<string>('Київ (Київська обл.)')
  const [novaBranch, setNovaBranch] = useState<string>('Івасюка просп., 49')

  const [payment, setPayment] = useState<'card' | 'cod' | null>(null)
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false)

  const StepBadge = ({ index, completed }: { index: number; completed: boolean }) => (
    <div className={`h-6 w-6 rounded-full ring-2 flex items-center justify-center text-[12px] ${completed ? 'bg-green-500 ring-green-500 text-white' : 'bg-white ring-gray-300 text-gray-700'}`}>
      {completed ? <Check className="h-3.5 w-3.5" /> : index}
    </div>
  )

  const resetSelections = () => {
    setDelivery(null)
    setExpandedMarket(false)
    setExpandedNova(false)
    setMarketConfirmed(false)
    setNovaConfirmed(false)
    setPayment(null)
    setPaymentConfirmed(false)
  }

  const displayItems = (searchParams?.get('productId') ? (singleItem ? [singleItem] : []) : sellerItems)
  const itemCount = displayItems.reduce((s, i) => s + (i.pcs || 0), 0)
  const displaySubtotal = Math.round(
    displayItems.reduce((sum, ci: any) => {
      const p = ci.product
      const price = (p?.hasDiscount ? p?.finalPrice ?? p?.discountPrice ?? p?.price : p?.finalPrice ?? p?.price) || 0
      return sum + price * (ci.pcs || 0)
    }, 0)
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-4">Оформлення замовлення</h1>

          {displayItems.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <p className="text-gray-700">У цього продавця немає товарів у кошику.</p>
              <div className="mt-3">
                <Link href="/" className="inline-flex rounded-lg bg-[#4563d1] px-4 py-2 text-sm text-white hover:bg-[#364ea8]">До каталогу</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                {/* Contact */}
                <section className="rounded-xl bg-white shadow-sm">
                  <header className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
                    <StepBadge index={1} completed={true} />
                    <h2 className="font-semibold ml-1.5">Контактні дані</h2>
                  </header>
                  <div className="p-4 text-sm text-gray-800">
                    <p className="font-medium">{displayName}</p>
                    {phoneNumber ? <p className="mt-1">{phoneNumber}</p> : null}
                    <label className="mt-3 inline-flex items-center gap-2 text-gray-700">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#4563d1] focus:ring-[#4563d1]" />
                      <span>Інший отримувач замовлення</span>
                    </label>
                  </div>
                </section>

                {/* Delivery */}
                <section className="rounded-xl bg-white shadow-sm">
                  <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StepBadge index={2} completed={(delivery === 'market' && marketConfirmed) || (delivery === 'nova' && novaConfirmed) || false} />
                      <h2 className="font-semibold ml-1.5">Доставка</h2>
                    </div>
                    {((delivery === 'market' && marketConfirmed) || (delivery === 'nova' && novaConfirmed)) && (
                      <button className="text-xs text-[#4563d1] inline-flex items-center gap-1" onClick={() => {
                        if (delivery === 'market') { setMarketConfirmed(false); setExpandedMarket(true) } else { setNovaConfirmed(false); setExpandedNova(true) }
                      }}>
                        <Edit3 className="h-3.5 w-3.5" /> Редагувати
                      </button>
                    )}
                  </header>
                  <div className="p-2">
                    {/* Option: Market */}
                    <div className={`rounded-lg border ${delivery === 'market' ? 'border-[#4563d1]' : 'border-transparent'} bg-white transition-all`}>
                      <label className="w-full px-3 py-3 flex items-start gap-3">
                        <input type="radio" name="delivery" checked={delivery === 'market'} onChange={() => { setDelivery('market'); setExpandedMarket(true); setExpandedNova(false) }} className="h-4 w-4 text-[#4563d1] mt-0.5" />
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-[#4563d1]" />
                          <p className="text-sm text-gray-900">Магазини Rozetka — <span className="text-gray-700">49 ₴</span></p>
                        </div>
                      </label>
                      {expandedMarket && delivery === 'market' && !marketConfirmed && (
                        <div className="px-3 pb-3">
                          <div className="h-px bg-gray-200 my-2" />
                          <label className="block text-sm text-gray-700 mb-1">Населений пункт <span className="text-red-500">*</span></label>
                          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={marketCity} onChange={(e) => setMarketCity(e.target.value)}>
                            <option>Київ (Київська обл.)</option>
                            <option>Львів (Львівська обл.)</option>
                            <option>Рівне (Рівненська обл.)</option>
                          </select>
                          <label className="block text-sm text-gray-700 mt-3 mb-1">Відділення <span className="text-red-500">*</span></label>
                          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={marketBranch} onChange={(e) => setMarketBranch(e.target.value)}>
                            <option>Івасюка просп., 49</option>
                            <option>Незалежності, 2</option>
                            <option>Соборна, 10</option>
                          </select>
                          <button onClick={() => { setMarketConfirmed(true); setExpandedMarket(false) }} className="mt-3 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                        </div>
                      )}
                      {marketConfirmed && delivery === 'market' && (
                        <div className="px-3 pb-3 text-sm text-gray-700">
                          <p className="text-[#4563d1] mb-1">У відділення</p>
                          <p>{marketCity}, {marketBranch}</p>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-gray-200 my-3" />

                    {/* Option: Nova Poshta */}
                    <div className={`rounded-lg border ${delivery === 'nova' ? 'border-[#4563d1]' : 'border-transparent'} bg-white transition-all`}>
                      <label className="w-full px-3 py-3 flex items-start gap-3">
                        <input type="radio" name="delivery" checked={delivery === 'nova'} onChange={() => { setDelivery('nova'); setExpandedNova(true); setExpandedMarket(false) }} className="h-4 w-4 text-[#4563d1] mt-0.5" />
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-[#DA292B]" />
                          <p className="text-sm text-gray-900">Нова Пошта — <span className="text-gray-700">від 60 ₴</span></p>
                        </div>
                      </label>
                      {expandedNova && delivery === 'nova' && !novaConfirmed && (
                        <div className="px-3 pb-3">
                          <div className="h-px bg-gray-200 my-2" />
                          <label className="block text-sm text-gray-700 mb-1">Населений пункт <span className="text-red-500">*</span></label>
                          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={novaCity} onChange={(e) => setNovaCity(e.target.value)}>
                            <option>Київ (Київська обл.)</option>
                            <option>Львів (Львівська обл.)</option>
                            <option>Рівне (Рівненська обл.)</option>
                          </select>
                          <label className="block text-sm text-gray-700 mt-3 mb-1">Відділення <span className="text-red-500">*</span></label>
                          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={novaBranch} onChange={(e) => setNovaBranch(e.target.value)}>
                            <option>Івасюка просп., 49</option>
                            <option>Незалежності, 2</option>
                            <option>Соборна, 10</option>
                          </select>
                          <button onClick={() => { setNovaConfirmed(true); setExpandedNova(false) }} className="mt-3 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                        </div>
                      )}
                      {novaConfirmed && delivery === 'nova' && (
                        <div className="px-3 pb-3 text-sm text-gray-700">
                          <p className="text-[#4563d1] mb-1">У відділення</p>
                          <p>{novaCity}, {novaBranch}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Payment */}
                <section className="rounded-xl bg-white shadow-sm">
                  <header className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
                    <StepBadge index={3} completed={paymentConfirmed} />
                    <h2 className="font-semibold ml-1.5">Оплата</h2>
                  </header>
                  <div className="p-4 space-y-4">
                    <label className={`w-full rounded-lg px-3 py-3 flex items-start gap-3 ${payment === 'card' ? 'bg-[#4563d1]/10 border border-[#4563d1]' : 'hover:bg-gray-50 border border-transparent'}`}>
                      <input type="radio" name="payment" checked={payment === 'card'} onChange={() => setPayment('card')} className="h-4 w-4 text-[#4563d1] mt-0.5" />
                      <div className="text-sm text-gray-800">
                        <p className="font-medium flex items-center gap-2">Безпечна оплата карткою <span className="inline-flex items-center gap-1 text-gray-500"><ShieldCheck className="h-4 w-4" /> промОплата</span></p>
                        <ul className="mt-1 text-gray-600 list-disc list-inside space-y-0.5">
                          <li>Без передплат</li>
                          <li>Гарантія безпеки</li>
                          <li>Повернемо гроші при відмові від посилки</li>
                        </ul>
                      </div>
                    </label>
                    {payment === 'card' && !paymentConfirmed && (
                      <div className="px-3">
                        <div className="h-px bg-gray-200 my-2" />
                        <div className="space-y-3 text-sm text-gray-800">
                          <label className="flex items-center gap-2 "><span className="inline-flex items-center gap-2"><input type="radio" name="card_way" className="h-4 w-4 text-[#4563d1]" defaultChecked /> <span>Google Pay</span></span></label>
                          <label className="flex items-center gap-2 "><span className="inline-flex items-center gap-2"><input type="radio" name="card_way" className="h-4 w-4 text-[#4563d1]" /> <span>Apple Pay</span></span></label>
                          <label className="flex items-center gap-2"><input type="radio" name="card_way" className="h-4 w-4 text-[#4563d1]" /> Оплатити іншою карткою</label>
                          <button onClick={() => { setPaymentConfirmed(true) }} className="mt-1 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                        </div>
                      </div>
                    )}
                    <label className={`w-full rounded-lg px-3 py-3 flex items-start gap-3 ${payment === 'cod' ? 'bg-[#4563d1]/10 border border-[#4563d1]' : 'hover:bg-gray-50 border border-transparent'}`}>
                      <input type="radio" name="payment" checked={payment === 'cod'} onChange={() => setPayment('cod')} className="h-4 w-4 text-[#4563d1] mt-0.5" />
                      <div className="text-sm text-gray-800">
                        <p className="font-medium">Післяплата</p>
                      </div>
                    </label>
                    {payment === 'cod' && !paymentConfirmed && (
                      <div className="px-3">
                        <div className="h-px bg-gray-200 my-2" />
                        <p className="text-sm text-gray-600">Оплата при отриманні у відділенні перевізника.</p>
                        <button onClick={() => { setPaymentConfirmed(true) }} className="mt-2 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                      </div>
                    )}
                    {paymentConfirmed && (
                      <p className="text-sm text-gray-700 px-3">Обрано спосіб оплати: {payment === 'card' ? 'Оплата карткою' : 'Післяплата'}</p>
                    )}
                  </div>
                </section>

                {(delivery !== null || payment !== null || marketConfirmed || novaConfirmed || paymentConfirmed) && (
                  <div className="mt-3">
                    <button onClick={() => resetSelections()} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-[#3046b4] hover:bg-[#4563d1]/5">Скинути вибрані способи</button>
                  </div>
                )}
              </div>

              {/* Right column */}
              <aside className="lg:col-span-4">
                <div className="rounded-xl bg-white shadow-sm p-3">
                  <h3 className="px-2 py-1 text-sm font-semibold text-gray-700">Замовлення <span className="text-gray-500">{itemCount} товар(и)</span></h3>
                  <div className="mt-2 space-y-3">
                    {displayItems.map((it: any) => {
                      const p = it.product
                      const finalPrice = (p?.hasDiscount ? p?.finalPrice ?? p?.discountPrice ?? p?.price : p?.finalPrice ?? p?.price) || 0
                      return (
                        <div key={it.id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {it.imageUrl ? <Image src={it.imageUrl} alt={p?.name || ''} fill className="object-cover" /> : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/product/${it.productId}`} className="line-clamp-2 text-sm text-gray-900 hover:underline">{p?.name || 'Товар'}</Link>
                            <p className="mt-1 text-xs text-gray-600">{sellerName || (typeof sellerId === 'string' ? sellerId : '')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{Math.round(finalPrice)} ₴/шт.</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 px-2 text-sm text-gray-900">
                    <div className="flex items-center justify-between py-1">
                      <span>Вартість замовлення:</span>
                      <span className="font-bold text-lg">{displaySubtotal} ₴</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>До оплати без доставки:</span>
                      <span className="font-bold text-lg">{displaySubtotal} ₴</span>
                    </div>
                  </div>
                  <button className="mt-4 w-full hover:cursor-pointer rounded-lg bg-[#4563d1] px-4 py-3 text-white text-sm font-semibold hover:bg-[#364ea8]">Оформити замовлення</button>
                  <p className="mt-3 px-2 text-[11px] text-gray-500">Натискаючи кнопку «Оформити замовлення», я погоджуюсь з політикою конфіденційності.</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}


