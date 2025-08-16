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

  const checkAuth = useCallback(async () => {
    try {
      const authenticated = await authService.checkAuth();
      setIsAuthenticated(authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.login(credentials);
        authService.setToken(response.token);
        setIsAuthenticated(true);
        router.push('/');
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (userData: RegisterRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.register(userData);
        authService.setToken(response.token);
        setIsAuthenticated(true);
        router.push('/');
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    router.push('/auth/login');
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    checkAuth,
  };
};