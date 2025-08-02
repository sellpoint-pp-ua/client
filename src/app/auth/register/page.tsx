import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Реєстрація | Sell Point',
  description: 'Створіть новий акаунт на Sell Point',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-[#7B1FA2]">Sell Point</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Створення акаунту
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Або{' '}
            <Link href="/auth/login" className="font-medium text-[#7B1FA2] hover:text-[#6a1b8c]">
              увійдіть до існуючого акаунту
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Ім&apos;я
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7B1FA2] focus:border-[#7B1FA2] focus:z-10 sm:text-sm"
                  placeholder="Ваше ім&apos;я"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Прізвище
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7B1FA2] focus:border-[#7B1FA2] focus:z-10 sm:text-sm"
                  placeholder="Ваше прізвище"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7B1FA2] focus:border-[#7B1FA2] focus:z-10 sm:text-sm"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Номер телефону
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7B1FA2] focus:border-[#7B1FA2] focus:z-10 sm:text-sm"
                placeholder="+380"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7B1FA2] focus:border-[#7B1FA2] focus:z-10 sm:text-sm"
                placeholder="Мінімум 8 символів"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Підтвердження пароля
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7B1FA2] focus:border-[#7B1FA2] focus:z-10 sm:text-sm"
                placeholder="Повторіть пароль"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-[#7B1FA2] focus:ring-[#7B1FA2] border-gray-300 rounded"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              Я погоджуюсь з{' '}
              <Link href="/terms" className="font-medium text-[#7B1FA2] hover:text-[#6a1b8c]">
                умовами використання
              </Link>
              {' '}та{' '}
              <Link href="/privacy" className="font-medium text-[#7B1FA2] hover:text-[#6a1b8c]">
                політикою конфіденційності
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#7B1FA2] hover:bg-[#6a1b8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B1FA2]"
            >
              Створити акаунт
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 