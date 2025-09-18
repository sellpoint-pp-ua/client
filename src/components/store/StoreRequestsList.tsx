"use client";
import { useState, useEffect } from 'react';
import { storeService } from '@/services/storeService';
import { StoreRequest } from '@/types/store';
import EditRequestModal from './EditRequestModal';

interface StoreRequestsListProps {
  onRequestUpdated?: () => void;
}

export default function StoreRequestsList({ onRequestUpdated }: StoreRequestsListProps) {
  const [storeRequests, setStoreRequests] = useState<StoreRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StoreRequest | null>(null);

  useEffect(() => {
    loadStoreRequests();
  }, []);

  const loadStoreRequests = async () => {
    try {
      setIsLoading(true);
      
      const requestsResponse = await storeService.getRequestByMyId();
      console.log('Store requests response:', requestsResponse);
      
      let requests: StoreRequest[] = [];
      
      if (Array.isArray(requestsResponse)) {
        requests = requestsResponse as StoreRequest[];
      } else if (requestsResponse && typeof requestsResponse === 'object') {
        const response = requestsResponse as any;
        if (response.success && response.data) {
          requests = response.data as StoreRequest[];
        } else if (response.id) {
          requests = [response as StoreRequest];
        }
      }

      console.log('Processed requests:', requests);
      setStoreRequests(requests);
    } catch (error) {
      console.error('Error loading store requests:', error);
      setStoreRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю заявку?')) {
      return;
    }

    try {
      await storeService.deleteStoreRequest(requestId);
      await loadStoreRequests();
      if (onRequestUpdated) {
        onRequestUpdated();
      }
      alert('Заявку успішно видалено. Тепер ви можете створити нову заявку.');
    } catch (error) {
      console.error('Error deleting request:', error);
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


  const handleEditRequest = (request: StoreRequest) => {
    setSelectedRequest(request);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRequest(null);
  };

  const handleRequestUpdated = () => {
    loadStoreRequests();
    if (onRequestUpdated) {
      onRequestUpdated();
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

  if (storeRequests.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Ваші заявки на створення магазину</h3>
      {storeRequests.map((request) => (
        <div key={request.id} className={`rounded-xl border p-4 ${
          (() => {
            const requestStatus = getRequestStatus(request);
            return getStatusColor(requestStatus) === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                   getStatusColor(requestStatus) === 'green' ? 'bg-green-50 border-green-200' :
                   getStatusColor(requestStatus) === 'red' ? 'bg-red-50 border-red-200' :
                   'bg-gray-50 border-gray-200';
          })()
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {(() => {
              const requestStatus = getRequestStatus(request);
              return (
                <>
                  <div className={`w-3 h-3 rounded-full ${
                    getStatusColor(requestStatus) === 'yellow' ? 'bg-yellow-500' :
                    getStatusColor(requestStatus) === 'green' ? 'bg-green-500' :
                    getStatusColor(requestStatus) === 'red' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <h4 className="font-semibold text-gray-800">{request.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    getStatusColor(requestStatus) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    getStatusColor(requestStatus) === 'green' ? 'bg-green-100 text-green-800' :
                    getStatusColor(requestStatus) === 'red' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(requestStatus)}
                  </span>
                </>
              );
            })()}
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            <p>План: {request.plan === 0 ? 'Базовий' : request.plan === 1 ? 'Преміум' : 'Професійний'}</p>
            <p>Створено: {new Date(request.createdAt).toLocaleDateString('uk-UA')}</p>
            {request.adminComment && (
              <p className="mt-1 font-medium text-red-700">
                Коментар адміністратора: {request.adminComment}
              </p>
            )}
          </div>

          <div className="flex justify-center gap-2">
            {(() => {
              const requestStatus = getRequestStatus(request);
              if (requestStatus === 'pending') {
                return (
                  <>
                    <button
                      onClick={() => handleEditRequest(request)}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-yellow-600 text-yellow-700 px-4 py-2 text-sm hover:bg-yellow-100 transition-colors"
                    >
                      <span>Редагувати заявку</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-red-600 text-red-700 px-4 py-2 text-sm hover:bg-red-100 transition-colors"
                    >
                      <span>Видалити заявку</span>
                    </button>
                  </>
                );
              } else if (requestStatus === 'approved') {
                return (
                  <div className="text-center space-y-3">
                    <p className="text-sm text-green-700">
                      Ваш магазин було успішно створено та схвалено адміністратором.
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-red-600 text-red-700 px-4 py-2 text-sm hover:bg-red-100 transition-colors"
                      >
                        <span>Видалити заявку</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Після видалення заявки ви зможете створити нову.
                    </p>
                  </div>
                );
              } else if (requestStatus === 'rejected') {
                return (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-red-700 mb-3">
                      Вашу заявку було відхилено адміністратором. Ви можете видалити цю заявку та створити нову.
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-red-600 text-red-700 px-4 py-2 text-sm hover:bg-red-100 transition-colors"
                      >
                        <span>Видалити заявку</span>
                      </button>
                      <button
                        onClick={() => window.location.href = '/auth/store'}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10 transition-colors"
                      >
                        <span>Створити нову заявку</span>
                      </button>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      ))}
      
      <EditRequestModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        request={selectedRequest}
        onRequestUpdated={handleRequestUpdated}
      />
    </div>
  );
}
