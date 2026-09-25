import { db } from '@/server/db';
import { APP_TIMEZONE } from '@/server/config';
import { seedWorkspace } from '@/server/seed';
import { getWorkspace } from '@/server/workspace';
import { authed } from '@/server/session';

/** Restores the sample workspace ("Restaurar datos originales" in Configuración). Accounts are kept. */
export const POST = authed(async (userId) => {
  await seedWorkspace(db, APP_TIMEZONE);
  return getWorkspace(userId);
});
