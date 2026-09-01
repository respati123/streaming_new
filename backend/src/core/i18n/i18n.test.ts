import { describe, expect, it } from 'bun:test';
import type { AppEnvironment } from '@core/types/context.types';
import type { Context } from 'hono';
import { getLocale, getTranslator, t } from './i18n';

describe('Backend i18n Translation Engine & Helpers', () => {
  it('should translate error messages correctly in English', () => {
    expect(t('en', 'errors.unauthorized')).toBe(
      'Authentication required. Please provide a valid Bearer token.'
    );
    expect(t('en', 'errors.validationFailed')).toBe('Validation Failed');
  });

  it('should translate error messages correctly in Indonesian', () => {
    expect(t('id', 'errors.unauthorized')).toBe(
      'Autentikasi diperlukan. Harap sertakan token Bearer yang valid.'
    );
    expect(t('id', 'errors.validationFailed')).toBe('Validasi Data Gagal');
  });

  it('should translate success message constants in both languages', () => {
    expect(t('en', 'success.loginSuccessful')).toBe('Login successful.');
    expect(t('id', 'success.loginSuccessful')).toBe('Login berhasil.');
    expect(t('en', 'success.productCreated')).toBe('Product created successfully');
    expect(t('id', 'success.productCreated')).toBe('Produk berhasil ditambahkan');
  });

  it('should interpolate dynamic parameter tokens correctly in both languages', () => {
    expect(t('en', 'errors.routeNotFound', { method: 'GET', path: '/api/v1/test' })).toBe(
      'Route not found: GET /api/v1/test'
    );
    expect(t('id', 'errors.routeNotFound', { method: 'POST', path: '/api/v1/test' })).toBe(
      'Rute tidak ditemukan: POST /api/v1/test'
    );
  });

  it('should provide a getTranslator helper bound to Hono context with language switching', () => {
    const mockVariables: Record<string, unknown> = { language: 'en' };
    const mockHeaders = new Headers();

    const mockContext = {
      get: (key: string) => mockVariables[key],
      set: (key: string, val: unknown) => {
        mockVariables[key] = val;
      },
      res: {
        headers: mockHeaders,
      },
    } as unknown as Context<AppEnvironment>;

    expect(getLocale(mockContext)).toBe('en');

    const translator = getTranslator(mockContext);
    expect(translator.language).toBe('en');
    expect(translator.t('success.productsRetrieved')).toBe('Products retrieved successfully');

    translator.setLanguage('id');
    expect(mockVariables.language).toBe('id');
    expect(mockHeaders.get('Content-Language')).toBe('id');

    const idTranslator = getTranslator(mockContext);
    expect(idTranslator.language).toBe('id');
    expect(idTranslator.t('success.productsRetrieved')).toBe('Daftar produk berhasil dimuat');
  });
});
