import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400', '500'],
  variable: '--font-serif',
  display: 'swap',
});

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
    <html lang="es" className={`${inter.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#f5f5f5] text-[#292524] selection:bg-[#f0efed] selection:text-[#0c0a09]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
