import { z } from 'zod';

/**
 * Polyfill z.url for compatibility with @better-auth/infra
 */
if (typeof (z as any).url !== 'function') {
  try {
    Object.defineProperty(z, 'url', {
      value: (params?: any) => z.string().url(params),
      writable: true,
      configurable: true,
    });
  } catch {
    (z as any).url = (params?: any) => z.string().url(params);
  }
}
