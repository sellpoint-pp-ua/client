/// <summary>
/// Represents a product category in the system.
/// Categories can be nested hierarchically via the optional <c>parentId</c>.
/// </summary>
export interface Category {
  /// <summary>
  /// Unique identifier of the category (e.g., MongoDB ObjectId as a string).
  /// </summary>
  id: string;

  /// <summary>
  /// Human-readable name of the category (3 – 100 characters).
  /// </summary>
  name: string;

  /// <summary>
  /// Optional identifier of the parent category.
  /// Use <c>null</c> or omit when the category is a root node.
  /// </summary>
  parentId?: string;
}
