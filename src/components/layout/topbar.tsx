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

  const getBreadcrumbs = () => {
    if (pathname === '/') {
      return [{ label: 'Dashboard', href: '/' }];
    }
    if (pathname.startsWith('/proyectos/')) {
      const projectId = pathname.split('/')[2];
      const project = projects.find((p) => p.id === projectId);
      return [
        { label: 'Proyectos', href: '/proyectos' },
        { label: project?.name || 'Detalle', href: pathname },
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 sm:px-8 bg-[#f5f5f5]/90 dark:bg-[#0c0a09]/90 backdrop-blur-xs border-b border-[#e7e5e4] dark:border-[#2e2a27] transition-colors select-none">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-full text-[#777169] hover:text-[#0c0a09] hover:bg-[#f0efed] dark:hover:bg-[#292524]"
          aria-label="Abrir menú"
        >
          <Menu className="w-4 h-4" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-[#a8a29e] shrink-0" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-medium text-[#0c0a09] dark:text-[#f5f5f5] max-w-[240px] truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Search, Actions, Notifications & Avatar */}
      <div className="flex items-center gap-3">
        {/* Search Input Button */}
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1c1917] hover:bg-[#fafafa] dark:hover:bg-[#292524] border border-[#e7e5e4] dark:border-[#2e2a27] text-xs text-[#777169] dark:text-[#a8a29e] transition-all w-36 sm:w-56 justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#a8a29e] group-hover:text-[#0c0a09] dark:group-hover:text-white transition-colors shrink-0" />
            <span className="truncate">Buscar...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono text-[#777169] bg-[#f0efed] dark:bg-[#292524] rounded-full border border-[#e7e5e4] dark:border-[#44403c] shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Quick New Project Button */}
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsCreateProjectOpen(true)}
          className="hidden sm:inline-flex"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Nuevo
        </Button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full text-[#777169] hover:text-[#0c0a09] hover:bg-[#f0efed] dark:text-[#a8a29e] dark:hover:text-white dark:hover:bg-[#292524] transition-colors cursor-pointer"
          title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          aria-label="Alternar modo oscuro"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-full text-[#777169] hover:text-[#0c0a09] hover:bg-[#f0efed] dark:text-[#a8a29e] dark:hover:text-white dark:hover:bg-[#292524] transition-colors relative cursor-pointer"
            aria-label="Abrir notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0c0a09] dark:bg-[#a7e5d3] ring-2 ring-[#f5f5f5] dark:ring-[#0c0a09]" />
            )}
          </button>

          <NotificationFlyout
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>

        {/* User Avatar */}
        <Link href="/configuracion" className="pl-0.5">
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
