import { env } from '@core/config/env';
import { createAuthClient } from 'better-auth/react';

function getAuthBaseUrl(): string {
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `http://${window.location.hostname}:4001`;
  }
  return env.VITE_BETTER_AUTH_URL || 'http://localhost:4001';
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  fetchOptions: {
    credentials: 'include',
  },
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
