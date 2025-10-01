'use client';

import Link from 'next/link'
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import AnimatedLogo from '@/components/shared/AnimatedLogo'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'Ім\'я обов\'язкове';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Прізвище обов\'язкове';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email обов\'язковий';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Введіть коректний email';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Номер телефону обов\'язковий';
    }

    if (!formData.password) {
      errors.password = 'Пароль обов\'язковий';
    } else if (formData.password.length < 8) {
      errors.password = 'Пароль має бути мінімум 8 символів';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Підтвердження пароля обов\'язкове';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Паролі не співпадають';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Необхідно погодитися з умовами використання';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = " mt-0 bg-white appearance-none relative block w-full px-4 py-2.5 border-2 border-white placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1] focus:z-10 sm:text-sm transition-[border-color,box-shadow] duration-200 ease-out shadow-md";
    const errorClass = validationErrors[fieldName] ? "border-red-300" : "border-gray-300";
    return `${baseClass} ${errorClass}`;
  };

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
          <h2 className="mt-5 text-center font-semibold text-gray-900 max-w-[300px] mx-auto">
            Ще немаєте профілю? Зареєструйтеся зараз!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Або{' '}
            <Link href="/auth/login" className="font-medium text-[#4563d1] hover:text-[#364ea8]">
              увійдіть до існуючого акаунту
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="-mt-2 space-y-6 max-w-[350px] mx-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={getInputClassName('firstName')}
                  placeholder="Ваше ім&apos;я"
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>
              
              <div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={getInputClassName('lastName')}
                  placeholder="Ваше прізвище"
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={getInputClassName('email')}
                placeholder="Ел. пошта"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className={getInputClassName('phone')}
                placeholder="+380"
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>
            
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
                  placeholder="Пароль - мінімум 8 символів"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                  className="absolute inset-y-0 px-2 hover:cursor-pointer py-2 right-3 flex items-center text-gray-500 hover:text-gray-700"
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
                  placeholder="Повторіть пароль"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Сховати пароль' : 'Показати пароль'}
                  className="px-2 py-2 absolute hover:cursor-pointer inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
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

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agreeTerms"
              type="checkbox"
              required
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              className="h-4 w-4 text-[#4563d1]  hover:cursor-pointer focus:ring-[#4563d1] border-gray-300 rounded"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              Я погоджуюсь з{' '}
              <Link href="/terms" className="font-medium text-[#4563d1] hover:text-[#364ea8]">
                умовами використання
              </Link>
              {' '}та{' '}
              <Link href="/privacy" className="font-medium text-[#4563d1] hover:text-[#364ea8]">
                політикою конфіденційності
              </Link>
            </label>
          </div>
          {validationErrors.agreeTerms && (
            <p className="text-sm text-red-600">{validationErrors.agreeTerms}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative  hover:cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#4563d1] hover:bg-[#364ea8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4563d1] disabled:opacity-50 disabled:cursor-not-allowed  transition-colors duration-200 ease-out"
            >
              {isLoading ? 'Створення акаунту...' : 'Створити акаунт'}
            </button>
          </div>

          <div className="mt-6">

            <div className="mt-6">
              <GoogleAuthButton 
                text="Зареєструватися через Google"
                className="w-full  hover:cursor-pointer"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 