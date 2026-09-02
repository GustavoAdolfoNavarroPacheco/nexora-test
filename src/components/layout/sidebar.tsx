'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Activity,
  BarChart3,
  Settings,
  ChevronDown,
  Building2,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isMobileOpen = false,
  onMobileClose,
  isCollapsed = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, resetToDefaults } = useStore();
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('Acme Corp • Producción');

  const workspaces = [
    { id: 'ws-1', name: 'Acme Corp • Producción', plan: 'Enterprise' },
    { id: 'ws-2', name: 'Nexora Labs • Staging', plan: 'Pro' },
    { id: 'ws-3', name: 'Proyectos Personales', plan: 'Free' },
  ];

  const principalNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Proyectos', href: '/proyectos', icon: FolderKanban },
    { name: 'Tareas', href: '/tareas', icon: CheckSquare },
  ];

  const gestionNav = [
    { name: 'Equipo', href: '/equipo', icon: Users },
    { name: 'Actividad', href: '/actividad', icon: Activity },
    { name: 'Reportes', href: '/reportes', icon: BarChart3 },
  ];

  const sistemaNav = [
    { name: 'Configuración', href: '/configuracion', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navItemClass = (active: boolean) =>
    cn(
      'flex items-center gap-3 px-3.5 py-2 rounded-full text-[15px] font-normal transition-all duration-150 select-none group',
      active
        ? 'bg-[#292524] text-white font-medium shadow-xs dark:bg-[#f5f5f5] dark:text-[#0c0a09]'
        : 'text-[#777169] hover:text-[#0c0a09] hover:bg-[#f0efed] dark:text-[#a8a29e] dark:hover:text-white dark:hover:bg-[#292524]'
    );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#1c1917] border-r border-[#e7e5e4] dark:border-[#2e2a27] w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#e7e5e4] dark:border-[#2e2a27] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#292524] dark:bg-[#f5f5f5] flex items-center justify-center text-white dark:text-[#0c0a09] transition-transform group-hover:scale-105">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-editorial text-xl font-light tracking-tight text-[#0c0a09] dark:text-[#f5f5f5]">
                Nexora
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f0efed] text-[#292524] dark:bg-[#292524] dark:text-[#f5f5f5]">
                PRO
              </span>
            </div>
          </div>
        </Link>

        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-full text-[#777169] hover:text-[#0c0a09] hover:bg-[#f0efed]"
            aria-label="Cerrar navegación"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      <div className="px-4 pt-4 pb-2 relative">
        <button
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#fafafa] hover:bg-[#f0efed] dark:bg-[#292524] dark:hover:bg-[#292524]/80 border border-[#e7e5e4] dark:border-[#44403c] text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-[#777169] shrink-0" />
            <span className="text-xs font-medium text-[#292524] dark:text-[#f5f5f5] truncate">
              {currentWorkspace}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#a8a29e] shrink-0 ml-1" />
        </button>

        {isWorkspaceMenuOpen && (
          <div className="absolute top-14 left-4 right-4 z-30 bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#44403c] rounded-xl shadow-lg p-1.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[#a8a29e]">
              Espacios de trabajo
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setCurrentWorkspace(ws.name);
                  setIsWorkspaceMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer',
                  currentWorkspace === ws.name
                    ? 'bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white font-medium'
                    : 'text-[#4e4e4e] dark:text-[#a8a29e] hover:bg-[#fafafa] dark:hover:bg-[#292524]'
                )}
              >
                <span className="truncate">{ws.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169]">
                  {ws.plan}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
        {/* Principal */}
        <div>
          <div className="px-3 mb-2 text-[12px] font-medium uppercase tracking-wider text-[#a8a29e]">
            Principal
          </div>
          <nav className="space-y-1">
            {principalNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={navItemClass(active)}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-105',
                      active ? 'text-white dark:text-[#0c0a09]' : 'text-[#777169] dark:text-[#a8a29e]'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Gestión */}
        <div>
          <div className="px-3 mb-2 text-[12px] font-medium uppercase tracking-wider text-[#a8a29e]">
            Gestión
          </div>
          <nav className="space-y-1">
            {gestionNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={navItemClass(active)}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-105',
                      active ? 'text-white dark:text-[#0c0a09]' : 'text-[#777169] dark:text-[#a8a29e]'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sistema */}
        <div>
          <div className="px-3 mb-2 text-[12px] font-medium uppercase tracking-wider text-[#a8a29e]">
            Sistema
          </div>
          <nav className="space-y-1">
            {sistemaNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={navItemClass(active)}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-105',
                      active ? 'text-white dark:text-[#0c0a09]' : 'text-[#777169] dark:text-[#a8a29e]'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer User Profile Pill */}
      <div className="p-4 border-t border-[#e7e5e4] dark:border-[#2e2a27]">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="sm"
              status={currentUser.status}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0c0a09] dark:text-[#f5f5f5] truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-[#777169] dark:text-[#a8a29e] truncate">
                {currentUser.role}
              </p>
            </div>
          </div>

          <button
            onClick={resetToDefaults}
            title="Restablecer datos de fábrica"
            className="p-1.5 text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white hover:bg-white dark:hover:bg-[#1c1917] rounded-full transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn('hidden md:block shrink-0', isCollapsed ? 'w-16' : 'w-64')}>
        <div className="fixed inset-y-0 left-0 z-20">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-[#0c0a09]/45 backdrop-blur-xs animate-in fade-in"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
