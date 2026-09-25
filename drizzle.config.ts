import { defineConfig } from 'drizzle-kit';

// drizzle-kit does not read .env.local on its own.
try {
  process.loadEnvFile('.env.local');
} catch {
  // Fall back to variables already present in the environment (CI, hosting).
}

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
});
