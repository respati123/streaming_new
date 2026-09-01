import { describe, expect, it } from 'vitest';
import { capitalize, formatCurrency, formatDate } from './formatters';

describe('Tier 1 Unit Test: formatters', () => {
  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      const formatted = formatCurrency(250, 'USD', 'en-US');
      expect(formatted).toContain('250');
      expect(formatted).toContain('$');
    });

    it('should format IDR currency for Indonesian locale', () => {
      const formatted = formatCurrency(150000, 'IDR', 'id-ID');
      expect(formatted).toContain('150.000');
    });
  });

  describe('formatDate', () => {
    it('should format date string into localized human-readable string', () => {
      const formatted = formatDate('2026-08-28T00:00:00Z', 'en-US');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Aug');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first character of a string', () => {
      expect(capitalize('electronics')).toBe('Electronics');
      expect(capitalize('')).toBe('');
    });
  });
});
