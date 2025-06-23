import type { Category } from '../types/Category';
import type { Product } from '../types/Product';
import type { ProductFilterRequest } from '../types/ProductFilterRequest';

/// <summary>
/// Base URL for all API requests.  
/// Uses VITE_API_BASE_URL from environment or defaults to local dev URL.
/// </summary>
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7142';

/// <summary>
/// Returns parsed JSON on success, throws Error otherwise.
/// </summary>
/// <typeparam name="T">Expected response type.</typeparam>
/// <param name="response">Fetch API Response object.</param>
/// <returns>Parsed JSON of type T.</returns>
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`HTTP ${response.status}: ${message}`);
  }
  return response.json() as Promise<T>;
}

/* ==============  CATEGORIES  ============== */

/// <summary>Retrieves every category.</summary>
export async function getCategories(): Promise<Category[]> {
  return handleResponse<Category[]>(await fetch(`${API_BASE_URL}/categories`));
}

/// <summary>Retrieves a single category by id.</summary>
/// <param name="id">Category identifier.</param>
export async function getCategoryById(id: string): Promise<Category> {
  return handleResponse<Category>(await fetch(`${API_BASE_URL}/categories/${id}`));
}

/* ==============  PRODUCTS  ============== */

/// <summary>Retrieves every product.</summary>
export async function getProducts(): Promise<Product[]> {
  return handleResponse<Product[]>(await fetch(`${API_BASE_URL}/products`));
}

/// <summary>Retrieves a single product by id.</summary>
/// <param name="id">Product identifier.</param>
export async function getProductById(id: string): Promise<Product> {
  return handleResponse<Product>(await fetch(`${API_BASE_URL}/products/${id}`));
}

/// <summary>
/// Sends filter criteria and returns matching products.
/// </summary>
/// <param name="filterRequest">Filter parameters.</param>
export async function filterProducts(
  filterRequest: ProductFilterRequest
): Promise<Product[]> {
  return handleResponse<Product[]>(
    await fetch(`${API_BASE_URL}/products/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filterRequest)
    })
  );
}
