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
        className="fixed inset-0 bg-[#0c0a09]/45 backdrop-blur-xs animate-in fade-in"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] rounded-2xl shadow-xl z-10 overflow-hidden animate-in zoom-in-95 duration-100 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
          <Search className="w-4 h-4 text-[#a8a29e] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar proyectos, tareas o comandos..."
            className="w-full bg-transparent px-3.5 text-sm text-[#0c0a09] dark:text-[#f5f5f5] placeholder:text-[#a8a29e] focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[#777169] bg-[#f0efed] dark:bg-[#292524] rounded-full border border-[#e7e5e4] dark:border-[#44403c]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2.5 space-y-1">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-[#a8a29e] text-xs">
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
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09]'
                      : 'text-[#4e4e4e] dark:text-[#a8a29e] hover:bg-[#fafafa] dark:hover:bg-[#292524]'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'p-2 rounded-full shrink-0',
                        isSelected
                          ? 'bg-white/20 text-white dark:bg-black/10 dark:text-[#0c0a09]'
                          : 'bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p
                          className={cn(
                            'text-[11px] truncate',
                            isSelected
                              ? 'text-white/80 dark:text-[#0c0a09]/70'
                              : 'text-[#a8a29e]'
                          )}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.type === 'project' && (
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-medium border',
                          isSelected
                            ? 'bg-white/20 text-white border-transparent dark:bg-black/10 dark:text-[#0c0a09]'
                            : 'bg-[#f0efed] text-[#292524] border-transparent dark:bg-[#292524] dark:text-[#f5f5f5]'
                        )}
                      >
                        Proyecto
                      </span>
                    )}
                    {item.type === 'task' && (
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-medium border',
                          isSelected
                            ? 'bg-white/20 text-white border-transparent dark:bg-black/10 dark:text-[#0c0a09]'
                            : 'bg-[#f0efed] text-[#777169] border-transparent dark:bg-[#292524] dark:text-[#a8a29e]'
                        )}
                      >
                        Tarea
                      </span>
                    )}
                    <ArrowRight
                      className={cn(
                        'w-3.5 h-3.5',
                        isSelected ? 'text-white dark:text-[#0c0a09]' : 'text-[#a8a29e]'
                      )}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 bg-[#fafafa] dark:bg-[#1c1917] border-t border-[#e7e5e4] dark:border-[#2e2a27] flex items-center justify-between text-[11px] text-[#a8a29e]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] font-mono">
                ↑↓
              </kbd>{' '}
              Navegar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] font-mono">
                ↵
              </kbd>{' '}
              Seleccionar
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#777169]" /> Nexora System
          </span>
        </div>
      </div>
    </div>
  );
}
