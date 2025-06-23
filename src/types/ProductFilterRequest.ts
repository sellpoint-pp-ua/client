/// <summary>
/// Request model used to filter products returned by the API.
/// Provide any combination of criteria; omitted fields are ignored by the server.
/// </summary>
export interface ProductFilterRequest {
  /// <summary>
  /// Optional list of category identifiers included in the search scope.
  /// </summary>
  categoryIds?: string[];

  /// <summary>
  /// Optional lower price bound (inclusive), expressed in store currency.
  /// </summary>
  priceMin?: number;

  /// <summary>
  /// Optional upper price bound (inclusive), expressed in store currency.
  /// </summary>
  priceMax?: number;

  /// <summary>
  /// Optional free-text search query applied to product name / description.
  /// </summary>
  search?: string;

  /// <summary>
  /// Optional map of product feature keys to expected values
  /// (e.g., { "color": "Blue", "size": 42 }).
  /// </summary>
  features?: Record<string, unknown>;
}
