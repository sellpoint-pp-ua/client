"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BuildingStorefrontIcon, 
  ClipboardDocumentListIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon, 
  XCircleIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { storeService } from '@/services/storeService';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { Store, StoreRequest } from '@/types/store';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeRequests, setStoreRequests] = useState<StoreRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stores' | 'requests'>('stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<StoreRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeUsers, setStoreUsers] = useState<any[]>([]);
  const [isLoadingStoreUsers, setIsLoadingStoreUsers] = useState(false);
  const [userDetails, setUserDetails] = useState<{[key: string]: any}>({});
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const isAuthenticated = await authService.checkAuth();
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      const isAdmin = await authService.checkAdminStatus();
      if (!isAdmin) {
        router.push('/');
        return;
      }
      
      await loadData();
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.push('/auth/login');
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const storesResponse = await storeService.getStores();
      console.log('Admin stores response:', storesResponse);
      
      if (Array.isArray(storesResponse)) {
        setStores(storesResponse as Store[]);
      } else if (storesResponse.success && storesResponse.data) {
        setStores(storesResponse.data as Store[]);
      } else {
        setStores([]);
      }

      const requestsResponse = await storeService.getAllRequests();
      console.log('Requests response:', requestsResponse);
      
      if (Array.isArray(requestsResponse)) {
        setStoreRequests(requestsResponse as StoreRequest[]);
      } else if (requestsResponse.success && requestsResponse.data) {
        setStoreRequests(requestsResponse.data as StoreRequest[]);
      } else {
        setStoreRequests([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Помилка завантаження даних');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await storeService.approveRequest(requestId);
      await loadData();
      alert('Заявку успішно схвалено');
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Помилка при схваленні заявки');
    }
  };

  const handleRejectRequest = async (request: StoreRequest) => {
    setRequestToReject(request);
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRequestToReject(null);
    setRejectReason('');
  };

  const confirmRejectRequest = async () => {
    if (!requestToReject || !rejectReason.trim()) {
      alert('Будь ласка, введіть причину відхилення');
      return;
    }

    setIsRejecting(true);
    try {
      await storeService.rejectRequest(requestToReject.id, rejectReason);
      await loadData();
      alert('Заявку успішно відхилено');
      closeRejectModal();
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Помилка при відхиленні заявки');
    } finally {
      setIsRejecting(false);
    }
  };

  const openStoreModal = async (store: Store) => {
    setSelectedStore(store);
    setIsStoreModalOpen(true);
    await fetchStoreUsers(store.id);
  };

  const closeStoreModal = () => {
    setSelectedStore(null);
    setIsStoreModalOpen(false);
    setStoreUsers([]);
    setUserDetails({});
  };

  const fetchStoreUsers = async (storeId: string) => {
    try {
      setIsLoadingStoreUsers(true);
      console.log('Loading store members for storeId:', storeId);
      
      const response = await storeService.getStoreMembers(storeId);
      console.log('Store members response:', response);
      
      let members: any[] = [];
      
      // Якщо це об'єкт з ролями (як повертає сервер)
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        // Перетворюємо об'єкт ролей в масив учасників
        members = Object.entries(response).map(([userId, role]) => ({
          id: userId,
          userId: userId,
          memberId: userId,
          role: role,
          roleName: getRoleName(role)
        }));
        console.log('Converted roles to members list:', members);
      } else if (Array.isArray(response)) {
        members = response as any[];
      } else if (response && typeof response === 'object') {
        if (response.success && response.data) {
          members = Array.isArray(response.data) ? response.data : [response.data];
        } else if ('id' in response || 'memberId' in response) {
          members = [response as any];
        }
      }
      
      setStoreUsers(members);
      
      // Завантажуємо деталі користувачів
      if (members.length > 0) {
        const userDetailsPromises = members.map(async (member) => {
          try {
            console.log(`Loading user details for ${member.userId}`);
            const userDetails = await userService.getUserById(member.userId);
            console.log(`Successfully loaded user details for ${member.userId}:`, userDetails);
            return { userId: member.userId, details: userDetails };
          } catch (err) {
            console.error(`Error loading user details for ${member.userId}:`, err);
            // Повертаємо базову інформацію навіть якщо API не працює
            return { 
              userId: member.userId, 
              details: {
                id: member.userId,
                username: `User ${member.userId.slice(-4)}`,
                fullName: `User ${member.userId.slice(-4)}`,
                email: null,
                avatar: null
              }
            };
          }
        });
        
        const userDetailsResults = await Promise.all(userDetailsPromises);
        const userDetailsMap: {[key: string]: any} = {};
        userDetailsResults.forEach(({ userId, details }) => {
          userDetailsMap[userId] = details;
        });
        
        console.log('Final user details map:', userDetailsMap);
        setUserDetails(userDetailsMap);
      }
    } catch (err) {
      console.error('Error fetching store users:', err);
      setStoreUsers([]);
    } finally {
      setIsLoadingStoreUsers(false);
    }
  };

  // Функція для отримання назви ролі
  const getRoleName = (role: any): string => {
    if (typeof role === 'string') {
      return role;
    }
    if (typeof role === 'number') {
      switch (role) {
        case 0: return 'Owner';
        case 1: return 'Manager';
        case 2: return 'Employee';
        default: return 'Unknown';
      }
    }
    return 'Unknown';
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей магазин?')) {
      return;
    }

    try {
      console.log('Attempting to delete store with ID:', storeId);
      console.log('Store ID type:', typeof storeId);
      console.log('Store ID length:', storeId.length);
      
      const result = await storeService.deleteStore(storeId);
      console.log('Delete store result:', result);
      
      await loadData();
      alert('Магазин успішно видалено');
    } catch (err) {
      console.error('Error deleting store:', err);
      alert('Помилка при видаленні магазину');
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

  const filteredRequests = storeRequests.filter(request => {
    const requestStatus = getRequestStatus(request);
    const matchesSearch = 
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || requestStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Завантаження...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-2xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Магазини</h1>
          <p className="text-gray-600">Огляд всіх магазинів та заявок на створення</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Всього магазинів</p>
                <p className="text-xl font-semibold text-gray-900">{stores.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClipboardDocumentListIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Заявок на розгляді</p>
                <p className="text-xl font-semibold text-gray-900">
                  {storeRequests.filter(r => getRequestStatus(r) === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Схвалені заявки</p>
                <p className="text-xl font-semibold text-gray-900">
                  {storeRequests.filter(r => getRequestStatus(r) === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Відхилені заявки</p>
                <p className="text-xl font-semibold text-gray-900">
                  {storeRequests.filter(r => getRequestStatus(r) === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('stores')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stores'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Магазини ({stores.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Заявки ({storeRequests.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Пошук та фільтри для заявок */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Пошук */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Пошук заявок..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Фільтр за статусом */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterType)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Всі статуси</option>
                  <option value="pending">На розгляді</option>
                  <option value="approved">Схвалені</option>
                  <option value="rejected">Відхилені</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'stores' ? (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                  Список магазинів ({stores.length})
              </h2>
            </div>
          </div>
          
            {stores.length === 0 ? (
              <div className="text-center py-12">
                <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Магазинів не знайдено</h3>
                <p className="mt-1 text-sm text-gray-500">Список магазинів порожній</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Магазин
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        План
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата створення
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Користувачів
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дії
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              {store.avatar ? (
                                <img
                                  src={store.avatar.compressedUrl || store.avatar.sourceUrl}
                                  alt={store.name}
                                  className="h-8 w-8 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-lg bg-gray-300 flex items-center justify-center">
                                  <BuildingStorefrontIcon className="h-4 w-4 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                                {store.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-32">
                                ID: {store.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getPlanName(store.plan)}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {new Date(store.createdAt).toLocaleDateString('uk-UA')}
                          </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <UserIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                              {store.roles ? Object.keys(store.roles).length : 0}
                          </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openStoreModal(store)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Деталі
                            </button>
                            
                                <button
                              onClick={() => handleDeleteStore(store.id)}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                                >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Видалити
                                </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Список заявок ({filteredRequests.length})
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <FunnelIcon className="h-4 w-4 mr-1" />
                  Фільтровано
                </div>
              </div>
            </div>
            
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Заявок не знайдено</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Спробуйте змінити пошуковий запит або фільтри' 
                    : 'Список заявок порожній'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Заявка
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        План
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Користувач
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата подачі
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дії
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                            {request.name}
                                </div>
                          <div className="text-xs text-gray-500 truncate max-w-32">
                            ID: {request.id}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getPlanName(request.plan)}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <UserIcon className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900 truncate max-w-32">
                              {request.userId}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                              {new Date(request.createdAt).toLocaleDateString('uk-UA')}
                          </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {(() => {
                            const requestStatus = getRequestStatus(request);
                            return (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                getStatusColor(requestStatus) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                getStatusColor(requestStatus) === 'green' ? 'bg-green-100 text-green-800' :
                                getStatusColor(requestStatus) === 'red' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {getStatusText(requestStatus)}
                          </span>
                            );
                          })()}
                        </td>

                        <td className="px-4 py-3 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {(() => {
                              const requestStatus = getRequestStatus(request);
                              if (requestStatus === 'pending') {
                                return (
                                  <>
                                    <button
                                      onClick={() => handleApproveRequest(request.id)}
                                      className="text-green-600 hover:text-green-900 flex items-center"
                                    >
                                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                                      Схвалити
                                    </button>
                                    
                          <button
                                      onClick={() => handleRejectRequest(request)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                                      <XCircleIcon className="h-4 w-4 mr-1" />
                                      Відхилити
                          </button>
                                  </>
                                );
                              } else {
                                return (
                                  <span className="text-gray-400 text-xs">
                                    {getStatusText(requestStatus)}
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>
        )}
      </div>

      {/* Модальне вікно для відхилення заявки */}
      {isRejectModalOpen && requestToReject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Відхилення заявки
                </h3>
                <button
                  onClick={closeRejectModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Ви дійсно хочете відхилити заявку <strong>{requestToReject.name}</strong>?
                  </p>
                  <p className="text-xs text-gray-500">
                    Користувач отримає повідомлення про відхилення з вказаною причиною.
                  </p>
                </div>

                <div>
                  <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Причина відхилення *
                  </label>
                  <textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Вкажіть причину відхилення..."
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeRejectModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  disabled={isRejecting}
                >
                  Скасувати
                </button>
                <button
                  onClick={confirmRejectRequest}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={isRejecting}
                >
                  {isRejecting ? 'Відхилення...' : 'Відхилити заявку'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно з детальною інформацією про магазин */}
      {isStoreModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Детальна інформація про магазин
                </h3>
                <button
                  onClick={closeStoreModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Основна інформація */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    {selectedStore.avatar ? (
                      <img
                        src={selectedStore.avatar.compressedUrl || selectedStore.avatar.sourceUrl}
                        alt={selectedStore.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-300 flex items-center justify-center">
                        <BuildingStorefrontIcon className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedStore.name}
                    </h4>
                    <p className="text-sm text-gray-500">ID: {selectedStore.id}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getPlanName(selectedStore.plan)}
                    </span>
                  </div>
                </div>

                {/* Дата створення */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Дата створення</h5>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{formatDate(selectedStore.createdAt)}</span>
                  </div>
                </div>

                {/* Користувачі магазину */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Користувачі магазину</h5>
                  {isLoadingStoreUsers ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-600">Завантаження...</p>
                    </div>
                  ) : storeUsers.length > 0 ? (
                    <div className="space-y-3">
                      {storeUsers.map((user) => {
                        const roleName = user.roleName || getRoleName(user.role);
                        const roleBadgeColor = user.role === 0 ? 'bg-yellow-100 text-yellow-800' : 
                                             user.role === 1 ? 'bg-blue-100 text-blue-800' : 
                                             'bg-gray-100 text-gray-800';
                        
                        const memberDetails = userDetails[user.userId];
                        const displayName = memberDetails?.fullName || memberDetails?.name || memberDetails?.username || `User ${user.userId.slice(-4)}`;
                        const email = memberDetails?.email;
                        const avatar = memberDetails?.avatar;
                        
                        return (
                          <div key={user.id} className="bg-gray-50 border border-gray-200 rounded-md p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {avatar?.sourceUrl ? (
                                    <img
                                      src={avatar.sourceUrl}
                                      alt={displayName}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <span className="text-gray-600 text-sm font-medium">
                                        {displayName?.charAt(0)?.toUpperCase() || '?'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {displayName}
                                    </p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor}`}>
                                      {roleName}
                                    </span>
                                  </div>
                                  <div className="mt-1">
                                    <p className="text-xs text-gray-500 truncate">
                                      ID: {user.id}
                                    </p>
                                    {email && (
                                      <p className="text-xs text-gray-500 truncate">
                                        {email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Користувачі не знайдені</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeStoreModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Закрити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}