import { describe, expect, it } from 'bun:test';
import { resolveLanguage } from './i18n.middleware';

describe('i18n Language Detection Middleware', () => {
  it('should detect Indonesian from various Accept-Language patterns', () => {
    expect(resolveLanguage('id-ID,id;q=0.9')).toBe('id');
    expect(resolveLanguage('id')).toBe('id');
    expect(resolveLanguage('ID-ID')).toBe('id');
    expect(resolveLanguage(undefined, 'id')).toBe('id');
    expect(resolveLanguage(undefined, undefined, 'id')).toBe('id');
  });

  it('should detect English from various Accept-Language patterns', () => {
    expect(resolveLanguage('en-US,en;q=0.9')).toBe('en');
    expect(resolveLanguage('en')).toBe('en');
    expect(resolveLanguage(undefined, 'en')).toBe('en');
  });

  it('should fallback to default language (en) for unrecognized locales', () => {
    expect(resolveLanguage('fr-FR')).toBe('en');
    expect(resolveLanguage(null, null, null)).toBe('en');
    expect(resolveLanguage('', '', '')).toBe('en');
  });
});
