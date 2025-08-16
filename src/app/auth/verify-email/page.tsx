'use client';

import Link from "next/link";
import { useState } from 'react';

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement verification logic
    console.log('Verifying code:', verificationCode);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleResendCode = () => {
    // TODO: Implement resend code logic
    console.log('Resending code...');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-[#7B1FA2]">Sell Point</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Підтвердження пошти
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введіть код, який ми відправили на пошту
          </p>
          <p className="mt-1 text-center text-sm text-gray-600">
            <span className="font-medium text-[#7B1FA2]">example@gmail.com</span>, щоб підтвердити свою особу
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
              Код підтвердження
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              autoComplete="one-time-code"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Введіть код"
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7B1FA2] focus:border-[#7B1FA2] focus:z-10 sm:text-sm"
              maxLength={6}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !verificationCode.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#7B1FA2] hover:bg-[#6a1b8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B1FA2] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Підтвердження...' : 'Підтвердити'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-[#7B1FA2] hover:text-[#6a1b8c] font-medium"
            >
              Надіслати повторно код
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Повернутися до{' '}
            <Link href="/auth/login" className="font-medium text-[#7B1FA2] hover:text-[#6a1b8c]">
              входу
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
