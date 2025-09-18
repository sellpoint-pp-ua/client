'use client';

import { Metadata } from 'next'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePasswordReset } from '@/hooks/usePasswordReset'
import { Eye, EyeOff } from 'lucide-react'
import AnimatedLogo from '@/components/shared/AnimatedLogo'

export default function NewPasswordPage() {
  const { isLoading, error, success, resetPassword, clearError, clearSuccess } = usePasswordReset();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null); // Add local error state
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');
  const code = searchParams.get('code');
  const accessCode = searchParams.get('accessCode');

  useEffect(() => {
    if (!resetToken || (!code && !accessCode)) {
      router.push('/auth/forgot-password');
    }
  }, [resetToken, code, accessCode, router]);

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
    if (localError) {
      setLocalError(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.password) {
      errors.password = 'Пароль обов\'язковий';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль повинен містити мінімум 6 символів';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Підтвердження пароля обов\'язкове';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Паролі не співпадають';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !resetToken || (!code && !accessCode)) {
      return;
    }

    try {
      const finalAccessCode = accessCode || code || localStorage.getItem('password_reset_access_code');
      
      if (!finalAccessCode) {
        setLocalError('Не знайдено код доступу. Спробуйте знову.');
        return;
      }

      await resetPassword({ 
        password: formData.password,
        accessCode: finalAccessCode
      });
    } catch (err) {
      console.error('Reset password failed:', err);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = " mt-0 bg-white appearance-none relative block w-full px-4 py-2.5 border-2 border-white placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1] focus:z-10 sm:text-sm transition-[border-color,box-shadow] duration-200 ease-out shadow-md";
    const errorClass = validationErrors[fieldName] ? "border-red-300" : "border-gray-300";
    return `${baseClass} ${errorClass}`;
  };

  if (!resetToken || (!code && !accessCode)) {
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
            Новий пароль
          </h2>
          <p className="px-6 mt-2 text-center text-sm text-gray-600">
            {success 
              ? 'Пароль успішно змінено! Перенаправляємо вас на сторінку входу...'
              : 'Введіть новий пароль для вашого акаунту.'
            }
          </p>
        </div>
        
        { (localError || error) && (
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
                  <p>{localError || error}</p>
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
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${getInputClassName('password')} pr-10`}
                    placeholder="Введіть новий пароль"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                    className="px-2 py-2 absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>
              
              <div>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`${getInputClassName('confirmPassword')} pr-10`}
                    placeholder="Підтвердіть новий пароль"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Сховати пароль' : 'Показати пароль'}
                    className="px-2 py-2 absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#4563d1] hover:bg-[#364ea8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4563d1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ease-out"
              >
                {isLoading ? 'Зміна пароля...' : 'Змінити пароль'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <Link href="/auth/login" className="font-medium text-sm text-[#4563d1] hover:text-[#364ea8]">
            Повернутися до входу
          </Link>
        </div>
      </div>
    </div>
  )
}
