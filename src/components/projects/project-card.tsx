'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Ellipsis, Flag, ListChecks } from 'lucide-react';
import { Project } from '@/lib/types';
import { useStore } from '@/lib/store';
import { AvatarStack } from '@/components/ui/avatar';
import { Pill, PriorityMarks } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/rings';
import { Menu } from '@/components/ui/menu';
import { easeApple } from '@/lib/motion';
import { cn, describeDue, getPriorityMeta, getProjectStatusMeta, isAtRisk, toneClasses, toneColor } from '@/lib/utils';
import { useProjectMenu } from './project-actions';

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  index = 0,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  index?: number;
}) {
  const { tasks } = useStore();
  const menuFor = useProjectMenu(onEdit, onDelete);

  const status = getProjectStatusMeta(project.status);
  const prio = getPriorityMeta(project.priority);
  const due = describeDue(project.dueDate, project.status === 'completado');
  const risk = isAtRisk(project);
  const own = tasks.filter((t) => t.projectId === project.id);
  const openTasks = own.filter((t) => !t.completed).length;
  const milestonesDone = project.milestones.filter((m) => m.completed).length;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, ease: easeApple, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -4 }}
      className="group surface relative flex flex-col p-5 transition-shadow duration-300 ease-apple hover:shadow-lift sm:p-6"
    >
      {/* Whole-card link sits under the content; interactive bits sit above it. */}
      <Link href={`/proyectos/${project.id}`} className="absolute inset-0 z-0 rounded-[22px]" aria-label={`Abrir ${project.name}`} />

      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
        <p className="text-eyebrow truncate pt-1.5 text-ink-2">{project.clientOrArea}</p>
        <div className="pointer-events-auto -mt-1 -mr-2">
          <Menu label={`Opciones de ${project.name}`} trigger={<Ellipsis className="h-[18px] w-[18px]" />} items={menuFor(project)} />
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mt-2 flex-1">
        <h3 className="text-title-2 line-clamp-2 text-ink transition-colors duration-200 group-hover:text-accent-ink">{project.name}</h3>
        <p className="text-footnote mt-1.5 line-clamp-2 text-ink-2">{project.description}</p>
      </div>

      <div className="pointer-events-none relative z-10 mt-5 flex items-center gap-4">
        <ProgressRing
          value={project.progress}
          size={56}
          stroke={6}
          color={risk ? toneColor.orange : project.status === 'completado' ? toneColor.green : toneColor.blue}
          labelClassName="text-[13px]"
        />
        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
          <div className="flex items-center gap-1.5 text-ink-2">
            <ListChecks className="h-3.5 w-3.5 text-ink-3" />
            
            <span>{openTasks} abiertas</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-2">
            <Flag className="h-3.5 w-3.5 text-ink-3" />
            
            <span>
              {milestonesDone}/{project.milestones.length} hitos
            </span>
          </div>
          <div className="col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
            <Pill tone={status.tone} dot>
              {status.label}
            </Pill>
            {risk && <Pill tone="orange">En riesgo</Pill>}
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mt-5 flex items-center justify-between border-t border-line pt-4">
        <AvatarStack users={project.team} max={4} />
        <div className="flex items-center gap-2 text-[12px]">
          <PriorityMarks marks={prio.marks} tone={prio.tone} />
          <span className={cn('font-medium', due.tone === 'gray' ? 'text-ink-2' : toneClasses[due.tone].ink)}>{due.label}</span>
        </div>
      </div>
    </motion.article>
  );
}
