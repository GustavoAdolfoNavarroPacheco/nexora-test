'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { NotificationFlyout } from '@/components/notifications/notification-flyout';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const pathname = usePathname();
  const {
    currentUser,
    notifications,
    theme,
    setTheme,
    setIsCommandPaletteOpen,
    setIsCreateProjectOpen,
    projects,
  } = useStore();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Build breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname === '/') {
      return [{ label: 'Dashboard', href: '/' }];
    }
    if (pathname.startsWith('/proyectos/')) {
      const projectId = pathname.split('/')[2];
      const project = projects.find((p) => p.id === projectId);
      return [
        { label: 'Proyectos', href: '/proyectos' },
        { label: project?.name || 'Detalle del proyecto', href: pathname },
      ];
    }
    if (pathname === '/proyectos') {
      return [{ label: 'Proyectos', href: '/proyectos' }];
    }
    if (pathname === '/tareas') {
      return [{ label: 'Tareas', href: '/tareas' }];
    }
    if (pathname === '/equipo') {
      return [{ label: 'Equipo', href: '/equipo' }];
    }
    if (pathname === '/actividad') {
      return [{ label: 'Actividad', href: '/actividad' }];
    }
    if (pathname === '/reportes') {
      return [{ label: 'Reportes', href: '/reportes' }];
    }
    if (pathname === '/configuracion') {
      return [{ label: 'Configuración', href: '/configuracion' }];
    }
    return [{ label: 'Nexora', href: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors select-none">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Search, Actions, Notifications & Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Search Input Button */}
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 transition-all w-36 sm:w-56 justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
            <span className="truncate">Buscar en Nexora...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Quick New Project Button */}
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsCreateProjectOpen(true)}
          className="hidden sm:inline-flex shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nuevo
        </Button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          aria-label="Alternar modo oscuro"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Abrir notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-950" />
            )}
          </button>

          <NotificationFlyout
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>

        {/* User Avatar */}
        <Link href="/configuracion" className="pl-1">
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            size="sm"
            status={currentUser.status}
          />
        </Link>
      </div>
    </header>
  );
}
