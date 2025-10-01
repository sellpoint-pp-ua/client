'use client'

import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import AnimatedLogo from '@/components/shared/AnimatedLogo'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type PendingOrder = {
  deliveryPayment: number
  phoneNumber: string
  firstName?: string
  lastName?: string
  middleName?: string
  email?: string
  address: string
  settlement: string
  region: string
  amount?: number
  items?: Array<{ id: string; name: string; price: number; qty?: number; imageUrl?: string | null }>
}

export default function NewPayPage() {
  const router = useRouter()
  const [pending, setPending] = useState<PendingOrder | null>(null)
  const [error, setError] = useState<string>('')

  const [card, setCard] = useState<string>('')
  const [expiry, setExpiry] = useState<string>('')
  const [cvv, setCvv] = useState<string>('')
  const [cardError, setCardError] = useState<string>('')
  const [expiryError, setExpiryError] = useState<string>('')
  const [cvvError, setCvvError] = useState<string>('')
  const [busy, setBusy] = useState<boolean>(false)

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('pending_order') : null
      if (!raw) { setError('Дані для оплати відсутні'); return }
      const parsed: PendingOrder = JSON.parse(raw)
      setPending(parsed)
    } catch {
      setError('Некоректні дані для оплати')
    }
  }, [])

  const amount = useMemo(() => {
    return pending?.amount ? Math.round(Number(pending.amount)) : 0
  }, [pending])

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
      if (isNaN(mm) || mm < 1 || mm > 12) { setExpiryError('Неправильний місяць'); return }
      if (isNaN(yy)) { setExpiryError('Неправильний рік'); return }
      if (yy < curYY || (yy === curYY && mm < curMM)) { setExpiryError('Картка прострочена'); return }
      if (yy > curYY + 20) { setExpiryError('Неправильний рік'); return }
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

  const doPay = async () => {
    try {
      if (!pending) return
      if (!validateAll()) { setError('Будь ласка, виправте помилки у формі оплати'); return }
      setBusy(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      let res: Response | null = null
      if (!token) {
        const products: Record<string, number> = {}
        for (const it of (pending.items || [])) {
          products[String(it.id)] = (products[String(it.id)] || 0) + (it.qty || 1)
        }
        res = await fetch('https://api.sellpoint.pp.ua/api/Order/BuyUnRegistered', {
          method: 'POST',
          headers: { 'accept': '*/*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            products,
            deliveryPayment: pending.deliveryPayment,
            deliveryTo: { address: pending.address, settlement: pending.settlement, region: pending.region },
            email: pending.email || '',
            phoneNumber: pending.phoneNumber,
            firstName: pending.firstName || '',
            lastName: pending.lastName || '',
            middleName: pending.middleName || '',
          })
        })
      } else {
        const q = new URLSearchParams()
        q.set('deliveryPayment', String(pending.deliveryPayment))
        if (pending.phoneNumber) q.set('phoneNumber', pending.phoneNumber)
        if (pending.firstName) q.set('firstName', pending.firstName)
        if (pending.lastName) q.set('lastName', pending.lastName)
        if (pending.middleName) q.set('middleName', pending.middleName)
        res = await fetch(`https://api.sellpoint.pp.ua/api/Order/BuyRegistered?${q.toString()}`, {
          method: 'POST',
          headers: { 'accept': '*/*', 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ address: pending.address, settlement: pending.settlement, region: pending.region })
        })
      }
      if (!res) { setError('Оплату відхилено. Спробуйте пізніше.'); setBusy(false); return }
      if (!res.ok) { setError('Оплату відхилено. Спробуйте пізніше.'); setBusy(false); return }
      try { if (typeof window !== 'undefined') sessionStorage.removeItem('pending_order') } catch {}
      router.push('/pay/success')
    } catch {
      setError('Оплату відхилено. Спробуйте пізніше.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-4">Оплата замовлення</h1>
          {error ? (
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
                    <button onClick={doPay} disabled={busy || !pending} className="mt-2 w-full hover:cursor-pointer rounded-lg bg-[#4563d1] px-4 py-3 text-white text-sm font-semibold hover:bg-[#364ea8] disabled:opacity-60">
                      {busy ? 'Оплата…' : `Оплатити ${amount} ₴`}
                    </button>
                  </div>
                </div>
              </div>
              <aside className="lg:col-span-4">
                <div className="rounded-xl bg-white shadow-sm p-3">
                  <h3 className="px-2 py-1 text-sm font-semibold text-gray-700">Замовлення</h3>
                  <div className="mt-2 space-y-3">
                    {(pending?.items || []).map((it, idx) => (
                      <div key={`${it.id}-${idx}`} className="flex gap-3 p-2 rounded-lg">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {it.imageUrl ? <img src={it.imageUrl} alt={it.name} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm text-gray-900">{it.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{Math.round(it.price)} ₴</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 px-2 text-sm text-gray-900">
                    <div className="flex items-center justify-between py-1">
                      <span>До оплати:</span>
                      <span className="font-bold text-lg">{amount} ₴</span>
                    </div>
                  </div>
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


