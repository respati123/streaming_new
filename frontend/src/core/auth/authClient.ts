import { env } from '@core/config/env';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: env.VITE_BETTER_AUTH_URL || 'http://localhost:4001',
  fetchOptions: {
    credentials: 'include',
  },
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
