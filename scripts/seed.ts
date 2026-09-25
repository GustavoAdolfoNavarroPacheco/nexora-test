/**
 * Fills the Neon database with the sample workspace.
 * Run with: npm run db:seed   (reads DATABASE_URL from .env.local)
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/server/db/schema';
import { seedWorkspace } from '../src/server/seed';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está definida (revisa .env.local).');
  const db = drizzle(neon(url), { schema });
  const tz = process.env.APP_TIMEZONE || 'America/Bogota';
  await seedWorkspace(db, tz);
  console.log('Datos de ejemplo cargados en Neon.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
