import type { ProductFeatureDto } from './ProductFeatureDto';
import type { ProductMedia } from './ProductMedia';

/// <summary>
/// Represents a product stored in the system.
/// </summary>
export interface Product {
  /// <summary>
  /// Unique identifier of the product (e.g., MongoDB ObjectId).
  /// </summary>
  id: string;

  /// <summary>
  /// Human-friendly unique identifier shown to users.
  /// </summary>
  uniqueId: string;

  /// <summary>
  /// Name of the product (max 200 characters).
  /// </summary>
  name: string;

  /// <summary>
  /// Category or type of the product.
  /// </summary>
  productType: string;

  /// <summary>
  /// Optional textual description in markdown or plain text.
  /// </summary>
  description?: string;

  /// <summary>
  /// Map of feature keys to typed feature definitions.
  /// </summary>
  features: Record<string, ProductFeatureDto<unknown>>;

  /// <summary>
  /// Collection of media files (images, videos) attached to the product.
  /// </summary>
  media?: ProductMedia[];

  /// <summary>
  /// Identifier of the seller who owns this product.
  /// </summary>
  sellerId: number;

  /// <summary>
  /// Inventory status, e.g., 'InStock', 'OutOfStock', 'Limited'.
  /// </summary>
  quantityStatus?: string;
}
