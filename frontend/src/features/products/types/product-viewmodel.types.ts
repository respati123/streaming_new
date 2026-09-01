import type { ProductFormValues } from '../models/product.schema';
import type {
  Product,
  ProductCategoryFilter,
  ProductSortBy,
  ProductSortOrder,
} from './product.types';

export interface ProductListStatistics {
  totalItems: number;
  totalInventoryValue: number;
  lowStockCount: number;
}

export interface ProductListState {
  products: Product[];
  searchInput: string;
  selectedCategory: ProductCategoryFilter;
  sortBy: ProductSortBy;
  sortOrder: ProductSortOrder;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isDeleting: boolean;
  statistics: ProductListStatistics;
  isCreateModalOpen: boolean;
}

export interface ProductListActions {
  handleSearchChange: (value: string) => void;
  handleCategoryChange: (category: ProductCategoryFilter) => void;
  handleSortChange: (newSortBy: ProductSortBy) => void;
  handleDeleteProduct: (productId: string) => void;
  refetch: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

export interface ProductListViewModelReturn {
  state: ProductListState;
  actions: ProductListActions;
}

export interface ProductDetailState {
  product: Product | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isEditModalOpen: boolean;
}

export interface ProductDetailActions {
  handleBack: () => void;
  openEditModal: () => void;
  closeEditModal: () => void;
}

export interface ProductDetailViewModelReturn {
  state: ProductDetailState;
  actions: ProductDetailActions;
}

export interface UseProductFormViewModelProps {
  initialProduct?: Product | null;
  onSuccess?: () => void;
}

export type ProductFormField = keyof ProductFormValues;

export type ProductFormErrors = Partial<Record<ProductFormField, string>>;

export interface ProductFormState {
  formValues: ProductFormValues;
  errors: ProductFormErrors;
  isSubmitting: boolean;
  isEditMode: boolean;
}

export interface ProductFormActions {
  handleFieldChange: <K extends ProductFormField>(field: K, value: ProductFormValues[K]) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  resetForm: () => void;
}

export interface ProductFormViewModelReturn {
  state: ProductFormState;
  actions: ProductFormActions;
}
