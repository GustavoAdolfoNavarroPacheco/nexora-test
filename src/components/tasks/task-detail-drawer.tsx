'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, FolderClosed, Plus } from 'lucide-react';
import { useStore, createId } from '@/lib/store';
import { Drawer } from '@/components/ui/sheet';
import { Avatar } from '@/components/ui/avatar';
import { Check } from '@/components/ui/check';
import { Chevrons } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { spring, easeApple } from '@/lib/motion';
import { cn, describeDue, firstName, formatTime, getTaskStatusMeta, TASK_STATUSES, toneClasses } from '@/lib/utils';
import { Priority, Task, TaskStatus } from '@/lib/types';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 px-4 py-2">
      <span className="text-[14px] text-ink">{label}</span>
      <div className="flex min-w-0 items-center justify-end">{children}</div>
    </div>
  );
}

function InlineSelect({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex items-center">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-5 text-right text-[14px] text-ink-2 outline-none hover:text-ink"
      >
        {children}
      </select>
      <Chevrons className="pointer-events-none absolute right-0 h-3 w-2 text-ink-3" />
    </span>
  );
}

function TaskDetail({ task }: { task: Task }) {
  const { currentUser, setSelectedTaskId, updateTask, toggleTaskComplete, toggleSubtask, addCommentToTask } = useStore();
  const [comment, setComment] = useState('');
  const [subtask, setSubtask] = useState('');

  const due = describeDue(task.dueDate, task.completed);
  const subDone = task.subtasks.filter((s) => s.completed).length;

  const addSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtask.trim()) return;
    updateTask(task.id, { subtasks: [...task.subtasks, { id: createId('sub'), title: subtask.trim(), completed: false }] });
    setSubtask('');
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addCommentToTask(task.id, comment);
    setComment('');
  };

  return (
    <div className="space-y-7 pt-1">
      <div className="flex items-start gap-3.5">
        <Check
          checked={task.completed}
          onChange={() => toggleTaskComplete(task.id)}
          label={task.completed ? 'Reabrir tarea' : 'Completar tarea'}
          size={28}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <h3 className={cn('text-title-2 transition-colors', task.completed ? 'text-ink-3 line-through' : 'text-ink')}>{task.title}</h3>
          <Link
            href={`/proyectos/${task.projectId}`}
            onClick={() => setSelectedTaskId(null)}
            className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-ink hover:underline"
          >
            <FolderClosed className="h-3.5 w-3.5" />
            {task.projectName}
          </Link>
        </div>
      </div>

      {/* iOS grouped list */}
      <div className="divide-y divide-line overflow-hidden rounded-[16px] bg-fill">
        <Row label="Estado">
          <span className={cn('mr-2 h-2 w-2 rounded-full', toneClasses[getTaskStatusMeta(task.status).tone].dot)} />
          <InlineSelect label="Estado" value={task.status} onChange={(v) => updateTask(task.id, { status: v as TaskStatus })}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {getTaskStatusMeta(s).label}
              </option>
            ))}
          </InlineSelect>
        </Row>
        <Row label="Prioridad">
          <InlineSelect label="Prioridad" value={task.priority} onChange={(v) => updateTask(task.id, { priority: v as Priority })}>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </InlineSelect>
        </Row>
        <Row label="Fecha límite">
          <input
            type="date"
            aria-label="Fecha límite"
            value={task.dueDate}
            onChange={(e) => e.target.value && updateTask(task.id, { dueDate: e.target.value })}
            className={cn('bg-transparent text-right text-[14px] outline-none', due.tone === 'gray' ? 'text-ink-2' : toneClasses[due.tone].ink)}
          />
        </Row>
        <Row label="Responsable">
          <span className="flex items-center gap-2 text-[14px] text-ink-2">
            <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" />
            {task.assignee.name}
          </span>
        </Row>
      </div>

      {task.description && (
        <div>
          <h4 className="mb-2 pl-1 text-[13px] font-semibold text-ink">Notas</h4>
          <p className="text-body whitespace-pre-line text-ink-2">{task.description}</p>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-baseline justify-between pl-1">
          <h4 className="text-[13px] font-semibold text-ink">Checklist</h4>
          {task.subtasks.length > 0 && (
            <span className="tabular text-[12px] text-ink-2">
              {subDone} de {task.subtasks.length}
            </span>
          )}
        </div>
        {task.subtasks.length > 0 && <ProgressBar value={(subDone / task.subtasks.length) * 100} tone="green" className="mb-3" height={4} />}
        <ul className="space-y-0.5">
          <AnimatePresence initial={false}>
            {task.subtasks.map((s) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: easeApple }}
              >
                <div className="flex items-center gap-3 rounded-[12px] px-1 py-2">
                  <Check checked={s.completed} onChange={() => toggleSubtask(task.id, s.id)} label={s.title} size={20} />
                  <span className={cn('text-[14px] transition-colors', s.completed ? 'text-ink-3 line-through' : 'text-ink')}>{s.title}</span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <form onSubmit={addSubtask} className="mt-1 flex items-center gap-3 px-1">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-ink-3">
            <Plus className="h-4 w-4" />
          </span>
          <input
            value={subtask}
            onChange={(e) => setSubtask(e.target.value)}
            placeholder="Añadir paso"
            aria-label="Añadir paso a la checklist"
            className="h-10 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
        </form>
      </div>

      <div>
        <h4 className="mb-3 pl-1 text-[13px] font-semibold text-ink">Conversación</h4>
        {task.comments.length === 0 ? (
          <p className="pl-1 text-footnote text-ink-3">Nadie ha comentado todavía.</p>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {task.comments.map((c) => {
                const mine = c.author.id === currentUser.id;
                return (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={spring}
                    style={{ transformOrigin: mine ? 'bottom right' : 'bottom left' }}
                    className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}
                  >
                    {!mine && <Avatar src={c.author.avatar} name={c.author.name} size="xs" />}
                    <div className={cn('max-w-[80%]', mine && 'text-right')}>
                      {!mine && <p className="mb-0.5 pl-3 text-[11px] text-ink-3">{firstName(c.author.name)}</p>}
                      <p
                        className={cn(
                          'inline-block rounded-[20px] px-3.5 py-2 text-left text-[14px] leading-snug',
                          mine ? 'rounded-br-[6px] bg-accent text-white' : 'rounded-bl-[6px] bg-fill-2 text-ink'
                        )}
                      >
                        {c.content}
                      </p>
                      <p className={cn('mt-0.5 text-[10px] text-ink-3', mine ? 'pr-2' : 'pl-3')}>{formatTime(c.createdAt)}</p>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}

        <form onSubmit={send} className="mt-4 flex items-center gap-2 rounded-full bg-fill py-1 pr-1 pl-4 shadow-[inset_0_0_0_1px_var(--line)] focus-within:shadow-[inset_0_0_0_1px_var(--accent)]">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe un comentario"
            aria-label="Comentario"
            className="h-9 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
          <motion.button
            type="submit"
            disabled={!comment.trim()}
            aria-label="Enviar comentario"
            animate={{ scale: comment.trim() ? 1 : 0.85, opacity: comment.trim() ? 1 : 0.4 }}
            transition={spring}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.6} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

export function TaskDetailDrawer() {
  const { tasks, selectedTaskId, setSelectedTaskId } = useStore();
  const task = tasks.find((t) => t.id === selectedTaskId);
  // Hold on to the last task so the panel keeps its content while sliding out.
  const [shown, setShown] = useState<Task | undefined>(task);
  if (task && task !== shown) setShown(task);

  return (
    <Drawer isOpen={Boolean(task)} onClose={() => setSelectedTaskId(null)} title="Tarea">
      {shown && <TaskDetail key={shown.id} task={task ?? shown} />}
    </Drawer>
  );
}
