import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('Enterprise-Hono-Backend'),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/boilerplate_db'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long')
    .default('your-super-secret-access-key-minimum-32-chars-length'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long')
    .default('your-super-secret-refresh-key-minimum-32-chars-length'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),

  // Streamer.bot Configuration
  STREAMERBOT_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  STREAMERBOT_HOST: z.string().default('127.0.0.1'),
  STREAMERBOT_PORT: z.coerce.number().default(8080),
  STREAMERBOT_PASSWORD: z.string().optional(),

  // Google OAuth & Better Auth Configuration
  BETTER_AUTH_API_KEY: z.string().optional().default('ba_mrgchyx7eet6z35es2h7f3ag8i2c9va3'),
  BETTER_AUTH_SECRET: z.string().default('ba_mrgchyx7eet6z35es2h7f3ag8i2c9va3'),
  BETTER_AUTH_URL: z.string().default('http://localhost:4000'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_REDIRECT_URI: z.string().default('http://localhost:4000/api/auth/callback/google'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid backend environment variables:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
};

export const env = parseEnv();
