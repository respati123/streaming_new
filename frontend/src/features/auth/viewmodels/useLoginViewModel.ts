import { useAuthStore } from '@shared/stores/auth.store';
import { useUIStore } from '@shared/stores/ui.store';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginSchema } from '../models/auth.schema';
import type { LoginFormValues, UseLoginViewModelReturn } from '../types/auth.types';

const INITIAL_FORM: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
};

export function useLoginViewModel(): UseLoginViewModelReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);

  const [formValues, setFormValues] = useState<LoginFormValues>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/products';

  const handleFieldChange = <K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K]
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const fillDemoCredentials = () => {
    setFormValues({
      email: 'admin@antigravity.dev',
      password: 'password123',
      rememberMe: true,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = loginSchema.safeParse(formValues);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof LoginFormValues, string>> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormValues;
        if (field) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      login(
        {
          id: 'usr_admin',
          name: 'Demo Admin',
          email: validation.data.email,
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        },
        'mock_jwt_token_auth_guard'
      );

      addToast({
        title: 'Welcome back!',
        message: 'You have logged in successfully.',
        type: 'success',
      });

      navigate(from, { replace: true });
    } catch {
      setErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      formValues,
      errors,
      isSubmitting,
      errorMessage,
    },
    actions: {
      handleFieldChange,
      handleSubmit,
      fillDemoCredentials,
    },
  };
}
