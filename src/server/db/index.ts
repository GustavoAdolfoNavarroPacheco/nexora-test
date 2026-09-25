import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL no está definida. Copia .env.example a .env.local y añade la cadena de Neon.');
  }
  return url;
}

// neon-http runs each query over HTTPS: no socket pool to exhaust in serverless functions.
export const db = drizzle(neon(connectionString()), { schema });
export { schema };
