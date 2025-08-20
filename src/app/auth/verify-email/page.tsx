'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import AnimatedLogo from '@/components/shared/AnimatedLogo'

export default function VerifyEmailPage() {
  const { verifyEmailCode, sendVerificationCode, isLoading, clearError } = useAuth()
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!code.trim()) return
    try {
      await verifyEmailCode(code.trim())
      setMessage('Емейл підтверджено. Дякуємо! Ви будете перенаправлені...')
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }, 1000)
    } catch {
      clearError()
      setMessage('Невірний код. Спробуйте ще раз.')
    }
  }

  const onResend = async () => {
    setResendLoading(true)
    setMessage(null)
    try {
      await sendVerificationCode('uk')
      setMessage('Код повторно надіслано на ваш email.')
    } catch {
      setMessage('Не вдалося надіслати код. Спробуйте пізніше.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover bg-center shadow-md"
      style={{ backgroundImage: 'url(/background.png)' }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center group" aria-label="Sell Point">
            <AnimatedLogo className="w-[300px] h-auto" />
          </Link>
          <h2 className="mt-6 text-center font-semibold text-gray-900 max-w-[400px] mx-auto">
            Майже готово! Підтвердіть вашу email адресу
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 max-w-[300px] mx-auto">Введіть код, який ми надіслали на вашу email скриньку</p>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-0 space-y-6 max-w-[350px] mx-auto">
          <div>
            <input
              id="code"
              name="code"
              type="text"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className=" mt-0 bg-white appearance-none relative block w-full px-4 py-2.5 border-2 border-white placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1] focus:z-10 sm:text-sm transition-[border-color,box-shadow] duration-200 ease-out"
              placeholder="Наприклад, 5O6MUO"
            />
          </div>



          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#4563d1] hover:bg-[#364ea8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4563d1] disabled:opacity-50 disabled:cursor-not-allowed  transition-colors duration-200 ease-out"
            >
              {isLoading ? 'Перевіряємо...' : 'Підтвердити'}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-around ">
            <button
              type="button"
              onClick={onResend}
              className="text-sm text-[#4563d1] ml-10 hover:text-[#364ea8] font-medium   transition-colors duration-200 ease-out"
              disabled={resendLoading}
            >
              {resendLoading ? 'Надсилаємо...' : 'Надіслати код ще раз'}
            </button>

            <div >
          <Link href="/auth/login" className="font-medium mr-10 text-sm text-[#4563d1] hover:text-[#364ea8]">
            Повернутися до входу
          </Link>
            </div>
          </div>


      </div>
    </div>
  )
}


