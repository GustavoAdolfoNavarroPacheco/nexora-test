'use client';

import React, { useState } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'motion/react';
import { Plus, ListTodo, MessageCircle } from 'lucide-react';
import { Task, TaskStatus } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { PriorityMarks } from '@/components/ui/badge';
import { Chevrons } from '@/components/ui/input';
import { Dropdown } from '@/components/ui/dropdown';
import { springSoft } from '@/lib/motion';
import { cn, describeDue, getPriorityMeta, getTaskStatusMeta, TASK_STATUSES, toneClasses } from '@/lib/utils';

const STATUS_OPTIONS = TASK_STATUSES.map((s) => ({ value: s, label: getTaskStatusMeta(s).label }));

function KanbanCard({ task, onDragStart, dragging }: { task: Task; onDragStart: (id: string) => void; dragging: boolean }) {
  const { setSelectedTaskId, updateTaskStatus } = useStore();
  const prio = getPriorityMeta(task.priority);
  const due = describeDue(task.dueDate, task.completed);
  const subDone = task.subtasks.filter((s) => s.completed).length;

  return (
    <motion.div layout layoutId={`kanban-${task.id}`} transition={springSoft} className="relative">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', task.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart(task.id);
        }}
        onDragEnd={() => onDragStart('')}
        onClick={() => setSelectedTaskId(task.id)}
        onKeyDown={(e) => e.key === 'Enter' && setSelectedTaskId(task.id)}
        tabIndex={0}
        role="button"
        aria-label={`Abrir ${task.title}`}
        className={cn(
          'group cursor-grab rounded-[16px] bg-card p-4 shadow-card transition-[box-shadow,opacity,transform] duration-200 ease-apple active:cursor-grabbing',
          'hover:-translate-y-0.5 hover:shadow-lift',
          dragging && 'rotate-[1.5deg] opacity-40'
        )}
      >
        <p className={cn('text-[14px] leading-snug font-medium', task.completed ? 'text-ink-3 line-through' : 'text-ink')}>
          <PriorityMarks marks={prio.marks} tone={prio.tone} className="mr-1" />
          {task.title}
        </p>
        <p className="mt-1 truncate text-[12px] text-ink-2">{task.projectName}</p>

        {(task.subtasks.length > 0 || task.comments.length > 0) && (
          <div className="mt-3 flex items-center gap-3 text-[12px] text-ink-2">
            {task.subtasks.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <ListTodo className="h-3.5 w-3.5 text-ink-3" />
                {subDone}/{task.subtasks.length}
              </span>
            )}
            {task.comments.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5 text-ink-3" />
                {task.comments.length}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" />
            <span className={cn('truncate text-[12px] font-medium', due.tone === 'gray' ? 'text-ink-2' : toneClasses[due.tone].ink)}>
              {due.label}
            </span>
          </div>
          {/* Touch devices can't drag — this select moves the card instead. */}
          <span className="relative shrink-0" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <Dropdown
              label="Mover a"
              value={task.status}
              onChange={(v) => updateTaskStatus(task.id, v as TaskStatus)}
              options={STATUS_OPTIONS}
              align="end"
              triggerClassName="h-7 rounded-full bg-fill-2 pr-6 pl-2.5 text-[11px] font-medium text-ink-2 outline-none transition-colors hover:text-ink aria-expanded:text-ink"
              adornment={<Chevrons className="pointer-events-none absolute top-1/2 right-2 h-3 w-2 -translate-y-1/2 text-ink-3" />}
            />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function KanbanBoard({ tasks, projectId }: { tasks: Task[]; projectId?: string }) {
  const { updateTaskStatus, setIsCreateTaskOpen } = useStore();
  const [draggingId, setDraggingId] = useState('');
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  return (
    <LayoutGroup>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:scroll-px-8 sm:px-8 xl:mx-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-0">
        {TASK_STATUSES.map((status) => {
          const meta = getTaskStatusMeta(status);
          const column = tasks.filter((t) => t.status === status);
          const isOver = overColumn === status && draggingId !== '';
          return (
            <section
              key={status}
              aria-label={meta.label}
              onDragOver={(e) => {
                e.preventDefault();
                if (overColumn !== status) setOverColumn(status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverColumn(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain') || draggingId;
                if (id) updateTaskStatus(id, status);
                setDraggingId('');
                setOverColumn(null);
              }}
              className={cn(
                'flex w-[82vw] max-w-[320px] shrink-0 snap-start flex-col rounded-[22px] bg-fill p-2.5 transition-[background-color,box-shadow] duration-200 xl:w-auto xl:max-w-none',
                isOver && 'bg-accent-soft shadow-[inset_0_0_0_2px_var(--accent)]'
              )}
            >
              <header className="flex items-center justify-between px-2 pt-1.5 pb-3">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', toneClasses[meta.tone].dot)} />
                  <h3 className="text-[13px] font-semibold text-ink">{meta.label}</h3>
                  <span className="tabular text-[12px] text-ink-3">{column.length}</span>
                </div>
                <button
                  onClick={() => setIsCreateTaskOpen(true, { projectId, status })}
                  aria-label={`Nueva tarea en ${meta.label}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-fill-2 hover:text-accent-ink"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </header>

              <div className="flex min-h-[140px] flex-1 flex-col gap-2.5">
                <AnimatePresence initial={false}>
                  {column.map((task) => (
                    <KanbanCard key={task.id} task={task} dragging={draggingId === task.id} onDragStart={setDraggingId} />
                  ))}
                </AnimatePresence>
                {column.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-[16px] border-[1.5px] border-dashed border-line-strong px-4 py-8 text-center text-[12px] text-ink-3">
                    Arrastra una tarea aquí
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
