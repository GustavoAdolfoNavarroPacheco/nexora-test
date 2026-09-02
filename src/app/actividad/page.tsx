'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import {
  Activity,
  FolderKanban,
  CheckSquare,
  Users,
  Shield,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityFilter = 'all' | 'project' | 'task' | 'team' | 'system';

export default function ActividadPage() {
  const { activities } = useStore();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    return act.entityType === filter;
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-3.5 h-3.5 text-blue-500" />;
      case 'task':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'team':
        return <Users className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Registro de Actividad
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Auditoría en vivo
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Línea de tiempo cronológica de cambios, asignaciones, estados y eventos del workspace.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'project', label: 'Proyectos' },
              { id: 'task', label: 'Tareas' },
              { id: 'team', label: 'Equipo' },
              { id: 'system', label: 'Sistema' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none whitespace-nowrap',
                filter === f.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No hay actividades registradas en esta categoría.
            </div>
          ) : (
            filteredActivities.map((event) => (
              <div key={event.id} className="flex items-start gap-4 pl-1 relative group">
                <div className="z-10 bg-white dark:bg-slate-900 ring-4 ring-white dark:ring-slate-900 rounded-full">
                  <Avatar
                    src={event.user.avatar}
                    name={event.user.name}
                    size="xs"
                  />
                </div>

                <div className="flex-1 min-w-0 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 group-hover:bg-slate-100/60 dark:group-hover:bg-slate-800/70 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        {getEntityIcon(event.entityType)}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {event.user.name}
                        </span>{' '}
                        <span className="text-slate-500">{event.action}</span>{' '}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          &ldquo;{event.entity}&rdquo;
                        </span>
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400 shrink-0">
                      {event.timeAgo}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
