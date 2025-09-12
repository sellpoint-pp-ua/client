"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import Header from '@/components/layout/Header';
import SiteFooter from '@/components/layout/SiteFooter';
import StoreRequestsList from '@/components/store/StoreRequestsList';

export default function RequestsPage() {
  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.push('/auth/login');
    }
  };

  const handleRequestUpdated = () => {};

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-100">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ваші заявки на магазини</h1>
            <p className="text-gray-600">Переглядайте та керуйте своїми заявками на створення магазину</p>
          </div>

          <div className="space-y-8">
            <StoreRequestsList onRequestUpdated={handleRequestUpdated} />
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => router.push('/store')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-3 text-sm hover:bg-blue-700 transition-colors"
            >
              Управляти магазинами
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}