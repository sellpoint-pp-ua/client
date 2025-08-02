import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Відновлення пароля | Sell Point',
  description: 'Відновіть доступ до вашого акаунту на Sell Point',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-[#7B1FA2]">Sell Point</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Відновлення пароля
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введіть ваш email для відновлення пароля
          </p>
        </div>
        
        <form className="mt-8 space-y-6">
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
              placeholder="Введіть ваш email"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#7B1FA2] hover:bg-[#6a1b8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B1FA2]"
            >
              Надіслати інструкції
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/login" className="font-medium text-[#7B1FA2] hover:text-[#6a1b8c]">
              Повернутися до входу
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 