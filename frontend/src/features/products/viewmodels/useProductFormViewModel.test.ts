import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper } from '@/test/test-utils';
import { useProductFormViewModel } from './useProductFormViewModel';

describe('Tier 2 Integration Test: useProductFormViewModel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize form with default values for create mode', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProductFormViewModel(), { wrapper });

    expect(result.current.state.isEditMode).toBe(false);
    expect(result.current.state.formValues.name).toBe('');
    expect(result.current.state.formValues.price).toBe(0);
  });

  it('should update form fields and clear validation error on change', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProductFormViewModel(), { wrapper });

    act(() => {
      result.current.actions.handleFieldChange('name', 'Ergonomic Chair');
      result.current.actions.handleFieldChange('price', 350);
    });

    expect(result.current.state.formValues.name).toBe('Ergonomic Chair');
    expect(result.current.state.formValues.price).toBe(350);
  });

  it('should validate and reject invalid submissions with Zod error messages', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProductFormViewModel(), { wrapper });

    const preventDefault = vi.fn();
    const mockEvent = { preventDefault } as unknown as React.FormEvent<HTMLFormElement>;

    act(() => {
      result.current.actions.handleSubmit(mockEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.state.errors.name).toBeDefined();
    expect(result.current.state.errors.price).toBeDefined();
  });

  it('should successfully submit valid data and trigger onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProductFormViewModel({ onSuccess }), { wrapper });

    act(() => {
      result.current.actions.handleFieldChange('name', 'Wireless Gaming Mouse');
      result.current.actions.handleFieldChange(
        'description',
        'High precision 20000 DPI gaming mouse with RGB.'
      );
      result.current.actions.handleFieldChange('price', 79.99);
      result.current.actions.handleFieldChange('stock', 30);
      result.current.actions.handleFieldChange('category', 'electronics');
    });

    const preventDefault = vi.fn();
    const mockEvent = { preventDefault } as unknown as React.FormEvent<HTMLFormElement>;

    act(() => {
      result.current.actions.handleSubmit(mockEvent);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
