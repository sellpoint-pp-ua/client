'use client'

import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import AnimatedLogo from '@/components/shared/AnimatedLogo'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartDrawer } from '@/components/cart/CartDrawerProvider'
import Image from 'next/image'

export default function PaySuccessPage() {
  const { clearCart } = useCartDrawer()
  const [cleared, setCleared] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await clearCart()
        if (!cancelled) setCleared(true)
      } catch {
      }
    })()
    return () => { cancelled = true }
  }, [clearCart])

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      setIsAuthenticated(Boolean(token))
    } catch {
      setIsAuthenticated(false)
    }
  }, [])
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-2xl bg-white shadow-sm p-10 text-center">
            <div className="mx-auto h-12 w-auto mb-4">
              <Link href="/" aria-label="На головну">
                <AnimatedLogo className="h-12 mx-auto" />
              </Link>
             
            </div>
            <div className="mb-6">
                    <Image
                      src="/success.png"
                      alt="Відгуки"
                      width={160}
                      height={160}
                      className="mx-auto"
                    />
                  </div>
            
            <h1 className="text-2xl font-bold text-gray-900">Дякуємо за покупку!</h1>
            <p className="mt-2 text-gray-600">Очікуйте відправлення товару. Статус можна відстежити у ваших замовленнях. При потребі з Вами зв'яжеться продавець</p>
            {!cleared ? <p className="mt-1 text-[12px] text-gray-500">Очищення кошика…</p> : null}
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/" className="rounded-lg bg-[#4563d1] px-5 py-2 text-white text-sm font-semibold hover:bg-[#364ea8]">На головну</Link>
              {isAuthenticated ? (
                <Link href="/orders" className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-[#3046b4] hover:bg-[#4563d1]/5">Мої замовлення</Link>
              ) : (
                <Link href="/orders/track" className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-[#3046b4] hover:bg-[#4563d1]/5">Відстеження замовлення</Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}


