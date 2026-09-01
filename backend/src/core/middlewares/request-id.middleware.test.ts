import { describe, expect, it } from 'bun:test';
import type { AppEnvironment } from '@core/types/context.types';
import { Hono } from 'hono';
import { REQUEST_ID_HEADER, requestIdMiddleware } from './request-id.middleware';

describe('RequestId Middleware', () => {
  it('should generate a new UUID if no X-Request-Id header is provided', async () => {
    const app = new Hono<AppEnvironment>();
    app.use('*', requestIdMiddleware);
    app.get('/test', (c) => c.text(`ID: ${c.get('requestId')}`));

    const res = await app.request('/test');
    expect(res.status).toBe(200);

    const headerId = res.headers.get(REQUEST_ID_HEADER);
    expect(headerId).toBeDefined();
    expect(headerId?.length).toBe(36);

    const body = await res.text();
    expect(body).toBe(`ID: ${headerId}`);
  });

  it('should preserve and propagate incoming X-Request-Id header', async () => {
    const customId = 'custom-trace-id-12345';
    const app = new Hono<AppEnvironment>();
    app.use('*', requestIdMiddleware);
    app.get('/test', (c) => c.text(`ID: ${c.get('requestId')}`));

    const res = await app.request('/test', {
      headers: {
        [REQUEST_ID_HEADER]: customId,
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get(REQUEST_ID_HEADER)).toBe(customId);

    const body = await res.text();
    expect(body).toBe(`ID: ${customId}`);
  });
});
