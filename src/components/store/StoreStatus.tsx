"use client";
import { useState, useEffect } from 'react';
import { storeService } from '@/services/storeService';
import { StoreRequest, Store } from '@/types/store';

interface StoreStatusProps {
  onStoreCreated?: () => void;
}

export default function StoreStatus({ onStoreCreated }: StoreStatusProps) {
  const [storeRequests, setStoreRequests] = useState<StoreRequest[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setIsLoading(true);
      
      // Завантажуємо заявки користувача
      try {
        const requestsResponse = await storeService.getRequestByMyId();
        console.log('Store requests response:', requestsResponse);
        
        const response = requestsResponse as any;
        if (response.success && response.data) {
          setStoreRequests(response.data as StoreRequest[]);
        } else if (Array.isArray(requestsResponse)) {
          // Якщо API повертає масив безпосередньо
          setStoreRequests(requestsResponse as StoreRequest[]);
        } else {
          setStoreRequests([]);
        }
      } catch (error) {
        // 404 означає що заявок немає - це нормально
        console.log('No store requests found (404 is expected for new users)');
        setStoreRequests([]);
      }

      // Завантажуємо магазини користувача (якщо заявка схвалена)
      try {
        const storesResponse = await storeService.getStores();
        console.log('User stores response:', storesResponse);
        
        if (storesResponse.success && storesResponse.data) {
          setStores(storesResponse.data as Store[]);
        } else if (Array.isArray(storesResponse)) {
          setStores(storesResponse as Store[]);
        } else {
          setStores([]);
        }
      } catch (error) {
        console.log('Could not load user stores:', error);
        setStores([]);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
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
      await loadStoreData();
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Помилка при видаленні магазину');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю заявку?')) {
      return;
    }

    try {
      await storeService.deleteStoreRequest(requestId);
      await loadStoreData();
      if (onStoreCreated) {
        onStoreCreated();
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Помилка при видаленні заявки');
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

  const pendingRequest = storeRequests.find(req => req.status === 'pending');
  const approvedRequest = storeRequests.find(req => req.status === 'approved');
  const rejectedRequest = storeRequests.find(req => req.status === 'rejected');
  
  // Перевіряємо чи користувач може створити нову заявку
  // Для звичайних користувачів перевіряємо тільки заявки
  const canCreateNewRequest = !pendingRequest && !approvedRequest;

  return (
    <div className="space-y-4">
      {/* Pending Request */}
      {pendingRequest && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <h3 className="font-semibold text-yellow-800">Заявка на розгляді</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-4">
            Ваша заявка на створення магазину "{pendingRequest.name}" розглядається адміністратором.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => window.location.href = `/auth/store?edit=${pendingRequest.id}`}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-yellow-600 text-yellow-700 px-4 py-2 text-sm hover:bg-yellow-100 transition-colors"
            >
              <span>Редагувати заявку</span>
            </button>
            <button
              onClick={() => handleDeleteRequest(pendingRequest.id)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-red-600 text-red-700 px-4 py-2 text-sm hover:bg-red-100 transition-colors"
            >
              <span>Видалити заявку</span>
            </button>
          </div>
        </div>
      )}

      {/* Approved Request */}
      {approvedRequest && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-green-800">Магазин успішно створено!</h3>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Ваш магазин "{approvedRequest.name}" було успішно створено та схвалено адміністратором.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/store'}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-2 text-sm hover:bg-green-700 transition-colors"
            >
              <span>Управляти магазином</span>
            </button>
          </div>
        </div>
      )}

      {/* Rejected Request */}
      {rejectedRequest && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <h3 className="font-semibold text-red-800">Заявку відхилено</h3>
          </div>
          <p className="text-sm text-red-700">
            На жаль, не вийшло створити магазин. Заявку відхилив адміністратор.
            {rejectedRequest.adminComment && (
              <span className="block mt-1 font-medium">
                Коментар: {rejectedRequest.adminComment}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Existing Stores - показуємо тільки якщо є магазини */}
      {stores.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Ваші магазини</h3>
          <div className="space-y-2">
            {stores.map((store) => (
              <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{store.name}</p>
                  <p className="text-sm text-gray-500">
                    План: {store.plan === 0 ? 'Базовий' : store.plan === 1 ? 'Преміум' : 'Професійний'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteStore(store.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  Видалити
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No active requests */}
      {!pendingRequest && !approvedRequest && !rejectedRequest && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h3 className="font-semibold text-blue-800">Готові створити магазин?</h3>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            У вас поки немає заявок на створення магазину. Натисніть кнопку нижче, щоб подати заявку.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/auth/store'}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              <span>Створити заявку на магазин</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
