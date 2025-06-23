import type { Category } from '../types/Category';
import type { Product } from '../types/Product';
import type { ProductFilterRequest } from '../types/ProductFilterRequest';

/**
 * Base URL for all API requests.
 * Uses the `VITE_API_BASE_URL` environment variable or falls back to local dev URL.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7142';

/**
 * Parses a fetch response as JSON on success, throws an Error otherwise.
 *
 * @template T Expected response type.
 * @param response Fetch API Response object.
 * @returns Parsed JSON object of type {@link T}.
 * @throws Error when {@link response.ok} is `false`.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`HTTP ${response.status}: ${message}`);
  }
  return response.json() as Promise<T>;
}

/* --------------------------------------------------------------------------
 *  CATEGORIES
 * -------------------------------------------------------------------------*/

/** Retrieves a full list of product categories. */
export async function getCategories(): Promise<Category[]> {
  return handleResponse<Category[]>(
    await fetch(`${API_BASE_URL}/categories`)
  );
}

/**
 * Retrieves a single category by identifier.
 *
 * @param id Category identifier.
 */
export async function getCategoryById(id: string): Promise<Category> {
  return handleResponse<Category>(
    await fetch(`${API_BASE_URL}/categories/${id}`)
  );
}

/* --------------------------------------------------------------------------
 *  PRODUCTS
 * -------------------------------------------------------------------------*/

/** Retrieves a full list of products. */
export async function getProducts(): Promise<Product[]> {
  return handleResponse<Product[]>(
    await fetch(`${API_BASE_URL}/products`)
  );
}

/**
 * Retrieves a single product by identifier.
 *
 * @param id Product identifier.
 */
export async function getProductById(id: string): Promise<Product> {
  return handleResponse<Product>(
    await fetch(`${API_BASE_URL}/products/${id}`)
  );
}

/**
 * Sends filter criteria to the server and returns products that match them.
 *
 * @param filterRequest Filter parameters (price range, categories, features, etc.).
 */
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
