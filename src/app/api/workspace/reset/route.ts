import { db } from '@/server/db';
import { APP_TIMEZONE } from '@/server/config';
import { seedWorkspace } from '@/server/seed';
import { getWorkspace } from '@/server/workspace';
import { handle } from '@/server/http';

/** Restores the sample workspace ("Restaurar datos originales" in Configuración). */
export const POST = handle(async () => {
  await seedWorkspace(db, APP_TIMEZONE);
  return getWorkspace();
});
