import { describe, expect, it } from 'bun:test';
import { app } from './app';

describe('HTTP Router & API Integration Tests (app.ts)', () => {
  it('GET /health (English) - should return localized system health status and metrics', async () => {
    const res = await app.request('/health', {
      headers: { 'Accept-Language': 'en' },
    });
    const json = (await res.json()) as {
      success: boolean;
      message: string;
      data: {
        status: string;
        environment: string;
        appName: string;
        database: { status: string };
      };
    };

    expect(res.status).toBeOneOf([200, 503]);
    expect(json.success).toBe(true);
    expect(json.data.environment).toBeDefined();
    expect(json.data.appName).toBeDefined();
    expect(json.message).toBeOneOf(['All services operational', 'Database service unavailable']);
    expect(res.headers.get('content-language')).toBe('en');
  });

  it('GET /health (Indonesian) - should return localized message in Indonesian', async () => {
    const res = await app.request('/health', {
      headers: { 'Accept-Language': 'id-ID,id;q=0.9' },
    });
    const json = (await res.json()) as {
      success: boolean;
      message: string;
      data: {
        status: string;
        environment: string;
        appName: string;
      };
    };

    expect(res.status).toBeOneOf([200, 503]);
    expect(json.success).toBe(true);
    expect(json.message).toBeOneOf([
      'Semua layanan beroperasi dengan normal',
      'Layanan database sedang tidak tersedia',
    ]);
    expect(res.headers.get('content-language')).toBe('id');
  });

  it('GET /unknown-route (English) - should return 404 with English message by default', async () => {
    const res = await app.request('/api/v1/non-existent-route', {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    const json = (await res.json()) as {
      success: boolean;
      message: string;
      statusCode: number;
      code: string;
      requestId?: string;
    };

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.statusCode).toBe(404);
    expect(json.code).toBe('NOT_FOUND');
    expect(json.message).toContain('Route not found');
    expect(json.requestId).toBeDefined();
    expect(res.headers.get('content-language')).toBe('en');
  });

  it('GET /unknown-route (Indonesian) - should return 404 with Indonesian message when Accept-Language: id', async () => {
    const res = await app.request('/api/v1/non-existent-route', {
      headers: { 'Accept-Language': 'id-ID,id;q=0.9' },
    });
    const json = (await res.json()) as {
      success: boolean;
      message: string;
      statusCode: number;
      code: string;
      requestId?: string;
    };

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.statusCode).toBe(404);
    expect(json.code).toBe('NOT_FOUND');
    expect(json.message).toContain('Rute tidak ditemukan');
    expect(res.headers.get('content-language')).toBe('id');
  });

  it('Response Headers - should inject X-Request-Id header in every response', async () => {
    const res = await app.request('/health');
    const requestIdHeader = res.headers.get('x-request-id');

    expect(requestIdHeader).toBeDefined();
    expect(requestIdHeader?.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/auth/login (English) - should return localized Validation Failed error', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
      },
      body: JSON.stringify({}),
    });

    const json = (await res.json()) as {
      success: boolean;
      message: string;
      statusCode: number;
      code: string;
      errors?: Array<{ field: string; message: string }>;
    };

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.code).toBe('VALIDATION_ERROR');
    expect(json.message).toBe('Validation Failed');
    expect(json.errors).toBeDefined();
  });

  it('POST /api/v1/auth/login (Indonesian) - should return localized Validasi Data Gagal error', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'id',
      },
      body: JSON.stringify({}),
    });

    const json = (await res.json()) as {
      success: boolean;
      message: string;
      statusCode: number;
      code: string;
      errors?: Array<{ field: string; message: string }>;
    };

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.code).toBe('VALIDATION_ERROR');
    expect(json.message).toBe('Validasi Data Gagal');
    expect(json.errors).toBeDefined();
  });
});
