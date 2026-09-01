import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/core/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/boilerplate_db',
  },
  verbose: true,
  strict: true,
});
