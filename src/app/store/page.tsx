"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storeService } from '@/services/storeService';
import { authService } from '@/services/authService';
import { Store, StoreRequest } from '@/types/store';
import Header from '@/components/layout/Header';
import SiteFooter from '@/components/layout/SiteFooter';

export default function StoreManagementPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [storeRequests, setStoreRequests] = useState<StoreRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadStore();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadStore();
    }
  }, [currentUserId]);

  const checkAuthAndLoadStore = async () => {
    try {
      // Перевіряємо чи користувач авторизований
      const isAuthenticated = await authService.checkAuth();
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // Завантажуємо користувача
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

  const loadStore = async () => {
    if (!currentUserId) {
      setError('Не вдалося завантажити інформацію про користувача');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Завантажуємо магазини та заявки паралельно
      const [storesResponse, requestsResponse] = await Promise.all([
        storeService.getMyStores(),
        storeService.getRequestByMyId()
      ]);
      
      console.log('User stores response:', storesResponse);
      console.log('User requests response:', requestsResponse);
      
      // Обробляємо магазини
      let allStores: Store[] = [];
      if (Array.isArray(storesResponse)) {
        allStores = storesResponse as Store[];
      } else if (storesResponse.success && storesResponse.data) {
        allStores = storesResponse.data as Store[];
      }

      // Фільтруємо магазини за ID користувача
      const stores = allStores.filter(store => {
        return store.roles && store.roles[currentUserId] !== undefined;
      });

      // Обробляємо заявки
      let requests: StoreRequest[] = [];
      if (Array.isArray(requestsResponse)) {
        requests = requestsResponse as StoreRequest[];
      } else if (requestsResponse && typeof requestsResponse === 'object') {
        const response = requestsResponse as any;
        if (response.success && response.data) {
          requests = response.data as StoreRequest[];
        } else if (response.id) {
          // Одна заявка як об'єкт
          requests = [{
            id: response.id ?? '',
            name: response.name ?? '',
            plan: response.plan ?? 0,
            userId: response.userId ?? '',
            status: response.status ?? 'pending',
            createdAt: response.createdAt ?? '',
            updatedAt: response.updatedAt,
            adminId: response.adminId,
            adminComment: response.adminComment,
            fileUrl: response.fileUrl,
            approvedByAdminId: response.approvedByAdminId,
            rejectedByAdminId: response.rejectedByAdminId,
            avatar: response.avatar,
          }];
        }
      }

      setStoreRequests(requests);

      if (stores.length === 0) {
        setError('У вас немає магазинів');
        return;
      }

      // Якщо є тільки один магазин, показуємо його
      if (stores.length === 1) {
        setStore(stores[0]);
        return;
      }

      // Якщо є кілька магазинів, перенаправляємо на /stores
      router.push('/stores');
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
      router.push('/stores');
      alert('Магазин успішно видалено');
    } catch (err) {
      console.error('Error deleting store:', err);
      alert('Помилка при видаленні магазину');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю заявку?')) {
      return;
    }

    try {
      await storeService.deleteStoreRequest(requestId);
      await loadStore();
      alert('Заявку успішно видалено. Тепер ви можете створити нову заявку.');
    } catch (err) {
      console.error('Error deleting request:', err);
      alert('Помилка при видаленні заявки');
    }
  };

  const getRequestStatus = (request: StoreRequest) => {
    if (request.approvedByAdminId) return 'approved';
    if (request.rejectedByAdminId) return 'rejected';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'На розгляді';
      case 'approved': return 'Схвалено';
      case 'rejected': return 'Відхилено';
      default: return 'Невідомо';
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
                Перейти до заявок
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
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Управління магазином</h1>
            <p className="text-gray-600">Керуйте своїм магазином та його налаштуваннями</p>
          </div>

          {/* Магазин */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {store.avatar ? (
                        <img
                          src={store.avatar.compressedUrl || store.avatar.sourceUrl}
                          alt={store.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-2xl">🏪</span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{store.name}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">План:</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
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
                  onClick={() => router.push(`/stores/${store.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                  Деталі
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                </div>

          {/* Заявки */}
          {storeRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ваші заявки на створення магазину</h3>
              <div className="space-y-4">
                {storeRequests.map((request) => {
                  const requestStatus = getRequestStatus(request);
                  return (
                    <div key={request.id} className={`rounded-lg border p-4 ${
                      getStatusColor(requestStatus) === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                      getStatusColor(requestStatus) === 'green' ? 'bg-green-50 border-green-200' :
                      getStatusColor(requestStatus) === 'red' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{request.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              getStatusColor(requestStatus) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              getStatusColor(requestStatus) === 'green' ? 'bg-green-100 text-green-800' :
                              getStatusColor(requestStatus) === 'red' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getStatusText(requestStatus)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p>План: {getPlanName(request.plan)}</p>
                            <p>Створено: {new Date(request.createdAt).toLocaleDateString('uk-UA')}</p>
                            {request.adminComment && (
                              <p className="mt-1 font-medium text-red-700">
                                Коментар адміністратора: {request.adminComment}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {requestStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => window.location.href = `/auth/store?edit=${request.id}`}
                                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                              >
                                Редагувати
                              </button>
                              <button
                                onClick={() => handleDeleteRequest(request.id)}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Видалити
                              </button>
                            </>
                          )}
                          {requestStatus === 'approved' && (
                            <span className="text-sm text-green-600 font-medium">
                              Магазин створено
                            </span>
                          )}
                          {requestStatus === 'rejected' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDeleteRequest(request.id)}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Видалити
                              </button>
                              <button
                                onClick={() => window.location.href = '/auth/store'}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Створити нову
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Кнопка створення нової заявки */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Створити нову заявку</h3>
              <p className="text-gray-600 mb-4">Подайте заявку на створення додаткового магазину</p>
              <button
                onClick={() => window.location.href = '/auth/store'}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10 transition-colors"
              >
                <span className="text-lg leading-none">+</span>
                <span>Створити заявку на магазин</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

