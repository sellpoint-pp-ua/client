"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  price: number;
};

type CategoryNode = {
  id: string;
  name?: { uk?: string };
  children?: CategoryNode[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: string; nameUk: string }>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const treeRes = await fetch('/api/categories/full-tree', { cache: 'no-store' });
        if (!treeRes.ok) throw new Error('Не вдалося завантажити категорії');
        const tree = await treeRes.json() as CategoryNode[];

        const options: Array<{ id: string; nameUk: string }> = [];
        const walk = (nodes: CategoryNode[]) => {
          for (const n of nodes) {
            if (!n?.id) continue;
            const nameUk = (n.name && typeof n.name.uk === 'string' && n.name.uk)
              ? n.name.uk
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

  const fetchProductsForCategory = async (catId: string | null) => {
    if (!catId) {
      setProducts([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`/api/products/by-category/${catId}?pageSize=20`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
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

  return (
    <div className="p-6 rounded-lg bg-white shadow border">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Продукти (перегляд)</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">↩ До адмін</Link>
          <Link href="/" className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">← На головну</Link>
        </div>
      </div>
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
  );
}


