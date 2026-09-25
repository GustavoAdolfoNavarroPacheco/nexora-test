import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { connection } from 'next/server';
import { AppShell } from '@/components/layout/app-shell';
import { DatabaseUnavailable } from '@/components/layout/database-unavailable';
import { getWorkspace } from '@/server/workspace';
import type { WorkspaceData } from '@/lib/workspace';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Nexora — Proyectos y equipos',
  description:
    'Sigue el avance de cada proyecto, reparte el trabajo del equipo y detecta a tiempo lo que se está retrasando.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// Applies the saved theme before first paint so dark-mode users never see a white flash.
const themeScript = `(function(){try{var t=localStorage.getItem('nexora_saas_theme');var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Workspace data is read from Neon on every request, never baked in at build time.
  await connection();
  let workspace: WorkspaceData | null = null;
  try {
    workspace = await getWorkspace();
  } catch (err) {
    console.error('[layout] No se pudo leer la base de datos', err);
  }

  return (
    <html lang="es" className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans antialiased">
        {workspace ? <AppShell initialData={workspace}>{children}</AppShell> : <DatabaseUnavailable />}
      </body>
    </html>
  );
}
