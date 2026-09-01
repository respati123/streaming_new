import { describe, expect, it } from 'vitest';
import { translate } from './i18n';

describe('Tier 1 Unit Test: i18n translate engine', () => {
  it('should translate English keys properly', () => {
    const result = translate('en', 'common.refresh');
    expect(result).toBe('Refresh');
  });

  it('should translate Indonesian keys properly', () => {
    const result = translate('id', 'common.refresh');
    expect(result).toBe('Segarkan');
  });

  it('should interpolate params in string placeholders', () => {
    const result = translate('en', 'products.card.stock', { count: 12 });
    expect(result).toBe('Stock: 12 units');

    const resultId = translate('id', 'products.card.stock', { count: 12 });
    expect(resultId).toBe('Stok: 12 unit');
  });

  it('should fallback to English when key is missing in target language', () => {
    const result = translate('id', 'common.appName');
    expect(result).toBe('Vite MVVM');
  });
});
