import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'Nexora — Plataforma de Gestión de Proyectos y Equipos',
  description:
    'Centro de control para la gestión de proyectos, tareas, responsables y métricas operativas de alto rendimiento.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
