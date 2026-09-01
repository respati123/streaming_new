import { APP_CONFIG } from '@core/constants/app.constant';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDocumentTitle } from './useDocumentTitle';

describe('useDocumentTitle Hook', () => {
  it('should format document title with app name', () => {
    renderHook(() => useDocumentTitle('Custom Page'));
    expect(document.title).toBe(`Custom Page | ${APP_CONFIG.NAME}`);
  });

  it('should restore previous document title on unmount', () => {
    document.title = 'Original Title';
    const { unmount } = renderHook(() => useDocumentTitle('Temporary Page', true));
    expect(document.title).toBe(`Temporary Page | ${APP_CONFIG.NAME}`);

    unmount();
    expect(document.title).toBe('Original Title');
  });
});
