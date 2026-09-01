import { useAuthStore } from '@shared/stores/auth.store';
import type React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * Guards public auth pages (e.g. /login). Redirects logged-in users away to origin or `/products`.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    const from =
      (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/products';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
