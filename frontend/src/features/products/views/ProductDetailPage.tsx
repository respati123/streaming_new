import { formatCurrency, formatDate } from '@core/utils/formatters';
import { Badge } from '@shared/components/ui/Badge';
import { Button } from '@shared/components/ui/Button';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiEditLine,
  RiInbox2Line,
  RiShieldCheckLine,
  RiStarFill,
} from 'react-icons/ri';
import { ProductFormModal } from '../components/ProductFormModal';
import { useProductDetailViewModel } from '../viewmodels/useProductDetailViewModel';

export default function ProductDetailPage() {
  const { t, language } = useTranslation();
  const { state, actions } = useProductDetailViewModel();
  useDocumentTitle(state.product?.name || 'Product Details');
  const locale = language === 'id' ? 'id-ID' : 'en-US';

  if (state.isLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  if (state.isError || !state.product) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center max-w-lg mx-auto font-sans">
        <h3 className="text-base font-extrabold text-rose-950">
          {t('products.detail.notFoundTitle')}
        </h3>
        <p className="mt-1 text-xs text-rose-600 font-mono">
          {state.errorMessage || t('products.detail.notFoundDesc')}
        </p>
        <Button variant="outline" size="sm" onClick={actions.handleBack} className="mt-4">
          {t('products.detail.back')}
        </Button>
      </div>
    );
  }

  const { product } = state;

  return (
    <div className="space-y-6 animate-fadeIn font-sans max-w-7xl mx-auto">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <Button
          data-testid="detail-back-btn"
          variant="ghost"
          size="sm"
          onClick={actions.handleBack}
          leftIcon={<RiArrowLeftLine className="text-base" />}
        >
          {t('products.detail.back')}
        </Button>

        <Button
          data-testid="detail-edit-btn"
          variant="outline"
          size="sm"
          onClick={actions.openEditModal}
          leftIcon={<RiEditLine className="text-base" />}
        >
          {t('products.detail.edit')}
        </Button>
      </div>

      {/* Main detail card */}
      <div
        data-testid="product-detail-card"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-10 shadow-diffusion"
      >
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200 shadow-inner">
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          <div className="absolute top-4 left-4">
            <Badge variant="primary" size="md">
              {product.category.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 font-mono">
                <RiStarFill className="text-amber-500 text-xs" />
                <span>{t('products.detail.rating', { rating: product.rating.toFixed(1) })}</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">• {t('products.detail.verified')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {product.name}
            </h1>

            <div className="text-3xl font-black text-zinc-950 font-mono">
              {formatCurrency(product.price, 'USD', locale)}
            </div>

            <div className="prose prose-sm text-zinc-600 leading-relaxed border-t border-b border-zinc-100 py-4 font-sans">
              <p>{product.description}</p>
            </div>

            {/* Meta badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                <RiInbox2Line className="text-zinc-900 text-xl" />
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                    {t('products.detail.inventory')}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-950 font-mono">
                    {t('products.detail.unitsInStock', { count: product.stock })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 border border-zinc-200">
                <RiCalendarLine className="text-zinc-900 text-xl" />
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                    {t('products.detail.createdOn')}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-950 font-mono">
                    {formatDate(product.createdAt, locale)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 border border-zinc-200">
            <RiShieldCheckLine className="text-zinc-900 text-xl shrink-0" />
            <p className="text-xs text-zinc-700 leading-relaxed font-sans">
              {t('products.detail.architectureNote')}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <ProductFormModal
        isOpen={state.isEditModalOpen}
        onClose={actions.closeEditModal}
        initialProduct={product}
      />
    </div>
  );
}
