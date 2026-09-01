import type { ReactNode } from 'react';

export type ModalMaxWidth = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  maxWidth?: ModalMaxWidth;
  closeOnEscape?: boolean;
  dataTestId?: string;
}
