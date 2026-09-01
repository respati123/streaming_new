import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from '@/test/test-utils';
import { useProductListViewModel } from './useProductListViewModel';

describe('Tier 2 Integration Test: useProductListViewModel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should fetch and load initial product list with computed statistics', async () => {
    const wrapper = createWrapper(['/products']);
    const { result } = renderHook(() => useProductListViewModel(), { wrapper });

    expect(result.current.state.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    expect(result.current.state.products.length).toBeGreaterThan(0);
    expect(result.current.state.statistics.totalItems).toBe(result.current.state.products.length);
    expect(result.current.state.statistics.totalInventoryValue).toBeGreaterThan(0);
  });

  it('should handle category and sort changes seamlessly', async () => {
    const wrapper = createWrapper(['/products']);
    const { result } = renderHook(() => useProductListViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    act(() => {
      result.current.actions.handleCategoryChange('clothing');
    });

    act(() => {
      result.current.actions.handleSortChange('price');
    });

    expect(result.current.state.sortBy).toBe('price');
    expect(result.current.state.sortOrder).toBe('asc');
  });

  it('should control create modal disclosure state', () => {
    const wrapper = createWrapper(['/products']);
    const { result } = renderHook(() => useProductListViewModel(), { wrapper });

    expect(result.current.state.isCreateModalOpen).toBe(false);

    act(() => {
      result.current.actions.openCreateModal();
    });
    expect(result.current.state.isCreateModalOpen).toBe(true);

    act(() => {
      result.current.actions.closeCreateModal();
    });
    expect(result.current.state.isCreateModalOpen).toBe(false);
  });
});
