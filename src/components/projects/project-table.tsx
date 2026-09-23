'use client';

import React from 'react';
import Link from 'next/link';
import { Ellipsis } from 'lucide-react';
import { Project } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Pill, PriorityMarks } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ProgressRing } from '@/components/ui/rings';
import { Menu } from '@/components/ui/menu';
import { Stagger, StaggerItem } from '@/components/ui/reveal';
import { cn, describeDue, getPriorityMeta, getProjectStatusMeta, isAtRisk, toneClasses, toneColor } from '@/lib/utils';
import { useProjectMenu } from './project-actions';

/** Finder-style list view. Collapses into stacked rows on phones. */
export function ProjectTable({
  projects,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const { tasks } = useStore();
  const menuFor = useProjectMenu(onEdit, onDelete);

  return (
    <div className="surface overflow-visible">
      <div className="hidden grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_120px_minmax(0,1.2fr)_110px_40px] items-center gap-4 border-b border-line px-6 py-3 text-[11px] font-semibold text-ink-3 md:grid">
        <span>Proyecto</span>
        <span>Responsable</span>
        <span>Estado</span>
        <span>Avance</span>
        <span>Entrega</span>
        <span className="sr-only">Acciones</span>
      </div>

      <Stagger as="ul" className="divide-y divide-line">
        {projects.map((project) => {
          const status = getProjectStatusMeta(project.status);
          const prio = getPriorityMeta(project.priority);
          const due = describeDue(project.dueDate, project.status === 'completado');
          const risk = isAtRisk(project);
          const openTasks = tasks.filter((t) => t.projectId === project.id && !t.completed).length;

          return (
            <StaggerItem as="li" key={project.id}>
              <div className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 transition-colors hover:bg-fill sm:px-6 md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_120px_minmax(0,1.2fr)_110px_40px]">
                {/* Phone: ring leads the row */}
                <ProgressRing value={project.progress} size={40} stroke={4} className="md:hidden" color={risk ? toneColor.orange : toneColor.blue} />

                <div className="min-w-0">
                  <Link href={`/proyectos/${project.id}`} className="block truncate text-[14px] font-medium text-ink after:absolute after:inset-0 hover:text-accent-ink">
                    <PriorityMarks marks={prio.marks} tone={prio.tone} className="mr-1.5" />
                    {project.name}
                  </Link>
                  <p className="truncate text-[12px] text-ink-2">
                    {project.clientOrArea} · {openTasks} tareas abiertas
                  </p>
                </div>

                <div className="hidden min-w-0 items-center gap-2 md:flex">
                  <Avatar src={project.manager.avatar} name={project.manager.name} size="xs" />
                  <span className="truncate text-[13px] text-ink">{project.manager.name}</span>
                </div>

                <div className="hidden md:block">
                  <Pill tone={status.tone} dot>
                    {status.label}
                  </Pill>
                </div>

                <div className="hidden items-center gap-3 md:flex">
                  <ProgressBar value={project.progress} tone={risk ? 'orange' : 'blue'} />
                  <span className="tabular w-9 shrink-0 text-right text-[12px] font-medium text-ink">{project.progress}%</span>
                </div>

                <span className={cn('hidden text-[12px] font-medium md:block', due.tone === 'gray' ? 'text-ink-2' : toneClasses[due.tone].ink)}>
                  {due.label}
                </span>

                <div className="relative z-10 flex justify-end">
                  <Menu label={`Opciones de ${project.name}`} trigger={<Ellipsis className="h-[18px] w-[18px]" />} items={menuFor(project)} />
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
