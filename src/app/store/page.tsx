"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storeService } from '@/services/storeService';
import { authService } from '@/services/authService';
import { Store } from '@/types/store';
import Header from '@/components/layout/Header';

export default function StoreManagementPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadStores();
    }
  }, [currentUserId]);

  const checkAuthAndLoad = async () => {
    try {
      const isAuthenticated = await authService.checkAuth();
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      await loadCurrentUser();
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.push('/auth/login');
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await storeService.getCurrentUser();
      console.log('Current user:', user);
      setCurrentUserId(user.id || user.userId || user.Id || user.ID || user._id);
    } catch (error) {
      console.error('Could not load current user:', error);
      setCurrentUserId(null);
    }
  };

  const loadStores = async () => {
    if (!currentUserId) {
      setError('Не вдалося завантажити інформацію про користувача');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const storesResponse = await storeService.getMyStores();
      console.log('User stores response:', storesResponse);

      let allStores: Store[] = [];
      if (Array.isArray(storesResponse)) {
        allStores = storesResponse as Store[];
      } else if (storesResponse.success && storesResponse.data) {
        allStores = storesResponse.data as Store[];
      }

      const myStores = allStores.filter(store => {
        return store.roles && store.roles[currentUserId] !== undefined;
      });
      if (myStores.length === 0) {
        setError('У вас немає магазинів');
        setStores([]);
        return;
      }
      setStores(myStores);
    } catch (err) {
      console.error('Error loading store:', err);
      setError('Помилка завантаження магазину');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей магазин?')) {
      return;
    }

    try {
      await storeService.deleteStore(storeId);
      await loadStores();
      alert('Магазин успішно видалено');
    } catch (err) {
      console.error('Error deleting store:', err);
      alert('Помилка при видаленні магазину');
    }
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-100">
        <Header />
        <main className="flex-1 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Завантаження магазинів...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-100">
        <Header />
        <main className="flex-1 bg-gray-100">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🏪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Магазин не знайдено</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button onClick={() => router.push('/requests')} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10 transition-colors">Перейти до заявок</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ваші магазини</h1>
            <p className="text-gray-600">Оберіть магазин для управління</p>
          </div>

          {stores.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow-sm border text-center">
              <div className="text-5xl mb-3">🏪</div>
              <p className="text-gray-600 mb-4">У вас поки немає магазинів</p>
              <button onClick={() => router.push('/requests')} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10 transition-colors">Подати заявку</button>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.map((store) => (
                <div key={store.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-4">
                    {store.avatar ? (
                      <img src={store.avatar.compressedUrl || store.avatar.sourceUrl} alt={store.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center"><span className="text-xl">🏪</span></div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{store.name}</h4>
                      <p className="text-xs text-gray-400">Створено: {new Date(store.createdAt).toLocaleDateString('uk-UA')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => router.push(`/store/${store.id}`)} className="px-3 py-1 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">Управляти</button>
                    <button onClick={() => handleDeleteStore(store.id)} className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors">Видалити</button>
                  </div>
                </div>) )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

