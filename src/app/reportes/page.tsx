'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Download } from 'lucide-react';
import { useStore } from '@/lib/store';
import { PageHeader, SectionTitle } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Segmented } from '@/components/ui/segmented';
import { SegmentedBar } from '@/components/ui/progress-bar';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/reveal';
import { easeApple } from '@/lib/motion';
import { cn, today, elapsedShare, getTaskStatusMeta, isAtRisk, isOverdue, TASK_STATUSES, toneClasses, getProjectStatusMeta } from '@/lib/utils';

type Period = 'semana' | 'mes' | 'trimestre';

// Tasks closed per bucket (oldest → current). Labels are derived from today's date.
const CLOSED: Record<Period, number[]> = {
  semana: [3, 5, 0, 1, 6, 7, 4],
  mes: [21, 27, 24, 33],
  trimestre: [86, 112, 26],
};

function bucketLabels(period: Period): string[] {
  const base = today();
  const n = CLOSED[period].length;
  return Array.from({ length: n }, (_, i) => {
    const back = n - 1 - i;
    if (period === 'mes') return `S${i + 1}`;
    const d = new Date(base);
    if (period === 'semana') {
      d.setDate(d.getDate() - back);
      return new Intl.DateTimeFormat('es-ES', { weekday: 'narrow' }).format(d);
    }
    d.setDate(1);
    d.setMonth(d.getMonth() - back);
    const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d).replace('.', '');
    return month.charAt(0).toUpperCase() + month.slice(1);
  });
}

function ClosedChart() {
  const [period, setPeriod] = useState<Period>('semana');
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });

  const labels = bucketLabels(period);
  const data = CLOSED[period].map((value, i) => ({ label: labels[i], value }));
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((a, d) => a + d.value, 0);
  const avg = total / data.length;
  const shown = hover !== null ? data[hover] : null;

  return (
    <section className="surface p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-footnote font-medium text-ink-2">{shown ? `Tareas cerradas · ${shown.label}` : 'Tareas cerradas'}</p>
          <AnimatedNumber value={shown ? shown.value : total} className="mt-1 text-[34px] leading-none font-semibold tracking-[-0.04em] text-ink" />
          <p className="text-caption mt-1.5 text-ink-2">Promedio de {avg.toFixed(1).replace('.', ',')} por periodo</p>
        </div>
        <Segmented
          label="Periodo"
          size="sm"
          value={period}
          onChange={(p) => {
            setPeriod(p);
            setHover(null);
          }}
          options={[
            { value: 'semana', label: 'Semana' },
            { value: 'mes', label: 'Mes' },
            { value: 'trimestre', label: 'Trimestre' },
          ]}
        />
      </div>

      <div ref={ref} className="relative mt-6 h-48" onPointerLeave={() => setHover(null)}>
        {/* Average guide — bars get 168px above the 24px label row */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-green"
          initial={false}
          animate={{ bottom: 24 + (avg / max) * 168, opacity: inView ? 1 : 0 }}
          transition={{ duration: 0.8, ease: easeApple }}
        >
          <span className="absolute -top-5 right-0 text-[10px] font-medium text-green-ink">prom.</span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            className="flex h-full items-end gap-2 sm:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {data.map((d, i) => (
              <button
                key={`${period}-${i}`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${d.label}: ${d.value} tareas`}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-2 outline-none"
              >
                <div className="relative flex w-full max-w-[56px] flex-1 items-end">
                  <motion.div
                    className={cn(
                      'w-full rounded-[8px] transition-colors duration-200',
                      hover === null || hover === i ? 'bg-accent' : 'bg-accent/30'
                    )}
                    initial={{ height: 0 }}
                    animate={{ height: inView ? `${Math.max((d.value / max) * 100, d.value ? 3 : 1.5)}%` : 0 }}
                    transition={{ duration: 0.9, ease: easeApple, delay: inView ? i * 0.06 : 0 }}
                  />
                </div>
                <span className={cn('h-4 text-[11px]', hover === i ? 'font-semibold text-ink' : 'text-ink-3')}>{d.label}</span>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

export default function ReportsPage() {
  const { projects, tasks, users, addToast } = useStore();

  const live = projects.filter((p) => p.status !== 'archivado');
  const done = tasks.filter((t) => t.completed).length;
  const closeRate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const inReview = tasks.filter((t) => t.status === 'en_revision').length;
  const atRisk = live.filter(isAtRisk).length;
  const milestones = live.flatMap((p) => p.milestones);
  const reached = milestones.filter((m) => m.completed).length;

  const exportCsv = () => {
    const header = ['Proyecto', 'Área', 'Estado', 'Avance %', 'Plazo usado %', 'Entrega', 'Tareas', 'Tareas cerradas', 'En riesgo'];
    const rows = projects.map((p) => {
      const own = tasks.filter((t) => t.projectId === p.id);
      return [
        p.name,
        p.clientOrArea,
        getProjectStatusMeta(p.status).label,
        p.progress,
        elapsedShare(p),
        p.dueDate,
        own.length,
        own.filter((t) => t.completed).length,
        isAtRisk(p) ? 'Sí' : 'No',
      ];
    });
    const blob = new Blob([String.fromCharCode(0xfeff) + toCsv([header, ...rows])], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `nexora-proyectos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Reporte exportado', description: name, type: 'success' });
  };

  const kpis = [
    { label: 'Tasa de cierre', value: closeRate, suffix: '%', detail: `${done} de ${tasks.length} tareas`, tone: 'green' as const },
    { label: 'En revisión', value: inReview, detail: 'esperando aprobación', tone: 'purple' as const },
    { label: 'Proyectos en riesgo', value: atRisk, detail: `de ${live.length} en seguimiento`, tone: atRisk ? ('orange' as const) : ('gray' as const) },
    { label: 'Hitos cumplidos', value: reached, detail: `de ${milestones.length} planificados`, tone: 'blue' as const },
  ];

  const statusSegments = TASK_STATUSES.map((s) => ({
    label: getTaskStatusMeta(s).label,
    tone: getTaskStatusMeta(s).tone === 'gray' ? ('orange' as const) : getTaskStatusMeta(s).tone,
    value: tasks.filter((t) => t.status === s).length,
  }));

  const workload = users
    .map((u) => {
      const own = tasks.filter((t) => t.assignee.id === u.id);
      return { user: u, total: own.length, done: own.filter((t) => t.completed).length, late: own.filter(isOverdue).length };
    })
    .filter((w) => w.total > 0)
    .sort((a, b) => b.total - a.total);
  const maxLoad = Math.max(...workload.map((w) => w.total), 1);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Reportes"
        subtitle="Ritmo de entrega, salud de cada proyecto y reparto del trabajo."
        actions={
          <Button variant="tinted" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        }
      />

      <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <StaggerItem key={k.label} className="surface p-4 sm:p-5">
            <span className={cn('mb-4 block h-1.5 w-7 rounded-full', toneClasses[k.tone].dot)} />
            <AnimatedNumber value={k.value} suffix={k.suffix} className="text-[30px] leading-none font-semibold tracking-[-0.04em] text-ink sm:text-[34px]" />
            <p className="mt-2 text-[13px] font-medium text-ink">{k.label}</p>
            <p className="text-[12px] text-ink-2">{k.detail}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-7">
          <ClosedChart />
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.08}>
          <section className="surface p-5 sm:p-7">
            <SectionTitle title="Estado de las tareas" detail={`${tasks.length} tareas en total`} />
            <SegmentedBar segments={statusSegments} height={14} className="mt-5" />
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              {statusSegments.map((s) => (
                <li key={s.label} className="flex items-center gap-2.5">
                  <span className={cn('h-2.5 w-2.5 rounded-full', toneClasses[s.tone].dot)} />
                  <span className="flex-1 text-[13px] text-ink-2">{s.label}</span>
                  <span className="tabular text-[13px] font-semibold text-ink">{s.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal className="lg:col-span-7">
          <section className="surface p-5 sm:p-7">
            <SectionTitle
              title="Avance frente al calendario"
              detail="La marca indica cuánto plazo se ha consumido"
            />
            <Stagger as="ul" className="mt-5 space-y-5">
              {live.map((p) => {
                const elapsed = elapsedShare(p);
                const risk = isAtRisk(p);
                const gap = p.progress - elapsed;
                return (
                  <StaggerItem as="li" key={p.id}>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <Link href={`/proyectos/${p.id}`} className="truncate text-[14px] font-medium text-ink hover:text-accent-ink">
                        {p.name}
                      </Link>
                      <span className={cn('shrink-0 text-[12px] font-medium', risk ? 'text-orange-ink' : gap >= 0 ? 'text-green-ink' : 'text-ink-2')}>
                        {gap === 0 ? 'Al día' : gap > 0 ? `${gap} pts adelantado` : `${Math.abs(gap)} pts detrás`}
                      </span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-fill-2">
                      <motion.div
                        className={cn('h-full origin-left rounded-full', risk ? 'bg-orange' : 'bg-accent')}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: p.progress / 100 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: easeApple }}
                      />
                      <span
                        aria-hidden
                        className="absolute -top-1 -bottom-1 w-[3px] -translate-x-1/2 rounded-full bg-ink"
                        style={{ left: `${elapsed}%` }}
                      />
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </section>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.08}>
          <section className="surface p-5 sm:p-7">
            <SectionTitle title="Reparto del trabajo" detail="Tareas asignadas por persona" />
            <Stagger as="ul" className="mt-5 space-y-4">
              {workload.map((w) => (
                <StaggerItem as="li" key={w.user.id} className="flex items-center gap-3">
                  <Avatar src={w.user.avatar} name={w.user.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13px] font-medium text-ink">{w.user.name}</span>
                      <span className="tabular shrink-0 text-[12px] text-ink-2">
                        {w.done}/{w.total}
                      </span>
                    </div>
                    <div style={{ width: `${(w.total / maxLoad) * 100}%` }}>
                      <SegmentedBar
                        height={8}
                        segments={[
                          { value: w.done, tone: 'green', label: 'Cerradas' },
                          { value: w.total - w.done - w.late, tone: 'blue', label: 'Abiertas' },
                          { value: w.late, tone: 'red', label: 'Vencidas' },
                        ]}
                      />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
