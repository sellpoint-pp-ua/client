"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import { storeService } from '@/services/storeService';
import { Store } from '@/types/store';

type MenuKey = 'home' | 'products' | 'members' | 'settings' | 'analytics' | 'plans';

export default function StoreDashboardPage() {
  const params = useParams();
  const storeId = params.id as string;
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MenuKey>('home');
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (storeId) {
      checkAuthAndLoad();
    }
  }, [storeId]);

  const checkAuthAndLoad = async () => {
    try {
      const isAuthenticated = await authService.checkAuth();
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      await loadStore();
    } catch (err) {
      console.error('Error checking auth status:', err);
      router.push('/auth/login');
    }
  };

  const loadStore = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await storeService.getStoreById(storeId);
      const maybeAny = response as any;
      if (maybeAny && typeof maybeAny === 'object') {
        if (maybeAny.success && maybeAny.data) {
          setStore(maybeAny.data as Store);
        } else if (maybeAny.id) {
          setStore(maybeAny as Store);
        } else {
          setError('Магазин не знайдено');
        }
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

  const MenuItem = ({ keyId, label, icon }: { keyId: MenuKey; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(keyId)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        activeTab === keyId ? 'bg-[#eef0ff] text-[#3046b4]' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const TopInfo = () => (
    <div className="rounded-xl bg-white p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {store?.avatar ? (
            <img
              src={store.avatar.compressedUrl || store.avatar.sourceUrl}
              alt={store?.name || 'Store avatar'}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{store?.name || 'Магазин'}</h1>
            <p className="text-sm text-gray-500">ID: {store?.id}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const HomeContent = () => (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🧑‍💻</div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Вітаємо в панелі магазину!</h2>
            <p className="text-sm text-gray-600">Почніть продавати вже сьогодні:</p>
            <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Додайте картку або рахунок для отримання оплат</li>
              <li>Додайте товари з якісними фото та описом</li>
              <li>Активуйте просування та слідкуйте за аналітикою</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="rounded-xl bg-white p-0 shadow-sm border overflow-hidden">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold text-gray-900">Почніть роботу</h3>
        </div>
        <div className="divide-y">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <p className="text-sm font-medium text-gray-900">Додайте картку або рахунок, щоб отримувати гроші</p>
                </div>
                <p className="text-sm text-gray-600">Ми автоматично включимо безпечний спосіб оплати.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-700">Додати картку</button>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Додайте товари</p>
                <p className="text-sm text-gray-600">Заповніть дані, додайте фото та варіації товарів, щоб почати продавати.</p>
              </div>
              <button onClick={() => setActiveTab('products')} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Додати</button>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Продавайте та сплачуйте комісію лише за успішні замовлення</p>
                <p className="text-sm text-gray-600">Поповнюйте баланс у разі списань за замовлення.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Placeholder = ({ title }: { title: string }) => (
    <div className="rounded-xl bg-white p-10 shadow-sm border text-center text-gray-600">{title} — розділ у розробці</div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-100">
        <Header />
        <main className="flex-1 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Завантаження...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-100">
        <Header />
        <main className="flex-1 bg-gray-100">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🏪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Магазин не знайдено</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button onClick={() => router.push('/store')} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10 transition-colors">Повернутися</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      {/* Mobile burger button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border"
        aria-label="Toggle sidebar"
      >
        <span className="text-gray-600">☰</span>
      </button>

      {/* Mobile drawer sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 text-white shadow-xl border-r border-gray-800 p-4">
            <div className="flex items-center gap-3 mb-4">
              {store?.avatar ? (
                <img src={store.avatar.compressedUrl || store.avatar.sourceUrl} alt={store?.name || 'Store avatar'} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center"><span>🏪</span></div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{store?.name || 'Магазин'}</div>
                <div className="text-xs text-white/70 truncate">ID: {store?.id}</div>
              </div>
            </div>
            <nav className="space-y-1">
              <button onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'home' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>🏠<span className="ml-3">Головна</span></button>
              <button onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'products' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>🧾<span className="ml-3">Товари</span></button>
              <button onClick={() => { setActiveTab('members'); setIsSidebarOpen(false); }} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'members' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>👥<span className="ml-3">Учасники магазину</span></button>
              <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>⚙️<span className="ml-3">Налаштування</span></button>
              <button onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>📈<span className="ml-3">Аналітика</span></button>
              <button onClick={() => { setActiveTab('plans'); setIsSidebarOpen(false); }} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'plans' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>💳<span className="ml-3">Тарифи</span></button>
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop side-by-side layout */}
      <div className="hidden lg:flex w-full">
        <aside className="w-64 bg-gray-900 text-white flex-shrink-0 min-h-[calc(100vh-64px)] border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {store?.avatar ? (
                <img src={store.avatar.compressedUrl || store.avatar.sourceUrl} alt={store?.name || 'Store avatar'} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center"><span>🏪</span></div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{store?.name || 'Магазин'}</div>
                <div className="text-xs text-white/70 truncate">ID: {store?.id}</div>
              </div>
            </div>
          </div>
          <nav className="px-4 py-3 space-y-1">
            <button onClick={() => setActiveTab('home')} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'home' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>🏠<span className="ml-3">Головна</span></button>
            <button onClick={() => setActiveTab('products')} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'products' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>🧾<span className="ml-3">Товари</span></button>
            <button onClick={() => setActiveTab('members')} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'members' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>👥<span className="ml-3">Учасники магазину</span></button>
            <button onClick={() => setActiveTab('settings')} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>⚙️<span className="ml-3">Налаштування</span></button>
            <button onClick={() => setActiveTab('analytics')} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>📈<span className="ml-3">Аналітика</span></button>
            <button onClick={() => setActiveTab('plans')} className={`group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'plans' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>💳<span className="ml-3">Тарифи</span></button>
          </nav>
        </aside>

        <main className="flex-1 bg-gray-50">
          <div className="mx-auto w-full max-w-[1510px] px-6 py-6">
            {activeTab === 'home' && <HomeContent />}
            {activeTab === 'products' && <Placeholder title="Товари" />}
            {activeTab === 'members' && <Placeholder title="Учасники магазину" />}
            {activeTab === 'settings' && <Placeholder title="Налаштування" />}
            {activeTab === 'analytics' && <Placeholder title="Аналітика" />}
            {activeTab === 'plans' && <Placeholder title="Тарифи" />}
          </div>
        </main>
      </div>
    </div>
  );
}


