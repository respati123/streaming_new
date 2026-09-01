import { describe, expect, it } from 'bun:test';
import type { AppEnvironment } from '@core/types/context.types';
import { Hono } from 'hono';
import { requireRoles } from './roles.middleware';

describe('Roles Guard Middleware (RBAC)', () => {
  it('should allow access when user role matches allowed roles', async () => {
    const app = new Hono<AppEnvironment>();
    app.use('*', async (c, next) => {
      c.set('user', { id: '1', email: 'admin@dev.com', name: 'Admin', role: 'admin' });
      await next();
    });
    app.get('/admin-only', requireRoles('admin'), (c) => c.text('Admin Area'));

    const res = await app.request('/admin-only');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Admin Area');
  });

  it('should throw 403 Forbidden when user role is not allowed', async () => {
    const app = new Hono<AppEnvironment>();
    app.use('*', async (c, next) => {
      c.set('user', { id: '2', email: 'user@dev.com', name: 'User', role: 'user' });
      await next();
    });
    app.get('/admin-only', requireRoles('admin'), (c) => c.text('Admin Area'));

    const res = await app.request('/admin-only');
    expect(res.status).toBe(403);
  });
});
