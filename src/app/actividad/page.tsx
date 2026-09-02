'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Activity,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  Clock,
} from 'lucide-react';

export default function ActivityPage() {
  const { activities } = useStore();
  const [filter, setFilter] = useState<'todos' | 'proyectos' | 'tareas' | 'equipo' | 'sistema'>('todos');

  const filteredActivities = activities.filter((act) => {
    if (filter === 'todos') return true;
    if (filter === 'proyectos') return act.entityType === 'project';
    if (filter === 'tareas') return act.entityType === 'task';
    if (filter === 'equipo') return act.entityType === 'team';
    if (filter === 'sistema') return act.entityType === 'system';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-[#e7e5e4]/80 dark:border-[#2e2a27]">
        <div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-light tracking-tight text-[#0c0a09] dark:text-[#f5f5f5]">
            Registro de Actividad
          </h1>
          <p className="text-sm text-[#777169] dark:text-[#a8a29e] mt-1">
            Historial cronológico de cambios, creaciones y auditoría en toda la organización.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center p-1 rounded-full bg-[#f0efed] dark:bg-[#292524] self-start sm:self-auto">
          {(
            [
              { id: 'todos', label: 'Todos' },
              { id: 'proyectos', label: 'Proyectos' },
              { id: 'tareas', label: 'Tareas' },
              { id: 'equipo', label: 'Equipo' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'px-3.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer',
                filter === tab.id
                  ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                  : 'text-[#777169] hover:text-[#0c0a09]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none">
        <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-px before:bg-[#e7e5e4] dark:before:bg-[#2e2a27]">
          {filteredActivities.map((event) => (
            <div key={event.id} className="flex items-start gap-4 relative pl-1 group">
              <Avatar
                src={event.user.avatar}
                name={event.user.name}
                size="sm"
                className="ring-4 ring-white dark:ring-[#1c1917] z-10 shrink-0"
              />

              <div className="flex-1 min-w-0 p-4 rounded-xl border border-transparent group-hover:border-[#e7e5e4] dark:group-hover:border-[#2e2a27] group-hover:bg-[#fafafa] dark:group-hover:bg-[#292524]/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-xs text-[#292524] dark:text-[#f5f5f5] leading-relaxed">
                    <span className="font-semibold text-[#0c0a09] dark:text-white">
                      {event.user.name}
                    </span>{' '}
                    <span className="text-[#777169] dark:text-[#a8a29e]">{event.action}</span>{' '}
                    <span className="font-medium text-[#0c0a09] dark:text-white">
                      &ldquo;{event.entity}&rdquo;
                    </span>
                  </p>
                  <span className="text-[11px] text-[#a8a29e] shrink-0">
                    {event.timeAgo}
                  </span>
                </div>

                <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e] font-medium capitalize">
                  {event.entityType || 'General'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
