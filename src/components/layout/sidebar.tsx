'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { LogOut, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { NexoraMark } from '@/components/ui/nexora-mark';
import { Chevrons } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { useSignOut } from '@/components/auth/use-sign-out';
import { spring } from '@/lib/motion';
import { useClickOutside, useEscape } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { primaryNav, teamNav, systemNav, isActivePath, type NavItem } from './nav-items';

/** Brand plus whose private workspace this is. */
function WorkspaceHeader() {
  const { currentUser } = useStore();
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <NexoraMark className="h-8 w-8 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold tracking-[-0.02em] text-ink">NexoraWork</span>
        <span className="block truncate text-[11px] text-ink-2">Espacio de {currentUser.name.split(/\s+/)[0]}</span>
      </span>
    </div>
  );
}

function NavSection({ title, items, counts }: { title?: string; items: NavItem[]; counts: Record<string, number> }) {
  const pathname = usePathname();
  return (
    <div>
      {title && <p className="mb-1 px-3 text-[11px] font-semibold text-ink-3">{title}</p>}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          const count = counts[item.href];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex h-9 items-center gap-3 rounded-[10px] px-3 text-[14px] transition-colors',
                  active ? 'font-medium text-ink' : 'text-ink-2 hover:text-ink'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    transition={spring}
                    className="absolute inset-0 rounded-[10px] bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.04)] dark:bg-fill-2 dark:shadow-none"
                  />
                )}
                {!active && (
                  <span className="absolute inset-0 rounded-[10px] bg-fill-2 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
                <Icon
                  className={cn(
                    'relative h-[18px] w-[18px] shrink-0 transition-transform duration-300 ease-apple group-hover:scale-110',
                    active ? 'text-accent' : 'text-ink-2'
                  )}
                  strokeWidth={active ? 2.2 : 1.9}
                />
                <span className="relative flex-1 truncate">{item.name}</span>
                {count !== undefined && count > 0 && (
                  <span className="tabular relative text-[12px] text-ink-3">{count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The signed-in person, pinned to the bottom of the sidebar. Opens upward like the macOS Apple menu. */
function AccountMenu() {
  const { currentUser } = useStore();
  const { signOut, signingOut } = useSignOut();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, open, close);
  useEscape(open, close);

  return (
    <div ref={ref} className="relative mt-3">
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={spring}
            style={{ transformOrigin: 'bottom center' }}
            className="glass absolute inset-x-0 bottom-[calc(100%+6px)] z-30 rounded-[14px] bg-elevated p-1.5 shadow-pop"
          >
            <p className="truncate px-2.5 pt-1.5 pb-2 text-[12px] text-ink-2">{currentUser.email}</p>
            <Link
              role="menuitem"
              href="/configuracion"
              onClick={close}
              className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13px] text-ink transition-colors hover:bg-accent hover:text-white"
            >
              <Settings className="h-4 w-4 opacity-80" />
              Configuración
            </Link>
            <div className="mx-2.5 my-1 h-px bg-line" />
            <button
              role="menuitem"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-left text-[13px] text-red-ink transition-colors hover:bg-red hover:text-white"
            >
              <LogOut className="h-4 w-4 opacity-80" />
              {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Cuenta de ${currentUser.name}`}
        className={cn(
          'flex w-full items-center gap-3 rounded-[12px] px-2 py-2 text-left transition-colors hover:bg-fill-2',
          open && 'bg-fill-2'
        )}
      >
        <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" status={currentUser.status} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">{currentUser.name}</span>
          <span className="block truncate text-[11px] text-ink-2">{currentUser.role}</span>
        </span>
        <Chevrons className="text-ink-3" />
      </button>
    </div>
  );
}

export function Sidebar() {
  const { currentUser, projects, tasks } = useStore();

  const counts: Record<string, number> = {
    '/proyectos': projects.filter((p) => p.status === 'activo').length,
    '/tareas': tasks.filter((t) => !t.completed && t.assignee.id === currentUser.id).length,
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[256px] lg:block">
      <div className="glass flex h-full flex-col border-r border-line bg-sidebar px-3 pt-4 pb-3">
        <WorkspaceHeader />

        <nav aria-label="Principal" className="no-scrollbar mt-5 flex-1 space-y-6 overflow-y-auto">
          <NavSection items={primaryNav} counts={counts} />
          <NavSection title="Organización" items={teamNav} counts={counts} />
          <NavSection title="Cuenta" items={systemNav} counts={counts} />
        </nav>

        <AccountMenu />
      </div>
    </aside>
  );
}
