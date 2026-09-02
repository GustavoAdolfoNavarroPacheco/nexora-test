'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  Search,
  FolderKanban,
  CheckSquare,
  User as UserIcon,
  PlusCircle,
  Moon,
  Sun,
  LayoutDashboard,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn, normalizeText } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Filter items
  const cleanQuery = normalizeText(query);

  const filteredProjects = cleanQuery
    ? projects.filter(
        (p) =>
          normalizeText(p.name).includes(cleanQuery) ||
          normalizeText(p.clientOrArea).includes(cleanQuery)
      )
    : projects.slice(0, 3);

  const filteredTasks = cleanQuery
    ? tasks.filter(
        (t) =>
          normalizeText(t.title).includes(cleanQuery) ||
          normalizeText(t.projectName).includes(cleanQuery)
      )
    : tasks.slice(0, 3);

  const filteredUsers = cleanQuery
    ? users.filter(
        (u) =>
          normalizeText(u.name).includes(cleanQuery) ||
          normalizeText(u.role).includes(cleanQuery) ||
          normalizeText(u.department).includes(cleanQuery)
      )
    : [];

  const actions = [
    {
      id: 'act-new-project',
      title: 'Crear nuevo proyecto',
      category: 'ACCIONES',
      icon: PlusCircle,
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsCreateProjectOpen(true);
      },
    },
    {
      id: 'act-new-task',
      title: 'Crear nueva tarea',
      category: 'ACCIONES',
      icon: PlusCircle,
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsCreateTaskOpen(true);
      },
    },
    {
      id: 'act-toggle-theme',
      title: theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
      category: 'ACCIONES',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-goto-dashboard',
      title: 'Ir al Dashboard principal',
      category: 'NAVEGACIÓN',
      icon: LayoutDashboard,
      action: () => {
        router.push('/');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-goto-settings',
      title: 'Ir a Configuración',
      category: 'NAVEGACIÓN',
      icon: Settings,
      action: () => {
        router.push('/configuracion');
        setIsCommandPaletteOpen(false);
      },
    },
  ];

  // Flatten searchable list for keyboard navigation
  const allItems: {
    id: string;
    type: 'project' | 'task' | 'user' | 'action';
    title: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    onSelect: () => void;
  }[] = [
    ...filteredProjects.map((p) => ({
      id: p.id,
      type: 'project' as const,
      title: p.name,
      subtitle: `${p.clientOrArea} • ${p.progress}% completado`,
      icon: FolderKanban,
      onSelect: () => {
        router.push(`/proyectos/${p.id}`);
        setIsCommandPaletteOpen(false);
      },
    })),
    ...filteredTasks.map((t) => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      subtitle: `${t.projectName} • ${t.status}`,
      icon: CheckSquare,
      onSelect: () => {
        setSelectedTaskId(t.id);
        setIsCommandPaletteOpen(false);
      },
    })),
    ...filteredUsers.map((u) => ({
      id: u.id,
      type: 'user' as const,
      title: u.name,
      subtitle: `${u.role} (${u.department})`,
      icon: UserIcon,
      onSelect: () => {
        router.push('/equipo');
        setIsCommandPaletteOpen(false);
      },
    })),
    ...actions.map((a) => ({
      id: a.id,
      type: 'action' as const,
      title: a.title,
      subtitle: a.category,
      icon: a.icon,
      onSelect: a.action,
    })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(allItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(allItems.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribe para buscar proyectos, tareas, equipo o comandos..."
            className="w-full bg-transparent px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors',
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'p-2 rounded-lg shrink-0',
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{item.title}</p>
                      {item.subtitle && (
                        <p
                          className={cn(
                            'text-[11px] truncate',
                            isSelected
                              ? 'text-white/80'
                              : 'text-slate-400 dark:text-slate-500'
                          )}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.type === 'project' && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-medium',
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                        )}
                      >
                        Proyecto
                      </span>
                    )}
                    {item.type === 'task' && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-medium',
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        )}
                      >
                        Tarea
                      </span>
                    )}
                    <ArrowRight
                      className={cn(
                        'w-3.5 h-3.5',
                        isSelected ? 'text-white' : 'text-slate-400'
                      )}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                ↑
              </kbd>
              <kbd className="px-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                ↓
              </kbd>{' '}
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                ↵
              </kbd>{' '}
              Seleccionar
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" /> Nexora Search Engine
          </span>
        </div>
      </div>
    </div>
  );
}
