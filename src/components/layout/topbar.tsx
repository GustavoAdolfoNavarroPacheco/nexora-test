'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Search, Plus, Bell, Sun, Moon, ChevronLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useClickOutside, useEscape, useMediaQuery, useModKey } from '@/lib/hooks';
import { spring, easeApple } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { NotificationFlyout } from '@/components/notifications/notification-flyout';
import { NexoraMark } from '@/components/ui/nexora-mark';
import { titleForPath } from './nav-items';

function IconButton({
  label,
  onClick,
  children,
  className,
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition-[background-color,color,transform] duration-200 hover:bg-fill-2 hover:text-ink active:scale-90',
        active && 'bg-fill-2 text-ink',
        className
      )}
    >
      {children}
    </button>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const { notifications, theme, setTheme, setIsCommandPaletteOpen, setIsCreateProjectOpen, projects } = useStore();
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeNotifications = useCallback(() => setIsNotificationOpen(false), []);
  const notificationRef = useRef<HTMLDivElement>(null);
  useClickOutside(notificationRef, isNotificationOpen, closeNotifications);
  useEscape(isNotificationOpen, closeNotifications);
  const modKey = useModKey();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 64));

  const unread = notifications.filter((n) => !n.read).length;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  const detailMatch = pathname.match(/^\/proyectos\/([^/]+)$/);
  const detailProject = detailMatch ? projects.find((p) => p.id === detailMatch[1]) : undefined;
  const compactTitle = detailProject?.name ?? titleForPath(pathname);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-apple',
        scrolled ? 'glass bg-chrome shadow-[0_0.5px_0_var(--line)]' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-[56px] w-full max-w-[1240px] items-center gap-3 px-4 sm:px-8">
        {/* Leading: back button on detail pages, brand on phones */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {detailMatch ? (
            <Link
              href="/proyectos"
              className="-ml-2 flex h-9 items-center gap-0.5 rounded-full pr-3 pl-1 text-[15px] text-accent-ink transition-colors hover:bg-accent-soft"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
              Proyectos
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Inicio">
              <NexoraMark className="h-7 w-7" />
            </Link>
          )}

          <AnimatePresence>
            {scrolled && (
              <motion.span
                key={compactTitle}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3, ease: easeApple }}
                className={cn(
                  'truncate text-[15px] font-semibold tracking-[-0.02em] text-ink',
                  detailMatch ? 'hidden sm:block' : ''
                )}
              >
                {compactTitle}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Trailing actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="group hidden h-9 w-60 items-center gap-2 rounded-full bg-fill-2 pr-2 pl-3.5 text-[13px] text-ink-3 transition-colors hover:text-ink-2 md:flex"
          >
            <Search className="h-4 w-4 transition-colors group-hover:text-accent" strokeWidth={2.2} />
            <span className="flex-1 text-left">Buscar</span>
            <kbd className="rounded-md bg-card px-1.5 py-0.5 font-sans text-[10px] font-medium text-ink-2 shadow-card">{modKey} K</kbd>
          </button>
          <IconButton label="Buscar" onClick={() => setIsCommandPaletteOpen(true)} className="md:hidden">
            <Search className="h-[18px] w-[18px]" strokeWidth={2.1} />
          </IconButton>

          <IconButton label={isDark ? 'Usar modo claro' : 'Usar modo oscuro'} onClick={() => setTheme(isDark ? 'light' : 'dark')}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                transition={spring}
                className="flex"
              >
                {isDark ? <Sun className="h-[18px] w-[18px]" strokeWidth={2.1} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={2.1} />}
              </motion.span>
            </AnimatePresence>
          </IconButton>

          <div ref={notificationRef} className="relative">
            <IconButton
              label={unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
              onClick={() => setIsNotificationOpen((o) => !o)}
              active={isNotificationOpen}
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={2.1} />
              <AnimatePresence>
                {unread > 0 && (
                  <motion.span
                    key={unread}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={spring}
                    className="tabular absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[10px] font-semibold text-white ring-2 ring-canvas"
                  >
                    {unread}
                  </motion.span>
                )}
              </AnimatePresence>
            </IconButton>
            <NotificationFlyout isOpen={isNotificationOpen} onClose={closeNotifications} />
          </div>

          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="ml-1 hidden h-9 items-center gap-1.5 rounded-full bg-accent pr-4 pl-3 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-[background-color,transform] duration-200 hover:bg-accent-hover active:scale-95 sm:flex"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nuevo proyecto
          </button>
          <IconButton label="Nuevo proyecto" onClick={() => setIsCreateProjectOpen(true)} className="bg-accent text-white hover:bg-accent-hover hover:text-white sm:hidden">
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
