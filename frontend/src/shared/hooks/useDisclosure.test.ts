import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDisclosure } from './useDisclosure';

describe('Tier 1 Unit Test: useDisclosure hook', () => {
  it('should initialize with default false state', () => {
    const { result } = renderHook(() => useDisclosure(false));
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle, open, and close correctly', () => {
    const { result } = renderHook(() => useDisclosure(false));

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
  });
});
