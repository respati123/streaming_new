# 06 - API Integration & Error Handling

This document establishes the architecture for HTTP communication, request/response interceptors, error envelopes, and type-safe validation.

---

## 🌐 Centralized HTTP Client (`@core/http/api-client.ts`)

We configure a pre-configured Axios instance with:
1. **Base URL** from validated environment variables (`VITE_API_BASE_URL`).
2. **Request Interceptor**: Injects Bearer token automatically if available.
3. **Response Interceptor**: Unwraps standard response data envelopes and normalizes backend error responses into a consistent `ApiError` structure.

```typescript
// @core/http/api-client.ts
import axios, { type AxiosError } from 'axios';
import { env } from '@core/config/env';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📦 Standard API Response Envelope

Every backend endpoint should adhere to (or be mapped to) this TypeScript interface:

```typescript
// @shared/types/api.types.ts
export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
```

---

## 🛡️ Validation with Zod

Never trust incoming or outgoing data blindly. Use Zod schemas in `features/<feature>/models/`:

```typescript
// features/products/models/product.schema.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  category: z.enum(['electronics', 'clothing', 'food']),
  description: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

---

## ⚡ Service Layer Pattern

Services encapsulate endpoints into reusable async functions:

```typescript
// features/products/services/product.service.ts
import { apiClient } from '@core/http/api-client';
import { type Product } from '../models/product.model';
import { type CreateProductInput } from '../models/product.schema';

export const productService = {
  getAll: async (params?: { search?: string; category?: string }): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products', { params });
    return response.data;
  },

  create: async (payload: CreateProductInput): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
```
