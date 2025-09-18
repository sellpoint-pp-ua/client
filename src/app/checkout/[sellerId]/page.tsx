'use client'

import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import Image from 'next/image'
import { Check, CreditCard, ShieldCheck, Truck, Edit3, Package, Store } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useCartDrawer } from '@/components/cart/CartDrawerProvider'
import Link from 'next/link'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
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

  const [displayName, setDisplayName] = useState<string>('Користувач')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  useEffect(() => {
    let cancelled = false
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const fallback = typeof window !== 'undefined' ? (localStorage.getItem('user_display_name') || '') : ''
      if (fallback && fallback.trim()) setDisplayName(fallback)
      if (!token) return
      ;(async () => {
        try {
          let res = await fetch('https://api.sellpoint.pp.ua/api/User/GetUserByMyId', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }).catch(() => null as any)
          if (!res || !res.ok) {
            res = await fetch('/api/users/current', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
          }
          if (res && res.ok) {
            const u = await res.json()
            if (cancelled) return
            const full = (typeof u?.fullName === 'string' && u.fullName.trim()) ? u.fullName : (typeof u?.username === 'string' ? u.username : fallback || 'Користувач')
            setDisplayName(full)
            if (typeof u?.phoneNumber === 'string') setPhoneNumber(u.phoneNumber)
          }
        } catch {}
      })()
    } catch {}
    return () => { cancelled = true }
  }, [])

  const DELIVERY = { NOVA: 1 << 0, ROZETKA: 1 << 1, SELF: 1 << 2 }
  const [availableDeliveryMask, setAvailableDeliveryMask] = useState<number>(0)
  const [delivery, setDelivery] = useState<'market' | 'nova' | 'self' | null>(null)
  const [expandedMarket, setExpandedMarket] = useState<boolean>(false)
  const [expandedNova, setExpandedNova] = useState<boolean>(false)
  const [expandedSelf, setExpandedSelf] = useState<boolean>(false)
  const [marketConfirmed, setMarketConfirmed] = useState<boolean>(false)
  const [novaConfirmed, setNovaConfirmed] = useState<boolean>(false)
  const [selfConfirmed, setSelfConfirmed] = useState<boolean>(false)
  const [marketCity, setMarketCity] = useState<string>('Київ (Київська обл.)')
  const [marketBranch, setMarketBranch] = useState<string>('Івасюка просп., 49')
  const [novaCity, setNovaCity] = useState<string>('Київ (Київська обл.)')
  const [novaBranch, setNovaBranch] = useState<string>('Івасюка просп., 49')
  const [selfCity, setSelfCity] = useState<string>('Київ (Київська обл.)')
  const [selfAddress, setSelfAddress] = useState<string>('Центральний офіс магазину')

  const PAY = { AFTER: 1 << 0, CARD: 1 << 1, MONO: 1 << 2, PRIVAT: 1 << 3, PUMB: 1 << 4 }
  const [availablePaymentMask, setAvailablePaymentMask] = useState<number>(0)
  const [payment, setPayment] = useState<'card' | 'cod' | 'mono' | 'privat' | 'pumb' | null>(null)
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
    setExpandedSelf(false)
    setMarketConfirmed(false)
    setNovaConfirmed(false)
    setSelfConfirmed(false)
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

  useEffect(() => {
    if (!displayItems || displayItems.length === 0) { setAvailablePaymentMask(0); return }
    let mask = (PAY.AFTER | PAY.CARD | PAY.MONO | PAY.PRIVAT | PAY.PUMB)
    for (const it of displayItems) {
      const m = Number((it?.product as any)?.paymentOptions ?? (PAY.AFTER | PAY.CARD))
      mask &= m
    }
    setAvailablePaymentMask(mask)
    const nowCard = Boolean(mask & PAY.CARD)
    const nowAfter = Boolean(mask & PAY.AFTER)
    const nowMono = Boolean(mask & PAY.MONO)
    const nowPrivat = Boolean(mask & PAY.PRIVAT)
    const nowPumb = Boolean(mask & PAY.PUMB)
    if ((payment === 'card' && !nowCard) || (payment === 'cod' && !nowAfter) || (payment === 'mono' && !nowMono) || (payment === 'privat' && !nowPrivat) || (payment === 'pumb' && !nowPumb)) {
      setPayment(null); setPaymentConfirmed(false)
    }
  }, [displayItems])

  const hasCardPay = Boolean(availablePaymentMask & PAY.CARD)
  const hasAfterPay = Boolean(availablePaymentMask & PAY.AFTER)
  const hasMono = Boolean(availablePaymentMask & PAY.MONO)
  const hasPrivat = Boolean(availablePaymentMask & PAY.PRIVAT)
  const hasPumb = Boolean(availablePaymentMask & PAY.PUMB)

  useEffect(() => {
    if (!displayItems || displayItems.length === 0) { setAvailableDeliveryMask(0); return }
    let mask = (DELIVERY.NOVA | DELIVERY.ROZETKA | DELIVERY.SELF)
    for (const it of displayItems) {
      const m = Number((it?.product as any)?.deliveryType ?? (DELIVERY.NOVA | DELIVERY.ROZETKA | DELIVERY.SELF))
      mask &= m
    }
    setAvailableDeliveryMask(mask)
    const nowHasMarket = Boolean(mask & DELIVERY.ROZETKA)
    const nowHasNova = Boolean(mask & DELIVERY.NOVA)
    const nowHasSelf = Boolean(mask & DELIVERY.SELF)
    if ((delivery === 'market' && !nowHasMarket) || (delivery === 'nova' && !nowHasNova) || (delivery === 'self' && !nowHasSelf)) {
      resetSelections()
    }
  }, [displayItems])

  const hasNova = Boolean(availableDeliveryMask & DELIVERY.NOVA)
  const hasMarket = Boolean(availableDeliveryMask & DELIVERY.ROZETKA)
  const hasSelf = Boolean(availableDeliveryMask & DELIVERY.SELF)

  const UA_CITIES = [
    'Київ','Львів','Рівне','Харків','Одеса','Дніпро','Запоріжжя','Вінниця','Тернопіль','Івано-Франківськ','Чернівці','Полтава','Черкаси','Миколаїв','Чернігів','Житомир','Ужгород','Луцьк','Краматорськ'
  ]
  const NOVA_BRANCHES: Record<string, string[]> = {
    'Київ': [
      'Відділення №1, вул. Хрещатик, 1',
      'Відділення №5, просп. Перемоги, 20',
      'Поштомат ТРЦ “Гулівер”',
      'Відділення №12, вул. Саксаганського, 45',
      'Поштомат БЦ “Парус”'
    ],
    'Львів': [
      'Відділення №2, вул. Зелена, 15',
      'Поштомат ТРЦ “Форум Львів”',
      'Відділення №5, просп. Червоної Калини, 60',
      'Поштомат ТРЦ “Вікторія Гарденс”',
      'Відділення №9, вул. Городоцька, 124'
    ],
    'Рівне': [
      'Відділення №1, вул. Соборна, 10',
      'Поштомат ТЦ “Злата Плаза”',
      'Відділення №3, вул. Київська, 12',
      'Поштомат ТЦ “Екватор”',
      'Відділення №7, вул. Степана Бандери, 25'
    ],
    'Харків': [
      'Відділення №1, просп. Науки, 12',
      'Поштомат ТРЦ “Нікольський”',
      'Відділення №7, просп. Гагаріна, 22',
      'Відділення №12, вул. Сумська, 90',
      'Поштомат ТРЦ “Французький бульвар”'
    ],
    'Одеса': [
      'Відділення №3, вул. Дерибасівська, 5',
      'Поштомат Аеропорт “Одеса”',
      'Відділення №8, просп. Шевченка, 33',
      'Відділення №14, вул. Пушкінська, 15',
      'Поштомат ТРЦ “Рів’єра”'
    ],
  }
  const MARKET_BRANCHES: Record<string, string[]> = {
    'Київ (Київська обл.)': [
      'Rozetka, просп. Степана Бандери, 6',
      'Rozetka, вул. Антоновича, 50',
      'Rozetka, просп. Лобановського, 6А',
      'Rozetka, вул. Володимирська, 51',
      'Rozetka, вул. Дніпровська Набережна, 33'
    ],
    'Львів': [
      'Rozetka, вул. Під Дубом, 7Б (Forum Lviv)',
      'Rozetka, вул. Княгині Ольги, 106',
      'Rozetka, просп. Чорновола, 59',
      'Rozetka, вул. Стрийська, 45',
      'Rozetka, вул. Наукова, 7'
    ],
    'Харків': [
      'Rozetka, просп. Науки, 9',
      'Rozetka, вул. Полтавський Шлях, 56',
      'Rozetka, вул. Сумська, 67',
      'Rozetka, просп. Тракторобудівників, 59/56',
      'Rozetka, вул. Героїв Праці, 7'
    ],
    'Одеса': [
      'Rozetka, вул. Катерининська, 27',
      'Rozetka, просп. Шевченка, 2',
      'Rozetka, вул. Рішельєвська, 10',
      'Rozetka, вул. Академіка Філатова, 16',
      'Rozetka, вул. Генуезька, 24'
    ],
  }
  const SELF_ADDRESSES: Record<string, string[]> = {
    'Київ': [
      'Центральний склад магазину, вул. Складська, 1',
      'Самовивіз, вул. Виборзька, 79',
      'Самовивіз, вул. Електриків, 26',
      'Самовивіз, вул. Богдана Хмельницького, 16-22',
      'Самовивіз, просп. Перемоги, 5'
    ],
    'Львів': [
      'Точка самовивозу, вул. Городоцька, 100',
      'Самовивіз, вул. Зелена, 149',
      'Самовивіз, вул. Шевченка, 60',
      'Самовивіз, вул. Стрийська, 45',
      'Самовивіз, вул. Наукова, 7'
    ],
  }

  const fallbackNova = (city: string) => [
    `Відділення №1, ${city}`,
    `Відділення №2, ${city}`,
    `Відділення №3, ${city}`,
    `Поштомат №1, ${city}`,
    `Поштомат №2, ${city}`,
  ]
  const fallbackMarket = (city: string) => [
    `Rozetka, пункт видачі №1, ${city}`,
    `Rozetka, пункт видачі №2, ${city}`,
    `Rozetka, пункт видачі №3, ${city}`,
    `Rozetka, пункт видачі №4, ${city}`,
    `Rozetka, пункт видачі №5, ${city}`,
  ]
  const fallbackSelf = (city: string) => [
    `Пункт самовивозу №1, ${city}`,
    `Пункт самовивозу №2, ${city}`,
    `Пункт самовивозу №3, ${city}`,
    `Пункт самовивозу №4, ${city}`,
    `Пункт самовивозу №5, ${city}`,
  ]

  const paymentToServer = (p: typeof payment): number => {
    if (p === 'cod') return 1 
    if (p === 'card') return 2 
    if (p === 'mono') return 4 
    if (p === 'privat') return 8 
    if (p === 'pumb') return 16 
    return 0
  }

  const splitSettlementRegion = (city: string): { settlement: string; region: string } => {
    const match = city.match(/^([^()]+)\s*\(([^()]+)\)\s*$/)
    if (match) return { settlement: match[1].trim(), region: match[2].trim() }
    return { settlement: city, region: '' }
  }

  const getDeliveryTo = (): { address: string; settlement: string; region: string } | null => {
    if (delivery === 'market') {
      const { settlement, region } = splitSettlementRegion(marketCity)
      return { address: marketBranch, settlement, region }
    }
    if (delivery === 'nova') {
      const { settlement, region } = splitSettlementRegion(novaCity)
      return { address: novaBranch, settlement, region }
    }
    if (delivery === 'self') {
      const { settlement, region } = splitSettlementRegion(selfCity)
      return { address: selfAddress, settlement, region }
    }
    return null
  }

  const placeOrder = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) { alert('Потрібна авторизація'); return }
      if (!payment || !paymentConfirmed) { alert('Оберіть спосіб оплати та підтвердіть'); return }
      if (delivery === 'market' && !marketConfirmed) { alert('Підтвердьте адресу доставки (Rozetka)'); return }
      if (delivery === 'nova' && !novaConfirmed) { alert('Підтвердьте адресу доставки (Нова Пошта)'); return }
      if (delivery === 'self' && !selfConfirmed) { alert('Підтвердьте адресу самовивозу'); return }

      const deliveryTo = getDeliveryTo()
      if (!deliveryTo) { alert('Оберіть спосіб доставки'); return }

      const targetItem = displayItems[0]
      const productId = targetItem?.productId
      if (!productId) { alert('Неможливо визначити товар'); return }

      const body = {
        productId,
        deliveryPayment: paymentToServer(payment),
        deliveryTo: deliveryTo,
      }

      const res = await fetch('https://api.sellpoint.pp.ua/api/Buy/BuyProduct', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) { alert('Не вдалося оформити замовлення'); return }

      if (payment !== 'cod') {
        const listRes = await fetch('https://api.sellpoint.pp.ua/api/Buy/GetByMyId', {
          headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }, cache: 'no-store'
        })
        if (listRes.ok) {
          const arr = await listRes.json()
          const found = Array.isArray(arr) ? arr.find((b: any) => String(b?.miniProductInfo?.productId) === String(productId) && !b?.payed) : null
          const buyId = found?.id
          if (buyId) { router.push(`/pay/${buyId}`); return }
        }
        alert('Замовлення створено, але не вдалося перейти на оплату. Перевірте розділ замовлень.')
      } else {
        try {
          router.push('/pay/success')
          return
        } catch (e) {
          alert('Замовлення оформлено. Оплата при отриманні.')
        }
      }
    } catch (e) {
      alert('Сталася помилка під час оформлення')
    }
  }

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
                    {hasMarket && (
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
                          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={marketCity} onChange={(e) => { setMarketCity(e.target.value); const b = MARKET_BRANCHES[e.target.value] || ['Rozetka пункт видачі']; setMarketBranch(b[0]) }}>
                            {UA_CITIES.map(c => (<option key={c} value={c}>{c}</option>))}
                          </select>
                          <label className="block text-sm text-gray-700 mt-3 mb-1">Відділення <span className="text-red-500">*</span></label>
                          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={marketBranch} onChange={(e) => setMarketBranch(e.target.value)}>
                            {(MARKET_BRANCHES[marketCity]?.length ? MARKET_BRANCHES[marketCity] : fallbackMarket(marketCity)).map(b => (<option key={b} value={b}>{b}</option>))}
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
                    )}

                    <div className="h-px bg-gray-200 my-3" />

                    {/* Option: Nova Poshta */}
                    {hasNova && (
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
                          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={novaCity} onChange={(e) => { setNovaCity(e.target.value); const b = NOVA_BRANCHES[e.target.value] || ['Відділення №1']; setNovaBranch(b[0]) }}>
                            {UA_CITIES.map(c => (<option key={c} value={c}>{c}</option>))}
                          </select>
                          <label className="block text-sm text-gray-700 mt-3 mb-1">Відділення <span className="text-red-500">*</span></label>
                          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={novaBranch} onChange={(e) => setNovaBranch(e.target.value)}>
                            {(NOVA_BRANCHES[novaCity]?.length ? NOVA_BRANCHES[novaCity] : fallbackNova(novaCity)).map(b => (<option key={b} value={b}>{b}</option>))}
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
                    )}

                    {hasSelf && (
                      <>
                      <div className="h-px bg-gray-200 my-3" />
                      <div className={`rounded-lg border ${delivery === 'self' ? 'border-[#4563d1]' : 'border-transparent'} bg-white transition-all`}>
                        <label className="w-full px-3 py-3 flex items-start gap-3">
                          <input type="radio" name="delivery" checked={delivery === 'self'} onChange={() => { setDelivery('self'); setExpandedSelf(true); setExpandedNova(false); setExpandedMarket(false) }} className="h-4 w-4 text-[#4563d1] mt-0.5" />
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-[#4563d1]" />
                            <p className="text-sm text-gray-900">Самовивіз — <span className="text-gray-700">безкоштовно</span></p>
                          </div>
                        </label>
                        {expandedSelf && delivery === 'self' && !selfConfirmed && (
                          <div className="px-3 pb-3">
                            <div className="h-px bg-gray-200 my-2" />
                            <label className="block text-sm text-gray-700 mb-1">Місто <span className="text-red-500">*</span></label>
                            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={selfCity} onChange={(e) => { setSelfCity(e.target.value); const b = SELF_ADDRESSES[e.target.value] || ['Пункт самовивозу']; setSelfAddress(b[0]) }}>
                              {UA_CITIES.map(c => (<option key={c} value={c}>{c}</option>))}
                            </select>
                            <label className="block text-sm text-gray-700 mt-3 mb-1">Адреса пункту <span className="text-red-500">*</span></label>
                            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" value={selfAddress} onChange={(e) => setSelfAddress(e.target.value)}>
                              {(SELF_ADDRESSES[selfCity]?.length ? SELF_ADDRESSES[selfCity] : fallbackSelf(selfCity)).map(b => (<option key={b} value={b}>{b}</option>))}
                            </select>
                            <button onClick={() => { setSelfConfirmed(true); setExpandedSelf(false) }} className="mt-3 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                          </div>
                        )}
                        {selfConfirmed && delivery === 'self' && (
                          <div className="px-3 pb-3 text-sm text-gray-700">
                            <p className="text-[#4563d1] mb-1">Самовивіз</p>
                            <p>{selfCity}, {selfAddress}</p>
                          </div>
                        )}
                      </div>
                      </>
                    )}
                  </div>
                </section>

                {/* Payment */}
                <section className="rounded-xl bg-white shadow-sm">
                  <header className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
                    <StepBadge index={3} completed={paymentConfirmed} />
                    <h2 className="font-semibold ml-1.5">Оплата</h2>
                  </header>
                  <div className="p-4 space-y-4">
                    {hasCardPay && (
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
                    )}
                    {payment === 'card' && !paymentConfirmed && (
                      <div className="px-3">
                        <div className="h-px bg-gray-200 my-2" />
                        <button onClick={() => { setPaymentConfirmed(true) }} className="mt-1 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                      </div>
                    )}

                    {hasAfterPay && (
                      <label className={`w-full rounded-lg px-3 py-3 flex items-start gap-3 ${payment === 'cod' ? 'bg-[#4563d1]/10 border border-[#4563d1]' : 'hover:bg-gray-50 border border-transparent'}`}>
                        <input type="radio" name="payment" checked={payment === 'cod'} onChange={() => setPayment('cod')} className="h-4 w-4 text-[#4563d1] mt-0.5" />
                        <div className="text-sm text-gray-800">
                          <p className="font-medium">Післяплата</p>
                        </div>
                      </label>
                    )}
                    {payment === 'cod' && !paymentConfirmed && (
                      <div className="px-3">
                        <div className="h-px bg-gray-200 my-2" />
                        <p className="text-sm text-gray-600">Оплата при отриманні у відділенні перевізника.</p>
                        <button onClick={() => { setPaymentConfirmed(true) }} className="mt-2 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                      </div>
                    )}

                    {(hasMono || hasPrivat || hasPumb) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {hasMono && (
                          <label className={`w-full rounded-lg px-3 py-3 flex items-start gap-2 ${payment === 'mono' ? 'bg-[#4563d1]/10 border border-[#4563d1]' : 'hover:bg-gray-50 border border-transparent'}`}>
                            <input type="radio" name="payment" checked={payment === 'mono'} onChange={() => setPayment('mono')} className="h-4 w-4 text-[#4563d1] mt-0.5" />
                            <div className="text-sm text-gray-800">
                              <p className="font-medium">Розстрочка Monobank</p>
                            </div>
                          </label>
                        )}
                        {hasPrivat && (
                          <label className={`w-full rounded-lg px-3 py-3 flex items-start gap-2 ${payment === 'privat' ? 'bg-[#4563d1]/10 border border-[#4563d1]' : 'hover:bg-gray-50 border border-transparent'}`}>
                            <input type="radio" name="payment" checked={payment === 'privat'} onChange={() => setPayment('privat')} className="h-4 w-4 text-[#4563d1] mt-0.5" />
                            <div className="text-sm text-gray-800">
                              <p className="font-medium">Розстрочка PrivatBank</p>
                            </div>
                          </label>
                        )}
                        {hasPumb && (
                          <label className={`w-full rounded-lg px-3 py-3 flex items-start gap-2 ${payment === 'pumb' ? 'bg-[#4563d1]/10 border border-[#4563d1]' : 'hover:bg-gray-50 border border-transparent'}`}>
                            <input type="radio" name="payment" checked={payment === 'pumb'} onChange={() => setPayment('pumb')} className="h-4 w-4 text-[#4563d1] mt-0.5" />
                            <div className="text-sm text-gray-800">
                              <p className="font-medium">Розстрочка ПУМБ</p>
                            </div>
                          </label>
                        )}
                      </div>
                    )}

                    {payment === 'mono' && !paymentConfirmed && (
                      <div className="px-3">
                        <div className="h-px bg-gray-200 my-2" />
                        <p className="text-sm text-gray-600">Розстрочка Monobank.</p>
                        <button onClick={() => { setPaymentConfirmed(true) }} className="mt-2 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                      </div>
                    )}
                    {payment === 'privat' && !paymentConfirmed && (
                      <div className="px-3">
                        <div className="h-px bg-gray-200 my-2" />
                        <p className="text-sm text-gray-600">Розстрочка PrivatBank.</p>
                        <button onClick={() => { setPaymentConfirmed(true) }} className="mt-2 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                      </div>
                    )}
                    {payment === 'pumb' && !paymentConfirmed && (
                      <div className="px-3">
                        <div className="h-px bg-gray-200 my-2" />
                        <p className="text-sm text-gray-600">Розстрочка ПУМБ.</p>
                        <button onClick={() => { setPaymentConfirmed(true) }} className="mt-2 w-full hover:cursor-pointer rounded-lg border-2 border-[#6f5ef9] px-4 py-2 text-sm text-[#6f5ef9] hover:bg-[#6f5ef9]/10">Продовжити</button>
                      </div>
                    )}

                    {paymentConfirmed && (
                      <p className="text-sm text-gray-700 px-3">Обрано спосіб оплати: {payment === 'card' ? 'Оплата карткою' : payment === 'cod' ? 'Післяплата' : payment === 'mono' ? 'Розстрочка Monobank' : payment === 'privat' ? 'Розстрочка PrivatBank' : 'Розстрочка ПУМБ'}</p>
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
                  <button onClick={placeOrder} className="mt-4 w-full hover:cursor-pointer rounded-lg bg-[#4563d1] px-4 py-3 text-white text-sm font-semibold hover:bg-[#364ea8]">Оформити замовлення</button>
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


