import type { ProductFeatureDto } from './ProductFeatureDto';
import type { ProductMedia } from './ProductMedia';

/**
 * Represents a product stored in the system.
 */
export interface Product {
  /** Unique identifier of the product (e.g., MongoDB ObjectId as a string). */
  id: string;

  /** Human-friendly unique identifier shown to users. */
  uniqueId: string;

  /** Name of the product (maximum 200 characters). */
  name: string;

  /** Category or type of the product. */
  productType: string;

  /** Optional textual description in markdown or plain text. */
  description?: string;

  /** Map of feature keys to typed feature definitions. */
  features: Record<string, ProductFeatureDto<unknown>>;

  /** Collection of media files (images, videos) attached to the product. */
  media?: ProductMedia[];

  /** Identifier of the seller who owns this product. */
  sellerId: number;

  /** Inventory status, e.g., `'InStock'`, `'OutOfStock'`, `'Limited'`. */
  quantityStatus?: string;
}
