"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, FolderIcon } from '@heroicons/react/24/outline';

type Product = {
  id: string;
  name: string;
  price: number;
};

type CategoryNode = {
  id: string;
  name?: string;
  children?: CategoryNode[];
};

type SearchProduct = {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: string; nameUk: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryIdInput, setCategoryIdInput] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchProducts = async (query: string, categoryId?: string) => {
    if (!query.trim() && !categoryId) {
      setSearchResults([]);
      setSearchError(null);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setShowSearchResults(true);
    
    try {
      let results: SearchProduct[] = [];
      
      if (query.trim()) {
        try {
          const nameResponse = await fetch(`https://api.sellpoint.pp.ua/api/Product/search?name=${encodeURIComponent(query)}`);
          if (nameResponse.ok) {
            const nameResults = await nameResponse.json();
            console.log('Name search results:', nameResults); // Додаємо логування для дебагу
            if (Array.isArray(nameResults)) {
              // Адаптуємо структуру даних під наш тип SearchProduct
              const adaptedResults = nameResults.map(product => ({
                id: product.productId || product.id,
                name: product.highlighted || product.name || '',
                categoryId: product.categoryId,
                categoryName: product.categoryName
              }));
              
              // Фільтруємо результати з валідним ID
              const validResults = adaptedResults.filter(product => 
                product && 
                product.id && 
                product.id.toString().trim() !== ''
              );
              console.log('Filtered name results:', validResults); // Додаємо логування для дебагу
              results = [...results, ...validResults];
            }
          }
        } catch (error) {
          console.warn('Error in product name search:', error);
        }
      }

      if (categoryId && categoryId.trim()) {
        try {
          const categoryResponse = await fetch(`https://api.sellpoint.pp.ua/api/Product/get-all`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              categoryId: categoryId,
              include: {},
              exclude: {},
              page: 0,
              pageSize: 50,
            }),
          });
          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            const categoryResults = Array.isArray(categoryData?.products) ? categoryData.products : Array.isArray(categoryData) ? categoryData : [];
            console.log('Category search results:', categoryResults); // Додаємо логування для дебагу
            // Адаптуємо структуру даних під наш тип SearchProduct
            const adaptedCategoryResults = categoryResults.map((product: any) => ({
              id: product.productId || product.id,
              name: product.highlighted || product.name || '',
              categoryId: product.categoryId,
              categoryName: product.categoryName
            }));
            
            // Фільтруємо результати з валідним ID
            const validCategoryResults = adaptedCategoryResults.filter((product: SearchProduct) => 
              product && 
              product.id && 
              product.id.toString().trim() !== ''
            );
            console.log('Filtered category results:', validCategoryResults); // Додаємо логування для дебагу
            validCategoryResults.forEach((product: SearchProduct) => {
              if (!results.find(r => r.id === product.id)) {
                results.push(product);
              }
            });
          }
        } catch (error) {
          console.warn('Error in category ID search:', error);
        }
      }

      setSearchResults(results);
      
      if (results.length === 0 && (query.trim() || categoryId?.trim())) {
        setSearchError('Продукти не знайдено');
      }
    } catch (error) {
      console.error('Помилка пошуку продуктів:', error);
      setSearchError('Помилка пошуку');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const treeRes = await fetch('https://api.sellpoint.pp.ua/api/Category/full-tree', { cache: 'no-store' });
        if (!treeRes.ok) throw new Error('Не вдалося завантажити категорії');
        const tree = await treeRes.json() as CategoryNode[];

        const options: Array<{ id: string; nameUk: string }> = [];
        const walk = (nodes: CategoryNode[]) => {
          for (const n of nodes) {
            if (!n?.id) continue;
            const nameUk = (n.name && typeof n.name === 'string' && n.name)
              ? n.name
              : n.id;
            options.push({ id: n.id, nameUk });
            if (n?.children?.length) walk(n.children);
          }
        };
        walk(tree);
        setCategoryOptions(options);

        const firstId = options.length ? options[0].id : null;
        setCategoryId(firstId);
        await fetchProductsForCategory(firstId);
      } catch {
        setError('Помилка завантаження');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2 || categoryIdInput.trim()) {
        searchProducts(searchQuery, categoryIdInput);
      } else {
        setSearchResults([]);
        setSearchError(null);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, categoryIdInput]);

  const fetchProductsForCategory = async (catId: string | null) => {
    if (!catId) {
      setProducts([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`https://api.sellpoint.pp.ua/api/Product/get-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: catId,
          include: {},
          exclude: {},
          page: 0,
          pageSize: 20,
        }),
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        const productsList = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [];
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value || null;
    setCategoryId(newId);
    await fetchProductsForCategory(newId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim() && !categoryIdInput.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setShowSearchResults(false);
    }
  };

  const handleCategoryIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategoryIdInput(value);
    if (!value.trim() && !searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCategoryIdInput('');
    setSearchResults([]);
    setSearchError(null);
    setShowSearchResults(false);
  };

  return (
    <div className="p-6 rounded-lg bg-white shadow border">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Продукти (перегляд)</h1>
      </div>

      {/* Пошук */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Пошук продуктів</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Назва продукту..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FolderIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="ID категорії (або залиште порожнім для всіх)"
                  value={categoryIdInput}
                  onChange={handleCategoryIdChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              💡 Введіть назву продукту та/або ID категорії. Залиште ID категорії порожнім для пошуку по всіх категоріях.
            </div>
          </div>
        </div>
      </div>

      {/* Результати пошуку */}
      {showSearchResults && (
        <div className="mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-900">
                Результати пошуку продуктів
              </h3>
              <button
                onClick={clearSearch}
                className="px-3 py-1 text-sm text-green-600 hover:text-green-900 transition-colors"
              >
                Очистити
              </button>
            </div>

            {isSearching ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-green-600">Пошук...</p>
              </div>
            ) : searchError ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg mb-2">⚠️</div>
                <p className="text-red-600">{searchError}</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {product.name && product.name.trim() !== '' ? product.name : `Продукт`}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">
                              ID: {product.id}
                            </span>
                          </div>
                          {product.categoryId && (
                            <p className="text-xs text-gray-500">Категорія ID: {product.categoryId}</p>
                          )}
                          {product.categoryName && (
                            <p className="text-xs text-gray-500">Категорія: {product.categoryName}</p>
                          )}
                          {(!product.name || product.name.trim() === '') && (
                            <p className="text-xs text-orange-500 mt-1">⚠️ Назва продукту відсутня</p>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/product/${product.id}`}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors inline-block"
                          >
                            Деталі
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (searchQuery.trim().length >= 2 || categoryIdInput.trim().length >= 2) ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🔍</div>
                <p className="text-gray-600">Продукти не знайдено</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Продукти за категорією */}
      {!showSearchResults && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Продукти за категорією</h2>
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm text-gray-600">Категорія:</label>
            <select
              className="rounded border px-3 py-1.5 text-sm"
              value={categoryId || ''}
              onChange={handleCategoryChange}
            >
              {categoryOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.nameUk} ({opt.id})</option>
              ))}
            </select>
          </div>
          {isLoading && <div>Завантаження...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="rounded border bg-white p-4">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-gray-600">{p.price} ₴</div>
                </div>
              ))}
              {!products.length && <div className="text-gray-600">Немає даних</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


