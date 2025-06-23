/**
 * Literal-union of supported media types attached to a product.
 */
export type MediaType = 'Image' | 'Video';

/**
 * Represents a media asset (image, video, etc.) associated with a product.
 */
export interface ProductMedia {
  /** Unique identifier of the media item (e.g., MongoDB ObjectId). */
  id: string;

  /** Identifier of the product this media belongs to. */
  productId: string;

  /** Public URL where the media can be accessed. */
  url: string;

  /** Type of the media (image or video). */
  type: MediaType;

  /** Display order in the product gallery (lower value = shown earlier). */
  order: number;
}
