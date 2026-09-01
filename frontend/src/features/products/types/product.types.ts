export type ProductCategory = 'electronics' | 'clothing' | 'food' | 'accessories';

export type ProductCategoryFilter = ProductCategory | 'all';

export type ProductSortBy = 'createdAt' | 'price' | 'name';

export type ProductSortOrder = 'asc' | 'desc';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  imageUrl: string;
  rating: number;
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: ProductCategoryFilter;
  sortBy?: ProductSortBy;
  sortOrder?: ProductSortOrder;
}

export type CreateProductDTO = Omit<Product, 'id' | 'createdAt' | 'rating'>;

export type UpdateProductDTO = Partial<CreateProductDTO>;
