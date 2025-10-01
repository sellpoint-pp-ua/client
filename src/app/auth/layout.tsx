"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await authService.checkAuth();
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Перевірка авторизації...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

