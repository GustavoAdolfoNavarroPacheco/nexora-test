'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProgressRing } from '@/components/ui/rings';
import { AvatarStack } from '@/components/ui/avatar';
import { Pill } from '@/components/ui/badge';
import { SectionTitle } from '@/components/layout/page-header';
import { Stagger, StaggerItem } from '@/components/ui/reveal';
import { describeDue, getProjectStatusMeta, isAtRisk, toneClasses, cn, toneColor } from '@/lib/utils';

export function ActiveProjectsList() {
  const { projects } = useStore();

  // Closest deadlines first — that is what needs attention today.
  const focus = projects
    .filter((p) => p.status === 'activo' || p.status === 'planificacion' || p.status === 'en_pausa')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <section className="surface h-full p-5 sm:p-7">
      <SectionTitle
        title="En foco"
        detail="Proyectos abiertos, ordenados por fecha de entrega"
        trailing={
          <Link href="/proyectos" className="shrink-0 text-[13px] font-medium text-accent-ink hover:underline">
            Ver todos
          </Link>
        }
      />

      <Stagger as="ul" className="-mx-2 mt-4 sm:-mx-3">
        {focus.map((project) => {
          const status = getProjectStatusMeta(project.status);
          const due = describeDue(project.dueDate);
          const risk = isAtRisk(project);
          return (
            <StaggerItem as="li" key={project.id}>
              <Link
                href={`/proyectos/${project.id}`}
                className="group flex items-center gap-4 rounded-[16px] px-2 py-3 transition-colors duration-200 hover:bg-fill sm:px-3"
              >
                <ProgressRing
                  value={project.progress}
                  size={46}
                  stroke={5}
                  color={risk ? toneColor.orange : toneColor.blue}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-headline truncate text-ink">{project.name}</p>
                    {project.status !== 'activo' && <Pill tone={status.tone}>{status.label}</Pill>}
                    {risk && <Pill tone="orange">En riesgo</Pill>}
                  </div>
                  <p className="text-footnote mt-0.5 truncate text-ink-2">
                    {project.clientOrArea} · {project.manager.name}
                  </p>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                  <AvatarStack users={project.team} max={3} />
                  <span className={cn('text-[12px] font-medium', due.tone === 'gray' ? 'text-ink-3' : toneClasses[due.tone].ink)}>
                    {due.label}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 -translate-x-1 text-ink-3 opacity-0 transition-all duration-300 ease-apple group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
