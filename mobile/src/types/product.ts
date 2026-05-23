export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  brand: string;
  material: string;
  gender: string;
  categoryName: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stockQuantity: number;
  priceOverride?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export interface ProductFilter {
  page?: number;
  size?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string;
  colors?: string;
  gender?: string;
  brand?: string;
  sort?: 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST' | 'POPULAR';
}

export interface PagedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
