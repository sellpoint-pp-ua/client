/**
 * Represents a product category in the system.
 * Categories may be nested hierarchically via the optional {@link parentId}.
 */
export interface Category {
  /** Unique identifier of the category (e.g., MongoDB ObjectId as a string). */
  id: string;

  /** Human-readable name of the category (3–100 characters). */
  name: string;

  /**
   * Optional identifier of the parent category.
   * Omit or set to `null` if the category is a root node.
   */
  parentId?: string;
}
