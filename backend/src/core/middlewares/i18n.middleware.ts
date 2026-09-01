import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@core/i18n/i18n.types';
import type { AppEnvironment } from '@core/types/context.types';
import type { MiddlewareHandler } from 'hono';

/**
 * Parses and normalizes incoming language header or query param.
 * Supports standard Accept-Language (e.g. 'id', 'id-ID', 'en', 'en-US'),
 * custom x-lang header, or ?lang= query param.
 */
export function resolveLanguage(
  acceptLanguage?: string | null,
  customHeader?: string | null,
  queryParam?: string | null
): SupportedLanguage {
  const rawCandidate = customHeader || queryParam || acceptLanguage || '';
  const lower = rawCandidate.toLowerCase().trim();

  if (lower.startsWith('id') || lower.startsWith('in') || lower.includes('indonesia')) {
    return 'id';
  }

  if (lower.startsWith('en')) {
    return 'en';
  }

  return DEFAULT_LANGUAGE;
}

/**
 * i18n Middleware for Hono
 * Extracts client language preference from each request and binds it to context.
 */
export const i18nMiddleware: MiddlewareHandler<AppEnvironment> = async (c, next) => {
  const acceptLanguage = c.req.header('Accept-Language');
  const customHeader = c.req.header('x-lang');
  const queryParam = c.req.query('lang');

  const language = resolveLanguage(acceptLanguage, customHeader, queryParam);
  c.set('language', language);

  await next();

  c.res.headers.set('Content-Language', language);
};
