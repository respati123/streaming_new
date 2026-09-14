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
  STREAMERBOT_SCHEME: z.string().default('ws'),
  STREAMERBOT_HOST: z.string().default('127.0.0.1'),
  STREAMERBOT_PORT: z.coerce.number().default(8086),
  STREAMERBOT_ENDPOINT: z.string().default('/'),
  STREAMERBOT_PASSWORD: z.string().optional(),

  // AI Integrations
  ELEVENLABS_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().default('JBFqnCBsd6RMkjVDRZzb'),
  ELEVENLABS_VIEWER_VOICE_ID: z.string().default('JBFqnCBsd6RMkjVDRZzb'),
  ELEVENLABS_AI_VOICE_ID: z.string().default('JBFqnCBsd6RMkjVDRZzb'),
  ELEVENLABS_MODEL_ID: z.string().default('eleven_flash_v2_5'),
  ELEVENLABS_OUTPUT_FORMAT: z.string().default('mp3_44100_128'),
  ELEVENLABS_OPTIMIZE_STREAMING_LATENCY: z.coerce.number().min(0).max(4).default(3),
  PI_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  PI_PROVIDER: z.string().default('zai'),
  PI_MODEL: z.string().default('glm-5.3'),
  PI_AUTH_PATH: z.string().optional(),
  PI_WEB_SEARCH_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  PI_WEB_SEARCH_URL: z.string().url().default('https://api.z.ai/api/mcp/web_search_prime/mcp'),
  PI_MAX_REPLY_CHARS: z.coerce.number().int().min(80).max(300).default(180),
  PI_SYSTEM_PROMPT: z
    .string()
    .default(
      'Kamu adalah Stream Oracle untuk live publik berbahasa Indonesia. Jawab maksimal dua kalimat, natural, dan ramah. Tolak singkat konten seksual eksplisit, kebencian, kekerasan, doxxing, aktivitas ilegal, atau instruksi berbahaya. Jangan mengklaim dapat memakai tool, terminal, file, atau perangkat.'
    ),
  PAKASIR_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  PAKASIR_PROJECT_SLUG: z.string().optional(),
  PAKASIR_API_KEY: z.string().optional(),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  CHATAI_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  CHATAI_COOLDOWN_SECONDS: z.coerce.number().int().min(0).max(300).default(0),
  CHATAI_AUDIO_DIR: z.string().default('./storage/chatai'),
  CHATAI_MEDIA_BASE_URL: z.string().url().default('http://localhost:4000'),

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
