import { useDisclosure } from '@shared/hooks/useDisclosure';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/product.service';
import type { ProductDetailViewModelReturn } from '../types/product-viewmodel.types';
import { productQueryKeys } from './useProductListViewModel';

export function useProductDetailViewModel(): ProductDetailViewModelReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editModalDisclosure = useDisclosure(false);

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: productQueryKeys.detail(id || ''),
    queryFn: () => productService.getById(id || ''),
    enabled: Boolean(id),
  });

  const handleBack = (): void => {
    navigate('/products');
  };

  return {
    state: {
      product,
      isLoading,
      isError,
      errorMessage: error ? (error as Error).message : null,
      isEditModalOpen: editModalDisclosure.isOpen,
    },
    actions: {
      handleBack,
      openEditModal: editModalDisclosure.open,
      closeEditModal: editModalDisclosure.close,
    },
  };
}
