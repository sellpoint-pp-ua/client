'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import type { LoginRequest, RegisterRequest } from '../types/auth';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const translateAuthError = useCallback((message: string): string => {
    const m = message.toLowerCase();
    if (/(invalid|incorrect).*(username|login|email|password)/.test(m)) {
      return 'Невірний логін, email або пароль';
    }
    if (/(user|email).*(already exists|exists|taken)/.test(m)) {
      return 'Користувач з таким email уже існує';
    }
    if (/(unauthorized|forbidden|401|403)/.test(m)) {
      return 'Доступ заборонено. Перевірте ваші облікові дані';
    }
    if (/(network)/.test(m)) {
      return 'Помилка мережі. Спробуйте пізніше';
    }
    if (/(failed).*(login|sign in)/.test(m)) {
      return 'Не вдалося увійти';
    }
    if (/(failed).*(register|sign up|signup)/.test(m)) {
      return 'Не вдалося зареєструватися';
    }
    if (/(invalid).*(code)/.test(m)) {
      return 'Невірний код підтвердження';
    }
    if (/(expired).*(code)/.test(m)) {
      return 'Код підтвердження прострочено';
    }
    if (/(too many|rate limit|429)/.test(m)) {
      return 'Забагато спроб. Спробуйте пізніше';
    }
    // Спеціальна обробка помилки бану
    if (/(заблоковано|блоковано|banned|blocked)/.test(m)) {
      return 'Нам шкода, але ваш акаунт було заблоковано адміністратором системи. Якщо ви вважаєте, що це помилка, зверніться до адміністратора для розблокування.';
    }
    if (!message || message.trim() === '') {
      return 'Сталася невідома помилка. Спробуйте пізніше';
    }
    return message;
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      console.log('useAuth: Checking authentication');
      const authenticated = await authService.checkAuth();
      console.log('useAuth: Authentication result:', authenticated);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('useAuth: Authentication check failed:', error);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    console.log('useAuth: Initial auth check');
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.login(credentials);
        console.log('useAuth: Login successful, setting token');
        authService.setToken(response.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_display_name', credentials.login);
        }
        setIsAuthenticated(true);
        router.push('/');
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(translateAuthError(errorMessage));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router, translateAuthError]
  );

  const register = useCallback(
    async (userData: RegisterRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.register(userData);
        authService.setToken(response.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_display_name', userData.fullName);
        }
        setIsAuthenticated(true);
        try {
          await authService.sendVerificationCode('uk');
        } catch {}
        router.push('/auth/verify-email');
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setError(translateAuthError(errorMessage));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router, translateAuthError]
  );

  const logout = useCallback(() => {
    authService.serverLogout();
    setIsAuthenticated(false);
    router.push('/auth/login');
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }
    try {
      return await authService.checkAdminStatus();
    } catch {
      return false;
    }
  }, [isAuthenticated]);

  return {
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    checkAuth,
    checkAdminStatus,
    sendVerificationCode: authService.sendVerificationCode.bind(authService),
    verifyEmailCode: authService.verifyEmailCode.bind(authService),
  };
};