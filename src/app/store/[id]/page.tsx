"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import { storeService } from '@/services/storeService';
import { userService } from '@/services/userService';
import { Store } from '@/types/store';
import { productService } from '@/services/productService';
import { Product, ProductInput, ProductUpdateInput } from '@/types/product';
import { Category } from '@/types/category';
import Image from 'next/image';

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
  const [members, setMembers] = useState<any[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<{[key: string]: any}>({});
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  const getUserRoleInStore = (userId: string): string | null => {
    const member = members.find(m => (m.memberId || m.id || m.userId || m.UserId || m.Id) === userId);
    if (!member) return null;
    return member.roleName || getRoleName(member.role) || null;
  };

  const canRemoveMember = (memberId: string): boolean => {
    if (!currentUser || !currentUserId) return false;
    
    if (memberId === currentUserId) return false;
    
    if (currentUser.roles && currentUser.roles.includes('admin')) return true;
    
    const currentUserRole = getUserRoleInStore(currentUserId);
    console.log('Current user role:', currentUserRole, 'for user:', currentUserId);
    if (currentUserRole === 'Owner') return true;
    
    if (currentUserRole === 'Manager') {
      return false;
    }
    
    return false;
  };

  const canLeaveStore = (memberId: string): boolean => {
    if (!currentUser || !currentUserId) return false;
    
    if (memberId !== currentUserId) return false;
    
    const currentUserRole = getUserRoleInStore(currentUserId);
    return currentUserRole === 'Manager';
  };
  const [memberIdInput, setMemberIdInput] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<ProductInput>>({
    name: '',
    category: '',
    price: 0,
    priceType: 0,
    paymentOptions: 1,
    discountPrice: 0,
    quantity: 0,
    deliveryType: 1,
    description: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const productNameRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; label: string }[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [productFeatures, setProductFeatures] = useState<Array<{
    category: string;
    features: Array<{ key: string; value: string }>;
  }>>([
    { category: 'Основні', features: [{ key: '', value: '' }] },
  ]);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      checkAuthAndLoad();
    }
  }, [storeId]);

  useEffect(() => {
    console.log('useEffect triggered - storeId:', storeId, 'currentUserId:', currentUserId, 'isLoading:', isLoading, 'hasAccess:', hasAccess);
    if (storeId && currentUserId && !isLoading && hasAccess === null) {
      console.log('All conditions met, checking access for user:', currentUserId);
      checkStoreAccess();
    } else {
      console.log('Conditions not met for access check - storeId:', !!storeId, 'currentUserId:', !!currentUserId, 'isLoading:', isLoading, 'hasAccess:', hasAccess);
    }
  }, [storeId, currentUserId, isLoading, hasAccess]);

  const checkAuthAndLoad = async () => {
    try {
      const isAuthenticated = await authService.checkAuth();
      if (!isAuthenticated) {
        console.log('User not authenticated, setting access to false');
        setHasAccess(false);
        setAccessCheckLoading(false);
        return;
      }
      
      await Promise.all([loadStore(), loadCurrentUser()]);
      
      console.log('Auth and load completed, currentUserId:', currentUserId);
    } catch (err) {
      console.error('Error checking auth status:', err);
      console.log('Error in auth check, setting access to false');
      setHasAccess(false);
      setAccessCheckLoading(false);
    }
  };

  const checkStoreAccess = async () => {
    console.log('checkStoreAccess called with storeId:', storeId, 'currentUserId:', currentUserId);
    
    if (!storeId || !currentUserId) {
      console.log('Missing storeId or currentUserId, setting access to false');
      setHasAccess(false);
      setAccessCheckLoading(false);
      return;
    }

    try {
      setAccessCheckLoading(true);
      console.log('Starting access check...');
      
      const isAdmin = await authService.checkAdminStatus();
      console.log('Admin check result:', isAdmin);
      
      if (isAdmin) {
        console.log('User is admin, granting access to store');
        setHasAccess(true);
        setAccessCheckLoading(false);
        return;
      }
      
      console.log('Getting store members for storeId:', storeId);
      const membersResponse = await storeService.getStoreMembers(storeId);
      console.log('Store members response:', membersResponse);
      
      let isMember = false;
      
      if (membersResponse && typeof membersResponse === 'object') {
        if (membersResponse[currentUserId]) {
          console.log('User found in store roles:', membersResponse[currentUserId]);
          isMember = true;
        } else {
          let members: any[] = [];
          if (Array.isArray(membersResponse)) {
            members = membersResponse;
          } else if (membersResponse.success && membersResponse.data) {
            members = Array.isArray(membersResponse.data) ? membersResponse.data : [membersResponse.data];
          } else if ('id' in membersResponse || 'memberId' in membersResponse) {
            members = [membersResponse];
          }
          
          console.log('Parsed members array:', members);
          isMember = members.some(member => {
            const memberId = member.memberId || member.id || member.userId || member.UserId || member.Id;
            console.log('Checking member ID:', memberId, 'against current user:', currentUserId);
            return String(memberId) === String(currentUserId);
          });
        }
      }
      
      console.log('Current user ID:', currentUserId);
      console.log('User has access to store:', isMember);
      
      setHasAccess(isMember);
      
    } catch (err) {
      console.error('Error checking store access:', err);
      console.log('Setting access to false due to error');
      setHasAccess(false);
    } finally {
      console.log('Setting accessCheckLoading to false');
      setAccessCheckLoading(false);
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

  const loadMembers = async () => {
    if (!storeId) return;
    try {
      setIsMembersLoading(true);
      console.log('Loading members for storeId:', storeId);
      const response = await storeService.getStoreMembers(storeId);
      console.log('Members response:', response);
      
      let list: any[] = [];
      
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        list = Object.entries(response).map(([userId, role]) => ({
          id: userId,
          userId: userId,
          memberId: userId,
          role: role,
          roleName: getRoleName(role)
        }));
        console.log('Converted roles to members list:', list);
        
        const userDetailsPromises = list.map(async (member) => {
          try {
            console.log(`Loading user details for ${member.userId}`);
            const userDetails = await userService.getUserById(member.userId);
            console.log(`Successfully loaded user details for ${member.userId}:`, userDetails);
            return { userId: member.userId, details: userDetails };
          } catch (err) {
            console.error(`Error loading user details for ${member.userId}:`, err);
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
      } else if (Array.isArray(response)) {
        list = response as any[];
      } else if (response && typeof response === 'object') {
        if (response.success && response.data) {
          list = Array.isArray(response.data) ? response.data : [response.data];
        } else if ('id' in response || 'memberId' in response) {
          list = [response as any];
        }
      }
      
      setMembers(list);
    } catch (err) {
      console.error('Error loading members:', err);
      setMembers([]);
    } finally {
      setIsMembersLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await storeService.getCurrentUser();
      console.log('Raw user response:', user);
      const id = user?.id || user?.userId || user?.Id || user?.ID || user?._id;
      console.log('Extracted user ID:', id);
      console.log('Setting currentUserId to:', id);
      setCurrentUserId(id);
      setCurrentUser(user);
    } catch (e) {
      console.error('Failed to get current user:', e);
      setCurrentUserId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers();
    }
  }, [activeTab, storeId]);

  const loadProducts = async () => {
    if (!storeId) return;
    try {
      setIsProductsLoading(true);
      setProductsError(null);
      const candidateIds: string[] = [];
      if (currentUserId) candidateIds.push(String(currentUserId));
      if (store && (store as any).userId) candidateIds.push(String((store as any).userId));
      candidateIds.push(String(storeId));

      let list: Product[] = [];
      let lastError: unknown = null;
      for (const sellerId of candidateIds) {
        try {
          const response = await productService.getBySellerId(sellerId, {});
          if (Array.isArray(response)) {
            list = response as Product[];
          } else if (response && typeof response === 'object') {
            if ((response as any).success && (response as any).data) {
              list = (response as any).data as Product[];
            } else if (Array.isArray((response as any).items)) {
              list = (response as any).items as Product[];
            } else if (Array.isArray((response as any).products)) {
              list = (response as any).products as Product[];
            }
          }
          if (list && list.length > 0) break; // success
        } catch (e: any) {
          lastError = e;
          console.log(`No products found for sellerId ${sellerId}:`, e.message);
          continue;
        }
      }

      if (!list || list.length === 0) {
        const prefer = candidateIds[0];
        try {
          const all = await productService.getAll();
          let allList: Product[] = [];
          if (Array.isArray(all)) {
            allList = all as Product[];
          } else if (all && typeof all === 'object' && (all as any).data) {
            allList = (all as any).data as Product[];
          } else if (all && typeof all === 'object' && Array.isArray((all as any).items)) {
            allList = (all as any).items as Product[];
          } else if (all && typeof all === 'object' && Array.isArray((all as any).products)) {
            allList = (all as any).products as Product[];
          }
          list = (allList || []).filter((p: any) => String(p?.sellerId || '') === String(prefer));
        } catch (e) {
          lastError = e;
        }
      }

      if ((!list || list.length === 0) && lastError) {
        const is404Error = lastError && typeof lastError === 'object' && 
          'message' in lastError && 
          String((lastError as any).message).includes('404');
        
        if (!is404Error) {
          setProductsError('Не вдалося отримати товари для цього магазину. Спробуйте пізніше.');
        }
      }

      setProducts(list || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
      setProductsError('Помилка завантаження товарів');
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
      loadCategories();
    }
  }, [activeTab, storeId]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories/full-tree', { cache: 'no-store' });
      const data = await response.json();
      const cats: Category[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setCategories(cats);
      const flattened = flattenCategories(cats);
      setCategoryOptions(flattened);
    } catch (e) {
      console.error('Failed to load categories:', e);
      setCategories([]);
      setCategoryOptions([]);
    }
  };

  const flattenCategories = (nodes: Category[], prefix: string = ''): { id: string; label: string }[] => {
    const result: { id: string; label: string }[] = [];
    for (const node of nodes) {
      result.push({ id: node.id, label: `${prefix}${node.name}` });
      if (node.children && node.children.length > 0) {
        result.push(...flattenCategories(node.children, `${prefix}— `));
      }
    }
    return result;
  };

  const handleAddMember = async () => {
    const trimmed = memberIdInput.trim();
    if (!trimmed) return;
    try {
      await storeService.addMemberToStore(trimmed, 1);
      setMemberIdInput('');
      
      const newMember = {
        id: trimmed,
        userId: trimmed,
        memberId: trimmed,
        role: 1,
        roleName: 'Manager'
      };
      
      setMembers(prev => [...prev, newMember]);
      
      try {
        const userDetails = await userService.getUserById(trimmed);
        setUserDetails(prev => ({
          ...prev,
          [trimmed]: userDetails
        }));
      } catch (err) {
        console.error(`Error loading user details for ${trimmed}:`, err);
        setUserDetails(prev => ({
          ...prev,
          [trimmed]: {
            id: trimmed,
            username: `User ${trimmed.slice(-4)}`,
            fullName: `User ${trimmed.slice(-4)}`,
            email: null,
            avatar: null
          }
        }));
      }
      
      alert('Користувача додано як менеджера');
    } catch (err) {
      console.error('Error adding member:', err);
      alert('Не вдалося додати учасника');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Видалити учасника з магазину?')) return;
    try {
      await storeService.removeMemberFromStore(memberId);
      
      setMembers(prev => prev.filter(m => (m.memberId || m.id || m.userId || m.UserId || m.Id) !== memberId));
      
      setUserDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[memberId];
        return newDetails;
      });
      
      alert('Учасника видалено');
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Не вдалося видалити учасника');
    }
  };

  const handleLeaveStore = async (memberId: string) => {
    if (!confirm('Ви впевнені, що хочете покинути цей магазин?')) return;
    try {
      await storeService.removeMemberFromStore(memberId);
      
      setMembers(prev => prev.filter(m => (m.memberId || m.id || m.userId || m.UserId || m.Id) !== memberId));
      
      setUserDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[memberId];
        return newDetails;
      });
      
      alert('Ви покинули магазин');
      router.push('/store');
    } catch (err) {
      console.error('Error leaving store:', err);
      alert('Не вдалося покинути магазин');
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

  const AccessDeniedPage = () => (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">🚫</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Доступ обмежено</h3>
            <p className="text-gray-500 mb-6">
              На жаль, у вас немає доступу до даного магазину. 
              Ви можете переглядати тільки ті магазини, в яких є учасником.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/store')} 
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10 transition-colors"
              >
                Повернутися до моїх магазинів
              </button>
              <div className="text-sm text-gray-400">
                або
              </div>
              <button 
                onClick={() => router.push('/requests')} 
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Подати заявку на створення магазину
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  const roleBadge = (role?: number) => {
    if (role === 0) return <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">Власник</span>;
    if (role === 1) return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">Менеджер</span>;
    return <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">Учасник</span>;
  };

  const renderMembersContent = () => (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Додати учасника</h2>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={memberIdInput}
            onChange={(e) => setMemberIdInput(e.target.value)}
            placeholder="ID користувача"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={handleAddMember} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Додати як менеджера</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Нові учасники додаються з роллю менеджера.</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Список учасників</h2>
          {isMembersLoading && <span className="text-sm text-gray-500">Оновлення...</span>}
        </div>
        {members.length === 0 ? (
          <div className="text-gray-600 text-sm">Немає учасників</div>
        ) : (
          <div className="divide-y">
            {members.map((m: any, idx: number) => {
              const memberId = m.memberId || m.id || m.userId || m.UserId || m.Id;
              const memberDetails = userDetails[memberId];
              const display = memberDetails?.fullName || memberDetails?.name || memberDetails?.email || memberDetails?.username || memberId || `member-${idx}`;
              const roleValue: number | undefined = typeof m.role === 'number' ? m.role : (store?.roles && memberId && store.roles[memberId] !== undefined ? store.roles[memberId] : undefined);
              const roleName = m.roleName || getRoleName(m.role) || getRoleName(roleValue);
              const canRemove = canRemoveMember(memberId);
              const isCurrentUser = memberId === currentUserId;
              
              return (
                <div key={`${memberId}-${idx}`} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {memberDetails?.avatar?.sourceUrl ? (
                      <Image
                        src={memberDetails.avatar.sourceUrl}
                        alt={display}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {display?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{display}</div>
                      {memberDetails?.email && <div className="text-xs text-gray-500">{memberDetails.email}</div>}
                      {roleName && <div className="text-xs text-blue-600">Роль: {roleName}</div>}
                      {isCurrentUser && <div className="text-xs text-green-600">(Ви)</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {roleBadge(roleValue)}
                    {isCurrentUser ? (
                      canLeaveStore(memberId) ? (
                        <button 
                          onClick={() => handleLeaveStore(String(memberId))} 
                          className="text-sm text-orange-600 hover:text-orange-800"
                        >
                          Покинути магазин
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Власник не може покинути магазин
                        </span>
                      )
                    ) : canRemove ? (
                      <button 
                        onClick={() => handleRemoveMember(String(memberId))} 
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Видалити
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Немає прав для видалення
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      price: 0,
      priceType: 0,
      paymentOptions: 1,
      discountPrice: 0,
      quantity: 0,
      deliveryType: 1,
      description: '',
    });
    setEditingProduct(null);
    setUploadFiles([]);
    setProductFeatures([
      { category: 'Основні', features: [{ key: '', value: '' }] },
    ]);
    if (productNameRef.current) productNameRef.current.value = '';
  };

  const handleCreateOrUpdateProduct = async () => {
    try {
      const buildFeatures = (): any[] => {
        return productFeatures
          .filter(group => group.category.trim() && group.features.some(f => f.key.trim() && f.value.trim()))
          .map(group => ({
            category: group.category.trim(),
            features: group.features
              .filter(f => f.key.trim() && f.value.trim())
              .reduce((acc, f) => {
                acc[f.key.trim()] = {
                  value: f.value.trim(),
                  type: "string",
                  nullable: true
                };
                return acc;
              }, {} as Record<string, any>)
          }));
      };
      const nameFromInput = productNameRef.current?.value?.toString() || '';
      if (editingProduct) {
        const payload: ProductUpdateInput = {
          id: editingProduct.id,
          name: nameFromInput || productForm.name || '',
          category: productForm.category || '',
          features: buildFeatures(),
          price: productForm.price || 0,
          priceType: productForm.priceType || 0,
          paymentOptions: productForm.paymentOptions || 1,
          discountPrice: productForm.discountPrice || 0,
          sellerId: storeId,
          quantity: productForm.quantity || 0,
          deliveryType: productForm.deliveryType || 1,
          productDimensions: productForm.productDimensions,
          description: productForm.description || '',
        };
        const updated = await productService.update(payload);
        console.log('Updated product:', updated);
        try { 
          if (uploadFiles.length > 0) {
            const productId = updated?.id || editingProduct?.id;
            if (productId) {
              console.log('Uploading media for product ID:', productId);
              await productService.addMedia(productId, uploadFiles); 
            }
          }
        } catch (e) { 
          console.error('Media upload failed (update):', e); 
        }
      } else {
        const payload: ProductInput = {
          name: nameFromInput || productForm.name || '',
          category: productForm.category || '',
          features: buildFeatures(),
          price: productForm.price || 0,
          priceType: productForm.priceType || 0,
          paymentOptions: productForm.paymentOptions || 1,
          discountPrice: productForm.discountPrice || 0,
          quantity: productForm.quantity || 0,
          deliveryType: productForm.deliveryType || 1,
          productDimensions: productForm.productDimensions,
          description: productForm.description || '',
        };
        console.log('Creating product with payload:', payload);
        const created = await productService.create(payload);
        console.log('Created product response:', created);
        console.log('Created product ID:', created?.id);
        console.log('Upload files count:', uploadFiles.length);
        
        if (uploadFiles.length > 0) {
          let productId = created?.id;
          
          if (!productId) {
            console.log('Product ID not found in response, trying to find it via get-all...');
            try {
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const allProducts = await productService.getAll();
              let allList: Product[] = [];
              if (Array.isArray(allProducts)) {
                allList = allProducts as Product[];
              } else if (allProducts && typeof allProducts === 'object') {
                if ((allProducts as any).data) allList = (allProducts as any).data as Product[];
                else if ((allProducts as any).products) allList = (allProducts as any).products as Product[];
              }
              
              const matchingProduct = allList
                .filter(p => p.name === payload.name)
                .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())[0];
              
              if (matchingProduct) {
                productId = matchingProduct.id;
                console.log('Found product ID via get-all:', productId);
              }
            } catch (e) {
              console.error('Failed to find product ID via get-all:', e);
            }
          }
          
          if (productId) {
            console.log('Product created successfully, uploading media for ID:', productId);
            try {
              await productService.addMedia(productId, uploadFiles);
              console.log('Media upload completed successfully');
            } catch (e) { 
              console.error('Media upload failed (create):', e);
            }
          } else {
            console.error('Cannot upload media: product ID is missing from response', created);
            console.log('Full response structure:', JSON.stringify(created, null, 2));
          }
        } else {
          console.log('No files to upload');
        }
      }
      
      setTimeout(async () => {
        await loadProducts();
      }, 1000);
      
      resetProductForm();
      alert('Збережено');
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Не вдалося зберегти товар');
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: (p.categoryPath && p.categoryPath[0]) || '',
      features: p.features,
      price: p.price,
      priceType: p.priceType,
      paymentOptions: p.paymentOptions,
      discountPrice: p.discountPrice || 0,
      quantity: p.quantity,
      deliveryType: p.deliveryType,
      productDimensions: p.productDimensions,
      description: p.description || '',
    });
    
    if (p.features && Array.isArray(p.features) && p.features.length > 0) {
      const convertedFeatures = p.features.map(featureGroup => ({
        category: featureGroup.category || 'Основні',
        features: Object.entries(featureGroup.features || {}).map(([key, value]) => ({
          key,
          value: typeof value === 'object' && value.value ? String(value.value) : String(value)
        }))
      }));
      setProductFeatures(convertedFeatures);
    } else {
      setProductFeatures([
        { category: 'Основні', features: [{ key: '', value: '' }] },
      ]);
    }
    
    if (productNameRef.current) productNameRef.current.value = p.name || '';
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Видалити товар?')) return;
    try {
      await productService.delete(id);
      await loadProducts();
      alert('Товар видалено');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Не вдалося видалити товар');
    }
  };

  const ProductMedia = ({ productId }: { productId: string }) => {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const loadMedia = async () => {
        try {
          const response = await fetch(`/api/products/media/${productId}`);
          if (response.ok) {
            const media = await response.json();
            const firstMedia = Array.isArray(media) ? media[0] : null;
            if (firstMedia?.url) {
              setMediaUrl(firstMedia.url);
              setMediaType(firstMedia.type || 'image');
            }
          }
        } catch (error) {
          console.error('Error loading product media:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadMedia();
    }, [productId]);

    if (isLoading) {
      return <div className="w-full h-full bg-gray-200 animate-pulse rounded" style={{ width: '48px', height: '48px' }} />;
    }

    if (!mediaUrl) {
      return (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs rounded" style={{ width: '48px', height: '48px' }}>
          Немає фото
        </div>
      );
    }

    if (mediaType === 'video') {
      return (
        <video
          src={mediaUrl}
          className="w-full h-full object-cover rounded"
          muted
          playsInline
          style={{ 
            width: '48px', 
            height: '48px', 
            objectFit: 'cover',
            maxWidth: '48px',
            maxHeight: '48px'
          }}
        />
      );
    }

    return (
      <Image
        src={mediaUrl}
        alt="Product"
        width={48}
        height={48}
        className="object-cover rounded"
        style={{ 
          width: '48px', 
          height: '48px', 
          objectFit: 'cover',
          maxWidth: '48px',
          maxHeight: '48px'
        }}
      />
    );
  };

  const renderProductsContent = () => (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{editingProduct ? 'Редагувати товар' : 'Створити товар'}</h2>
          {editingProduct && (
            <button onClick={resetProductForm} className="text-sm text-gray-600 hover:text-gray-800">Скасувати</button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-gray-700">
            <span className="block mb-1">Назва товару</span>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Напр. iPhone 14 128GB"
              ref={productNameRef}
              defaultValue={editingProduct?.name || ''}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="text-sm text-gray-700">
            <span className="block mb-1">Категорія</span>
            <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={productForm.category || ''} onChange={(e) => setProductForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Оберіть категорію</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-gray-700">
            <span className="block mb-1">Ціна (₴)</span>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Напр. 19999" value={productForm.price ?? 0} onChange={(e) => setProductForm(f => ({ ...f, price: Number(e.target.value) }))} />
          </label>

          <label className="text-sm text-gray-700">
            <span className="block mb-1">Тип ціни</span>
            <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={productForm.priceType ?? 0} onChange={(e) => setProductForm(f => ({ ...f, priceType: Number(e.target.value) }))}>
              <option value={0}>Звичайна ціна</option>
              <option value={1}>Акційна/спеціальна</option>
            </select>
          </label>

          <label className="text-sm text-gray-700">
            <span className="block mb-1">Спосіб оплати</span>
            <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={productForm.paymentOptions ?? 1} onChange={(e) => setProductForm(f => ({ ...f, paymentOptions: Number(e.target.value) }))}>
              <option value={1}>Стандартний</option>
              <option value={2}>Післяплата</option>
              <option value={3}>Онлайн-оплата</option>
            </select>
          </label>

          <label className="text-sm text-gray-700">
            <span className="block mb-1">Знижка (₴)</span>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Напр. 500" value={productForm.discountPrice ?? 0} onChange={(e) => setProductForm(f => ({ ...f, discountPrice: Number(e.target.value) }))} />
          </label>

          <label className="text-sm text-gray-700">
            <span className="block mb-1">Кількість на складі</span>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Напр. 10" value={productForm.quantity ?? 0} onChange={(e) => setProductForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
          </label>

          <label className="text-sm text-gray-700">
            <span className="block mb-1">Тип доставки</span>
            <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={productForm.deliveryType ?? 1} onChange={(e) => setProductForm(f => ({ ...f, deliveryType: Number(e.target.value) }))}>
              <option value={1}>Стандартна доставка</option>
              <option value={2}>Нова Пошта</option>
              <option value={3}>Самовивіз</option>
            </select>
          </label>

          <div className="md:col-span-2">
            <span className="block mb-3 text-sm font-medium text-gray-700">Характеристики товару</span>
            <div className="space-y-4">
              {productFeatures.map((featureGroup, groupIdx) => (
                <div key={groupIdx} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-end gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">Категорія характеристик</label>
                      <input
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={featureGroup.category}
                        onChange={(e) => {
                          const newFeatures = [...productFeatures];
                          newFeatures[groupIdx].category = e.target.value;
                          setProductFeatures(newFeatures);
                        }}
                        placeholder="Наприклад: Основні, Технічні характеристики, Доставка"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newFeatures = productFeatures.filter((_, i) => i !== groupIdx);
                        setProductFeatures(newFeatures);
                      }}
                      className="px-3 py-2 rounded border bg-white hover:bg-gray-50 text-sm"
                    >
                      Видалити
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Характеристики</div>
                    {featureGroup.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex items-center gap-2">
                        <input
                          className="flex-1 rounded border px-3 py-2 text-sm"
                          placeholder="Назва характеристики"
                          value={feature.key}
                          onChange={(e) => {
                            const newFeatures = [...productFeatures];
                            newFeatures[groupIdx].features[featureIdx].key = e.target.value;
                            setProductFeatures(newFeatures);
                          }}
                        />
                        <span className="text-gray-400">:</span>
                        <input
                          className="flex-1 rounded border px-3 py-2 text-sm"
                          placeholder="Значення"
                          value={feature.value}
                          onChange={(e) => {
                            const newFeatures = [...productFeatures];
                            newFeatures[groupIdx].features[featureIdx].value = e.target.value;
                            setProductFeatures(newFeatures);
                          }}
                        />
                        <button
                          onClick={() => {
                            const newFeatures = [...productFeatures];
                            newFeatures[groupIdx].features = newFeatures[groupIdx].features.filter((_, i) => i !== featureIdx);
                            setProductFeatures(newFeatures);
                          }}
                          className="px-2 py-2 rounded border bg-white hover:bg-gray-50 text-sm"
                        >
                          –
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newFeatures = [...productFeatures];
                        newFeatures[groupIdx].features.push({ key: '', value: '' });
                        setProductFeatures(newFeatures);
                      }}
                      className="mt-2 px-3 py-2 rounded border bg-white hover:bg-gray-50 text-sm"
                    >
                      Додати характеристику
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  setProductFeatures([...productFeatures, { category: '', features: [{ key: '', value: '' }] }]);
                }}
                className="px-4 py-2 rounded border bg-white hover:bg-gray-50 text-sm"
              >
                Додати категорію характеристик
              </button>
            </div>
          </div>

          <label className="text-sm text-gray-700 md:col-span-2">
            <span className="block mb-1">Медіа товару (фото/відео)</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*,.mp4,.webm,.mov,.avi,.mkv"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
            />
            <span className="block mt-1 text-xs text-gray-500">
              Можна додати кілька файлів: зображення (JPG, PNG, GIF) або відео (MP4, WebM, MOV, AVI, MKV)
            </span>
            {uploadFiles.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-600">Вибрано файлів: {uploadFiles.length}</span>
                <div className="mt-1 space-y-1">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </label>
        </div>
        <div className="mt-3 text-xs text-gray-500 leading-relaxed">
          Підказки:
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><strong>Категорія</strong>: введіть slug або ID категорії (напр. electronics/phones або UUID).</li>
            <li><strong>Тип ціни</strong>: 0 — звичайна ціна; 1 — інший тип.</li>
            <li><strong>Спосіб оплати</strong>: 1 — стандартний спосіб оплати.</li>
            <li><strong>Тип доставки</strong>: 1 — стандартна доставка.</li>
            <li><strong>Знижка</strong>: сума у гривнях, 0 якщо немає.</li>
          </ul>
        </div>
        <div className="mt-4">
          <button onClick={handleCreateOrUpdateProduct} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">{editingProduct ? 'Оновити' : 'Створити'}</button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Товари магазину</h2>
          {isProductsLoading && <span className="text-sm text-gray-500">Оновлення...</span>}
        </div>
        {productsError && (
          <div className="text-sm text-red-600 mb-2">{productsError}</div>
        )}
        {products.length === 0 && !productsError ? (
          <div className="text-gray-600 text-sm">Немає товарів</div>
        ) : products.length > 0 ? (
          <div className="divide-y">
            {products.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative" style={{ minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px' }}>
                    <ProductMedia productId={p.id} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                    <div className="text-xs text-gray-500">ID: {p.id}</div>
                    {p.features && p.features.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1 max-w-xs">
                        {p.features.slice(0, 2).map((group, idx) => (
                          <div key={idx} className="line-clamp-1">
                            <span className="font-medium">{group.category}:</span> {Object.keys(group.features || {}).slice(0, 2).join(', ')}
                          </div>
                        ))}
                        {p.features.length > 2 && <div className="text-gray-500">...</div>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-700">₴{p.price}</div>
                  <button onClick={() => handleEditProduct(p)} className="text-sm text-blue-600 hover:text-blue-800">Редагувати</button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="text-sm text-red-600 hover:text-red-800">Видалити</button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );

  console.log('Rendering - isLoading:', isLoading, 'accessCheckLoading:', accessCheckLoading, 'hasAccess:', hasAccess);

  if (isLoading) {
    console.log('Showing loading screen');
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

  if (hasAccess === false) {
    console.log('Showing access denied page');
    return <AccessDeniedPage />;
  }

  if (hasAccess === null || accessCheckLoading) {
    console.log('Showing access check loading');
    return (
      <div className="flex min-h-screen flex-col bg-gray-100">
        <Header />
        <main className="flex-1 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Перевірка доступу до магазину...</p>
          </div>
        </main>
      </div>
    );
  }

  console.log('Showing main store page');

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
            {activeTab === 'products' && renderProductsContent()}
            {activeTab === 'members' && renderMembersContent()}
            {activeTab === 'settings' && <Placeholder title="Налаштування" />}
            {activeTab === 'analytics' && <Placeholder title="Аналітика" />}
            {activeTab === 'plans' && <Placeholder title="Тарифи" />}
          </div>
        </main>
      </div>
    </div>
  );
}


