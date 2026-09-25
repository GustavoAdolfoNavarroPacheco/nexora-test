'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Pencil, Plus, FolderX, Kanban, Rows3, Mail, SearchX } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pill, PriorityMarks } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/rings';
import { Segmented } from '@/components/ui/segmented';
import { Check } from '@/components/ui/check';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/reveal';
import { EmptyState, SectionTitle } from '@/components/layout/page-header';
import { KanbanBoard } from '@/components/projects/kanban-board';
import { ProjectMilestones } from '@/components/projects/project-milestones';
import { EditProjectModal } from '@/components/projects/edit-project-modal';
import { SearchField } from '@/components/projects/project-filters';
import { easeApple } from '@/lib/motion';
import {
  cn,
  daysUntil,
  describeDue,
  elapsedShare,
  firstName,
  formatDate,
  getMemberStatusMeta,
  getPriorityMeta,
  getProjectStatusMeta,
  getTaskStatusMeta,
  isAtRisk,
  isOverdue,
  normalizeText,
  toneClasses,
  toneColor,
} from '@/lib/utils';

type Tab = 'resumen' | 'tareas' | 'actividad' | 'equipo';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { projects, tasks, activities, setIsCreateTaskOpen, toggleTaskComplete, setSelectedTaskId } = useStore();

  const [tab, setTab] = useState<Tab>('resumen');
  const [taskView, setTaskView] = useState<'kanban' | 'list'>('kanban');
  const [editOpen, setEditOpen] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="pt-10">
        <EmptyState
          icon={FolderX}
          title="Este proyecto ya no existe"
          description="Puede que lo hayan eliminado o que el enlace esté mal escrito."
          action={
            <Link href="/proyectos" className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-medium text-white">
              Ver proyectos
            </Link>
          }
        />
      </div>
    );
  }

  const status = getProjectStatusMeta(project.status);
  const prio = getPriorityMeta(project.priority);
  const risk = isAtRisk(project);
  const own = tasks.filter((t) => t.projectId === project.id);
  const done = own.filter((t) => t.completed).length;
  const overdue = own.filter(isOverdue).length;
  const inFlight = own.filter((t) => t.status === 'en_progreso' || t.status === 'en_revision').length;
  const remaining = daysUntil(project.dueDate);
  const elapsed = elapsedShare(project);

  const q = normalizeText(taskSearch);
  const visibleTasks = q ? own.filter((t) => normalizeText(t.title).includes(q)) : own;
  const log = activities.filter((a) => a.projectId === project.id || a.entity === project.name);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeApple }}
        className="grid gap-6 pt-2 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div className="min-w-0">
          <p className="text-eyebrow text-ink-2">{project.clientOrArea}</p>
          <h1 className="text-large-title mt-2 text-ink">{project.name}</h1>
          <p className="text-body mt-2 max-w-2xl text-ink-2">{project.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Pill tone={status.tone} dot size="md">
              {status.label}
            </Pill>
            <Pill tone={prio.tone} size="md">
              <PriorityMarks marks={prio.marks} tone={prio.tone} />
              Prioridad {prio.label.toLowerCase()}
            </Pill>
            {risk && (
              <Pill tone="orange" size="md">
                En riesgo
              </Pill>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button onClick={() => setIsCreateTaskOpen(true, { projectId: project.id })}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Nueva tarea
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        <div className="surface flex items-center gap-5 p-5 md:w-[340px]">
          <ProgressRing
            value={project.progress}
            size={96}
            stroke={10}
            color={risk ? toneColor.orange : project.status === 'completado' ? toneColor.green : toneColor.blue}
            showLabel={false}
          />
          <div className="min-w-0">
            <AnimatedNumber value={project.progress} suffix="%" className="text-[34px] leading-none font-semibold tracking-[-0.04em] text-ink" />
            <p className="mt-1 text-[12px] text-ink-2">
              completado · {elapsed}% del plazo usado
            </p>
            <p className={cn('mt-2 text-[13px] font-medium', remaining < 0 ? 'text-red-ink' : remaining <= 7 ? 'text-orange-ink' : 'text-ink')}>
              {remaining < 0
                ? `Entrega vencida hace ${Math.abs(remaining)} días`
                : remaining === 0
                  ? 'Se entrega hoy'
                  : `Faltan ${remaining} días · ${formatDate(project.dueDate)}`}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Segmented
            label="Secciones del proyecto"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'resumen', label: 'Resumen' },
              { value: 'tareas', label: `Tareas ${own.length}` },
              { value: 'actividad', label: 'Actividad' },
              { value: 'equipo', label: `Equipo ${project.team.length}` },
            ]}
          />
        </div>
        {tab === 'tareas' && (
          <Segmented
            label="Vista de tareas"
            size="sm"
            value={taskView}
            onChange={setTaskView}
            options={[
              { value: 'kanban', label: 'Tablero', icon: Kanban },
              { value: 'list', label: 'Lista', icon: Rows3 },
            ]}
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: easeApple }}
        >
          {tab === 'resumen' && (
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="space-y-6 lg:col-span-7">
                <Reveal>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Cerradas', value: done, tone: 'green' as const },
                      { label: 'En curso', value: inFlight, tone: 'blue' as const },
                      { label: 'Vencidas', value: overdue, tone: overdue ? ('red' as const) : ('gray' as const) },
                    ].map((s) => (
                      <div key={s.label} className="surface p-4 sm:p-5">
                        <span className={cn('mb-3 block h-1.5 w-6 rounded-full', toneClasses[s.tone].dot)} />
                        <AnimatedNumber value={s.value} className="text-[28px] leading-none font-semibold tracking-[-0.04em] text-ink" />
                        <p className="mt-1.5 text-[12px] text-ink-2">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </Reveal>
                <Reveal>
                  <ProjectMilestones milestones={project.milestones} projectId={project.id} />
                </Reveal>
              </div>

              <Reveal className="lg:col-span-5" delay={0.08}>
                <section className="surface p-5 sm:p-7">
                  <SectionTitle title="Equipo" detail={`Dirige ${project.manager.name}`} />
                  <Stagger as="ul" className="mt-4 divide-y divide-line">
                    {project.team.map((m) => {
                      const count = own.filter((t) => t.assignee.id === m.id && !t.completed).length;
                      return (
                        <StaggerItem as="li" key={m.id} className="flex items-center gap-3 py-3">
                          <Avatar src={m.avatar} name={m.name} size="sm" status={m.status} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-medium text-ink">{m.name}</p>
                            <p className="truncate text-[12px] text-ink-2">
                              {m.id === project.manager.id && <span className="font-medium text-accent-ink">Responsable · </span>}
                              {m.role}
                            </p>
                          </div>
                          <span className="tabular shrink-0 text-[12px] text-ink-2">{count} abiertas</span>
                        </StaggerItem>
                      );
                    })}
                  </Stagger>
                </section>
              </Reveal>
            </div>
          )}

          {tab === 'tareas' && (
            <div className="space-y-4">
              <SearchField value={taskSearch} onChange={setTaskSearch} placeholder="Buscar en este proyecto" className="max-w-md" />
              {visibleTasks.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title={own.length ? 'Ninguna tarea coincide' : 'Este proyecto aún no tiene tareas'}
                  description={own.length ? 'Prueba con otra palabra.' : 'Crea la primera para empezar a medir el avance.'}
                  action={
                    !own.length && (
                      <Button onClick={() => setIsCreateTaskOpen(true, { projectId: project.id })}>
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                        Nueva tarea
                      </Button>
                    )
                  }
                />
              ) : taskView === 'kanban' ? (
                <KanbanBoard tasks={visibleTasks} projectId={project.id} />
              ) : (
                <ul className="surface divide-y divide-line overflow-hidden">
                  {visibleTasks.map((t) => {
                    const p = getPriorityMeta(t.priority);
                    const s = getTaskStatusMeta(t.status);
                    const due = describeDue(t.dueDate, t.completed);
                    return (
                      <li key={t.id} className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-fill sm:px-6">
                        <Check checked={t.completed} onChange={() => toggleTaskComplete(t.id)} label={`Completar ${t.title}`} />
                        <button onClick={() => setSelectedTaskId(t.id)} className="min-w-0 flex-1 text-left">
                          <span className={cn('block truncate text-[14px]', t.completed ? 'text-ink-3 line-through' : 'text-ink')}>
                            <PriorityMarks marks={p.marks} tone={p.tone} className="mr-1" />
                            {t.title}
                          </span>
                          <span className={cn('text-[12px]', due.tone === 'gray' ? 'text-ink-2' : toneClasses[due.tone].ink)}>{due.label}</span>
                        </button>
                        <Pill tone={s.tone} className="hidden sm:inline-flex">
                          {s.label}
                        </Pill>
                        <Avatar src={t.assignee.avatar} name={t.assignee.name} size="xs" />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {tab === 'actividad' && (
            <section className="surface p-5 sm:p-7">
              {log.length === 0 ? (
                <p className="py-8 text-center text-footnote text-ink-2">Todavía no hay movimientos en este proyecto.</p>
              ) : (
                <Stagger as="ol" className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-line">
                  {log.map((a) => (
                    <StaggerItem as="li" key={a.id} className="relative flex gap-3.5">
                      <Avatar src={a.user.avatar} name={a.user.name} size="sm" className="rounded-full ring-4 ring-card" />
                      <div className="min-w-0 pt-1 text-[14px] leading-snug">
                        <p className="text-ink-2">
                          <span className="font-medium text-ink">{firstName(a.user.name)}</span> {a.action}{' '}
                          <span className="font-medium text-ink">{a.entity}</span>
                        </p>
                        <p className="mt-0.5 text-[12px] text-ink-3">{a.timeAgo}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </section>
          )}

          {tab === 'equipo' && (
            <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.team.map((m) => {
                const st = getMemberStatusMeta(m.status);
                const mine = own.filter((t) => t.assignee.id === m.id);
                return (
                  <StaggerItem key={m.id} className="surface flex flex-col items-center p-6 text-center">
                    <Avatar src={m.avatar} name={m.name} size="xl" status={m.status} />
                    <p className="text-headline mt-3 text-ink">{m.name}</p>
                    <p className="text-[12px] text-ink-2">{m.role}</p>
                    <Pill tone={st.tone} className="mt-3">
                      {st.label}
                    </Pill>
                    <p className="mt-4 text-[12px] text-ink-2">
                      {mine.filter((t) => t.completed).length} de {mine.length} tareas cerradas aquí
                    </p>
                    <a
                      href={`mailto:${m.email}`}
                      className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-accent-soft px-4 text-[13px] font-medium text-accent-ink transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
                    >
                      <Mail className="h-4 w-4" />
                      Escribir
                    </a>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </motion.div>
      </AnimatePresence>

      <EditProjectModal project={editOpen ? project : null} onClose={() => setEditOpen(false)} />
    </div>
  );
}
