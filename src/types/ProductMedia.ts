/// <summary>
/// Literal-union of supported media types attached to a product.
/// </summary>
export type MediaType = 'Image' | 'Video';

/// <summary>
/// Represents a media asset (image, video, etc.) associated with a product.
/// </summary>
export interface ProductMedia {
  /// <summary>Unique identifier of the media item (e.g., MongoDB ObjectId).</summary>
  id: string;

  /// <summary>Identifier of the product this media belongs to.</summary>
  productId: string;

  /// <summary>Public URL where the media can be accessed.</summary>
  url: string;

  /// <summary>Type of the media (image or video).</summary>
  type: MediaType;

  /// <summary>Display order in the product gallery (lower value = shown earlier).</summary>
  order: number;
}
