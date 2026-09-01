import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_TITLE: z.string().default('Respati Stream Hub Pro'),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:4000/api/v1'),
  VITE_BETTER_AUTH_URL: z.string().default('http://localhost:4000'),
  VITE_WS_URL: z.string().default('ws://localhost:4000/ws'),
  VITE_ENABLE_MOCK_API: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  MODE: z.string().default('development'),
  DEV: z.boolean().default(true),
  PROD: z.boolean().default(false),
});

const parseEnv = () => {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    console.error('[ENV ERROR] Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
};

export const env = parseEnv();
