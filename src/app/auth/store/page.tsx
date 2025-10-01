"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storeService } from '@/services/storeService';
import { authService } from '@/services/authService';
import Header from '@/components/layout/Header';
import SiteFooter from '@/components/layout/SiteFooter';

export default function CreateStorePage() {
  const [formData, setFormData] = useState({
    name: '',
    file: undefined as File | undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndAdminStatus();
  }, []);

  const checkAuthAndAdminStatus = async () => {
    try {
      const isAuthenticated = await authService.checkAuth();
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      const adminStatus = await authService.checkAdminStatus();
      setIsAdmin(adminStatus);
      if (adminStatus) {
        alert('Адміністратори не можуть створювати магазини');
        router.push('/favorites');
        return;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.push('/auth/login');
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Назва магазину обов\'язкова');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await storeService.createStore({
        name: formData.name,
        plan: 0, 
        file: formData.file
      });
      
      alert('Заявку на створення магазину успішно подано!');
      router.push('/favorites');
    } catch (err) {
      if (err instanceof Error && err.message.includes('UserId must be unique')) {
        setError('У вас вже є заявка на створення магазину або магазин вже створено');
      } else {
        setError(err instanceof Error ? err.message : 'Помилка при створенні заявки');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Перевірка прав доступу...</p>
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
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Створити заявку на магазин</h1>
              <p className="text-gray-600">Заповніть форму для створення заявки на відкриття магазину</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Назва магазину *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введіть назву магазину"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Логотип магазину (опціонально)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Рекомендований розмір: 200x200px. Підтримуються формати: JPG, PNG, WebP
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-600 text-sm">{error}</div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/favorites')}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={isLoading}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Створення заявки...' : 'Створити заявку'}
                </button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Що далі?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ваша заявка буде розглянута адміністратором</li>
                <li>• Ви отримаєте повідомлення про рішення на сторінці "Обране"</li>
                <li>• Після схвалення ви зможете керувати своїм магазином</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
