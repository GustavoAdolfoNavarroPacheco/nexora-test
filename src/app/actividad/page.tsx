'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FolderClosed, CircleCheck, UsersRound, Cog, History } from 'lucide-react';
import { useStore } from '@/lib/store';
import { PageHeader, EmptyState } from '@/components/layout/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Segmented } from '@/components/ui/segmented';
import { Stagger, StaggerItem } from '@/components/ui/reveal';
import { easeApple } from '@/lib/motion';
import { cn, daysUntil, firstName, formatLongDate, REFERENCE_DATE } from '@/lib/utils';
import type { ActivityEvent } from '@/lib/types';

type Filter = 'todos' | 'project' | 'task' | 'team';

const kindMeta: Record<ActivityEvent['entityType'], { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  project: { icon: FolderClosed, cls: 'bg-accent' },
  task: { icon: CircleCheck, cls: 'bg-green' },
  team: { icon: UsersRound, cls: 'bg-purple' },
  system: { icon: Cog, cls: 'bg-gray' },
};

function dayLabel(timestamp: string): string {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return 'Anteriores';
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const diff = daysUntil(iso, REFERENCE_DATE);
  if (diff >= 0) return 'Hoy';
  if (diff === -1) return 'Ayer';
  const label = formatLongDate(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function ActivityPage() {
  const { activities } = useStore();
  const [filter, setFilter] = useState<Filter>('todos');

  const visible = activities.filter((a) => filter === 'todos' || a.entityType === filter);
  const groups: { label: string; items: ActivityEvent[] }[] = [];
  visible.forEach((a) => {
    const label = dayLabel(a.timestamp);
    const group = groups.find((g) => g.label === label);
    if (group) group.items.push(a);
    else groups.push({ label, items: [a] });
  });

  return (
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        title="Actividad"
        subtitle="Cada cambio en proyectos y tareas, en orden."
        actions={
          <Segmented
            label="Filtrar actividad"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'todos', label: 'Todo' },
              { value: 'project', label: 'Proyectos' },
              { value: 'task', label: 'Tareas' },
              { value: 'team', label: 'Equipo' },
            ]}
          />
        }
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: easeApple }}
          className="space-y-8"
        >
          {groups.length === 0 ? (
            <EmptyState icon={History} title="Sin movimientos" description="Cuando alguien cambie algo en esta categoría aparecerá aquí." />
          ) : (
            groups.map((g) => (
              <section key={g.label}>
                <h2 className="text-title-2 glass sticky top-[56px] z-10 -mx-4 mb-3 bg-canvas/80 px-4 py-2 text-ink sm:-mx-8 sm:px-8">{g.label}</h2>
                <Stagger as="ol" className="surface divide-y divide-line overflow-hidden">
                  {g.items.map((a) => {
                    const kind = kindMeta[a.entityType] ?? kindMeta.system;
                    const Icon = kind.icon;
                    return (
                      <StaggerItem as="li" key={a.id} className="flex items-start gap-4 px-4 py-4 sm:px-6">
                        <div className="relative shrink-0">
                          <Avatar src={a.user.avatar} name={a.user.name} size="md" />
                          <span
                            className={cn(
                              'absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-card',
                              kind.cls
                            )}
                          >
                            <Icon className="h-3 w-3" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-[14px] leading-snug text-ink-2">
                            <span className="font-medium text-ink">{firstName(a.user.name)}</span> {a.action}{' '}
                            <span className="font-medium text-ink">{a.entity}</span>
                          </p>
                          <p className="mt-1 text-[12px] text-ink-3">{a.timeAgo}</p>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </section>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
