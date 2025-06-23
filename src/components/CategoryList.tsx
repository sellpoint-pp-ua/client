import { useEffect, useState } from 'react';
import { getCategories } from '../services/api';
import type { Category } from '../types/Category';

/**
 * Component that fetches product categories from the API
 * and renders them as an unordered list.
 *
 * @returns JSX element with category list or status message.
 */
function CategoryList() {
  /** Fetched category objects. */
  const [categories, setCategories] = useState<Category[]>([]);

  /** Loading indicator shown while the fetch is in progress. */
  const [loading, setLoading] = useState(true);

  /** Error text if the request fails; `null` when no error. */
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
