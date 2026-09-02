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
  LogOut,
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
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group select-none',
      active
        ? 'bg-blue-600 text-white shadow-sm font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/70'
    );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 w-64 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                NEXORA
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Gestión & Operaciones</p>
          </div>
        </Link>

        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Cerrar navegación"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      <div className="px-3 pt-3 pb-1 relative">
        <button
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {currentWorkspace}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </button>

        {isWorkspaceMenuOpen && (
          <div className="absolute top-13 left-3 right-3 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors',
                  currentWorkspace === ws.name
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <span className="truncate">{ws.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {ws.plan}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {/* Principal */}
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                      active ? 'text-white' : 'text-slate-500 dark:text-slate-400'
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
          <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                      active ? 'text-white' : 'text-slate-500 dark:text-slate-400'
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
          <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                      active ? 'text-white' : 'text-slate-500 dark:text-slate-400'
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
      <div className="p-3 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="sm"
              status={currentUser.status}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser.role}
              </p>
            </div>
          </div>

          <button
            onClick={resetToDefaults}
            title="Restablecer datos de fábrica"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className={cn('hidden md:block shrink-0', isCollapsed ? 'w-16' : 'w-64')}>
        <div className="fixed inset-y-0 left-0 z-20">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
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
