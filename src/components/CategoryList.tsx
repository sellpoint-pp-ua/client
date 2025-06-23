import { useEffect, useState } from 'react';
import { getCategories } from '../services/api';
import type { Category } from '../types/Category';

/// <summary>
/// Component that fetches and displays product categories.
/// </summary>
function CategoryList() {
  /// <summary>Fetched categories.</summary>
  const [categories, setCategories] = useState<Category[]>([]);

  /// <summary>Loading indicator.</summary>
  const [loading, setLoading] = useState(true);

  /// <summary>Error message, if any.</summary>
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error)   return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <ul>
      {categories.map((c) => (
        <li key={c.id}>{c.name}</li>
      ))}
    </ul>
  );
}

export default CategoryList;
