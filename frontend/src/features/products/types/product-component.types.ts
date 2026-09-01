import type {
  Product,
  ProductCategoryFilter,
  ProductSortBy,
  ProductSortOrder,
} from './product.types';

export interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export interface ProductCategoryOption {
  label: string;
  value: ProductCategoryFilter;
}

export interface ProductFilterBarProps {
  searchInput: string;
  selectedCategory: ProductCategoryFilter;
  sortBy: ProductSortBy;
  sortOrder: ProductSortOrder;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: ProductCategoryFilter) => void;
  onSortChange: (sortBy: ProductSortBy) => void;
}

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product | null;
}
