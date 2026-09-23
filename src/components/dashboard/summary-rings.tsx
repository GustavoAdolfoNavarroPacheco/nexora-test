'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ActivityRings } from '@/components/ui/rings';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { easeApple } from '@/lib/motion';
import { daysUntil, isAtRisk, isOverdue, pluralize } from '@/lib/utils';

// Fixed Fitness-like hues: the tile is always dark, regardless of theme.
const HUES = {
  portfolio: { color: '#2997ff', end: '#64d2ff' },
  tasks: { color: '#30d158', end: '#a4f07a' },
  milestones: { color: '#ff9f0a', end: '#ffd60a' },
};

/**
 * The workspace's day at a glance: three rings that close as work gets done.
 * Outer — average progress of live projects. Middle — share of tasks closed.
 * Inner — share of milestones reached.
 */
export function SummaryRings() {
  const { projects, tasks } = useStore();

  const live = projects.filter((p) => p.status !== 'archivado' && p.status !== 'completado');
  const portfolio = live.length ? Math.round(live.reduce((a, p) => a + p.progress, 0) / live.length) : 0;

  const closed = tasks.filter((t) => t.completed).length;
  const tasksPct = tasks.length ? Math.round((closed / tasks.length) * 100) : 0;

  const milestones = live.flatMap((p) => p.milestones);
  const reached = milestones.filter((m) => m.completed).length;
  const milestonesPct = milestones.length ? Math.round((reached / milestones.length) * 100) : 0;

  const overdue = tasks.filter(isOverdue).length;
  const atRisk = live.filter(isAtRisk).length;
  const dueThisWeek = milestones.filter((m) => !m.completed && daysUntil(m.date) >= 0 && daysUntil(m.date) <= 7).length;

  const rows = [
    {
      key: 'portfolio',
      label: 'Avance de cartera',
      value: portfolio,
      detail: `Promedio de ${pluralize(live.length, 'proyecto en curso', 'proyectos en curso')}`,
      ...HUES.portfolio,
    },
    {
      key: 'tasks',
      label: 'Tareas cerradas',
      value: tasksPct,
      detail: `${closed} de ${tasks.length} tareas`,
      ...HUES.tasks,
    },
    {
      key: 'milestones',
      label: 'Hitos cumplidos',
      value: milestonesPct,
      detail: `${reached} de ${milestones.length} hitos`,
      ...HUES.milestones,
    },
  ];

  return (
    <section
      aria-label="Resumen del día"
      className="relative isolate overflow-hidden rounded-[28px] bg-[#101012] text-white shadow-lift"
    >
      {/* Ambient light — drifts slowly behind the rings, never stops. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-drift absolute -top-1/3 -left-1/4 h-[140%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.22),transparent)]" />
        <div className="animate-drift absolute -right-1/4 -bottom-1/2 h-[120%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(48,209,88,0.12),transparent)] [animation-delay:-9s]" />
      </div>

      <div className="grid items-center gap-8 p-6 sm:p-9 md:grid-cols-[auto_1fr] md:gap-12">
        <div className="relative mx-auto w-[min(240px,70vw)]">
          <ActivityRings
            className="h-auto w-full"
            size={240}
            stroke={24}
            gap={5}
            trackOpacity={0.18}
            rings={rows.map((r) => ({ value: r.value, color: r.color, colorEnd: r.end, label: r.label }))}
          />
        </div>

        <div className="min-w-0">
          <p className="text-eyebrow text-white/50">Resumen del día</p>
          <ul className="mt-4 space-y-5">
            {rows.map((r, i) => (
              <motion.li
                key={r.key}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: easeApple, delay: 0.25 + i * 0.12 }}
                className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-medium" style={{ color: r.color }}>
                    {r.label}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-white/55">{r.detail}</p>
                </div>
                <AnimatedNumber
                  value={r.value}
                  suffix="%"
                  className="text-[34px] leading-none font-semibold tracking-[-0.04em] sm:text-[40px]"
                />
              </motion.li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <SignalChip href="/tareas?lista=vencidas" tone={overdue > 0 ? 'alert' : 'calm'}>
              {overdue > 0 ? pluralize(overdue, 'tarea vencida', 'tareas vencidas') : 'Sin tareas vencidas'}
            </SignalChip>
            <SignalChip href="/reportes" tone={atRisk > 0 ? 'alert' : 'calm'}>
              {atRisk > 0 ? pluralize(atRisk, 'proyecto en riesgo', 'proyectos en riesgo') : 'Ningún proyecto en riesgo'}
            </SignalChip>
            <SignalChip href="/proyectos" tone="calm">
              {pluralize(dueThisWeek, 'hito esta semana', 'hitos esta semana')}
            </SignalChip>
          </div>
        </div>
      </div>
    </section>
  );
}

function SignalChip({ href, tone, children }: { href: string; tone: 'alert' | 'calm'; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 pr-2.5 pl-3 text-[12px] font-medium text-white/85 transition-colors hover:bg-white/[0.16] hover:text-white"
    >
      {tone === 'alert' && <span className="h-1.5 w-1.5 rounded-full bg-[#ff453a]" />}
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-transform duration-300 ease-apple group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
    </Link>
  );
}
