'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Plus } from 'lucide-react';
import { Milestone } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Check } from '@/components/ui/check';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '@/components/layout/page-header';
import { easeApple } from '@/lib/motion';
import { cn, daysUntil, formatDate, todayISO } from '@/lib/utils';

/** Vertical timeline. Connectors fill in sequence up to the last reached milestone. */
export function ProjectMilestones({ milestones, projectId }: { milestones: Milestone[]; projectId: string }) {
  const { toggleMilestone, addMilestone } = useStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => todayISO(14));
  const listRef = useRef<HTMLOListElement>(null);
  const inView = useInView(listRef, { once: true, margin: '0px 0px -10% 0px' });

  const lastDone = milestones.reduce((acc, m, i) => (m.completed ? i : acc), -1);
  const nextIndex = milestones.findIndex((m) => !m.completed);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addMilestone(projectId, { title: title.trim(), date });
    setTitle('');
    setAdding(false);
  };

  return (
    <section className="surface p-5 sm:p-7">
      <SectionTitle
        title="Hitos"
        detail={`${milestones.filter((m) => m.completed).length} de ${milestones.length} cumplidos`}
        trailing={
          <Button variant="plain" size="sm" onClick={() => setAdding((a) => !a)} aria-expanded={adding}>
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Añadir
          </Button>
        }
      />

      <AnimatePresence initial={false}>
        {adding && (
          <motion.form
            onSubmit={submit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeApple }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-col gap-2 rounded-[16px] bg-fill p-3 sm:flex-row">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre del hito"
                aria-label="Nombre del hito"
                className="h-10 flex-1 rounded-[10px] bg-card px-3 text-[14px] text-ink shadow-card outline-none placeholder:text-ink-3 focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Fecha"
                className="h-10 rounded-[10px] bg-card px-3 text-[14px] text-ink shadow-card outline-none"
              />
              <Button type="submit" size="md" disabled={!title.trim()}>
                Guardar
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <ol ref={listRef} className="relative mt-6">
        {milestones.map((m, i) => {
          const d = daysUntil(m.date);
          const isNext = i === nextIndex;
          return (
            <li key={m.id} className="relative flex gap-4 pb-6 last:pb-0">
              {i < milestones.length - 1 && (
                <span aria-hidden className="absolute top-[28px] -bottom-[2px] left-[11px] w-[2px] overflow-hidden rounded-full bg-fill-2">
                  <motion.span
                    className="block h-full w-full origin-top rounded-full bg-accent"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: inView && i < lastDone ? 1 : 0 }}
                    transition={{ duration: 0.6, ease: easeApple, delay: inView ? i * 0.18 : 0 }}
                  />
                </span>
              )}
              <Check
                checked={m.completed}
                onChange={() => toggleMilestone(projectId, m.id)}
                label={m.completed ? `Marcar pendiente: ${m.title}` : `Marcar cumplido: ${m.title}`}
                className={cn('relative z-10 bg-card', isNext && !m.completed && 'shadow-[inset_0_0_0_2px_var(--accent)]')}
                size={24}
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className={cn('text-[14px] leading-snug font-medium', m.completed ? 'text-ink-3' : 'text-ink')}>{m.title}</p>
                <p className="mt-0.5 text-[12px] text-ink-2">
                  {formatDate(m.date)}
                  {!m.completed && d < 0 && <span className="text-red-ink"> · atrasado {Math.abs(d)} días</span>}
                  {!m.completed && d >= 0 && isNext && <span className="text-accent-ink"> · siguiente, en {d} días</span>}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
