'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import type { ForgotPasswordRequest, VerifyResetCodeRequest, ResetPasswordRequest } from '../types/auth';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedResetToken = localStorage.getItem('password_reset_token');
    const storedAccessCode = localStorage.getItem('password_reset_access_code');
    if (storedResetToken) setResetToken(storedResetToken);
    if (storedAccessCode) setAccessCode(storedAccessCode);
  }, []);


  const translateError = useCallback((message: string): string => {
    const m = message.toLowerCase();
    if (/(invalid|incorrect).*(email|login)/.test(m)) {
      return 'Невірний email або логін';
    }
    if (/(user|email).*(not found|doesn't exist)/.test(m)) {
      return 'Користувач з таким email не знайдений';
    }
    if (/(invalid|incorrect).*(code)/.test(m)) {
      return 'Невірний код підтвердження';
    }
    if (/(expired).*(code)/.test(m)) {
      return 'Код підтвердження прострочено';
    }
    if (/(too many|rate limit|429)/.test(m)) {
      return 'Забагато спроб. Спробуйте пізніше';
    }
    if (/(network)/.test(m)) {
      return 'Помилка мережі. Спробуйте пізніше';
    }
    if (!message || message.trim() === '') {
      return 'Сталася невідома помилка. Спробуйте пізніше';
    }
    return message;
  }, []);

  const sendResetCode = useCallback(async (request: ForgotPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.sendPasswordResetCode(request);
      setSuccess('Код відновлення надіслано на вашу пошту');
      
      if (response.resetToken) {
        setResetToken(response.resetToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('password_reset_token', response.resetToken);
        }
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося надіслати код';
      setError(translateError(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [translateError]);

  const verifyResetCode = useCallback(async (request: VerifyResetCodeRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.verifyPasswordResetCode(request);
      setResetToken(request.resetToken);
      setSuccess('Код підтверджено успішно');
      
      if (response.accessCode) {
        setAccessCode(response.accessCode);
        if (typeof window !== 'undefined') {
          localStorage.setItem('password_reset_access_code', response.accessCode);
        }
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося підтвердити код';
      setError(translateError(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [translateError]);

  const resetPassword = useCallback(async (request: ResetPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.resetPassword(request);
      setSuccess('Пароль успішно змінено');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не вдалося змінити пароль';
      setError(translateError(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [translateError, router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  const clearAll = useCallback(() => {
    setError(null);
    setSuccess(null);
    setResetToken(null);
    setAccessCode(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('password_reset_token');
      localStorage.removeItem('password_reset_access_code');
    }
  }, []);

  const clearTokens = useCallback(() => {
    setResetToken(null);
    setAccessCode(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('password_reset_token');
      localStorage.removeItem('password_reset_access_code');
    }
  }, []);

  return {
    isLoading,
    error,
    success,
    resetToken,
    accessCode,
    sendResetCode,
    verifyResetCode,
    resetPassword,
    clearError,
    clearSuccess,
    clearAll,
    clearTokens,
  };
};
