import type { ErrorCode } from '@core/constants/error-codes.constant';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  meta?: PaginationMeta;
  requestId?: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  code?: ErrorCode | string;
  errors?: ApiFieldError[] | Record<string, string[]>;
  requestId?: string;
  stack?: string;
}
