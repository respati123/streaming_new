import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Modal } from '@shared/components/ui/Modal';
import { useTranslation } from '@shared/hooks/useTranslation';
import type { ProductFormModalProps } from '../types/product-component.types';
import type { ProductCategory } from '../types/product.types';
import { useProductFormViewModel } from '../viewmodels/useProductFormViewModel';

export function ProductFormModal({ isOpen, onClose, initialProduct }: ProductFormModalProps) {
  const { t } = useTranslation();
  const { state, actions } = useProductFormViewModel({
    initialProduct,
    onSuccess: () => {
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={state.isEditMode ? t('products.modal.editTitle') : t('products.modal.createTitle')}
      description={t('products.modal.description')}
      maxWidth="lg"
    >
      <form data-testid="product-form" onSubmit={actions.handleSubmit} className="space-y-4 font-sans">
        {/* Name */}
        <Input
          data-testid="input-product-name"
          label={t('products.modal.nameLabel')}
          placeholder={t('products.modal.namePlaceholder')}
          value={state.formValues.name}
          onChange={(e) => actions.handleFieldChange('name', e.target.value)}
          error={state.errors.name}
        />

        {/* Description */}
        <div className="space-y-1.5 font-sans">
          <label
            htmlFor="product-description-input"
            className="block text-xs font-bold text-zinc-800 tracking-tight"
          >
            {t('products.modal.descriptionLabel')}
          </label>
          <textarea
            id="product-description-input"
            data-testid="input-product-description"
            rows={3}
            placeholder={t('products.modal.descriptionPlaceholder')}
            value={state.formValues.description}
            onChange={(e) => actions.handleFieldChange('description', e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 font-sans"
          />
          {state.errors.description && (
            <p className="text-xs font-semibold text-rose-600 animate-fadeIn">{state.errors.description}</p>
          )}
        </div>

        {/* Price & Stock Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            data-testid="input-product-price"
            label={t('products.modal.priceLabel')}
            type="number"
            step="0.01"
            min="0"
            value={state.formValues.price || ''}
            onChange={(e) => actions.handleFieldChange('price', parseFloat(e.target.value) || 0)}
            error={state.errors.price}
          />
          <Input
            data-testid="input-product-stock"
            label={t('products.modal.stockLabel')}
            type="number"
            min="0"
            value={state.formValues.stock || ''}
            onChange={(e) => actions.handleFieldChange('stock', parseInt(e.target.value, 10) || 0)}
            error={state.errors.stock}
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5 font-sans">
          <label
            htmlFor="product-category-select"
            className="block text-xs font-bold text-zinc-800 tracking-tight"
          >
            {t('products.modal.categoryLabel')}
          </label>
          <select
            id="product-category-select"
            data-testid="select-product-category"
            value={state.formValues.category}
            onChange={(e) =>
              actions.handleFieldChange('category', e.target.value as ProductCategory)
            }
            className="block w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 font-sans"
          >
            <option value="electronics">{t('products.categories.electronics')}</option>
            <option value="clothing">{t('products.categories.clothing')}</option>
            <option value="food">{t('products.categories.food')}</option>
            <option value="accessories">{t('products.categories.accessories')}</option>
          </select>
          {state.errors.category && (
            <p className="text-xs font-semibold text-rose-600 animate-fadeIn">{state.errors.category}</p>
          )}
        </div>

        {/* Image URL */}
        <Input
          data-testid="input-product-image"
          label={t('products.modal.imageUrlLabel')}
          placeholder={t('products.modal.imageUrlPlaceholder')}
          value={state.formValues.imageUrl}
          onChange={(e) => actions.handleFieldChange('imageUrl', e.target.value)}
          error={state.errors.imageUrl}
          helperText={t('products.modal.imageUrlHelper')}
        />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
          <Button data-testid="cancel-product-btn" type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button data-testid="submit-product-btn" type="submit" isLoading={state.isSubmitting}>
            {state.isEditMode ? t('products.modal.submitUpdate') : t('products.modal.submitCreate')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
