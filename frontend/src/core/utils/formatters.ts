import type { CurrencyCode, LocaleIdentifier } from './formatter.types';

/**
 * Format numbers as standard currency (USD default or IDR)
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  locale: LocaleIdentifier = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date string into human-friendly format
 */
export function formatDate(dateString: string | Date, locale: LocaleIdentifier = 'en-US'): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Capitalize first character
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
