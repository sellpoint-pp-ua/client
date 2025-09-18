'use client';

import { Metadata } from 'next'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePasswordReset } from '@/hooks/usePasswordReset'
import AnimatedLogo from '@/components/shared/AnimatedLogo'

export default function ResetPasswordPage() {
  const { isLoading, error, success, verifyResetCode, clearError, clearSuccess } = usePasswordReset();
  const [formData, setFormData] = useState({
    code: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');

  useEffect(() => {
    if (!resetToken) {
      router.push('/auth/forgot-password');
    }
  }, [resetToken, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (error) {
      clearError();
    }
    if (success) {
      clearSuccess();
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = 'Код підтвердження обов\'язковий';
    } else if (formData.code.length < 4) {
      errors.code = 'Код повинен містити мінімум 4 символи';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !resetToken) {
      return;
    }

    try {
      const response = await verifyResetCode({ 
        resetToken, 
        code: formData.code 
      });
      
      setTimeout(() => {
        const accessCode = response.accessCode || localStorage.getItem('password_reset_access_code');
        if (accessCode) {
          router.push(`/auth/new-password?token=${resetToken}&accessCode=${accessCode}`);
        } else {
          router.push(`/auth/new-password?token=${resetToken}&code=${formData.code}`);
        }
      }, 1500);
    } catch (err) {
      console.error('Verify reset code failed:', err);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = " mt-0 bg-white appearance-none relative block w-full px-4 py-2.5 border-2 border-white placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1] focus:z-10 sm:text-sm transition-[border-color,box-shadow] duration-200 ease-out shadow-md text-center text-lg tracking-widest";
    const errorClass = validationErrors[fieldName] ? "border-red-300" : "border-gray-300";
    return `${baseClass} ${errorClass}`;
  };

  if (!resetToken) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: 'url(/background.png)' }}
      >
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Перенаправлення...</h2>
            <p className="mt-2 text-sm text-gray-600">Повертаємо вас на сторінку відновлення пароля</p>
          </div>
        </div>
      </div>
    );
  }

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
            Підтвердження коду
          </h2>
          <p className="px-6 mt-2 text-center text-sm text-gray-600">
            {success 
              ? 'Код підтверджено успішно! Перенаправляємо вас...'
              : 'Введіть код підтвердження, який ми надіслали на вашу пошту.'
            }
          </p>
        </div>
        
        {error && (
          <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Помилка
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="px-4 py-3 rounded-md bg-green-50 border border-green-200 text-green-700">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Успішно
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!success && (
          <form onSubmit={handleSubmit} className="-mt-2 space-y-6 max-w-[350px] mx-auto">
            <div>
              <input
                id="code"
                name="code"
                type="text"
                autoComplete="one-time-code"
                required
                value={formData.code}
                onChange={handleInputChange}
                className={getInputClassName('code')}
                placeholder="Введіть код"
                maxLength={10}
              />
              {validationErrors.code && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.code}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#4563d1] hover:bg-[#364ea8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4563d1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ease-out"
              >
                {isLoading ? 'Перевірка...' : 'Підтвердити'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <Link href="/auth/forgot-password" className="font-medium text-sm text-[#4563d1] hover:text-[#364ea8]">
            Назад до відновлення пароля
          </Link>
        </div>
      </div>
    </div>
  )
}
