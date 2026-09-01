import type { z } from 'zod';
import type { loginSchema } from '../models/auth.schema';

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginViewModelState {
  formValues: LoginFormValues;
  errors: Partial<Record<keyof LoginFormValues, string>>;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export interface LoginViewModelActions {
  handleFieldChange: <K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) => void;
  handleSubmit: (e: React.FormEvent) => void;
  fillDemoCredentials: () => void;
}

export interface UseLoginViewModelReturn {
  state: LoginViewModelState;
  actions: LoginViewModelActions;
}
