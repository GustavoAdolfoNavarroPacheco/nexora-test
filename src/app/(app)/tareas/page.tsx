'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Inbox, UserRound, CalendarX2, Eye, CircleCheck, Rows3, Kanban, SearchX } from 'lucide-react';
import { useStore } from '@/lib/store';
import { PageHeader, EmptyState } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Check } from '@/components/ui/check';
import { PriorityMarks } from '@/components/ui/badge';
import { PillSelect } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { SearchField } from '@/components/projects/project-filters';
import { KanbanBoard } from '@/components/projects/kanban-board';
import { easeApple } from '@/lib/motion';
import { cn, describeDue, getPriorityMeta, isOverdue, normalizeText, toneClasses } from '@/lib/utils';
import type { Task } from '@/lib/types';

type SmartList = 'todas' | 'mias' | 'vencidas' | 'revision' | 'completadas';

const LISTS: { id: SmartList; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'todas', label: 'Abiertas', icon: Inbox, color: 'bg-ink-2' },
  { id: 'mias', label: 'Asignadas a mí', icon: UserRound, color: 'bg-accent' },
  { id: 'vencidas', label: 'Vencidas', icon: CalendarX2, color: 'bg-red' },
  { id: 'revision', label: 'En revisión', icon: Eye, color: 'bg-purple' },
  { id: 'completadas', label: 'Completadas', icon: CircleCheck, color: 'bg-green' },
];

function isSmartList(v: string | null): v is SmartList {
  return LISTS.some((l) => l.id === v);
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  const { setSelectedTaskId } = useStore();
  const prio = getPriorityMeta(task.priority);
  const due = describeDue(task.dueDate, task.completed);

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: easeApple }}
      className="relative overflow-hidden after:absolute after:right-0 after:bottom-0 after:left-[52px] after:h-px after:bg-line last:after:hidden sm:after:left-[56px]"
    >
      <div className="group flex items-start gap-3.5 py-3 pr-4 pl-4 sm:pl-5">
        <Check
          checked={task.completed}
          onChange={() => onToggle(task)}
          label={task.completed ? `Reabrir ${task.title}` : `Completar ${task.title}`}
          className="mt-px"
        />
        <button
          onClick={() => setSelectedTaskId(task.id)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="flex items-start justify-between gap-3">
            <span className={cn('text-[15px] leading-snug transition-colors', task.completed ? 'text-ink-3 line-through' : 'text-ink group-hover:text-accent-ink')}>
              <PriorityMarks marks={prio.marks} tone={prio.tone} className="mr-1" />
              {task.title}
            </span>
            <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" className="mt-0.5" />
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px]">
            <span className={cn(due.tone === 'gray' ? 'text-ink-2' : toneClasses[due.tone].ink)}>{due.label}</span>
            {task.subtasks.length > 0 && (
              <span className="text-ink-3">
                · {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} pasos
              </span>
            )}
          </span>
        </button>
      </div>
    </motion.li>
  );
}

function TasksView() {
  const params = useSearchParams();
  const initialList = params.get('lista');
  const { tasks, projects, currentUser, setIsCreateTaskOpen, toggleTaskComplete } = useStore();

  const [list, setList] = useState<SmartList>(isSmartList(initialList) ? initialList : 'todas');
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  // Like Reminders: a ticked task lingers for a moment before leaving the list.
  const [lingering, setLingering] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const toggle = (task: Task) => {
    setLingering((ids) => [...ids, task.id]);
    timers.current.push(setTimeout(() => setLingering((ids) => ids.filter((id) => id !== task.id)), 1400));
    toggleTaskComplete(task.id);
  };

  const inList = (t: Task, l: SmartList) => {
    switch (l) {
      case 'mias':
        return t.assignee.id === currentUser.id && !t.completed;
      case 'vencidas':
        return isOverdue(t);
      case 'revision':
        return t.status === 'en_revision';
      case 'completadas':
        return t.completed;
      default:
        return !t.completed;
    }
  };

  const q = normalizeText(search);
  const visible = tasks
    .filter((t) => (view === 'kanban' ? list === 'todas' || inList(t, list) : inList(t, list) || lingering.includes(t.id)))
    .filter((t) => !q || normalizeText(t.title).includes(q) || normalizeText(t.projectName).includes(q))
    .filter((t) => !projectId || t.projectId === projectId)
    .filter((t) => !priority || t.priority === priority)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Group the list by project, like Reminders groups by list.
  const groups = projects
    .map((p) => ({ project: p, items: visible.filter((t) => t.projectId === p.id) }))
    .filter((g) => g.items.length > 0);

  const current = LISTS.find((l) => l.id === list)!;

  return (
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        title="Tareas"
        subtitle="Marca lo que termines; el avance de cada proyecto se recalcula solo."
        actions={
          <Button onClick={() => setIsCreateTaskOpen(true, { projectId: projectId || undefined })}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nueva tarea
          </Button>
        }
      />

      {/* Smart lists */}
      <div role="radiogroup" aria-label="Listas" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {LISTS.map((l, i) => {
          const Icon = l.icon;
          const count = tasks.filter((t) => inList(t, l.id)).length;
          const selected = list === l.id;
          return (
            <motion.button
              key={l.id}
              role="radio"
              aria-checked={selected}
              onClick={() => setList(l.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeApple, delay: 0.05 * i }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                'relative flex flex-col items-start rounded-[18px] p-3.5 text-left transition-[box-shadow,background-color] duration-300',
                selected ? 'bg-card shadow-[0_0_0_2px_var(--accent),var(--shadow-lift)]' : 'bg-card shadow-card hover:shadow-lift',
                i === 4 && 'col-span-2 sm:col-span-1'
              )}
            >
              <div className="flex w-full items-start justify-between">
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-white', l.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <AnimatedNumber value={count} className="text-[26px] leading-none font-semibold tracking-[-0.04em] text-ink" />
              </div>
              <span className="mt-3 text-[13px] font-medium text-ink-2">{l.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchField value={search} onChange={setSearch} placeholder="Buscar tareas" className="flex-1" />
        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <PillSelect label="Proyecto" value={projectId} onChange={setProjectId}>
            <option value="">Todos los proyectos</option>
            {projects
              .filter((p) => p.status !== 'archivado')
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </PillSelect>
          <PillSelect label="Prioridad" value={priority} onChange={setPriority}>
            <option value="">Cualquier prioridad</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </PillSelect>
          <Segmented
            label="Vista"
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: '', icon: Rows3, ariaLabel: 'Lista' },
              { value: 'kanban', label: '', icon: Kanban, ariaLabel: 'Tablero' },
            ]}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${view}-${list}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: easeApple }}
        >
          {visible.length === 0 ? (
            <EmptyState
              icon={list === 'vencidas' || list === 'mias' ? CircleCheck : SearchX}
              title={
                search || projectId || priority
                  ? 'Ninguna tarea coincide'
                  : list === 'vencidas'
                    ? 'Nada vencido'
                    : list === 'mias'
                      ? 'No tienes tareas abiertas'
                      : 'Esta lista está vacía'
              }
              description={search || projectId || priority ? 'Prueba con otra búsqueda o quita los filtros.' : undefined}
              action={
                (search || projectId || priority) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch('');
                      setProjectId('');
                      setPriority('');
                    }}
                  >
                    Quitar filtros
                  </Button>
                )
              }
            />
          ) : view === 'kanban' ? (
            <KanbanBoard tasks={visible} projectId={projectId || undefined} />
          ) : (
            <div className="space-y-5">
              <h2 className="sr-only">{current.label}</h2>
              {groups.map((g) => (
                <section key={g.project.id} className="surface overflow-hidden">
                  <header className="flex items-baseline justify-between px-5 pt-4 pb-1">
                    <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-accent-ink">{g.project.name}</h3>
                    <span className="tabular text-[12px] text-ink-3">{g.items.length}</span>
                  </header>
                  <ul>
                    <AnimatePresence initial={false}>
                      {g.items.map((t) => (
                        <TaskRow key={t.id} task={t} onToggle={toggle} />
                      ))}
                    </AnimatePresence>
                  </ul>
                </section>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function TareasPage() {
  return (
    <Suspense fallback={<div className="skeleton mt-10 h-40 rounded-[22px]" />}>
      <TasksView />
    </Suspense>
  );
}
