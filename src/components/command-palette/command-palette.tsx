'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Search, FolderClosed, CircleCheck, UserRound, Plus, Moon, Sun, CornerDownLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useMounted, useScrollLock, useModKey } from '@/lib/hooks';
import { spring, easeApple } from '@/lib/motion';
import { cn, normalizeText, getTaskStatusMeta } from '@/lib/utils';
import { allNav } from '@/components/layout/nav-items';

interface Item {
  id: string;
  group: 'Proyectos' | 'Tareas' | 'Personas' | 'Ir a' | 'Acciones';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  onSelect: () => void;
}

/** Spotlight: one field to jump to any project, task, person or command. */
export function CommandPalette() {
  const router = useRouter();
  const mounted = useMounted();
  const modKey = useModKey();
  const {
    isCommandPaletteOpen: open,
    setIsCommandPaletteOpen: setOpen,
    setIsCreateProjectOpen,
    setIsCreateTaskOpen,
    projects,
    tasks,
    users,
    theme,
    setTheme,
    setSelectedTaskId,
  } = useStore();

  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useScrollLock(open);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setIndex(0);
  };

  const items = useMemo<Item[]>(() => {
    const q = normalizeText(query);
    const run = (fn: () => void) => () => {
      fn();
      setOpen(false);
      setQuery('');
      setIndex(0);
    };
    const match = (...fields: string[]) => !q || fields.some((f) => normalizeText(f).includes(q));

    const projectItems: Item[] = projects
      .filter((p) => match(p.name, p.clientOrArea))
      .slice(0, q ? 6 : 3)
      .map((p) => ({
        id: p.id,
        group: 'Proyectos',
        title: p.name,
        subtitle: `${p.clientOrArea} · ${p.progress}%`,
        icon: FolderClosed,
        iconClass: 'bg-accent',
        onSelect: run(() => router.push(`/proyectos/${p.id}`)),
      }));

    const taskItems: Item[] = tasks
      .filter((t) => match(t.title, t.projectName))
      .slice(0, q ? 6 : 3)
      .map((t) => ({
        id: t.id,
        group: 'Tareas',
        title: t.title,
        subtitle: `${t.projectName} · ${getTaskStatusMeta(t.status).label}`,
        icon: CircleCheck,
        iconClass: 'bg-green',
        onSelect: run(() => setSelectedTaskId(t.id)),
      }));

    const peopleItems: Item[] = q
      ? users
          .filter((u) => match(u.name, u.role, u.department))
          .slice(0, 4)
          .map((u) => ({
            id: u.id,
            group: 'Personas',
            title: u.name,
            subtitle: `${u.role} · ${u.department}`,
            icon: UserRound,
            iconClass: 'bg-purple',
            onSelect: run(() => router.push('/equipo')),
          }))
      : [];

    const navItems: Item[] = allNav
      .filter((n) => match(n.name))
      .slice(0, q ? 7 : 0)
      .map((n) => ({
        id: `nav-${n.href}`,
        group: 'Ir a',
        title: n.name,
        icon: n.icon,
        iconClass: 'bg-gray',
        onSelect: run(() => router.push(n.href)),
      }));

    const isDark = theme === 'dark';
    const actionItems: Item[] = [
      {
        id: 'new-project',
        group: 'Acciones' as const,
        title: 'Nuevo proyecto',
        icon: Plus,
        iconClass: 'bg-accent',
        onSelect: run(() => setIsCreateProjectOpen(true)),
      },
      {
        id: 'new-task',
        group: 'Acciones' as const,
        title: 'Nueva tarea',
        icon: Plus,
        iconClass: 'bg-green',
        onSelect: run(() => setIsCreateTaskOpen(true)),
      },
      {
        id: 'theme',
        group: 'Acciones' as const,
        title: isDark ? 'Usar modo claro' : 'Usar modo oscuro',
        icon: isDark ? Sun : Moon,
        iconClass: 'bg-ink-2',
        onSelect: run(() => setTheme(isDark ? 'light' : 'dark')),
      },
    ].filter((a) => match(a.title));

    return [...projectItems, ...taskItems, ...peopleItems, ...navItems, ...actionItems];
  }, [query, projects, tasks, users, theme, router, setOpen, setIsCreateProjectOpen, setIsCreateTaskOpen, setSelectedTaskId, setTheme]);

  const active = Math.min(index, Math.max(items.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((active + 1) % Math.max(items.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((active - 1 + items.length) % Math.max(items.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[active]?.onSelect();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  if (!mounted) return null;

  let lastGroup = '';

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[max(12px,10vh)]">
          <motion.div
            className="absolute inset-0 bg-black/25 dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easeApple }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6, transition: { duration: 0.15 } }}
            transition={spring}
            className="glass relative w-full max-w-[640px] overflow-hidden rounded-[24px] bg-elevated shadow-pop"
          >
            <div className="flex items-center gap-3 px-5">
              <Search className="h-5 w-5 shrink-0 text-ink-2" strokeWidth={2.2} />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Buscar proyectos, tareas, personas…"
                aria-label="Buscar"
                aria-controls="spotlight-results"
                aria-activedescendant={items[active] ? `spot-${items[active].id}` : undefined}
                className="h-16 w-full bg-transparent text-[19px] tracking-[-0.02em] text-ink outline-none placeholder:text-ink-3 focus-visible:outline-none"
              />
              <kbd className="hidden rounded-md bg-fill-2 px-2 py-1 text-[11px] font-medium text-ink-2 sm:block">esc</kbd>
            </div>

            <div
              id="spotlight-results"
              ref={listRef}
              role="listbox"
              data-lenis-prevent
              className="max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain border-t border-line p-2"
            >
              {items.length === 0 ? (
                <p className="px-4 py-10 text-center text-footnote text-ink-2">Nada coincide con «{query}».</p>
              ) : (
                items.map((item, i) => {
                  const Icon = item.icon;
                  const selected = i === active;
                  const header = item.group !== lastGroup ? item.group : null;
                  lastGroup = item.group;
                  return (
                    <React.Fragment key={`${item.group}-${item.id}`}>
                      {header && <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-ink-3">{header}</p>}
                      <button
                        id={`spot-${item.id}`}
                        role="option"
                        aria-selected={selected}
                        data-index={i}
                        onClick={item.onSelect}
                        onMouseMove={() => index !== i && setIndex(i)}
                        className="relative flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-left"
                      >
                        {selected && (
                          <motion.span layoutId="spotlight-active" transition={spring} className="absolute inset-0 rounded-[12px] bg-accent" />
                        )}
                        <span className={cn('relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-white', item.iconClass)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="relative min-w-0 flex-1">
                          <span className={cn('block truncate text-[14px] font-medium', selected ? 'text-white' : 'text-ink')}>{item.title}</span>
                          {item.subtitle && (
                            <span className={cn('block truncate text-[12px]', selected ? 'text-white/75' : 'text-ink-2')}>{item.subtitle}</span>
                          )}
                        </span>
                        {selected && <CornerDownLeft className="relative h-4 w-4 text-white/80" />}
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            <div className="hidden items-center gap-4 border-t border-line px-5 py-2.5 text-[11px] text-ink-3 sm:flex">
              <span>↑ ↓ para moverte</span>
              <span>↵ para abrir</span>
              <span className="ml-auto">{modKey} K abre y cierra</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
