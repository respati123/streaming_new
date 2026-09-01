import type { UseDisclosureReturn } from '@shared/types/disclosure.types';
import { useCallback, useState } from 'react';

/**
 * Custom hook to manage open/close/toggle state for Modals, Drawers, Dropdowns.
 */
export function useDisclosure(initialState: boolean = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

export type { UseDisclosureReturn };
