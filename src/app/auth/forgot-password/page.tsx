import { Metadata } from 'next'
import Link from 'next/link'
import AnimatedLogo from '@/components/shared/AnimatedLogo'

export const metadata: Metadata = {
  title: 'Відновлення пароля | Sell Point',
  description: 'Відновіть доступ до вашого акаунту на Sell Point',
}

export default function ForgotPasswordPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: 'url(/background.png)' }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center group" aria-label="Sell Point">
            <AnimatedLogo className="w-[300px] h-auto" />
          </Link>
          <h2 className="mt-6 text-center font-semibold text-gray-900 max-w-[300px] mx-auto">
            Не можете увійти?
          </h2>
          <p className="px-6 mt-2 text-center text-sm text-gray-600">Введіть ваш email, і ми надішлемо Вам код для відновлення доступу до вашого профілю.</p>
        </div>
        
        <form className="-mt-2 space-y-6 max-w-[350px] mx-auto">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className=" mt-0 bg-white appearance-none relative block w-full px-4 py-2.5 border-2 border-white placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1] focus:z-10 sm:text-sm transition-[border-color,box-shadow] duration-200 ease-out shadow-md"
              placeholder="Введіть ваш email"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#4563d1] hover:bg-[#364ea8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4563d1]  transition-colors duration-200 ease-out"
            >
              Продовжити
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/login" className="font-medium text-sm text-[#4563d1] hover:text-[#364ea8]">
              Повернутися до входу
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 