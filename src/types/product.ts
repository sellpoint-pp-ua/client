export interface ProductFeatureValue {
  value: string | number | boolean | null;
  type: string;
  nullable: boolean;
}

export interface ProductFeatureGroup {
  category: string;
  features: Record<string, ProductFeatureValue>;
}

export interface ProductDimensions {
  widthMm?: number;
  heightMm?: number;
  depthMm?: number;
  massKg?: number;
}

export interface ProductInput {
  name: string;
  category: string;
  features?: ProductFeatureGroup[];
  price: number;
  priceType: number;
  paymentOptions: number;
  discountPrice?: number;
  quantity: number;
  deliveryType: number;
  productDimensions?: ProductDimensions;
  description?: string;
}

export interface ProductUpdateInput extends ProductInput {
  id: string;
  sellerId?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryPath?: string[];
  features?: ProductFeatureGroup[];
  price: number;
  priceType: number;
  paymentOptions: number;
  discountPrice?: number;
  hasDiscount?: boolean;
  discountPercentage?: number;
  sellerId?: string;
  quantityStatus?: number;
  quantity: number;
  deliveryType: number;
  productDimensions?: ProductDimensions & { volumeCubicMm?: number; volumeLiters?: number };
  description?: string;
}

export interface ProductListResponse {
  success?: boolean;
  data?: Product[];
}


