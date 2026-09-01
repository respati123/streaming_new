import type { PaginationMeta } from '@core/types/api.types';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export function parsePaginationParams(query: Record<string, string | undefined>): PaginationParams {
  const rawPage = Number.parseInt(query.page || '1', 10);
  const rawLimit = Number.parseInt(query.limit || '10', 10);

  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 100);
  const offset = (page - 1) * limit;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder: 'asc' | 'desc' = query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return {
    page,
    limit,
    offset,
    sortBy,
    sortOrder,
  };
}

export function createPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
}
