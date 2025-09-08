"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import SiteFooter from '@/components/layout/SiteFooter';
import AccountSidebar from '@/components/account/AccountSidebar';
import { storeService } from '@/services/storeService';
import { authService } from '@/services/authService';
import { Store } from '@/types/store';

export default function StoreDetailsPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  useEffect(() => {
    if (storeId) {
      checkAuthAndLoadStore();
    }
  }, [storeId]);

  const checkAuthAndLoadStore = async () => {
    try {
      // Перевіряємо чи користувач авторизований
      const isAuthenticated = await authService.checkAuth();
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      await loadStore();
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.push('/auth/login');
    }
  };

  const loadStore = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const storeResponse = await storeService.getStoreById(storeId);
      console.log('Store response:', storeResponse);
      
      if (storeResponse.success && storeResponse.data) {
        setStore(storeResponse.data as Store);
      } else {
        setError('Магазин не знайдено');
      }
    } catch (err) {
      console.error('Error loading store:', err);
      setError('Помилка завантаження магазину');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanName = (plan: number) => {
    switch (plan) {
      case 0: return 'Базовий';
      case 1: return 'Преміум';
      case 2: return 'Професійний';
      default: return 'Невідомий';
    }
  };

  const handleDeleteStore = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цей магазин?')) {
      return;
    }

    try {
      await storeService.deleteStore(storeId);
      router.push('/requests');
      alert('Магазин успішно видалено');
    } catch (err) {
      console.error('Error deleting store:', err);
      alert('Помилка при видаленні магазину');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Завантаження магазину...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-100">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🏪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Магазин не знайдено</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => router.push('/requests')}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10 transition-colors"
              >
                Повернутися до заявок
              </button>
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
        <div className="mx-auto w-full max-w-[1510px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[270px] lg:flex-shrink-0">
              <AccountSidebar />
            </div>
            <div className="flex-1 -ml-2">
              {/* Store header */}
              <div className="rounded-xl bg-white p-6 shadow-sm mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {store.avatar ? (
                      <img
                        src={store.avatar.compressedUrl || store.avatar.sourceUrl}
                        alt={store.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-3xl">🏪</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h1>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">План:</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                            {getPlanName(store.plan)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Створено:</span>
                          <span className="text-sm text-gray-900">
                            {new Date(store.createdAt).toLocaleDateString('uk-UA')}
                          </span>
                        </div>
                        {store.roles && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Користувачів:</span>
                            <span className="text-sm text-gray-900">
                              {Object.keys(store.roles).length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => router.push(`/store/${store.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Управляти
                    </button>
                    <button
                      onClick={handleDeleteStore}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>

              {/* Store content */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Інформація про магазин</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Назва магазину</h3>
                    <p className="text-gray-900">{store.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">План підписки</h3>
                    <p className="text-gray-900">{getPlanName(store.plan)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Дата створення</h3>
                    <p className="text-gray-900">{new Date(store.createdAt).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  {store.updatedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Останнє оновлення</h3>
                      <p className="text-gray-900">{new Date(store.updatedAt).toLocaleDateString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
