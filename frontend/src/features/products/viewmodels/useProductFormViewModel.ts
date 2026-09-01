import { useTranslation } from '@shared/hooks/useTranslation';
import { useUIStore } from '@shared/stores/ui.store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { type ProductFormValues, productSchema } from '../models/product.schema';
import { productService } from '../services/product.service';
import type {
  ProductFormErrors,
  ProductFormField,
  ProductFormViewModelReturn,
  UseProductFormViewModelProps,
} from '../types/product-viewmodel.types';
import { productQueryKeys } from './useProductListViewModel';

const DEFAULT_FORM_VALUES: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  stock: 10,
  category: 'electronics',
  imageUrl: '',
};

export function useProductFormViewModel({
  initialProduct,
  onSuccess,
}: UseProductFormViewModelProps = {}): ProductFormViewModelReturn {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const addToast = useUIStore((state) => state.addToast);

  const [formValues, setFormValues] = useState<ProductFormValues>(() => {
    if (initialProduct) {
      return {
        name: initialProduct.name,
        description: initialProduct.description,
        price: initialProduct.price,
        stock: initialProduct.stock,
        category: initialProduct.category,
        imageUrl: initialProduct.imageUrl,
      };
    }
    return DEFAULT_FORM_VALUES;
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (initialProduct) {
        return productService.update(initialProduct.id, values);
      }
      return productService.create(values);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      if (initialProduct) {
        queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(initialProduct.id) });
      }

      addToast({
        title: initialProduct
          ? t('products.toasts.updatedTitle')
          : t('products.toasts.createdTitle'),
        message: initialProduct
          ? t('products.toasts.updatedMessage', { name: result.name })
          : t('products.toasts.createdMessage', { name: result.name }),
        type: 'success',
      });

      onSuccess?.();
    },
    onError: (err: Error) => {
      addToast({
        title: t('products.toasts.failedSaveTitle'),
        message: err.message || t('products.toasts.failedSaveMessage'),
        type: 'error',
      });
    },
  });

  const handleFieldChange = <K extends ProductFormField>(
    field: K,
    value: ProductFormValues[K]
  ): void => {
    setFormValues((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const validation = productSchema.safeParse(formValues);

    if (!validation.success) {
      const fieldErrors: ProductFormErrors = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as ProductFormField;
        if (field) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    mutation.mutate(validation.data);
  };

  return {
    state: {
      formValues,
      errors,
      isSubmitting: mutation.isPending,
      isEditMode: Boolean(initialProduct),
    },
    actions: {
      handleFieldChange,
      handleSubmit,
      resetForm: () => setFormValues(DEFAULT_FORM_VALUES),
    },
  };
}
