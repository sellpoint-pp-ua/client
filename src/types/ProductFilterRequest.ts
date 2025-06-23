/**
 * Request model used to filter products returned by the API.
 * Provide any combination of criteria; omitted fields are ignored by the server.
 */
export interface ProductFilterRequest {
  /** Optional list of category identifiers included in the search scope. */
  categoryIds?: string[];

  /** Optional lower price bound (inclusive), expressed in store currency. */
  priceMin?: number;

  /** Optional upper price bound (inclusive), expressed in store currency. */
  priceMax?: number;

  /** Optional free-text search query applied to product name or description. */
  search?: string;

  /**
   * Optional map of product feature keys to expected values
   * (e.g., `{ "color": "Blue", "size": 42 }`).
   */
  features?: Record<string, unknown>;
}
