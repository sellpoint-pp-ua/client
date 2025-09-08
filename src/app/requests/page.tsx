"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storeService } from '@/services/storeService';
import { authService } from '@/services/authService';
import { StoreRequest } from '@/types/store';
import Header from '@/components/layout/Header';
import SiteFooter from '@/components/layout/SiteFooter';
import EditRequestModal from '@/components/store/EditRequestModal';
import UserStoresList from '@/components/store/UserStoresList';
import StoreRequestsList from '@/components/store/StoreRequestsList';

export default function RequestsPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StoreRequest | null>(null);
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

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRequest(null);
  };

  const handleRequestUpdated = () => {
    // Оновлення буде оброблено в дочірніх компонентах
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Управління заявками та магазинами</h1>
            <p className="text-gray-600">Переглядайте та керуйте своїми заявками на створення магазину та існуючими магазинами</p>
          </div>

          <div className="space-y-8">
            {/* Список існуючих магазинів */}
            <UserStoresList />

            {/* Список заявок на створення магазину */}
            <StoreRequestsList onRequestUpdated={handleRequestUpdated} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}