import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('Tier 1 Unit Test: useDebounce hook', () => {
  it('should return initial value immediately and update only after delay', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 300 },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 300 });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');

    vi.useRealTimers();
  });
});
