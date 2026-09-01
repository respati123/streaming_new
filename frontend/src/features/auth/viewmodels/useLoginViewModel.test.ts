import { useAuthStore } from '@shared/stores/auth.store';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from '@/test/test-utils';
import { useLoginViewModel } from './useLoginViewModel';

describe('useLoginViewModel Integration Test', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('should fill demo credentials correctly', () => {
    const { result } = renderHook(() => useLoginViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.actions.fillDemoCredentials();
    });

    expect(result.current.state.formValues.email).toBe('admin@antigravity.dev');
    expect(result.current.state.formValues.password).toBe('password123');
  });

  it('should validate form and show error for empty fields', () => {
    const { result } = renderHook(() => useLoginViewModel(), {
      wrapper: createWrapper(),
    });

    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;

    act(() => {
      result.current.actions.handleSubmit(fakeEvent);
    });

    expect(result.current.state.errors.email).toBeDefined();
    expect(result.current.state.errors.password).toBeDefined();
  });
});
