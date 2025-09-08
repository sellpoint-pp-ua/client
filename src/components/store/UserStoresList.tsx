"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storeService } from '@/services/storeService';
import { Store } from '@/types/store';

interface UserStoresListProps {
  onStoreUpdated?: () => void;
}

export default function UserStoresList({ onStoreUpdated }: UserStoresListProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadStores();
    }
  }, [currentUserId]);

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
      setStores([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const storesResponse = await storeService.getMyStores();
      console.log('User stores response:', storesResponse);
      
      let allStores: Store[] = [];
      if (Array.isArray(storesResponse)) {
        allStores = storesResponse as Store[];
      } else if (storesResponse.success && storesResponse.data) {
        allStores = storesResponse.data as Store[];
      }

      // Фільтруємо магазини за ID користувача
      const userStores = allStores.filter(store => {
        // Перевіряємо чи користувач є власником магазину через roles
        return store.roles && store.roles[currentUserId] !== undefined;
      });

      console.log('Filtered user stores:', userStores);
      setStores(userStores);
    } catch (error) {
      console.log('Could not load user stores:', error);
      setStores([]);
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
      if (onStoreUpdated) {
        onStoreUpdated();
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Помилка при видаленні магазину');
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

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return null; // Не показуємо нічого, якщо немає магазинів
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Ваші магазини</h3>
      <div className="space-y-3">
        {stores.map((store) => (
          <div key={store.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4">
              {store.avatar ? (
                <img
                  src={store.avatar.compressedUrl || store.avatar.sourceUrl}
                  alt={store.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-xl">🏪</span>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900">{store.name}</h4>
                <p className="text-sm text-gray-500">
                  План: {getPlanName(store.plan)}
                </p>
                <p className="text-xs text-gray-400">
                  Створено: {new Date(store.createdAt).toLocaleDateString('uk-UA')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/store/${store.id}`)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Управляти
              </button>
              <button
                onClick={() => handleDeleteStore(store.id)}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
