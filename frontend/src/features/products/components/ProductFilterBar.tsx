import { Input } from '@shared/components/ui/Input';
import { useTranslation } from '@shared/hooks/useTranslation';
import { RiArrowUpDownLine, RiSearchLine } from 'react-icons/ri';
import type {
  ProductCategoryOption,
  ProductFilterBarProps,
} from '../types/product-component.types';

export function ProductFilterBar({
  searchInput,
  selectedCategory,
  sortBy,
  sortOrder,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: ProductFilterBarProps) {
  const { t } = useTranslation();

  const categories: ProductCategoryOption[] = [
    { label: t('products.categories.all'), value: 'all' },
    { label: t('products.categories.electronics'), value: 'electronics' },
    { label: t('products.categories.clothing'), value: 'clothing' },
    { label: t('products.categories.food'), value: 'food' },
    { label: t('products.categories.accessories'), value: 'accessories' },
  ];

  return (
    <div
      data-testid="product-filter-bar"
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-tactile md:flex-row md:items-center md:justify-between font-sans"
    >
      {/* Search Input */}
      <div className="w-full md:max-w-xs">
        <Input
          data-testid="product-search-input"
          placeholder={t('products.catalog.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<RiSearchLine className="text-base" />}
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              data-testid={`product-category-${cat.value}`}
              onClick={() => onCategoryChange(cat.value)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                isSelected
                  ? 'bg-zinc-950 text-white shadow-tactile'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Sort Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-zinc-400 font-mono uppercase text-[10px]">{t('common.sortBy')}</span>
        <button
          type="button"
          data-testid="product-sort-date"
          onClick={() => onSortChange('createdAt')}
          className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            sortBy === 'createdAt'
              ? 'border-zinc-950 bg-zinc-950 text-white shadow-tactile'
              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          <span>{t('common.date')}</span>
          {sortBy === 'createdAt' && <RiArrowUpDownLine className="ml-0.5 text-xs" />}
        </button>

        <button
          type="button"
          data-testid="product-sort-price"
          onClick={() => onSortChange('price')}
          className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            sortBy === 'price'
              ? 'border-zinc-950 bg-zinc-950 text-white shadow-tactile'
              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          <span>
            {t('common.price')} ({sortOrder.toUpperCase()})
          </span>
          {sortBy === 'price' && <RiArrowUpDownLine className="ml-0.5 text-xs" />}
        </button>
      </div>
    </div>
  );
}
