/**
 * Represents a product feature with a typed value, its type description,
 * and a collection of validation rules.
 *
 * @template T Runtime type of the feature value.
 */
export interface ProductFeatureDto<T> {
  /** The actual value of the feature. */
  value: T;

  /** String representation of the value type (e.g., `"string"`, `"number"`, `"boolean"`). */
  type: string;

  /**
   * Validation rules that must hold for {@link value}.
   * Key – rule name, value – its parameter or message.
   */
  rules: Record<string, string>;
}
