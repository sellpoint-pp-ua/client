"use client"
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import AccountSidebar from '@/components/account/AccountSidebar'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

type ApiOrder = {
  id: string
  orderNumber: string
  sellerId: string
  createdAt: string
  pcs: number
  totalPrice: number
  miniProductsInfo?: { productId?: string; productName?: string; price?: number; image?: { sourceUrl?: string; compressedUrl?: string } }
  payed?: boolean | null
  status?: number
  deliveryToInfo?: { address?: string; settlement?: string; region?: string }
}

type ApiGroup = { orderNumber: string; orders: ApiOrder[] }

type SellerInfo = { name?: string; avatarUrl?: string | null }

  const statusToUi = (s?: number): { primary: string; secondary: string; color: string } => {
  switch (s) {
    case 0: return { primary: 'Очікує підтвердження', secondary: 'Нове', color: 'text-yellow-600' }
    case 1: return { primary: 'Очікує відправки', secondary: 'Готується до відправки', color: 'text-blue-600' }
    case 2: return { primary: 'У дорозі', secondary: 'В дорозі', color: 'text-blue-600' }
    case 3: return { primary: 'Доставлено', secondary: 'Доставлено', color: 'text-green-600' }
    case 4: return { primary: 'Отримано', secondary: 'Виконано', color: 'text-green-600' }
    case 5: return { primary: 'Відхилено', secondary: 'Скасовано', color: 'text-red-600' }
    case 6: return { primary: 'Скасовано', secondary: 'Скасовано', color: 'text-red-600' }
    default: return { primary: 'Статус невідомий', secondary: '—', color: 'text-gray-600' }
  }
}


export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 0 | 1 | 2 | 3 | 4 | 5 | 6>('all')
  const [search, setSearch] = useState<string>('')
  const [groups, setGroups] = useState<ApiGroup[]>([])
  const [sellers, setSellers] = useState<Record<string, SellerInfo>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [busyCancelId, setBusyCancelId] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)

  const handleCancel = async (orderId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) return
    setBusyCancelId(orderId)
    try {
      const res = await fetch(`https://api.sellpoint.pp.ua/api/Order/CancelOrder?orderId=${orderId}`, {
        method: 'POST',
        headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) { setError('Помилка скасування замовлення'); return }
      const ordersRes = await fetch('https://api.sellpoint.pp.ua/api/Order/GetByUserIdGrouped', {
        headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }
      })
      if (ordersRes.ok) {
        const data: ApiGroup[] = await ordersRes.json()
        setGroups(data)
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
      }
    } catch {
      setError('Помилка скасування замовлення')
    } finally {
      setBusyCancelId(null)
    }
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) { setLoading(false); setError('Потрібна авторизація'); return }
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('https://api.sellpoint.pp.ua/api/Order/GetByUserIdGrouped', {
          headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }, cache: 'no-store'
        })
        if (!res.ok) { setError('Не вдалося завантажити замовлення'); setLoading(false); return }
        const data: ApiGroup[] = await res.json()
        if (cancelled) return
        setGroups(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setError('Помилка завантаження замовлень')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const ids = new Set<string>()
    for (const g of groups) for (const o of (g.orders || [])) if (o?.sellerId) ids.add(o.sellerId)
    const need = Array.from(ids).filter(id => !sellers[id])
    if (need.length === 0) return
    let cancelled = false
    ;(async () => {
      const results = await Promise.all(need.map(async sid => {
        try {
          const r = await fetch(`https://api.sellpoint.pp.ua/api/Store/GetStoreById?storeId=${encodeURIComponent(sid)}`)
          if (!r.ok) return [sid, {}] as const
          const s = await r.json()
          return [sid, { name: s?.name, avatarUrl: s?.avatar?.sourceUrl || s?.avatar?.compressedUrl || null }] as const
        } catch { return [sid, {}] as const }
      }))
      if (cancelled) return
      setSellers(prev => { const next = { ...prev }; for (const [sid, info] of results) next[sid] = { ...(next[sid]||{}), ...info }; return next })
    })()
    return () => { cancelled = true }
  }, [groups])

  const flattened = useMemo(() => {
    const list: ApiOrder[] = []
    for (const g of groups) for (const o of g.orders || []) list.push(o)
    return list
  }, [groups])

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase()
    return flattened.filter(o => {
      const st = o.status as number | undefined
      if (statusFilter !== 'all' && st !== statusFilter) return false
      if (!q) return true
      const name = (o.miniProductsInfo?.productName || '').toLowerCase()
      const ord = (o.orderNumber || '').toLowerCase()
      const id = (o.id || '').toLowerCase()
      return name.includes(q) || ord.includes(q) || id.includes(q)
    })
  }, [flattened, statusFilter, search])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto w-full max-w-[1510px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[270px] lg:flex-shrink-0">
              <AccountSidebar />
            </div>
            <div className="flex-1 -ml-2">
              {/* Orders header card */}
              <div className="rounded-xl bg-white p-3 sm:p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-gray-900">Мої замовлення</h1>
                </div>
                <div className="mt-0 pt-2">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
				  <div className="flex items-center gap-3 mr-auto">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Пошук: номер або товар"
                        className="w-64 bg-white appearance-none rounded-lg border border-gray-300 placeholder-gray-500 text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button onClick={() => setStatusFilter('all')} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter==='all' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Усі</button>
                      <button onClick={() => setStatusFilter(0)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===0 ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Очікує підтвердження</button>
                      <button onClick={() => setStatusFilter(1)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Очікує відправки</button>
                      <button onClick={() => setStatusFilter(2)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===2 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>У дорозі</button>
                      <button onClick={() => setStatusFilter(3)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===3 ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Доставлено</button>
                      <button onClick={() => setStatusFilter(4)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===4 ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Отримано</button>
                      <button onClick={() => setStatusFilter(5)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===5 ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Відхилено</button>
                      <button onClick={() => setStatusFilter(6)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===6 ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Скасовано</button>
                    </div>
                    
                  </div>
                </div>
              </div>
              {/* Orders list */}
              <div className="mt-4 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500">
                  <div className="col-span-12 md:col-span-4">Замовлення</div>
                  <div className="hidden md:block md:col-span-2">Статус</div>
                  <div className="hidden md:block md:col-span-2">Ціна</div>
                  <div className="hidden md:block md:col-span-2">Продавець</div>
                  <div className="hidden md:block md:col-span-1"></div>
                </div>
                {loading ? (
                  <div className="px-4 py-8 text-center text-gray-500">Завантаження…</div>
                ) : error ? (
                  <div className="px-4 py-8 text-center text-red-600">{error}</div>
                ) : (
                  filtered.map((o, index) => {
                    const first = o.miniProductsInfo
                    const img = first?.image?.compressedUrl || first?.image?.sourceUrl || ''
                    const itemsQty = o.pcs || 1
                    const st = statusToUi(o.status)
                    const isPaid = Boolean(o.payed)
                    const seller = sellers[o.sellerId] || {}
                    const dateStr = (() => { try { const d = new Date(o.createdAt); const dd = String(d.getDate()).padStart(2,'0'); const mm = String(d.getMonth()+1).padStart(2,'0'); const yy = d.getFullYear(); return `${dd}.${mm}.${yy}` } catch { return '' } })()
                    return (
                      <div key={o.id} className={`grid grid-cols-12 gap-4 px-4 py-4 items-center ${index !== 0 ? 'border-t border-gray-200' : ''}`}>
                        <div className="col-span-12 md:col-span-4">
                          <div className="flex items-start gap-4">
                            <div className="relative h-28 w-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {img ? <Image src={img} alt={first?.productName || 'Товар'} fill className="object-cover" /> : null}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">Замовлення</p>
                              <p className="text-sm font-medium text-gray-900">№{String(o.orderNumber || '').slice(0,16)}</p>
                              <p className="mt-1 text-xs text-gray-500">{dateStr}</p>
                              <p className="mt-3 text-xs text-gray-500">{itemsQty} шт. • ID: {o.id}</p>
                              <p className="mt-1 text-sm text-[#3046b4] hover:underline cursor-pointer truncate">{first?.productName || 'Товар'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-6 md:col-span-2 flex md:flex-col md:justify-start gap-1">
                          <p className={`text-sm font-medium ${st.color}`}>{st.primary}</p>
                         
                          <p className="text-xs text-gray-600">
                            {(() => {
                              const a = o.deliveryToInfo?.address || ''
                              const s = o.deliveryToInfo?.settlement || ''
                              const r = o.deliveryToInfo?.region || ''
                              const cityPart = s ? s : ''
                              const regionPart = r ? (cityPart ? `, ${r}` : r) : ''
                              const addrPart = a ? (cityPart || regionPart ? `, ${a}` : a) : ''
                              const txt = `${cityPart}${regionPart}${addrPart}`.trim()
                              return txt ? `Доставка: ${txt}` : ''
                            })()}
                          </p>
                        </div>
                        <div className="col-span-6 md:col-span-2 flex items-center flex-col">
                          <p className="text-sm font-semibold text-gray-900">{(o.totalPrice || 0).toLocaleString('uk-UA')} грн</p>
                          <p className={`text-sm ${isPaid ? 'text-green-600' : 'text-red-500'}`}>{isPaid ? 'Оплачено' : 'Післяплата'}</p>
                        </div>
                        <div className="col-span-8 md:col-span-2 flex items-center flex-col">
						  {seller?.avatarUrl ? <img src={seller.avatarUrl} alt={seller?.name || 'store'} className="mt-0 h-8 w-8 rounded-full object-cover" /> : null}
						  <p className="mt-2 text-sm font-medium text-gray-900">{seller?.name || o.sellerId}</p>
                        </div>
                        <div className="col-span-4 md:col-span-2 flex md:flex-col md:items-end md:justify-end gap-2">
                          <button className="hover:cursor-pointer rounded-lg bg-[#4563d1] px-4 py-2 text-sm text-white hover:bg-[#364ea8] whitespace-nowrap">Додати відгук</button>
                          {(() => { const canCancel = o.status !== 4 && o.status !== 6; return (
                            <button onClick={() => handleCancel(o.id)} disabled={!canCancel || busyCancelId===o.id} className="hover:cursor-pointer rounded-lg bg-red-500 px-7 py-2 text-sm text-white hover:bg-red-700 whitespace-nowrap disabled:opacity-50">Скасувати</button>
                          ) })()}
                        </div>
                      </div>
                    )
                  })
                )}
                {(!loading && !error && filtered.length === 0) && (
                  <div className="px-4 py-8 text-center text-gray-500 border-t border-gray-200">Немає замовлень за вибраним фільтром</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
          <div className="flex items-center gap-3 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Замовлення успішно скасовано</span>
            <button 
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 hover:bg-green-600 rounded-full p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


