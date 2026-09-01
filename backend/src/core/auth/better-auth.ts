import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { dash } from '@better-auth/infra';
import { db } from '@core/database';
import * as schema from '@core/database/schema';
import { env } from '@core/config/env';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_API_KEY || env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    env.FRONTEND_URL,
  ],
  plugins: [
    dash(),
  ],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || 'dummy-google-client-id.apps.googleusercontent.com',
      clientSecret: env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
      redirectURI: env.GOOGLE_REDIRECT_URI,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'viewer',
        required: false,
      },
    },
  },
});
