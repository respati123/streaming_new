import { createAuthClient } from 'better-auth/react';
import { env } from '@core/config/env';

export const authClient = createAuthClient({
  baseURL: env.VITE_BETTER_AUTH_URL,
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
