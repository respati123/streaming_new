import { env } from '@core/config/env';
import { STORAGE_KEYS } from '@core/constants/app.constant';
import { LANGUAGE_STORAGE_KEY } from '@core/i18n/i18n';
import type { StandardApiError } from '@shared/types/api.types';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    if (config.headers) {
      config.headers['Accept-Language'] = currentLanguage;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post<{
          success: boolean;
          data: { accessToken: string };
        }>(`${env.VITE_API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });

        if (refreshResponse.data.success && refreshResponse.data.data.accessToken) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    }

    const normalizedError: StandardApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };

    if (normalizedError.statusCode === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    return Promise.reject(normalizedError);
  }
);

export type { StandardApiError };
