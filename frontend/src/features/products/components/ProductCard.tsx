import { formatCurrency, formatDate } from '@core/utils/formatters';
import { Badge } from '@shared/components/ui/Badge';
import { useTranslation } from '@shared/hooks/useTranslation';
import type { BadgeVariant } from '@shared/types/badge.types';
import {
  RiArrowRightUpLine,
  RiDeleteBinLine,
  RiInbox2Line,
  RiStarFill,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import type { ProductCardProps } from '../types/product-component.types';
import type { ProductCategory } from '../types/product.types';

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const { t, language } = useTranslation();
  const locale = language === 'id' ? 'id-ID' : 'en-US';

  const categoryVariantMap: Record<ProductCategory, BadgeVariant> = {
    electronics: 'primary',
    clothing: 'warning',
    food: 'success',
    accessories: 'neutral',
  };

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-tactile transition-all duration-200 hover:-translate-y-1 hover:shadow-diffusion font-sans"
    >
      {/* Image & Category Overlay */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={categoryVariantMap[product.category] || 'neutral'}>
            {t(`products.categories.${product.category}` as unknown as Parameters<typeof t>[0]) ||
              product.category.toUpperCase()}
          </Badge>
        </div>

        {/* Rating pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-zinc-950/80 px-2 py-0.5 text-xs font-semibold text-amber-400 backdrop-blur-md border border-white/10 font-mono">
          <RiStarFill className="text-amber-400 text-xs" />
          <span>{product.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3
            data-testid={`product-title-${product.id}`}
            className="font-bold text-zinc-950 line-clamp-1 group-hover:text-zinc-700 transition-colors"
          >
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Stock & Meta */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <RiInbox2Line className="text-zinc-400 text-xs" />
            <span>{t('products.card.stock', { count: product.stock })}</span>
          </div>
          <span>{formatDate(product.createdAt, locale)}</span>
        </div>

        {/* Price & Action */}
        <div className="mt-3 flex items-center justify-between">
          <span
            data-testid={`product-price-${product.id}`}
            className="text-base font-extrabold text-zinc-950 tracking-tight font-mono"
          >
            {formatCurrency(product.price, 'USD', locale)}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid={`delete-product-btn-${product.id}`}
              onClick={() => onDelete(product.id)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title={t('products.card.deleteTooltip')}
            >
              <RiDeleteBinLine className="text-base" />
            </button>
            <Link
              to={`/products/${product.id}`}
              data-testid={`view-detail-btn-${product.id}`}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-950 p-2 text-white hover:bg-zinc-800 transition-colors shadow-tactile active:scale-95"
              title={t('products.card.viewDetails')}
            >
              <RiArrowRightUpLine className="text-base" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
