export interface ProductColor {
  name: string;
  hex: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
  featured?: boolean;
  published?: boolean;
  order?: number;
  is_visible?: boolean;
  sort_order?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  short_description?: string | null;
  category: string;
  categoryName: string;
  subcategory?: string;
  brand?: string;
  description: string;
  details: string[];
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  inStock: boolean;
  stockCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  published?: boolean;
  rating?: number;
  reviewCount?: number;
  sku: string;
  stockStatus?: string;
  material?: string;
  madeIn?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface ProductFiltersState {
  searchQuery: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  size: string;
  color: string;
  sortBy: SortOption;
  onlyInStock: boolean;
}
