'use client';

import Link from 'next/link'
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear API error when user starts typing
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
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      await register({
        fullName,
        email: formData.email,
        password: formData.password
      });
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Registration failed:', err);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = "mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7B1FA2] focus:border-[#7B1FA2] focus:z-10 sm:text-sm";
    const errorClass = validationErrors[fieldName] ? "border-red-300" : "border-gray-300";
    return `${baseClass} ${errorClass}`;
  };

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
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Прізвище
                </label>
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={getInputClassName('email')}
                placeholder="your@email.com"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={getInputClassName('password')}
                placeholder="Мінімум 8 символів"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
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
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={getInputClassName('confirmPassword')}
                placeholder="Повторіть пароль"
              />
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
          {validationErrors.agreeTerms && (
            <p className="text-sm text-red-600">{validationErrors.agreeTerms}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#7B1FA2] hover:bg-[#6a1b8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B1FA2] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Створення акаунту...' : 'Створити акаунт'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Вже маєте акаунт?{' '}
              <Link href="/auth/login" className="font-medium text-[#7B1FA2] hover:text-[#6a1b8c]">
                Увійти
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 