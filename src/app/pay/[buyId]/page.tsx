'use client'

import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import AnimatedLogo from '@/components/shared/AnimatedLogo'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type BuyItem = {
  id: string
  sellerId: string
  payed: boolean
  payment: number
  deliveryToInfo?: { address?: string; settlement?: string; region?: string }
  miniProductInfo?: { productId?: string; productName?: string; price?: number; image?: { sourceUrl?: string; compressedUrl?: string } }
}

export default function PayPage() {
  const { buyId } = useParams<{ buyId: string }>()
  const router = useRouter()
  const [buy, setBuy] = useState<BuyItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  const [card, setCard] = useState<string>('')
  const [expiry, setExpiry] = useState<string>('')
  const [cvv, setCvv] = useState<string>('')
  const [cardError, setCardError] = useState<string>('')
  const [expiryError, setExpiryError] = useState<string>('')
  const [cvvError, setCvvError] = useState<string>('')
  const [remember, setRemember] = useState<boolean>(false)
  const [busy, setBusy] = useState<boolean>(false)

  const formatCard = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16)
    const groups = digits.match(/.{1,4}/g)
    return groups ? groups.join('-') : digits
  }

  const handleCardChange = (e: any) => {
    const formatted = formatCard(e.target.value)
    setCard(formatted)
    const digits = formatted.replace(/\D/g, '')
    if (digits.length === 16) setCardError('')
    else if (digits.length === 0) setCardError('')
    else setCardError('Неправильний номер картки')
  }

  const formatExpiry = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return digits.slice(0, 2) + '/' + digits.slice(2)
  }

  const handleExpiryChange = (e: any) => {
    const formatted = formatExpiry(e.target.value)
    setExpiry(formatted)
    const digits = formatted.replace(/\D/g, '')
    if (digits.length === 4) {
      const mm = parseInt(digits.slice(0, 2), 10)
      const yy = parseInt(digits.slice(2), 10)
      const now = new Date()
      const curYY = now.getFullYear() % 100
      const curMM = now.getMonth() + 1
      if (isNaN(mm) || mm < 1 || mm > 12) {
        setExpiryError('Неправильний місяць')
        return
      }
      if (isNaN(yy)) {
        setExpiryError('Неправильний рік')
        return
      }
      if (yy < curYY || (yy === curYY && mm < curMM)) {
        setExpiryError('Картка прострочена')
        return
      }
      if (yy > curYY + 20) {
        setExpiryError('Неправильний рік')
        return
      }
      setExpiryError('')
    } else {
      setExpiryError('')
    }
  }

  const handleCvvChange = (e: any) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 3)
    setCvv(digits)
    if (digits.length === 3) setCvvError('')
    else if (digits.length === 0) setCvvError('')
    else setCvvError('Неправильний CVV')
  }

  const validateAll = () => {
    let ok = true
    const cardDigits = card.replace(/\D/g, '')
    if (cardDigits.length !== 16) { setCardError('Неправильний номер картки'); ok = false } else setCardError('')
    const expDigits = expiry.replace(/\D/g, '')
    if (expDigits.length !== 4) { setExpiryError('Неправильний термін дії'); ok = false } else {
      const mm = parseInt(expDigits.slice(0,2), 10)
      const yy = parseInt(expDigits.slice(2), 10)
      const now = new Date()
      const curYY = now.getFullYear() % 100
      const curMM = now.getMonth() + 1
      if (isNaN(mm) || mm < 1 || mm > 12) { setExpiryError('Неправильний місяць'); ok = false }
      else if (isNaN(yy) || yy < curYY || (yy === curYY && mm < curMM) || yy > curYY + 20) { setExpiryError('Невірний термін дії'); ok = false }
      else setExpiryError('')
    }
    if (cvv.length !== 3) { setCvvError('Неправильний CVV'); ok = false } else setCvvError('')
    return ok
  }

  const price = useMemo(() => {
    return buy?.miniProductInfo?.price ? Math.round(Number(buy.miniProductInfo.price)) : 0
  }, [buy])

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!token) { setError('Потрібна авторизація'); setLoading(false); return }
        const res = await fetch('https://api.sellpoint.pp.ua/api/Buy/GetByMyId', { headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }, cache: 'no-store' })
        if (!res.ok) { setError('Не вдалося завантажити замовлення'); setLoading(false); return }
        const arr: BuyItem[] = await res.json()
        const found = Array.isArray(arr) ? arr.find(x => String(x.id) === String(buyId)) : null
        if (!found) { setError('Замовлення не знайдено'); setLoading(false); return }
        setBuy(found)
      } catch {
        setError('Сталася помилка при завантаженні')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [buyId])

  const doPay = async () => {
    try {
      if (!buy) return
      if (!validateAll()) {
        setError('Будь ласка, виправте помилки у формі оплати')
        return
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) { setError('Потрібна авторизація'); return }
      setBusy(true)
      const res = await fetch(`https://api.sellpoint.pp.ua/api/Buy/Pay?buyId=${encodeURIComponent(buy.id)}`, {
        method: 'POST',
        headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) {
        setError('Оплату відхилено. Спробуйте іншу карту або пізніше.')
        setBusy(false)
        return
      }
      router.push('/pay/success')
    } catch {
      setError('Оплату відхилено. Спробуйте пізніше.')
    } finally {
      setBusy(false)
    }
  }

  const ProductSummary = () => {
    const name = buy?.miniProductInfo?.productName || 'Товар'
    const img = buy?.miniProductInfo?.image?.compressedUrl || buy?.miniProductInfo?.image?.sourceUrl || ''
    return (
      <div className="rounded-xl bg-white shadow-sm p-3">
        <h3 className="px-2 py-1 text-sm font-semibold text-gray-700">Замовлення</h3>
        <div className="mt-2 space-y-3">
          <div className="flex gap-3 p-2 rounded-lg">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {img ? <Image src={img} alt={name} fill className="object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm text-gray-900">{name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{price} ₴</p>
            </div>
          </div>
        </div>
        <div className="mt-3 px-2 text-sm text-gray-900">
          <div className="flex items-center justify-between py-1">
            <span>До оплати:</span>
            <span className="font-bold text-lg">{price} ₴</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-4">Замовлення оформлено, але не оплачено</h1>
          {loading ? (
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">Завантаження…</div>
          ) : error ? (
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <div className="rounded-xl bg-white shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AnimatedLogo className="h-6" />
                    <span className="text-sm text-gray-600">Безпечна онлайн-оплата</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    
                    <label className="text-sm">
                      <span className="text-gray-700">Номер картки</span>
                      <input value={card} onChange={handleCardChange} placeholder="XXXX-XXXX-XXXX-XXXX" inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" />
                      {cardError ? <p className="text-red-600 text-xs mt-1">{cardError}</p> : null}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm">
                        <span className="text-gray-700">Термін дії</span>
                        <input value={expiry} onChange={handleExpiryChange} placeholder="MM/YY" inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" />
                        {expiryError ? <p className="text-red-600 text-xs mt-1">{expiryError}</p> : null}
                      </label>
                      <label className="text-sm">
                        <span className="text-gray-700">CVV</span>
                        <input value={cvv} onChange={handleCvvChange} placeholder="CVV" inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" />
                        {cvvError ? <p className="text-red-600 text-xs mt-1">{cvvError}</p> : null}
                      </label>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700 mt-1">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#4563d1] focus:ring-[#4563d1]" />
                      <span>Зберегти карту для майбутніх замовлень</span>
                    </label>
                    <button onClick={doPay} disabled={busy} className="mt-2 w-full hover:cursor-pointer rounded-lg bg-[#4563d1] px-4 py-3 text-white text-sm font-semibold hover:bg-[#364ea8] disabled:opacity-60">
                      {busy ? 'Оплата…' : `Оплатити ${price} ₴`}
                    </button>
                  </div>
                </div>
              </div>
              <aside className="lg:col-span-4">
                <ProductSummary />
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}


