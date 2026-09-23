'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { PartyPopper } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Check } from '@/components/ui/check';
import { Avatar } from '@/components/ui/avatar';
import { PriorityMarks } from '@/components/ui/badge';
import { SectionTitle } from '@/components/layout/page-header';
import { easeApple } from '@/lib/motion';
import { cn, describeDue, getPriorityMeta, toneClasses } from '@/lib/utils';

/** The next deliveries across the team; yours are marked with a blue edge. */
export function UpcomingTasks() {
  const { tasks, currentUser, toggleTaskComplete, setSelectedTaskId } = useStore();
  // Tasks ticked here stay visible (struck through) until the page changes.
  const [tickedHere, setTickedHere] = useState<string[]>([]);

  const open = tasks.filter((t) => !t.completed);
  const mineOpen = open.filter((t) => t.assignee.id === currentUser.id).length;
  const list = tasks
    .filter((t) => !t.completed || tickedHere.includes(t.id))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);

  return (
    <section className="surface flex h-full flex-col p-5 sm:p-7">
      <SectionTitle
        title="Próximas entregas"
        detail={
          open.length
            ? `${open.length} abiertas · ${mineOpen === 1 ? '1 es tuya' : `${mineOpen} son tuyas`}`
            : 'Nada pendiente'
        }
        trailing={
          <Link href="/tareas" className="shrink-0 text-[13px] font-medium text-accent-ink hover:underline">
            Ver todas
          </Link>
        }
      />

      {list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <PartyPopper className="mb-2 h-6 w-6 text-ink-3" />
          <p className="text-footnote text-ink-2">El equipo no tiene entregas pendientes.</p>
        </div>
      ) : (
        <ul className="mt-3">
          <AnimatePresence initial={false}>
            {list.map((task) => {
              const prio = getPriorityMeta(task.priority);
              const due = describeDue(task.dueDate, task.completed);
              const mine = task.assignee.id === currentUser.id;
              return (
                <motion.li
                  key={task.id}
                  layout="position"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: easeApple }}
                  className="relative border-b border-line last:border-0"
                >
                  {mine && <span aria-hidden className="absolute top-3.5 bottom-3.5 -left-2.5 w-[3px] rounded-full bg-accent sm:-left-3.5" />}
                  <div className="flex items-start gap-3 py-3">
                    <Check
                      checked={task.completed}
                      onChange={() => {
                        if (!task.completed) setTickedHere((ids) => [...ids, task.id]);
                        toggleTaskComplete(task.id);
                      }}
                      label={task.completed ? `Reabrir ${task.title}` : `Completar ${task.title}`}
                      className="mt-px"
                    />
                    <button onClick={() => setSelectedTaskId(task.id)} className="group min-w-0 flex-1 text-left">
                      <span
                        className={cn(
                          'block text-[14px] leading-snug transition-colors duration-300',
                          task.completed ? 'text-ink-3 line-through' : 'text-ink group-hover:text-accent-ink'
                        )}
                      >
                        <PriorityMarks marks={prio.marks} tone={prio.tone} className="mr-1" />
                        {task.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-2">
                        <span className="truncate">{task.projectName}</span>
                        <span aria-hidden>·</span>
                        <span className={cn('shrink-0', due.tone !== 'gray' && toneClasses[due.tone].ink)}>{due.label}</span>
                      </span>
                    </button>
                    <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" className="mt-0.5" />
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
