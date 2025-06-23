/// <summary>
/// Represents a product feature with a typed value, its type description, and validation rules.
/// </summary>
export interface ProductFeatureDto<T> {
  /// <summary>
  /// The value of the feature.
  /// </summary>
  value: T;

  /// <summary>
  /// The type of the value as a string (e.g., "string", "number", "boolean").
  /// </summary>
  type: string;

  /// <summary>
  /// A map of validation rules that apply to the feature's value.
  /// Key – rule name, value – its parameter or message.
  /// </summary>
  rules: Record<string, string>;
}
