import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { DatabaseUnavailable } from '@/components/layout/database-unavailable';
import { WELCOME_COOKIE } from '@/lib/auth-shared';
import { getSession } from '@/server/session';
import { getWorkspace } from '@/server/workspace';
import type { WorkspaceData } from '@/lib/workspace';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // proxy.ts already sends visitors without a session cookie to /login; this catches expired or revoked ones.
  if (!session) redirect('/login');

  // Workspace data is read from Neon on every request, never baked in at build time.
  let workspace: WorkspaceData | null = null;
  try {
    workspace = await getWorkspace(session.user.id);
  } catch (err) {
    console.error('[layout] No se pudo leer la base de datos', err);
  }
  if (!workspace) return <DatabaseUnavailable />;

  // Set by the login screen just before leaving for Google or Apple.
  const welcome = (await cookies()).get(WELCOME_COOKIE)?.value;

  return (
    <AppShell initialData={workspace} welcome={welcome === 'google' || welcome === 'apple' ? welcome : undefined}>
      {children}
    </AppShell>
  );
}
