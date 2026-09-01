import { formatCurrency } from '@core/utils/formatters';
import { Button } from '@shared/components/ui/Button';
import { EmptyState } from '@shared/components/ui/EmptyState';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  RiAddLine,
  RiAlertLine,
  RiErrorWarningLine,
  RiInbox2Line,
  RiMoneyDollarCircleLine,
  RiRefreshLine,
} from 'react-icons/ri';
import { ProductCard } from '../components/ProductCard';
import { ProductFilterBar } from '../components/ProductFilterBar';
import { ProductFormModal } from '../components/ProductFormModal';
import { useProductListViewModel } from '../viewmodels/useProductListViewModel';

export default function ProductListPage() {
  const { t, language } = useTranslation();
  useDocumentTitle(t('products.catalog.title'));
  const { state, actions } = useProductListViewModel();

  const locale = language === 'id' ? 'id-ID' : 'en-US';

  return (
    <div className="space-y-8 animate-fadeIn font-sans max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            {t('products.catalog.title')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 font-mono">{t('products.catalog.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            data-testid="refresh-products-btn"
            variant="outline"
            size="sm"
            onClick={() => actions.refetch()}
            leftIcon={<RiRefreshLine className="text-base" />}
          >
            {t('common.refresh')}
          </Button>
          <Button
            data-testid="add-product-btn"
            variant="primary"
            size="sm"
            onClick={actions.openCreateModal}
            leftIcon={<RiAddLine className="text-base" />}
          >
            {t('products.catalog.addProduct')}
          </Button>
        </div>
      </div>

      {/* Metrics / Statistics Cards (Computed in ViewModel) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          data-testid="stat-total-items"
          className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-tactile"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              {t('products.stats.totalItems')}
            </span>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-900 border border-zinc-200">
              <RiInbox2Line className="text-lg" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-950 font-mono">{state.statistics.totalItems}</p>
        </div>

        <div
          data-testid="stat-total-value"
          className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-tactile"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              {t('products.stats.inventoryValue')}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200">
              <RiMoneyDollarCircleLine className="text-lg" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-950 font-mono">
            {formatCurrency(state.statistics.totalInventoryValue, 'USD', locale)}
          </p>
        </div>

        <div
          data-testid="stat-low-stock"
          className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-tactile"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              {t('products.stats.lowStockAlert')}
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-700 border border-amber-200">
              <RiAlertLine className="text-lg" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-700 font-mono">{state.statistics.lowStockCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar (Synced with URL Query Params) */}
      <ProductFilterBar
        searchInput={state.searchInput}
        selectedCategory={state.selectedCategory}
        sortBy={state.sortBy}
        sortOrder={state.sortOrder}
        onSearchChange={actions.handleSearchChange}
        onCategoryChange={actions.handleCategoryChange}
        onSortChange={actions.handleSortChange}
      />

      {/* Loading State */}
      {state.isLoading && (
        <div className="py-16">
          <LoadingSpinner size="lg" label={t('common.loading')} />
        </div>
      )}

      {/* Error State */}
      {state.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <RiErrorWarningLine className="text-3xl text-rose-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-rose-900">{t('products.catalog.loadError')}</h3>
          <p className="mt-1 text-xs text-rose-600 font-mono">{state.errorMessage}</p>
          <Button variant="outline" size="sm" onClick={() => actions.refetch()} className="mt-4">
            {t('common.retry')}
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!state.isLoading &&
        !state.isError &&
        (state.products.length === 0 ? (
          <EmptyState
            title={t('products.catalog.noProductsTitle')}
            description={t('products.catalog.noProductsDesc')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {state.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={actions.handleDeleteProduct}
              />
            ))}
          </div>
        ))}

      {/* Create Product Modal */}
      <ProductFormModal isOpen={state.isCreateModalOpen} onClose={actions.closeCreateModal} />
    </div>
  );
}
