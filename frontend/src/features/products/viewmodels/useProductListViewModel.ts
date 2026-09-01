import { useDebounce } from '@shared/hooks/useDebounce';
import { useDisclosure } from '@shared/hooks/useDisclosure';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useUIStore } from '@shared/stores/ui.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/product.service';
import type {
  ProductCategoryFilter,
  ProductFilters,
  ProductSortBy,
  ProductSortOrder,
} from '../types/product.types';
import type {
  ProductListStatistics,
  ProductListViewModelReturn,
} from '../types/product-viewmodel.types';

export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productQueryKeys.lists(), filters] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
};

export function useProductListViewModel(): ProductListViewModelReturn {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const addToast = useUIStore((state) => state.addToast);
  const createModalDisclosure = useDisclosure(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch: string = searchParams.get('q') || '';
  const urlCategory: ProductCategoryFilter =
    (searchParams.get('category') as ProductCategoryFilter) || 'all';
  const urlSortBy: ProductSortBy = (searchParams.get('sortBy') as ProductSortBy) || 'createdAt';
  const urlSortOrder: ProductSortOrder =
    (searchParams.get('sortOrder') as ProductSortOrder) || 'desc';

  const [searchInput, setSearchInput] = useState<string>(urlSearch);
  const debouncedSearch = useDebounce<string>(searchInput, 300);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) {
          next.set('q', debouncedSearch);
        } else {
          next.delete('q');
        }
        return next;
      },
      { replace: true }
    );
  }, [debouncedSearch, setSearchParams]);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const activeFilters: ProductFilters = useMemo(
    () => ({
      search: urlSearch,
      category: urlCategory,
      sortBy: urlSortBy,
      sortOrder: urlSortOrder,
    }),
    [urlSearch, urlCategory, urlSortBy, urlSortOrder]
  );

  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: productQueryKeys.list(activeFilters),
    queryFn: () => productService.getAll(activeFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productService.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      addToast({
        title: t('products.toasts.deletedTitle'),
        message: t('products.toasts.deletedMessage'),
        type: 'success',
      });
    },
    onError: (err: Error) => {
      addToast({
        title: t('products.toasts.failedDeleteTitle'),
        message: err.message || t('products.toasts.failedDeleteMessage'),
        type: 'error',
      });
    },
  });

  const statistics: ProductListStatistics = useMemo(() => {
    const totalItems = products.length;
    const totalInventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock < 20).length;

    return {
      totalItems,
      totalInventoryValue,
      lowStockCount,
    };
  }, [products]);

  const handleSearchChange = (value: string): void => {
    setSearchInput(value);
  };

  const handleCategoryChange = (category: ProductCategoryFilter): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (category && category !== 'all') {
          next.set('category', category);
        } else {
          next.delete('category');
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleSortChange = (newSortBy: ProductSortBy): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const currentSortBy = next.get('sortBy') || 'createdAt';
        const currentSortOrder = next.get('sortOrder') || 'desc';

        if (currentSortBy === newSortBy) {
          next.set('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
          next.set('sortBy', newSortBy);
          next.set('sortOrder', 'asc');
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleDeleteProduct = (productId: string): void => {
    if (window.confirm(t('products.catalog.confirmDelete'))) {
      deleteMutation.mutate(productId);
    }
  };

  return {
    state: {
      products,
      searchInput,
      selectedCategory: urlCategory,
      sortBy: urlSortBy,
      sortOrder: urlSortOrder,
      isLoading,
      isError,
      errorMessage: error ? (error as Error).message : null,
      isDeleting: deleteMutation.isPending,
      statistics,
      isCreateModalOpen: createModalDisclosure.isOpen,
    },
    actions: {
      handleSearchChange,
      handleCategoryChange,
      handleSortChange,
      handleDeleteProduct,
      refetch,
      openCreateModal: createModalDisclosure.open,
      closeCreateModal: createModalDisclosure.close,
    },
  };
}
