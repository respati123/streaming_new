export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  meta?: PaginationMeta;
}

export interface StandardApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export type ApiError = StandardApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}

export interface QueryFilterParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
